const readline = require('readline');
const https = require('https');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Preset currencies with their symbols
const presetCurrencies = {
    1: { code: 'USD', symbol: '$', name: 'US Dollar' },
    2: { code: 'EUR', symbol: '€', name: 'Euro' },
    3: { code: 'GBP', symbol: '£', name: 'British Pound' },
    4: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    5: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    6: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    7: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    8: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    9: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    10: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    11: { code: 'CUSTOM', symbol: '', name: 'Custom Currency' }
};

class CurrencyConverter {
    constructor() {
        this.rates = null;
        this.fromCurrency = '';
        this.toCurrency = '';
        this.amount = 0;
        this.API_KEY = 'fxr_live_0a957a07772646840c2f6e1a0a6e6f4fa17d';
    }

    async fetchRates() {
        try {
            const response = await fetch('https://api.fxratesapi.com/latest', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }

            const data = await response.json();
            this.rates = data.rates;
            return this.rates;
        } catch (error) {
            throw new Error(`Error fetching rates: ${error.message}`);
        }
    }

    getSymbol(currency) {
        for (const preset of Object.values(presetCurrencies)) {
            if (preset.code === currency) return preset.symbol;
        }
        return currency;
    }

    convert(amount, fromCurrency, toCurrency) {
        if (!this.rates) return null;
        
        const amountInUSD = fromCurrency === 'USD' ? 
            amount : amount / this.rates[fromCurrency];
            
        const convertedAmount = toCurrency === 'USD' ? 
            amountInUSD : amountInUSD * this.rates[toCurrency];
            
        return convertedAmount;
    }

    displayCurrencyMenu() {
        console.log('\nAvailable Currencies:');
        Object.entries(presetCurrencies).forEach(([key, currency]) => {
            console.log(`${key}. ${currency.name} (${currency.code})`);
        });
    }

    async getCurrencySelection(prompt) {
        return new Promise((resolve) => {
            this.displayCurrencyMenu();
            rl.question(prompt, async (answer) => {
                const selection = parseInt(answer);
                if (selection >= 1 && selection <= 11) {
                    if (selection === 11) {
                        // Handle custom currency input
                        rl.question('\nEnter custom currency code (e.g., SEK): ', (customCurrency) => {
                            const upperCurrency = customCurrency.toUpperCase();
                            if (this.isValidCurrency(upperCurrency)) {
                                resolve(upperCurrency);
                            } else {
                                console.log('\nInvalid currency code! Please try again.');
                                this.getCurrencySelection(prompt).then(resolve);
                            }
                        });
                    } else {
                        resolve(presetCurrencies[selection].code);
                    }
                } else {
                    console.log('\nInvalid selection! Please try again.');
                    this.getCurrencySelection(prompt).then(resolve);
                }
            });
        });
    }

    isValidCurrency(currency) {
        return currency in this.rates || currency === 'USD';
    }

    async start() {
        try {
            console.log('Fetching latest exchange rates...');
            await this.fetchRates();
            console.log('Exchange rates updated successfully!\n');
            this.showMainMenu();
        } catch (error) {
            console.error('Error:', error);
            this.exit();
        }
    }

    showMainMenu() {
        console.log('\n=== Currency Converter ===');
        console.log('1. Start conversion');
        console.log('2. Reverse last conversion');
        console.log('3. Exit');
        
        rl.question('\nSelect an option (1-3): ', (answer) => {
            switch(answer) {
                case '1':
                    this.startConversion();
                    break;
                case '2':
                    if (this.fromCurrency && this.toCurrency) {
                        [this.fromCurrency, this.toCurrency] = [this.toCurrency, this.fromCurrency];
                        console.log(`\nReversed: ${this.fromCurrency} → ${this.toCurrency}`);
                        this.getAmount();
                    } else {
                        console.log('\nNo previous conversion to reverse!');
                        this.showMainMenu();
                    }
                    break;
                case '3':
                    this.exit();
                    break;
                default:
                    console.log('\nInvalid option. Please try again.');
                    this.showMainMenu();
            }
        });
    }

    async startConversion() {
        this.fromCurrency = await this.getCurrencySelection('\nSelect the currency to convert FROM (1-11): ');
        this.toCurrency = await this.getCurrencySelection('\nSelect the currency to convert TO (1-11): ');
        this.getAmount();
    }

    getAmount() {
        rl.question(`\nEnter amount in ${this.fromCurrency}: `, (amount) => {
            const numAmount = parseFloat(amount);
            if (!isNaN(numAmount) && numAmount > 0) {
                this.amount = numAmount;
                this.performConversion();
            } else {
                console.log('\nPlease enter a valid positive number!');
                this.getAmount();
            }
        });
    }

    performConversion() {
        const result = this.convert(this.amount, this.fromCurrency, this.toCurrency);
        if (result !== null) {
            console.log('\nResult:');
            console.log(`${this.getSymbol(this.fromCurrency)}${this.amount.toFixed(2)} ${this.fromCurrency} = ${this.getSymbol(this.toCurrency)}${result.toFixed(2)} ${this.toCurrency}`);
        } else {
            console.log('\nError performing conversion!');
        }
        this.showMainMenu();
    }

    exit() {
        console.log('\nThank you for using Currency Converter!');
        rl.close();
        process.exit(0);
    }
}

const converter = new CurrencyConverter();
converter.start();
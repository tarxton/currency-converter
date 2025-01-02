const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const HISTORY_FILE = 'conversion_history.json';

const presetCurrencies = {
    1: { code: 'BAM', symbol: 'BAM', name: 'Bosnian Mark' },
    2: { code: 'USD', symbol: '$', name: 'US Dollar' },
    3: { code: 'EUR', symbol: '€', name: 'Euro' },
    4: { code: 'GBP', symbol: '£', name: 'British Pound' },
    5: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    6: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    7: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    8: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    9: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    10: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    11: { code: 'CUSTOM', symbol: '', name: 'Custom Currency' }
};

class CurrencyConverter {
    /* Normally I would add the API key to .env file or to Git Secrets but to not complicate to much with this I will leave it 
    in constructor since api is free up to 1k requests/month */
    constructor() {
        this.rates = null;
        this.fromCurrency = '';
        this.toCurrency = '';
        this.amount = 0;
        this.API_KEY = 'fxr_live_0a957a07772646840c2f6e1a0a6e6f4fa17d';
        this.history = this.loadHistory();
    }

    loadHistory() {
        try {
            if (fs.existsSync(HISTORY_FILE)) {
                const data = fs.readFileSync(HISTORY_FILE, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading history:', error.message);
        }
        return [];
    }

    saveHistory(conversion) {
        try {
            this.history.push(conversion);
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(this.history, null, 2));
        } catch (error) {
            console.error('Error saving history:', error.message);
        }
    }

    formatDate(date) {
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    displayHistory() {
        if (this.history.length === 0) {
            console.log('\nNo conversion history available.');
            return;
        }

        console.log('\n=== Conversion History ===');
        this.history.forEach((conversion, index) => {
            console.log(`\n${index + 1}. ${conversion.date}`);
            console.log(`   ${this.getSymbol(conversion.fromCurrency)}${conversion.amount.toFixed(2)} → ${this.getSymbol(conversion.toCurrency)}${conversion.result.toFixed(2)}`);
        });
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
        console.log('3. View conversion history');
        console.log('4. Exit');
        
        rl.question('\nSelect an option (1-4): ', (answer) => {
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
                    this.displayHistory();
                    this.showMainMenu();
                    break;
                case '4':
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
            console.log(`${this.getSymbol(this.fromCurrency)}${this.amount.toFixed(2)} = ${this.getSymbol(this.toCurrency)}${result.toFixed(2)}`);
            
            const conversion = {
                date: this.formatDate(new Date()),
                fromCurrency: this.fromCurrency,
                toCurrency: this.toCurrency,
                amount: this.amount,
                result: result
            };
            this.saveHistory(conversion);
        } else {
            console.log('\nError performing conversion!');
        }
        this.showMainMenu();
    }

    exit() {
        console.log('\nThank you for trusting us!');
        rl.close();
        process.exit(0);
    }
}

const converter = new CurrencyConverter();
converter.start();
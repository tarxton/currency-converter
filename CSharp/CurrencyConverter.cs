using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace CurrencyConverterApp
{
    class CurrencyConverter
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("Currency Converter");

            Console.Write("Enter base currency (e.g., USD): ");
            string baseCurrency = Console.ReadLine().ToUpper();

            Console.Write("Enter target currency (e.g., EUR): ");
            string targetCurrency = Console.ReadLine().ToUpper();

            Console.Write("Enter amount: ");
            if (!double.TryParse(Console.ReadLine(), out double amount))
            {
                Console.WriteLine("Invalid amount. Please enter a numeric value.");
                return;
            }

            try
            {
                double convertedAmount = await ConvertCurrency(baseCurrency, targetCurrency, amount);
                Console.WriteLine($"{amount} {baseCurrency} = {convertedAmount:F2} {targetCurrency}");
                Console.WriteLine("Would you like to reverse the conversion? (y/n)");
                string reverse = Console.ReadLine().ToLower();
                if (reverse == "y") {
                    convertedAmount = await ConvertCurrency(targetCurrency, baseCurrency, amount);
                    Console.WriteLine($"{amount} {targetCurrency} = {convertedAmount:F2} {baseCurrency}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
        }

        static async Task<double> ConvertCurrency(string baseCurrency, string targetCurrency, double amount)
        {
            string apiKey = "fxr_live_43a3c877ea7587d0f2c2593af3df2867736a";
            string apiUrl = $"https://api.fxratesapi.com/latest?apikey={apiKey}&base={baseCurrency}&symbols={targetCurrency}";

            using HttpClient client = new HttpClient();
            HttpResponseMessage response = await client.GetAsync(apiUrl);

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Failed to retrieve data from the API.");
            }

            string jsonResponse = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<ExchangeRateResponse>(jsonResponse, new JsonSerializerOptions 
            {
                PropertyNameCaseInsensitive = true
            });

            if (data != null && data.Rates.TryGetValue(targetCurrency, out double rate))
            {
                return amount * rate;
            }
            else
            {
                throw new Exception("Target currency not found in the API response.");
            }
        }
    }

    public class ExchangeRateResponse
    {
        public bool Success { get; set; }
        public string Terms { get; set; }
        public string Privacy { get; set; }
        public long Timestamp { get; set; }
        public DateTime Date { get; set; }
        public string Base { get; set; }
        public Dictionary<string, double> Rates { get; set; }
    }
}
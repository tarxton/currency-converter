import urllib.request
import json

API_URL = "https://api.fxratesapi.com/latest?api_key=fxr_live_ba7a79734cfdde9921de59c64463466d3070"

def fetch_exchange_rates():
    try:
        with urllib.request.urlopen(API_URL) as response:
            data = response.read()
            exchange_rates = json.loads(data)
            if exchange_rates.get("success"):
                return exchange_rates
            else:
                print("Error fetching data.")  #exchange_rates.get("error", "Unknown error")
                return None
    except Exception as e:
        print("An error occurred:", e)
        return None

def convert_currency(rates, myBase, target, amount):
    if myBase not in rates and myBase != "USD":
        print(f"Currency {myBase} not found.")
        return None     #so to not go to next if
    if target not in rates:
        print(f"Currency {target} not found.")
        return None

    if myBase != "USD":
        amount_in_usd = amount / rates[myBase]
    else:
        amount_in_usd = amount

    converted_amount = amount_in_usd * rates[target]
    return converted_amount

def main():
    data = fetch_exchange_rates()
    if not data:
        return

    rates = data.get("rates", {})
    base_currency = data.get("base", "USD")
    rates[base_currency] = 1  # Ensure the base currency itself is in the rates list

    print(f"Exchange rates base currency: {base_currency}")
    print("Available currencies:", ", ".join(rates.keys()))

    while True:
        print("\nCurrency Converter")
        from_currency = input("Enter the source currency (e.g., USD): ").upper()
        if from_currency not in rates and from_currency != base_currency:
            print(f"{from_currency} is not available.")
            continue

        to_currency = input("Enter the target currency (e.g., EUR): ").upper()
        if to_currency not in rates:
            print(f"{to_currency} is not available.")
            continue

        try:
            amount = float(input("Enter the amount to convert: "))
        except ValueError:
            print("Invalid amount. Please enter a numeric value.")
            continue

        result = convert_currency(rates, from_currency, to_currency, amount)
        if result is not None:
            print(f"{amount} {from_currency} is approximately {result:.3f} {to_currency}")

        reverse = input("Would you like to reverse the conversion? (yes/no): ").strip().lower()
        if reverse == "yes":
            reverse_result = convert_currency(rates, to_currency, from_currency, amount)
            if reverse_result is not None:
                print(f"{amount} {to_currency} is equivalent to {reverse_result:.2f} {from_currency}\n")
        
        again = input("Do you want to convert again, with other currencies? (yes/no): ").lower()
        if again != "yes":
            break

if __name__ == "__main__":
    main()

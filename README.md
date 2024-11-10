# Currency Converter
A console application that converts between different currencies (e.g. dollar, euro). Primary focus is to provide an optimized way to convert real-time updated currency values which will not be complicated and easy to understand for any user without previous experience with the application. 

Languages used: C#, Python, JavaScript

# How to run

## C#

To run the application in C# you should follow next steps:
- Have installed the .NET SDK on the device (Windows/Mac OS/Linux)
  You can find guideance and download link for it on the [Link](https://dotnet.microsoft.com/en-us/download)
- Verify installation in the terminal (`dotnet --version`)
- Navigate to the root folder of C# project and run the console application (`dotnet run`)

## JS 

To run the application in JavaScript you should follow next steps:
- Have installed the Node on the device (Windows/Mac OS/Linux) - Necessary to run JS code for server-side
  You can find guideance and download link for it on the [Link](https://nodejs.org/en)
- Verify installation in the terminal (`node --version`)
- Navigate to the root folder of JS project and run the console application file (`node currency-converter.js`)

## Python 

To run the application in Python you should follow next steps:
- Have installed the Python 3 on the device (Windows/Mac OS/Linux) - Necessary to run Python code
  You can find guideance and download link for it on the [Link](https://www.python.org/downloads/)
- Verify installation in the terminal (`(python or python3) --version`)
- Navigate to the root folder of Python project and run the console application file (`python currency-converter.py`)

# Features of the application 

## Currency conversion

The main purpose of the application is to enable user easy navigation throughout the application and the ability to convert currencies that he wants.
It will utilize the API to pull in real-time currency information and any change in the market 
API docs: > https://fxratesapi.com/docs

## Easy to understand process

At the beggining the user is asked to enter the currency from which he is converting to the one that he wants. After entering the currencies he will be prompted to enter the amount that he wants to convert and upon entering the amount he will recieve the converted amount with all symbols representing the currency that he used. (e.g., $ for USD, € for EUR)

## Ability to quit in the middle of the conversion

The application is made in a way so that the user can freely stop the conversion process whenever he wants, so he can adjust the currencies or the amount however he wants, even if he made a mistake. 

## Enable reverse converting

It provides a reverse conversion option to switch between the "from" and "to" currencies without re-entering values so the user is able to continue with conversion quicker and easier if he wants to continue and convert another amount of money. 

Made for CS305 - Programming Languages (Fall 2024)

## International University of Sarajevo

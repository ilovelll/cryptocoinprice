# CryptoCoinPrice README

Another one extention for visual studio code to show the value of cryptocurrency like Bitcoin, Ethereum, Litecoin, XMR etc.
This extention can be found at [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ilovelll.cryptocoinprice).
## Features

This extention use WebSocket API by [cryptocompare.com](https://www.cryptocompare.com/api/#introduction). All supported coins can be found in [cryptocompare.com](https://www.cryptocompare.com/api/#introduction).
You can use below settings to add you favourite cryptocurrency:
```json
"cryptocoinprice.coinSymbols": [
    "BTC",
    "ETH"
    ],
```
It supports color to show price up and price down.
![screenshot](https://raw.githubusercontent.com/ilovelll/cryptocoinprice/master/assets/screenshot.png)

## Extension Settings

This extension contributes the following settings:

* `cryptocoinprice.coinSymbols`: The list of Crypto coin symbols that we want to display, the default value`["BTC", "ETH"]`.
* `cryptocoinprice.toSymbol`: The currency to use for crypto coin prices, the default value is `USD`.
* `cryptocoinprice.userColor`: If true, highlights items red when they're down and green when they're up, the default value is `true`.


## Release Notes


### 0.0.1

Initial repository

### 0.1.0

Update Visual Studio Code Marketplace Address
Update publisher

### 0.2.0

Fixed issue [Horizontal text movement from price adjustments is distracting](https://github.com/ilovelll/cryptocoinprice/issues/1).
Thanks [nt85](https://github.com/nt85) for making the PR to enhance the format of StatusBarItem.

### 0.2.1

Update dependencies and split business code into files.

### 0.2.2

Fixed issues with currency and coinSymbols #4
Thanks [calculi](https://github.com/calculi) for making the PR.
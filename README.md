# CryptoCoinPrice README

Another one extention for visual studio code to show the value of cryptocurrency you looking for.

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

'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as io from 'socket.io-client';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
const UP_COLOR = 'lightgreen';
const DOWN_COLOR = 'pink';
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    let priceTag = new PriceTag()
    priceTag.refreshPrice()
    // setInterval(refresh, 60*1e3)
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration( _ => {
        priceTag.cleanUp();
        priceTag = null;
        priceTag = new PriceTag();
        priceTag.refreshPrice();
    }));
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
}

class PriceTag {
    private _sub: Array<string>;
    private _items: Map<string, vscode.StatusBarItem>;
    private _subCurr: Array<object>;
    private _useColor:boolean;
    private _toSymbol: string;
    private _socket = io('https://streamer.cryptocompare.com/');

    constructor(){
        const config = vscode.workspace.getConfiguration();
        const configuredSymbols = config.get('cryptocoinprice.coinSymbols', []).map(symbol => symbol.toUpperCase());
        this._sub = configuredSymbols;
        this._subCurr = this._sub.map((coin, index) => {
            return {SYMBOL: coin, OPEN24HOUR: 0}
        });
        this._useColor = config.get('cryptocoinprice.userColor', true);
        this._toSymbol = config.get('cryptocoinprice.toSymbol', 'USD').toUpperCase();
    }
    public cleanUp() {
        this._socket.emit('SubRemove', { subs: this._sub.map(coin => `5~CCCAGG~${coin}~${this._toSymbol}`) });
        this._socket.close();
        this._items.forEach(item => {
            item.hide()
            item.dispose()
        })
    
        this._items = null;
    }
    public refreshPrice () {
        const that = this;
        const config = vscode.workspace.getConfiguration();
        const configuredSymbols = config.get('vscode-stocks.stockSymbols', []);
        if (!this._items || this._items.size == 0 || this._items.size !== this._sub.length * 3) {
            this._items = null;
            this._items = new Map<string, vscode.StatusBarItem>();
            this._sub.forEach((element, index) => {
                let symbolText = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3*(this._sub.length - index));
                this._items.set(`${element}-SYMBOL`, symbolText);
                let priceText = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3*(this._sub.length - index) - 1);
                this._items.set(`${element}-PRICE`, priceText);
                let changeText = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3*(this._sub.length - index) - 2);
                this._items.set(`${element}-CHANGE`, changeText);
            });
        }
        this._socket.emit('SubAdd', { subs: this._sub.map(coin => `5~CCCAGG~${coin}~${this._toSymbol}`) });
        this._socket.on("m", message => {
            var messageType = message.substring(0, message.indexOf("~"));
            var res = {};
            if (messageType == CCC.STATIC.TYPE.CURRENTAGG) {
                res = CCC.CURRENT.unpack(message);
                this._subCurr.forEach(coin => {
                    if(coin['SYMBOL'] === res['FROMSYMBOL']) {
                        coin = Object.assign(coin, res);
                        this.showStatuxText(coin);
                    }
                });
            }
        });
    }

    private showStatuxText (coin) {
        let symbolStatusText:vscode.StatusBarItem = this._items.get(`${coin.SYMBOL}-SYMBOL`);
        let priceStatusText:vscode.StatusBarItem = this._items.get(`${coin.SYMBOL}-PRICE`);
        let changeStatusText:vscode.StatusBarItem = this._items.get(`${coin.SYMBOL}-CHANGE`);

        symbolStatusText.text = coin.SYMBOL;
        symbolStatusText.show();

        let TOSYMBOL = CCC.STATIC.CURRENCY.getSymbol(coin.TOSYMBOL);
        priceStatusText.text = `${TOSYMBOL}${coin.PRICE}`;
        if (this._useColor && coin.FLAGS & 1) {
            priceStatusText.color = UP_COLOR;
        } else if (this._useColor && coin.FLAGS & 2) {
            priceStatusText.color = DOWN_COLOR;
        }
        priceStatusText.show();

        let change = ((coin.PRICE - coin.OPEN24HOUR) / coin.OPEN24HOUR * 100).toFixed(2) + '%';
        if (this._useColor && coin.PRICE - coin.OPEN24HOUR > 0) {
            change = `+${change}`;
            changeStatusText.color = UP_COLOR;
        } else if (this._useColor){
            changeStatusText.color = DOWN_COLOR;
        }
        changeStatusText.text = change;
        changeStatusText.show();
    }
}
// this method is called when your extension is deactivated
export function deactivate() {
}

// This code below was copy from cryptocompare.com websocket API demo, aims to serialize the websocket response.
var CCC = CCC || {};

CCC.STATIC=CCC.STATIC || {};
CCC.STATIC.TYPE={
    'TRADE'                  : '0'
  , 'FEEDNEWS'               : '1'
  , 'CURRENT'                : '2'
  , 'LOADCOMPLATE'           : '3'
  , 'COINPAIRS'              : '4'
  , 'CURRENTAGG'             : '5'
  , 'TOPLIST'                : '6'
  , 'TOPLISTCHANGE'          : '7'
  , 'ORDERBOOK'              : '8'
  , 'FULLORDERBOOK'          : '9'
  , 'ACTIVATION'             : '10'

  , 'TRADECATCHUP'           : '100'
  , 'NEWSCATCHUP'            : '101'
  
  , 'TRADECATCHUPCOMPLETE'   : '300'
  , 'NEWSCATCHUPCOMPLETE'    : '301'
  
};
CCC.STATIC.CURRENCY = CCC.STATIC.CURRENCY || {};
CCC.STATIC.CURRENCY.SYMBOL = {
	'BTC'  : 'Ƀ'
  , 'LTC'  : 'Ł'
  , 'DAO'  : 'Ð'
  , 'USD'  : '$'
  , 'CNY'  : '¥'
  , 'EUR'  : '€'
  , 'GBP'  : '£'
  , 'JPY'  : '¥'
  , 'PLN'  : 'zł'
  , 'RUB'  : '₽'
  , 'ETH'  : 'Ξ'
  , 'GOLD' : 'Gold g'
  , 'INR'  : '₹'
  , 'BRL'  : 'R$'
};

CCC.STATIC.CURRENCY.getSymbol = function(symbol){
	return CCC.STATIC.CURRENCY.SYMBOL[symbol] || symbol;
};

CCC.CURRENT=CCC.CURRENT || {};
CCC.CURRENT.FLAGS = {
    'PRICEUP'        : 0x1    // hex for binary 1
  , 'PRICEDOWN'      : 0x2    // hex for binary 10
  , 'PRICEUNCHANGED' : 0x4    // hex for binary 100
  , 'BIDUP'          : 0x8    // hex for binary 1000
  , 'BIDDOWN'        : 0x10   // hex for binary 10000
  , 'BIDUNCHANGED'   : 0x20   // hex for binary 100000
  , 'OFFERUP'        : 0x40   // hex for binary 1000000
  , 'OFFERDOWN'      : 0x80   // hex for binary 10000000
  , 'OFFERUNCHANGED' : 0x100  // hex for binary 100000000
  , 'AVGUP'          : 0x200  // hex for binary 1000000000
  , 'AVGDOWN'        : 0x400  // hex for binary 10000000000
  , 'AVGUNCHANGED'   : 0x800  // hex for binary 100000000000
};


CCC.CURRENT.FIELDS={
    'TYPE'            : 0x0       // hex for binary 0, it is a special case of fields that are always there
  , 'MARKET'          : 0x0       // hex for binary 0, it is a special case of fields that are always there
  , 'FROMSYMBOL'      : 0x0       // hex for binary 0, it is a special case of fields that are always there
  , 'TOSYMBOL'        : 0x0       // hex for binary 0, it is a special case of fields that are always there
  , 'FLAGS'           : 0x0       // hex for binary 0, it is a special case of fields that are always there
  , 'PRICE'           : 0x1       // hex for binary 1
  , 'BID'             : 0x2       // hex for binary 10
  , 'OFFER'           : 0x4       // hex for binary 100
  , 'LASTUPDATE'      : 0x8       // hex for binary 1000
  , 'AVG'             : 0x10      // hex for binary 10000
  , 'LASTVOLUME'      : 0x20      // hex for binary 100000
  , 'LASTVOLUMETO'    : 0x40      // hex for binary 1000000
  , 'LASTTRADEID'     : 0x80      // hex for binary 10000000
  , 'VOLUMEHOUR'      : 0x100     // hex for binary 100000000
  , 'VOLUMEHOURTO'    : 0x200     // hex for binary 1000000000
  , 'VOLUME24HOUR'    : 0x400     // hex for binary 10000000000
  , 'VOLUME24HOURTO'  : 0x800     // hex for binary 100000000000
  , 'OPENHOUR'        : 0x1000    // hex for binary 1000000000000
  , 'HIGHHOUR'        : 0x2000    // hex for binary 10000000000000
  , 'LOWHOUR'         : 0x4000    // hex for binary 100000000000000
  , 'OPEN24HOUR'      : 0x8000    // hex for binary 1000000000000000
  , 'HIGH24HOUR'      : 0x10000   // hex for binary 10000000000000000
  , 'LOW24HOUR'       : 0x20000   // hex for binary 100000000000000000
  , 'LASTMARKET'      : 0x40000   // hex for binary 1000000000000000000, this is a special case and will only appear on CCCAGG messages
};
CCC.CURRENT.unpack = function(value)
{
    var valuesArray = value.split("~");
    var valuesArrayLenght = valuesArray.length;
    var mask = valuesArray[valuesArrayLenght-1];
    var maskInt = parseInt(mask,16);
    var unpackedCurrent = {};
    var currentField = 0;
    for(var property in this.FIELDS)
    {
        if(this.FIELDS[property] === 0)
        {
            unpackedCurrent[property] = valuesArray[currentField];
            currentField++;
        }
        else if(maskInt&this.FIELDS[property])
        {
			//i know this is a hack, for cccagg, future code please don't hate me:(, i did this to avoid
			//subscribing to trades as well in order to show the last market
         	if(property === 'LASTMARKET'){
                unpackedCurrent[property] = valuesArray[currentField];
            }else{
                 unpackedCurrent[property] = parseFloat(valuesArray[currentField]);
            }
            currentField++;
        }
    }
    
    return unpackedCurrent;
};
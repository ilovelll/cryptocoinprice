import * as vscode from 'vscode';
import * as io from 'socket.io-client';
import { CCC } from './ccc-streamer-utilities';
const UP_COLOR = 'lightgreen';
const DOWN_COLOR = 'pink';

type ISubCurr = {
  SYMBOL: string;
  OPEN24HOUR: number;
};
export class PriceTag {
  private _sub: Array<string>;
  private _items: Map<string, vscode.StatusBarItem>;
  private _subCurr: Array<ISubCurr>;
  private _useColor: boolean;
  private _toSymbol: string;
  private _showChangePct: boolean;
  private _pricePrecision: number;
  private _changePctPrecision: number;
  private _socket = io('https://streamer.cryptocompare.com/');

  constructor() {
    const config = vscode.workspace.getConfiguration('hellocoin');
    const configuredSymbols = config.get<string[]>('hellocoin.coinSymbols', ["BTC", "ETH"]).map(symbol => symbol.toUpperCase());
    this._sub = configuredSymbols;
    this._subCurr = this._sub.map((coin, index) => {
      return { SYMBOL: coin, OPEN24HOUR: 0 };
    });

    this._items = new Map<string, vscode.StatusBarItem>();
    this._sub.forEach((element, index) => {
      let symbolText = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3 * (this._sub.length - index));
      this._items.set(`${element}-SYMBOL`, symbolText);
      let priceText = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3 * (this._sub.length - index) - 1);
      this._items.set(`${element}-PRICE`, priceText);
      let changeText = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3 * (this._sub.length - index) - 2);
      this._items.set(`${element}-CHANGE`, changeText);
    });

    this._useColor = config.get('cryptocoinprice.userColor', true);
    this._toSymbol = config.get('cryptocoinprice.toSymbol', 'USD').toUpperCase();
    this._showChangePct = config.get('cryptocoinprice.showChangePct', true);
    this._pricePrecision = config.get('cryptocoinprice.pricePrecision', 2);
    this._changePctPrecision = config.get('cryptocoinprice.changePctPrecision', 2);
  }
  public cleanUp() {
    this._socket.emit('SubRemove', { subs: this._sub.map(coin => `5~CCCAGG~${coin}~${this._toSymbol}`) });
    this._socket.close();
    this._items.forEach(item => {
      item.hide();
      item.dispose();
    });

    // this._items = null;
  }
  
  public refreshPrice() {
    const that = this;
    // const config = vscode.workspace.getConfiguration();
    // const configuredSymbols = config.get('vscode-stocks.stockSymbols', []);
    // if (!that._items || that._items.size === 0 || that._items.size !== that._sub.length * 3) {
    //   that._items = new Map<string, vscode.StatusBarItem>();
    //   that._sub.forEach((element, index) => {
    //     let symbolText = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3 * (that._sub.length - index));
    //     that._items.set(`${element}-SYMBOL`, symbolText);
    //     let priceText = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3 * (that._sub.length - index) - 1);
    //     that._items.set(`${element}-PRICE`, priceText);
    //     let changeText = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3 * (that._sub.length - index) - 2);
    //     that._items.set(`${element}-CHANGE`, changeText);
    //   });
    // }
    that._socket.emit('SubAdd', { subs: that._sub.map(coin => `5~CCCAGG~${coin}~${that._toSymbol}`) });
    that._socket.on("m", (message:string) => {
      console.log('get message: ', message);
      var messageType = message.substring(0, message.indexOf("~"));
      var res:any = {};
      if (messageType === CCC.STATIC.TYPE.CURRENTAGG) {
        res = CCC.CURRENT.unpack(message);
        this._subCurr.forEach(coin => {
          if (coin['SYMBOL'] === res['FROMSYMBOL']) {
            coin = Object.assign(coin, res);
            this.showStatuxText(coin);
          }
        });
      }
    });
  }

  private showStatuxText(coin: any) {
    let symbolStatusText= this._items.get(`${coin.SYMBOL}-SYMBOL`);
    let priceStatusText = this._items.get(`${coin.SYMBOL}-PRICE`);
    let changeStatusText = this._items.get(`${coin.SYMBOL}-CHANGE`);

    if(symbolStatusText && priceStatusText && changeStatusText) {
      symbolStatusText.text = coin.SYMBOL;
      symbolStatusText.show();
  
      let TOSYMBOL = CCC.STATIC.CURRENCY.getSymbol(coin.TOSYMBOL);
      priceStatusText.text = `${TOSYMBOL}` + Number(`${coin.PRICE}`).toFixed(this._pricePrecision);
      if (this._useColor && coin.FLAGS & 1) {
        priceStatusText.color = UP_COLOR;
      } else if (this._useColor && coin.FLAGS & 2) {
        priceStatusText.color = DOWN_COLOR;
      }
      priceStatusText.show();
  
      let change = ((coin.PRICE - coin.OPEN24HOUR) / coin.OPEN24HOUR * 100).toFixed(this._changePctPrecision) + '%';
      if (this._useColor && coin.PRICE - coin.OPEN24HOUR > 0) {
        change = `+${change}`;
        changeStatusText.color = UP_COLOR;
      } else if (this._useColor) {
        changeStatusText.color = DOWN_COLOR;
      }
      changeStatusText.text = change;
      if (this._showChangePct) {
        changeStatusText.show();
      }
    }
  }
}
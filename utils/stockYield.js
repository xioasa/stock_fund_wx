// 票收益持仓等计算类

const request = require('./request.js');
const util = require('./util');

class Stock {
  static init(argus = {}) {
    return new Stock(argus);
  }

  // 获取数据
  getData() {
    return new Promise((resolve) => {
      const stockItemList = wx.getStorageSync('stockItemList') || [];
      const that = this;
      if (stockItemList.length > 0) {
        const stocks = stockItemList.map(
          (item) => `${item.market}.${item.code}`
        ).join(',');
        const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f2,f3,f4,f12,f14&secids=${stocks}`;
        request({
          url,
          success: (responses) => {
            (responses.data.data.diff || []).forEach((item, index) => {
              const itemList = stockItemList[index];
              itemList.price = item.f2;
              itemList.zdf = item.f3;
              itemList.zdf_price = item.f4;
              stockItemList[index] = itemList;
            });
            const data = that.getAllGains(stockItemList);
            resolve(data);
          }
        })
      } else {
        const data = that.getAllGains([]);
        resolve(data);
      }
    });
  }

  // 计算总收益
  getAllGains(stockItemList) {
    // 今日总收益金额
    let todayAllGains = 0;
    // 今日总收益率
    let todayAllYield = 0;
    // 总收益
    let allGains = 0;
    // 持仓
    let allPosition = 0;
    // 总收益率
    let allYield = 0;

    stockItemList.forEach((val) => {
      todayAllGains += parseFloat(this.calculateTotalProfit(val));
      allGains += parseFloat(this.calculateAllAmount(val));
      allPosition += parseFloat(this.calculateAmount(val));
    });

    todayAllGains = todayAllGains.toFixed(2);
    allGains = allGains.toFixed(2);

    if ((+allPosition) !== 0) {
      // 今日总收益率 = 今日收益金额 / （ 持仓金额 - 今日收益金额 ）
      todayAllYield = ((todayAllGains / (allPosition - todayAllGains)) * 100).toFixed(2);
      // 总收益率 = 总收益金额 / （ 持仓金额 - 总收益金额 ）
      allYield = ((allGains / (allPosition - allGains)) * 100).toFixed(2);
    }

    return {
      todayAllGains,
      allGains,
      allPosition: allPosition.toFixed(2),
      todayAllYield,
      allYield
    }
  }

  // 当天收益金额
  calculateTotalProfit(item) {
    const { num = 0, price, zdf, isTodybuy } = item;
    if (isTodybuy === util.getTime()) {
      return ((item.price - item.initPrice) * num).toFixed(2);
    } else {
      return (item.zdf_price * num).toFixed(2);
    }
  }

  // 总收益 当前持仓金额 - 成本价持仓金额
  calculateAllAmount(item) {
    const { num = 0, price, initPrice = 0 } = item;
    if (typeof (+initPrice) === "number" && typeof (+num) === "number") {
      return (num * (price - initPrice)).toFixed(2);
    }
    return 0;
  }

  // 持仓金额
  calculateAmount(item) {
    const { num = 0, price = 0 } = item;
    if (typeof (+num) === "number") {
      return (num * price).toFixed(2);
    }
    return 0;
  }

}



module.exports = Stock;

// 股票收益持仓等计算类

const request = require('./request.js');
const util = require('./util');

class Fund {
  static init(argus = {}) {
    return new Fund(argus);
  }

  // 获取数据
  getData() {
    // 	  ["fundcode"]=>"519983"           //基金代码
    // 	  ["name"]=>"长信量化先锋混合A"    //基金名称
    // 	  ["jzrq"]=>"2018-09-21"           //净值日期
    // 	  ["dwjz"]=>"1.2440"               //当日净值
    // 	  ["gsz"]=>"1.2388"                //估算净值
    // 	  ["gszzl"]=>"-0.42"               //估算涨跌百分比 即-0.42%
    // 	  ["gztime"]=>"2018-09-25 15:00"   //估值时间
    return new Promise((resolve) => {

      const fundListM = wx.getStorageSync('fundListM') || [];
      const strFundlist = fundListM.map((val) => val.code).join(",");

      const url =
        "https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=50&plat=Android&appType=ttjj&product=EFund&Version=1&deviceid=" +
        this.device_id +
        "&Fcodes=" +
        strFundlist;

      const that = this;

      request({
        url,
        success: (responses) => {
          const dataList = [];
          (responses.data.Datas || []).forEach((res_) => {
            const res = {
              fundcode: res_.FCODE,
              name: res_.SHORTNAME,
              jzrq: res_.PDATE,
              dwjz: isNaN(res_.NAV) ? null : res_.NAV,
              gsz: isNaN(res_.GSZ) ? null : res_.GSZ,
              gszzl: isNaN(res_.GSZZL) ? 0 : res_.GSZZL,
              gztime: res_.GZTIME,
            };
            let data = res;
            // 判断是否更新收益
            if (res_.PDATE != "--" && res_.PDATE === res_.GZTIME.substr(0, 10)) {
              data.gsz = res_.NAV;
              data.gszzl = isNaN(res_.NAVCHGRT) ? 0 : res_.NAVCHGRT;
              data.isUpdate = true;
            }
            // QDII 或者是 封闭基金 
            if (res_.GZTIME === '--' && res_.GSZ === '--') {
              data.gsz = res_.NAV;
              data.gszzl = isNaN(res_.NAVCHGRT) ? 0 : res_.NAVCHGRT;
            }
            let slt = fundListM.find((item) => item.code == data.fundcode);
            data.num = slt.num;
            if (slt.cost) {
              data.cost = slt.cost;
              // 总收益率
              const total_yield = +(
                ((data.gsz - data.cost) / data.cost) *
                100
              ).toFixed(2);
              // 当没有输入持仓价格时会显示NaN
              if (!isNaN(total_yield)) {
                data.total_yield = total_yield;
              }
            }
            dataList.push(data);
          });
          const data = this.getAllGains(dataList);
          resolve(data);
        }
      })
    })
  }

  // 计算总收益
  getAllGains(dataList) {
    // 今日总收益金额
    let todayAllGains = 0;
    // 总收益
    let allGains = 0;
    // 持仓
    let allPosition = 0;
    let todayAllYield = 0;
    let allYield = 0;

    dataList.forEach((val) => {
      todayAllGains += parseFloat(this.calcOneFundSy(val));
      allGains += parseFloat(this.totalYieldMoney(val));
      allPosition += parseFloat(this.calculateMoney(val));
    });
    todayAllGains = todayAllGains.toFixed(2);

    allGains = allGains.toFixed(2);

    if (allPosition !== 0) {
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

  /**
 * 计算单个基金当日收益金额
 * @param {*} data 
 */
  calcOneFundSy(data = {}) {
    let sum = 0;
    const num = data.num ? data.num : 0;
    if (data.isUpdate) {
      sum = ((data.dwjz - data.dwjz / (1 + data.gszzl * 0.01)) * num).toFixed(1);
    } else {
      if (data.gsz) {
        sum = ((data.gsz - data.dwjz) * num).toFixed(1);
      }
    }
    return +sum;
  }

  // 计算当前基金持仓金额
  calculateMoney(val) {
    if (val.num) {
      let sum = (val.dwjz * val.num).toFixed(2);
      return sum;
    }
    return 0;
  }

  // 计算总收益金额
  totalYieldMoney(el) {
    const { num = 0, cost = 0, gsz } = el;
    if (num !== 0 && cost !== 0 && typeof (+num) === "number" && typeof (+cost) === "number") {
      return (num * (gsz - cost)).toFixed(2);
    }
    return 0;
  }

}



module.exports = Fund;

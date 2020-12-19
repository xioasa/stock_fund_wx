//index.js
//获取应用实例
const app = getApp();
const request = require('../../utils/request.js');

Page({
  data: {
    inputShowed: false,
    inputVal: "",
    dataList: [],
    copyDataList: [],
    scrollTop: 0,
    sortField: '', // 排序字段
    isShowDp: false
  },
  onLoad() {
    this.setData({
      isShowDp: wx.getStorageSync('isShowDp')
    });
  },
  onShow() {
    this.getData();
  },
  onPullDownRefresh: function () {
    //调用刷新时将执行的方法
    this.onRefresh();
  },
  onRefresh() {
    //在当前页面显示导航条加载动画
    wx.showNavigationBarLoading();
    //显示 loading 提示框。需主动调用 wx.hideLoading 才能关闭提示框
    wx.showLoading({
      title: '刷新中...',
    });
    this.selectAllComponents("#dp")[0].getData();
    this.getData().finally(() => {
      wx.hideLoading();
      //隐藏导航条加载动画
      wx.hideNavigationBarLoading();
      //停止下拉刷新
      wx.stopPullDownRefresh();
    });
  },
  // 点击排序
  onSort(res) {
    const { sortField, copyDataList } = this.data;
    let { dataList } = this.data;
    const { field } = res.currentTarget.dataset;
    let targetField = '';
    if (!sortField) {
      targetField = `${field}_up`;
      dataList.sort((a, b) => a[field] - b[field]);
    } else if (sortField === `${field}_up`) {
      targetField = `${field}_down`;
      dataList.sort((a, b) => {
        return b[field] - a[field]
      });
    } else {
      targetField = '';
      dataList = JSON.parse(JSON.stringify(copyDataList));
    }
    this.setData({
      sortField: targetField,
      dataList
    });

  },
  onDetail(res) {
    const { code } = res.currentTarget.dataset;
    if (code) {
      const data = this.data.dataList.find(item => item.fundcode === code);
      if (data) {
        wx.navigateTo({
          url: `/pages/fund/add/add?type=detail&data=${JSON.stringify(data)}`
        })
      }
    }
  },
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
            data.cyje = that.calculateMoney(data);
            data.dtsy = that.calculate(data);
            data.syl = that.totalYield(data);
            data.zsy = that.totalYieldMoney(data);

            dataList.push(data);
          });
          that.setData({
            dataList: dataList,
            copyDataList: JSON.parse(JSON.stringify(dataList))
          });
          resolve(dataList);
        }
      })
    });
    // .catch((error) => {
    //   console.log("数据请求出现错误！");
    // });
  },
  // 计算当前基金持仓金额
  calculateMoney(val) {
    if (val.num) {
      let sum = (val.dwjz * val.num).toFixed(2);
      return sum;
    }
    return '';
  },
  // 计算单个收益
  calculate(data) {
    let sum = 0;
    const num = data.num;
    if (num || typeof (num) === 'number') {
      if (data.isUpdate) {
        sum = ((data.dwjz - data.dwjz / (1 + data.gszzl * 0.01)) * num).toFixed(2);
      } else {
        if (data.gsz) {
          sum = ((data.gsz - data.dwjz) * num).toFixed(2);
        }
      }
      return sum;
    }
    return '';
  },
  // 计算总收益率
  totalYield(el) {
    const { num, total_yield, cost } = el;
    if (typeof (+num) === "number" && typeof (+cost) === "number") {
      return el.total_yield;
    }
    return "";
  },
  // 计算总收益金额
  totalYieldMoney(el) {
    const { num = 0, cost = 0, gsz } = el;
    if (num !== 0 && cost !== 0 && typeof (+num) === "number" && typeof (+cost) === "number") {
      return (num * (gsz - cost)).toFixed(2);
    }
    return '';
  },
  // 自选
  add() {
    wx.navigateTo({
      url: '/pages/serch/serch?type=fund'
    })
  },
});
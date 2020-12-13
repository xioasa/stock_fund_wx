//index.js
//获取应用实例
const app = getApp();
const request = require('../../utils/request.js');
const util = require('../../utils/util');

Page({
  data: {
    inputShowed: false,
    inputVal: "",
    dataList: [],
    copyDataList: [],
    scrollTop: 0,
    sortField: '' // 排序字段
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: "股票" })
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
      const data = this.data.dataList.find(item => item.code === code);
      if (data) {
        wx.navigateTo({
          url: `/pages/stock/add/add?type=detail&data=${JSON.stringify(data)}`
        })
      }
    }
  },

  // 获取数据
  getData() {
    return new Promise((resolve) => {
      const stockItemList = wx.getStorageSync('stockItemList') || [];
      if (stockItemList.length > 0) {
        const stocks = stockItemList.map(
          (item) => `${item.market}.${item.code}`
        ).join(',');
        const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f2,f3,f4,f12,f14&secids=${stocks}`;
        const that = this;
        request({
          url,
          success: (responses) => {
            (responses.data.data.diff || []).forEach((item, index) => {
              const itemList = stockItemList[index];
              itemList.price = item.f2;
              itemList.zdf = item.f3;
              itemList.zdf_price = item.f4;
              itemList.zsyl = this.calculateAllzdf(itemList);
              itemList.zsy = this.calculateAllAmount(itemList);
              itemList.dtsy = this.calculateTotalProfit(itemList);
              itemList.ccje = this.calculateAmount(itemList);
              stockItemList[index] = itemList;
            });
            resolve(stockItemList);
            that.setData({
              dataList: stockItemList,
              copyDataList: JSON.parse(JSON.stringify(stockItemList))
            });
          }
        })
      }
    });
  },
  // 总收益率 （当前持仓金额 - 成本价持仓金额） /  成本价持仓金额
  calculateAllzdf(item) {
    const { price, initPrice } = item;
    if (initPrice && typeof (+initPrice) === "number") {
      return (((price - initPrice) / initPrice) * 100).toFixed(2);
    }
    return "";
  },

  // 总收益 当前持仓金额 - 成本价持仓金额
  calculateAllAmount(item) {
    const { num = 0, price, initPrice = 0 } = item;
    if (initPrice && typeof (+initPrice) === "number" && typeof (+num) === "number") {
      return (num * (price - initPrice)).toFixed(2);
    }
    return "";
  },

  // 当天收益金额
  calculateTotalProfit(item) {
    const { num = 0, price, zdf_price, isTodybuy, initPrice } = item;
    if (num && `${num}` !== 0) {
      if (isTodybuy === util.getTime()) {
        return ((price - initPrice) * num).toFixed(2);
      } else {
        return (zdf_price * num).toFixed(2);
      }
    }
    return '';
  },

  // 持仓金额
  calculateAmount(item) {
    const { num = 0, price = 0 } = item;
    if (num && typeof (+num) === "number") {
      return (num * price).toFixed(2);
    }
    return "";
  },

  // 自选
  add() {
    wx.navigateTo({
      url: '/pages/serch/serch?type=stock'
    })
  },
});
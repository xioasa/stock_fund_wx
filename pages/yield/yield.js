// pages/yield/yield.js
const request = require('../../utils/request.js');
const util = require('../../utils/util');
const Stock = require('../../utils/stockYield');
const Fund = require('../../utils/fundYield');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    stock: {
      todayAllGains: 0,
      allGains: 0,
      allPosition: 0,
      todayAllYield: 0,
      allYield: 0
    },
    fund: {
      todayAllGains: 0,
      allGains: 0,
      allPosition: 0,
      todayAllYield: 0,
      allYield: 0
    },
    all: {
      todayAllGains: 0,
      allGains: 0,
      allPosition: 0,
      todayAllYield: 0,
      allYield: 0
    },
    isShowAll: true,
    isShowFund: true,
    isShowStock: true
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
    Promise.all([this.onStock(), this.onFund()]).finally(() => {
      wx.hideLoading();
      //隐藏导航条加载动画
      wx.hideNavigationBarLoading();
      //停止下拉刷新
      wx.stopPullDownRefresh();
    });
  },

  onLoad() {
    const stockItemList = wx.getStorageSync('stockItemList') || [];
    const fundListM = wx.getStorageSync('fundListM') || [];

    const data = {};

    if(stockItemList.length > 0) {
      data.isShowStock = true;
    } else {
      data.isShowStock = false;
    }
    if(fundListM.length > 0) {
      data.isShowFund = true;
    } else {
      data.isShowFund = false;
    }

    if(data.isShowFund && data.isShowStock) {
      data.isShowAll = true;
    } else {
      data.isShowAll = false;
    }

    this.setData(data);
  },

  /**
   * 打赏
   */
  onToReward() {
    wx.navigateTo({
      url: '/pages/reward/index'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取票类中的数据情况
    this.onStock();
    // 获取基金类中的数据情况
    this.onFund();
  },

  /**
   * 票收益计算
   */
  onStock() {
    return new Promise((resolve) => {
      const stock = Stock.init();
      stock.getData().then((res) => {
        const { todayAllGains,
          allGains,
          allPosition,
          todayAllYield,
          allYield } = res;

        this.setData({
          stock: {
            todayAllGains,
            allGains,
            allPosition,
            todayAllYield,
            allYield
          }
        }, () => {
          this.onAll();
        });
        resolve(res);
      });
    });
  },

  /**
   * 基金收益计算
   */
  onFund() {
    return new Promise((resolve) => {
      const fund = Fund.init();
      fund.getData().then((res) => {
        const { todayAllGains,
          allGains,
          allPosition,
          todayAllYield,
          allYield } = res;

        this.setData({
          fund: {
            todayAllGains,
            allGains,
            allPosition,
            todayAllYield,
            allYield
          }
        }, () => {
          this.onAll();
        });
        resolve(res);
      });
    })
  },

  /**
   * 总收益计算
   */
  onAll() {
    const { stock, fund } = this.data;

    const todayAllGains = (+stock.todayAllGains) + (+fund.todayAllGains);
    const allGains = (+stock.allGains) + (+fund.allGains);
    const allPosition = (+stock.allPosition) + (+fund.allPosition);
    let todayAllYield = 0;
    let allYield = 0;

    if(allPosition !== 0) {
      todayAllYield = ((todayAllGains / (allPosition - todayAllGains)) * 100).toFixed(2);
      // 总收益率 = 总收益金额 / （ 持仓金额 - 总收益金额 ）
      allYield = ((allGains / (allPosition - allGains)) * 100).toFixed(2);
    }

    this.setData({
      all: {
        todayAllGains: todayAllGains.toFixed(2),
        allGains: allGains.toFixed(2),
        allPosition: allPosition.toFixed(2),
        todayAllYield,
        allYield
      }
    });
  },
})
//获取应用实例
// const app = getApp()
// const request = require('../../utils/request.js');

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isShowDp: wx.getStorageSync('isShowDp') || false
  },
  onLoad: function () {

  },
  onShow: function () {
    const storageInfo = {
      user_name: wx.getStorageSync("user_name")
    }
    if (wx.getStorageSync("user_name")) {
      this.setData({
        userInfo: storageInfo
      })
    }
  },
  changeDp(e) {
    const isCheck = e.detail.value;
    this.setData({
      isShowDp: isCheck
    });
    wx.setStorageSync('isShowDp', isCheck);
  },
  // 去登录/注册
  toLogin: function () {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  }
})

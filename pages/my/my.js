//index.js
//获取应用实例
const app = getApp()
const request = require('../../utils/request.js');

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    loginDialog: false,
    registerDialog: false,
    buttons: [],
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showTopTips: false,
    loginForm: {},
    registerForm: {},
    loginRules: [
      {
        name: 'username',
        rules: {required: true, message: '用户名不能为空'},
      },
      {
        name: 'password',
        rules: {required: true, message: '密码不能为空'},
      }
    ],
    registerRules: [
      {
        name: 'username',
        rules: {required: true, message: '用户名不能为空'},
      },
      {
        name: 'password',
        rules: {required: true, message: '密码不能为空'},
      },
      {
        name: 'conFirmPwd',
        rules: {required: true, message: '密码不能为空'},
      }
    ]
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  // 打开Login弹窗
  toLogin: function () {
    this.setData({
      loginDialog: true,
      buttons: [{text: '去注册'}, {text: '确定'}]
    })
  },
  formInputChange(e) {
    let fornName = this.data.loginDialog ? 'loginForm' : 'registerForm'
    const {field} = e.currentTarget.dataset
    this.setData({
      [`${fornName}.${field}`]: e.detail.value
    })
  },
  loginDialogButton: function (e) {
    const btnIdx = e.detail.index;
    console.log(e)
    if(btnIdx === 1){
      let fornName = this.data.loginDialog ? 'loginForm' : 'registerForm'
      this.selectComponent(`#${fornName}`).validate((valid, errors) => {
        if (valid && fornName === "loginForm") {
          this.confirmLogin()
        }else if(valid && fornName === "registerForm"){
          this.confirmRegister()
        }else{
          const firstError = Object.keys(errors)
          if (firstError.length) {
            this.setData({
              error: errors[firstError[0]].message
            })
          }
        }
      })
    }else{
      let linkStr = !this.data.loginDialog ? '去注册' : '去登录';
      this.setData({
        buttons: [{text: linkStr}, {text: '确定'}],
        loginDialog: !this.data.loginDialog,
        registerDialog: !this.data.registerDialog
      })
    }
  },
  // 登录
  confirmLogin: function(){
    let url = "/login";
    console.log(url)
    request({
      url,
      success(res) {
        console.log(res)
        // resolve();
      }
    })
  },
  // 注册
  confirmRegister: function(){
    let url = "/register";
    console.log(url)
    request({
      url,
      success(res) {
        console.log(res)
        // resolve();
      }
    })
  }
  // getUserInfo: function(e) {
  //   if(e.detail.errMsg.indexOf("ok") != -1){
  //     app.globalData.userInfo = e.detail.userInfo
  //     this.setData({
  //       userInfo: e.detail.userInfo,
  //       hasUserInfo: true
  //     })
  //   }
  // }
})

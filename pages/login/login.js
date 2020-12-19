//获取应用实例
const app = getApp()
const request = require('../../utils/request.js');

Page({
  data: {
    loginForm: {},
    loginRules: [
      {
        name: 'username',
        rules: {required: true, message: '用户名不能为空'},
      },
      {
        name: 'password',
        rules: {required: true, message: '密码不能为空'},
      }
    ]
  },
  onLoad: function () {
    
  },
  // 去注册
  toRegister: function (){
    wx.navigateTo({
      url: '/pages/register/register',
    })
  },
  formInputChange(e) {
    const {field} = e.currentTarget.dataset;
    this.setData({
      [`loginForm.${field}`]: e.detail.value
    })
  },
  // 点击登录按钮
  clickBtnLogin: function () {
    this.selectComponent("#loginForm").validate((valid, errors) => {
      if (valid) {
        this.confirmLogin()
      }else{
        const firstError = Object.keys(errors)
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          })
        }
      }
    })
  },
  // 登录
  confirmLogin: function(){
    const url = `${app.baseUrl}/login`;
    const method = "POST";
    let data = {
      username: this.data.loginForm.username,
      password: this.data.loginForm.password
    }
    wx.showLoading({
      title: '加载中',
    })
    request({
      url,
      method,
      data,
      success: res => {
        wx.hideLoading()
        if(res.data.status === "000"){
          const { user_name, user_create_time, token } = res.data.data;
          wx.setStorageSync('token', token);
          wx.setStorageSync('user_name', user_name);
          wx.setStorageSync('user_create_time', user_create_time);
          wx.showToast({
            title: "登录成功"
          });
          setTimeout(function (){
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        }
      }
    })
  }
})

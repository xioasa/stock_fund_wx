//获取应用实例
const app = getApp()
const request = require('../../utils/request.js');

// form-conFirmPwd-校验函数
const conFirmPwdFn = function (rule, value, param, models) {
  if(!value){
    return "请再次输入密码"
  }else if(value != models['password']){
    return "两次密码输入不一致"
  }
}

Page({
  data: {
    // disableCode倒计时
    countDownCode: 60,
    codeTimer: null,
    codeBtn: false,
    registerForm: {
      is_opend_email: false
    },
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
        rules: {
          validator: conFirmPwdFn
        }
      },
      {
        name: 'email',
        rules: {required: false, message: '邮箱不能为空'},
      },
      {
        name: 'code',
        rules: {required: false, message: '验证码不能为空'},
      }
    ]
  },
  onLoad: function () {
    
  },
  // 切换邮箱绑定状态
  switchChange: function (e) {
    // 选项置空
    this.setData({
      ['registerForm.is_opend_email']: e.detail.value,
      ['registerForm.email']: "",
      ['registerForm.code']: "",
      ['registerRules[3].rules.required']: e.detail.value,
      ['registerRules[4].rules.required']: e.detail.value
    })
  },
  formInputChange(e) {
    const {field} = e.currentTarget.dataset;
    this.setData({
      [`registerForm.${field}`]: e.detail.value
    })
  },
  // 点击注册按钮
  clickRegister: function () {
    this.selectComponent("#registerForm").validate((valid, errors) => {
      if (valid) {
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
  },
  // 注册
  confirmRegister: function () {
    const url = `${app.baseUrl}/register`;
    const method = "POST";
    const { username, password, email, code } = this.data.registerForm;
    console.log(wx.getStorageInfoSync('token'))
    request({
      url,
      method,
      data: {
        username: username,
        password: password,
        email: email,
        code: code,
        is_opend_email: this.data.registerForm.is_opend_email
      },
      header: {
        token: wx.getStorageSync('token')
      },
      success: res => {
        if(res.data.status === "000"){
          wx.setStorageSync('token', res.data.data.token);
          wx.showToast({
            title: "注册成功"
          });
          setTimeout(function (){
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        }
      }
    })
  },
  // 发送验证码
  sendCode: function () {
    if(this.data.countDownCode > 0 && this.data.codeBtn){
      return false
    }
    if(this.data.registerForm['email']){
      const url = `${app.baseUrl}/sendMail`;
      const method = "POST";
      let data = {
        email: this.data.registerForm.email
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
            this.disableCode()
            wx.setStorageSync('token', res.data.data.token);
            wx.showToast({
              title: "发送成功请注意查收"
            });
          }
        }
      })
    }else{
      wx.showToast({
        title: "请输入邮箱地址",
        icon: "none"
      });
    }
  },
  // 验证码禁用一分钟
  disableCode: function () {
    let that = this;
    let interTimer = setInterval(function(){
      that.setData({
        countDownCode: that.data.countDownCode - 1
      })
      if(that.data.countDownCode <= 0){
        clearInterval(that.data.codeTimer)
      }
    }, 1000)
    this.setData({
      codeBtn: true,
      countDownCode: 60,
      codeTimer: interTimer
    })
  }
})

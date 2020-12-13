//获取应用实例
const app = getApp()
const request = require('../../utils/request.js');

// const emailChecked = function (rule, value) {
//   console.log(this)
// }

Page({
  data: {
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
        rules: {required: true, message: '密码不能为空'},
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
    this.setData({
      ['registerForm.is_opend_email']: e.detail.value,
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
        // this.confirmRegister()
        console.log(this.data.registerForm)
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
  confirmRegister: function(){
    const url = `${app.baseUrl}/register`;
    const method = "POST";
    let data = {
      username: this.data.registerForm.username,
      password: this.data.registerForm.password
    }
    request({
      url,
      method,
      data,
      success: (res) => {
        console.log(res)
      }
    })
  }
})

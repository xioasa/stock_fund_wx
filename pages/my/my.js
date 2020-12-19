//获取应用实例
const app = getApp()
const request = require('../../utils/request.js');

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    
  },
  onShow: function () {
    const storageInfo = {
      user_name: wx.getStorageSync("user_name")
    }
    if(wx.getStorageSync("user_name")){
      this.setData({
        userInfo: storageInfo
      })
    }
  },
  // 去登录/注册
  toLogin: function () {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  // 退出登录
  outLogin: function () {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗',
      success (res) {
        if (res.confirm) {
          const url = `${app.baseUrl}/logout`;
          const method = "POST";
          wx.showLoading({
            title: '登出中...',
          })
          request({
            url,
            method,
            success: res => {
              wx.hideLoading()
              if(res.data.status === "000"){
                wx.removeStorageSync("token");
                wx.removeStorageSync("user_name");
                wx.removeStorageSync("user_create_time");
                wx.showToast({
                  title: "登出成功"
                });
                that.setData({
                  userInfo: {}
                })
              }
            }
          })
        }
      }
    })
  },
  // 云备份
  cloudStorage: function () {
    wx.getStorageInfo({
      success (res) {
        // 过滤项(数组内对应的key缓存不会上传)
        const filterArr = ['logs', 'device_id'];
        const storageKeys = res.keys;
        let storageVal = {};
        storageKeys.map(v => {
          if(filterArr.indexOf(v) == -1){
            storageVal[v] = wx.getStorageSync(v)
          }
        })
        const url = `${app.baseUrl}/sync`;
        const method = "POST";
        wx.showLoading({
          title: '备份中',
        })
        request({
          url,
          method,
          data: {
            user_content: JSON.stringify(storageVal)
          },
          header: {
            token: wx.getStorageSync('token')
          },
          success: res => {
            wx.hideLoading()
            if(res.data.status === "000"){
              wx.showToast({
                title: "备份成功！"
              });
            }
          }
        })
      }
    })
  },
  // 云恢复
  cloudDownload: function () {
    const url = `${app.baseUrl}/find`;
    const method = "GET";
    wx.showLoading({
      title: '恢复中',
    })
    request({
      url,
      method,
      header: {
        token: wx.getStorageSync('token')
      },
      success: res => {
        wx.hideLoading()
        if(res.data.status === "000"){
          const { user_content } = res.data.data;
          if(user_content){
            const contentObj = JSON.parse(user_content);
            for(let item in contentObj){
              wx.setStorageSync(item, contentObj[item])
            }
            wx.showToast({
              title: "恢复成功！"
            });
          }else{
            wx.showToast({
              title: "云端暂无备份的数据"
            });
          }
        }
      }
    })
  }
})

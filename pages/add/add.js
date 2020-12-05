
Page({
  onLoad: function (option) {
    const { name, code } = option;
    this.setData({
      name,
      code
    });
  },
  data: {
    formData: {

    },
    name: '',
    code: '',
  },
  formInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },
  // 添加基金
  submitForm() {
    this.selectComponent('#form').validate((valid, errors) => {
      if (valid) {
        const { name, code, formData: { cost, num } } = this.data;
        const fundListM = wx.getStorageSync('fundListM') || [];
        const hasCode = fundListM.some((currentValue, index, array) => {
          return currentValue.code == code;
        });
        // 判断是否重复添加
        if (hasCode) {
          wx.showToast({
            title: '重复添加',
            icon: 'success',
            duration: 2000
          });
          return false;
        }
        fundListM.push({ cost, num, name, code });
        wx.setStorageSync('fundListM', fundListM);
      }
      wx.showToast({
        title: '校验通过'
      })
    })
  },
});
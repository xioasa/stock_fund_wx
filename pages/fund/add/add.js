
Page({
  onLoad: function (option) {
    const { type, name, code, data } = option;
    // 修改
    if (type === 'detail') {
      const data_ = JSON.parse(data);
      const { fundcode, name, cost, num } = data_;
      wx.setNavigationBarTitle({ title: `编辑-${name}` });
      this.setData({
        name,
        code: fundcode,
        cost,
        num,
        formData: {
          cost,
          num
        }
      });

    } else {
      wx.setNavigationBarTitle({ title: '添加基金' })
      // 新增
      this.setData({
        name,
        code
      });
    }
  },
  data: {
    name: '',
    code: '',
    cost: '',
    num: '',
  },
  formInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [field]: e.detail.value
    })
  },
  // 添加基金
  submitForm() {
    this.selectComponent('#form').validate((valid, errors) => {
      if (valid) {
        const { name, code, cost, num } = this.data;
        const fundListM = wx.getStorageSync('fundListM') || [];
        let hasCode = false;
        // 这里不校验重复则不能添加，在入口已经做判断
        // 存在即修改
        fundListM.forEach((currentValue, index, array) => {
          if(currentValue.code === code) {
            const { num, name, cost } = this.data;
            currentValue.num = num;
            currentValue.name = name;
            currentValue.cost = cost;
            hasCode = true;
          }
        });
        if(!hasCode) {
          fundListM.push({ cost, num, name, code });
        }
        wx.setStorageSync('fundListM', fundListM);
        wx.showToast({
          title: !hasCode ? '添加成功' : '修改成功'
        });
        this.goBack();
      }
    })
  },
  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },
  // 删除
  onDel() {
    const fundListM = wx.getStorageSync('fundListM', fundListM) || [];
    const fundListM_ = fundListM.filter(item => item.code !== this.data.code);
    wx.setStorageSync('fundListM', fundListM_);
    wx.showToast({
      title: '删除成功'
    });
    this.goBack();
  }
});
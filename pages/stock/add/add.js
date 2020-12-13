const util = require('../../../utils/util');

Page({
  onLoad: function (option) {
    const { type, name, code, data } = option;
    // 修改
    if (type === 'detail') {
      const data_ = JSON.parse(data);
      const { code, name, initPrice, num, market, isTodybuy } = data_;
      wx.setNavigationBarTitle({ title: `编辑-${name}` });
      this.setData({
        name,
        code,
        initPrice,
        market,
        num,
        isTodybuy,
        formData: {
          initPrice,
          num
        }
      });

    } else {
      wx.setNavigationBarTitle({ title: '添加股票' })
      const [Code, MktNum] = code.split('_');
      // 新增
      this.setData({
        name,
        code: Code,
        market: MktNum
      });
    }
  },
  data: {
    name: '',
    code: '',
    initPrice: '',
    num: '',
    market: '',
    isTodybuy: false
  },

  formInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [field]: e.detail.value
    })
  },

  changeIsTodybuy(e) {
    const isCheck = e.detail.value;
    this.setData({
      isTodybuy: isCheck ? util.getTime() : false
    });
  },

  // 添加股票
  submitForm() {
    this.selectComponent('#form').validate((valid, errors) => {
      if (valid) {
        const { name, code, market, num, initPrice, isTodybuy } = this.data;
        const stockItemList = wx.getStorageSync('stockItemList') || [];
        let hasCode = false;
        // 这里不校验重复则不能添加，在入口已经做判断
        // 存在即修改
        stockItemList.forEach((currentValue, index, array) => {
          if (`${currentValue.code}@${currentValue.name}` === `${code}@${name}`) {
            currentValue.num = num;
            currentValue.name = name;
            currentValue.initPrice = initPrice;
            currentValue.market = market;
            currentValue.isTodybuy = isTodybuy;
            hasCode = true;
          }
        });

        if (!hasCode) {
          stockItemList.push({ initPrice, num, name, code, market, isTodybuy });
        }

        wx.setStorageSync('stockItemList', stockItemList);
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
    const stockItemList = wx.getStorageSync('stockItemList', stockItemList) || [];
    const stockItemList_ = stockItemList.filter(item => item.code !== this.data.code);
    wx.setStorageSync('stockItemList', stockItemList_);
    wx.showToast({
      title: '删除成功'
    });
    this.goBack();
  }
});
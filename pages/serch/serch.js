const request = require('../../utils/request.js');

Page({
  data: {
    placeholder: "",
    options: {},
  },

  onLoad: function (options) {
    const navigationBarTitle = {
      fund: '基',
      stock: '票',
      dp: '指数',
    };
    wx.setNavigationBarTitle({ title: `查询${navigationBarTitle[options.type]}` })
    const placeholders = {
      fund: '输入基名称或者代码',
      stock: '输入票名称或者代码',
      dp: '输入指数名称或者代码',
    };
    this.setData({
      search: this.search.bind(this),
      placeholder: options.type ? placeholders[options.type] : '',
      options
    })
  },


  onReady: function () {

  },


  onShow: function () {

  },

  selectResult: function (e) {
    const { item } = e.detail;
    const { type } = this.data.options;
    if (item) {
      if (type === 'fund') {
        this.fundSelect(item);
      } else if (type === 'stock') {
        this.stockSelect(item);
      }
    }
  },

  /**
   * 基金添加
   */
  fundSelect(item) {
    const { name, value } = item;
    const fundListM = wx.getStorageSync('fundListM') || [];
    const hasCode = fundListM.find((currentValue, index, array) => {
      return currentValue.code == value;
    });
    // 判断是否重复添加
    if (hasCode) {
      wx.showToast({
        title: '请勿重复添加',
        icon: 'info',
        duration: 2000
      });
      return false;
    }
    wx.navigateTo({
      url: `/pages/fund/add/add?type=fund&name=${name}&code=${value}`
    })
  },

  /**
   *  票添加
   * @param {*} value 
   */
  stockSelect(data) {
    const { name, value } = data;
   const [Code, MktNum] = value.split('_');
    const stockItemList = wx.getStorageSync('stockItemList') || [];

    const hasCode = stockItemList.some((item, index, array) => {
      return (
        `${item.code}@${item.name}` ===
        `${Code}@${data.name}`
      );
    });

    // 判断是否重复添加
    if (hasCode) {
      wx.showToast({
        title: '请勿重复添加',
        icon: 'info',
        duration: 2000
      });
      return false;
    }

    wx.navigateTo({
      url: `/pages/stock/add/add?type=fund&name=${name}&code=${value}`
    })
  },

  /**
   * 查询
   * @param {*} value 
   */
  search: function (value) {
    const { type } = this.data.options;
    if (type === 'fund') {
      return this.fundSearch(value);
    } else if (type === 'stock') {
      return this.stockSearch(value);
    }
  },

  /**
   * 基金查询
   */
  fundSearch(value) {
    return new Promise((resolve, reject) => {
      let url =
        "https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?&m=9&key=" +
        value +
        "&_=" +
        new Date().getTime();
      request({
        url,
        success(res) {
          const { Datas } = res.data;
          let data = [];
          if (Datas && Datas.length) {
            data = Datas.map((item) => {
              const { NAME, CODE } = item;
              return {
                text: `${CODE}    ${NAME}`,
                value: CODE,
                name: NAME
              }
            });
          }
          resolve(data);
        }
      })
    })
  },

  /**
   * 票查询
   */
  stockSearch(valve) {
    return new Promise((resolve, reject) => {
      let url =
        "https://searchapi.eastmoney.com/api/Info/Search?appid=el1902262&type=14&token=CCSDCZSDCXYMYZYYSYYXSMDDSMDHHDJT&and14=MultiMatch/Name,Code,PinYin/" +
        valve +
        "/true&returnfields14=Name,Code,PinYin,MarketType,JYS,MktNum,JYS4App,MktNum4App,ID,Classify,IsExactMatch,SecurityType,SecurityTypeName&pageIndex14=1&pageSize14=10&isAssociation14=false" +
        new Date().getTime();
      request({
        url,
        success(res) {
          const { Data } = res.data;
          let data = [];
          if (Data && Data.length) {
            data = Data.map((item) => {
              const { Name, Code, SecurityTypeName, MktNum } = item;
              return {
                text: `${Code}    ${Name}                    ${SecurityTypeName}`,
                value: `${Code}_${MktNum}`,
                name: Name
              }
            });
          }
          data = data.filter(
            (item) => item.Classify !== "OTCFUND"
          )
          resolve(data);
        }
      })
    })
  }
})
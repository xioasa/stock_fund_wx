const request = require('../../utils/request.js');

const componentOptions = {
  // 组件选项
  options: {
    multipleSlots: true,
  },
  behaviors: [],
  properties: {},
  // 组件数据
  data: {
    isPageHidden: false, // 页面是否处于隐藏状态
    secids: '1.000001,1.000300,0.399001,0.399006,1.000933,0.399986,0.399997,1.000820,0.399975,1.000990,1.000004,1.000006',
    secidsData: []
  },
  // 数据监听器
  observers: {},
  // 组件方法
  methods: {
    init() { },
    getData() {
      const that = this;
      const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f2,f3,f4,f12,f14&secids=${this.data.secids}&_=${new Date().getTime()}`;
      request({
        url,
        success(res) {
          that.setData({
            secidsData: res.data.data.diff
          });
        }
      });
    },
  },
  // 组件生命周期
  lifetimes: {
    created() {
      this.getData();
    },
    attached() {
    },
    ready() {
    },
    moved() { },
    detached() { },
  },
  definitionFilter() { },
  // 页面生命周期
  pageLifetimes: {
    // 页面被展示
    show() {
      const { isPageHidden } = this.data

      // show事件发生前，页面不是处于隐藏状态时
      if (!isPageHidden) {
        return
      }

      // 重新执行定时器等操作
    },
    // 页面被隐藏
    hide() {
      this.setData({
        isPageHidden: true,
      })

      // 清除定时器等操作
    },
    // 页面尺寸变化时
    resize() { },
  },
}

Component(componentOptions)

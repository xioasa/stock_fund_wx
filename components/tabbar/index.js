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
    secidsData: [],
    active: '' // 当前激活页面
  },
  // 数据监听器
  observers: {},
  // 组件方法
  methods: {
    onLink(e) {
      const { url } = e.currentTarget.dataset;
      const redirectUrl = ['/pages/stock/index', '/pages/fund/fund'];
      if (redirectUrl.includes(url)) {
        wx.redirectTo({
          url
        })
      } else {
        wx.navigateTo({
          url
        })
      }
    },

  },
  // 组件生命周期
  lifetimes: {
    created() {
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
      const page = getCurrentPages()[0];
      console.log('page.route', page.route);
      this.setData({
        active: `/${page.route}`
      });

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

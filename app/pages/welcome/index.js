Page({
  data: {},

  onLoad() {
    // 页面加载时执行
  },

  startPlan() {
    console.log('navigate')
    wx.navigateTo({
      url: "/pages/form/index",
    })
  },
})

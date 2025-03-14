Page({
  data: {},

  onLoad() {
    // 页面加载时执行
  },

  startPlan() {
    console.log("navigate")
    wx.navigateTo({
      url: "/pages/form/index",
    })
  },

  // 分享给朋友
  onShareAppMessage: function () {
    return {
      title: "碳循环刷脂计划 - 科学定制你的减脂方案",
      path: "/pages/welcome/index",
      imageUrl: "/images/share.png", // 如果有分享图片的话
    }
  },

  // 分享到朋友圈
  onShareTimeline: function () {
    return {
      title: "碳循环刷脂计划 - 科学定制你的减脂方案",
      query: "",
      imageUrl: "/images/share.png", // 如果有分享图片的话
    }
  },
})

App({
  globalData: {
    userInfo: null,
    planData: null,
    shareInfo: {
      title: "碳循环刷脂计划 - 科学定制你的减脂方案",
      path: "/pages/welcome/index",
      imageUrl: "/images/logo.png",
    },
  },
  onLaunch() {
    // 小程序启动时执行
    console.log("App launched")

    // 检查更新
    if (wx.canIUse("getUpdateManager")) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: "更新提示",
              content: "新版本已经准备好，是否重启应用？",
              success: function (res) {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              },
            })
          })

          updateManager.onUpdateFailed(function () {
            wx.showModal({
              title: "更新提示",
              content: "新版本下载失败，请检查网络后重试",
              showCancel: false,
            })
          })
        }
      })
    }
  },

  // 全局分享配置
  onShareAppMessage: function () {
    return this.globalData.shareInfo
  },

  onShareTimeline: function () {
    return {
      title: this.globalData.shareInfo.title,
      query: "",
      imageUrl: this.globalData.shareInfo.imageUrl,
    }
  },
})

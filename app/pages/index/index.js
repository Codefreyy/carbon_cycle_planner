Page({
  onShareAppMessage: function (res) {
    let shareObj = {
      title: '轻松生成碳循环计划',
      path: '/pages/index/index',
      imageUrl: '/images/logo.png'
    };
    return shareObj;
  },
  // 如果需要分享到朋友圈
  onShareTimeline: function () {
    return {
      title: '轻松生成碳循环计划',
      query: '参数=值'
    };
  },
  // 其它页面生命周期和逻辑
});

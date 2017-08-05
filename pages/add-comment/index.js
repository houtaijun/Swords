// index.js
var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentMovie: "",
    content: "",
    douBanId : null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      douBanId : options.id,
      currentMovie: app.globalData.currentMovie
    })
  },

  inputContent: function (e) {
    this.setData({
      content: e.detail.value
    })
  },
  submit: function () {
    var that = this;
    wx.request({
      url: 'https://api.tiaozaoj.com/movie_comment/group/addComment',
      data: {
        douBanId: that.data.douBanId,
        openGId: app.globalData.openGId,
        openid: app.globalData.openid,
        content: that.data.content
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.errNum != 0) {
          app.alert(res.data.retMsg);
          return;
        }
        app.event.emit("addCommentSuccess", that.data.content);
        wx.showToast({
          title: '评论成功',
          duration: 2000,
          complete: function () {
            wx.navigateBack();
          }
        });
      }
    })
  },
})
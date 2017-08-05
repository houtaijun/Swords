// index.js
var util = require('../../utils/util.js'); 
var app = getApp();

Page({
  data: {
    hideAddComment : true,
    movie : [],
    douBanId : "",
    review : false,
    comments: [],
  },
  toAddComment : function(){
    var that = this;
    app.globalData.currentMovie = this.data.movie.title;
    app.event.on('addCommentSuccess', this.addCommentSuccess, this);
    wx.navigateTo({
      url: '/pages/add-comment/index?id=' + that.data.douBanId,
    })
  },
  addCommentSuccess: function(content){
    var that = this;
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        var comment = {
          "nickname": res.data.nickName,
          "avatar": res.data.avatarUrl,
          "content": content,
          "time": "刚刚"
        };
        var comments = that.data.comments;
        comments.unshift(comment);
        that.setData({
          hideAddComment : true,
          comments: comments
        })
      },
    })
  },
  loadingComment : function(){
    this.setData({
      loading : true
    })
  },
  onUnload: function(){
    app.event.off();
  },
  onLoad: function (e) {
    app.getUserInfo().catch(function(){
      app.log(1)
      var currentPage = "/pages/movie/index?id="+e.id
      app.toLogin(currentPage);
    });

    wx.showShareMenu({
      withShareTicket: true //要求小程序返回分享目标信息
    })

    this.setData({
      review : app.globalData.review
    });
    
    var id = e.id;
    var that = this;
    wx.request({
      url: app.globalData.doubanApi + "/movie/subject/" + id,
      header: {
        "Content-Type": "json"
      },
      success : function(res){
        that.setData({
          movie: res.data,
          douBanId :id
        });
        app.globalData.currentMovie = res.data.title;
        if (app.globalData.review) {
          app.getOpenGId().then(function(openGId){
            that.getMovieComments(openGId);
          }).catch(function(err){
            app.event.on('getOpenGId', that.getMovieComments, that);
          })
        }
      },
      fail: function(){
        app.alert("电影数据加载失败");
      }
    })
  },

  getMovieComments: function(openGId){
    var that = this;
    wx.request({
      url: 'https://api.tiaozaoj.com/movie_comment/group/getMovieComments',
      data: {
        openGId: openGId,
        douBanId: that.data.douBanId,
        openid : app.globalData.openid
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var data = res.data.retData.list;
        if (data.length == 0) {
          that.setData({
            comments: [],
            tip: "",
            hideAddComment: false
          })
        } else {
          that.setData({
            comments: data,
            tip: "",
            hideAddComment: res.data.retData.isCommented
          })
        }
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.getOpenGId().then(function (openGId) {
      that.getMovieComments(openGId);
    })
    settimeout(function(){
      wx.stopPullDownRefresh();
    })
  },

  addMovie: function(){
    var that = this;
    wx.request({
      url: 'https://api.tiaozaoj.com/movie_comment/group/addmovie',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        douBanId: that.data.douBanId,
        openid: app.globalData.openid,
        openGId: app.globalData.openGId
      },
      success: function(res){
        app.log(res);
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;

    return {
      title: '这部电影好看么',
      success: function (res) {
         app.login().then(function(loginData){
          app.getShareInfo(res.shareTickets[0], loginData.session_key).then(function(){
            that.addMovie();
          })
        }) 
      }
    }
  }
})
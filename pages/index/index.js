var Promise = require('../../utils/es6-promise.min.js');
//获取应用实例
var app = getApp()

Page({
  data: {
    userInfo: {}
  },
  onLoad: function () {
    var that = this;
    app.getUserInfo().then(function(userInfo){
      that.setData({
        userInfo: userInfo
      })
    }).catch(function(){
      app.toLogin();
    });
  },
  toSelectMovie: function() {
    app.getUserInfo().then(function() {
      wx.navigateTo({
        url: '/pages/select-movie/index',
      })
    })
  },
})
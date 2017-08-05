//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    avatar: "/images/default-avatar.png",
    nickname : "未登录",
    logining: false
  },
  showLogining: function(){
    this.setData({
      logining : true
    })
  },
  hideLogining: function(){
    this.setData({
      logining: false
    })
  },
  bindLogin : function(e){
    if (typeof (e.detail.userInfo) == "undefined"){
      return;
    }
    var that = this;
    that.showLogining();
    app.login().then(function (loginData) {
      that.register(loginData.session_key, e.detail);
    });
  },
  register:function(sessionKey, detail){
    var that = this;
    wx.request({
      url: 'https://api.tiaozaoj.com/movie_comment/user/register',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        sessionKey: sessionKey,
        encryptedData: detail.encryptedData,
        iv: detail.iv
      },
      success: (res)=> {
        if (res.data.errNum != 0) {
          app.alert("登录失败，请重试");
          return;
        }
        wx.setStorageSync('userInfo', detail.userInfo);
        that.showLoginSuccess();
      },
      complete: function(){
        that.hideLogining();
      }
    })
  },
  showLoginSuccess: function(){
    wx.showToast({
      title: '登录成功',
      duration: 2000,
      complete: function () {
        var redirect = (app.globalData.redirect != "") ? app.globalData.redirect : "/pages/index/index";
        wx.navigateTo({
          url: redirect,
        })
      }
    })
  }
})

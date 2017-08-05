//app.js
var util = require("/utils/util.js");
var Promise = require('/utils/es6-promise.min.js');
const MyEvent = require("/utils/event.js");

App({
  isDebug: true,//开启调试
  recordLog: false,//记录日志
  log : function(data){
    if (typeof (this.isDebug) == "boolean" && this.isDebug){
      console.log(data);
    }
    if (typeof (this.recordLog) == "boolean" && this.recordLog){
      var logs = wx.getStorageSync('logs') || [];
      logs.unshift(data);
      wx.setStorage({
        key: 'logs',
        data: logs,
      })
    }
  },

  event: new MyEvent(),//全局事件

  onLaunch: function (ops) {
    var that = this;

    //从用户分享的卡片中进入
    if (ops.scene == 1044) {
      that.globalData.review = true;
      var shareTicket = ops.shareTicket;
      that.login().then(function(loginData){
        that.getShareInfo(shareTicket, loginData.session_key);
      })
    }
  },

  loading : function(){
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })
  },

  hideLoading : function(){
    wx.hideLoading();
  },

  alert: function (content){
    wx.showModal({
      title: "提示",
      content: content,
      showCancel:false,
      confirmText:"确定",
      confirmColor: "#fc4766"
    })
  },

  confirm:function(content){
    return new Promise(function (resolve, reject) {
      wx.showModal({
        title: '提示',
        content: content,
        confirmText: "好的",
        cancelText: "取消",
        cancelColor: "#666",
        confirmColor: "#fc4766",
        success:res=>{
          resolve();
        },
        fail: res=>{
          reject();
        }
      })
    })
  },

  //用户登录
  login : function(){
    var that = this;
    return new Promise(function (resolve, reject) { 
        wx.login({
          success: res => {
              wx.request({
                url: 'https://api.tiaozaoj.com/movie_comment/user/onLogin',
                data: { code: res.code },
                success: res => {
                  if (res.data.errNum != 0) {
                    that.alert(res.data.errMsg);
                    reject(res.data.errMsg);
                    return;
                  }
                  var retData = JSON.parse(res.data.retData);
                  wx.setStorageSync("loginData", retData);
                  that.globalData.openid = retData.openid;
                  resolve(retData); 
                },
                fail:function(res){
                  reject(res);
                }
              })
            }
        })
      }); 
  },

  //获取分享信息
  getShareInfo: function (shareTicket, sessionKey) {
    var that = this;
    return new Promise(function (resolve, reject) { 
      wx.getShareInfo({
        shareTicket: shareTicket,
        complete(res) {
          wx.request({
            url: 'https://api.tiaozaoj.com/movie_comment/user/decrypt',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              sessionKey: sessionKey,
              encryptedData: res.encryptedData,
              iv: res.iv
            },
            success(res) {
              if (res.data.errNum != 0) {
                reject("获取群号失败");
                return;
              }
              var openGId = res.data.retData.openGId;
              that.globalData.openGId = openGId;
              that.event.emit('getOpenGId', openGId);
              resolve(openGId);
            }
          })
        }
      })
    })
  },
  getOpenGId: function(){
    var that = this;
    return new Promise(function (resolve, reject) { 
      if (that.globalData.openGId != "") {
        resolve(that.globalData.openGId);
      } else {
        reject("openGId获取失败");
      }
    })
  },

  getUserInfo: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      if (wx.getStorage({
        key: 'userInfo',
        success: function (res) {
          resolve(res.data);
        },
        fail: function () {
          reject();
          //that.toLogin();
        }
      }));
    })
  },
  toLogin: function (redirect){
    typeof (redirect) != "undefined" && (this.globalData.redirect = redirect);
    wx.navigateTo({
      url: '/pages/login/index',
    })
  },

  globalData: {
    userInfo: null,
    doubanApi: "https://api.douban.com/v2",
    review : false,
    openGId : "",
    currentMovie: "这部电影",
    redirect : ""
  },
})
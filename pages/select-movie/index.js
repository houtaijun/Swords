var app = getApp();

Page({
  data: {
    inputShowed: true,
    inputVal: "",
    searchResults: null
  },
  onLoad:function(){
    var that = this;
    app.globalData.review = false;
    app.loading();
    wx.request({
      url: 'https://api.douban.com/v2/movie/in_theaters',
      header: {
        "Content-Type": "json"
      },
      success:function(res){
        var searchResults = [];
        var maxResultCount = 10;
        for (var index in res.data.subjects){
          searchResults[index] = new Object;
          index = parseInt(index);
          if (index >= maxResultCount){
            break;
          }
          searchResults[index].id = res.data.subjects[index].id;
          searchResults[index].title = res.data.subjects[index].title;
          searchResults[index].img = res.data.subjects[index].images.small;
          searchResults[index].year = "";
        }
        that.setData({
          searchResults: searchResults
        })
      },
      complete: function(res){
        app.hideLoading();
      }
    })
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.search(e.detail.value);
    this.setData({
      inputVal: e.detail.value
    });
  },
  search: function(movieName){
    if (movieName.length == 0) {
      return;
    }
    var that= this;
    wx.request({
      url: "https://movie.douban.com/j/subject_suggest",
      header: {
        "Content-Type": "json"
      },
      data: {q : movieName},
      success: res => {
        if (res.data.length == 0) {
          app.alert("未搜索到相关结果");
          return;
        }
        var searchResults = [];
        var maxResultCount = 10;
        for (var index in res.data) {
          searchResults[index] = new Object;
          index = parseInt(index);
          if (index >= maxResultCount) {
            break;
          }
          searchResults[index].title = res.data[index].title;
          searchResults[index].img = res.data[index].img;
          searchResults[index].year = res.data[index].year;
          searchResults[index].id = res.data[index].id;
        }
        that.setData({
          searchResults: res.data
        })
      },
    })
  },
  toDetailTap: function (e) {
    wx.navigateTo({
      url: "/pages/movie/index?id=" + e.currentTarget.dataset.id
    })
  },
});
# Swords
**Swords**是一个基于微信群的电影短评小程序

####背景
你是否遇到过这种情况，最近打算去看一部电影，去豆瓣上面看相关的短评，不可避免得会有着各种各样的水军、无脑黑和脑残粉，影响我们的判断。并且由于每个人的教育背景和价值观差异都不尽相同，所以对于一部电影的评价也就见仁见智了。

这种情况下，求助我们的微信群和朋友圈就成了最佳的选择。不过微信群的消息比较多，容易被刷掉，而朋友圈发的评论不能进行共享，无法让有相同需求的好友获知。**Swords**的出现就是让这个过程变得更加高效。

####功能亮点
- 微信授权登录，无须注册
- 接入豆瓣电影API，只需输入电影名，自动获取相关的图片和评分，并生成对应的电影卡片
- 转发电影卡片到微信群，即可将该电影和对应的群进行关联，群成员点击分享的卡片，可写短评和查看群成员对这部电影的所有短评
- 短评收集自动提醒
- 简单易用美观的用户体验

###技术特色
- 引入Es6的promise特性，提高异步函数的复用性，优雅得告别冗长的异步回调嵌套。
```
login : function(){
    return new Promise(function (resolve, reject) { 
        wx.login({
          success: res => {
              wx.request({
                url: url,
                data: { code: res.code },
                success: res => {
                  resolve(res); 
                },
                fail:function(res){
                  reject(res);
                }
              })
            }
        })
      }); 
}
```

```
app.login().then(function(loginData){
    app.getShareInfo(shareTicket, loginData.session_key);
})
```
- 实现Event事件机制，借鉴ios的发布者和订阅者模式，多个页面间无缝异步通信，提高性能和开发效率。

**Swords**的一个核心功能是分享转发小程序到微信群中，获取群id。其他群成员点击进入小程序，小程序启动的时候会给 **app.js** 传递一个shareTicket，然后再根据shareTicket到服务器中查询相应的openGId。另一边是电影页面同时需要根据openGId到服务器中查询对应的短评列表。获取openGId的时间与服务器响应速度和用户的网络有着比较大的关系，所以经常导致电影页面获取到的openGId是为空的，只能设置一个定时器去定期查询数据，具有很大的不稳定性。

而使用Event事件，可在page页面中监听openGId获取成功事件，只要获取成功了就执行对应的回调。
```
//index.js
var that = this;
//先查询openGid是否存在，如果存在就不用去监听了（及时监听也无效）
app.getOpenGId().then(function(openGId){
    that.getMovieComments(openGId);
}).catch(function(err){
    app.event.on('getOpenGId', that.getMovieComments, that);//监听事件
})
```

```
//page.js
var that = this;
that.event.emit('getOpenGId', openGId);
```

- 封装常用的 alert，confirm，loading，log等方法，让页面UI交互统一，开发起来更加简单
- 引入有赞高颜值的小程序样式库，有很多常用的样式组件可以复用
- 支持设置是否开启**debug**模式和记录日志
- 后端的代码和相关的数据表开源，简单部署和修改一些配置后即可使用

###小程序预览
- 微信授权登录，数据库保存头像和昵称和信息

![登录演示](https://raw.githubusercontent.com/houtaijun/Swords/docs/images/doc/login.gif)

- 选择电影（初始是最近上映的电影）

![选择电影](https://raw.githubusercontent.com/houtaijun/Swords/docs/images/doc/select-movie.gif)

- 转发电影卡片到微信群中

![转发](https://raw.githubusercontent.com/houtaijun/Swords/docs/images/doc/send.jpeg)
![转发结果](https://raw.githubusercontent.com/houtaijun/Swords/docs/images/doc/send-result.jpeg)
![预览](https://raw.githubusercontent.com/houtaijun/Swords/docs/images/doc/review.png)
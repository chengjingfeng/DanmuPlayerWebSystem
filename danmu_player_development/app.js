var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var ejs = require('ejs');
var http=require('http');

//上传文件引用
var formidable = require('formidable');
var fs = require('fs');
var TITLE = 'formidable上传示例';
var AVATAR_UPLOAD_FOLDER = '/src/videos/';


var routes = require('./routes/index');
var users = require('./routes/users');

//引用mongoose模块
var mongoose =require('mongoose');

var app = express();

//连接数据库
mongoose.connect('mongodb://localhost/danmu_player');
var db=mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',function(callback){
  console.log("connect to danmu_player DB success!!");
});

//
//Mixed = mongoose.Schema.Types.Mixed;
var Schema =mongoose.Schema,
  ObjectID=Schema.objectId;
//-定义一个关于vidoes的模式
var VideoSchema = new Schema({"fenlei":String,"address":String,"name":String});
//-定义一个videos的操作模型 就是一个类class
var VideoModel = mongoose.model('videos',VideoSchema);//参数1 集合名，参数2 模式名

//定义一个danmus的模式
var DanmuSchema= new Schema({"videoID" : String,
  "text" : String,
  color : String,
  size : Number,
  position : Number,
  time : Number});
//定义关于danmus的操作模型
var DamuModel =mongoose.model('danmus',DanmuSchema);

app.set('views', path.join(__dirname, 'views'));
//注册html模板引擎
app.engine('html',ejs.__express);
// view engine setup

app.set('view engine', 'html');//只能找html文件 ejs文件不算会报错 但是ejs的特性在前台还是能用的

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

//设置静态服务访问的路径src="/xx.js"就是引用 项目根目录/public/xx.js
app.use(express.static(path.join(__dirname, 'public')));

//进入后台mainvideo.html页面
app.get('/consoleStart',function(req,res){
  res.render('video/video/mainvideo.html',{
  });
});

//search模糊查找页面
app.get('/search',function(req,res){
  var searchVideoName=req.query.searchVideoName;
  var qs=new RegExp(searchVideoName);
  VideoModel.find({"name":qs},function(err,docs){
    if(err)
    {
      console.error("search错误信息："+err);
    }
    res.render('video/video/selectvideo',{
      docs:docs
    });
  });
});

//Delete中search模糊查找页面
app.get('/searchDelete',function(req,res){
  var searchVideoName=req.query.searchVideoName;
  var qs=new RegExp(searchVideoName);
  VideoModel.find({"name":qs},function(err,docs){
    if(err)
    {
      console.error("searchModify错误信息："+err);
    }
    res.render('video/video/deletevideo',{
      docs:docs
    });
  });
});

//删除deleteVidoe.html页面
app.get('/goVideoDelete',function(req,res){
  VideoModel.find({},function(err,docs){
    if(err)
    {
      console.error("查找错误信息："+err);
    }
    res.render('video/video/deletevideo',{
      title:'videos manage view',
      docs:docs
    });
  });
});

//Modify中search模糊查找页面
app.get('/searchModify',function(req,res){
  var searchVideoName=req.query.searchVideoName;
  var qs=new RegExp(searchVideoName);
  VideoModel.find({"name":qs},function(err,docs){
    if(err)
    {
      console.error("searchModify错误信息："+err);
    }
    res.render('video/video/modifyvideo',{
      docs:docs
    });
  });
});

//进入后台modifyvideo.html页面
app.get('/goVideoModify',function(req,res){
  VideoModel.find({},function(err,docs){
    if(err)
    {
      console.error("查找错误信息："+err);
    }
    res.render('video/video/modifyvideo',{
      title:'videos manage view',
      docs:docs
    });
  });
});

//路由控制交互应用
//查询的video返回初始管理页面
app.get('/videos', function(req, res){
  VideoModel.find({},function(err,docs){
    if(err)
    {
      console.error("查找错误信息："+err);
    }
    res.render('video/video/selectvideo',{
      title:'videos manage view',
      docs:docs
    });
  });
});


//上传添加视频页面
//进入上传准备页面
app.get('/goupload', function(req, res, next) {
  res.render('video/video/addvideo.html', { title: '添加与上传新视频' });
});
//上传文件逻辑
app.post('/uploading', function(req, res) {
  //先获取文本输入框的值
  var videoFenlei="";
  var videoName="";
  var newPath="";
  var form = new formidable.IncomingForm();   //创建上传表单
  form.encoding = 'utf-8';		//设置编辑
  form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;	 //设置上传目录
  form.keepExtensions = true;	 //保留后缀
  form.maxFieldsSize = 2 * 1024 * 1024;   //单个表域申请的最大内存空间，并不是限制文件大小

  //在form.parse解析中上传文件与 向数据库插入添加的视频信息语句
  form.parse(req, function(err, fields, files) {
    //前台enctype='multipart/form-data' 需要解析才能去除文本输入框的值

    if (err) {
      res.locals.error = err;
      res.render('index', { title: err });
      return;
    }

    var extName = '';  //后缀名
    switch (files.fulAvatar.type) {
      case 'video/mp4':
        extName = 'mp4';
        break;
      case 'video/webm':
        extName = 'webm';
        break;
      case 'video/ogg':
        extName = 'ogg';
        break;
      case 'video/wmv':
        extName = 'wmv';
        break;
      case 'video/x-ms-wmv':
        extName = 'wmv';
        break;

    }

    if(extName.length == 0){
      res.locals.error = '暂时只支持 mp4、webm、ogg、wmv格式视频';
      res.render('index', { title: res.locals.error});
      return;
    }

    var avatarName = Math.random() + '.' + extName;
    newPath = form.uploadDir + avatarName;

    fs.renameSync(files.fulAvatar.path, newPath);  //重命名

    console.log("上传结束。。");

    //将分类，地址，标题写入数据库中：
    videoFenlei=fields.videoFenlei;
    videoName=fields.videoName;
    var videoAddress=newPath;
    var videotask =new VideoModel({"fenlei" : videoFenlei,
      "address" : videoAddress,
      "name" : videoName});

    //save是异步执行的，而后面忘了删掉formidable的 redirect跳转语句，然后有两个跳转发生，所以出现了奇怪的bug
    videotask.save(function (err){
      if(err)
      {
        console.log("插入视屏数据失败");
        res.redirect('/video/videos/addvideo.html');
        console.log(err);
      }
      else{
        console.log("插入视屏数据成功");
        res.redirect('/videos');
      }
    });
  });
});

//进入修改页面
app.get('/videos_edite/:id',function(req,res){
  console.log("正在进入修改页面 id:"+req.params.id);
  VideoModel.findById(req.params.id,function(err,doc){
    res.render('videos/edit',{
      title:'修改视频信息',
      video:doc,
      id:doc.id,
      fenlei:doc.fenlei,
      name:doc.name
    });
  });
});

//执行修改功能
//-post 方式用req.body.name获取对象参数
//-get  方式用req.query.name获取对象参数
//-url  方式用req.params.name获取路径中的某字符窜，
app.get('/videosmodify/:id',function(req,res){
  //var videoFenlei=req.body.videoFenlei;
  //var videoName=req.body.videoName;
  //var videoAddress="../src/videos/"+videoName;
  console.log("------------进入修改执行---------");
  var videoFenlei=req.query.upVideoFenlei;
  var videoName=req.query.upVideoName;
  var description=req.query.upDescription;

  VideoModel.update({_id:req.params.id},
    {"fenlei" : videoFenlei,
     "name" : videoName,
    },function(err,doc){
    if(err)
    {
      console.log('update failled');
    }
    else{
      console.log('update success');
      res.redirect('/goVideoModify');
    }
  });
});

//删除选中的视频
app.get('/videosdelete/:id',function(req,res){
  VideoModel.findById(req.params.id,function(err,doc){

    if(!doc) return next(new NotFound('Document not found'));
    var tempPath=doc.address;//.replace(new RegExp(doc.address,"gm"),'\\');
    //删除文件
    fs.unlink(path.join(__dirname,tempPath),function(err){
      if(err)
      {
        console.log("删除视屏文件失败");
        res.render('error',{
          message:"删除视屏文件失败",
          error:err
        });
      }
      else
      {
        console.log("删除视屏文件成功");
        //数据库中删除记录
        doc.remove(function(){
          console.log("删除数据库中video记录");
          res.redirect('/goVideoDelete');
        });
      }
    });

  });
});

//进入播放页面
app.get('/go_videosplay/:id',function(req,res){
  var id=req.params.id;
  var address="";
  console.log('正在进入播放页面:'+id);

  VideoModel.findById(id,function(err,video){
    var tempAddress1=video.address;
    var tempAddress2=tempAddress1.substring(6,tempAddress1.length);
    address=tempAddress2;
    res.render('videoPlayer.html',{
      title:'play video View',
      address:address,
      id:id
    });
  });

});


//保存弹幕
app.post('/danmuSave/:id',function(req,res){
  var str=req.body.danmu;//传递的是字符窜 并不是对象 obj=stringify(str),将字符窜再json成字符窜出问题
  var videoID=req.params.id;
  //判定类型 可用typeof（variable）
  var obj=JSON.parse(str);
  obj["videoID"]=videoID;

  var danmuModel=new DamuModel(obj);
  danmuModel.save(function(err){
    if(err)
    {
      console.log("保存弹幕失败!");
      console.log(err);
    }
    else
    {
      console.log("保存弹幕成功！");
    }
  })
});

//获取弹幕给前端
app.get('/danmuGet/:id',function(req,res){
  var id=req.params.id;
  DamuModel.find({"videoID":id},function(err,docs){
    //先对象转化为JSON字符窜  再转化为JSON对象 才能delete 前后两个对象不一样 一个是object Object 一个是 [object Object] []...数组
    var str=JSON.stringify(docs);
    var obj =JSON.parse(str);

    for(var i=0;i<obj.length;i++)
    {
      delete obj[i].videoID;
      delete obj[i]._id;
      delete obj[i]["__v"];
    }
    res.send(obj);
  });
});

/**
 *
 * 下面都是前台观看视屏的用户
 * **/

//首页地址
app.get('/go',function(req,res){
  VideoModel.find({},function(err,docs){
    if(err)
    {
      console.error("查找错误信息："+err);
    }
    else
    {
      if(docs.length>0)
      {
        //第二种传值方法
        res.locals.videos=docs;
        res.render('video/video/index.html');
      }
      else
      {
        res.render('index.html',{
          title:"找不到任何数据"
        });
      }
    }
  });
});

//前台index脚本中 $.get请求
app.get('/getAllVideos',function(req,res){
  VideoModel.find({},function(err,docs){
    if(err)
    {
      console.error("查找错误信息："+err);
    }
    else
    {
      if(docs.length>0)
      {
        res.send(docs);
      }
      else
      {
        res.render('index.html',{
          title:"找不到任何数据"
        });
      }

    }

  });
});


app.get('/userSearch',function(req,res){
  console.log("进入userSearch");
  var searchVideoName=req.query.searchVideoName;
  var qs=new RegExp(searchVideoName);
  VideoModel.find({"name":qs},function(err,docs){
    if(err)
    {
      console.error("search错误信息："+err);
    }
    res.render('video/video/playindex.html',{
      title:"",
      docs:docs
    });
  });
});


//根据用户点击分类 查询的video 路由 跳转到playindex.html
app.get('/searchFenlei/all', function(req, res){

  console.log("分类不为所有，全查询");
  VideoModel.find({},function(err,docs){
    if(err)
    {
      console.error("查找错误信息："+err);
    }
    res.render('video/video/playindex',{
      title:'',
      docs:docs
    });
  });
});

app.get('/searchFenlei', function(req, res){

    console.log("分类不为空，按分类查询");
    VideoModel.find({"fenlei":fenlei},function(err,docs){
      if(err)
      {
        console.error("查找错误信息："+err);
      }
      res.render('video/video/playindex',{
        title:'',
        docs:docs
      });
    });
});
app.get('/searchFenlei/fanju', function(req, res) {
  VideoModel.find({"fenlei": "番剧"}, function (err, docs) {
    if (err) {
      console.error("查找错误信息：" + err);
    }
    else {
      res.render('video/video/playindex', {
        title: "番剧",
        docs: docs
      });
    }
  });
});

app.get('/searchFenlei/donghua', function(req, res){
  VideoModel.find({"fenlei": "动画"}, function (err, docs) {
    if (err) {
      console.error("查找错误信息：" + err);
    }
    else {
      res.render('video/video/playindex', {
        title: "动画",
        docs: docs
      });
    }
  });
});

app.get('/searchFenlei/yinyue', function(req, res){
  VideoModel.find({"fenlei": "音乐"}, function (err, docs) {
    if (err) {
      console.error("查找错误信息：" + err);
    }
    else {
      res.render('video/video/playindex', {
        title: "音乐",
        docs: docs
      });
    }
  });
});

app.get('/searchFenlei/youxi', function(req, res){
  VideoModel.find({"fenlei": "游戏"}, function (err, docs) {
    if (err) {
      console.error("查找错误信息：" + err);
    }
    else {
      res.render('video/video/playindex', {
        title: "游戏",
        docs: docs
      });
    }
  });
});

app.get('/searchFenlei/yingshi', function(req, res){
  VideoModel.find({"fenlei": "影视"}, function (err, docs) {
    if (err) {
      console.error("查找错误信息：" + err);
    }
    else {
      res.render('video/video/playindex', {
        title: "影视",
        docs: docs
      });
    }
  });
});

//user中search模糊查找页面
app.get('/uerSearch',function(req,res){
  console.log("uerSearch");
  var searchVideoName=req.query.searchVideoName;
  console.log("uerSearchVideoName:"+searchVideoName);
  var qs=new RegExp(searchVideoName);
  VideoModel.find({"name":qs},function(err,docs){
    console.log("模糊结果docs:"+docs);
    if(err)
    {
      console.error("searchModify错误信息："+err);
    }
    res.render('video/video/playindex.html',{
      title:"",
      docs:docs
    });
  });
});


//根据引擎找.html后缀的文件，没有就没有找到，所以当初才会因为只有views/error.ejs才 报错找不到views 其实是早不到error.html和index.html
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//设置侦听端口
app.set('port', process.env.PORT || 3001);

//启动服务
http.createServer(app).listen(app.get('port'),function(){
  console.log('Express Server Listen On Port '+app.get('port'));
});
module.exports = app;

var express = require('express');
var router = express.Router();

////上传文件引用
//var formidable = require('formidable');
//var fs = require('fs');
//var TITLE = 'formidable上传示例';
//var AVATAR_UPLOAD_FOLDER = '/src/videos/';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

////进入上传准备页面
//router.get('/goupload', function(req, res, next) {
//  console.log("正在进入上传页面");
//  res.render('videos/upload', { title: '添加与上传新视频' });
//});
////上传文件逻辑
//router.post('/uploading', function(req, res) {
//
//  var form = new formidable.IncomingForm();   //创建上传表单
//  form.encoding = 'utf-8';		//设置编辑
//  form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;	 //设置上传目录
//  form.keepExtensions = true;	 //保留后缀
//  form.maxFieldsSize = 2 * 1024 * 1024;   //单个表域申请的最大内存空间，并不是限制文件大小
//  form.parse(req, function(err, fields, files) {
//
//    if (err) {
//      res.locals.error = err;
//      res.render('index', { title: TITLE });
//      return;
//    }
//
//    var extName = '';  //后缀名
//    switch (files.fulAvatar.type) {
//      case 'video/mp4':
//        extName = 'mp4';
//        break;
//      case 'video/webm':
//        extName = 'webm';
//        break;
//      case 'video/ogg':
//        extName = 'ogg';
//        break;
//      //case 'image/x-png':
//      //  extName = 'png';
//      //  break;
//    }
//
//    if(extName.length == 0){
//      res.locals.error = '暂时只支持 mp4、webm、ogg格式视频';
//      res.render('index', { title: TITLE });
//      return;
//    }
//
//    var avatarName = Math.random() + '.' + extName;
//    var newPath = form.uploadDir + avatarName;
//
//    var oldPathName=req.body.name;
//
//    console.log("旧名字："+oldPathName);
//    console.log("新名字："+newPath);
//    fs.renameSync(files.fulAvatar.path, newPath);  //重命名
//
//    //将分类，地址，标题写入数据库中：
//    var videoFenlei=req.body.videoFenlei;
//    var videoName=req.body.videoName;
//    var videoAddress=newPath;
//    console.log("new vidoe address:"+videoAddress+'\n传递参数个数：'+Object.keys(req.body).length+'\n post /tasks have been received\nnew videoname='+videoName);
//    var videotask =new VideoModel({"fenlei" : videoFenlei,
//      "address" : videoAddress,
//      "name" : videoName});
//
//    videotask.save(function (err){
//      if(err)
//      {
//
//        res.redirect('/videos/new');
//        console.log(err);
//      }
//      else{
//
//        res.redirect('/videos');
//        console.log("Save New Task OK!!");
//      }
//    });
//
//  });
//
//  res.locals.success = '上传成功';
//  //res.render('index', { title: TITLE });
//});

module.exports = router;

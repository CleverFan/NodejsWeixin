module.exports = function(app){
  /* GET home page. */
  app.get('/', function(req, res, next) {
    res.render('success',{issuccess:"success"})
  });
  app.get('/interface',function(req,res){
    //设置token
    var token="weixin";

    //获得微信服务器发来的参数
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var echostr   = req.query.echostr;
    var nonce     = req.query.nonce;

    //按字典进行排序
    var oriArray = new Array();
    oriArray[0] = nonce;
    oriArray[1] = timestamp;
    oriArray[2] = token;
    oriArray.sort();

    //使用sha1进行加密
    var original = oriArray.join('');
    var jsSHA = require('jssha');
    var shaObj = new jsSHA("SHA-1", 'TEXT');
    shaObj.update(original);
    var scyptoString=shaObj.getHash('HEX');

    //判断签名是否相同
    if(signature == scyptoString){
      console.log("true");
      //验证成功
      res.status(200).send(echostr);
    } else {
      console.log("false");
      return false;
    }
  });

  app.post('/interface',function (req,res,next) {
    var post_data="";

    req.on("data",function(data){post_data=data;});
    req.on("end",function(){
      var xmlStr=post_data.toString('utf-8',0,post_data.length);
      //解析消息代码
      var xml=require('node-xml');
      // 定义解析存储变量
      var ToUserName="";
      var FromUserName="";
      var CreateTime="";
      var MsgType="";
      var Content="";
      var tempName="";
      //开始解析消息
      var parse=new xml.SaxParser(function(cb){
        cb.onStartElementNS(function(elem,attra,prefix,uri,namespaces){
          tempName=elem;
        });
        cb.onCharacters(function(chars){
          chars=chars.replace(/(^\s*)|(\s*$)/g, "");
          if(tempName=="CreateTime"){
            CreateTime=chars;
          }
        });
        cb.onCdata(function(cdata){
          if(tempName=="ToUserName"){
            ToUserName=cdata;
          }else if(tempName=="FromUserName"){
            FromUserName=cdata;
          }else if(tempName=="MsgType"){
            MsgType=cdata;
          }else if(tempName=="Content"){
            Content=cdata;
          }
          console.log(tempName+":"+cdata);
        });
        cb.onEndElementNS(function(elem,prefix,uri){
          tempName="";
        });
        cb.onEndDocument(function(){
          //按收到的消息格式回复消息
          CreateTime=parseInt(new Date().getTime() / 1000);
          var msg="";
          if(MsgType=="text"){
            msg="谢谢关注,你说的是:"+Content;
            //组织返回的数据包
            var sendMessage=' ' +
                '<xml>' +
                '<ToUserName><![CDATA['+FromUserName+']]></ToUserName>' +
                '<FromUserName><![CDATA['+ToUserName+']]></FromUserName>' +
                '<CreateTime>'+CreateTime+'</CreateTime>' +
                '<MsgType><![CDATA[text]]></MsgType>' +
                '<Content><![CDATA['+msg+']]></Content>' +
                '</xml>';
            res.send(sendMessage);
          }
        });
      });
      parse.parseString(xmlStr);
    });
  });

}

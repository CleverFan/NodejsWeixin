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
}

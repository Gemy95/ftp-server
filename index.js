var express = require("express");
var app  = express();

var bodyparser = require("body-parser");

app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json());

var PromiseFtp = require('promise-ftp');
var ftp = new PromiseFtp();
var fs = require("fs");

//listAll directories api
app.get("/listAllDirectories",(req,res)=>{
ftp.connect({host: 'localhost', user: 'swd', password: 'swd'})
.then(function (serverMessage) {       
  //console.log('Server message: '+serverMessage);
  return ftp.list(__dirname);
}).then(function (list) {
  //console.log(list);
   ftp.end();
   return res.status(200).json({message:"success , list files",files:list});
}).catch((err)=>{
   return res.status(400).json({message:"failed , list files"}); 
})
})


//single file upload
app.post("/upload",(req,res)=>{
ftp.connect({host: 'localhost', user: 'swd', password: 'swd'})
.then(function (serverMessage) {
  //console.log("serverMessage="+serverMessage)
  return ftp.put(__dirname+'/foo.js', __dirname+'/main/foo3.js');
}).then(function (afterUpload) {
  //console.log("afterUpload="+afterUpload)
   ftp.end();
  return res.status(200).json({message:"success , upload file"}); 
}).catch((err)=>{
  console.log("error="+err)
  return res.status(400).json({message:"failed , upload file"}); 
})
});


//download api
app.get("/download",(req,res)=>{
  ftp.connect({host: 'localhost', user: 'swd', password: 'swd'})
  .then(function (serverMessage) {
  return ftp.get(__dirname+'/foo.js');  
  }).then(function (stream) {
    return new Promise(function (resolve, reject) {
      stream.once('close', resolve);
      stream.once('error', reject);
      stream.pipe(fs.createWriteStream(__dirname+'/foo2.js'));
      console.log("from success json")
      ftp.end();
      return res.status(200).json({message:"success , file downloaded"});
    })
  }).catch((err)=>{
    return res.status(400).json({message:"failed , file downloaded"});
  });
})


//upload multi files api
app.post("/uploadMulti",(req,res)=>{
  ftp.connect({host: 'localhost', user: 'swd', password: 'swd'})
  .then(function (serverMessage) {
    return new Promise(function(resolve, reject){
      var chain = Promise.resolve();
      ['test1.js','test2.js'].forEach(function(file, i, arr){
        chain = chain.then(() => {
          return ftp.put(__dirname+'/main/' + file, __dirname+'/main/' + file)
        })
        .catch((err) => { console.log(err.toString()) })  
        if(i === arr.length - 1)
          chain.then(() => resolve())
      })
    }).then(() => {
      ftp.end()
      return res.status(200).json({message:"success , upload multi file"}); 
    })
  }).catch((err)=>{
    console.log("err"+err)
    return res.status(400).json({message:"failed , multi file upload"});
  });
})


   

app.listen("6000",()=>{
 console.log("server is listening on port 6000");
})

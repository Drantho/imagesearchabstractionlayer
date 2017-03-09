var http = require('http');
require('dotenv').config();
var express = require('express');
var mongojs = require("mongojs");
var db = mongojs(process.env.CONNECTION_STRING, ['imageSearch']);


var router = express();
var server = http.createServer(router);
var Bing = require('node-bing-api')({ accKey: process.env.API_KEY });

router.get('/', function (req, res, next) {
  res.type('text/html');
  res.send('Enter /api then a search term(?search=) and a page (&page=#) in the URL to search photos.');
});

router.get('/searchhistory', function (req, res, next) {

  db.imageSearch.find(function (err, searches) {
        if (err) {
            res.send(err);
        }
        res.json(searches);
    });

});

router.get('/api/imagesearch/:search', function (req, res, next) {
  
  var searchInfo = {"Search String" : req.params.search, "Date" :  (new Date()).toGMTString()};
  
  db.imageSearch.save(searchInfo, function (err, result) {
     if (err) {
      res.send(err);
     }
    });
  
  var offset = 0;
  
  if(req.query.offset !== null && req.query.offset !== undefined){
    offset = req.query.offset;
  }
  
  Bing.images(req.params.search, {
  top: 10,   // Number of results (max 50) 
  skip: offset    // Skip first 3 result 
  }, function(err, response, body){
    if(err){
      console.log(err);
    }
    
    var resultArr = [];
    
    for(var i=0; i<body.value.length; i++){
          var resultObj = {"snippet" : body.value[i].name, "url" : body.value[i].contentUrl, "thumbnail": body.value[i].thumbnailUrl, "conext": body.value[i].hostPageDisplayUrl};
          resultArr.push(resultObj);
    }
    
    res.json(resultArr);
  });
  
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});

var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
var helpers = require('./http-helpers');
var url = require('url');
// require more modules/folders here!
// 'Content-Type': "text/html"


exports.handleRequest = function (req, res) {
  var method = methods[req.method];
  method ? method(req, res) : helpers.sendResponse(res, null, 404);
  //res.end(archive.paths.list);
};

var getFile = function(req, res) {
  var fromFile;
  var type;
  var path = url.parse(req.url).pathname;

  if (path === '/'){
    path = '/index.html';
  }
  if (path.slice(0,4) === '/www'){
    // fromFile = fs.createReadStream('./archives/sites' + path + '.html');
    fromFile = fs.createReadStream('./archives/sites' + path);
    type = 'html';
  } else {
    fromFile = fs.createReadStream(__dirname + '/public' + path);
    type = path.split(".")[1];
  }
  // console.log('fromFile');
  // console.log(fromFile);
  fromFile.on('open', function(){
    helpers.headers["Content-Type"] = "text/" + type;
    helpers.sendResponse(res, 200);
    fromFile.pipe(res);
  });

  fromFile.on('error', function(err){
    helpers.sendResponse(res,404);
    res.end();
  });
};

var postUrl = function(req, res){
  var requestedURL = '';
  req.on('data', function(data){
    requestedURL += data;
  });
  req.on('end', function(){
    if(archive.isUrlInList(requestedURL)){
      if(archive.isURLArchived(requestedURL)){
        //redirect to site local file
      } else {
        //redirect to loading.html
      }
    } else {
      archive.addUrlToList(requestedURL);
      //redirect to loading
    }
  });
  //check database for this url
  //if exists -> reroute to get url for that file
  //else add url to database and reroute to loading.html

}

var methods = {
  'GET': getFile,
  'POST': postUrl
};

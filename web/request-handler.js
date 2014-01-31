var path = require('path');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var archive = require('../helpers/archive-helpers');
var helpers = require('./http-helpers');

exports.handleRequest = function (req, res) {
  var method = methods[req.method];
  method ? method(req, res) : helpers.sendResponse(res, null, 404);
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
  var body = '';
  req.on('data', function(data){
    body += data;
  });
  req.on('end', function(){
    queryObj = qs.parse(body);
    var requestedURL = queryObj.url;
    processPostRequestLogic(req, res, requestedURL);
  });
}

var processPostRequestLogic = function(req, res, requestedURL) {
  //Is the requested url in the list
  archive.isUrlInList(requestedURL, function(found) {
    if(found) {
      //If the requested url archived
      archive.isURLArchived(requestedURL, function(archived) {
        if(archived) {
          //Redirect to site data file
          res.writeHead(302, {'Location': '/' + requestedURL});
          res.end();
        } else {
          //Redirect to loading.html
          res.writeHead(302, {'Location': '/loading.html'});
          res.end();
        }
      });
    } else {
      //Add it to the list and when done, redirect to loading.html
        archive.addUrlToList(requestedURL, function() {
        //Redirect to loading.html
        res.writeHead(302, {'Location': '/loading.html'});
        res.end();
      });
    }
  });
};

var methods = {
  'GET': getFile,
  'POST': postUrl
};
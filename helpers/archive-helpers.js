var fs = require('fs');
var path = require('path');
var request = require('request');

/* You will need to reuse the same paths many times over in the course of this sprint.
  Consider calling this function in `request-handler.js` and passing in the necessary
  directories/files. This way, if you move any files, you'll only need to change your
  code in one place! Feel free to customize it in any way you wish.
*/
var encoding = {'encoding':'utf8'};

exports.paths = {
  'siteAssets' : path.join(__dirname, '../web/public'),
  'archivedSites' : path.join(__dirname, '../archives/sites'),
  'list' : path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for jasmine tests, do not modify
exports.initialize = function(pathsObj){
  for(var type in pathsObj) {
    // Check that the type is valid
    if (exports.paths[type] && pathsObj.hasOwnProperty(type)) {
      exports.paths[type] = pathsObj[type];
    }
  }
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

//Read the file sites.txt and return and array of the stored filenames
exports.readListOfUrls = function(cb){
  fs.readFile(exports.paths['list'], encoding, function(err, data){
    var stringData = data.toString();
    cb(stringData.split('\n'));
  });
};

//If url is in list -> cb(url), if not cb(false)
exports.isUrlInList = function(requestedURL, cb){
  var result = false;
  exports.readListOfUrls(function(arrayOfUrls) {
    for (var i = 0; i < arrayOfUrls.length; i++) {
      if(arrayOfUrls[i] === requestedURL){
        result = requestedURL;
      }
    }
    cb(result);
  });
};

exports.addUrlToList = function(requestedURL, cb) {
  var newSiteName = requestedURL + '\n';
  fs.appendFile(exports.paths['list'], newSiteName, encoding, function(err, data) {
    cb();
  });
};

//Read the archive directory, if file found, cb(url), if not cb(false)
exports.isURLArchived = function(requestedURL, cb){
  var result = false;
  fs.readdir(exports.paths['archivedSites'], function(err, files) {
    for (var i = 0; i < files.length; i++) {
      if(files[i] === requestedURL){
        result = requestedURL;
      }
    }
    cb(result);
  });
};

exports.downloadUrls = function(arrayOfUrls){
  console.log('downloading... please wait');
  for (var i = 0; i < arrayOfUrls.length; i++) {
    request('http://' + arrayOfUrls[i], function(err, response, body){
      console.log(arrayOfUrls[i]);
      console.log(body);
      if(!err && response.statusCode === 200){
        var fromFile = fs.createReadStream(body);
        var newFile = fs.createWriteStream(arrayOfUrls[i]);
        fromFile.pipe(newFile);
      }
    });
  }
};







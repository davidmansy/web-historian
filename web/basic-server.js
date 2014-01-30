var http = require("http");
var handler = require("./request-handler");
var helpers = require('./http-helpers');

var port = 8080;
var ip = "127.0.0.1";
var server = http.createServer(function(request, response){

  if(request.method === 'GET' || request.method === 'POST'){
    console.log('url');
    console.log(request.url);
    handler.handleRequest(request,response);
  }
  else {
    helpers.sendResponse(response, null, 404);
  }
});

console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);


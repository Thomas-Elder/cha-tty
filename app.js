
var http = require('http');
var servers = require('./server/server');

var port = process.env.PORT || 8888;
var server = new servers.Server(http);

server.start(port);
server.run();
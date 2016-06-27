// Setup basic express server
var express = require('express');
var socket_io = require('socket.io');

exports.Server = (function(){
  
  // Constructor
  function Server(http){
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socket_io(this.server);
    
    this.app.use(express.static(__dirname + '/../public'));
  }
  
  // Set port number and start listening
  Server.prototype.start = function(port){
    this.server.listen(port);
    console.log('Listening on port:', port);
  }
  
  // Set up socket listeners and emitters
  Server.prototype.run = function(){
    // Keep track of number of users
    var numUsers = 0;

    this.io.on('connection', function (socket) {
      var addedUser = false;

      // New message, broadcast the message and username
      socket.on('new message', 
        function (data) {
          socket.broadcast.emit('new message', 
            {
              username: socket.username,
              message: data
          });
      });

      // A new user was added, store their name, and let everyone know
      socket.on('add user', 
        function (username) {
          if (addedUser) return;

          socket.username = username;
          ++numUsers;
          addedUser = true;
          socket.emit('login', 
            {
              numUsers: numUsers
          });

          socket.broadcast.emit('user joined', 
            {
              username: socket.username,
              numUsers: numUsers
          });
      });

      // User is typing, let everyone know
      socket.on('typing', 
        function () {
          socket.broadcast.emit('typing', 
            {
              username: socket.username
          });
      });

      // User has stopped typing
      socket.on('stop typing', 
        function () {
          socket.broadcast.emit('stop typing', 
            {
              username: socket.username
          });
      });

      // Let everyone know user has left the building
      socket.on('disconnect', 
        function () {

          if (addedUser) {
            --numUsers;
          }

          socket.broadcast.emit('user left', 
            {
              username: socket.username,
              numUsers: numUsers
            });
      });
    });
  }
  
  // Close the server
  Server.prototype.stop = function(){
    this.server.close();
    console.log('Stopped listening');
  }
  
  return Server;
})();
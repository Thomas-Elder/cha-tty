// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

exports.server = function(port){
 
  server.listen(port, function () {
    console.log('Server listening at port %d', port);
  });

  app.use(express.static(__dirname + '/public'));

  // Keep track of number of users
  var numUsers = 0;

  io.on('connection', function (socket) {
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

          socket.broadcast.emit('user left', 
            {
              username: socket.username,
              numUsers: numUsers
          });
        }
    });
  });
};
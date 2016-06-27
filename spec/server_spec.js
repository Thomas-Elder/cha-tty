'use strict';

var io_client = require('socket.io-client');
var request = require('request');
var async = require('async');

// Server set up
var http = require('http');
var app = require('express')();
var servers = require('../server/server');

describe('Server',
  function(){
    
  // We're using two sockets, because when a socket emits an event,
  // like 'new message' or 'add user', the server then broadcasts that
  // event on to every other socket. So to test events are being faithfully
  // broadcast, we need a receiving client socket. 
  var socket_emit;
  var socket_rcv;
  
  var server = new servers.Server(http, app);
  var port = 8881;
  var url = 'http://localhost:' + port;
    
  beforeEach(
    function(done){
      
      console.log('Starting the server...');
      server.start(port);
      server.run();
      console.log('Started server.');
      
      console.log('Attempting to connect... ');
      socket_emit = io_client.connect(url,
        {
          'reconnection delay':0,
          'reopen delay':0,
          'force new connection':true
      }); 
      
      socket_rcv = io_client.connect(url,
        {
          'reconnection delay':0,
          'reopen delay':0,
          'force new connection':true
      });
      
      socket_emit.on('connect',
        function(){
          console.log('socket_emit connected.');
      });

      socket_rcv.on('connect',
        function(){
          console.log('socket_emit connected.');
      });
      
      done();
  });
  
  afterEach(
    function(done){
      if(socket_emit.connected){
        console.log('socket_emit disconnecting... ');
        socket_emit.disconnect();
      }else{
        console.log('socket_emit already disconnected.');
      }
      
      if(socket_rcv.connected){
        console.log('socket_rcv disconnecting... ');
        socket_rcv.disconnect();
      }else{
        console.log('socket_rcv already disconnected.');
      }
      
      server.stop();
      done();
  });
  
  describe('connection test',
    function(){
      
      it('should return OK statusCode to a default get request',
        function(done){
          request.get(
            {
              'url':url
            },
            function(err, res){

              if(res === undefined)
                throw new Error('Server not responding.');
              
              expect(res.statusCode).toBe(200);
              done();
          });
      });
  });
  
  describe('event tests',
    function(){
    
      it('should broadcast a "new message" event when a "new message" event is emitted by the client.',
        function(done){
          socket_emit.emit('new message', 'test');
          socket_rcv.on('new message', 
            function(data){
              expect(data.message).toEqual('test');
              done();
          });
      });
      
      it('should broadcast a "user joined" event when a "add user" event is emitted by the client.',
        function(done){
          socket_emit.emit('add user', 'Tom');
          socket_rcv.on('user joined', 
            function(data){
              expect(data.username).toEqual('Tom');
              done();
          });
      });
      
      it('should broadcast a "typing" event when a "typing" event is emitted by the client.',
        function(done){
          socket_emit.emit('typing');
          socket_rcv.on('typing', 
            function(){
              done();
          });
      });
      
      it('should broadcast a "stop typing" event when a "stop typing" event is emitted by the client.',
        function(done){
          socket_emit.emit('stop typing');
          socket_rcv.on('stop typing', 
            function(){
              done();
          });
      });
      
      it('should broadcast a "user left" event when a user leaves the chat.',
        function(done){
          
          socket_emit.disconnect();
          socket_rcv.on('user left', 
            function(){
              done();
          });
      });
  });
});
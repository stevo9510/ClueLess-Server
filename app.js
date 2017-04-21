// Main Node File
// Clueles Game Server


var io = require('socket.io')(process.env.PORT || 3000);

var express = require('express')


// Server Initialization Log Message
console.log('Server listening on port 3000.');


// Sockets
io.on('connection', function(socket){
  console.log('User connected.');


  // New User Broadcast Message Example
  socket.broadcast.emit('A New User Joined!')
  console.log('Message Broadcast: A New User Joined!')


  // User Joins Game
  socket.on('joinGame', function(data) {
    console.log('');
  });




  // User Quits Game
  socket.on('quitGame', function(data) {
    console.log();
  });

})



// Redirect serve index.html
app.get('/',function(req, res){
  res.sendfile(__dirname + '/site/index.html');

});

// Main Node File
// Clueless Game Server

var express = require('express')
var app = express()

server = require('http').createServer(app),
port = process.env.PORT || 3000,
io = require('socket.io')(server);


// Server Start
server.listen(port);
console.log('Server listening on port 3000.');


// Redirect serve index.html
app.get('/',function(req, res){
  res.sendFile(__dirname + '/site/index.html');
});


// Sockets
io.on('connection', function(socket){
  console.log('User connected.');


  // New User Broadcast Message Example
  socket.broadcast.emit('A New User Joined!')
  console.log('Message Broadcast: A New User Joined!')


  // User Joins Game
  socket.on('say hi', function(data) {
    console.log('they said hi.');
  });


  // User Quits Game
  socket.on('quitGame', function(data) {
    console.log();
  });

});

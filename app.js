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


  // User Joins Game
  socket.on('joinGame', function(data) {
    // log to server console
    console.log('Log: A User has joined game.');

    // broadcast message to all clients
    socket.broadcast.emit('Broadcast: A User has joined game.')
  });


  // User Makes Move
  socket.on('makeMove', function(data) {
    console.log('');

  });


  // User Disproves Suggestion
  socket.on('disproveSuggestion', function(data) {
    console.log('');

  });


  // User Quits Game
  socket.on('quitGame', function(data) {
    console.log('');

  });

  // User Disconencts
  socket.on('disconnect', function(data) {
    console.log('A user disconencted.');

  });

});

// loading requirements for websockets using socket.io
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

// data to be stored and shared
let data = {
  'posX': 0,
  'posY': 0,
  'orientation': 0,
  'tilt': 0
}

// easy access to mp3 files and pictures in node.js
var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

// default response for first handshake
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// regular data broadcast every 10 ms
setInterval(function() {
  io.sockets.emit('update', data);
}, 10);

// receiving data from clients
io.on('connection', function(socket){
  // receiving position
  socket.on('position', function(pos){
  	data.posX = pos.x;
    data.posY = pos.y;
  });
  // receiving orientation
  socket.on('orientation', function(orientation){
  	data.orientation = orientation;
  });
  // receiving tilt
  socket.on('tilt', function(tilt){
    data.tilt = tilt;
  });
});

// enable the server on port 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});
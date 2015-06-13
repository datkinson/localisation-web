// setup
var express = require('express');
var app = express();

// configuration
app.use(express.static(__dirname + '/public'));

// application
app.get('*', function(req, res) {
	res.sendfile('./public/index.html');
});

// start
var server = app.listen(9000);
console.log('App listening on port 9000');
var io = require('socket.io').listen(server);
console.log('socket.io attached to app http server');

// sockets management

io.sockets.on('connection', function (socket) {
    console.log('A new user connected!');
    socket.emit('info', { msg: 'The world is round, there is no up or down.' });
	redirectClient('contact', socket);
});

function redirectClient(location, socket) {
	socket.emit('location', location);
};
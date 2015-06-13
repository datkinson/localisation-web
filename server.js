// setup
var express = require('express');
var app = express();

var clients = [];

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
	clients[socket.id] = {
		'id': socket.id,
		'status': 'connected',
		'socket': socket
	};
	
	socket.on('disconnect', function () {
		console.log('A user disconnected');
		clients[socket.id].status = 'disconnected';
		delete clients[socket.id];
	});

    socket.emit('info', { msg: 'The world is round, there is no up or down.' });
	redirectClient('contact', socket);
});



// helper functions
function redirectClient(location, socket) {
	socket.emit('location', location);
};

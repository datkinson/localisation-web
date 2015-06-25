// setup
var express = require('express');
var app = express();

var database = require('./database/database');

// create in-memory array of connected clients
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
		'mode': 'user',
		'fingerprint': socket.handshake.query.fingerprint,
		'socket': socket
	};
	database.Client.create({
		name: 'Client',
		mode: 'user',
		socket: socket.id,
		fingerprint: socket.handshake.query.fingerprint
	});
	console.log(clients[socket.id]);
	
	socket.on('disconnect', function () {
		console.log('A user disconnected');
		clients[socket.id].status = 'disconnected';
		delete clients[socket.id];
	});
	
	socket.on('requestMode', function(mode) {
		console.log('client requested new mode of: '+mode);
		if(mode !== clients[socket.id].mode) {
			clients[socket.id].mode = mode;
			socket.emit('changeMode', mode);
		}
	});
	// admin client requests user redirect
	socket.on('requestRedirect', function(location) {
		if(clients[socket.id].mode === 'admin') {
			var key;
			for (key in clients) {
				if(clients[key].mode !== 'admin') {
					redirectClient(location, clients[key]);
				}
			}
		}
	});
	
	// user client submits a comment
	socket.on('submitComment', function(comment) {
                database.Comment.create({
                        name: comment.name,
                        text: comment.text,
                        socket: socket.id
                }).then(function() {
					distributeComments();
				});
	});
	
	// client request comment
	socket.on('getComment', function(query) {
		if(query === 'all') {
			database.Comment.findAll().then(function(results) {
		var allComments = [];
		results.forEach(function(item) {
			allComments.push({
				id: item.dataValues.id,
				name: item.dataValues.name,
				text: item.dataValues.text
			});
		});
		socket.emit('allComments', allComments);
	});
		}
	});

    socket.emit('info', { msg: 'The world is round, there is no up or down.' });
//	redirectClient('contact', socket);
});

// helper functions
function redirectClient(location, client) {
	client.socket.emit('location', location);
};

function distributeComments() {
	database.Comment.findAll().then(function(results) {
		var allComments = [];
		results.forEach(function(item) {
			allComments.push({
				id: item.dataValues.id,
				name: item.dataValues.name,
				text: item.dataValues.text
			});
		});
		var key;
		for (key in clients) {
			clients[key].socket.emit('allComments', allComments);
		}
	});
};
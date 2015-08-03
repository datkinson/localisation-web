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
var server = app.listen(9009);
console.log('App listening on port 9009');
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
    
    // check if connected clients fingerprint exists in database
    database.Client.findAll({
      where: {
        fingerprint: socket.handshake.query.fingerprint
      }
    }).then(function(result) {
        
        // if fingerprint does not exist, add it to the database
        if(result.length === 0) {
            database.Client.create({
                name: 'Client',
                mode: 'user',
                socket: socket.id,
                fingerprint: socket.handshake.query.fingerprint
            });
        } else {
            
            // fingerprint exists, now update the socket object
            console.log('updating user');
            database.Client.update(
				{
              		socket: socket.id,
            	}, {
              		where: {
                		fingerprint: socket.handshake.query.fingerprint
              		}
            	}
			).then(function(after){
				console.log('updating mode of connection: ', result[0].dataValues.socket);
				// ensure the connected user has the correct mode set
				socket.emit('changeMode', result[0].dataValues.mode);
			});
        }
    });
	
	socket.on('disconnect', function () {
		console.log('A user disconnected');
		clients[socket.id].status = 'disconnected';
		delete clients[socket.id];
	});
	
	socket.on('requestMode', function(mode) {
		console.log('client requested new mode of: '+mode);
		if(mode !== clients[socket.id].mode) {
			clients[socket.id].mode = mode;
			database.Client.update(
				{
              		mode: clients[socket.id].mode,
            	}, {
              		where: {
                		socket: socket.id
              		}
            	}
			);
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
	
	// user client submits a log
	socket.on('submitLog', function(log) {
		console.log(log);
                database.Log.create({
                        mac: log.mac,
                        name: log.name,
                        client: log.client,
                        signal: log.signal,
                        socket: socket.id
                }).then(function() {
					distributeLogs();
				});
	});
	
	// client request logs
	socket.on('getLogs', function(query) {
		if(query === 'all') {
			database.Log.findAll({limit: 10, order: 'date_created DESC'}).then(function(results) {
		var allLogs = [];
		results.forEach(function(item) {
			allLogs.push({
				id: item.dataValues.id,
				name: item.dataValues.name,
				mac: item.dataValues.mac,
				client: item.dataValues.client,
				signal: item.dataValues.signal,
				date_created: item.dataValues.date_created
			});
		});
		socket.emit('allLogs', allLogs);
	});
		}
	});

    socket.emit('info', { msg: 'The world is round, there is no up or down.' });
//	redirectClient('contact', socket);
});

// helper functions

function distributeLogs() {
	logsToSend = [];
	database.Log.findAll(
		{
			limit: 15,
			order: 'date_created DESC'
		}
	).then(function(results){
		results.forEach(function(item) {
			logsToSend.push(
				{
					id: item.dataValues.id,
					name: item.dataValues.name,
					mac: item.dataValues.mac,
					client: item.dataValues.client,
					signal: item.dataValues.signal,
					date_created: item.dataValues.date_created
				}
			);
		});
	io.sockets.emit('allLogs', logsToSend);
	});
};


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

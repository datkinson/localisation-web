var Sequelize = require('sequelize');
var sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },

  // SQLite only
  storage: 'database/database.sqlite'
});

// initialise database model
var Client = sequelize.define('client', {
	name: {
		type: Sequelize.STRING
	},
	mode: {
		type: Sequelize.STRING
	},
	socket: {
		type: Sequelize.STRING
	},
	fingerprint: {
		type: Sequelize.STRING
	}
}, {
	freezeTableName: true // Model tableName will be the same as the model name
});

var Comment = sequelize.define('comment', {
	name: {
		type: Sequelize.STRING
	},
	text: {
		type: Sequelize.STRING
	},
	socket: {
		type: Sequelize.STRING
	}
});

// create data structures
Client.sync();
Comment.sync();

module.exports = {
	Client: Client,
	Comment: Comment
};

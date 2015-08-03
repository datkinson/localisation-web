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
var Log = sequelize.define('log', {
  mac: {
    type: Sequelize.STRING
  },
  name: {
    type: Sequelize.STRING
  },
  client: {
    type: Sequelize.STRING
  },
  signal: {
    type: Sequelize.STRING
  },
  date_created: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  freezeTableName: true
});
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

// create data structures
Client.sync();
Log.sync();

module.exports = {
	Client: Client,
  Log: Log
};

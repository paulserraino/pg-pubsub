var pg = require('pg');
var fs = require('fs');
var path = require('path');
var setupSQL = fs.readFileSync(path.join(__dirname, 'setup.sql'));

var config = {
	connectionString: 'postgres://localhost/test'
};

module.exports = function (cb) {
	pg.connect(config.connectionString, function (error, client) {
		if (error) throw error;
		client.query(setupSQL.toString(), function (error) {
			if (error) throw error;
			cb(client);
		});
	});
};

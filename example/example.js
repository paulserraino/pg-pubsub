var pg = require('pg')
var PGEvents = require('../')
var connect = require('../tests/connect')

connect(function (client) {

	var pge = PGEvents(client);
	pge.subscribe('users', function (err) {
		if (err) throw err;
	});

	pge.on('users:insert', function (msg) {
		console.log('msg ', msg);
	});

	pge.on('users:update', function (msg) {
		console.log('msg ', msg);
	});

	pge.on('users:delete', function (msg) {
		console.log('msg ', msg);
	});

});


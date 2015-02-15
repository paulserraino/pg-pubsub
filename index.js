var pg = require('pg')
//PGEvents = require('pg-events')

pg.connect('postgres://paulserraino@localhost/test', function (err, client, done) {
	if (err) throw err;
	console.log('connected');
	//var events = PGEvents(client);

	//events.listen('users')
	//events.on('users:update', fn);
	//events.on('users:insert', fn);
	//events.on('users:delete', fn);


});

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

function PGEvents (client) {
	if (!(this instanceof PGEvents)) return new PGEvents(client);
	var self = this;

	this.client = client;
	this.events = {};
};

inherits(pgEvents, EventEmitter);

pgEvents.prototype.listen = function (table) {};
pgEvents.prototype.notify = function (table) {};
pgEvents.prototype.unlisten = function (table) {};


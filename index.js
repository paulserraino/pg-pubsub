var EventEmitter = require('events').EventEmitter;
var utils = require('util');

function PGEvents (client) {
  if (!(this instanceof PGEvents)) return new PGEvents(client);
  var self = this;
  this.client = client;
};

utils.inherits(PGEvents, EventEmitter);

PGEvents.prototype.subscribe = function (table, cb) {
  var self = this;
  self.client.query("SELECT add_notify_trigger_to_table('"+table+"')", function (error, data) {
    if (error) return cb(error, null);

    self.client.query("LISTEN "+table, function (error) {
      if (error) throw error;
    });

    self.client.on('notification', function (data) {
      if (typeof data === "string") data=JSON.parse(data);
      data = JSON.parse(data.payload);
      self.emit(table+':'+data.operation, data);
    });

    cb(null);
  });
};

PGEvents.prototype.unsubscribe = function (table, cb) {
  this.client.query('SELECT remove_notify_trigger_to_table('+ table +')', function (error) {
    if (error) return cb(error, null);
    cb(null);
  });
};

module.exports = PGEvents;
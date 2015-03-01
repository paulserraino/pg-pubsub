'use strict';

var EventEmitter = require('events').EventEmitter
    , utils = require('util')
    , fs = require('fs')
    , path = require('path')
    , doT = require('dot')
    , pg = require('pg')
    , _ = require('mol-proto')
    , installSQLtemplate = getInstallSQLtemplate();


var DEFAULTS = {
    changesChannel: 'data_changes',
    names: {
        notifyTrigger: 'data_change_notify_trigger',
        notifyTriggerFunc: 'data_change_notify_trigger_func',
        addNotifyTrigger: 'add_notify_trigger_to_table',
        removeNotifyTrigger: 'remove_notify_trigger_to_table'
    },
    operationEvents: true,
    checkUpdates: true // only notify if update changes record, can be set to false if record comparison is expensive
};

function PGObserver (opts) {
    if (!(this instanceof PGObserver)) return new PGObserver(opts);
    this.client = opts.client || new pg.Client(opts.conString);
    if (opts.names) opts.names = _.extend(_.clone(DEFAULTS.names), opts.names);
    opts = _.extend(_.clone(DEFAULTS), opts);
    this.options = opts;
};

utils.inherits(PGObserver, EventEmitter);


_.extendProto(PGObserver, {
    install: install,
    subscribe: subscribe,
    unsubscribe: unsubscribe
});


module.exports = PGObserver;


/**
 * Creates procedures in the database
 * @param  {Function} cb optional callback
 */
function install(cb) {
    var installSQL = installSQLtemplate(this.options);
    this.client.connect();
    this.client.query(installSQL, cb);
}


/**
 * Subscribes to changes in the table(s)
 * @param  {String|Array<String>} tables  table name (or array of table names) to subscribe to
 * @param  {Function}             cb      optional callback
 */
function subscribe(tables, cb) {
    var self = this;
    var sql = getSQL.call(this, tables, addTrigger);
    this.client.query(sql, function (err, data) {
        if (err) return cb(err, data);

        if (!self._listening) {
            var sql = 'LISTEN ' + self.options.changesChannel;
            self.client.query(sql, function (err, data) {
                if (err) return cb(err, data);

                self.client.on('notification', function (data) {
                    if (typeof data == 'string') data = JSON.parse(data);
                    data = JSON.parse(data.payload);
                    self.emit(data.table, data);
                    if (self.options.operationEvents)
                        self.emit(data.table + ':' + data.operation.toLowerCase(), data);
                });
                self._listening = true;

                cb(null, data);
            });
        } else
            cb(null, data);
    });
}


/**
 * Unsubscribes from changes in the table(s)
 * @param  {String|Array<String>} tables  table name (or array of table names) to unsubscribe from
 * @param  {Function}             cb      optional callback
 */
function unsubscribe(tables, cb) {
    var sql = getSQL.call(this, tables, removeTrigger);
    this.client.query(sql, cb);
}


function getInstallSQLtemplate() {
    var str = fs.readFileSync(path.join(__dirname + '/install.sql'))
        , options = _.clone(doT.templateSettings);
    options.strip = false;
    return doT.template(str, options);
}


function getSQL(tables, func) {
    return Array.isArray(tables)
            ? tables.map(func, this).join(' ')
            : func.call(this, tables);
}


function addTrigger(table) {
    return 'SELECT ' + this.options.names.addNotifyTrigger + "('" + table + "');";
}


function removeTrigger(table) {
    return 'SELECT ' + this.options.names.removeNotifyTrigger + "('" + table + "');";
}

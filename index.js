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
    operationEvents: true
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


function install(cb) {
    var installSQL = installSQLtemplate(this.options);
    this.client.connect();
    this.client.query(installSQL, cb);
}


function subscribe(tables, cb) {
    cb = cb || _.noop;
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
                        self.emit(data.table + ':' + data.operation, data);
                });
                self._listening = true;

                cb(null, data);
            });
        } else
            cb(null, data);
    });
}


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

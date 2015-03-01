#PG Dispatch
Postgres pub/sub

[![NPM](https://nodei.co/npm/pg-dispatch.png)](https://nodei.co/npm/pg-dispatch/)

##Setup
```bash
npm install pg-dispatch
```
```bash
psql -h localhost -d mydb < install.sql
```

##Example

```js
var dispatcher = require('pg-dispatch')({
    // client: ... // pg client can be passed or
    conString: '', // same as for pg driver
    // Default options:
    // changesChannel: 'data_changes',
    // names: {
    //    notifyTrigger: 'data_change_notify_trigger',
    //    notifyTriggerFunc: 'data_change_notify_trigger_func',
    //    addNotifyTrigger: 'add_notify_trigger_to_table',
    //    removeNotifyTrigger: 'remove_notify_trigger_to_table'
    // },
    // operationEvents: true, // false to NOT send events on each operation
    // checkUpdates: true // only notify if update changes record
    // sendRecordId: false // send only record IDs, true - to send column 'id',
                           // string to send column with a given name.
                           // this column should be a number.
                           // by default the whole record data is sent.
});

dispatcher.install(function(err) {
    if (err) return console.log(err);
    dispatcher.subscribe('users');
});

dispatcher.on('users:insert', function (error, data) {
	if (error) throw error;	
});
```
## API
### .install(callback)
### .subscribe('table_name', callback)   // array of tables can be passed
### .unsubscribe('table_name', callback) //  -"-
### .on('table_name', callback)
### .on('table_name:insert', callback) // when operationEvents is true (default)
### .on('table_name:update', callback) // -"-
### .on('table_name:delete', callback) // -"-

##License
MIT
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
var dispatcher = require('pg-dispatch')(client);

dispatcher.subscribe('users')
dispatcher.on('users:insert', function (error, data) {
	if (error) throw error;	
});
```
## API
### .subscribe("table_name", callback)
### .unsubscribe("table_name", callback)
### .on("table_name:insert", callback)
### .on("table_name:update", callback)
### .on("table_name:delete", callback)

##License
MIT
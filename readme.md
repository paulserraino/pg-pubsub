#PG PubSub
Postgres pub/sub

##Setup
```
psql -h localhost -d mydb < install.sql
```

##Example

```
var pgEvent = require('pg-event')(client);

pgEvent.subscribe('users')
pgEvent.on('users:insert', function (error, data) {
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
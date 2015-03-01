var assert = require('assert')
var pg = require('pg')
var PGEvents = require('../')
var connect = require('./connect')

before(function (done) {
  var self = this;
  connect(function (client) {
    self.client = client
    self.pgevents = PGEvents({ conString: 'postgres://localhost/test' })
    done()
  })
})

describe('PG Events', function() {

  describe('.subcribe', function () {
    it('should subcribe to table', function (done) {
      var pgevents = this.pgevents;
      pgevents.install(function() {
        pgevents.subscribe('users', function (error) {
          if (error) return done(error)
          done();
        });
      });
    });
  });

  describe('table:insert', function () {
    before(function () {
      var self = this;
      this.cache = {};
      this.pgevents.on('users:insert', function (msg) {
        self.cache = msg;
      });
    });

    it('should send JSON message',function (done) {
      var self = this;
      this.client.query("insert into users (name) values ('pat')", function (error, data) {
        if (error) return done(error);

        setTimeout(function() {
          validCache(self.cache);
          assert.equal(self.cache.operation, 'INSERT');

          done();
        }, 100); // timeout is needed when different client is used
      });
    });
  });

  describe('table:update', function () {

    before(function (done) {
      var self = this;
      this.pgevents.on('users:update', function (msg) {
        self.cache = msg;
      });

      this.client.query("insert into users (name) values ('pat')", function(err) {
        if (err) return done(err);
        self.cache = {};
        done();
      });
    });

    it('should send JSON message', function (done) {
      var self = this;
      this.client.query("UPDATE users SET name='cat' WHERE name='pat'", function (error) {
        if (error) return done(error);

        setTimeout(function() {
          validCache(self.cache);
          assert.equal(self.cache.operation, 'UPDATE');
          assert.notDeepEqual(self.cache.old_data, {}, 'cache old_data is empty');

          done();
        }, 100);
      });
    });
  });

  describe('table:delete', function () {
    before(function (done) {
      var self = this;
      this.pgevents.on('users:delete', function (msg) {
        self.cache = msg;
      });
      this.client.query("insert into users (name) values ('pat')", function(err) {
        if (err) return done(err);
        self.cache = {};
        done();
      });
    });

    it('should send JSON message', function (done) {
      var self = this;
      this.client.query("DELETE FROM users WHERE name='pat'", function (error) {
        if (error) return done(error);

        setTimeout(function() {
          validCache(self.cache);
          assert.equal(self.cache.operation, 'DELETE');
          assert.notDeepEqual(self.cache.old_data, {}, 'cache old_data is empty');

          done();
        }, 100);
      });
    });
  });
});

/*
*   Helpers
*/

function validCache (cache) {
    assert.notDeepEqual(cache, {}, 'cache is empty')
    assert.notDeepEqual(cache.data, {}, 'cache data is empty')
    assert.equal(cache.table, 'users', 'table is users')
}

var resourceful = require('resourceful'),
    mongodb = require('mongodb').Db,
    Server = require('mongodb').Server;

resourceful.env = 'test';

var testDatabaseName = "resourceful-mongo-test",
    host = "localhost",
    port = 27017;

var DB = exports;

DB.start = function(callback) {
  // drop the test database
  var testDB = new mongodb(testDatabaseName, new Server(host, port, {}));
  testDB.open(function(err, db) {
    db.dropDatabase(callback);
  });
};

DB.products = {
  "asos"      : {name: 'asos jeans', brand: "test brand"},
  "modcloth"  : {name: 'modcloth shoes', brand: "test brand"},
  "amazon"    : {name: 'amazon book', brand: "pragprog"}
};
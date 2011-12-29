var async = require('utile').async,
    resourceful = require('resourceful'),
    mongodb = require('mongodb').Db,
    Server = require('mongodb').Server;

resourceful.env = 'test';

var testDatabaseName = "resourceful-mongo-test",
    host = "127.0.0.1",
    port = 27017;

var DB = exports;

DB.start = function(callback) {
  // drop the test database
  var testDB = new mongodb(testDatabaseName, new Server(host, port, {}));
  testDB.open(function(err, db) {
    db.dropDatabase(callback);
  });

  // setup default resourceful connection
  resourceful.use("mongodb", {host: host, port : port, database : testDatabaseName, collection : "test"});
};

DB.people = {
  "bob"   : {name: 'Bob', age: 21},
  "steve" : {name: 'Steve', age: 32},
  "joe"   : {name: 'Joe', age: 43}
};

DB.Person = resourceful.define('person', function() {
  this.string('name');
  this.number('age');
});

DB.createPeople = function(people, callback) {
  if(!Array.isArray(people)) people = [people];

  async.forEach(people, DB.createPerson, callback);
};

DB.createPerson = function(person, callback) {
  DB.Person.create(person, callback);
};
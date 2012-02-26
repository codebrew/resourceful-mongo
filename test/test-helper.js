var async = require('utile').async,
    resourceful = require('resourceful'),
    mongodb = require('mongodb').Db,
    Server = require('mongodb').Server;

resourceful.env = 'test';

var testConnection = {
  host: "127.0.0.1", 
  port : 27017, 
  database : "resourceful-mongo-test", 
  collection : "test",
  safe : true
}

var DB = exports;

DB.start = function(callback) {
  // drop the test database
  var testDB = new mongodb(testConnection.database, new Server(testConnection.host, testConnection.port, {}));
  testDB.open(function(err, db) {
    if (err) throw err

    db.dropDatabase(callback);
  });

  // setup default resourceful connection
  resourceful.use("mongodb", testConnection);
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

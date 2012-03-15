var async = require('utile').async,
    resourceful = require('../lib/resourceful-mongo'),
    mongodb = require('mongodb').Db,
    Server = require('mongodb').Server;

resourceful.env = 'test';

var DB = exports;

DB.people = {
  "bob"   : {name: 'Bob', age: 21},
  "steve" : {name: 'Steve', age: 32},
  "joe"   : {name: 'Joe', age: 43}
};

DB.Person = resourceful.define('person', function() {

  this.use("mongodb", {
    uri: "mongodb://127.0.0.1:27017/resourceful-mongo-test",
    collection: "people",
    safe: true
  });

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

DB.drop = function(callback) {

  this.timeout(10000); //The tests are a bit slow because the database is dropped before each one.

  if (!DB.Person.connection.connection) return callback();

  DB.Person.connection.connection.dropDatabase(function(err) {
    if (err) throw err;
    callback();
  });
};

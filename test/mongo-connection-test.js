var db = require('./test-helper'),
    mongo = require("../lib/resourceful-mongo"),
    should = require('should'),
    resourceful = require('resourceful');

describe('Connecting to mongoDB', function() {

  it("accepts a uri", function() {
    var config = resourceful.use("mongodb", "mongodb://test.mongodb.com:4444/resourceful-mongo-test").connection.config;
    
    config.host.should.equal("test.mongodb.com");
    config.port.should.equal(4444);
    config.database.should.equal("resourceful-mongo-test");
  });

  it("connects to default db when no config is passed in", function() {
    var config = resourceful.use("mongodb").connection.config;
    
    config.host.should.equal("127.0.0.1");
    config.port.should.equal(27017);
    config.database.should.equal("test");
  });

  it("accepts host, port and databasse", function() {
    var config = resourceful.use("mongodb", {host: "test.host.com", port: 5555, database : "test-db"}).connection.config;

    config.host.should.equal("test.host.com");
    config.port.should.equal(5555);
    config.database.should.equal("test-db");
  });
});

describe("Creating", function() {
  before(db.start);

  it("creates a simple model", function(done){
    var Person = resourceful.define('person');
    Person.string('name');
    Person.number('age');

    Person.create({ name: 'Bob', age: 99 }, function (err, person) {
      if (err) { done(err); }

      should.exist(person._id);
      person.age.should.equal(99);

      done();
    });
  });

});
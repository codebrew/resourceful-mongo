var db = require('./test-helper'),
    mongo = require("../lib/resourceful-mongo"),
    should = require('should'),
    resourceful = require('resourceful');

describe('Connecting', function() {

  it("accepts a uri", function() {
    var config = resourceful.use("mongodb", {uri:"mongodb://test.mongodb.com:4444/resourceful-mongo-test", collection: "test"}).connection.config;
    
    config.host.should.equal("test.mongodb.com");
    config.port.should.equal(4444);
    config.database.should.equal("resourceful-mongo-test");
  });

  it("connects to default db when no config is passed in", function() {
    var config = resourceful.use("mongodb", {collection: "tests"}).connection.config;
    
    config.host.should.equal("127.0.0.1");
    config.port.should.equal(27017);
    config.database.should.equal("test");
  });

  it("accepts host, port and databasse", function() {
    var config = resourceful.use("mongodb", {host: "test.host.com", port: 5555, database : "test-db", collection: "tests"}).connection.config;

    config.host.should.equal("test.host.com");
    config.port.should.equal(5555);
    config.database.should.equal("test-db");
  });

  it("requires collection", function() {
    var func = function(){ resourceful.use("mongodb"); };

    should.throws(func);
  });

});

describe("Creating", function() {
  before(db.start);

  it("creates a simple model", function(done){
    
    db.Person.create({ name: 'Bob', age: 99 }, function (err, person) {
      if (err) { done(err); }

      should.exist(person._id);
      person.age.should.equal(99);

      done();
    });
  });

});

describe("Updating", function() {
  before(db.start);

  it("paritally updates model", function(done) {
    db.Person.create({ name: 'Bob', age: 99 }, function (err, person) {
      if (err) { done(err); }
      
      person.update({name:"Steve"}, function(err, person){
        if(err) return done(err);

        person.name.should.equal("Steve");
        person.age.should.equal(99);
        done();
      });
    });

  });

});

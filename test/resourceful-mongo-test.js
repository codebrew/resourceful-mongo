var db = require('./test-helper'),
    mongo = require("../lib/resourceful-mongo"),
    should = require('should'),
    resourceful = require('resourceful');

beforeEach(db.drop);

describe('Connecting', function() {

  it("open new connection", function(done) {
    resourceful.use("mongodb", {uri: "mongodb://127.0.0.1:27017/resourceful-mongo-test", onConnect: function(err) {
       if (err) throw err;
       done();
    }});
  });

  it("by uri", function() {
    var config = resourceful.use("mongodb", {uri: "mongodb://test.mongodb.com:4444/resourceful-mongo-test", collection: "test"}).connection.config;
    config.host.should.equal("test.mongodb.com");
    config.port.should.equal(4444);
    config.database.should.equal("resourceful-mongo-test");
  });

  it("with safe param on uri", function() {
    resourceful.use("mongodb", {uri:"mongodb://test.db.com:4444/test?safe=true", collection: "test"}).connection.config.safe.should.equal(true);
    resourceful.use("mongodb", {uri:"mongodb://test.db.com:4444/test?safe=false", collection: "test"}).connection.config.safe.should.equal(false);
  });

  it("with safe option", function() {
    resourceful.use("mongodb", {safe : "false", collection: "test"}).connection.config.safe.should.equal(false);
    resourceful.use("mongodb", {safe : false, collection: "test"}).connection.config.safe.should.equal(false);
    
    resourceful.use("mongodb", {safe : "true", collection: "test"}).connection.config.safe.should.equal(true);
    resourceful.use("mongodb", {safe : true, collection: "test"}).connection.config.safe.should.equal(true);
  });

  it("with defaults", function() {
    var config = resourceful.use("mongodb", {collection: "tests"}).connection.config;
    
    config.host.should.equal("127.0.0.1");
    config.port.should.equal(27017);
    config.database.should.equal("test");
    config.safe.should.equal(false);
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

  it("creates a simple model", function(done) {
    
    db.Person.create({ name: 'Bob', age: 99 }, function (err, person) {
      if (err) { done(err); }

      should.exist(person._id);
      person.age.should.equal(99);

      done();
    });
  });
});

describe("Saving", function() {

  it("saves without error", function(done) {
    
    db.Person.create({ name: 'Bob', age: 99 }, function (err, person) {
      if (err) done(err);
      done();
    });
  });
});

describe("Updating", function() {

  it("paritally updates model", function(done) {
    db.Person.create({ name: 'Bob', age: 99 }, function (err, person) {
      if (err) done(err);
      
      person.update({name:"Steve"}, function(err, person){
        if(err) return done(err);

        person.name.should.equal("Steve");
        person.age.should.equal(99);
        done();
      });
    });
  });

});

describe("Finding", function(){

  it("all resources", function(done) {
    var p = db.people;
    db.createPeople([p["bob"], p["steve"]], function() {

      db.Person.all(function(err, people){
        if(err) done(err);

        people.should.have.lengthOf(2)
        done();
      });
    });
  });

  it("by id", function(done) {

    db.Person.create(db.people.bob, function(err, bob) {
      db.Person.get(bob.id, function(err, foundBob) {
        if(err) done(err);

        foundBob.name.should.equal(bob.name);
        foundBob.age.should.equal(bob.age);
        foundBob._id.toString().should.equal(bob._id.toString());

        done();
      });

    });
  });

  it("by name", function(done) {
    var p = db.people;
    db.createPeople([p.bob, p.steve, p.joe], function() {

      db.Person.find({name : "Bob"}, function(err, people){
        if(err) done(err);

        people.should.have.lengthOf(1);
        done();
      });
    });

  });

});

describe("Destroying", function() {
  beforeEach(function(done) {
    db.createPeople([{name: "bob", age: 22}, db.people.steve], function(err) {
      done();
    });
  });
  
  it("by id", function(done) {
    db.Person.destroy({name: "bob"}, function(err, result) {
      if(err) done(err);

      result.should.equal(1);
      done();
    });
  });
});

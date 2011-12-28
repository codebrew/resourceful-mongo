var db = require('./test-helper'),
    mongo = require("../lib/resourceful-mongo"),
    should = require('should'),
    resourceful = require('resourceful');

describe('Connecting to mongoDB', function() {
  
  before(db.start);

  it("accepts a uri", function(done) {
    resourceful.use("mongodb", "mongodb://test.mongodb.com:4444/resourceful-mongo-test");
    var config = resourceful.connection.config;
    
    config.host.should.equal("test.mongodb.com");
    config.port.should.equal(4444);
    config.database.should.equal("resourceful-mongo-test");

    done();
  });

  it("connects to default db when no config is passed in", function(done) {
    resourceful.use("mongodb");
    var config = resourceful.connection.config;
    
    config.host.should.equal("127.0.0.1");
    config.port.should.equal(27017);
    config.database.should.equal("test");

    done();
  });

  it("accepts host, port and databasse", function(done) {
    resourceful.use("mongodb", {host: "test.host.com", port: 5555, database : "test-db"});
    var config = resourceful.connection.config;
    
    config.host.should.equal("test.host.com");
    config.port.should.equal(5555);
    config.database.should.equal("test-db");

    done();
  });

});
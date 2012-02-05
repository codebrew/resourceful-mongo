var url = require('url'),
    resourceful = require('resourceful'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

var Mongo = exports.Mongo = function Mongo(config) {
  if(!config.collection) {
    throw new Error('collection must be set in the config for each model.');
  }

  if (config.uri) {
    var parsed = url.parse('mongodb://' + config.uri, true);
    
    config.host = parsed.hostname;
    config.port = parseInt(parsed.port, 10);
    config.database = (parsed.pathname || '').replace(/^\//, '');

    if(parsed.query) {
      resourceful.mixin(config, parsed.query);
    }
  }

  config.host      = config.host || '127.0.0.1';
  config.port      = config.port || 27017;
  config.port      = parseInt(config.port, 10);
  config.safe      = (String(config.safe) === 'true');
  config.database  = config.database || resourceful.env;

  this.config = config;
  this.database = new Db(this.config.database, new Server(this.config.host, this.config.port, {}));
  this.cache = new resourceful.Cache();
};

Mongo.prototype.protocol = 'mongodb';

Mongo.prototype.collection = function(callback) {
  var self = this;

  this.database.open(function(err, client) {
    if(err) return callback(err);

    client.collection(self.config.collection, function(err, collection) {
      if(err) return callback(err);

      return callback(null, collection);
    });

  });
};

Mongo.prototype.save = function (id, doc, callback) {
  var args = Array.prototype.slice.call(arguments, 0);
  var callback = args.pop();
  var doc = args.pop();

  if (args.length) {
    doc._id = id;
  }

  // if(doc._id && typeof doc._id === 'string') {
  //   doc._id = new this.database.bson_serializer.ObjectID(doc._id);
  // }

  var config = this.config;

  this.collection(function(err, collection) {
    if(err) return callback(err);

    collection.save(doc, {safe : config.safe}, callback);
  });

};

Mongo.prototype.update = function (id, doc, callback) {
  var self = this;
  
  // if(id && typeof id === 'string') {
  //   id = new this.database.bson_serializer.ObjectID(id);
  // }
  var config = this.config;

  this.collection(function(err, collection){
    if(err) return callback(err);

    collection.update({"_id" : id}, {$set: doc}, {safe : config.safe}, function(err) {
      if(err) return callback(err);
      
      return self.get(id, callback);
    });

  });
};

Mongo.prototype.get = function(id, callback) {
  if(id && typeof id === 'string') {
    id = new this.database.bson_serializer.ObjectID(id);
  }

  this.collection(function(err, collection){
    if(err) return callback(err);

    collection.findOne({"_id": id}, callback);
  });
};

Mongo.prototype.find = function(criteria, callback) {
  this.collection(function(err, collection){
    collection.find(criteria).toArray(callback);
  });
};

Mongo.prototype.destroy = function(id, callback) {
  var config = this.config;
  
  this.collection(function(err, collection) {
    collection.remove({"_id": id}, {safe : config.safe}, callback);
  });
};

// register engine with resourceful
resourceful.engines.Mongodb = Mongo;

//export resourceful
module.exports = resourceful

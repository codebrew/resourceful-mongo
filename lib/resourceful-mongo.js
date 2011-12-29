var url = require('url'),
    resourceful = require('resourceful'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

var Mongo = exports.Mongo = function Mongo(config) {
  this.config = config;

  if(!config.collection) {
    throw new Error('collection must be set in the config for each model.');
  }

  if (this.config.uri) {
    var parsed = url.parse('mongodb://' + this.config.uri);
    this.config.host = parsed.hostname;
    this.config.port = parseInt(parsed.port, 10);
    this.config.database = (parsed.pathname || '').replace(/^\//, '');
  }

  this.config.host      = this.config.host || '127.0.0.1';
  this.config.port      = this.config.port || 27017;
  this.config.port      = parseInt(this.config.port, 10);
  this.config.database  = this.config.database || resourceful.env;

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

  if(doc._id && typeof doc._id === 'string') {
    doc._id = new this.database.bson_serializer.ObjectID(doc._id);
  }

  this.collection(function(err, collection) {
    if(err) return callback(err);

    collection.save(doc, {safe : true}, callback);
  });

};

Mongo.prototype.update = function (id, doc, callback) {
  var self = this;
  
  if(id && typeof id === 'string') {
    id = new this.database.bson_serializer.ObjectID(id);
  }

  this.collection(function(err, collection){
    if(err) return callback(err);

    collection.update({"_id" : id}, {$set: doc}, {safe : true}, function(err) {
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

Mongo.prototype.find = function(properties, callback) {
  this.collection(function(err, collection){
    collection.find().toArray(callback);
  });
};

// register engine with resourceful
resourceful.engines.Mongodb = Mongo;
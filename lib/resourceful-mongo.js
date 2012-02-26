var url = require('url'),
    resourceful = require('resourceful'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

exports.connection = {};
exports.deferred = {};

var Mongo = exports.Mongo = function Mongo(config) {
  if(!config.collection) {
    throw new Error('collection must be set in the config for each model.');
  }

  if (config.uri) {
    var uri = url.parse('mongodb://' + config.uri, true);
    config.host = uri.hostname;
    config.port = uri.port;

    if (uri.pathname) {
      config.database = uri.pathname.replace(/^\/|\/$/g, '');
    }

    if (uri.query) {
      resourceful.mixin(config, uri.query);
    }
  }

  config.host     = config.host     || '127.0.0.1';
  config.port     = config.port     || 27017;
  config.database = config.database || resourceful.env || 'test';
  config.safe     = config.safe     || false;

  config.uri = url.format({
    protocol: 'mongodb',
    hostname: config.host,
    port: config.port,
    pathname: '/'+config.database
  });

  config.port = parseInt(config.port, 10);

  this.config = config;
  this.cache = new resourceful.Cache();

  //If a connection for this URI has already been made, use it
  if (exports.connection[config.uri]) {
    this.connection = exports.connection[config.uri];

  //Otherwise if an onConnect callback was given, open a new connection
  } else if (typeof config.onConnect === 'function') {
    new Db(config.database, new Server(config.host, config.port, {})).open(function(err, db) {
      if (err) {
        return config.onConnect(err);
      }

      self.connection = exports.connection[config.uri] = db;

      (function handleDeferredAction(i) {
        if (exports.deferred[config.uri] && i<exports.deferred[config.uri].length) {
          exports.deferred[config.uri][i](config.uri, function() {
              handleDeferredAction(++i);
          });
        } else {
          delete exports.deferred[config.uri];
          config.onConnect();
        }
      })(0);
    });

  //Failing that, just remember to set `this.connection` when the appropriate connection does get made
  //This makes it easy to define resources before opening their database connection
  } else {
    var self = this;

    if (!exports.deferred[config.uri]) {
      exports.deferred[config.uri] = [];
    }

    exports.deferred[config.uri].push(function(uri, callback) {
      self.connection = exports.connection[uri];
      callback();
    });
  }
};

Mongo.prototype.protocol = 'mongodb';

//Lazy-load the resource's collection
Mongo.prototype.collection = function(callback) {
  var self = this;

  if (this._collection) {
    return callback(null, this._collection);
  } else {
    this.connection.collection(self.config.collection, function(err, collection) {
      if(err) return callback(err);
      self._collection = collection;
      return callback(null, collection);
    });
  }
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
    id = {'_id': new this.database.bson_serializer.ObjectID(id)};
  }

  this.collection(function(err, collection) {
    if(err) return callback(err);

    collection.findOne(id, function(err, doc) {
      if (err) return callback(err);

      callback(null, doc || {});
    });
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

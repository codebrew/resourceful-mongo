var url = require('url'),
    resourceful = require('resourceful'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

var Mongo = exports.Mongo = function Mongo(config) {
  this.config = config;

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
};

Mongo.prototype.protocol = 'mongodb';

// register engine with resourceful
resourceful.engines.Mongodb = Mongo;
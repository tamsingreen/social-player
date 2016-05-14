var MongoClient = require('mongodb').MongoClient,
    async = require('async'),
    events = require('events'),
    config = require('./config'),
    database = new events.EventEmitter();

var state = {
  db: null,
  mode: null,
}

exports.database = database;

exports.connect = function(env, done) {
  if (state.db) {
    done();
  } else {
    MongoClient.connect(config.mongoURI[env], function(err, db) {
      if (err) {
        done(err);
      } else {
        state.db = db;
        state.mode = env;
        database.emit('connected');
        done();
      }
    });
  }
}

exports.getDB = function() {
  if (state.db) {
    return state.db;
  } else {
    console.log('Database has not been initialized.');
  }
}

exports.drop = function(done) {
  if (!state.db) return done()
  // This is faster then dropping the database
  state.db.collections(function(err, collections) {
    async.each(collections, function(collection, cb) {
      if (collection.collectionName.indexOf('system') === 0) {
        return cb()
      }
      collection.remove(cb)
    }, done)
  })
}

exports.fixtures = function(data, done) {
  var db = state.db
  if (!db) {
    return done(new Error('Missing database connection.'))
  }

  var names = Object.keys(data.collections)
  async.each(name, function(name, cb) {
    db.createCollection(name, function(err, collection) {
      if (err) return cb(err)
      collection.insert(data.collections[name], cb)
    })
  }, done)
}

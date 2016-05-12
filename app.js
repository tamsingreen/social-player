var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Config
var config = require('./config');

var routes = require('./routes/index');

var app = express();

// Database
var dbClient = require('./dbClient');
var db;
dbClient.connect(config.mongoURI[app.settings.env], function(err) {
  if (err) {
    console.log("Error connecting to db");
  } else {
    console.log('Connected to db');
    db = dbClient.getDB();
  }
})
// var MongoClient = require('mongodb').MongoClient;
// var db;
// // Use connect method to connect to the server
// MongoClient.connect(config.mongoURI[app.settings.env], function(err, db) {
//   if (!err) {
//     console.log("Connected successfully to server");
//     db = db;
//     // db.collection('programmelist').insert(
//     //   [{ "fbId" : "260212261199", "fbCategory" : "Tv show", "fbName" : "BBC Newsnight", "bbcBrandPid" : "b006mk25" },
//     //   { "fbId" : "144513172354395", "fbCategory" : "Tv show", "fbName" : "The Fall (TV series)", "bbcBrandPid" : "p0295tcf" },
//     //   { "fbId" : "169383494938", "fbCategory" : "Tv show", "fbName" : "BBC Eastenders", "bbcBrandPid" : "b006m86d" }]
//     // );
//   } else {
//     console.log("Could not connect to server");
//   }
// });

// var mongoose = mongo.connect(config.mongoURI[app.settings.env]);
// var db = mongoose.connection;
//   db.on('error', console.error.bind(console, 'connection error:'));
//   db.once('open', function() {
//     // we're connected!
//     console.log('Connected to Mongo DB URI: ' + config.mongoURI[app.settings.env]);
//     console.log(db.getName());
// });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Make Facebook App ID config var from Heroku available
app.locals.fbAppId = process.env.FACEBOOK_APP_ID;

//Make db accessible to router
app.use(function(req, res, next) {
    if (db) {
      req.db = db;
      console.log('Retrieved db');
    } else console.log('Could not retrieve db');
    next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
// module.exports.db = db;

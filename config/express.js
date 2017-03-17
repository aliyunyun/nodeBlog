var express = require('express');
var glob = require('glob');

var favicon = require('serve-favicon');
var logger = require('morgan');
var moment = require('moment');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var truncate = require('truncate');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');
var Category = mongoose.model('Category');
var User = mongoose.model('User');

var session = require('express-session');


module.exports = function(app, config) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';

  app.set('views', config.root + '/app/views');
  app.set('view engine', 'jade');

  // app.use(favicon(config.root + '/public/img/favicon.ico'));

  app.use(function(req, res , next){
    app.locals.pageName = req.path;
    app.locals.moment = moment;
    app.locals.truncate = truncate;
    console.log(req.path);

    Category.find(function(err, categories){
      if(err){
          return next(err);
      }
      app.locals.categories = categories;
      next();
    });
  });
  app.use(function(req, res, next){

    User.find(function(err, users){
      if(err){
        return next(err);
      }
      app.locals.authors = users;
      next();
    });

  });

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));
  app.use(cookieParser());

  // session
  app.use(session({
    secret: 'nodeblog',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
  app.use(require('connect-flash')());
  app.use(function(req,res, next){
    res.locals.messages = require('express-messages')(req, res);
    next()
  });

  app.use(compress());
  app.use(express.static(config.root + '/public'));
  app.use(methodOverride());

  var controllers = glob.sync(config.root + '/app/controllers/**/*.js');
  controllers.forEach(function (controller) {
    require(controller)(app);
  });

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if(app.get('env') === 'development'){
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
  }

  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
      });
  });

  return app;
};

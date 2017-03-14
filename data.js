
var express = require('express'),
  config = require('./config/config'),
  glob = require('glob'),
  loremipsum = require('lorem-ipsum'),
  slug = require('slug'),

  mongoose = require('mongoose');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});


var Post = mongoose.model('Post');
var User = mongoose.model('User');
var Category = mongoose.model('Category');
var app = express();

module.exports = require('./config/express')(app, config);

User.findOne(function(err, user){
  if(err){
    return console.log('cannot find user');
  }

  Category.find(function(err, category){
    if(err){
      return console.log('cannot find category');
    }
    category.forEach(function(category){
      for(var i = 0 ; i<30 ; i++){
        var title = loremipsum({count:1, units:'sentence'});
        var post  = new Post({
          title:title,
          slug:slug(title),
          content:loremipsum({count:6, units:'paragraphs'}),
          category:category,
          author: user,
          published: true,
          meta: {favorite:0},
          comments: [],
          create: new Date()
        });
        post.save(function(save, posts){
          console.log('save post:', posts.slug);
        });
      }

    })
  });
});


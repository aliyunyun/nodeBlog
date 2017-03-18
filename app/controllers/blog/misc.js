var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  res.redirect('/posts');
});

router.get('/about', function (req, res, next) {
  res.render('blog/about', {
    title: 'Generator-Express MVC about',
    articles: "about"
  });
});

router.get('/contact', function (req, res, next) {
  res.render('blog/contact', {
    title: 'Generator-Express MVC contact',
    articles: "home"
  });
});

var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  Article.find(function (err, articles) {
    if (err) return next(err);
    res.render('blog/index', {
      title: 'Generator-Express MVC home',
      articles: "home"
    });
  });
});

router.get('/about', function (req, res, next) {
    res.render('blog/index', {
      title: 'Generator-Express MVC about',
      articles: "about"
    });
});

router.get('/contact', function (req, res, next) {
    res.render('blog/index', {
      title: 'Generator-Express MVC contact',
      articles: "home"
    });
});

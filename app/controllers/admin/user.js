var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  passport = require('passport'),
  md5 = require('md5'),
  User = mongoose.model('User');

module.exports = function (app) {
  app.use('/admin/users', router);
};

router.get('/login', function (req, res, next) {

    res.render('admin/user/login', {
      title: 'Generator-Express MVC home',
    });

});

router.post('/login', passport.authenticate('local', { failureRedirect: '/admin/users/login' }), function (req, res, next) {

    console.log("use login success");
    return res.render('admin/posts/index',
      {
        category:{_id:""},
        filter:{},
        posts:{}
      });

});

router.post('/register', function (req, res, next) {

  req.checkBody('email','邮箱不能为空').notEmpty().isEmail();
  req.checkBody('password', '密码不能为空').notEmpty();
  req.checkBody('conformpassword', '两次密码不能为空').notEmpty().equals(req.body.password);

  var error = req.validationErrors();
  if(error){
    console.log("注册错误:" + error);
    return res.render('admin/user/register', req.body);
  }

  var email = req.body.email;
  var password = req.body.password;

  var user = new User({
    name: email.split('@').shift(),
    email: email,
    password: md5(password),
    created: new Date(),
  });

  user.save(function (err, userOne) {
      if(err){
        req.flash('error','用户注册失败')
        console.log('user save error'+ err);
        res.render('admin/user/register');
      }else{
        req.flash('info','用户注册成功');
        res.redirect('/admin/users/login');
      }
  });

});


router.get('/register', function (req, res, next) {
    res.render('admin/user/register', {
      pretty:true
    });
});

router.get('/logout', function (req, res, next) {
    res.redirect('/');
});



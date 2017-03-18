
var passport = require('passport'),
    localpassport = require('passport-local').Strategy,

    mongoose = require('mongoose'),
    md5 = require('md5'),
    User = mongoose.model('User');

module.exports = function () {

  console.log("passprot local init");

  passport.use(new localpassport({
      usernameField:'email',
      passwordField:'password'
    },
    function(email, password, done) {


      console.log("passprot local find email:" + email + " password:" + password);

      User.findOne({ email: email }, function (err, user) {

        console.log("passprot local find User:" + user);
        if (err)
        {
          return done(err);
        }
        if (!user)
        {
          return
          done(null, false);
        }
        if (!user.verifyPassword(password))
        { return
          done(null, false);
        }

        return done(null, user);
      });

    }));
  passport.serializeUser(function(user, done) {

    console.log("passprot serializeUser User:" + user);
    done(null, user._id);
  });


  passport.deserializeUser(function(id, done) {
    console.log("passprot deserializeUser User:" + user);
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

};





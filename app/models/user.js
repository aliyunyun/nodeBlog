var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: {type:String , required: true},
  email: {type:String, required: true},
  password: {type:String , required: true},
  created: {type: Date},

});

var md5 = require('md5');

UserSchema.methods.verifyPassword = function(password){

  console.log("UserSchema.methods.verifyPassword : " + password ) ;

  var isMatch =  md5(password) === this.password;

  console.log("UserSchema.methods.verifyPassword : " + isMatch);

  return isMatch;
};

mongoose.model('User', UserSchema);

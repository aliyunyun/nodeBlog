// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name: {type:String , required: true},
  category: {type:String, required: true},
  created: {type: Date},

});


mongoose.model('Category', CategorySchema);

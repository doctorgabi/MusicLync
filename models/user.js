var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var User = mongoose.Schema({
  email     : {type: String, required: true, unique: true},
  password  : {type: String, required: true},
  createdAt : {type: Date, default: Date.now}
  // musician  : {type: mongoose.Schema.Types.ObjectId, ref: 'Musician'},
  // band      : {type: mongoose.Schema.Types.ObjectId, ref: 'Band'},
  // venue     : {type: mongoose.Schema.Types.ObjectId, ref: 'Venue'}
});

User.plugin(uniqueValidator);
mongoose.model('User', User);

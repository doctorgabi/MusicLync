var mongoose = require('mongoose');

var Venue = mongoose.Schema({
  user              : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  createdAt         : {type: Date, default: Date.now},

  name              : String,
  location          : String,
  capacity          : Number,
  influences        : [String],
  genres            : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre'}],

  hasPracticeSpace  : {type: Boolean, default: false},
  doesOpenMic       : {type: Boolean, default: false},

  photoUrl          : String,
  website           : [String],
  musicianReviews   : [String],
  bandReviews       : [String],
  calendar          : {},//will this link to the bands and musicians as a mongoose.Schema link?
  bands             : [{type: mongoose.Schema.Types.ObjectId, ref: 'Band'}],
  musicians         : [{type: mongoose.Schema.Types.ObjectId, ref: 'Musician'}],

  googlePlusLink    : String,
  facebookLink      : String,
  twitterLink       : String,
  linkedInLink      : String
});

mongoose.model('Venue', Venue);
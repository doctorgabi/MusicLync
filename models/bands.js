var mongoose = require('mongoose');

var Band = mongoose.Schema({
  user                    : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  createdAt               : {type: Date, default: Date.now},

  members                 : [{type: mongoose.Schema.Types.ObjectId, ref: 'Musician'}],
  ageGroup                : {},
  lookingFor              : [String],

  wantsToPractice         : {type: Boolean, default: true},
  wantsToPerform          : {type: Boolean, default: false},
  feePerHourGig           : Number,

  influences              : [String],
  genres                  : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre'}],

  photoUrl                : String,
  website                 : String,
  videoUrl                : [String],
  audioUrl                : [String],

  venueReviews            : [String],
  musicianReviews         : [String],

  gigDates                : Date,
  gigVenues               : [{type: mongoose.Schema.Types.ObjectId, ref: 'Venue'}],

  googlePlusLink          : String,
  facebookLink            : String,
  twitterLink             : String,
  linkedInLink            : String
});

mongoose.model('Band', Band);
var mongoose = require('mongoose');

var Musician = mongoose.Schema({
  user                    : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  name                    : String,
  createdAt               : {type: Date, default: Date.now},

  location                : String,
  locname                 : String,
  latitude                : Number,
  longitude               : Number,
  instrumentsPlayed       : [{}],//e.g. [{piano: session}, {violin: beginner}]
  instrumentsTaught       : [String],
  instrumentsOwned        : [String],
  equipmentAccess         : [String],
  hasPracticeSpace        : {type: Boolean, default: false},
  skills                  : [String],
  hasEquipmentTransport   : {type: Boolean, default: false},
  availableTime           : Number,
  ageGroup                : [String],

  wantsToPractice         : {type: Boolean, default: true},
  wantsToPerform          : {type: Boolean, default: false},
  wantsTeacher            : {type: Boolean, default: false},
  feePerHourGig           : Number,
  feePerHourTeach         : Number,
  feePerHourEquipment     : Number,

  influences              : [String],
  genres                  : String,  //[{type: mongoose.Schema.Types.ObjectId, ref: 'Genre'}],

  photoUrl                : String,
  website                 : String,
  videoUrl                : [String],
  audioUrl                : [String],

  venueReviews            : [String],
  bandReviews             : [String],

  gigDates                : Date,
  gigVenues               : String,  //[{type: mongoose.Schema.Types.ObjectId, ref: 'Venue'}],
  bio                     : String,
  googlePlusLink          : String,
  facebookLink            : String,
  twitterLink             : String,
  linkedInLink            : String
});

mongoose.model('Musician', Musician);
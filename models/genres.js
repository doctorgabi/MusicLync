var mongoose = require('mongoose');

var Genre = mongoose.Schema({
  name:      String,
  venues :    [{type: mongoose.Schema.Types.ObjectId, ref: 'Venue'}],
  bands :    [{type: mongoose.Schema.Types.ObjectId, ref: 'Band'}],
  musicians :    [{type: mongoose.Schema.Types.ObjectId, ref: 'Musician'}]
});

mongoose.model('Genre', Genre);
var mongoose = require('mongoose');

var Instrument = mongoose.Schema({
  name      : String,
  musicians : [{type: mongoose.Schema.Types.ObjectId, ref: 'Musician'}]
});

mongoose.model('Instrument', Instrument);
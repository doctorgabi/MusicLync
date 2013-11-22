var mongoose = require('mongoose');
var Instrument = mongoose.model('Instrument');

/*
 * POST '/genres'
 */

exports.create = function(req, res){
  var instrument = new Instrument(req.body);
  instrument.save(function(err, instrument){
    res.send(instrument);
  });
};
var mongoose = require('mongoose');
var Genre = mongoose.model('Genre');

/*
 * POST '/genres'
 */

exports.create = function(req, res){
  var genre = new Genre(req.body);
  genre.save(function(err, genre){
    res.send(genre);
  });
};
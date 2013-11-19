// var mongoose = require('mongoose');
// var Venue = mongoose.model('Venue');

/*
 * GET '/venues'
 */

exports.index = function(req, res){
  res.render('venues/index', {title: 'MusicLync', user: res.locals.user});
};
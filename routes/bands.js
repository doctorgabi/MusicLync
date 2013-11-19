// var mongoose = require('mongoose');
// var Band = mongoose.model('Band');

/*
 * GET '/bands'
 */

exports.index = function(req, res){
  res.render('bands/index', {title: 'MusicLync', user: res.locals.user});
};
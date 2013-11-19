// var mongoose = require('mongoose');
// var Musician = mongoose.model('Musician');

/*
 * GET '/musicians'
 */

exports.index = function(req, res){
  res.render('musicians/index', {title: 'MusicLync', user: res.locals.user});
};
/*
 * GET /
 */

exports.index = function(req, res){
  res.render('home/index', {title: 'MusicLync', user: res.locals.user});
};

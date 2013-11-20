var mongoose = require('mongoose');
var Musician = mongoose.model('Musician');

/*
 * GET '/musicians'
 */
//if a musician profile already exists - don't show edit if they have no profile, just create, and vice versa.
exports.index = function(req, res){
  Musician.find(function(err, musicians){
    Musician.findOne({'user':res.locals.user}, function(err, musicianProfile){
      res.render('musicians/index', {title: 'All Musicians', user: res.locals.user, musicianProfile:musicianProfile, musicians: musicians});
    });
  });
};

/*
 * POST '/musicians'
 */

exports.create = function(req, res){
  console.log('---------');
  console.log(req.body);
  var musician = new Musician(req.body);
  musician.user = res.locals.user;
  musician.save(function(err, m){
    console.log('---inner----');
    console.log(err);
    console.log(m);
    res.send(m);
    //how to send back success with options to view page or view all.
    // console.log('This is coming from routes/musicians.create: ');
    // console.log(req.body);
    //need to render or redirect.
  });
};

/*
 * GET '/musicians/:id'
 */
exports.show = function(req, res){
  Musician.findById(req.params.id, function(err, musician){
    res.render('musicians/show', {title: 'Musician', musician: musician});
  });
};
var mongoose = require('mongoose');
var Musician = mongoose.model('Musician');
var Genre = mongoose.model('Genre');

/*
 * GET '/musicians'
 */
//if a musician profile already exists - don't show edit if they have no profile, just create, and vice versa.
exports.index = function(req, res){
  Musician.find(function(err, musicians){
    Musician.findOne({'user':res.locals.user}, function(err, musicianProfile){
      Genre.find(function(err, genres){
        res.render('musicians/index', {title: 'All Musicians', user: res.locals.user, musicianProfile:musicianProfile, musicians: musicians, genres: genres});
      });
    });
  });
};

/*
 * POST '/musicians'
 */

exports.create = function(req, res){
  //this gets called from the ajax request and now has all that serialised data in req.body.
  console.log(req.body);
  var musician = new Musician(req.body);
  musician.user = res.locals.user;
  musician.save(function(err, musician){
    res.send(musician);
  });
};

/*
 * GET '/musicians/:id'
 */
exports.show = function(req, res){
  Musician.findById(req.params.id).populate('genres').exec(function(err, musician){
    res.render('musicians/show', {title: 'Musician', musician: musician});
  });
};


/*
 * GET '/mapDataRequest/:id'
 */
exports.map = function(req, res){
  Musician.findById(req.params.id, function(err, musician){
    res.send(musician);
  });
};
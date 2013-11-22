var mongoose = require('mongoose');
var Musician = mongoose.model('Musician');
var Genre = mongoose.model('Genre');
var Instrument = mongoose.model('Instrument');

/*
 * GET '/musicians'
 */
//if a musician profile already exists - don't show edit if they have no profile, just create, and vice versa.
exports.index = function(req, res){
  Musician.find(function(err, musicians){//finds all musicians
    Musician.findOne({'user':res.locals.user}, function(err, musicianProfile){//finds who's logged in
      Genre.find(function(err, genres){//finds all genres
        Instrument.find(function(err, instruments){//finds all instruments
          console.log('-------routes----------');
          res.render('musicians/index', {
            title: 'All Musicians',
            user: res.locals.user,
            musicianProfile:musicianProfile,
            musicians: musicians,
            genres: genres,
            instruments: instruments
          });
        });
      });
    });
  });
};

/*
 * POST '/musicians'
 */

exports.create = function(req, res){
  //this gets called from the ajax request and now has all that serialised data in req.body. plus the co-ordinates and ageGroup info.
  var musician = new Musician(req.body);
  console.log('-----------from the new Musician constructor------');
  console.log(musician);//instruments are missing
  musician.user = res.locals.user;
  console.log('-----------and after adding the user------');
  console.log(musician);//works up to here...
  musician.save(function(err, musician){
    console.log('------------from musician.save function----------');
    console.log(musician);//says 'undefined'
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
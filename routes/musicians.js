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
  musician.user = res.locals.user;
  musician.save(function(err, musician){
    res.send(musician);
  });
};

/*
 * GET '/musicians/:id'
 */
exports.show = function(req, res){
  Musician.findById(req.params.id).populate('genres').populate('instruments').exec(function(err, musician){
    res.render('musicians/show', {title: 'Musician', musician: musician});
  });
};


/*
 * GET '/musicians/search'
 */
exports.searchResults = function(req, res){
  var searchData = {};
  if(req.query.name){searchData.name = req.query.name;}
  if(req.query.availableTime){searchData.availableTime = req.query.availableTime;}
  if(req.query.genres){searchData.genres = req.query.genres;}
  if(req.query.instruments){searchData.instruments = req.query.instruments;}
  Musician.find(searchData, function(err, musicians){
    Genre.find(function(err, genres){//finds all genres
      Instrument.find(function(err, instruments){//finds all instruments
        res.render('musicians/index', {
          title: 'Found Musicians',
          musicians: musicians,
          genres: genres,
          instruments: instruments
        });
      });
    });
  });
};


/*
 * GET '/mapDataRequest'
 */
exports.mapAll = function(req, res){
  Musician.find(function(err, musicians){
    res.send(musicians);
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
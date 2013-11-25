var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var User = mongoose.model('User');
var Musician = mongoose.model('Musician');
var Instrument = mongoose.model('Instrument');
var Genre = mongoose.model('Genre');

exports.create = function(req, res){
  var user = new User();
  user.email = req.body.email;

  bcrypt.hash(req.body.password, 10, function(err, hash){
    user.password = hash;
    user.save(function(err, user){
      if(err){
        res.send({status: 'error'});
      } else {
        res.send({status: 'ok'});
      }
    });
  });
};

exports.login = function(req, res){
  User.findOne({email: req.body.email}, function(err, user){
    if(user){
      bcrypt.compare(req.body.password, user.password, function(err, result){
        if(result){
          req.session.regenerate(function(err){
            req.session.userId = user.id;
            req.session.save(function(err){
              res.send({status: 'ok', email: user.email});
            });
          });
        } else {
          req.session.destroy(function(err){
            res.send({status: 'error'});
          });
        }
      });
    } else {
      res.send({status: 'error'});
    }
  });
};

exports.logout = function(req, res){
  req.session.destroy(function(err){
    res.send({status: 'ok'});
  });
};
/*
 * GET '/users'
 */
exports.index = function(req, res){
  User.find(req.query, function(err, user){
    var id = user[0]._id;
    Musician.find({'user':id}, function(err, musicians){
      Genre.find(function(err, genres){
        Instrument.find(function(err, instruments){
          res.send(musicians[0]);
        });
      });
    });
  });
};
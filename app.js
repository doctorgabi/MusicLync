var express = require('express');
var mongoose = require('mongoose');

// model definitions
require('require-dir')('./models');

//define middleware
//var middleware = require('./lib/middleware');


// route definitions
var home = require('./routes/home');
var users = require('./routes/users');
var musicians = require('./routes/musicians');
var genres = require('./routes/genres');
var instruments = require('./routes/instruments');
// var bands = require('./routes/bands');
// var venues = require('./routes/venues');

var app = express();
var RedisStore = require('connect-redis')(express);
mongoose.connect('mongodb://localhost/MusicLync');

// configure express
require('./config').initialize(app, RedisStore);

// routes
app.get('/', home.index);
app.post('/users', users.create);
app.put('/login', users.login);
app.delete('/logout', users.logout);
app.get('/musicians', musicians.index);
app.post('/musicians', musicians.create);
app.get('/musicians/:id', musicians.show);
app.get('/mapDataRequest', musicians.mapAll);
app.get('/mapDataRequest/:id', musicians.map);
app.post('/genres', genres.create);
app.post('/instruments', instruments.create);
// app.get('/bands', bands.index);
// app.get('/venues', venues.index);

// start server & socket.io
var common = require('./sockets/common');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {log: true, 'log level': 2});
server.listen(app.get('port'));
io.of('/app').on('connection', common.connection);



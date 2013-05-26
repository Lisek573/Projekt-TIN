/*jshint node:true */
/*global status:true */
'use strict';
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    socket = require('socket.io');

var taffy = require('taffy');
var goal = require('./db/challenges.js').challenges;
var challenges = taffy(goal);

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(app.router);
  app.use(express['static'](__dirname + '/public'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

var server = http.createServer(app);
var io = socket.listen(server);

server.listen(app.get('port'), function () {
  console.log("Słucham na " + app.get('port'));
});

var status = null;

// ROUTES 
app.get('/game', function (req, res) {
  if (status !== null) {
    res.render('game');
  }
  else {
    res.redirect('/');
}
});

app.get('/', function (req, res) {
  if (status === null) {
    res.render('home', {
      challenges: challenges().select('challengeName')
    });
  }
 else {
    res.redirect('/game');
  }
});

app.post('/', function (req, res) {
  var zadanie = req.body.challenge;
  console.log(req.body);
  var steps = challenges({challengeName: zadanie}).first().steps;
  status = {
    actions           : steps,
    playerLeftName    : null,
    playerRightName   : null,
    playerLeftAction  : 0,
    playerRightAction : 0
  };
  res.redirect('/game');
});

//  SOCKET IO 
io.sockets.on('connection', function (client) {
  console.log('Client connected...');
  if (status.playerLeftName !== null && status.playerRightName !== null) {
    client.emit('playersLimit', status);
    client.set('username', 'spectator');
    client.emit('updateSteps', status);
  }
  else { 
    client.emit('allowJoin');
  }

  client.on('join', function (username) {
    // ustawianie nazwy użytkownika/połączenia
      client.set('username', username);
      if (status.playerLeftName === null) {
        status.playerLeftName = username;
      }
      else {
          status.playerRightName = username;
      } 

      
      client.emit('updatePlayers', status);
      client.broadcast.emit('updatePlayers', status);

      if (status.playerLeftName !== null && status.playerRightName !== null){
      client.emit('updateSteps', status);
      client.broadcast.emit('updateSteps', status);
    }
    });

  client.on('disconnect', function () {
    client.get('username', function (err, username){
     if (username !== 'spectator'){

      
    
     if (status.playerLeftName === username) {
      status.playerLeftName = null;
     }

     if (status.playerRightName === username) {
      status.playerRightName = null;
     }

     if (status.playerLeftName === null && status.playerRightName === null) {
      status = null;
     }
      client.broadcast.emit('updatePlayers', status);
    }
    });
  });
});
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
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express['static'](__dirname + '/public'));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

var server = http.createServer(app);
var io = socket.listen(server);

server.listen(app.get('port'), function () {
  console.log("Slucham na " + app.get('port'));
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
  var przepis = req.body.challenge;
  console.log(req.body);
  var steps = challenges({challengeName: przepis}).first().steps;
  //console.log(steps);
  status = {
    actions           : steps,
    playerLeftName    : null,
    playerRightName   : null,
    playerLeftAction  : 0,
	playerLeftAllow  : 0,
	playerLeftAvatar : null,
	playerRightAllow  : 0,
    playerRightAction : 0,
	playerRightAvatar : null
  };
  res.redirect('/game');
});

// SOCKET IO
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

  client.on('join', function (username, avatar) {
      client.set('username', username);
      if (status.playerLeftName === null) {
        status.playerLeftName = username;
      }
      else {
          status.playerRightName = username;
      }
	  client.set('avatar', avatar);
      if (status.playerLeftAvatar === null) {
        status.playerLeftAvatar = avatar;
      }
      else {
          status.playerRightAvatar = avatar;
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
	  status.playerLeftAction = 0;
	  status.playerLeftAllow = 0;
	  status.playerLeftAvatar = null;
     }

     if (status.playerRightName === username) {
      status.playerRightName = null;
	  status.playerRightAction = 0;
	  status.playerRightAllow = 0;
	  status.playerRightAvatar = null;
     }

     if (status.playerLeftName === null && status.playerRightName === null) {
      status = null;
     }
      client.broadcast.emit('updatePlayers', status);
    }
    });
  });
    
    client.on('next', function () {
    client.get('username', function (err, username) {
      if (status !== null && status.playerLeftName !== null && status.playerRightName !== null){
     //console.log(username);
     if (status.playerLeftName === username) {
      status.playerLeftAllow = 1;
     }
     else if (status.playerRightName === username) {
      status.playerRightAllow = 1;
     }
      client.emit('updateSteps', status);
      client.broadcast.emit('updateSteps', status);
    }
    });
  });
  
    client.on('next-allow', function () {
    client.get('username', function (err, username) {
      if (status !== null && status.playerLeftName !== null && status.playerRightName !== null){
     //console.log(username);
     if (status.playerLeftName === username && status.playerRightAllow === 1) {
      status.playerRightAction++;
	  status.playerRightAllow = 0;
     }
	 
     else if (status.playerRightName === username && status.playerLeftAllow === 1) {
      status.playerLeftAction++;
	  status.playerLeftAllow = 0;
     }
      client.emit('updateSteps', status);
      client.broadcast.emit('updateSteps', status);
    }
    });
  });
  
   client.on('next-disallow', function () {
    client.get('username', function (err, username) {
      if (status !== null && status.playerLeftName !== null && status.playerRightName !== null){
     //console.log(username);
     if (status.playerLeftName === username && status.playerRightAllow === 1) {
	  status.playerRightAllow = 0;
     }
	 
     else if (status.playerRightName === username && status.playerLeftAllow === 1) {
	  status.playerLeftAllow = 0;
     }
      client.emit('updateSteps', status);
      client.broadcast.emit('updateSteps', status);
    }
    });
  });
});
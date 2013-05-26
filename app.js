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
  console.log("S³ucham na " + app.get('port'));
});
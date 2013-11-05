/*jshint node:true*/
'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var config = require('../config/config.js');
var path = require('path');

mongoose.connect(config.db);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'mongoose connection error:'));
db.once('open', console.log.bind(console, 'mongoose connection done'));

app.use(express.logger());

app.use(app.router);

app.use(express.static( path.join(__dirname, '..', 'public') ));
app.use(express.errorHandler());

app.listen(config.port, function() {
  console.log('Running on http://localhost:'+config.port.toString());
});

var ref_ctrl = require('../controllers/ref')(mongoose);

app.get('/ref/timestamp',   ref_ctrl.timestamp);
app.get('/ref',             ref_ctrl.used);

app.listen(3000);
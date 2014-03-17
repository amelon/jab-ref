//auto registration of jQuery & $ to global (window)
var $ = require('jquery');


//lodash need manual global registration (or maybe browserify shim ??)
global._ = global.underscore = require('lodash');

//backbone need manual global registration
var backbone = global.Backbone = require('backbone');
backbone.$ = $;

if (!backbone.cust) backbone.cust = {};

// gestion localstorage
backbone.cust.store = require('store');

//marionette needs manual global registration
global.Marionette = require('marionette');


var App = global.JabberApp = new backbone.Marionette.Application();

var ref = require('./entities/ref')(App, 'ref', backbone.cust.store);

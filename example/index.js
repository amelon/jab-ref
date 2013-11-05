require('./bower_components/jquery');
global.underscore = global._ = require('lodash');

//lodash need manual global registration (or maybe browserify shim ??)
global._ = global.underscore = require('lodash');
//backbone need manual global registration
global.Backbone = require('./bower_components/backbone/backbone.js');

//marionette needs manual global registration
global.Marionette = require('marionette');

var store = global.store = require('./bower_components/store2/dist/store2.js');

var App = global.JabberApp = new Backbone.Marionette.Application();

var ref = require('./entities/ref')(App, 'ref', store);


/**
  <code>
  App.on('initialize:after', function() {
    App.vent.once('ref:entities:synced', function(refs) {
      this.startHistory();
      if (!this.getCurrentRoute()) {
        this.navigate(this.rootRoute, {trigger: true});
      }
    });
    App.request('ref:entities:init');
  });
  </code>

  or
  this option should be easier to maintain several async with cache control flow initialization (ref, i18n, ...)
  <code>
  function initRefs() {
    var q = new $.Deferred();
    App.addInitializer( function(options) {
      App.vent.once('ref:entities:synced', function(refs) {
        q.resolve(true);
      });

      App.vent.once('ref:entities:error', function() {
        q.reject();
      });

      App.request('ref:entities:init');
    });

    return q.promise();
  }

  var refs = initRefs(); // promise obj
//  var i18n = initI18n(); // promise obj
  App.on('initialize:after', function() {
    $.when(refs /*, i18n, ... * /).done(function() {
      this.startHistory();
      if (!this.getCurrentRoute()) {
        this.navigate(this.rootRoute, {trigger: true});
      }
    });

  });
  </code>

 */
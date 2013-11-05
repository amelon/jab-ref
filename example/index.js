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


App.on('initialize:after', function() {
  App.vent.once('ref:entities:synced', function(refs) {
    this.startHistory();
    if (!this.getCurrentRoute()) {
      this.navigate(this.rootRoute, {trigger: true});
    }
  });
  App.execute('ref:entities:init');
});

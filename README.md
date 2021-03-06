jab-ref
=======

reference manager client/server with task loading

use [`mongoose`][1], [`Marionette`][2], [`grunt`][3]

client architecture is based on [`backbonerails`][4]


## Deprecated

see: https://www.npmjs.com/package/@b-flower/bdn-ref


Short structure
-------
### Loading refs

[`grunt`][5] task defined `loadref`


### Client side

use Marionette Application


### Server side

use express node server with [`mongoose`][6] backend


Usage
-------
### Loading Ref in `MongoDB`

    module.exports = function (grunt) {
      'use strict';

      require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
      grunt.loadNpmTasks('jab-ref');

      grunt.initConfig({
      , loadref: {
          options: {
            mongoose_db: 'mongodb://localhost/jab_ref_test'
          }
        , conf: {
            src: ['config/ref.conf.js']
          }
        }
      });

      grunt.registerTask('test', ['loadref']);
     };

### Server

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

    // use your own routes
    app.get('/ref/timestamp',   ref_ctrl.timestamp);
    app.get('/ref',             ref_ctrl.used);


### Client
using `browserify`

#### First step - initialize Marionette App & load Ref entities


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

    // see package.json browser key
    var ref = require('jab-ref')(App, 'ref', store);

#### Second step - init Ref entities

      App.on('initialize:after', function() {
        App.vent.once('ref:entities:synced', function(refs) {
          this.startHistory();
          if (!this.getCurrentRoute()) {
            this.navigate(this.rootRoute, {trigger: true});
          }
        });
        // ref call - make ajax call or load from localStorage
        App.execute('ref:entities:init');
      });

#### Second step - init Ref entities with Deferred
easier to maintain more than one storage (eg: one for Ref, one, i18n, ...)

      function initRefs() {
        var q = new $.Deferred();
        App.addInitializer( function(options) {
          App.vent.once('ref:entities:synced', function(refs) {
            q.resolve(true);
          });

          App.vent.once('ref:entities:error', function() {
            q.reject();
          });

          App.execute('ref:entities:init');
        });

        return q.promise();
      }

      function initI18n() {
        var q = new $.Deferred();
        ...
        return q.promise();
      }

      var refs = initRefs(); // promise obj
      var i18n = initI18n(); // promise obj
      App.on('initialize:after', function() {
        $.when(refs , i18n).done(function() {
          this.startHistory();
          if (!this.getCurrentRoute()) {
            this.navigate(this.rootRoute, {trigger: true});
          }
        });

        // if refs only you can do
        // $.when(ref).done(...);

      });


## File structure

- assets
    - entities
        - `ref.js` : file loaded in client browser application
    - `test.js` : used to build bundle for `karma` test (should maybe done in test folder directly)
    - bower_components : list of bower components needed for making tests working (see `test.js` & `bower.json`)
- config
    - `config.js` : default config for http server & mongodb conf
    - `karma.conf.js` : karma config
    - `ref.conf.js` : sample data for testing grunt load ref task
- controllers:
    - `ref.js` : express controller for loading refs in browser
- models
    - `ref.js`: mongoose model for ref collection serialization server side
- public
    - bundle
        - `bundle.js` : created by `browserify` grunt task - used for karma test
- tasks
    - `load-ref-conf.js`: grunt task for loading `js` file in `mongodb` ref collection
- test

## Other info
For loading jab-ref in the browser, the module expect use of `browserify` in conbination of `package.json` browser key.

var ref = require('jab-ref');

See `package.json` [gist][7] and browserify [doc][8] for more info.

In `package.json` file `browser` key allows this cool stuff:

    "browser": "./assets/entities/ref.js"


## License

(The MIT License)

Copyright (c) 2009-2012 A. Mélon &lt;paztaga@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


  [1]: http://mongoosejs.com/
  [2]: http://marionettejs.com/
  [3]: http://gruntjs.com/
  [4]: http://www.backbonerails.com/
  [5]: http://gruntjs.com/
  [6]: http://mongoosejs.com/
  [7]: https://gist.github.com/defunctzombie/4339901
  [8]: https://github.com/substack/node-browserify
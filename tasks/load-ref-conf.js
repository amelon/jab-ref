
'use strict';
var _ = require('lodash');
var path = require('path');
var transform = require('./lib/transform');
var async = require('async');


module.exports = function (grunt) {

  grunt.registerMultiTask('loadref', 'Load ref to database', function() {
    var done = this.async()
      , task = this;

    var options = this.options();
    var mongoose = require('mongoose');

    mongoose.connect(options.mongoose_db);
    var db = mongoose.connection;

    db.on('error', function(err) {
      grunt.log.warn('mongoose connection error' + err);
      done();
    });

    db.once('open', function() {
      grunt.verbose.writeflags(options, 'Options');
      if (task.files.length < 1) {
        grunt.verbose.warn('No file to load.');
      }

      process(grunt, task, mongoose, function() {
        db.close(done);
      });
    });
  });
};



function process(grunt, task, mongoose, done) {
  async.waterfall([
      function(callback) {
        checkFiles(grunt, task, callback);
      }

    , function(all_files, callback) {
        if (!all_files.length) {
          grunt.log.error('No file to load');
          return callback(true);
        }

        loadAllFiles(_.flatten(all_files), grunt, mongoose, callback);
      }
    ], function(err) {
      if (err) return done(false);
      done();
    });
}



function checkFiles(grunt, task, callback) {
  var all_files = [];
  _.each(task.files, function(f) {
    var files = f.src.filter(function(filepath) {

      if (!grunt.file.exists(filepath)) {
        grunt.log.warn('Source file "' + filepath + '" not found.');
        return false;

      } else {
       return true;
      }
    });
    if (files.length === 0) {
      if (f.src.length < 1) {
        grunt.log.warn('No valid file to load.');
      }
      // No src files, goto next target. Warn would have been issued above.
    } else {
      all_files.push(files);
    }

  });

  callback(null, all_files);
}


function loadAllFiles(all_files, grunt, mongoose, cb) {
  var saveRows = require('./lib/import')(mongoose);

  _.each(all_files, function(file) {
    //'.' is where gruntfile is
    file = path.resolve('.', file);
    // var x = transform();
    async.eachSeries(require(file), function(meta, nextMeta) {
      saveRows(transform(meta), nextMeta);
      // mySaveRows(transform(meta), nextMeta);
    }, function(err) {
      if (err) {
        grunt.log.error('Error during ref import: ' + err);
        return cb(err);
      }
      cb();
    });
  });
}

function mySaveRows(rows, cb) {
  async.eachSeries(rows, function(row, nextRow) {
    setTimeout(function() {
      console.log('mySaveRows', row);
      nextRow();
    }, 15);
  }, cb);
}
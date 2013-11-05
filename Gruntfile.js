/*jshint node:true*/
module.exports = function (grunt) {
	'use strict';

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.loadTasks('./tasks');

  var config = require('./config/config.js');

	grunt.initConfig({
    bundle_dest: 'public/bundle'
  , app_cli_path: 'assets'
  , app_cli_js: '<%= app_cli_path %>'
  , bower_src: '<%= app_cli_path %>/bower_components'

  , loadref: {
      options: {
        mongoose_db: config.db
      }
    , conf: {
        src: ['config/ref.conf.js']
      }
    }

  , browserify: {
     all: {
        src: ['<%= app_cli_js %>/test.js']
      , dest: '<%= bundle_dest %>/bundle.js'
      , noParse: [
          '<%= bower_src %>/jquery/jquery.js'
        , '<%= bower_src %>/backbone/backbone.js'
        , '<%= bower_src %>/backbone.marionette/lib/backbone.marionette.js'
        ]
      , options: {
          debug: true
        , fast: true
        , shim: {
            backbone: {
              path: '<%= bower_src %>/backbone/backbone.js'
            , exports: 'Backbone'
            }

          , marionette: {
              path: '<%= bower_src %>/backbone.marionette/lib/backbone.marionette.js'
            , exports: 'Marionette'
            }

          }
        //backbone need underscore alias :(
        , alias : [
            'lodash:underscore'
          , '<%= bower_src %>/jquery/jquery.js:jquery'
          ]
        }
      }
    }


	, simplemocha: {
			options: {
        ignoreLeaks: false
      , ui: 'bdd'
      // , reporter: 'dot'
      , reporter: 'spec'
      }
    , dev: { src: ['test/server/**/*-test.js'] }
    , unit: { src: ['test/server/**/*-test.js'], reporter: 'tap' }
    }

  , watch: {
      options: {
        interrupt: true
      }

    , mocha: {
        files: ['*.js', 'test/*.js']
      , tasks: ['simplemocha:dev']
      }

    , browserify: {
        files: ['<%= app_cli_js %>/**/*.js']
      , tasks: ['browserify:all']
      }

    , karma: {
        files: ['<%= browserify.all.dest %>', 'test/browser/**/*-test.js']
      , tasks: ['karma:dev:run']
      }
    }

  , karma: {
      options: {
        configFile: 'config/karma.conf.js'
      }
    , dev: {
        browsers: ['Chrome']
      , background: true
      }

    , unit: {
        singleRun: true
      , browsers: ['PhantomJS']
      }
    }

  , nodemon: {
      dev: {
        options: {
          file: 'example/server.js'
        , nodeArgs: ['--debug']
        , env: { PORT: config.port }
        , watchedExtensions: ['js']
        , ignoredFiles: ['test/**', 'node_modules/**', 'public/**', 'assets/**', 'tasks/**']
        }
      }
    }

  , concurrent: {
      target: {
        tasks: ['nodemon', 'watch']
      , options: {
          logConcurrentOutput: true
        }
      }
    }

	});

	grunt.registerTask('default', ['loadref', 'karma:dev', 'browserify', 'concurrent']);

  grunt.registerTask('test', ['loadref', 'browserify', 'simplemocha:unit', 'karma:unit']);
  grunt.registerTask('mocha', ['simplemocha', 'watch']);
};
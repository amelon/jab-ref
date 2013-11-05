/*jshint node:true */
/*global describe, it, before, after */
'use strict';

process.env.NODE_ENV = 'test';

var assert  = require('chai').assert
  , mongoose = require('mongoose')
  , config   = require('../../config/config.js')
  , db
  , Ref;

before(function(done) {

  mongoose.connect(config.db);
  db = mongoose.connection;
  db.on('error', function (err) {
    console.error('MongoDB error: ' + err.message);
    console.error('Make sure a mongoDB server is running and accessible by this application');
    throw err;
  });

  db.on('open', function() {
    Ref = require('../../models/ref')(mongoose);
    done();
  });
});

after(function(done) {
  db.close();
  done();
});


describe('Ref', function() {
  describe('Schema#timestamp', function() {
    it('should return item', function(done) {
      Ref.timestamp(function(err, item) {
        if (err) return done(err);
        assert(item);
        assert(item.updatedAt);
        done();
      });
    });
  });

  describe('Schema#used', function() {
    it('should return 4 items', function(done) {
      Ref.used(function(err, items) {
        assert.equal(items.length, 4);
        done();
      });
    });
  });

  describe('Schema#all', function() {
    it('should return 5 items', function(done) {
      Ref.all(function(err, items) {
        assert.equal(items.length, 5);
        done();
      });
    });
  });

});
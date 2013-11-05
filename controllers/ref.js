module.exports = function(mongoose) {
  var Ref     = require('../models/ref')(mongoose)
    , async   = require('async')
    , _       = require('lodash');


  function timestamp(cb) {
    Ref.timestamp(function(err, item) {
      console.log(item);
      if(err) return cb(err);
      cb(null, item);
    });
  }

function used(cb) {
  async.waterfall([
      function(callback) {
        Ref.used(callback);
      }
    , function(items, callback) {
        var max_date = new Date(0);

        items = _.map(items, function(item) {
          max_date = max_date > item.updatedAt ? max_date : item.updatedAt;
          return item.toJSON();
        });

        callback(null, { timestamp: max_date, items: items } );
      }
    ], function(err, results) {
      if (err) return cb(err);
      return cb(null, results);
    });
}


  return {
    timestamp: function(req, res, next) {
      timestamp(function(err, item) {
        if (err) return next(err);
        res.send(item);
      });
    }

  , used: function(req, res, next) {
      used(function(err, results) {
        if (err) return next(err);
        res.send(results);
      });
    }
  };


};

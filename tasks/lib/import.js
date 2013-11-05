module.exports = function(mongoose) {
  var Ref       = require('../../models/ref')(mongoose)
    , _         = require('lodash')
    , async     = require('async');


  function findById(id, cb) {
    Ref.findOne({'_id': id}, function(err, ref) {
      if (err) { return cb(err); }
        return cb(null, ref);
    });
  }


  function save(id, data, cb) {
    var ref;
    async.waterfall([
      function(callback) {
        findById(id, callback);
      }

    , function(found_ref, callback) {
        if (found_ref) {
          ref = found_ref;
          _.extend(ref, data);
        } else {
          ref = new Ref(data);
        }

        ref.save(callback);
      }

    ], function(err) {
      cb(err, ref);
    });
  }

  function saveRows(rows, cb) {
    async.eachSeries(rows, function(item, nextItem) {
      save(item._id, item, nextItem);
    }, cb);
  }

  return saveRows;
};

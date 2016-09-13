var gutil     = require('gulp-util')
var through   = require('through2')
var transform = require('./lib/transform')

var log = gutil.log.bind(gutil)

module.exports = function (options) {
  options = options || {}
  var mongoose = require('mongoose'),
      saveRows = require('./lib/import')(mongoose),
      rows     = [],
      db

  mongoose.connect(options.mongoose_db)
  db = mongoose.connection

  db.on('error', function(err) {
    throw new gutil.PluginError('gulp-load-ref', 'mongoose connection error' + err)
  })

  var _this = this
  return through.obj(function (file, enc, cb) {
    if (file.isStream()) {
      _this.emit('error', new gutil.PluginError('gulp-load-ref', 'Streaming not supported'))
      return cb()
    }

    rows = fileToRows(file.path, rows)
    cb()

  }, function (cb) {
    dbReady(db, saveRows, rows)
    .then(() => {
      db.close()
      cb()
    })
    .catch(err => {
      _this.emit('error', new gutil.PluginError('gulp-load-ref', 'error ' + err))
      db.close()
      cb()
    })
  })
}


// weird trick to ensure db is ready to insert rows
function dbReady(db, fn, rows) {
  return new Promise((resolve, reject) => {
    if (db.readyState == 2) { // connecting
      db.once('open', () => resolve(fn(rows)) )
    } else {
      resolve(fn(rows))
    }
  })
}


function fileToRows(file, rows) {
  rows = _.reduce(require(file), function(accum, meta) {
      return accum.concat(transform(meta))
    }, rows)

  return rows
}


function mySaveRows(rows, cb) {
  async.eachSeries(rows, function(row, nextRow) {
    setTimeout(function() {
      // log('mySaveRows', row)
      nextRow()
    }, 100)
  }, cb)
}

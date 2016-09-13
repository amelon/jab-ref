var Promise  = require("bluebird")
var gutil     = require('gulp-util')
var through   = require('through2')
var transform = require('./lib/transform')
var log = gutil.log.bind(gutil)

module.exports = function (mongoose) {
  // ensure mongoose is async
  var mymongoose = Promise.promisifyAll(mongoose)

  var saveRows = require('./lib/import')(mymongoose),
      rows     = [],
      db       = mymongoose.connection

  db.on('error', function(err) {
    throw new gutil.PluginError('gulp-load-ref', 'mongoose connection error' + err)
  })

  return through.obj(function (file, enc, cb) {
    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-load-ref', 'Streaming not supported'))
      return cb()
    }

    rows = fileToRows(file.path, rows)
    cb()

  }, function (cb) {
    dbReady(db)
    .then(() => saveRows(rows))
    .catch(err => {
      console.error(err)
      this.emit('error', new gutil.PluginError('gulp-load-ref', 'error ' + err))
    })
    .finally(() => {
      db.close()
      cb()
    })
  })
}


// weird trick to ensure db is ready to insert rows
function dbReady(db) {
  return new Promise((resolve, reject) => {
    if (db.readyState == 2) { // connecting
      db.once('open', () => {
        resolve()
      })
    } else {
      resolve()
    }
  })
}


function fileToRows(file, rows) {
  return require(file).reduce(
    (accum, meta) => accum.concat(transform(meta)),
    rows
  )
}

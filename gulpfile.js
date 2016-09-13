var gulp       = require('gulp')
var gutil      = require('gulp-util')
var path       = require('path')
var loadRef    = require('./tasks/gulp-load-ref')
var config     = require('./config/config.js')


gulp.task('loadref', function() {
    gulp.src('config/ref.conf.js', { read: false })
        .pipe(loadRef({ mongoose_db: config.db}))
})

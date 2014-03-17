var gulp       = require('gulp');
var gutil      = require('gulp-util');
var source     = require('vinyl-source-stream');
var path       = require('path');
var nodemon    = require('gulp-nodemon');
var mocha      = require('gulp-mocha');
var browserify = require('browserify');
var util       = require('util');
var rimraf     = require('gulp-rimraf');
var karma      = require('gulp-karma');
var loadRef    = require('./tasks/gulp-load-ref');
var config     = require('./config/config.js');


gulp.task('loadref', function() {
    gulp.src('config/ref.conf.js', { read: false })
        .pipe(loadRef({ mongoose_db: config.db}));
});


var files = {
  karma: [
    'node_modules/chai/chai.js',
    'node_modules/sinon/pkg/sinon.js',
    'public/bundle/test.js',
    'test/browser/data.js',
    'test/browser/**/*-test.js'
  ]
};


// remove package.json from bower_components to avoid conflict in require function
//  eg: removing package.json from nprogress make require('jquery') working, else require break
gulp.task('rm-package', function() {
  return gulp.src('assets/bower_components/*/package.json', { read: false })
            .pipe(rimraf({ force: true }));
});


// use domain to avoid task crashing on error
// see https://github.com/gulpjs/gulp/issues/184
var domain     = require('domain');


gulp.task('karma', function() {
  // Be sure to return the stream
  return gulp.src(files.karma)
    .pipe(karma({
      configFile: 'config/karma.conf.js',
      browsers: ['Chrome'],
      // background: true,
      action: 'watch'
    }));

});




// using vinyl-source-stream:
gulp.task('vendorjs', ['rm-package'], function() {
  var d = domain.create();

  d.on('error', function(err) {
    gutil.log(gutil.colors.red('VENDORJS ERROR'));
    gutil.beep();
    gutil.log(util.inspect(err));
  });

  d.run(function() {
    var b = browserify().add('./assets/test.js');

    // allow backbone to find underscore module - beuuurrrkkkkk (why exactly - I don't know)
    b.require('underscore', { expose: "underscore"});

    b.bundle({ insertGlobals: false })
      .pipe(source('test.js'))
      .pipe(gulp.dest('public/bundle'));
  });

  // return lr;
});


gulp.task('mocha', function() {
  gulp.src(['test/server/**/*-test.js'])
      .pipe(mocha({reporter: 'spec'}));
});




gulp.task('server', function () {
  return nodemon({ script: 'example/server.js',  watch: ['example'], ext: 'hbs js'});
});


gulp.task('watch', function() {
  gulp.watch(['*.js', 'test/*.js'], ['mocha'])
      .on('change', function(ev) { console.log('File '+ev.path+' was '+ev.type+', running tasks...') });
});



gulp.task('default', ['loadref', 'karma', 'vendorjs', 'server']);


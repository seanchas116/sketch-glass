'use strict';

var gulp = require('gulp');
var gutil = require('gutil');
var plumber = require('gulp-plumber');
var shell = require("gulp-shell");
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var sourcemaps = require('gulp-sourcemaps');
var xtend = require('xtend');
var deploy = require('gulp-gh-pages');
var webserver = require('gulp-webserver');

function notifyError () {
  return plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  });
}

gulp.task("tsc-watch", shell.task([
  "tsc -w"
]));

gulp.task("tsc", shell.task([
  "tsc"
]));

gulp.task('watch-bundle', ["tsc"], function() {
  var args = xtend(watchify.args, {
    debug: true
  });
  var bundler = watchify(browserify('./build/index.js', args))
    .transform("babelify")
    .transform('debowerify');

  function bundle () {
    return bundler
      .bundle()
      .on('error', notify.onError('Error: <%= error.message %>'))
      .pipe(source('bundle.js'))
      .pipe(notify("Build Finished"))
      .pipe(gulp.dest('./dist'));
  }

  bundle();
  bundler.on('update', bundle);
});

gulp.task('release-bundle', ["tsc"], function() {
  return browserify('./build/index.js')
    .transform("babelify")
    .transform('debowerify')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(notify("Build Finished"))
    .pipe(gulp.dest('./dist'));
});

gulp.task('deploy', ['release-bundle'], function() {
  return gulp.src('./dist/**/*')
    .pipe(deploy());
});

gulp.task('webserver', function() {
  gulp.src('dist')
    .pipe(webserver({
      host: '0.0.0.0',
      livereload: true,
      open: true
    }));
})

gulp.task('default', ["tsc-watch", 'watch-bundle', 'webserver']);

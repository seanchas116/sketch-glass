'use strict';

var gulp = require('gulp');
var gutil = require('gutil');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var sourcemaps = require('gulp-sourcemaps');
var xtend = require('xtend');
var tslint = require('gulp-tslint');
var deploy = require('gulp-gh-pages');

function notifyError () {
  return plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  });
}

gulp.task('lint', function() {
  return gulp.src('./src/**/*.ts')
    .pipe(notifyError())
    .pipe(tslint())
    .pipe(tslint.report('verbose'))
    .pipe(notify('Lint Finished'));
});

gulp.task('watch-lint', ['lint'], function() {
  return gulp.watch('./src/**/*.ts', ['lint']);
});

gulp.task('watch-bundle', function() {
  var args = xtend(watchify.args, {
    debug: true
  });
  var bundler = watchify(browserify('./src/index.ts', args))
    .plugin('tsify', {
      noImplicitAny: true,
      target: 'ES5'
    })
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

gulp.task('release-bundle', function() {
  return browserify('./src/index.ts')
    .plugin('tsify', {
      noImplicitAny: true,
      target: 'ES5'
    })
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

gulp.task('default', ['watch-lint', 'watch-bundle']);

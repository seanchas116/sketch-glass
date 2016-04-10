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
const jade = require("gulp-jade");
const less = require("gulp-less")
const iconfont = require("gulp-iconfont");

const runTimestamp = Math.round(Date.now()/1000);

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

gulp.task("jade", () => {
  return gulp.src("index.jade")
    .pipe(jade())
    .pipe(gulp.dest("./dist"));
});

gulp.task("less", () => {
  return gulp.src("index.less")
    .pipe(less())
    .pipe(gulp.dest("./dist"));
});

gulp.task("copy-vendor", () => {
  return gulp.src("node_modules/normalize.css/normalize.css")
    .pipe(gulp.dest("./dist/vendor"));
});

gulp.task("iconfont", () => {
  return gulp.src("icons/*.svg")
    .pipe(iconfont({
      fontName: "sg-icon",
      prependUnicode: true,
      timestamp: runTimestamp
    }))
    .on("glyphs", (glyphs, options) => {
      console.log(glyphs, options);
    })
    .pipe(gulp.dest("./dist/fonts"));
});

gulp.task("watch", ["jade", "less"], () => {
  gulp.watch("index.jade", ["jade"]);
  gulp.watch("index.less", ["less"]);
});

gulp.task('watch-bundle', ["tsc"], function() {
  var args = xtend(watchify.args, {
    debug: true
  });
  var bundler = watchify(browserify('./build/index.js', args))
    .transform("babelify", {presets: ["es2015"]});

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

gulp.task('release-bundle', ["jade", "less", "copy-vendor", "tsc"], function() {
  return browserify('./build/index.js')
    .transform("babelify", {presets: ["es2015"]})
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

gulp.task('release', ['release-bundle'], function() {
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

gulp.task('default', ["copy-vendor", "watch", "tsc-watch", 'watch-bundle', 'webserver']);

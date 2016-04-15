'use strict';

const gulp = require('gulp');
const gutil = require('gutil');
const plumber = require('gulp-plumber');
const shell = require("gulp-shell");
const notify = require('gulp-notify');
const uglify = require('gulp-uglify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const sourcemaps = require('gulp-sourcemaps');
const xtend = require('xtend');
const deploy = require('gulp-gh-pages');
const webserver = require('gulp-webserver');
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

gulp.task("less", () => {
  return gulp.src("index.less")
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
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

gulp.task("build-assets", ["less", "copy-vendor", "iconfont"]);

gulp.task("watch", () => {
  gulp.watch("index.less", ["less"]);
});

gulp.task('watch-bundle', ["tsc"], () => {
  const args = xtend(watchify.args, {
    debug: true
  });
  const bundler = watchify(browserify('./build/index.js', args))
    .transform("babelify", {presets: ["es2015"]});

  const bundle = () => {
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

gulp.task('release-bundle', ["build-assets"], () => {
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

gulp.task('release', ['release-bundle'], () => {
  return gulp.src('./dist/**/*')
    .pipe(deploy());
});

gulp.task('webserver', () => {
  gulp.src('dist')
    .pipe(webserver({
      host: '0.0.0.0',
      livereload: true,
      open: true
    }));
})

gulp.task('default', ["build-assets", "watch", "tsc-watch", 'watch-bundle', 'webserver']);

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var colors = require('colors');
var clean = require('gulp-clean');
var stream = require('vinyl-source-stream');
var nodemon = require('gulp-nodemon');
var flatten = require('gulp-flatten');
var reactify = require('reactify');
var recursive = require('recursive-readdir');
var browserify = require('browserify');
var runSequence = require('run-sequence');

var scriptsDir = './client/scripts';
var stylesDir = './client/styles';
var assetsDir = './client/assets';
var targetDir = './dist/';
var entryPoint = 'main.js';

var scripts;;

/**
  Tasks
*/

gulp.task('default', function(cb) {
  runSequence('makeDir', 'clean', ['getScripts', 'copyStyles', 'copyAssets'], 'bundle', 'server', cb);
});

gulp.task('build', function(cb) {
  runSequence('makeDir', 'clean', ['getScripts', 'copyStyles', 'copyAssets'], 'bundle', cb);
});

/*
  Make And Clean
*/
gulp.task('makeDir', function (cb) {
  if (!fs.existsSync(targetDir)) {
   fs.mkdirSync(targetDir);
  }
  cb();
});

gulp.task('clean', function (cb) {
  return gulp.src('dist', { read: false })
    .pipe(clean());
    cb();
});

/**
  Get All JS Files in scripts dir and any of its subdirs
*/

gulp.task('getScripts', function(cb) {
  recursive(scriptsDir, function(err, files) {
    if (err) console.log(err);
    scripts = files;
    cb();
  });
});

/**
  Copy Style Sheets
*/

gulp.task('copyStyles', function(cb) {
  console.log('** Copying Styles **'.magenta);
  gulp.src(stylesDir + '*/**.css')
    .pipe(flatten())
    .pipe(gulp.dest(targetDir))
  cb();
});

/**
  Copy Assets
*/

gulp.task('copyAssets', function(cb) {
  console.log('** Copying Assets **'.magenta);
  gulp.src(assetsDir + '*/**')
    .pipe(gulp.dest(targetDir))
  cb();
});

/**
  Browserify, Transform JSX
*/

gulp.task('bundle', function(cb) {
  console.log('** Bundling Script **'.magenta);
  browserify({ entries: [scriptsDir + '/' + entryPoint], debug: true })
    .transform(reactify)
    .bundle()
    .pipe(stream(entryPoint))
    .pipe(gulp.dest(targetDir))
  cb();
});

/**
  Watch Scripts and Styles, Bundle or Copy
*/

var watchFiles = function() {
  console.log('** Watching Files **'.magenta);
  gulp.watch(scripts, ['bundle'])
  gulp.watch(stylesDir + '/' + "*.css", ['copyStyles']);
  gulp.watch(assetsDir + '/styles/' + "*.css", ['copyAssets']);
};

/**
  Server
*/

gulp.task('server', function() {
  nodemon({
      script: 'server/app.js',
      ext: 'js',
      ignore: ['client/', 'dist/']
    })
    .on('start', function() {
      watchFiles();
      console.log('** Start ** Gulp Nodemon'.green);
    })
    .on('restart', function() {
      console.log('** Restarting ** Gulp Nodemon'.green);
    })
});
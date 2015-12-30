var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var stream = require('vinyl-source-stream');
var nodemon = require('gulp-nodemon');
var flatten = require('gulp-flatten');
var reactify = require('reactify');
var recursive = require('recursive-readdir');
var browserify = require('browserify');
var runSequence = require('run-sequence');

var scriptsDir = './client/scripts';
var stylesDir = './client/styles';
var targetDir = './dist/';
var entryPoint = 'main.js';

var scripts = [];

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir);
}

/**
  Tasks
*/

gulp.task('default', function(cb) {
  runSequence(['getScripts', 'copyStyles'], 'bundle', 'server', 'watch', cb);
});

gulp.task('build', function(cb) {
  runSequence(['getScripts', 'copyStyles'], 'bundle');
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
  return gulp.src(stylesDir + '*/**.css')
    .pipe(flatten())
    .pipe(gulp.dest(targetDir))
  cb();
});

/**
  Browserify, Transform JSX
*/

gulp.task('bundle', function(cb) {
  return browserify({
      entries: [scriptsDir + '/' + entryPoint],
      debug: true
    })
    .transform(reactify)
    .bundle()
    .pipe(stream(entryPoint))
    .pipe(gulp.dest(targetDir))
  cb();
});

/**
  Server
*/

gulp.task('server', function(cb) {
  return nodemon({
      script: 'server/app.js',
      ext: 'js',
      ignore: ['client/', 'dist/']
    })
    .on('start', function() {
      console.log('** Start ** Gulp Nodemon');
      cb();
    })
    .on('restart', function() {
      console.log('** Restart ** Gulp Nodemon');
      cb();
    })
});

/**
  Watch Scripts and Styles, Bundle or Copy
*/

gulp.task('watch', function() {
  gulp.watch(scripts, ['bundle'])
  gulp.watch(stylesDir + '/' + "*.css", ['copyStyles']);
});

var fs = require('fs');
var gulp = require('gulp');
var stream = require('vinyl-source-stream');
var flatten = require('gulp-flatten');
var reactify = require('reactify');
var nodemon = require('gulp-nodemon');
var browserify = require('browserify');

var scriptsDir = './client/scripts';
var stylesDir = './client/styles';
var targetDir = './dist/';
var entryPoint = 'main.js';

if (!fs.existsSync(targetDir)){
  fs.mkdirSync(targetDir);
}

gulp.task('buildScript', function(cb) {
  return browserify({ entries: [scriptsDir + '/' + entryPoint], debug: true })
    .transform(reactify)
    .bundle()
    .pipe(stream(entryPoint))
    .pipe(gulp.dest(targetDir))
    cb();
});

gulp.task('copyStyles', function(cb) {
 return gulp.src(stylesDir + '*/**.css')
    .pipe(flatten())
    .pipe(gulp.dest(targetDir))
    cb();    
});

gulp.task('watch', function() {
  gulp.watch(scriptsDir + '/' + "*/**.js", ['buildScript'])
  gulp.watch(stylesDir + '/' + "*.css", ['copyStyles']);
});

gulp.task('server', function() {
  return nodemon({ script: 'server/app.js', ignore: ['client/**/*', 'dist/**/*'] }).on('start', function() {
    console.log('Gulp Nodemon Started.');
  });
});


gulp.task('default', ['build', 'server', 'watch']);
gulp.task('build', ['copyStyles', 'buildScript']);
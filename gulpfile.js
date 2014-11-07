var gulp = require('gulp');
var less = require('gulp-less');
var exec = require('child_process').exec;
var sourcemaps = require('gulp-sourcemaps');
var csso = require('gulp-csso');
var rename = require('gulp-rename');

function spawn(cmd) {
  var child = exec(cmd);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  process.on('uncaughtexception', function() {
    child.exit();
  });
  process.on('exit', function(code) {
    child.exit(code);
  });
  child.on('exit', function(code) {
    process.exit(code);
  });
}

gulp.task('less', function() {
  gulp.src('assets/less/main.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/css'));
});

gulp.task('cssmin', function() {
  gulp.src('public/css/main.css')
    .pipe(csso())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
  spawn('npm run dev');
  spawn('npm run watch-js');
  gulp.watch('assets/less/**/*.less', ['less']);
});

gulp.task('default', ['less', 'watch']);

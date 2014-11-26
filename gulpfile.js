var gulp = require('gulp');
var connect = require('gulp-connect');
var open = require("gulp-open");
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var port = process.env.port || 3031;

gulp.task('browserify', function() {
    gulp.src('./app/src/js/main.js')
      .pipe(browserify({transform: 'reactify'}))
      .pipe(concat('app.js'))
      .pipe(gulp.dest('./app/dist/js'));
});

gulp.task('open', function(){
  var options = {
    url: 'http://localhost:' + port,
  };
  gulp.src('./app/index.html')
  .pipe(open('', options));
});

gulp.task('connect', function() {
  connect.server({
    root: 'app',
    port: port,
    livereload: true
  });
});

gulp.task('js', function () {
  gulp.src('./app/js/**/*.js')
    .pipe(connect.reload());
});

gulp.task('html', function () {
  gulp.src('./app/*.html')
    .pipe(connect.reload());
});

gulp.task('bower', function(){
  gulp.src([
    './bower_components/firebase/firebase.js'
    ])
    .pipe(gulp.dest('./app/lib'));
});

gulp.task('watch', function() {
    gulp.watch('app/index.html', ['html']);
    gulp.watch('app/js/**/*.js', ['js']);
});

gulp.task('copy', function(){
  gulp.src('./src/perf.js')
    .pipe(gulp.dest('dist'));
});

gulp.task('lint', function () {
    return gulp.src(['./src/**/*.js'])
        .pipe(eslint({
          rules: {
            'no-unused-vars': false
          },
          globals: {
            'window': true,
            'XMLHttpRequest': true,
            'setTimeout': true,
            'PerformanceResourceTiming': true
          }
        }))
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('default', ['lint', 'copy']);

gulp.task('serve', ['default', 'connect', 'open', 'watch']);
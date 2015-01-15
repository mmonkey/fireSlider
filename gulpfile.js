var gulp = require('gulp'),
	browserify = require('browserify'),
	browserSync = require('browser-sync'),
	jshint = require('gulp-jshint'),
	rename = require('gulp-rename'),
	sass = require('gulp-ruby-sass'),
	transform = require('vinyl-transform'),
	uglify = require('gulp-uglify'),
	util = require('gulp-util');

gulp.task('sass', function() {
	return gulp.src(['build/scss/*.scss', '!build/scss/_*.scss'])
		.pipe(sass({
			style: 'compressed'
		}))
		.on('error', function (err) { console.log(err.message); })
		.pipe(gulp.dest('build/css'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('doc-sass', function() {
	return gulp.src(['docs/scss/*.scss', '!docs/scss/_*.scss'])
		.pipe(sass({
			style: 'compressed'
		}))
		.on('error', function (err) { console.log(err.message); })
		.pipe(gulp.dest('docs/css'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('lint', function() {
	return gulp.src(['build/js/fireSlider.js', '!build/js/**/*.min.js', 'docs/js/*.js', '!docs/js/**/*.min.js', '!build/js/**/*.dev.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('browserify', function () {
  var browserified = transform(function(filename) {
    var b = browserify(filename);
    return b.bundle();
  });

  return gulp.src(['build/js/*.js', '!build/js/**/*.min.js', '!build/js/**/*.dev.js'])
    .pipe(browserified)
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('dev', function () {
  var browserified = transform(function(filename) {
    var b = browserify(filename);
    return b.bundle();
  });

  return gulp.src(['build/js/*.js', '!build/js/**/*.min.js', '!build/js/**/*.dev.js'])
    .pipe(browserified)
    .pipe(rename({suffix: '.dev'}))
    .pipe(gulp.dest('build/js'));
});

gulp.task('browser-sync', function() {
	browserSync.init(null, {
		server: { baseDir: "./", directory: true }
	});
});

gulp.task('default', ['browser-sync'], function() {
	gulp.watch('build/scss/**/*.scss', ['sass']);
	gulp.watch('docs/scss/**/*.scss', ['doc-sass']);
	gulp.watch('**/*.html', browserSync.reload);
	gulp.watch(['build/js/*.js', '!build/js/**/*.dev.js'], ['lint', 'browserify', 'dev', browserSync.reload]);
});
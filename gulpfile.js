var gulp = require('gulp'),
		browserify = require('browserify'),
		browserSync = require('browser-sync'),
		inject = require('gulp-inject-string'),
		jshint = require('gulp-jshint'),
		rename = require('gulp-rename'),
		sass = require('gulp-ruby-sass'),
		transform = require('vinyl-transform'),
		uglify = require('gulp-uglify'),
		util = require('gulp-util');

var version = '1.5.6';
var versionComment = '/*! fireSlider (' + version + ') (C) 2014 CJ O\'Hara. MIT @license: en.wikipedia.org/wiki/MIT_License */\n';
var velocityComment = '/*! VelocityJS.org (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License */\n/*! VelocityJS.org jQuery Shim (C) 2014 The jQuery Foundation. MIT @license: en.wikipedia.org/wiki/MIT_License. */\n';
var velocity = 'var Velocity = require(\'velocity-animate\');\n';

gulp.task('sass', function() {
	sass('build/scss/stylesheet.scss', {style: 'compressed'})
		.on('error', function (err) { console.log(err.message); })
		.pipe(gulp.dest('build/css'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('lint', function() {
	return gulp.src('build/js/jquery.fireSlider.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('min', ['lint'], function() {
	return gulp.src('build/js/jquery.fireSlider.js')
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist'));
});

gulp.task('velocity', ['lint'], function() {
	return gulp.src('build/js/jquery.fireSlider.js')
		.pipe(inject.prepend(velocity))
		.pipe(rename({suffix: '.velocity'}))
		.pipe(gulp.dest('dist'));
});

gulp.task('browserify', ['velocity'], function() {
	var browserified = transform(function(filename) {
		var b = browserify(filename);
		return b.bundle();
	});

	return gulp.src('dist/jquery.fireSlider.velocity.js')
		.pipe(browserified)
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

gulp.task('versionComment', ['min'], function() {
	return gulp.src(['dist/jquery.fireSlider.min.js'])
		.pipe(inject.prepend(versionComment))
		.pipe(gulp.dest('dist'));
});

gulp.task('velocityComment', ['browserify'], function() {
	return gulp.src(['dist/jquery.fireSlider.velocity.js'])
		.pipe(inject.prepend(versionComment + velocityComment))
		.pipe(gulp.dest('dist'));
});

gulp.task('browser-sync', function() {
	browserSync.init({
		server: {
			baseDir: "./",
			index: "build/index.html"
		}
	});
});

gulp.task('default', ['browser-sync'], function() {
	gulp.watch('build/scss/**/*.scss', ['sass']);
	gulp.watch('**/*.html', browserSync.reload);
	gulp.watch('build/js/*.js', ['lint', 'min', 'velocity', 'browserify', 'versionComment', 'velocityComment', browserSync.reload]);
});
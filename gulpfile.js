var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	browserSync = require('browser-sync');

gulp.task('lint', function() {
	return gulp.src(['js/*.js', '!js/**/*.min.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('compress', function() {
	gulp.src(['js/*.js', '!js/**/*.min.js'])
	.pipe(uglify())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('dist'));
});

gulp.task('browser-sync', function() {
	browserSync.init(null, {
		server: {
			baseDir: "./",
			directory: true
		}
	});
});

gulp.task('default', ['browser-sync'], function() {
	gulp.start('lint', 'compress');
	gulp.watch('js/*.js', ['lint', 'compress', browserSync.reload]);
});
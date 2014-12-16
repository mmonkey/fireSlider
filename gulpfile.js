var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	browserSync = require('browser-sync');

gulp.task('lint', function() {
	return gulp.src(['build/js/*.js', '!build/js/**/*.min.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('beautify', function() {
	gulp.src(['build/js/*.js', '!build/js/**/*.min.js'])
		.pipe(uglify({
			output: {
				beautify: true,
				comments: true
			}
		}))
		.pipe(gulp.dest('dist'));
})

gulp.task('compress', function() {
	gulp.src(['build/js/*.js', '!build/js/**/*.min.js'])
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist'));
});

gulp.task('browser-sync', function() {
	browserSync.init(null, {
		server: {
			baseDir: "./build/",
			directory: false
		}
	});
});

gulp.task('default', ['browser-sync'], function() {
	gulp.start('lint', 'beautify', 'compress');
	gulp.watch('js/*.js', ['lint', 'beautify', 'compress', browserSync.reload]);
});
var gulp = require('gulp'),
	browserSync = require('browser-sync'),
	inject = require('gulp-inject-string'),
	jshint = require('gulp-jshint'),
	rename = require('gulp-rename'),
	sass = require('gulp-ruby-sass'),
	uglify = require('gulp-uglify');

gulp.task('sass', function() {
	return sass('assets/_scss/site.scss', { style: 'compressed' })
	.on('error', function(e) { console.log(e.message); })
	.pipe(gulp.dest('assets/_css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('lint', function() {
	return gulp.src('assets/_js/site.js')
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});

gulp.task('min', ['lint'], function() {
	return gulp.src('assets/_js/site.js')
	.pipe(uglify())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('assets/_js'));
});

gulp.task('browser-sync', function() {
	browserSync.init({
		server: {
			baseDir: "./",
			directory: true
		}
	});
});

gulp.task('default', ['browser-sync'], function() {
	gulp.watch('assets/_scss/**/*.scss', ['sass']);
	gulp.watch('**/*.html', browserSync.reload);
	gulp.watch('assets/_js/site.js', ['lint', 'min', browserSync.reload]);
});
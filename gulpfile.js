var gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync'),
	concat = require('gulp-concat'),
	inject = require('gulp-inject-string'),
	jshint = require('gulp-jshint'),
	rename = require('gulp-rename'),
	sass = require('gulp-ruby-sass'),
	uglify = require('gulp-uglify');

var prefixBrowsers = [
	'> 1%',
	'last 2 versions',
	'ie 9',
	'ie 10',
	'Firefox ESR',
	'Opera 12.1'
];

gulp.task('sass', function() {
	return sass('./assets/scss/docs.scss', { style: 'compressed' })
		.on('error', function(e) { console.log(e.message); })
		.pipe(autoprefixer({browsers: prefixBrowsers}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./dist/'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('lint', function() {
	return gulp.src('./assets/js/docs.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('min', ['lint'], function() {
	return gulp.src('./assets/js/docs.js')
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./dist/'));
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
	gulp.watch('assets/scss/**/*.scss', ['sass']);
	gulp.watch('**/*.html', browserSync.reload);
	gulp.watch('assets/js/docs.js', ['lint', 'min', browserSync.reload]);
});
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
	return sass('./assets/_scss/docs.scss', { style: 'compressed' })
		.on('error', function(e) { console.log(e.message); })
		.pipe(autoprefixer({browsers: prefixBrowsers}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./dist/'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('lint', function() {
	return gulp.src('./assets/_js/docs.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('min', ['lint'], function() {
	return gulp.src('./assets/_js/docs.js')
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./assets/_js/'));
});

gulp.task('concat', ['min'], function() {
	return gulp.src(['./assets/_js/vendor/jquery-1.11.2.min.js', './assets/_js/vendor/prism.js', './assets/_js/fireSlider.velocity.js', './assets/_js/docs.min.js'])
		.pipe(concat('docs.min.js'))
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
	gulp.watch('assets/_scss/**/*.scss', ['sass']);
	gulp.watch('**/*.html', browserSync.reload);
	gulp.watch('assets/_js/docs.js', ['lint', 'min', 'concat',browserSync.reload]);
});
var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	jshint = require('gulp-jshint'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	notify = require('gulp-notify'),
	browserSync = require('browser-sync');

gulp.task('sass', function() {
	return gulp.src(['build/scss/*.scss', '!build/scss/_*.scss'])
		.pipe(sass({
			style: 'compressed',
			sourcemapPath: 'build/css'
		}))
		.on('error', function (err) { console.log(err.message); })
		.pipe(gulp.dest('build/css'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('doc-sass', function() {
	return gulp.src(['docs/scss/*.scss', '!docs/scss/_*.scss'])
		.pipe(sass({
			style: 'compressed',
			sourcemapPath: 'docs/css'
		}))
		.on('error', function (err) { console.log(err.message); })
		.pipe(gulp.dest('docs/css'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('lint', function() {
	return gulp.src(['build/js/*.js', '!build/js/**/*.min.js', 'docs/js/*.js', '!docs/js/**/*.min.js'])
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
			baseDir: "./",
			directory: true
		}
	});
});

gulp.task('default', ['browser-sync'], function() {
	gulp.start('sass', 'doc-sass', 'lint', 'beautify', 'compress');
	gulp.watch('build/js/*.js', ['lint', 'beautify', 'compress', browserSync.reload]);
	gulp.watch('**/*.html', browserSync.reload);
	gulp.watch('build/scss/**/*.scss', ['sass']);
	gulp.watch('docs/scss/**/*.scss', ['doc-sass']);
});
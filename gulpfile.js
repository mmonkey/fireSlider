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
	gulp.start('sass', 'lint', 'beautify', 'compress');
	gulp.watch('build/js/*.js', ['lint', 'beautify', 'compress', browserSync.reload]);
	gulp.watch('**/*.html', browserSync.reload);
	gulp.watch('build/scss/**/*.scss', ['sass']);
});
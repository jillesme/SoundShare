var gulp   = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

module.exports = function () {
	gulp.src('public/src/fonts/**')
		.pipe(gulp.dest('src/main/webapp/fonts'));

	gulp.src('public/src/img/**')
		.pipe(gulp.dest('src/main/webapp/img'));

	gulp.src([
		'public/src/js/react.js',
		'public/libs/q/q.js'
		])
		.pipe(concat('lib.min.js'))
		.pipe(gulp.dest('src/main/webapp/js'));
};
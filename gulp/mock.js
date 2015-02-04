var gulp = require('gulp');
var shell = require('gulp-shell');

module.exports = function () {
	return gulp.src('public/src/js/ecar.jsx')
	    .pipe(shell([
	      // --data --watch flags
	      'stubby -d public/rest/config.yaml',
	    ]));
};
var gulp = require('gulp');

/**
 * Development
 */
var server      = require('./gulp/server');
var scripts     = require('./gulp/scripts');
var styles      = require('./gulp/styles');
var watch       = require('./gulp/watch');
var copy        = require('./gulp/copy');
var copyHTML    = require('./gulp/copy-html');
var test        = require('./gulp/test');
var mock        = require('./gulp/mock');

gulp.task('server', server);
gulp.task('scripts', scripts);
gulp.task('styles',  styles);
gulp.task('watch', watch);
gulp.task('karma', test(false));
gulp.task('karma:debug', test(true));
gulp.task('copy:html', copyHTML);
gulp.task('copy', copy);

gulp.task('build', [
  'scripts',
  'styles'
  ]);

gulp.task('test', [
  'build',
  'karma'
  ]);

/**
 * Production
 */

var stylesProd  = require('./gulp/prod/styles');
var scriptsProd = require('./gulp/prod/scripts');
var htmlProd	= require('./gulp/prod/html');
var copyProd	= require('./gulp/prod/copy');

gulp.task('scripts:prod', scriptsProd);
gulp.task('styles:prod', stylesProd);
gulp.task('html:prod', htmlProd);
gulp.task('copy:prod', copyProd);

gulp.task('build:prod', [
  'scripts:prod',
  'styles:prod',
  'html:prod',
  'copy:prod',
  ]);

gulp.task('default', [
  'server',
  'build',
  'copy',
  'copy:html',
  'watch'
  ]);

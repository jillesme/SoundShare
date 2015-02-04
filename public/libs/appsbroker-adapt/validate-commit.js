#!/usr/bin/env node

/**
 * Installation:
 * >> ln -s ../../validate-commit.js .git/hooks/pre-commit
 * >> chmod u+x .git/hooks/pre-commit
 */

var gulp        = require('gulp');
var plumber     = require('gulp-plumber');
var karma       = require('gulp-karma');
var notify      = require('gulp-notify');
var multipipe = require('multipipe');
var paths = [
    'lib/es5-shim/es5-shim.js',
    'lib/react/react-with-addons.js',
    'test/build/**/*',
    'test/spec/*.spec.js' ];

var tests = multipipe(
    gulp.src(paths),
    karma(
      {
        configFile: 'test/karma.conf.js',
        action: 'run'
      }
    )
  );

var errorHandler = function( e ) {
  console.error('Tests failed, code not commited');
  process.exit(1);
};

tests.on('error', errorHandler);

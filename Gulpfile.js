'use strict';
var gulp = require('gulp');
var requireDir = require('require-dir');
var helpers = require('./gulp/helpers');
var runSequence = require('run-sequence');
requireDir('./gulp/tasks', {
  recurse: true
});

gulp.task('test', ['eslint-build', 'esdoc', 'mocha-server'], function () {
  console.log('checking for error');
  if (helpers.getError()) {
    throw helpers.getError();
  }
});
gulp.task('default', function () {
  return gulp.start('eslint-build', 'esdoc',
    'mocha-server');
});

gulp.task('build', (done) => {
  runSequence('transpile', 'webpack', () => {
    done();
  });
});

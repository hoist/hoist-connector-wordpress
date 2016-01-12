'use strict';
var gulp = require('gulp');
var del = require('del');

gulp.task('clean-coverage', function () {

  return del('coverage/**/*');
});
gulp.task('clean-compiled', function () {
  return del('lib/**/*');
});
gulp.task('clean-docs', function () {
  return del('code-docs/**/*');
});


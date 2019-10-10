const gulp = require('gulp'),
    src = 'src/',
    build = 'build/',
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    pipeline = require('readable-stream').pipeline,
    jsdoc = require('gulp-jsdoc3');

gulp.task('default', function() {
    var jsdocConfig = require('./jsdocConfig');
    return pipeline(
        gulp.src([src + 'js/**/*.js']),
        jsdoc(jsdocConfig),
        gulp.dest(build),
        sourcemaps.init(),
        uglify(),
        rename({suffix: '.min'}),
        sourcemaps.write('.'),
        gulp.dest(build)
    );
});

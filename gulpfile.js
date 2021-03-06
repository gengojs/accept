/* Dev-Dependencies */
var 
  gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  babel = require('gulp-babel'),
  mocha = require('gulp-spawn-mocha'),
  jshint = require('gulp-jshint'),
  beautify = require('gulp-jsbeautify'),
  shell = require('gulp-shell'),
  ghPages = require('gulp-gh-pages'),
  rimraf = require('rimraf'),
  config = require('./config'),
  semver = require('semver'),
  version = require('node-version').long,
  isHarmony = !semver.lt(version.toString(), '0.11.0'),
  changelog = require('gulp-changelog');

/** Backs up the files in case of emergency! */
gulp.task('backup', function () {
  return gulp
    .src('src/**/**/**.js')
    .pipe(gulp.dest('./.backup'));
});

gulp.task('recover', function () {
  return gulp
    .src('./.backup/**/**/*.js')
    .pipe(gulp.dest('src/'));
});

/* Formats the files */
gulp.task('beautify', ['backup'], function () {
  return gulp.src('./src/**/**/*.js')
    .pipe(beautify(config.beautify))
    .pipe(gulp.dest('./src'));
});

/*
 * Clean the docs themes folder
 */
gulp.task('clean-docs', ['gh-pages'], function (cb) {
  rimraf('./docs/', cb);
});

/*
 * Create the gh-pages branch - wont push automatically
 */
gulp.task('gh-pages', ['doc'], function () {
  return gulp.src('./docs/**/*')
    .pipe(ghPages());
});


/* Checks the coding style and builds from ES6 to ES5*/
gulp.task('src', ['beautify'], function () {
  return gulp.src('./src/**/**/*.js')
    .pipe(jshint(config.jshint))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .pipe(sourcemaps.init())
    .pipe(babel({
      "presets": ["es2015"],
      "plugins":["transform-regenerator"]
    }))
    .pipe(sourcemaps.write('./source maps/'))
    .pipe(gulp.dest('./'));
});

/* Watches for changes and applies the build task*/
gulp.task('watch', function () {
  return gulp.watch('./src/**/**/*.js', ['build']);
});

/* Runs tests */

gulp.task('test', ['src'], function (cb) {
  if (isHarmony)
    return gulp.src('./tests/**/*.js')
    .pipe(shell(['mocha --harmony <%= file.path %>']));
  else return gulp.src([
    './tests/express/index.js',
    './tests/hapi/index.js'
  ]).pipe(mocha());
});

gulp.task('changelog', function (cb) {
  changelog(require('./package.json')).then(function (stream) {
    stream.pipe(gulp.dest('./')).on('end', cb);
  });
});

/* 
 * Runs the doxx command and builds the docs 
* Install other themes here, generate docs for each.
*/
gulp.task('doc', ['build'], shell.task([
  (function(){
    var doc = 'node_modules/mr-doc/bin/mr-doc',
        cmd = {
          source: ' -s src/',
          output: ' -o docs/',
          name:' -n "gengo.js/accept"',
          theme:' -t cayman'
        };
    return doc + cmd.source + cmd.output + cmd.name + cmd.theme;
  })()
]));

gulp.task('default', ['backup', 'beautify', 'src', 'watch']);

gulp.task('build', ['backup', 'beautify', 'src', 'test']);

gulp.task('docs', ['build', 'doc', 'gh-pages', 'clean-docs']);
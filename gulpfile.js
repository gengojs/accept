/* Dev-Dependencies */
var 
  gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  babel = require('gulp-babel'),
  mocha = require('gulp-mocha'),
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

if (!isHarmony) {
  require("harmonize")(["harmony-generators"]);
}

/** Backs up the files in case of emergency! */
gulp.task('backup', function () {
  return gulp
    .src('lib/**/**/**.js')
    .pipe(gulp.dest('./.backup'));
});

gulp.task('recover', function () {
  return gulp
    .src('./.backup/**/**/*.js')
    .pipe(gulp.dest('lib/'));
});

/* Formats the files */
gulp.task('beautify', ['backup'], function () {
  return gulp.src('./lib/**/**/*.js')
    .pipe(beautify(config.beautify))
    .pipe(gulp.dest('./lib'));
});

/*
 * Clean the docs themes folder
 */
gulp.task('clean-docs', ['gh-pages'], function (cb) {
  rimraf('./docs/themes', cb);
});

/*
 * Create the gh-pages branch - wont push automatically
 */
gulp.task('gh-pages', ['doc'], function () {
  return gulp.src('./docs/**/*')
    .pipe(ghPages());
});


/* Checks the coding style and builds from ES6 to ES5*/
gulp.task('lib', ['beautify'], function () {
  return gulp.src('./lib/**/**/*.js')
    .pipe(jshint(config.jshint))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('./source maps/'))
    .pipe(gulp.dest('./'));
});

/* Watches for changes and applies the build task*/
gulp.task('watch', function () {
  return gulp.watch('./lib/**/**/*.js', ['build']);
});

/* Runs tests */

gulp.task('test', ['lib'], function () {
  if (isHarmony)
    return gulp.src('./tests/**/**/*.js', { read: false })
    // gulp-mocha needs filepaths so you can't have any plugins before it
      .pipe(mocha())
      .once('end', function () {
        process.exit();
      });
  else return gulp.src([
    './tests/express/index.js',
    './tests/hapi/index.js'
  ], { read: false })
    .pipe(mocha())
    .once('end', function () {
      process.exit();
    });
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
  './bin/mr-doc --source lib --output docs/themes/doxx-theme-default --name Mr. Doc'
]));

gulp.task('default', ['backup', 'beautify', 'lib', 'watch']);

gulp.task('build', ['backup', 'beautify', 'lib', 'test']);

gulp.task('docs', ['build', 'doc', 'gh-pages', 'clean-docs']);
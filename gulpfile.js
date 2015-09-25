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


/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * node-harmonize (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/node-harmonize for details
 */
var child_process = require("child_process");

(function harmony() {
    if (typeof Proxy == 'undefined') { // We take direct proxies as our marker
        if (!isHarmony) return;
        
        var features = ['--harmony', '--harmony-proxies'];
        var node = child_process.spawn(process.argv[0], features.concat(process.argv.slice(1)), { stdio: 'inherit' });
        console.log('Enabled Harmony', node);
        node.on("close", function(code) {
            process.exit(code);
        });

        // Interrupt process flow in the parent
        process.once("uncaughtException", function(e) {});
        throw "harmony";
    }
})();

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

gulp.task('test', ['lib'], function (cb) {
  if (isHarmony)
    return gulp.src('./tests/**/*.js')
    .pipe(shell(['mocha <%= file.path %>']));
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
          source: ' -s lib/',
          output: ' -o docs/',
          name:' -n "gengo.js/accept"',
          theme:' -t cayman'
        };
    return doc + cmd.source + cmd.output + cmd.name + cmd.theme;
  })()
]));

gulp.task('default', ['backup', 'beautify', 'lib', 'watch']);

gulp.task('build', ['backup', 'beautify', 'lib', 'test']);

gulp.task('docs', ['build', 'doc', 'gh-pages', 'clean-docs']);
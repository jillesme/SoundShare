var gulp = require('gulp');
var karma = require('gulp-karma');
var react = require('gulp-react');
var es6ify = require('es6ify');
var browserify  = require('browserify');
var reactify = require('reactify');
var transform = require('vinyl-transform');
var clean = require('gulp-clean');
var header = require('gulp-header');
var proxyquire = require('proxyquireify');
var through = require('through');
var path = require('path');
var mockify = require('browserify-mockify');

var paths = [

    'public/libs/es5-shim/es5-shim.js',
    'public/libs/react/react-with-addons.js',
    'public/libs/appsbroker-adapt/dist/adapt.js',
    'public/libs/q/q.js',
    'public/libs/chartjs/Chart.min.js',
    'public/libs/signature_pad/signature_pad.js',
    'node_modules/es6ify/node_modules/traceur/bin/traceur-runtime.js',
    'test/build/*.spec.js'];

function bundler(file) {
    console.log('FILE', file);

    var b = browserify({
        extensions: ['.jsx'],
        insertGlobalVars: true
    });

    function reactifyTags(file) {
        // var message = '';

        // var cmd = 'flow';

        // var templ = gutil.template(cmd, {file:message});

        // exec(templ, {cwd: process.cwd()}, function(err, stdout) {
        //   console.log(stdout);
        // } );

        return reactify(file, {stripTypes: true});
    }

    b.add(mockify.runtime);
    b.require(file, { entry: true });
    b.transform(reactifyTags);
    b.transform(es6ify.configure(/.(jsx|js)$/));
    b.transform(mockify.transform(reactifyTags, es6ify.configure(/.(jsx|js)$/)));
    return b.bundle();
}

module.exports = function (debug) {
    return function () {
        return gulp.src('test/build/')
            .pipe(clean())
            .on('end', function () {
                gulp.src('test/spec/*.spec.js')
                    .pipe(transform(bundler))
                    .pipe(header('/* istanbul ignore next */'))
                    .pipe(gulp.dest('test/build/'))
                    .on('end', function () {
                        return gulp.src(paths)
                            .pipe(karma({
                                configFile: 'test/karma.conf.js',
                                action: debug ? 'watch' : 'run'
                            }))
                            .on('error', function (err) {
                                throw err;
                            })
                            .on('end', function () {
                                process.exit();
                            });
                    });
            });
    }
};

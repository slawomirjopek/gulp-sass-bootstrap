var gulp = require('gulp');
var sass = require('gulp-sass');
var inject = require('gulp-inject');
var wiredep = require('wiredep');
var del = require('del');

gulp.task('build', ['clean', 'html']);

gulp.task('html', ['styles'], function() {
    var injectStyles = gulp.src('dist/main.css');

    return gulp.src('src/index.html')
        .pipe(inject(injectStyles, {
            addRootSlash: false,
            ignorePath: ['src', 'dist']
        }))
        .pipe(gulp.dest('dist'))
});

gulp.task('styles', function() {
    var injectGlobalStyles = gulp.src('src/styles/global/*.scss');

    var options = {
        transform: createImport,
        starttag: '// inject:global',
        endtag: '// endinject',
        addRootSlash: false
    };

    return gulp.src('src/main.scss')
        .pipe(wiredep.stream())
        .pipe(inject(injectGlobalStyles, options))
        .pipe(sass())
        .pipe(gulp.dest('dist'))
});

gulp.task('clean', function() {
    del('dist');
});

function createImport(filepath) {
    return '@import "' + filepath + '";';
}
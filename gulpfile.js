var gulp = require('gulp');
var sass = require('gulp-sass');
var inject = require('gulp-inject');

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
    return gulp.src('src/main.scss')
        .pipe(sass())
        .pipe(gulp.dest('dist'))
});
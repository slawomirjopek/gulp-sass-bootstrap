var gulp = require('gulp');
var sass = require('gulp-sass');
var inject = require('gulp-inject');
var wiredep = require('wiredep');
var del = require('del');
var mainBowerFiles = require('main-bower-files');
var filter = require('gulp-filter');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var debug = require('gulp-debug');

var CONFIG = {
    srcName: 'src',
    distName: 'dist',
    srcStyleDir: 'src/styles/',
    distStyleDir: 'dist/styles/'
};

gulp.task('clean', function() {
    del(CONFIG.distName);
});

gulp.task('styles', function() {
    var appStyles = gulp.src(CONFIG.srcStyleDir + '*.scss', {read: false});
    var globalStyles = gulp.src(CONFIG.srcStyleDir + 'global/*.scss', {read: false});

    var injectOptions = {
        global: {
            transform: createImport,
            starttag: '// inject:global',
            endtag: '// endinject',
            addRootSlash: false
        },
        app: {
            transform: createImport,
            starttag: '// inject:app',
            endtag: '// endinject',
            addRootSlash: false
        }
    };

    return gulp.src('src/main.scss')
        .pipe(wiredep.stream())
        .pipe(inject(globalStyles, injectOptions.global))
        .pipe(inject(appStyles, injectOptions.app))
        .pipe(sass())
        .pipe(csso())
        .pipe(gulp.dest(CONFIG.distStyleDir))
});

gulp.task('vendors', function() {
    return gulp.src(mainBowerFiles())
        .pipe(filter('**/*.css'))
        .pipe(concat('vendor.css'))
        .pipe(csso())
        .pipe(gulp.dest(CONFIG.distStyleDir))
});

gulp.task('build', ['clean', 'vendors', 'styles'], function() {
    var files = gulp.src([
        CONFIG.distStyleDir + 'vendor.css',
        CONFIG.distStyleDir + 'main.css'
    ]);

    var injectOptions = {
        addRootSlash: false,
        ignorePath: [CONFIG.srcName, CONFIG.distName]
    };

    return gulp.src(CONFIG.srcName + '/index.html')
        .pipe(inject(files, injectOptions))
        .pipe(gulp.dest(CONFIG.distName))
});

function createImport(path) {
    return '@import "' + path + '";';
}
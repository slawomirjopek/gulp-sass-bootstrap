var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var inject = require('gulp-inject');
var wiredep = require('wiredep');
var del = require('del');
var bowerFiles = require('main-bower-files');
var filter = require('gulp-filter');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var minify = require('gulp-minify');
var gulpSequence = require('gulp-sequence');
var imagemin = require('gulp-imagemin');
var debug = require('gulp-debug');

var CONFIG = {
    src: {
        name: 'src',
        styleDir: 'src/styles/',
        scriptDir: 'src/scripts/',
        imgDir: 'src/images/'
    },
    dist: {
        name: 'dist',
        styleDir: 'dist/styles/',
        scriptDir: 'dist/scripts/',
        imgDir: 'dist/images/'
    },
    autoprefixer: {
        browsers: ['last 5 versions']
    }
};

gulp.task('clean', function() {
    del(CONFIG.dist.name);
});

gulp.task('watch', function () {
    gulp.watch(CONFIG.src.scriptDir + '**/*.js', ['scripts']);
    gulp.watch(CONFIG.src.styleDir + '**/**/*.scss', ['styles']);
    gulp.watch(CONFIG.src.name + '**/*.html', ['html']);
    gulp.watch(CONFIG.src.imgDir + '**/*.+(jpg|jpeg|png|gif|svg)', ['images']);
});

gulp.task('images', function() {
    gulp.src(CONFIG.src.imgDir + '*')
        .pipe(imagemin())
        .pipe(gulp.dest(CONFIG.dist.imgDir))
});

gulp.task('styles', ['vendors-css'], function() {
    var appStyles = gulp.src(CONFIG.src.styleDir + '*.scss', {read: false});
    var globalStyles = gulp.src(CONFIG.src.styleDir + 'global/*.scss', {read: false});

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

    return gulp.src(CONFIG.src.name + '/main.scss')
        .pipe(wiredep.stream())
        .pipe(inject(globalStyles, injectOptions.global))
        .pipe(inject(appStyles, injectOptions.app))
        .pipe(sass())
        .pipe(autoprefixer(CONFIG.autoprefixer))
        .pipe(csso())
        .pipe(gulp.dest(CONFIG.dist.styleDir))
});

gulp.task('scripts', ['vendors-js'], function() {
    var appScripts = gulp.src(CONFIG.src.scriptDir + '*.js');

    return appScripts
        .pipe(concat('app.js'))
        .pipe(minify({
            ext: {
                min:'.js'
            },
            noSource: true
        }))
        .pipe(gulp.dest(CONFIG.dist.scriptDir))
});

gulp.task('vendors-css', function() {
    return gulp.src(bowerFiles())
        .pipe(filter('**/*.css'))
        .pipe(concat('vendor.css'))
        .pipe(csso())
        .pipe(gulp.dest(CONFIG.dist.styleDir))
});

gulp.task('vendors-js', function() {
    return gulp.src(bowerFiles())
        .pipe(filter('**/*.js'))
        .pipe(concat('vendor.js'))
        .pipe(minify({
            ext: {
                min:'.js'
            },
            noSource: true
        }))
        .pipe(gulp.dest(CONFIG.dist.scriptDir))
});

gulp.task('html', function() {
    var files = gulp.src([
        CONFIG.dist.scriptDir + 'vendor.js',
        CONFIG.dist.scriptDir + 'app.js',
        CONFIG.dist.styleDir + 'vendor.css',
        CONFIG.dist.styleDir + 'main.css'
    ]);

    var injectOptions = {
        addRootSlash: false,
        ignorePath: [CONFIG.src.name, CONFIG.dist.name]
    };

    return gulp.src(CONFIG.src.name + '/index.html')
        .pipe(inject(files, injectOptions))
        .pipe(gulp.dest(CONFIG.dist.name))
});

gulp.task('build', gulpSequence('clean', ['styles', 'scripts', 'images'], 'html'));

function createImport(path) {
    return '@import "' + path + '";';
}
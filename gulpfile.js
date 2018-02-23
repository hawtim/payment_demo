var path = require('path');
var yargs = require('yargs').argv;
var gulp = require('gulp');
var less = require('gulp-less');
var sass = require('gulp-sass')
var minifycss = require('gulp-clean-css')
var postcss = require('gulp-postcss');
var autoprefixer = require('gulp-autoprefixer');
var nano = require('gulp-cssnano');
//图片压缩插件页面启动 延迟20秒左右
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var fileinclude = require('gulp-file-include');
var option = {base: 'src'};
var dist = __dirname + '/dist';

gulp.task('build:less', function () {
    gulp.src('src/css/*.less', option)
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(postcss([autoprefixer]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}))
        .pipe(nano({
            zindex: false
        }))
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest(dist));
});

gulp.task('build:sass', function () {
    gulp.src('src/css/*.scss', option)
        .pipe(sass())
        .pipe(autoprefixer({
            browsers:['last 2 version','safari 5','ie 8','ie 9','opera 12.1','ios 6','android 4'],
            cascade:true,
            // 是否美化属性值 默认：true 像这样：
            // -webkit-transform: rotate(45deg);
            //         transform: rotate(45deg);
            remove:true, // 是否去掉不必要的前缀 默认：true
        }
            ))
        .pipe(gulp.dest(dist))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream:true}));
    });

gulp.task('build:img', function () {
    gulp.src('src/img/*', option)
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('build:js', function () {
    gulp.src('src/js/*.js', option)
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}));
});
gulp.task('build:html', function () {
    gulp.src('src/*.html', option)
        .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
        }))
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}));
});
// 'build:img',
gulp.task('release', ['build:js','build:html']);

gulp.task('watch', ['release'], function () {
    gulp.watch(['src/css/*.scss','src/css/**/*.scss','src/imp/*.scss'], ['build:sass']).on('change',reload);
    gulp.watch('src/img/*', ['build:img']).on('change',reload);
    gulp.watch('src/js/*.js', ['build:js']).on('change',reload);
    gulp.watch(['src/*.html','src/inc/*.html','src/inc/*.ejs'], ['build:html']).on('change',reload);
});

gulp.task('server', function () {
    yargs.p = yargs.p || 8080;
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        notify: false,
        ui: {
            port: yargs.p + 1,
            weinre: {
                port: yargs.p + 2
            }
        },
        port: yargs.p,
        notify: false,
        startPath: '/index.html'
    });
});

gulp.task('default', ['release'], function () {
    if (yargs.w) {
        gulp.start('watch');
    }
    if (yargs.s) {
        gulp.start('server');
    }
});

gulp.task('help',function () {
    console.log('gulp build          文件打包');
    console.log('gulp watch          文件监控打包');
    console.log('gulp help           gulp参数说明');
    console.log('gulp server         测试server');
    console.log('gulp -p             生产环境（默认生产环境）');
    console.log('gulp -d             开发环境');
    console.log('gulp -m <module>        部分模块打包（默认全部打包）');

});

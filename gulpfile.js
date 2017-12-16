"use strict";

let gulp = require("gulp"),
    autoprefixer = require("gulp-autoprefixer"),
    cssbeautify = require("gulp-cssbeautify"),
    removeComments = require('gulp-strip-css-comments'),
    rename = require("gulp-rename"),
    sass = require("gulp-sass"),
    cssnano = require("gulp-cssnano"),
    rigger = require("gulp-rigger"),
    uglify = require("gulp-uglify"),
    watch = require("gulp-watch"),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require("gulp-plumber"),
    imagemin = require("gulp-imagemin"),
    run = require("run-sequence"),
    newer = require('gulp-newer'),
    rimraf = require("rimraf"),
    csscomb = require('gulp-csscomb'),
    browserSync = require('browser-sync').create();


/* Paths to source/build/watch files
=========================*/

let path = {
    build: {
        html: "build/",
        js: "build/assets/js/",
        css: "build/assets/css/",
        img: "build/assets/i/",
        fonts: "build/assets/fonts/"
    },
    src: {
        html: "src/*.{htm,html}",
        js: "src/assets/js/*.js",
        css: "src/assets/sass/style.scss",
        img: "src/assets/i/**/*.*",
        fonts: "src/assets/fonts/**/*.*"
    },
    watch: {
        html: "src/**/*.{htm,html}",
        js: "src/assets/js/**/*.js",
        css: "src/assets/sass/**/*.scss",
        img: "src/assets/i/**/*.*",
        fonts: "src/assets/fonts/**/*.*"
    },
    clean: "./build"
};

/* Tasks
=========================*/

gulp.task('browser-sync', function () {

    browserSync.init({
        server: {
            baseDir: "./build/"
        },
        notify: true
    });
});


gulp.task("html:build", function(){
    return gulp.src(path.src.html)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(rigger())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.stream());
});


gulp.task("css:build", function(){
    gulp.src(path.src.css)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(removeComments())
        .pipe(cssbeautify())
        .pipe(sourcemaps.write())
        .pipe(csscomb())
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.stream())
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest(path.build.css));
});


gulp.task("js:build", function(){
    gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(uglify())
        .pipe(removeComments())
        .pipe(rename("main.min.js"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
});


gulp.task("fonts:build", function(){
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});


gulp.task("image:build", function(){
    gulp.src(path.src.img)
        .pipe(newer('build/img'))
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img));
});


gulp.task("clean", function(cb){
    rimraf(path.clean, cb);
});


gulp.task('build', function(cb){
    run(
        "clean",
        "html:build",
        "css:build",
        "js:build",
        "fonts:build",
        "image:build"
        , cb);
});


gulp.task("watch", function(){
    watch([path.watch.html], function(event, cb){
        gulp.start("html:build");
    });
    watch([path.watch.css], function(event, cb){
        gulp.start("css:build");
    });
    watch([path.watch.js], function(event, cb){
        gulp.start("js:build");
    });
    watch([path.watch.img], function(event, cb){
        gulp.start("image:build");
    });
    watch([path.watch.fonts], function(event, cb){
        gulp.start("fonts:build");
    });
});


gulp.task("default", function(cb){
    run(
        "clean",
        "build",
        "browser-sync",
        "watch"
        , cb);
});

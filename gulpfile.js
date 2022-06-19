'use strict';

const gulp = require('gulp'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    cleancss = require('gulp-clean-css'),
    uglify = require('gulp-uglify-es').default,
    sass = require('gulp-sass')(require('sass')),
    clean = require('gulp-clean'),
    purgecss = require('gulp-purgecss'),
    rename = require('gulp-rename'),
    merge = require('merge-stream'),
    injectstring = require('gulp-inject-string'),
    imagemin = require('gulp-imagemin'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    util = require('gulp-util'),
    bundleconfig = require('./bundleconfig.json'),
    fs = require('fs');

const { series, parallel, src, dest, watch } = require('gulp');

const regex = {
    css: /\.css$/,
    js: /\.js$/
};

const paths = {
    input: 'input/',
    output: 'output/assets/',
    assets: 'input/assets/',
    node_modules: 'node_modules/'
};

const getBundles = (regexPattern) => {
    return bundleconfig.filter(bundle => {
        return regexPattern.test(bundle.outputFileName);
    });
};

function delStart() {
    return src([
        paths.output
    ], { allowEmpty: true })
        .pipe(clean({ force: true }));
}

function copyAssets() {
    var copyFontAwesome = src(paths.node_modules + '@fortawesome/fontawesome-free/webfonts/*.*')
        .pipe(dest(paths.output + 'fonts/fontawesome-free'));

    var copyImages = src(paths.assets + 'images/**/*.*')
        //.pipe(imagemin())
        .pipe(dest(paths.output + 'images'));

    var copySt3phhaysJs = src(paths.node_modules + 'st3phhays-assets/js/**/*.js')
        .pipe(dest(paths.output + 'js/temp'));

    var copyInitJs = src(paths.assets + 'js/hollow-inside.js')
        .pipe(dest(paths.output + 'js/temp'));

    var copyIcons = src(paths.input + '/*.png')
        //.pipe(imagemin())
        .pipe(dest('output'));

    var copyManifest = src(paths.input + '/site.webmanifest')
        .pipe(dest('output'));

    return merge(copyFontAwesome, copySt3phhaysJs, copyInitJs, copyImages, copyIcons, copyManifest);
}

function compileScss() {
    return src(paths.assets + 'css/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(dest(paths.output + 'css'));
}

function concatJs() {
    var tasks = getBundles(regex.js).map(function (bundle) {
        var b = browserify({
            entries: bundle.inputFiles,
            debug: true,
            transform: [babelify.configure({
                "presets": [
                    "@babel/preset-env",
                   ["@babel/preset-react", {"runtime": "automatic"}],
                ],
                compact: false
            })]
        });
        
        return b.bundle()
            .pipe(source(bundle.outputFileName))
            .pipe(buffer())
            .on('error', util.log)
            .pipe(dest('.'));

    });

    return merge(tasks);
}

function concatCss() {
    var tasks = getBundles(regex.css).map(function (bundle) {

        return src(bundle.inputFiles, { base: '.' })
            .pipe(concat(bundle.outputFileName))
            .pipe(dest('.'));
    });

    return merge(tasks);
}

function purgeCss() {
    return src(paths.output + 'css/hollow-inside.bundle.css')
        .pipe(purgecss({
            content: [
                paths.input + '**/*.cshtml',
                paths.input + '**/*.md',
                paths.output + 'js/*.*'
            ],
            safelist: [
                '::-webkit-scrollbar',
                '::-webkit-scrollbar-thumb',
                'type-flyout-code',
                'type-flyout-blog',
                'type-flyout-project',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6'
            ],
            keyframes: true,
            variables: true
        }))
        .pipe(dest(paths.output + 'css/'));
}

function minCss() {
    var tasks = getBundles(regex.css).map(function (bundle) {

        return src(bundle.outputFileName, { base: '.' })
            .pipe(cleancss({
                level: 2,
                compatibility: 'ie8'
            }))
            .pipe(rename({ suffix: '.min' }))
            .pipe(dest('.'));
    });

    return merge(tasks);
}

function minJs() {
    var tasks = getBundles(regex.js).map(function (bundle) {

        return src(bundle.outputFileName, { base: '.' })
            .pipe(uglify())
            .pipe(rename({ suffix: '.min' }))
            .pipe(dest('.'));
    });

    return merge(tasks);
}

function delEnd() {
    return src([
        paths.output + 'css/*.css',
        '!' + paths.output + 'css/*.min.css',
        paths.output + 'js/*.js',
        '!' + paths.output + 'js/*.min.js',
        paths.output + 'js/temp',
    ], { allowEmpty: true })
        .pipe(clean({ force: true }));
}

// Gulp series
exports.concatScssJs = parallel(compileScss, concatJs);
exports.minCssJs = parallel(minCss, minJs);

exports.compileScss = compileScss;

// Gulp default
//exports.default = series(delStart, copyAssets, exports.concatScssJs, concatCss, purgeCss, exports.minCssJs, delEnd);
exports.default = series(delStart, copyAssets, exports.concatScssJs, concatCss, exports.minCssJs, delEnd);
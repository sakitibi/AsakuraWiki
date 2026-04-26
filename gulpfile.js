const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const flatten = require('gulp-flatten');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const path = require('path');
const through2 = require('through2');

function compileSass() {
  return gulp.src('scss/**/*.scss')
    .pipe(sourcemaps.init())
    
    .pipe(sass({ 
      includePaths: ['node_modules'],
      loadPaths: ['node_modules'],
      quietDeps: true 
    }).on('error', sass.logError))

    // 1. 【重要】Sass直後の完璧なマップ情報を「丸ごと」保存する
    .pipe(through2.obj(function(file, enc, cb) {
      if (file.sourceMap) {
        file.savedMap = JSON.parse(JSON.stringify(file.sourceMap));
      }
      cb(null, file);
    }))

    .pipe(flatten())
    .pipe(postcss([cssnano()])) 
    
    // 2. 【重要】破壊されたマップ情報を、保存しておいた情報で「強制置換」する
    .pipe(through2.obj(function(file, enc, cb) {
      if (file.savedMap && file.sourceMap) {
        // 保存していた sources と sourcesContent を復元
        file.sourceMap.sources = file.savedMap.sources.map(s => path.basename(s));
        file.sourceMap.sourcesContent = file.savedMap.sourcesContent;
        // メインファイル名が .css になっていたら .scss に戻す
        file.sourceMap.sources = file.sourceMap.sources.map(s => s.replace(/\.css$/, '.scss'));
      }
      cb(null, file);
    }))

    // 3. すでに情報は復元済みなので、そのまま書き出す
    .pipe(sourcemaps.write('./', {
      includeContent: true,
      sourceRoot: '../scss'
    }))
    
    .pipe(gulp.dest('css'));
}

exports.default = compileSass;
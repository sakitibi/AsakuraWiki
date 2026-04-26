const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const flatten = require('gulp-flatten');
const cleanCSS = require('gulp-clean-css'); // 追加

function compileSass() {
  return gulp.src('scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ 
      // ここは expanded でも compressed でも OK
      includePaths: ['node_modules'],
      loadPaths: ['node_modules'],
      quietDeps: true 
    }).on('error', sass.logError))

    // 階層をフラットにする
    .pipe(flatten())

    // ★ 明示的に CSS を圧縮する（これが一番確実です）
    .pipe(cleanCSS()) 
    
    // ソースマップを書き出し
    .pipe(sourcemaps.write('./'))
    
    .pipe(gulp.dest('css'));
}

exports.default = compileSass;
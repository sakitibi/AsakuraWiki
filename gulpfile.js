const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const flatten = require('gulp-flatten');
const postcss = require('gulp-postcss'); // 追加
const cssnano = require('cssnano');     // 追加
const path = require('path');

function compileSass() {
  return gulp.src('scss/**/*.scss')
    // 1. ソースマップ初期化
    .pipe(sourcemaps.init())
    
    // 2. Sassコンパイル (ここでは一旦 expanded でOK)
    .pipe(sass({ 
      includePaths: ['node_modules'],
      loadPaths: ['node_modules'],
      quietDeps: true 
    }).on('error', sass.logError))

    // 3. 階層を直下に移動
    .pipe(flatten())

    // 4. 【重要】PostCSS(cssnano) で確実に圧縮
    // sourcemaps.write の直前に入れることで、圧縮後のマップを生成します
    .pipe(postcss([cssnano()])) 
    
    // 5. ソースマップ書き出し
    .pipe(sourcemaps.write('./', {
      includeContent: true, 
      mapSources: (sourcePath) => path.basename(sourcePath),
      sourceRoot: '../scss'
    }))
    
    // 6. 出力
    .pipe(gulp.dest('css'));
}

exports.default = compileSass;
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
    // 1. 初期化
    .pipe(sourcemaps.init())
    
    // 2. Sassコンパイル
    .pipe(sass({ 
      includePaths: ['node_modules'],
      loadPaths: ['node_modules'],
      quietDeps: true 
    }).on('error', sass.logError))

    // 3. Sass直後のマルチソースなマップ情報を一時保存
    .pipe(through2.obj(function(file, enc, cb) {
      if (file.sourceMap) {
        file.savedMap = JSON.parse(JSON.stringify(file.sourceMap));
      }
      cb(null, file);
    }))

    // 4. 階層移動
    .pipe(flatten())

    // 5. 圧縮（PostCSS）
    .pipe(postcss([cssnano()])) 
    
    // 6. 消された @use 先の情報を無理やり復元
    .pipe(through2.obj(function(file, enc, cb) {
      if (file.savedMap && file.sourceMap) {
        // sourcesをファイル名のみにし、.cssを.scssに修正
        file.sourceMap.sources = file.savedMap.sources.map(s => 
          path.basename(s).replace(/\.css$/, '.scss')
        );
        // パーシャルの中身（_body.scss等）をすべて復元
        file.sourceMap.sourcesContent = file.savedMap.sourcesContent;
      }
      cb(null, file);
    }))

    // 7. インラインで書き出し（第一引数にパスを指定しない）
    .pipe(sourcemaps.write({
      includeContent: true // ソースコード自体をCSSに埋め込む
    }))
    
    // 8. 出力（Next.jsプリセットなら public/css が安全）
    .pipe(gulp.dest('public/css'));
}

exports.default = compileSass;
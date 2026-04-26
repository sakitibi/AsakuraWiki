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

    // 1. Sass直後の情報を退避
    .pipe(through2.obj(function(file, enc, cb) {
      if (file.sourceMap) {
        file.savedMap = JSON.parse(JSON.stringify(file.sourceMap));
      }
      cb(null, file);
    }))

    .pipe(flatten())
    .pipe(postcss([cssnano()])) 
    
    // 2. 情報を復元
    .pipe(through2.obj(function(file, enc, cb) {
      if (file.savedMap && file.sourceMap) {
        file.sourceMap.sources = file.savedMap.sources.map(s => path.basename(s));
        file.sourceMap.sourcesContent = file.savedMap.sourcesContent;
        file.sourceMap.sources = file.sourceMap.sources.map(s => s.replace(/\.css$/, '.scss'));
      }
      cb(null, file);
    }))

    // 3. マップのみ public/css に書き出す
    // sourceMappingURL の値を '../public/css/xxx.map' にならないよう、絶対パス風に指定
    .pipe(sourcemaps.write('../public/css', {
      includeContent: true,
      sourceRoot: '/scss',
      // CSSの中に書き込まれるソースマップへのリンクを調整
      destPath: 'public/css' 
    }))
    
    // 4. CSS本体は css ディレクトリへ
    .pipe(gulp.dest('css'));
}

exports.default = compileSass;
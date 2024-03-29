const { src, dest, watch, parallel, series } = require("gulp");

const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const del = require("del");
const pug = require("gulp-pug");

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
}

function cleanDist() {
  return del('dist')
}

function images() {
  return src('app/assets/images/**/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("dist/assets/images"));
}

function scripts() {
  // return src(["node_modules/jquery/dist/jquery.js", "app/js/main.js"])
  return src(["app/js/main.js"])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
}

function styles() {
  return src("app/scss/style.scss")
    .pipe(sass({ 
      includePaths: ['./node_modules'],
      outputStyle: "compressed" 
    }))
    .pipe(concat("style.min.css"))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 10 versions"],
        grid: true,
      })
    )
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

function pugWatch() {
  return src("app/pages/*.pug")
    .pipe(pug({pretty: true}))
    .pipe(dest("app"));
}

function build() {
  return src(
    [
      // Выбираем нужные файлы
      "app/css/style.min.css",
      "app/fonts/**/*",
      "app/js/**/*.min.js",
      "app/**/*.html",
      "app/images/dest/**/*",
    ],
    { base: "app" }
  ).pipe(dest("dist"));
}

function watching() {
  watch(["app/scss/**/*.scss"], styles);
  watch(["app/js/**/*.js", "!app/js/main.min.js"], scripts);
  watch(["app/pages/**/*.pug"], pugWatch).on("change", browserSync.reload);
  // watch(["app/*.html"]).on("change", browserSync.reload);
}

function deploy() {
  return ghPages.publish('dist', {
    branch: 'gh-pages',
  //   repo: 'https://github.com/tgluk/gulp-start.git',
    dotfiles: true
  });
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;
exports.pugWatch = pugWatch;

exports.deploy = deploy;
exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watching, pugWatch);

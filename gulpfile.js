let { src, dest } = 	require("gulp");
let gulp = 				require("gulp");
let browsersync = 		require("browser-sync").create();
let autoprefixer =	 	require("gulp-autoprefixer");
let scss = 				require('gulp-sass')(require('sass'));
let group_media = 		require("gulp-group-css-media-queries");
let plumber = 			require("gulp-plumber");
let del = 				require("del");
let fileinclude = 		require("gulp-file-include");
let clean_css = 		require("gulp-clean-css");

let dist_folder = "dist";
let src_folder = "src";

let path = {
	build: {
		html: dist_folder + "/",
		js: dist_folder + "/js/",
		css: dist_folder + "/css/",
	},
	src: {
		html: [src_folder + "/**/*.html", "!" + src_folder + "/_*.html"],	
		js: [src_folder + "/js/*.js", src_folder + "/js/**/*.js"],
		css: src_folder + "/scss/*.*",
	},
	watch: {
		html: src_folder + "/**/*.html",
		js: src_folder + "/**/*.js",
		css: src_folder + "/scss/**/*.scss",
	},
	clean: "./" + dist_folder + "/"
};

function copyFolders() {
	return src(path.src.html).pipe(browsersync.stream());
}

function browserSync(done) {
	browsersync.init({
		server: "./dist/",
		notify: true,
        directory: true,
		port: 4000,
	});
}

function clean() {
	return del(path.clean);
}

function watchFiles() {
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
}

function css() {
	return src(path.src.css, {})
		.pipe(plumber())
		.pipe(
			scss({ outputStyle: 'expanded' }).on('error', scss.logError)
		)
		.pipe(group_media())
		.pipe(
			autoprefixer({
				grid: false,
				overrideBrowserslist: ["last 5 versions"],
				cascade: false
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream());
}

function js() {
	return src(path.src.js, {})
		.pipe(plumber())
		.pipe(fileinclude())
		.pipe(gulp.dest(path.build.js))
		.on('error', function (err) { console.log(err.toString()); this.emit('end'); })
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream());
}

let buildDev = gulp.series(clean, gulp.parallel(copyFolders, css, js));
let watch = gulp.series(buildDev, gulp.parallel(watchFiles, browserSync));

exports.copy = copyFolders;
exports.watch = watch;
exports.default = watch;
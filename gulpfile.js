var gulp        = require('gulp');
var rename      = require('gulp-rename');
var sass        = require('gulp-sass')(require('sass'));
var uglify      = require('gulp-uglify');
var sourcemaps  = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var browserify  = require('browserify');
var babelify    = require('babelify');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var es          = require('event-stream');

gulp.task('sass', async function(){
    return gulp.src('./app/src/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./app/dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('js', async function(){
    var files = [
        'app.js'
    ];
    var tasks = files.map(function(entry){
        return browserify({entries: './app/src/js/' + entry, debug: true})
            .transform("babelify", { presets: ["@babel/preset-env"] })
            .bundle()
            .pipe(source(entry))
            .pipe(buffer())
            .pipe(sourcemaps.init())
            .pipe(rename({extname: '.bundle.js'}))
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest('./app/dist/js'))
            .pipe(browserSync.stream());
    })
    return es.merge.apply(null, tasks);
});
    
gulp.task('watch', gulp.parallel('js','sass'), function(){
    browserSync.init({
        server: {
            baseDir: "./app"
        },
        notify: false
    });
    gulp.watch('./app/src/js/*.js', gulp.series('js'));
    gulp.watch('./app/src/scss/*.scss', gulp.series('sass'))
    gulp.watch("app/*.html").on('change', browserSync.reload);
});

gulp.task('default', gulp.parallel('js','sass','watch'));
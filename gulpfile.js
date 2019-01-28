var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var browserSync = require('browser-sync').create();

gulp.task('hello', function () {
    console.log('Hello Zell');
});

// gulp.task('sass', function () {
//     return gulp.src('scss/*.scss')
//         .pipe(sass()) // Using gulp-sass
//         .pipe(gulp.dest('css'))
// });

gulp.task('sass', function () {
    return gulp.src('scss/*.scss')
        .pipe(sass()) // Using gulp-sass
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: ''
        },
    })
});

gulp.task('stream', gulp.series('sass', function () {
    // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event
    return watch('scss/*.scss', gulp.series('sass'));
}));
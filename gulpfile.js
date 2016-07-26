var gulp   = require( 'gulp' ),

  server = require( 'gulp-develop-server'),
  config = require('./config'),
  livereload = require('gulp-livereload'),
  //connect = require('gulp-connect'),
  gulpLoadPlugins = require('gulp-load-plugins');

var plugins = gulpLoadPlugins();

gulp.task( 'server:develop', function() {

  server.listen( { path: './server.js' } );
});

gulp.task('default', [ 'server:develop', 'server:restart']);

gulp.task('reloadserver', function(){
  return server.restart(function(){
    plugins.livereload.reload();
  });
});

gulp.task('reset', function(){
  //server.restart();



  //return gulp.src('*')
  //  .pipe(plugins.livereload.changed)

  //livereload();
});

gulp.task( 'server:restart', function() {

  gulp.watch( [ './*.js', './*.html', './*.css', './config.json', config.bundle + '/**'], [ 'reloadserver']).on('change', function(){
    console.log('weeee~!');

  });
  plugins.livereload.listen();
});

var gulp   = require( 'gulp' ),
  gulpLoadPlugins = require('gulp-load-plugins'),
  server = require( 'gulp-develop-server'),
  config = require('./config');

var plugins = gulpLoadPlugins();

gulp.task( 'server:develop', function() {
  server.listen( { path: './server.js' } );
});

gulp.task('default', [ 'server:develop', 'server:restart']);

gulp.task( 'server:restart', function() {
  gulp.watch( [ './*.js', './*.html', './config.json', config.bundle + '/**'], server.restart );
});

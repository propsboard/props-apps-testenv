var express = require('express'),
  swig = require('swig'),
  fs = require('fs'),
  async = require('async'),
  request = require('request'),
  config = require('./config'),
  _ = require('lodash'),
  bundleConfig = config + '/app.json',
  app = express();


console.log('*', 'loading bundle config', config.bundle);
var bundleConf = JSON.parse(fs.readFileSync(config.bundle + '/app.json', 'utf8'));
console.log('*', 'config loaded');

var htmlSrc = fs.readFileSync(config.bundle + '/' + bundleConf.bundles[0].html, 'utf8');
console.log('', '-', 'Loaded html');

var cssSrc = fs.readFileSync(config.bundle + '/' + bundleConf.bundles[0].css, 'utf8');
console.log('', '-', 'Loaded css');

var jsSrc = fs.readFileSync(config.bundle + '/' + bundleConf.bundles[0].js, 'utf8');
console.log('', '-', 'Loaded js');

app.use('/app/images', express.static(config.bundle + '/' + bundleConf.bundles[0].images));

var loadPollingData = function(cb){
  async.each(bundleConf.requests, function(configRequest, rcb){

    var url = configRequest.url;
    _.each(config.params.config, function(p){
      url = url.replace('{' + p.name + '}', p.value);
    });

    console.log('_', 'making request', url);
    request({
      url: url,
      headers: configRequest.headers
    }, function(err, res, body){

      rcb(err);
    }).on('response', function(response) {
        //console.log(response.statusCode) // 200
        console.log('_', response.statusCode, response.headers['content-type']); // 'image/png'
      })
      .pipe(fs.createWriteStream('./cache/' + configRequest.name + '.json'));
  }, cb);
};

var loadCachedData = function(cb){
  var data = {};
  async.each(bundleConf.requests, function(configRequest, rcb){
    fs.readFile('./cache/' + configRequest.name + '.json', 'utf8', function (err,d) {
      data[configRequest.name] = d;
      rcb(err);
    });
  }, function(err){
    cb(err, data);
  });
};

var loadIncludes = function(cb){
  var includes = [];
  async.each(bundleConf.includes, function(inc, rcb){
    var p = config.bundle + '/' +  inc.path;
    fs.readFile(p, 'utf8', function (err,d) {
      includes.push({
        name: inc.name,
        src: d,
        type: inc.type
      });
      rcb(err);
    });
  }, function(err){
    cb(err, includes);
  });
};


var tpl = swig.compileFile('./view.html');

app.get('/refresh', function(req, res){
  loadPollingData(function(err){
    if(err){
      res.status(400).json(err);
    }
    else{
      res.json({success: true});
    }
  });
});

app.get('/app', function(req, res){

  async.waterfall([
    //Load cached data
    function(cb){
      loadCachedData(cb);
    },
    // Load includes
    function(data, cb){
      loadIncludes(function(err, incs){
        cb(err, data, incs);
      });
    }
  ], function(err, data, incs){

    var appData = config.app;
    appData.config = config.params;

    res.send(tpl({
      data: data,
      app: appData,
      includes: incs,
      htmlSrc: htmlSrc,
      cssSrc: cssSrc,
      jsSrc: jsSrc
    }));
  });

});




console.log('!!!', 'listening on port', config.port);
app.listen(config.port);



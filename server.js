var express = require('express'),
  swig = require('swig'),
  fs = require('fs'),
  async = require('async'),
  request = require('request'),
  config = require('./config'),
  _ = require('lodash'),
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

// Get the mount point specified in the package bundle for the images
var mountpoint = '/app/' + bundleConf.images;

// Deal with trailing slash if it exists
if(mountpoint[mountpoint.length-1] === '/'){
  mountpoint = mountpoint.substr(0, mountpoint.length-1);
}

console.log('', '-', 'mounting images ' + mountpoint + ' to ', config.bundle + '/' + bundleConf.images);
app.use(mountpoint, express.static(config.bundle + '/' + bundleConf.images));


// Execute polling requests specified in the bundle pacakge
var loadPollingData = function(cb){

  // Loop through each request
  async.each(bundleConf.requests, function(configRequest, rcb){

    var url = configRequest.url;

    _.each(config.params, function(p){

      var val = p.value;
      var vals = [];

      // If the param value looks like JSON, attempt to parse it into a proper JS obj
      if (val.indexOf('{')===0){

        try {
          var json = JSON.parse(p.value);
          for (var prop in json) {
            vals.push({
              name: p.name + '.' + prop,
              value: json[prop]
            });
          }

        } catch (e) {
          vals.push(p);
        }
      }
      else{
        vals.push(p);
      }


      _.each(vals, function(v){
        url = url.replace('{' + v.name + '}', v.value);
      });

    });

    console.log('_', 'making request', url);
    // Make the HTTP request and pipe the output to a local JSON file so we don't need to make the request over and
    // over again while debugging
    request({
      url: url,
      headers: configRequest.headers
    }, function(err, res, body){
      rcb(err);
    }).on('response', function(response) {
        console.log('_', response.statusCode, response.headers['content-type']); // 'image/png'
      })
      .pipe(fs.createWriteStream('./cache/' + configRequest.name + '.json'));
  }, cb);
};

// Grab the cached request data
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

// Iterate through the specified includes and return them in a callback
var loadIncludes = function(cb){
  var includes = [];

  async.eachSeries(bundleConf.includes, function(inc, rcb){
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

// Compile the swig template
var tpl = swig.compileFile('./view.html');

// GET /refresh - Forces polling data to be refreshed
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

// GET /app - redirects to app index
app.get('/app', function(req, res){
  res.redirect('/app/index.html');
});

// GET /app/index.html - Returns compiled HTML similar to what will be returned from the Props app server.
app.get('/app/index.html', function(req, res){

  // Grab the information needed to compile HTML for the app
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

    // Inject app information into variable that will be compiled into the app
    var appData = config.app;
    appData.config = config.params;
    appData.configValues = {};
    _.each(config.params, function(p){
      appData.configValues[p.name] = p.value;
    });

    // Provide the gathered information into the template, render it, then send it back to the client.
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



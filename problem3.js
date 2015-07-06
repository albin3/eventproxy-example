// problem three

var fs = require('fs');
var async = require('async');
var eventproxy = require('eventproxy');
var Promise = require('bluebird');
var fsp = Promise.promisifyAll(fs);
var _ = require('lodash');

function r () {
  fs.readFile('./resources/filename', function(err, filename) {
    if (err) throw err;

    fs.readFile('./resources/'+_.trim(filename), function(err, file) {
      if (err) throw err;

      fs.readFile('./resources/number', function(err, number) {
        if (err) throw err;

        var f = _.trim(file);
        var n = parseInt(_.trim(number));
        console.log('raw: '+f[n]);
      });
    });
  });
}

function a () {
  async.auto({
    r_filename: function(cb) {
      fs.readFile('./resources/filename', cb);
    },
    r_file: ['r_filename', function(cb, result) {
      var filename = _.trim(result['r_filename']);
      fs.readFile('./resources/'+filename, cb);
    }],
    r_number: function(cb) {
      fs.readFile('./resources/number', cb);
    }
  }, function(err, result) {
    if (err) {
      throw err;
    }

    var f = _.trim(result['r_file']);
    var n = parseInt(_.trim(result['r_number']));
    console.log('async: '+f[n]);
  });
}

function e () {
  var ep = eventproxy();
  ep.fail(function(err) {
    throw err;
  });

  ep.all('file', 'number', function(file, number) {
    var f = _.trim(file);
    var n = parseInt(_.trim(number));
    console.log('eventproxy: '+f[n]);
  });

  ep.once('filename', function(filename) {
    fs.readFile('./resources/'+_.trim(filename), ep.done('file'));
  });

  fs.readFile('./resources/filename', ep.done('filename'));
  fs.readFile('./resources/number', ep.done('number'));
}

function b () {
  var file = fsp.readFileAsync('./resources/filename').then(function(filename) {
    return fsp.readFileAsync('./resources/'+_.trim(filename));
  });
  var number = fsp.readFileAsync('./resources/number');

  Promise.settle([file, number]).then(function(results) {
    var f = _.trim(results[0]._settledValue)
    var n = parseInt(results[1]._settledValue);
    console.log('bluebird: '+f[n]);
  }).catch(function(err) {
    throw err;
  });
}

r();
a();
e();
b();

//****output*****
//eventproxy: e
//bluebird: e
//async: e
//raw: e

// problem two

var fs = require('fs');
var async = require('async');
var eventproxy = require('eventproxy');
var _ = require('lodash');

// raw
function r () {
  fs.readFile('./resources/number', function(err, number) {

    if (err) throw err;
    fs.readFile('./resources/string', function(err, string) {

      if (err) throw err;
      fs.readFile('./resources/key', function(err, key) {

        if (err) throw err;
        console.log('raw: '+number.toString()+string.toString()+key.toString());
      });
    });
  });
}

// async
function a () {
  async.map(['./resources/number', './resources/string', './resources/key'], fs.readFile, function(err, result) {
    if (err) throw err;
    console.log('async: '+result[0].toString()+result[1].toString()+result[2].toString());
  });
}

// eventproxy
function e () {
  var files = ['./resources/number', './resources/string', './resources/key'];
  var ep = eventproxy();
  ep.fail(function(err) {
    throw err;
  });
  ep.after('file', files.length, function(result) {
    console.log('eventproxy: '+result[0].toString()+result[1].toString()+result[2].toString());
  });
  for (var i=0; i<files.length; i++) {
    fs.readFile(files[i], ep.group('file'));
  }
}

r();
a();
e();

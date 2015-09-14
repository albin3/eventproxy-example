// problem two
'use strict';

var debug = require('debug')('problem2');
var fs = require('fs');
var async = require('async');
var eventproxy = require('eventproxy');
var Promise = require('bluebird');
var fsp = Promise.promisifyAll(fs);
var _ = require('lodash');

// raw
function r () {
  fs.readFile('./resources/number', function(err, number) {
    if (err) throw err;

    fs.readFile('./resources/string', function(err, string) {
      if (err) throw err;

      fs.readFile('./resources/key', function(err, key) {
        if (err) throw err;

        debug('raw: '+number.toString()+string.toString()+key.toString());
      });
    });
  });
}

// async
function a () {
  async.map(['./resources/number', './resources/string', './resources/key'], fs.readFile, function(err, result) {
    if (err) throw err;

    debug('async: '+result[0].toString()+result[1].toString()+result[2].toString());
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
    debug('eventproxy: '+result[0].toString()+result[1].toString()+result[2].toString());
  });

  for (var i=0; i<files.length; i++) {
    fs.readFile(files[i], ep.group('file'));
  }
}

// bluebird
function b () {
  var current = Promise.resolve();
  var files = ['./resources/number', './resources/string', './resources/key'];

  Promise.map(files, function(file) {
    current = current.then(function() {
      return fsp.readFileAsync(file);
    });
    return current;
  }).then(function(result) {
    debug('bluebird: '+result[0].toString()+result[1].toString()+result[2].toString());
  }).catch(function(e) {
    throw e;
  });
}

r();
a();
e();
b();

//*******************output*********************
//async: 1
//i am a string.
//hello
//
//eventproxy: 1
//i am a string.
//hello
//
//raw: 1
//i am a string.
//hello
//
//bluebird: 1
//i am a string.
//hello

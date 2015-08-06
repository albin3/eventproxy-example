// problem one
'use strict';

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
    number = _.trim(number);
    fs.readFile('./resources/json'+number, function(err, bufJson) {

      if (err) throw err;
      try {
        var value = JSON.parse(bufJson.toString())['hello'];
        fs.readFile('./resources/'+value, function(err, chunk) {

          if (err) throw err;
          console.log('raw: ', chunk.toString());
        });
      } catch (e) {
        throw "json parse error.";
      }
    });
  });
}

// async
function a () {
  async.auto({
    getNumber: function(cb) {
      fs.readFile('./resources/number', cb);
    },
    getFilename: ['getNumber', function(cb, result) {
      var number = _.trim(result['getNumber']);
      fs.readFile('./resources/json'+number, cb);
    }],
    readResult: ['getFilename', function(cb, result) {
      var bufJson = result['getFilename'];
      try {
        var fileName = JSON.parse(bufJson.toString())['hello'];
        fs.readFile('./resources/'+fileName, cb);
      } catch (e) {
        throw 'json parse error.';
      }
    }]
  }, function(err, result) {
    if (err) {
      throw err;
    } else {
      console.log('async:', result['readResult'].toString());
    }
  });
}

// eventproxy
function e () {
  var ep = eventproxy();
  ep.fail(function(err) {
    throw err;
  });

  ep.once('result', function(result) {
    console.log('eventproxy:', result.toString());
  });

  ep.once('json', function(json) {
    fs.readFile('./resources/'+json['hello'], ep.done('result'));
  });

  ep.once('number', function(number) {
    number = _.trim(number);
    fs.readFile('./resources/json'+number, ep.done(function(bufJson) {
      try {
        var json = JSON.parse(bufJson.toString());
        ep.emit('json', json);
      } catch (e) {
        ep.throw('json pasrse err.');
      }
    }));
  });

  fs.readFile('./resources/number', ep.done('number'));
}

// bluebird
function b () {
  var that = fsp;
  fsp.readFileAsync('./resources/number').then(function(number) {
    return fsp.readFileAsync('./resources/json'+_.trim(number));
  }).then(JSON.parse).then(function(json) {
    return fsp.readFileAsync('./resources/'+json['hello']);
  }).then(function(result) {
    console.log('bluebird: '+result.toString());
  })
  .catch(function(err) {
    throw err;
  });
}

r();
a();
e();
b();

//*******************output*********************
//
//eventproxy: This is the answer of problem 1.
//
//raw:  This is the answer of problem 1.
//
//async: This is the answer of problem 1.
//
//bluebird: This is the answer of problem 1.

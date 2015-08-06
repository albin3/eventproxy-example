// problem four
'use strict';

var fs = require('fs');
var async = require('async');
var eventproxy = require('eventproxy');
var Promise = require('bluebird');
var fsp = Promise.promisifyAll(fs);
var _ = require('lodash');

//raw
function r () {
  fs.readFile('./resources/jsonList', function(err, jsonList) {
    if (err) throw err;
    var list = JSON.parse(_.trim(jsonList));
    list.forEach(function(item) {
      var readFrom = item['readFrom'];
      fs.readFile('./resources/'+readFrom, function (err, value) {
        if (err) throw err;
        var saveAs = item['saveAs'];
        fs.writeFile('./resources/raw_'+saveAs, _.trim(value)+'\n', function (err) {
          if (err) throw err;
          console.log('raw completed.');
        });
      });
    });
  });
}


//async
function a () {
  fs.readFile('./resources/jsonList', function (err, jsonList) {
    if (err) throw err;
    var list = JSON.parse(_.trim(jsonList));
    async.each(list, function (item, cb) {
      async.waterfall([
        function (cb) {
          var readFrom = item['readFrom'];
          fs.readFile('./resources/'+readFrom, cb);
        },
        function (value, cb) {
          var saveAs = item['saveAs'];
          fs.writeFile('./resources/async_'+saveAs, _.trim(value)+'\n', cb);
        }
      ], function (err, result) {
        cb(err, result);
      });
    }, function (err) {
      if (err) throw err;
      console.log('async completed.');
    });
  });
}

//eventproxy
function e () {

  var ep = eventproxy();
  ep.fail(function(err) {
    throw err;
  });

  ep.after('write', 3, function (result) {
    console.log('eventproxy completed.');
  });

  ep.once('readJsonList', function(jsonList) {
    var list = JSON.parse(_.trim(jsonList));
    for (var i=0; i<list.length; i++) {
      readAndWriteFile(list[i]);
    }
  });

  function readAndWriteFile(item) {
    fs.readFile('./resources/'+item['readFrom'], function(err, value) {
      fs.writeFile('./resources/eventproxy_'+item['saveAs'], _.trim(value)+'\n',
      ep.done('write'));
    });
  }

  fs.readFile('./resources/jsonList', ep.done('readJsonList'));
}

//bluebird
function b () {
  fsp.readFileAsync('./resources/jsonList')
     .then(_.trim)
     .then(JSON.parse)
     .map(function(item) {
       return fsp.readFileAsync('./resources/'+item['readFrom'])
                 .then(function(value) {
                   return fsp.writeFileAsync('./resources/blurbird_'+item['saveAs'],
                                              _.trim(value)+'\n');
                 });
     }).then(function(results) {
       console.log('bluebird completed.');
     }).catch(function(err) {
       throw err;
     });
     /* 下面这种写法速度会很快，直接让bluebird运行速度排在第一，待确定原因
     .then(function (list) {
       return Promise.map(list, function(item) {
         return fsp.readFileAsync('./resources/'+item['readFrom'])
                   .then(function(value) {
                     fsp.writeFileAsync('./resources/bluebird_'+item['saveAs'],
                                        _.trim(value)+'\n');
                   });
       });
     }).then(function(results) {
       console.log('bluebird completed.');
     }).catch(function(err) {
       throw err;
     });
     */
}

r();
a();
e();
b();

//output
//raw completed.
//raw completed.
//raw completed.
//async completed.
//eventproxy completed.
//bluebird completed.

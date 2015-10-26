var Promise = require('bluebird');

Promise.resolve()
.then(function () {
  var pending = Promise.pending();
  setTimeout(function () {
    pending.resolve('resolve value.');
  }, 100);
  return pending.promise;       //onFulfilled return promise.
})
.then(function (value) {
  return value + ' ' + value;   //onFulfilled return value.
})
.then(function (value) {
  console.log(value);
  var pending = Promise.pending();
  setTimeout(function () {
    pending.reject('reject reason.');
  }, 100);
  return pending.promise;
})
.then(function () {}, function (reason) {
  console.log(reason);
});

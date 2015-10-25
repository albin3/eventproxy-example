function only_once(fn) {
  return function () {
    if (fn === null) return;
    fn.apply(this, arguments);
    fn = null;
  }
}

var async = {};
async.auto = function (tasks, callback) {
  var keys = Object.keys(tasks);
  var remainTasks = keys.length;
  var result = {};

}

function task1(cb) {
  setTimeout(function () {
    cb(null, 'task1 completed.');
  }, 600);
}
function task2(cb) {
  setTimeout(function () {
    cb(null, 'task2 completed.')
  }, 300);
}
function task3(cb) {
  setTimeout(function () {
    cb(null, 'task3 completed.');
  }, 200);
}
async.series([task1, task2, task3], function(err) {
  console.log('series completed.')
  console.log(arguments);
});


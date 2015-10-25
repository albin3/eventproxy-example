function only_once(fn) {
  return function () {
    if (fn === null) return;
    fn.apply(this, arguments);
    fn = null;
  }
}

var async = {};
async.series = function (tasks, callback) {
  var result = [];
  var i = 0;

  function done(err, data) {
    if (err) return callback(err);

    result.push(data);
    if (i < tasks.length) {
      tasks[i++](only_once(done));               //2.执行后一个任务
    } else {
      callback(null, result);         //3.所有任务执行完毕
    }
  }
  tasks[i++](only_once(done));                   //1.触发第一个任务
};

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



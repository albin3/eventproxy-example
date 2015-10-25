function only_once(fn) {
  return function () {
    if (fn === null) return;
    fn.apply(this, arguments);
    fn = null;
  }
}

var async = {};
async.parallel = function (tasks, callback) {
  var completed = tasks.length, i;
  var callback_once = only_once(callback);
  var result = [];

  tasks.forEach(function (task, key) {        //并行
    task(function (err, data) {               //执行
      completed--;                            //计数
      if (err) return callback_once(err);
      result[key] = data;
      if (completed === 0) return callback_once(null, result);    //计数到了以后返回
    });
  });
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
async.parallel([task1, task2, task3], function(err) {
  console.log('parallel completed.')
  console.log(arguments);
});


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
  var i;

  var listener = [];
  listener.push(function () {
    if (remainTasks === 0) return callback(null, result);
  });

  keys.forEach(function (taskKey, idx) {
    var taskItem = tasks[taskKey];
    var dep = [];
    var task;
    if (typeof taskItem === 'object' && taskItem.length > 1) {
      dep = taskItem.slice(0, taskItem.length-1);
      task = taskItem[taskItem.length-1];
    } else {
      task = taskItem;
    }
    var hook = function (){
      if (ready(dep)) {
        var idx = listener.indexOf(hook);
        if (idx >= 0) listener.splice(idx, 1);
        remainTasks--;
        task((function (taskKey) {
          return function (err, data) {
            result[taskKey] = data;
            done(err, data);
          }
        })(taskKey));
      }
    };
    listener.push(hook);
  });

  function done(err, data) {
    if (err) return callback(err);
    listener.forEach(function(fn) {
      fn();
    });
  }

  function ready(dep) {
    var i;
    for (i = 0; i < dep.length; i++) {
      if(!result.hasOwnProperty(dep[i])) {
        return false;
      }
    }
    return true;
  }

  done();         //触发第一次
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
async.auto({
  task1: function (cb) {
    setTimeout(function () {
      cb(null, 'task1 completed.');
    }, 100);
  },
  task2: function (cb) {
    setTimeout(function () {
      cb(null, 'task2 completed.');
    }, 300);
  },
  task3: ['task1', function (cb) {
    setTimeout(function () {
      cb(null, 'task3 completed.');
    }, 100);
  }]
}, function(err) {
  console.log('auto completed.')
  console.log(arguments);
});


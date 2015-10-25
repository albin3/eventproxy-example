# Async/Promise/EventProxy

JavaScript一直在解决异步的问题，而异步的解决方案也有很多，比较常见的有：

- [Async](https://github.com/caolan/async) —— 异步流程控制库


- [EventProxy](https://github.com/JacksonTian/eventproxy) —— 事件发布订阅模式
- [BlueBird](https://github.com/petkaantonov/bluebird) —— Promise方案
- [Generator](http://es6.ruanyifeng.com/#docs/generator) —— ES6原生Generator

## Async简介

Async进行异步流程控制使用调用计数、完成检测的方式完成异步流程控制。

两个典型是parallel、series，分别是并行执行任务和串行执行任务。下面分别介绍是如何实现的。

参数约定

| 参数       | 含义                    |
| -------- | --------------------- |
| cb       | 每个任务本身的回调函数，某个任务完成时调用 |
| callback | 整体的回调函数，所有任务完成时调用     |
| tasks    | 需要执行的任务列表(可以并行也可以串行)  |

### only_once

输入: 要求只能执行一次的函数

输出: 只能执行一次的函数

``` javascript
function only_once(fn) {
  return function () {
    if (fn === null) return;
    fn.apply(this, arguments);			//执行一次
    fn = null;							//后来者只能看到null
  }
}
```



### Async.parallel(Tasks, Callback)

画图看并行运行的流程

``` 
                    start         
                      |             
            +---------+---------+   
            v         v         v   
          task1     task2     task3 
            |         |         |   
            +---------+---------+   
                      v             
                   result           
```

采用调用`计数的方式`完成并行任务的控制：

``` javascript
var async = {};
async.parallel = function (tasks, callback) {
  var completed = tasks.length, i;
  var callback_once = only_once(callback);
  var result = [];

  tasks.forEach(function (task, key) {	//并行
    task(function (err, data) {			//传入每个任务的callback是不一样
      completed--;                      //执行结果计数
      if (err) return callback_once(err);
      result[key] = data;
      if (completed === 0) return callback_once(null, result);
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
```

### Async.series(Tasks, callback)

画图看串行运行的流程

``` 
                    start         
                      |   
                      v    
                    task1  
                      |   
                      v    
                    task2  
                      |   
                      v    
                    task3  
                      |    
                      v    
                   result           
```

采用`递归调用`完成串行行任务的控制：

``` javascript
ar async = {};
async.series = function (tasks, callback) {
  var result = [];
  var i = 0;

  function done(err, data) {
    if (err) return callback(err);

    result.push(data);
    if (i < tasks.length) {
      tasks[i++](only_once(done));    //2.执行后一个任务，依然使用done作为cb
    } else {
      callback(null, result);         //3.所有任务执行完毕
    }
  }
  tasks[i++](only_once(done));        //1.触发第一个任务
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
```

### Async.auto(Tasks, Callback)

画图看混合运行的流程

``` 
                    start         
                      |             
            +---------+---------+   
            v                   v   
          task1               task2 
            |                   |   
            |                 task3   
            |                   |   
            +---------+---------+   
                      v             
                   result       
```

采用调用`监听函数列表递归调用的方式`完成并行任务的控制：

``` javascript
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
  console.log('auto completed.');
  console.log(arguments);
});
```


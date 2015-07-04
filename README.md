# eventproxy-example
Examples for using EventProxy @ https://github.com/JacksonTian/eventproxy

源码中包含使用[Async](https://github.com/caolan/async)的写法

## 异步分类

###1串行深层嵌套

工作流

```
readNumber
   v
readJson
   v
readResult
   v
answer
```

1. 读取`./resources/number`得到`number`
2. 读取`./resources/json`+`number`得到`json['hello']`
3. 读取`./resources/`+`json['hello']`得到**result**

代码，详见problem1.js

```js
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
```

###2并行深层嵌套

工作流

```
readnumber   readstring   readkey
    v            v           v
               result
```

1. 同时读取number、string、key的值并显示

```js
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
```

###3混合嵌套

工作流

```
          readfilename as file      readnumber as n
                   v                    v
           read(file) as f              v
                   v                    v
                          result = f[n]
```

1. 读取filename得到file, 并行读取number记为n
2. 读取file得到f
3. 返回f的第n个字符

```
var ep = eventproxy();
ep.fail(function(err) {
  throw err;
});

ep.all('file', 'number', function(file, number) {
  var f = _.trim(file);
  var n = parseInt(_.trim(number));
  console.log('eventproxy: '+f[n]);
});

ep.once('filename', function(filename) {
  fs.readFile('./resources/'+_.trim(filename), ep.done('file'));
});

fs.readFile('./resources/filename', ep.done('filename'));
fs.readFile('./resources/number', ep.done('number'));
```

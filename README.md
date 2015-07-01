# eventproxy-example
Examples for using EventProxy @ https://github.com/JacksonTian/eventproxy

## 异步分类

###1深层嵌套

工作流

```js
readNumber
    v
readJson
    v
readResult

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

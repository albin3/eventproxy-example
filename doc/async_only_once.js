function only_once(fn) {
  return function () {
    if (fn === null) return;
    fn.apply(this, arguments);
    fn = null;
  }
}

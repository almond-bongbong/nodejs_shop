function* iterFunc() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
}

var iter = iterFunc();
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());
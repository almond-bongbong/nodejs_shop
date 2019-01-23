// var p1 = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     console.log('p1');
//     resolve({ value: 'p1' });
//   }, 3000);
// });
//
// var p2 = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     // reject(Error('error message'));
//     console.log('p2');
//     resolve({ value: 'p2' });
//   }, 4000);
// });

const job = (x) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(x);
      resolve(x);
    }, x * 1000);
  });
};

// Promise.all([p1, p2]).then((result) => {
//   console.log(result);
// }).catch((error) => {
//   console.log(error);
// });

// (async function(){
//   const [a, b] = await Promise.all( [job(3).then( () => { job(6) }), job(9) ]);
//   return a + b;
// })().then(result => console.log(result));

(async function() {
  const [a, b, c] = await Promise.all([job(3), job(6), job(9)]);
  return a + b + c;
})().then(res => console.log(res));

// (async function() {
//   const j3 = job(3);
//   const j9 = job(9);
//
//   await j3;
//   await job(6);
//   await j9;
// })();

// async function test() {
//   const result1 = await job(3);
//   console.log(result1);
//   const result2 = await job(4);
//   console.log(result2);
// }
//
// test();

// p1.then((result) => {
//   console.log('chain : ', result);
//
//   p2.then((result) => {
//     console.log('chain : ', result);
//   });
// });

const trace = require('../dist/client-inproc');

trace('hello', 'world!');

setInterval(() => {
  trace('hello!', Date.now())
}, 1000);
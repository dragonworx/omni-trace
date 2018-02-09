
const trace = require('../dist/trace-client-node');

trace('hello', 'world!');

setInterval(() => {
  trace('hello!', Date.now())
}, 2000);
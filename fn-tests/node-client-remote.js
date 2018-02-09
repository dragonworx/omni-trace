
const trace = require('../dist/client-node');

trace('hello', 'world!');

setInterval(() => {
  trace('hello!', Date.now())
}, 2000);
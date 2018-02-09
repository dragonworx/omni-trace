import trace from '../src/client/browser';

trace('hello', 'world!');

document.getElementById('button').onclick = () => trace('hello!', Date.now());
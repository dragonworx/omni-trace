import blessed from 'blessed';
import Input from './input';

export default class Log {
  constructor (box) {
    this.box = box;

    const input = new Input({
      parent: box,
      value: 'abcdefg',
      width: '100%-2',
      onAccept (value) {
        console.log(value);
      }
    });
  }
};
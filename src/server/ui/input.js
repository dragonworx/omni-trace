import blessed from 'blessed';

const log = function () { console.log.apply(console, arguments) };

export default class Input {
  hasFocus = false;
  buffer = [];
  cursorPos = 0;
  acceptHandler = () => {};

  constructor (opts) {
    const {
      parent,
      top = 0,
      left = 0,
      width = '100%',
      bg = 'blue',
      fg = 'white',
      value,
      onAccept,
    } = opts;
    const screen = parent.screen;

    const box = blessed.box({
      parent: parent,
      left,
      top,
      width,
      height: 1,
      style: {
        fg,
        bg,
      },
      tags: true,
      clickable: true,
    });

    box.on('focus', () => this.focus());
    box.on('blur', () => this.blur());
    box.on('mousedown', this.onMouseDown);

    screen.on('keypress', (key, event) => {
      if (this.hasFocus) {
        this.onKeyPress(event);
      }
    });

    this.box = box;
    this.screen = screen;
    this.acceptHandler = onAccept || this.acceptHandler;

    if (value) {
      this.buffer = value.split('');
      this.cursorPos = value.length;
      this.render();
    }

  }

  onMouseDown = (mouse) => {
    const { box, buffer } = this;
    this.setCursorPos(Math.min(mouse.x - box.aleft, buffer.length));
  }

  onKeyPress (event) {
    const {
      sequence,
      name,
      ctrl,
      meta,
      shift,
      full,
      ch
    } = event;
    const {
      buffer,
      cursorPos
    } = this;
    if (sequence && sequence === name) {
      this.insert(name);
    } else if (ch) {
      this.insert(ch);
    } else if (name === 'space') {
      this.insert(' ');
    } else if (name === 'left' && cursorPos > 0) {
      this.cursorPos--;
      this.render();
    } else if (name === 'right' && cursorPos < buffer.length) {
      this.cursorPos++;
      this.render();
    } else if (name === 'backspace' && cursorPos > 0) {
      this.buffer.splice(cursorPos - 1, 1);
      this.setCursorPos(cursorPos - 1);
    } else if (name === 'delete' && buffer.length > 0) {
      this.buffer.splice(cursorPos, 1);
      this.render();
    } else if (name === 'home') {
      this.setCursorPos(0);
    } else if (name === 'end') {
      this.setCursorPos(buffer.length);
    } else if (name === 'escape') {
      this.blur();
    } else if (name === 'return') {
      this.acceptHandler(this.value);
    }
  }

  insert (char) {
    this.buffer.splice(this.cursorPos, 0, char);
    this.cursorPos++;
    this.render();
  }

  focus () {
    if (!this.hasFocus) {
      this.hasFocus = true;
      this.render();
    }
  }

  blur () {
    if (this.hasFocus) {
      this.hasFocus = false;
      this.render();
    }
  }

  setCursorPos (pos) {
    this.cursorPos = pos;
    this.render();
  }

  render () {
    const { buffer, box, screen, cursorPos } = this;
    let content = buffer.slice();
    if (this.hasFocus) {
      content[cursorPos] = `{${box.style.bg}-fg}{${box.style.fg}-bg}${content[cursorPos] || ' '}{/}`;
    }
    box.setContent(content.join(''));
    screen.render();
  }

  get value () {
    return this.buffer.join('');
  }
}
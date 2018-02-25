import blessed from 'blessed';
import contrib from 'blessed-contrib';
import Log from './log';
import Output from './output';

const screen = blessed.screen({
  smartCSR: true,
  dockBorders: true,
});

const program = blessed.program();

screen.key(['C-c'], function(ch, key) {
  return process.exit(0);
});

const borderStyle = {
  type: 'line', 
  fg: 'cyan',
};

const labelStyle = {
  bold: true,
};

const logBox = blessed.box({
  parent: screen,
  style: {
    bg: 'black',
    label: labelStyle,
  },
  border: borderStyle,
  label: 'Log',
});

const outputLogger = blessed.log({
  parent: screen,
  style: {
    fg: 'green',
    bg: 'black',
    label: labelStyle,
  },
  border: borderStyle,
  label: 'Output',
  tags: true,
  scrollback: 100,
  scrollbar: {
    ch: ' ',
    track: {
      bg: 'grey'
    },
    style: {
      inverse: true
    }
  },
  keys: true,
  mouse: true,
});

const inspectorBox = blessed.box({
  parent: screen,
  style: {
    bg: 'red',
    label: labelStyle,
  },
  border: borderStyle,
  label: 'Inspector',
});

const clientsBox = blessed.box({
  parent: screen,
  style: {
    bg: 'green',
    label: labelStyle,
  },
  border: borderStyle,
  label: 'Clients',
});

const onResize = () => {
  const { width, height } = screen;
  const mx = Math.round(width * 0.7);
  const my = Math.round(height * 0.7);

  logBox.left = 0;
  logBox.top = 0;
  logBox.width = mx + 1;
  logBox.height = my + 1;

  outputLogger.left = 0;
  outputLogger.top = my;
  outputLogger.width = mx + 1;
  outputLogger.height = height - my;

  inspectorBox.left = mx;
  inspectorBox.top = 0;
  inspectorBox.width = width - mx;
  inspectorBox.height = my + 1;

  clientsBox.left = mx;
  clientsBox.top = my;
  clientsBox.width = width - mx;
  clientsBox.height = height - my;

  screen.render();
};

screen.on('resize', onResize);

onResize();

export const output = new Output(outputLogger);
export const log = new Log(logBox);
import blessed from 'blessed';
import contrib from 'blessed-contrib';

const screen = blessed.screen({
  smartCSR: true
})

const grid = new contrib.grid({rows: 3, cols: 3, screen: screen});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

//grid.set(row, col, rowSpan, colSpan, obj, opts)
const map = grid.set(0, 2, 2, 1, contrib.map, {label: 'World Map2'})
const box = grid.set(0, 0, 3, 2, blessed.box, {
  label: 'check', 
  tags: true,
  keys: true,
  height: '100%-5',
  style: {
    bg: 'blue',
  }
});
const table = grid.set(2, 2, 1, 1, contrib.table, {
  keys: true
     , fg: 'white'
     , selectedFg: 'white'
     , selectedBg: 'blue'
     , interactive: true,
     height: '50%+1',
      label: 'Active Processes'
     , columnSpacing: 10 //in chars
     , columnWidth: [5, 5, 5] /*in chars*/
});

table.setData(
  { headers: ['col1', 'col2', 'col3']
  , data:
     [ [1, 2, 3]
     , [4, 5, 6] ]})

box.on('mousemove', function(mouse) {
  let content = '';
  const rnd = Math.random().toFixed(2);
  for (let i = 0; i < box.height; i++) {
    const isHighlight = i === mouse.y - 1;
    // any way to strip tags?
    let line = `{${isHighlight ? 'yellow-bg' : 'blue-bg'}}Hello ${i} {bold}${rnd}{/bold}! ${mouse.x - box.left} x ${mouse.y}`;
    let lineStripped = blessed.stripTags(line);
    line += '-' + lineStripped.length + '~' + box.width;
    while (lineStripped.length < box.width - 9) {
      lineStripped += ' ';
      line += ' ';
    }
    line += '{/}\n';
    content += line;
  }
  box.setContent(content);
  screen.render();
});

box.key('enter', (ch, key) => {
  console.log(">");
});

// box.focus();

box.on('mouseover', () => {
  box.focus();
});

const bar = blessed.box({
  parent: box,
  width: 1,
  height: '100%-2',
  left: '100%-3',
  style: {
    bg: 'green'
  }
});

screen.render()
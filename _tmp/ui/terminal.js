var blessed = require('blessed');

var program = blessed.program();

program.key('C-c', function(ch, key) {
  program.clear();
  program.disableMouse();
  program.showCursor();
  program.normalBuffer();
  process.exit(0);
});

// program.on('mouse', function(data) {
//   if (data.action === 'mousemove') {
//     program.move(data.x, data.y);
//     program.bg('red');
//     program.write('x');
//     program.bg('!red');
//   }
// });

program.alternateBuffer();
program.enableMouse();
program.hideCursor();
program.clear();

var screen = blessed.screen({
  smartCSR: true,
  autoPadding: false,
  warnings: true,
  dockBorders: true,
  title: 'trace'
});

var log = require('./log')(screen).log;
var filter = require('./filter')(screen);


// program.move(1, 1);
// program.bg('black');
// program.write('Hello world', 'blue fg');
// program.setx((program.cols / 2 | 0) - 4);
// program.down(5);
// program.write('Hi again!');
// program.bg('!black');
// program.feed();

module.exports = {
  render: function () {
    screen.render();
  },
  log: function () {
    log.apply(undefined, arguments);
  }
};
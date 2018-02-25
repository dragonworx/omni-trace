var blessed = require('blessed');

module.exports = function (screen) {
  var textbox = blessed.textbox({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    border: 'line',
    tags: true,
    keys: true,
    vi: false,
    mouse: true,
    style: {
      bg: '#ccc',
    }
  });

  textbox.focus();
  textbox.readInput(function (done) {
    var value = textbox.value;
    // TODO: apply filter...
  });
  
  return {

  };
};
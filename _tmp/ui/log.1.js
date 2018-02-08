var blessed = require('blessed');



// setInterval(function() {
// }, 100).unref();

// logger.log('Hello {#0fe1ab-fg}world{/}: {bold}%s{/bold}.', c, Date.now().toString(36));
// logger.log({foo:{bar:{baz:true}}});

module.exports = function (screen) {
  var logger = blessed.log({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '100%',
    height: '100%-4',
    border: 'line',
    tags: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollbar: {
      ch: ' ',
      track: {
        bg: 'yellow'
      },
      style: {
        inverse: true
      }
    }
  });

  // logger.focus();
  
  return {
    log: function () {
      logger.log.apply(logger, arguments);
    }
  };
};
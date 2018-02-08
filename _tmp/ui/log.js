var blessed = require('blessed');



// setInterval(function() {
// }, 100).unref();

// logger.log('Hello {#0fe1ab-fg}world{/}: {bold}%s{/bold}.', c, Date.now().toString(36));
// logger.log({foo:{bar:{baz:true}}});

module.exports = function (screen) {
  var box = blessed.box({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '100%',
    height: '100%-4',
    border: 'line',
    tags: true,
  });

  box.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
  screen.render();

  // logger.focus();
  
  return {
    log: function () {
      // logger.log.apply(logger, arguments);
    }
  };
};
const WebSocket = require('ws');
const term = require('terminal-kit').terminal;

module.exports = function socket (host, port) {
  return new Promise((resolve, reject) => {
    host = host || 'ws://127.0.0.1';
    port = port || 8080;
    const ws = new WebSocket(host + ':' + port);
    
    ws.on('open', function open() {
      const send = ws.send;
      ws.send = function (data) {
        const message = {
          clientId: ws.id,
          data: data
        };
        const json = JSON.stringify(message);
        term.cyan('node client ').yellow(ws.id).cyan(' sending: ').white(JSON.stringify(data) + '\n')
        send.call(ws, json);
      };
      const close = ws.close;
      ws.close = function () {
        this.send({cmd: 'close'});
      };
      resolve(ws);
    });
    
    ws.on('message', function (json) {
      const data = JSON.parse(json);
      if (data.cmd === 'id.set') {
        term.gray('setting node client id: ' + data.value + '\n');
        ws.id = data.value;
      }
      term.cyan('node client ').yellow(ws.id).cyan(' received: ').bold.brightCyan(data.cmd + '\n');
    });
  });
};
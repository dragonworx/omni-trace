import WebSocket from 'ws';

let wss = null;
let clientId = 0;

function server (port) {
  return new Promise((resolve, reject) => {
    port = port || 8080;

    wss = new WebSocket.Server({ port: port });

    wss.on('connection', function connection (ws) {
      clientId++;
      console.log('new client connected: #' + clientId + '\n');

      ws.id = clientId;
      ws.isAlive = true;

      ws.on('pong', function heartbeat() {
        this.isAlive = true;
      });

      ws.on('message', function (message) {
        const msg = JSON.parse(message);

        if (ws.isClosed) {
          console.log('server-received (ws.closed): '+ message + '\n');
          return;
        }

        console.log('server-received: ' + message + '\n');

        if (msg.cmd === 'close') {
          close(ws, 'CLIENT-INITIATED');
        }
      });

      ws.on('error', e => {
        close(ws, 'ECONNRESET');
      })

      ws.send(JSON.stringify({ cmd: 'id.set', value: clientId }));
    });

    wss.on('error', e => {
      console.log('wss-error', e.stack)
    });

    wss.on('close', function (code, reason) {
      console.log('close', code, reason);
    });

    console.log('------------------------------\nTrace Server started on port: ' + port + '\n');;

    // pollPurgeBrokenConnections();

    resolve(wss);
  });
}

function close (ws, reason) {
  console.log('closed client connection: #' + ws.id + ' (' + reason + ')\n');
  ws.terminate();
  ws.isClosed = true;
}

function pollPurgeBrokenConnections (intervalMs) {
  intervalMs = intervalMs || 10;
  const interval = setInterval(function ping () {
    wss.clients.forEach(function (ws) {
      if (ws.isAlive === false) {
        console.log('terminating: ' + ws.id);
        return ws.terminate();
      }
  
      ws.isAlive = false;
      ws.ping('', false, true);
    });
  }, intervalMs);
}

export default server;
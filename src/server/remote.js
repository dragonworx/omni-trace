import WebSocket from 'ws';
import LocalServer from './local';

class Server {
  constructor () {
    this.wss = null;
    this.clientId = 0;

    this.server = new LocalServer();
  }

  start (port = 8080) {
    return new Promise((resolve, reject) => {
      try {
        const wss = new WebSocket.Server({ port: port });
        this.wss = wss;
    
        wss.on('connection', ws => {
          const clientId = ++this.clientId;
          console.log('new client connected: #' + clientId);
    
          ws.clientId = clientId;
          ws.isAlive = true;
    
          ws.on('pong', function heartbeat() {
            ws.isAlive = true;
          });
    
          ws.on('message', message => {
            const msg = JSON.parse(message);
    
            if (ws.isClosed) {
              console.log('server-received (ws.closed): '+ message);
              return;
            }
    
            console.log('server-received: ' + message);
    
            if (msg.cmd === 'close') {
              this.close(ws, 'CLIENT-INITIATED');
            } else if (msg.cmd === 'trace') {
              this.server.trace({
                clientId: msg.clientId,
                data: msg.data
              });
            }
          });
    
          ws.on('error', e => {
            this.close(ws, 'ECONNRESET');
          })
    
          ws.send(JSON.stringify({ cmd: 'id.set', value: clientId }));
        });
    
        wss.on('error', e => {
          console.log('wss-error', e.stack);
        });
    
        wss.on('close', (code, reason) => {
          console.log('close', code, reason);
        });
    
        console.log('------------------------------\nTrace Server started on port: ' + port + '\n');;
    
        // this.pollPurgeBrokenConnections();
    
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  close (ws, reason) {
    console.log('closed client connection: #' + ws.clientId + ' (' + reason + ')');
    ws.terminate();
    ws.isClosed = true;
  }

  pollPurgeBrokenConnections (intervalMs = 10) {
    const interval = setInterval(() => {
      this.wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
          console.log('terminating: ' + ws.clientId);
          return ws.terminate();
        }
    
        ws.isAlive = false;
        ws.ping();
      });
    }, intervalMs);
  }
}

export default Server;
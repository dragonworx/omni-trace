import AdapterBase from './adapter-base';

export default class BrowserSocketAdapter extends AdapterBase {
  createSocket (host, port) {
    return new Promise((resolve, reject) => {
      try {
        const socket = this.newSocket(host, port);

        socket.onopen = event => {
          resolve(socket);
        };
    
        socket.onmessage = event => {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        };
    
        socket.onerror = error => {
          this.onError(error);
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  newSocket (host, port) {
    return new WebSocket(host + ':' + port);
  }

  socketSend (jsonStr) {
    this.socket.send(jsonStr);
  }
};
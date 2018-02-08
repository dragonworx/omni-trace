import config from './host-config';

export default class BrowserSocketAdapter {
  constructor (onMessageHandler) {
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.hasError = false;
    this.clientId = null;
    this.onMessageHandler = onMessageHandler;
  }

  connect () {
    return new Promise((resolve, reject) => {
      const { host, port } = config;

      try {
        const socket = new WebSocket(host + ':' + port);

        config.isConnecting = true;
        this.socket = socket;

        socket.onopen = event => {
          this.isConnected = true;
          this.isConnecting = false;
          setTimeout(() => {
            resolve(socket);
          }, 0);
        };

        socket.onmessage = event => {
          const data = JSON.parse(event.data);
          if (data.cmd === 'id.set') {
            this.clientId = data.value;
          }
          this.onMessageHandler(data);
        };

        socket.onerror = function (error) {
          this.hasError = true;
          console.log('error!');
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  send (cmd, data) {
    if (this.hasError) {
      throw new Error('Cannot send trace data, socket has failed.');
    }

    const message = {
      clientId: this.clientId,
      cmd: cmd,
      data: data,
    };

    try {
      const json = JSON.stringify(message);
      this.socket.send(json);
    } catch (e) {
      throw new Error('Cannot convert trace message data to JSON')
    }
  }

  close () {
    this.send('close');
  }
};
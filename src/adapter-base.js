import config from './config';

export default class AdapterBase {
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

      config.isConnecting = true;

      console.log('connecting:', host, port);
      this.createSocket(host, port).then(socket => {
        this.socket = socket;
        this.isConnected = true;
        this.isConnecting = false;
        
        this.resolveConnection = resolve;
      }).catch(reject);
    });
  }

  createSocket (host, port) {
    // 1. create socket implementation
    // 2. bind to handlers
    // 3. return Promise.resolve(socket)
    throw new Error('unimplemented');
  }

  onMessage (data) {
    if (data.cmd === 'id.set') {
      this.clientId = data.value;
      this.resolveConnection();
    }
    this.onMessageHandler(data);
  }

  onError (error) {
    this.hasError = true;
    console.log('error!', error);
  }

  send (cmd, data = null) {
    if (this.hasError) {
      throw new Error('Cannot send trace data, socket has failed.');
    }

    const message = {
      clientId: this.clientId,
      cmd: cmd,
      data: data,
    };

    try {
      const jsonStr = JSON.stringify(message);
      this.socketSend(jsonStr);
    } catch (e) {
      throw new Error('Cannot convert trace message data to JSON: ' + e.toString())
    }
  }

  socketSend (jsonStr) {
    // send json string using socket implementation
    throw new Error('unimplemented');
  }

  close () {
    this.send('close');
  }
};
import BrowserAdapterBase from './adapter-socket-browser';
import WebSocket from 'ws';

export default class NodeSocketAdapter extends BrowserAdapterBase {
  constructor (onMessageHandler) {
    super(onMessageHandler);
    
    //do something when app is closing
    process.on('exit', this.onExit.bind(this, { cleanup: true }));
    
    //catches ctrl+c event
    process.on('SIGINT', this.onExit.bind(this, { exit: true }));
    
    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', this.onExit.bind(this, { exit: true }));
    process.on('SIGUSR2', this.onExit.bind(this, { exit: true }));
    
    //catches uncaught exceptions
    process.on('uncaughtException', this.onExit.bind(this, { exit: true }));
    process.on('unhandledRejection', this.onExit.bind(this, { exit: true }));
  }

  onExit (options, err) {
    this.close();
    
    if (options.exit) {
      process.exit();
    }
  }

  newSocket (host, port) {
    return new WebSocket(host + ':' + port);
  }
};
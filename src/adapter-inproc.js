import AdapterBase from './adapter-base';

export default class InProcAdapter extends AdapterBase {
  createSocket (host, port) {
    return Promise.resolve();
  }
};
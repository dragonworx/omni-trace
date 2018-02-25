import blessed from 'blessed';

export default class Output {
  constructor (logger) {
    this.logger = logger;
  }

  log (textMessage) {
    this.logger.log(textMessage);
  }
};
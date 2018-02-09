import config from './config';
import InProcAdapter from './adapter-inproc';

export default function getAdapter (Adapter) {
  return config.inproc ? InProcAdapter : Adapter;
};
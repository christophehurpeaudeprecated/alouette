import StackTraceItem from './StackTraceItem';

export default class StackTrace {
  items: Array<StackTraceItem>;

  constructor() {
    this.items = [];
  }

  forEach(...args) {
    return this.items.forEach(...args);
  }

  toArray() {
    return this.items.map(item => item.toString());
  }

  toString() {
    return this.toArray().join('\n');
  }
}

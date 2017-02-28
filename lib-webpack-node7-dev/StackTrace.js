

export default class StackTrace {

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
//# sourceMappingURL=StackTrace.js.map
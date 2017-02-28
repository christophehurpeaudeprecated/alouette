'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class StackTrace {

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
exports.default = StackTrace;
//# sourceMappingURL=StackTrace.js.map
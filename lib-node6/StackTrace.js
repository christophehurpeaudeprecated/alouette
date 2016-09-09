'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _StackTraceItem = require('./StackTraceItem');

var _StackTraceItem2 = _interopRequireDefault(_StackTraceItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class StackTrace {

  constructor() {
    this.items = [];
  }

  forEach() {
    return this.items.forEach(...arguments);
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
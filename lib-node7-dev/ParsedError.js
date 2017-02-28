'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _StackTrace = require('./StackTrace');

var _StackTrace2 = _interopRequireDefault(_StackTrace);

var _flowRuntime = require('flow-runtime');

var _flowRuntime2 = _interopRequireDefault(_flowRuntime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ParsedError extends Error {

  constructor(err, stackTrace) {
    let _errType = _flowRuntime2.default.ref('Error');

    let _stackTraceType = _flowRuntime2.default.ref(_StackTrace2.default);

    _flowRuntime2.default.param('err', _errType).assert(err);

    _flowRuntime2.default.param('stackTrace', _stackTraceType).assert(stackTrace);

    super(err.message);
    this.originalError = err;
    this.stackTrace = stackTrace;

    // http://stackoverflow.com/questions/35392675/how-to-override-error-stack-getter
    this.stack = this.toString();
  }

  get name() {
    const _returnType = _flowRuntime2.default.return(_flowRuntime2.default.string());

    return _returnType.assert(this.originalError.name);
  }

  get message() {
    const _returnType2 = _flowRuntime2.default.return(_flowRuntime2.default.string());

    return _returnType2.assert(this.originalError.message);
  }

  get originalStack() {
    const _returnType3 = _flowRuntime2.default.return(_flowRuntime2.default.string());

    return _returnType3.assert(this.originalError.stack);
  }

  toString() {
    if (this._toStringCache) {
      return this._toStringCache;
    }

    let str = `ParsedError: ${this.name}: ${this.message}\n`;
    str += this.stackTrace.toString();

    if (this.previous) {
      str += '\n';
      str += 'PREVIOUS: ';
      str += this.previous.toString();
    }

    return this._toStringCache = str;
  }
}
exports.default = ParsedError;
//# sourceMappingURL=ParsedError.js.map
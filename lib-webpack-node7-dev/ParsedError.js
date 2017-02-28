import StackTrace from './StackTrace';

import t from 'flow-runtime';
export default class ParsedError extends Error {

  constructor(err, stackTrace) {
    let _errType = t.ref('Error');

    let _stackTraceType = t.ref(StackTrace);

    t.param('err', _errType).assert(err);
    t.param('stackTrace', _stackTraceType).assert(stackTrace);

    super(err.message);
    this.originalError = err;
    this.stackTrace = stackTrace;

    // http://stackoverflow.com/questions/35392675/how-to-override-error-stack-getter
    this.stack = this.toString();
  }

  get name() {
    const _returnType = t.return(t.string());

    return _returnType.assert(this.originalError.name);
  }

  get message() {
    const _returnType2 = t.return(t.string());

    return _returnType2.assert(this.originalError.message);
  }

  get originalStack() {
    const _returnType3 = t.return(t.string());

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
//# sourceMappingURL=ParsedError.js.map
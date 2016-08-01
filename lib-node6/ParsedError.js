'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _StackTrace = require('./StackTrace');

var _StackTrace2 = _interopRequireDefault(_StackTrace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ParsedError extends Error {

    constructor(err, stackTrace) {
        super(err.message);
        this.originalError = err;
        this.stackTrace = stackTrace;

        // http://stackoverflow.com/questions/35392675/how-to-override-error-stack-getter
        this.stack = this.toString();
    }

    get name() {
        return this.originalError.name;
    }

    get message() {
        return this.originalError.message;
    }

    get originalStack() {
        return this.originalError.stack;
    }

    toString() {
        if (this._toStringCache) {
            return this._toStringCache;
        }

        let str = `ParsedError: ${ this.name }: ${ this.message }\n`;
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
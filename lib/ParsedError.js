'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _StackTrace = require('./StackTrace');

var _StackTrace2 = _interopRequireDefault(_StackTrace);

/**
 * @function
 * @param obj
*/
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ParsedError = class ParsedError extends Error {
    /**
     * @param {Error} err
     * @param {StackTrace} stackTrace
    */

    constructor(err, stackTrace) {
        super(err.message);
        this.originalError = err;
        this.stackTrace = stackTrace;

        // http://stackoverflow.com/questions/35392675/how-to-override-error-stack-getter
        this.stack = this.toString();
    }

    /**
     * @member name
    */get name() {
        return this.originalError.name;
    }

    /**
     * @member message
    */get message() {
        return this.originalError.message;
    }

    /**
     * @member originalStack
    */get originalStack() {
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
};
exports.default = ParsedError;
//# sourceMappingURL=ParsedError.js.map
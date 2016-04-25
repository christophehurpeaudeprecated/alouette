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

let ParsedError = class ParsedError {
    /**
     * @param err
    */

    constructor(err) {
        this.originalError = err;
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

    /**
     * @member stack
    */get stack() {
        return this.toString();
    }

    toString() {
        if (this._toStringCache) {
            return this._toStringCache;
        }

        let str = `${ this.name }: ${ this.message }\n`;
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
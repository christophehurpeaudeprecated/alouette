'use strict';

var _createClass = require('babel-runtime/helpers/create-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

Object.defineProperty(exports, '__esModule', {
    value: true
});
/** @class ParsedError 
* @param err */
let ParsedError = (function () {
    function ParsedError(err) {
        _classCallCheck(this, ParsedError);

        this.name = err.name;
        this.message = err.message;
        this.originalStack = err.stack;
    }

    _createClass(ParsedError, [{
        key: 'toString',
        /** @memberof ParsedError 
        * @instance 
        * @method toString */value: function toString() {
            let str = this.name + ': ' + this.message + '\n';
            str += this.stack.toString();

            if (this.previous) {
                str += '\n';
                str += 'PREVIOUS: ';
                str += this.previous.toString();
            }

            return str;
        }
    }]);

    return ParsedError;
})();

exports.default = ParsedError;
module.exports = exports.default;
//# sourceMappingURL=ParsedError.js.map
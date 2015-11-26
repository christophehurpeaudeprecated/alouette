'use strict';

var _createClass = require('babel-runtime/helpers/create-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

Object.defineProperty(exports, '__esModule', {
    value: true
});
/** @class StackTrace */
let StackTrace = (function () {
    function StackTrace() {
        _classCallCheck(this, StackTrace);

        this.items = [];
    }

    _createClass(StackTrace, [{
        key: 'forEach',
        /** @memberof StackTrace 
        * @instance 
        * @method forEach */value: function forEach() {
            var _items;

            return (_items = this.items).forEach.apply(_items, arguments);
        }
    }, {
        key: 'toString',
        /** @memberof StackTrace 
        * @instance 
        * @method toString */value: function toString() {
            let str = '';
            this.render(function (string) {
                return str += string + '\n';
            });
            return str;
        }
    }, {
        key: 'render',
        /** @memberof StackTrace 
        * @instance 
        * @method render 
        * @param log */value: function render(log) {
            this.forEach(function (line) {
                return line.render(log);
            });
        }
    }]);

    return StackTrace;
})();

exports.default = StackTrace;
module.exports = exports.default;
//# sourceMappingURL=StackTrace.js.map
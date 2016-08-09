var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import StackTrace from './StackTrace';

var ParsedError = function (_Error) {
    _inherits(ParsedError, _Error);

    function ParsedError(err, stackTrace) {
        _classCallCheck(this, ParsedError);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ParsedError).call(this, err.message));

        _this.originalError = err;
        _this.stackTrace = stackTrace;

        // http://stackoverflow.com/questions/35392675/how-to-override-error-stack-getter
        _this.stack = _this.toString();
        return _this;
    }

    _createClass(ParsedError, [{
        key: 'toString',
        value: function toString() {
            if (this._toStringCache) {
                return this._toStringCache;
            }

            var str = 'ParsedError: ' + this.name + ': ' + this.message + '\n';
            str += this.stackTrace.toString();

            if (this.previous) {
                str += '\n';
                str += 'PREVIOUS: ';
                str += this.previous.toString();
            }

            return this._toStringCache = str;
        }
    }, {
        key: 'name',
        get: function get() {
            return this.originalError.name;
        }
    }, {
        key: 'message',
        get: function get() {
            return this.originalError.message;
        }
    }, {
        key: 'originalStack',
        get: function get() {
            return this.originalError.stack;
        }
    }]);

    return ParsedError;
}(Error);

export default ParsedError;
//# sourceMappingURL=ParsedError.js.map
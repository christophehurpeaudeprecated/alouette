'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _StackTrace = require('./StackTrace');

var _StackTrace2 = _interopRequireDefault(_StackTrace);

var _flowRuntime = require('flow-runtime');

var _flowRuntime2 = _interopRequireDefault(_flowRuntime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ParsedError = function (_Error) {
  _inherits(ParsedError, _Error);

  function ParsedError(err, stackTrace) {
    _classCallCheck(this, ParsedError);

    var _errType = _flowRuntime2.default.ref('Error');

    var _stackTraceType = _flowRuntime2.default.ref(_StackTrace2.default);

    _flowRuntime2.default.param('err', _errType).assert(err);

    _flowRuntime2.default.param('stackTrace', _stackTraceType).assert(stackTrace);

    var _this = _possibleConstructorReturn(this, (ParsedError.__proto__ || Object.getPrototypeOf(ParsedError)).call(this, err.message));

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
      var _returnType = _flowRuntime2.default.return(_flowRuntime2.default.string());

      return _returnType.assert(this.originalError.name);
    }
  }, {
    key: 'message',
    get: function get() {
      var _returnType2 = _flowRuntime2.default.return(_flowRuntime2.default.string());

      return _returnType2.assert(this.originalError.message);
    }
  }, {
    key: 'originalStack',
    get: function get() {
      var _returnType3 = _flowRuntime2.default.return(_flowRuntime2.default.string());

      return _returnType3.assert(this.originalError.stack);
    }
  }]);

  return ParsedError;
}(Error);

exports.default = ParsedError;
//# sourceMappingURL=ParsedError.js.map
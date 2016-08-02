'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _StackTrace = require('./StackTrace');

var _StackTrace2 = _interopRequireDefault(_StackTrace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ParsedError = function (_Error) {
    _inherits(ParsedError, _Error);

    function ParsedError(err, stackTrace) {
        _classCallCheck(this, ParsedError);

        if (!(err instanceof Error)) {
            throw new TypeError('Value of argument "err" violates contract.\n\nExpected:\nError\n\nGot:\n' + _inspect(err));
        }

        if (!(stackTrace instanceof _StackTrace2.default)) {
            throw new TypeError('Value of argument "stackTrace" violates contract.\n\nExpected:\nStackTrace\n\nGot:\n' + _inspect(stackTrace));
        }

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
            function _ref(_id) {
                if (!(typeof _id === 'string')) {
                    throw new TypeError('Function return value violates contract.\n\nExpected:\nstring\n\nGot:\n' + _inspect(_id));
                }

                return _id;
            }

            return _ref(this.originalError.name);
        }
    }, {
        key: 'message',
        get: function get() {
            function _ref2(_id2) {
                if (!(typeof _id2 === 'string')) {
                    throw new TypeError('Function return value violates contract.\n\nExpected:\nstring\n\nGot:\n' + _inspect(_id2));
                }

                return _id2;
            }

            return _ref2(this.originalError.message);
        }
    }, {
        key: 'originalStack',
        get: function get() {
            function _ref3(_id3) {
                if (!(typeof _id3 === 'string')) {
                    throw new TypeError('Function return value violates contract.\n\nExpected:\nstring\n\nGot:\n' + _inspect(_id3));
                }

                return _id3;
            }

            return _ref3(this.originalError.stack);
        }
    }]);

    return ParsedError;
}(Error);

exports.default = ParsedError;

function _inspect(input, depth) {
    var maxDepth = 4;
    var maxKeys = 15;

    if (depth === undefined) {
        depth = 0;
    }

    depth += 1;

    if (input === null) {
        return 'null';
    } else if (input === undefined) {
        return 'void';
    } else if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
        return typeof input === 'undefined' ? 'undefined' : _typeof(input);
    } else if (Array.isArray(input)) {
        if (input.length > 0) {
            var _ret = function () {
                if (depth > maxDepth) return {
                        v: '[...]'
                    };

                var first = _inspect(input[0], depth);

                if (input.every(function (item) {
                    return _inspect(item, depth) === first;
                })) {
                    return {
                        v: first.trim() + '[]'
                    };
                } else {
                    return {
                        v: '[' + input.slice(0, maxKeys).map(function (item) {
                            return _inspect(item, depth);
                        }).join(', ') + (input.length >= maxKeys ? ', ...' : '') + ']'
                    };
                }
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        } else {
            return 'Array';
        }
    } else {
        var keys = Object.keys(input);

        if (!keys.length) {
            if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
                return input.constructor.name;
            } else {
                return 'Object';
            }
        }

        if (depth > maxDepth) return '{...}';
        var indent = '  '.repeat(depth - 1);
        var entries = keys.slice(0, maxKeys).map(function (key) {
            return (/^([A-Z_$][A-Z0-9_$]*)$/i.test(key) ? key : JSON.stringify(key)) + ': ' + _inspect(input[key], depth) + ';';
        }).join('\n  ' + indent);

        if (keys.length >= maxKeys) {
            entries += '\n  ' + indent + '...';
        }

        if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
            return input.constructor.name + ' {\n  ' + indent + entries + '\n' + indent + '}';
        } else {
            return '{\n  ' + indent + entries + '\n' + indent + '}';
        }
    }
}
//# sourceMappingURL=ParsedError.js.map
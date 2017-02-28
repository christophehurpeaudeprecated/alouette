'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StackTrace = function () {
  function StackTrace() {
    _classCallCheck(this, StackTrace);

    this.items = [];
  }

  _createClass(StackTrace, [{
    key: 'forEach',
    value: function forEach() {
      var _items;

      return (_items = this.items).forEach.apply(_items, arguments);
    }
  }, {
    key: 'toArray',
    value: function toArray() {
      return this.items.map(function (item) {
        return item.toString();
      });
    }
  }, {
    key: 'toString',
    value: function toString() {
      return this.toArray().join('\n');
    }
  }]);

  return StackTrace;
}();

exports.default = StackTrace;
//# sourceMappingURL=StackTrace.js.map
'use strict';

var _createClass = require('babel-runtime/helpers/create-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

Object.defineProperty(exports, '__esModule', {
    value: true
});
/** @class StackTraceItem 
* @param item 
* @param sourceMapping */
let StackTraceItem = (function () {
    function StackTraceItem(item, sourceMapping) {
        _classCallCheck(this, StackTraceItem);

        this.fileName = item.fileName;
        this.lineNumber = item.lineNumber;
        this.columnNumber = item.columnNumber;
        this.functionName = item.functionName;
        this.typeName = item.typeName;
        this.methodName = item.methodName;
        this.native = item.native;
        this.file = item.file;

        this.compiledFileName = item.compiledFileName;
        this.compiledLineNumber = item.compiledLineNumber;
        this.compiledColumnNumber = item.compiledColumnNumber;

        if (sourceMapping && item.fileName && item.fileName.startsWith(sourceMapping.current)) {
            this.realFileName = sourceMapping.source + item.fileName.substr(sourceMapping.current.length);
            if (this.compiledFileName) {
                this.realCompiledFileName = sourceMapping.source + item.fileName.substr(sourceMapping.current.length);
            }
        } else {
            this.realFileName = item.fileName;
            this.realCompiledFileName = item.compiledFileName;
        }
    }

    _createClass(StackTraceItem, [{
        key: 'getFileName',
        /** @memberof StackTraceItem 
        * @instance 
        * @method getFileName */value: function getFileName() {
            return this.fileName;
        }
    }, {
        key: 'getLineNumber',
        /** @memberof StackTraceItem 
        * @instance 
        * @method getLineNumber */value: function getLineNumber() {
            return this.line;
        }
    }, {
        key: 'getColumnNumber',
        /** @memberof StackTraceItem 
        * @instance 
        * @method getColumnNumber */value: function getColumnNumber() {
            return this.column + 1;
        }
    }, {
        key: 'getScriptNameOrSourceURL',
        /** @memberof StackTraceItem 
        * @instance 
        * @method getScriptNameOrSourceURL */value: function getScriptNameOrSourceURL() {
            return this.fileName;
        }
    }, {
        key: 'render',
        /** @memberof StackTraceItem 
        * @instance 
        * @method render 
        * @param log */value: function render(log) {
            let str = '    at ';
            if (this.functionName) {
                str += this.functionName;
            } else if (this.typeName) {
                str += this.typeName + '.' + (this.methodName || '<anonymous>');
            }

            if (this.native) {
                str += ' [native]';
            } else {
                const fullPath = this.realFileName + ':' + this.lineNumber + ':' + this.columnNumber;
                str += ' (' + fullPath + ')';

                if (this.compiledFileName && this.compiledFileName !== this.realFileName) {
                    const compiledPath = this.compiledFileName + ':' + this.compiledLineNumber + ':' + this.compiledColumnNumber;
                    str += ' (compiled= ' + compiledPath + ')';
                }
            }

            log(str);
        }
    }]);

    return StackTraceItem;
})();

exports.default = StackTraceItem;
module.exports = exports.default;
//# sourceMappingURL=StackTraceItem.js.map
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StackTraceItem = function () {
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
        value: function getFileName() {
            return this.fileName;
        }
    }, {
        key: 'getLineNumber',
        value: function getLineNumber() {
            return this.line;
        }
    }, {
        key: 'getColumnNumber',
        value: function getColumnNumber() {
            return this.column + 1;
        }
    }, {
        key: 'getScriptNameOrSourceURL',
        value: function getScriptNameOrSourceURL() {
            return this.fileName;
        }
    }, {
        key: 'toString',
        value: function toString() {
            var str = '    at ';
            if (this.functionName) {
                str += this.functionName;
            } else if (this.typeName) {
                str += this.typeName + '.' + (this.methodName || '<anonymous>');
            }

            if (this.native) {
                str += ' [native]';
            } else {
                var fullPath = this.realFileName + ':' + this.lineNumber + ':' + this.columnNumber;
                if (this.functionName || this.typeName) {
                    str += ' (' + fullPath + ')';
                } else {
                    str += fullPath;
                }

                if (this.compiledFileName && this.compiledFileName !== this.realFileName) {
                    var compiledPath = this.compiledFileName + ':' + this.compiledLineNumber + ':' + this.compiledColumnNumber;
                    str += ' (compiled= ' + compiledPath + ')';
                }
            }
            return str;
        }
    }]);

    return StackTraceItem;
}();

export default StackTraceItem;
//# sourceMappingURL=StackTraceItem.js.map
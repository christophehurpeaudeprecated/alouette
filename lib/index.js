'use strict';

var _createClass = require('babel-runtime/helpers/create-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _Object$freeze = require('babel-runtime/core-js/object/freeze').default;

var _Map = require('babel-runtime/core-js/map').default;

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.setPathMapping = setPathMapping;
exports.parse = parse;
exports.parseErrorStack = parseErrorStack;
exports.log = log;
const stackTrace = require('stack-trace');
const fs = require('fs');
const path = require('path');
const sourceMap = require('source-map');

let sourceMapping;

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
            return this.name + ': ' + this.message + '\n' + this.stack.toString();
        }
    }]);

    return ParsedError;
})();

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
            return this.items.forEach.apply(this.items, arguments);
        }
    }, {
        key: 'toString',
        /** @memberof StackTrace 
        * @instance 
        * @method toString */value: function toString() {
            let str = '';
            this.render( /** @function 
                         * @param string */function (string) {
                str += string + '\n';
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
                line.render(log);
            });
        }
    }]);

    return StackTrace;
})();

/** @class StackTraceItem 
* @param item */
let StackTraceItem = (function () {
    function StackTraceItem(item) {
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

    /**
     * Set path mapping, for instance when you have a vm or docker
     *
     * @param {String} currentPath
     * @param {String} sourcePath
     */

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

/** @function 
* @param currentPath 
* @param sourcePath */
function setPathMapping(currentPath, sourcePath) {
    sourceMapping = _Object$freeze({ current: currentPath, source: sourcePath });
}

/**
 * Parse an error and extract its stack trace
 *
 * @param  {Error} err
 * @return {ParsedError}
 */
/** @function 
* @param err */
function parse(err) {
    let parsedError = new ParsedError(err);
    parsedError.stack = exports.parseErrorStack(err);
    return parsedError;
}

/**
 * Parse an error and extract its stack trace
 *
 * @param  {Error} err
 * @return {StackTrace}
 */
/** @function 
* @param err */
function parseErrorStack(err) {
    let finalStack = new StackTrace();
    let stack = stackTrace.parse(err);

    const libFiles = new _Map();
    const sourceFiles = new _Map();

    stack.forEach(function (line) {
        const fileName = line.fileName;
        let file;

        if (fileName && fileName.startsWith('/')) {
            if (libFiles.has(fileName)) {
                file = libFiles.get(fileName);
            } else {
                try {
                    file = {};
                    const dirname = path.dirname(fileName);
                    let fileNameMap = fileName + '.map';
                    const fileContent = fs.readFileSync(fileName).toString();
                    const match = /\/\/[#@]\s*sourceMappingURL=(.*)\s*$/m.exec(fileContent);
                    if (match && match[1] && match[1][0] === '/') {
                        fileNameMap = path.resolve(dirname, match[1]);
                    }

                    const contents = fs.readFileSync(fileNameMap).toString();
                    file.map = new sourceMap.SourceMapConsumer(contents);

                    if (file.map.sourceRoot) {
                        file.sourceRoot = path.resolve(dirname, file.map.sourceRoot);
                    } else {
                        file.sourceRoot = path.dirname(fileName);
                    }

                    libFiles.set(fileName, file);
                } catch (e) {
                    libFiles.set(fileName, file = false);
                }
            }
        }

        if (file && file.map) {
            const original = file.map.originalPositionFor({ line: line.lineNumber, column: line.columnNumber });
            let originalFile;

            if (original.source) {
                const originalFilePath = path.resolve(file.sourceRoot, original.source);

                if (sourceFiles.has(originalFilePath)) {
                    originalFile = sourceFiles.get(originalFilePath);
                } else {
                    originalFile = { fileName: original.source, filePath: originalFilePath };
                    sourceFiles.set(originalFilePath, originalFile);

                    if (file.map.sourcesContent) {
                        const sourceIndex = file.map.sources.indexOf(original.source);
                        originalFile.contents = sourceIndex !== -1 && file.map.sourcesContent[sourceIndex];
                    }

                    if (!file.contents) {
                        Object.defineProperty(originalFile, 'contents', {
                            configurable: true,
                            get: /** @function */function get() {
                                let contents;
                                try {
                                    contents = fs.readFileSync(originalFilePath).toString();
                                } catch (err) {
                                    err; // noting to do, to remove !
                                }

                                Object.defineProperty(originalFile, 'contents', { value: contents });
                                return contents;
                            }
                        });
                    }
                }

                line.compiledFileName = line.fileName;
                line.compiledLineNumber = line.lineNumber;
                line.compiledColumnNumber = line.columnNumber;

                line.fileName = originalFile.filePath;
                line.lineNumber = original.line;
                line.columnNumber = original.column;
                if (original.name) {
                    line.methodName = original.name;
                }
            }

            line.file = file;
        }

        finalStack.items.push(new StackTraceItem(line));
    });

    return finalStack;
}

/**
 * Parse then log an error with logger.error
 *
 * @param  {Error} err
 */
/** @function 
* @param err */
function log(err) {
    /* global logger */
    if (typeof err !== 'object') {
        (global.logger && logger.error || console.error)(err.message || err);
    } else {
        let parsedError = exports.parse(err);
        (global.logger && logger.error || console.error)(parsedError.toString());
    }
}
//# sourceMappingURL=index.js.map
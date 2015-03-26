"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * Set path mapping, for instance when you have a vm or docker
 *
 * @param {String} currentPath
 * @param {String} sourcePath
 */
exports.setPathMapping = setPathMapping;

/**
 * Parse an error and extract its stack trace
 * @param  {Error} err
 * @return {ParsedError}
 */
exports.parse = parse;

/**
 * Parse an error and extract its stack trace
 * @param  {Error} err
 * @return {StackTrace}
 */
exports.parseErrorStack = parseErrorStack;

/**
 * Parse then log an error with logger.error
 * @param  {Error} err
 */
exports.log = log;
Object.defineProperty(exports, "__esModule", {
    value: true
});
var stackTrace = require("stack-trace");
var fs = require("fs");
var path = require("path");
var sourceMap = require("source-map");

var sourceMapping;

var ParsedError = (function () {
    function ParsedError(err) {
        _classCallCheck(this, ParsedError);

        this.name = err.name;
        this.message = err.message;
        this.originalStack = err.stack;
    }

    _createClass(ParsedError, {
        toString: {
            value: function toString() {
                return this.name + ": " + this.message + "\n" + this.stack.toString();
            }
        }
    });

    return ParsedError;
})();

var StackTrace = (function () {
    function StackTrace() {
        _classCallCheck(this, StackTrace);

        this.items = [];
    }

    _createClass(StackTrace, {
        forEach: {
            value: function forEach() {
                return this.items.forEach.apply(this.items, arguments);
            }
        },
        toString: {
            value: function toString() {
                var str = "";
                this.render(function (string) {
                    str += string + "\n";
                });
                return str;
            }
        },
        render: {
            value: function render(log) {
                this.forEach(function (line) {
                    line.render(log);
                });
            }
        }
    });

    return StackTrace;
})();

var StackTraceItem = (function () {
    function StackTraceItem(item) {
        _classCallCheck(this, StackTraceItem);

        this.fileName = item.fileName;
        this.lineNumber = item.lineNumber;
        this.columnNumber = item.columnNumber;
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

    _createClass(StackTraceItem, {
        getFileName: {
            value: function getFileName() {
                return this.fileName;
            }
        },
        getLineNumber: {
            value: function getLineNumber() {
                return this.line;
            }
        },
        getColumnNumber: {
            value: function getColumnNumber() {
                return this.column + 1;
            }
        },
        getScriptNameOrSourceURL: {
            value: function getScriptNameOrSourceURL() {
                return this.fileName;
            }
        },
        render: {
            value: function render(log) {
                var fullPath = this.realFileName + ":" + this.lineNumber + ":" + this.columnNumber;
                var compiledPath = this.compiledFileName && this.compiledFileName !== this.realFileName ? this.compiledFileName + ":" + this.compiledLineNumber + ":" + this.compiledColumnNumber : null;
                log("    at " + (this.methodName || this.typeName ? (this.typeName && this.typeName + ".") + (this.methodName || "<anonymous>") + " (" + fullPath + ")" : fullPath) + (compiledPath ? " (compiled= " + compiledPath + ")" : ""));
                //line.native
            }
        }
    });

    return StackTraceItem;
})();

function setPathMapping(currentPath, sourcePath) {
    sourceMapping = Object.freeze({ current: currentPath, source: sourcePath });
}

function parse(err) {
    var parsedError = new ParsedError(err);
    parsedError.stack = exports.parseErrorStack(err);
    return parsedError;
}

function parseErrorStack(err) {
    var finalStack = new StackTrace();
    var stack = stackTrace.parse(err);

    var files = new Map();
    stack.forEach(function (line) {
        if (!line.fileName || files.has(line.fileName)) {
            return;
        }
        files.set(line.fileName, {});
    });

    files.forEach(function (file, fileName) {
        if (fileName.startsWith("/")) {
            try {
                var fileNameMap = fileName + ".map";
                var fileContent = fs.readFileSync(fileName).toString();
                var match = /\/\/[#@]\s*sourceMappingURL=(.*)\s*$/m.exec(fileContent);
                if (match && match[1] && match[1][0] === "/") {
                    fileNameMap = match[1];
                }
                var contents = fs.readFileSync(fileNameMap).toString();
                file.map = new sourceMap.SourceMapConsumer(contents);
                var sourceRoot = !file.map.sourceRoot ? "" : path.resolve(path.dirname(fileName), file.map.sourceRoot);
                file.sourceFileName = sourceRoot + file.map.file;
                if (file.map.sourcesContent) {
                    var sourceIndex = file.map.sources.indexOf(file.map.file);
                    file.contents = sourceIndex !== -1 && file.map.sourcesContent[sourceIndex];
                }
                if (!file.contents) {
                    if (sourceRoot.slice(-1) !== "/") {
                        sourceRoot += "/";
                    }
                    file.contents = fs.readFileSync(file.sourceFileName).toString();
                }
                // TODO lazy loading
                //, path.resolve(file.map.sourceRoot, original.source)
            } catch (e) {}
        }
    });

    stack.forEach(function (line) {
        var file = files.get(line.fileName);
        if (file && file.map) {
            var original = file.map.originalPositionFor({ line: line.lineNumber, column: line.columnNumber });
            if (original.source) {
                //, path.resolve(file.map.sourceRoot, original.source)
                line.compiledFileName = line.fileName;
                line.compiledLineNumber = line.lineNumber;
                line.compiledColumnNumber = line.columnNumber;

                line.fileName = file.sourceFileName;
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

function log(err) {
    /* global logger */
    if (typeof err !== "object") {
        (global.logger && logger.error || console.error)(err.message || err);
    } else {
        var parsedError = exports.parse(err);
        (global.logger && logger.error || console.error)(parsedError.toString());
    }
}

// console.log(e.stack);
//# sourceMappingURL=index.js.map
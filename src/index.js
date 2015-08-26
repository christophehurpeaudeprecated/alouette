var stackTrace = require('stack-trace');
var fs = require('fs');
var path = require('path');
var sourceMap = require('source-map');

var sourceMapping;

class ParsedError {
    constructor(err) {
        this.name = err.name;
        this.message = err.message;
        this.originalStack = err.stack;
    }

    toString() {
        return this.name + ': ' + this.message + '\n' + this.stack.toString();
    }
}

class StackTrace {
    constructor() {
        this.items = [];
    }

    forEach() {
        return this.items.forEach.apply(this.items, arguments);
    }

    toString() {
        var str = '';
        this.render(function(string) {
            str += string + '\n';
        });
        return str;
    }

    render(log) {
        this.forEach((line) => {
            line.render(log);
        });
    }
}

class StackTraceItem {
    constructor(item) {
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
            this.realFileName = sourceMapping.source
                                    + item.fileName.substr(sourceMapping.current.length);
            if (this.compiledFileName) {
                this.realCompiledFileName = sourceMapping.source
                                    + item.fileName.substr(sourceMapping.current.length);
            }
        } else {
            this.realFileName = item.fileName;
            this.realCompiledFileName = item.compiledFileName;
        }
    }

    getFileName() {
        return this.fileName;
    }

    getLineNumber() {
        return this.line;
    }

    getColumnNumber() {
        return this.column + 1;
    }

    getScriptNameOrSourceURL() {
        return this.fileName;
    }

    render(log) {
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
                const compiledPath = this.compiledFileName + ':' +
                                     this.compiledLineNumber + ':' +
                                     this.compiledColumnNumber;
                str += ' (compiled= ' + compiledPath + ')';
            }
        }

        log(str);
    }
}

/**
 * Set path mapping, for instance when you have a vm or docker
 *
 * @param {String} currentPath
 * @param {String} sourcePath
 */
export function setPathMapping(currentPath, sourcePath) {
    sourceMapping = Object.freeze({ current: currentPath, source: sourcePath });
}

/**
 * Parse an error and extract its stack trace
 *
 * @param  {Error} err
 * @return {ParsedError}
 */
export function parse(err) {
    var parsedError = new ParsedError(err);
    parsedError.stack = exports.parseErrorStack(err);
    return parsedError;
}

/**
 * Parse an error and extract its stack trace
 *
 * @param  {Error} err
 * @return {StackTrace}
 */
export function parseErrorStack(err) {
    var finalStack = new StackTrace();
    var stack = stackTrace.parse(err);

    const libFiles = new Map();
    const sourceFiles = new Map();

    stack.forEach((line) => {
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
                            get: function get() {
                                let contents;
                                try {
                                    contents = fs.readFileSync(originalFilePath).toString();
                                } catch (err) {}

                                Object.defineProperty(originalFile, 'contents', { value: contents });
                                return contents;
                            },
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
export function log(err) {
    /* global logger */
    if (typeof err !== 'object') {
        (global.logger && logger.error || console.error)(err.message || err);
    } else {
        var parsedError = exports.parse(err);
        (global.logger && logger.error || console.error)(parsedError.toString());
    }
}

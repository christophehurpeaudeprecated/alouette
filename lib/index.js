'use strict';

var _Object$freeze = require('babel-runtime/core-js/object/freeze').default;

var _Map = require('babel-runtime/core-js/map').default;

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.setPathMapping = setPathMapping;
exports.parse = parse;
exports.parseErrorStack = parseErrorStack;
exports.log = log;

var _ParsedError = require('./ParsedError');

var _ParsedError2 = _interopRequireDefault(_ParsedError);

var _StackTrace = require('./StackTrace');

var _StackTrace2 = _interopRequireDefault(_StackTrace);

var _StackTraceItem = require('./StackTraceItem');

var _StackTraceItem2 = _interopRequireDefault(_StackTraceItem);

const stackTrace = require('stack-trace');
const fs = require('fs');
const path = require('path');
const sourceMap = require('source-map');

let sourceMapping;

/**
 * Set path mapping, for instance when you have a vm or docker
 *
 * @param {String} currentPath
 * @param {String} sourcePath
 */
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
    let parsedError = new _ParsedError2.default(err);
    parsedError.stack = exports.parseErrorStack(err);

    if (err.previous) {
        parsedError.previous = parse(err.previous);
    }

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
    let finalStack = new _StackTrace2.default();
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
                file = {};
                const dirname = path.dirname(fileName);
                try {
                    const fileContent = fs.readFileSync(fileName).toString();
                    file.fileName = fileName;
                    file.contents = fileContent;
                    libFiles.set(fileName, file);

                    try {
                        let fileNameMap = fileName + '.map';
                        const match = /\/\/[#@]\s*sourceMappingURL=(.*)\s*$/m.exec(fileContent);
                        if (match && match[1] && match[1][0] === '/') {
                            fileNameMap = path.resolve(dirname, match[1]);
                        }

                        const contents = fs.readFileSync(fileNameMap).toString();
                        file.fileNameMap = fileNameMap;
                        file.map = new sourceMap.SourceMapConsumer(contents);

                        if (file.map.sourceRoot) {
                            file.sourceRoot = path.resolve(dirname, file.map.sourceRoot);
                        } else {
                            file.sourceRoot = path.dirname(fileName);
                        }
                    } catch (e) {}
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

                    if (!originalFile.contents) {
                        Object.defineProperty(originalFile, 'contents', {
                            configurable: true,
                            get: /** @function */function get() {
                                let contents;
                                try {
                                    contents = fs.readFileSync(originalFilePath).toString();
                                } catch (err) {}

                                Object.defineProperty(originalFile, 'contents', { value: contents });
                                return contents;
                            }
                        });
                    }
                }

                line.compiledFileName = line.fileName;
                line.compiledLineNumber = line.lineNumber;
                line.compiledColumnNumber = line.columnNumber;

                line.file = originalFile;
                line.fileName = originalFile.filePath;
                line.lineNumber = original.line;
                line.columnNumber = original.column;
                if (original.name) {
                    line.methodName = original.name;
                }
            }
        }

        if (!line.file && file && file.contents) {
            line.file = {
                fileName: file.fileName,
                filePath: file.fileName,
                contents: file.contents
            };
        }

        finalStack.items.push(new _StackTraceItem2.default(line, sourceMapping));
    });

    return finalStack;
}

/**
 * Parse then log an error with logger.error
 *
 * @param {Error} err
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
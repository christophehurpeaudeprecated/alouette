'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setPathMapping = setPathMapping;
exports.parseErrorStack = parseErrorStack;
exports.parse = parse;

var _ParsedError = require('./ParsedError');

var _ParsedError2 = _interopRequireDefault(_ParsedError);

var _StackTrace = require('./StackTrace');

var _StackTrace2 = _interopRequireDefault(_StackTrace);

var _StackTraceItem = require('./StackTraceItem');

var _StackTraceItem2 = _interopRequireDefault(_StackTraceItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global BROWSER, NODEJS */
var path = require('path');
var stackTrace = require('stack-trace');
var sourceMap = require('source-map');

var sourceMapping = void 0;

/**
 * Set path mapping, for instance when you have a vm or docker
 *
 * @param {String} currentPath
 * @param {String} sourcePath
 */
function setPathMapping(currentPath, sourcePath) {
  sourceMapping = Object.freeze({ current: currentPath, source: sourcePath });
}

/**
 * Parse an error and extract its stack trace
 *
 * @param  {Error} err
 * @return {StackTrace}
 */
function parseErrorStack(err) {
  var finalStack = new _StackTrace2.default();
  var stack = stackTrace.parse(err);

  var libFiles = new Map();
  var sourceFiles = new Map();

  stack.forEach(function (line) {
    var fileName = line.fileName;
    var file = void 0;

    if (fileName && fileName.startsWith('/')) {
      if (libFiles.has(fileName)) {
        file = libFiles.get(fileName);
      } else {
        libFiles.set(fileName, file = false);
      }
    }

    if (file && file.map) {
      var original = file.map.originalPositionFor({
        line: line.lineNumber,
        column: line.columnNumber
      });
      var originalFile = void 0;

      if (original.source) {
        var originalFilePath = path.resolve(file.sourceRoot, original.source);

        if (sourceFiles.has(originalFilePath)) {
          originalFile = sourceFiles.get(originalFilePath);
        } else {
          originalFile = { fileName: original.source, filePath: originalFilePath };
          sourceFiles.set(originalFilePath, originalFile);

          if (file.map.sourcesContent) {
            var sourceIndex = file.map.sources.indexOf(original.source);
            originalFile.contents = sourceIndex !== -1 && file.map.sourcesContent[sourceIndex];
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
 * Parse an error and extract its stack trace
 *
 * @param  {Error} err
 * @return {ParsedError}
 */
function parse(err) {
  var parsedError = new _ParsedError2.default(err, parseErrorStack(err));

  if (err.previous) {
    parsedError.previous = parse(err.previous);
  }

  return parsedError;
}
//# sourceMappingURL=index.js.map
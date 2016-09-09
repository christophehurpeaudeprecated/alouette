'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setPathMapping = setPathMapping;
exports.parse = parse;
exports.parseErrorStack = parseErrorStack;

var _fs = require('fs');

var _ParsedError = require('./ParsedError');

var _ParsedError2 = _interopRequireDefault(_ParsedError);

var _StackTrace = require('./StackTrace');

var _StackTrace2 = _interopRequireDefault(_StackTrace);

var _StackTraceItem = require('./StackTraceItem');

var _StackTraceItem2 = _interopRequireDefault(_StackTraceItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global BROWSER, NODEJS */
var path = require('path'); //defines: #if NODEJS = true

var stackTrace = require('stack-trace');
var sourceMap = require('source-map');

var sourceMapping = undefined;

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
 * @return {ParsedError}
 */
function parse(err) {
  var parsedError = new _ParsedError2.default(err, parseErrorStack(err));

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
function parseErrorStack(err) {
  var finalStack = new _StackTrace2.default();
  var stack = stackTrace.parse(err);

  var libFiles = new Map();
  var sourceFiles = new Map();

  stack.forEach(function (line) {
    var fileName = line.fileName;
    var file = undefined;

    if (fileName && fileName.startsWith('/')) {
      if (libFiles.has(fileName)) {
        file = libFiles.get(fileName);
      } else {
          file = {};
          var dirname = path.dirname(fileName);
          try {
            var fileContent = (0, _fs.readFileSync)(fileName).toString();
            file.fileName = fileName;
            file.contents = fileContent;
            libFiles.set(fileName, file);

            try {
              var fileNameMap = fileName + '.map';
              var match = /\/\/[#@]\s*sourceMappingURL=(.*)\s*$/m.exec(fileContent);
              if (match && match[1] && match[1][0] === '/') {
                fileNameMap = path.resolve(dirname, match[1]);
              }

              var contents = (0, _fs.readFileSync)(fileNameMap).toString();
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
      (function () {
        var original = file.map.originalPositionFor({
          line: line.lineNumber,
          column: line.columnNumber
        });
        var originalFile = undefined;

        if (original.source) {
          (function () {
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

              {
                if (!originalFile.contents) {
                  Object.defineProperty(originalFile, 'contents', {
                    configurable: true,
                    get: function get() {
                      var contents = undefined;
                      try {
                        contents = (0, _fs.readFileSync)(originalFilePath).toString();
                      } catch (err) {}

                      Object.defineProperty(originalFile, 'contents', { value: contents });
                      return contents;
                    }
                  });
                }
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
          })();
        }
      })();
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
//# sourceMappingURL=index.js.map
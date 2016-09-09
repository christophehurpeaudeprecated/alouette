/* global BROWSER, NODEJS */
; //defines: #if NODEJS = false

import ParsedError from './ParsedError';
import StackTrace from './StackTrace';
import StackTraceItem from './StackTraceItem';

var path = require('path');
var stackTrace = require('stack-trace');
var sourceMap = require('source-map');

var sourceMapping = undefined;

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
  var parsedError = new ParsedError(err, parseErrorStack(err));

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
export function parseErrorStack(err) {
  var finalStack = new StackTrace();
  var stack = stackTrace.parse(err);

  var libFiles = new Map();
  var sourceFiles = new Map();

  stack.forEach(line => {
    var fileName = line.fileName;
    var file = undefined;

    if (fileName && fileName.startsWith('/')) {
      if (libFiles.has(fileName)) {
        file = libFiles.get(fileName);
      } else {
          libFiles.set(fileName, file = false);
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

    finalStack.items.push(new StackTraceItem(line, sourceMapping));
  });

  return finalStack;
}
//# sourceMappingURL=index.js.map
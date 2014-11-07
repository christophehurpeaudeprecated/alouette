"use strict";
require('es6-shim/es6-shim');
var stackTrace = require('stack-trace');
var fs = require('fs');
var path = require('path');
var sourceMap = require("source-map");

var sourceMapping;

var ParsedError = function() {
  var ParsedError = function ParsedError(err) {
      this.name = err.name;
      this.message = err.message;
      this.originalStack = err.stack;
  };

  Object.defineProperties(ParsedError.prototype, {
    toString: {
      writable: true,

      value: function() {
          return this.name + ': ' + this.message + "\n" + this.stack.toString();
      }
    }
  });

  return ParsedError;
}();

var StackTrace = function() {
  var StackTrace = function StackTrace() {
      this.items = [];
  };

  Object.defineProperties(StackTrace.prototype, {
    forEach: {
      writable: true,

      value: function() {
          return this.items.forEach.apply(this.items, arguments);
      }
    },

    toString: {
      writable: true,

      value: function() {
          var str = '';
          this.render(function(string) {
              str += string + "\n";
          });
          return str;
      }
    },

    render: {
      writable: true,

      value: function(log) {
          this.forEach(function(line) {
              line.render(log);
          });
      }
    }
  });

  return StackTrace;
}();

var StackTraceItem = function() {
  var StackTraceItem = function StackTraceItem(item) {
      this.fileName = item.fileName;
      this.lineNumber = item.lineNumber;
      this.columnNumber = item.columnNumber;
      this.typeName = item.typeName;
      this.methodName = item.methodName;
      this.native = item.native;
      this.file = item.file;

      if (sourceMapping && item.fileName && item.fileName.startsWith(sourceMapping.current)) {
          this.realFileName = sourceMapping.source
                                  + item.fileName.substr(sourceMapping.current.length);
      } else {
          this.realFileName = item.fileName;
      }
  };

  Object.defineProperties(StackTraceItem.prototype, {
    getFileName: {
      writable: true,

      value: function() {
          return this.fileName;
      }
    },

    getLineNumber: {
      writable: true,

      value: function() {
          return this.line;
      }
    },

    getColumnNumber: {
      writable: true,

      value: function() {
          return this.column + 1;
      }
    },

    getScriptNameOrSourceURL: {
      writable: true,

      value: function() {
          return this.fileName;
      }
    },

    render: {
      writable: true,

      value: function(log) {
          var fullPath = this.realFileName + ':' + this.lineNumber + ':' + this.columnNumber;
          log(
              '    at '
               + ( this.methodName || this.typeName ? (this.typeName && this.typeName + '.')
               + (this.methodName || '<anonymous>')
               + ' (' + fullPath + ')' : fullPath));
          //line.native
      }
    }
  });

  return StackTraceItem;
}();



/**
 * Set path mapping, for instance when you have a vm or docker
 *
 * @param {String} currentPath
 * @param {String} sourcePath
 */
exports.setPathMapping = function(currentPath, sourcePath) {
    sourceMapping = Object.freeze({ current: currentPath, source: sourcePath });
};

/**
 * Parse an error and extract its stack trace
 * @param  {Error} err
 * @return {ParsedError}
 */
exports.parse = function(err) {
    var parsedError = new ParsedError(err);
    parsedError.stack = exports.parseErrorStack(err);
    return parsedError;
};

/**
 * Parse an error and extract its stack trace
 * @param  {Error} err
 * @return {StackTrace}
 */
exports.parseErrorStack = function(err) {
    var finalStack = new StackTrace();
    var stack = stackTrace.parse(err);

    var files = new Map();
    stack.forEach(function(line) {
        if (!line.fileName || files.has(line.fileName)) {
            return;
        }
        files.set(line.fileName, {});
    });

    files.forEach(function(file, fileName) {
        if (fileName.startsWith('/')) {
            try {
                var fileNameMap = fileName + '.map';
                var fileContent = fs.readFileSync(fileName).toString();
                var match = /\/\/[#@]\s*sourceMappingURL=(.*)\s*$/m.exec(fileContent);
                if (match && match[1] && match[1][0] === '/') {
                    fileNameMap = match[1];
                }
                var contents = fs.readFileSync(fileNameMap).toString();
                file.map = new sourceMap.SourceMapConsumer(contents);
                if (file.map.sourcesContent) {
                    var sourceIndex = file.map.sources.indexOf(file.map.file);
                    file.contents = sourceIndex !== -1 && file.map.sourcesContent[sourceIndex];
                }
                if (!file.contents) {
                    var sourceRoot = path.resolve(path.dirname(fileName), file.map.sourceRoot);
                    if (sourceRoot.slice(-1) !== '/') {
                        sourceRoot += '/';
                    }
                    file.sourceFileName = sourceRoot + file.map.file;
                    file.contents = fs.readFileSync(file.sourceFileName).toString();
                }
                // TODO lazy loading
                //, path.resolve(file.map.sourceRoot, original.source)
            } catch(e) {
                //console.log(e.stack);
            }
        }
    });

    stack.forEach(function(line) {
        var file = files.get(line.fileName);
        if (file && file.map) {
            var original = file.map.originalPositionFor({ line: line.lineNumber, column: line.columnNumber });
            if (original.source) {
                //, path.resolve(file.map.sourceRoot, original.source)
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
};


/**
 * Parse then log an error with logger.error
 * @param  {Error} err
 */
exports.log = function(err) {
    /* global logger */
    if (typeof err !== 'object') {
        (global.logger && logger.error || console.error)(err.message || err);
    } else {
        var parsedError = exports.parse(err);
        (global.logger && logger.error || console.error)(parsedError.toString());
    }
};

//# sourceMappingURL=index.js.map
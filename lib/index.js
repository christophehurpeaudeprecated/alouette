"use strict";
var $__Object$defineProperty = Object.defineProperty;
require('es6-shim/es6-shim');
var stackTrace = require('stack-trace');
var fs = require('fs');
var path = require('path');
var sourceMap = require("source-map");
var ParsedError = function() {
  "use strict";
  function ParsedError(err) {
    this.name = err.name;
    this.message = err.message;
    this.originalStack = err.stack;
  }
  $__Object$defineProperty(ParsedError.prototype, "toString", {
    value: function() {
      return this.name + ': ' + this.message + "\n" + this.stack.toString();
    },
    enumerable: false,
    writable: true
  });
  return ParsedError;
}();
var StackTrace = function() {
  "use strict";
  function StackTrace() {
    this.items = [];
  }
  $__Object$defineProperty(StackTrace.prototype, "forEach", {
    value: function() {
      return this.items.forEach.apply(this.items, arguments);
    },
    enumerable: false,
    writable: true
  });
  $__Object$defineProperty(StackTrace.prototype, "toString", {
    value: function() {
      var str = '';
      this.render(function(string) {
        str += string + "\n";
      });
      return str;
    },
    enumerable: false,
    writable: true
  });
  $__Object$defineProperty(StackTrace.prototype, "render", {
    value: function(log) {
      this.forEach(function(line) {
        var fullPath = line.fileName + ':' + line.lineNumber + ':' + line.columnNumber;
        log('    at ' + (line.methodName || line.typeName ? (line.typeName && line.typeName + '.') + (line.methodName || '<anonymous>') + ' (' + fullPath + ')' : fullPath));
      });
    },
    enumerable: false,
    writable: true
  });
  return StackTrace;
}();
var StackTraceItem = function() {
  "use strict";
  function StackTraceItem(item) {
    this.fileName = item.fileName;
    this.lineNumber = item.lineNumber;
    this.columnNumber = item.columnNumber;
    this.typeName = item.typeName;
    this.methodName = item.methodName;
    this.native = item.native;
    this.file = item.file;
  }
  $__Object$defineProperty(StackTraceItem.prototype, "getFileName", {
    value: function() {
      return this.fileName;
    },
    enumerable: false,
    writable: true
  });
  $__Object$defineProperty(StackTraceItem.prototype, "getLineNumber", {
    value: function() {
      return this.line;
    },
    enumerable: false,
    writable: true
  });
  $__Object$defineProperty(StackTraceItem.prototype, "getColumnNumber", {
    value: function() {
      return this.column + 1;
    },
    enumerable: false,
    writable: true
  });
  $__Object$defineProperty(StackTraceItem.prototype, "getScriptNameOrSourceURL", {
    value: function() {
      return this.fileName;
    },
    enumerable: false,
    writable: true
  });
  return StackTraceItem;
}();
exports.parse = function(err) {
  var parsedError = new ParsedError(err);
  parsedError.stack = exports.parseErrorStack(err);
  return parsedError;
};
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
      } catch (e) {}
    }
  });
  stack.forEach(function(line) {
    var file = files.get(line.fileName);
    if (file && file.map) {
      var original = file.map.originalPositionFor({
        line: line.lineNumber,
        column: line.columnNumber
      });
      if (original.source) {
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
exports.log = function(err) {
  var parsedError = exports.parse(err);
  logger.error(parsedError.toString());
};

//# sourceMappingURL=index.js.map
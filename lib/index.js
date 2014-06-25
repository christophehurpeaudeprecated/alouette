"use strict";
var $__Object$defineProperty = Object.defineProperty;
require('es6-shim/es6-shim');
var stackTrace = require('stack-trace');
var fs = require('fs');
var path = require('path');
var sourceMap = require("source-map");
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
  var stack = stackTrace.parse(err);
  var finalStack = new StackTrace();
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
        var fileContent = fs.readFileSync(fileName);
        var match = /\/\/[#@]\s*sourceMappingURL=(.*)\s*$/m.exec(fileContent);
        if (match && match[1] && match[1][0] === '/') {
          fileNameMap = match[1];
        }
        var contents = fs.readFileSync(fileNameMap).toString();
        file.map = new sourceMap.SourceMapConsumer(contents);
        if (file.map.sourcesContent) {
          var sourceIndex = file.map.sources.indexOf(fileName);
          file.contents = sourceIndex !== -1 && file.map.sourcesContent[sourceIndex];
        }
        file.contents = file.contents || fs.readFileSync(path.resolve(file.map.sourceRoot, file.map.file)).toString();
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
        line.fileName = original.source;
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

//# sourceMappingURL=index.js.map
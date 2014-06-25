require('es6-shim/es6-shim');
var stackTrace = require('stack-trace');
var fs = require('fs');
var path = require('path');
var sourceMap = require("source-map");

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
            str += string + "\n";
        });
        return str;
    }

    render(log) {
        this.forEach((line) => {
            var fullPath = line.fileName + ':' + line.lineNumber + ':' + line.columnNumber;
            log(
                '    at '
                 + ( line.methodName || line.typeName ? (line.typeName && line.typeName + '.')
                 + (line.methodName || '<anonymous>')
                 + ' (' + fullPath + ')' : fullPath));
            //line.native
        });
    }
}


class StackTraceItem {
    constructor(item) {
        this.fileName = item.fileName;
        this.lineNumber = item.lineNumber;
        this.columnNumber = item.columnNumber;
        this.typeName = item.typeName;
        this.methodName = item.methodName;
        this.native = item.native;
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
}

/**
 * Parse an error and extract its stack trace
 * @param  {Error} err
 * @return {StackTrace}
 */
exports.parse = function(err) {
    var stack = stackTrace.parse(err);
    var finalStack = new StackTrace();

    var files = new Map();
    stack.forEach((line) => {
        if (!line.fileName || files.has(line.fileName)) {
            return;
        }
        files.set(line.fileName, {});
    });

    files.forEach((file, fileName) => {
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
                // TODO lazy loading
                //, path.resolve(file.map.sourceRoot, original.source)
                file.contents = file.contents || fs.readFileSync(path.resolve(file.map.sourceRoot, file.map.file))
                                                                                                        .toString();
            } catch(e) {
                //console.log(e.stack);
            }
        }
    });

    stack.forEach((line) => {
        var file = files.get(line.fileName);
        if (file && file.map) {
            var original = file.map.originalPositionFor({ line: line.lineNumber, column: line.columnNumber });
            if (original.source) {
                //, path.resolve(file.map.sourceRoot, original.source)
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

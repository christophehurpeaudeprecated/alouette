'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
let StackTraceItem = class StackTraceItem {
    /**
     * @param item
     * @param sourceMapping
    */
    constructor(item, sourceMapping) {
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
            this.realFileName = sourceMapping.source + item.fileName.substr(sourceMapping.current.length);
            if (this.compiledFileName) {
                this.realCompiledFileName = sourceMapping.source + item.fileName.substr(sourceMapping.current.length);
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

    toString() {
        let str = '    at ';
        if (this.functionName) {
            str += this.functionName;
        } else if (this.typeName) {
            str += `${ this.typeName }.${ this.methodName || '<anonymous>' }`;
        }

        if (this.native) {
            str += ' [native]';
        } else {
            const fullPath = `${ this.realFileName }:${ this.lineNumber }:${ this.columnNumber }`;
            if (this.functionName || this.typeName) {
                str += ` (${ fullPath })`;
            } else {
                str += fullPath;
            }

            if (this.compiledFileName && this.compiledFileName !== this.realFileName) {
                const compiledPath = `${ this.compiledFileName }:${ this.compiledLineNumber }:${ this.compiledColumnNumber }`;
                str += ` (compiled= ${ compiledPath })`;
            }
        }
        return str;
    }
};
exports.default = StackTraceItem;
//# sourceMappingURL=StackTraceItem.js.map
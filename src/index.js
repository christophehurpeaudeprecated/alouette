const stackTrace = require('stack-trace');
const fs = require('fs');
const path = require('path');
const sourceMap = require('source-map');
import ParsedError from './ParsedError';
import StackTrace from './StackTrace';
import StackTraceItem from './StackTraceItem';

let sourceMapping;

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
    let parsedError = new ParsedError(err, exports.parseErrorStack(err));

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
    let finalStack = new StackTrace();
    let stack = stackTrace.parse(err);

    const libFiles = new Map();
    const sourceFiles = new Map();

    stack.forEach((line) => {
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
                        let fileNameMap = `${fileName}.map`;
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
                    } catch (e) {
                    }
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
                            get: function get() {
                                let contents;
                                try {
                                    contents = fs.readFileSync(originalFilePath).toString();
                                } catch (err) {
                                }

                                Object.defineProperty(originalFile, 'contents', { value: contents });
                                return contents;
                            },
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
                contents: file.contents,
            };
        }

        finalStack.items.push(new StackTraceItem(line, sourceMapping));
    });

    return finalStack;
}

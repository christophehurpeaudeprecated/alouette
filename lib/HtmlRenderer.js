// jscs:disable maximumLineLength

'use strict';

var _createClass = require('babel-runtime/helpers/create-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _escapeHtml = require('escape-html');

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

var _eshighlightHarmony = require('eshighlight-harmony');

var _eshighlightHarmony2 = _interopRequireDefault(_eshighlightHarmony);

var _index = require('./index');

/** @class HtmlRenderer 
* @param options */
let HtmlRenderer = (function () {
    function HtmlRenderer(options) {
        _classCallCheck(this, HtmlRenderer);

        this.options = options || {};
    }

    _createClass(HtmlRenderer, [{
        key: 'openLocalFile',
        /** @memberof HtmlRenderer 
        * @instance 
        * @method openLocalFile 
        * @param filePath 
        * @param lineNumber 
        * @param columnNumber 
        * @param realFilePath */value: function openLocalFile(filePath, lineNumber, columnNumber, realFilePath) {
            if (this.openLocalFile.generatedPath && this.openLocalFile.sourcePath && filePath.startsWith(this.openLocalFile.generatedPath)) {
                filePath = this.openLocalFile.sourcePath + filePath.substr(this.openLocalFile.generatedPath.length);
            }

            return '<a href="openlocalfile://' + (0, _escapeHtml2.default)(realFilePath || filePath) + (lineNumber && '?' + lineNumber + (columnNumber && ':' + columnNumber)) + '">';
        }
    }, {
        key: 'replaceAppInFilePath',
        /** @memberof HtmlRenderer 
        * @instance 
        * @method replaceAppInFilePath 
        * @param filePath */value: function replaceAppInFilePath(filePath) {
            if (this.openLocalFile.generatedPath) {
                filePath = 'APP/' + filePath.substr(this.openLocalFile.generatedPath.length);
            }

            return filePath;
        }
    }, {
        key: 'render',
        /** @memberof HtmlRenderer 
        * @instance 
        * @method render 
        * @param error */value: function render(error) {
            let str = '<div style="text-align: left">';
            str += '<h4>' + error.name + '</h4>' + '\n';
            if (error.message) {
                str += '<pre style="background:#FFF;color:#222;border:0;font-size:1em;white-space:pre-wrap;word-wrap:break-word">';
                str += (0, _escapeHtml2.default)(error.message);
                str += '</pre>';
            }

            str += '<h5 style="background:#FFDDAA;color:#333;border:1px solid #E07308;padding:1px 2px;">Call Stack:</h5>' + '\n';

            if (!this.options.production) {
                str += '<pre style="background:#FFF;color:#222;border:0">' + this.renderStack(error) + '</pre>';
            }

            return str;
        }
    }, {
        key: 'renderStack',
        /** @memberof HtmlRenderer 
        * @instance 
        * @method renderStack 
        * @param error */value: function renderStack(error) {
            var _this = this;

            let stackTrace = (0, _index.parseErrorStack)(error);

            let str = '<style>.string{ color: #EC7600; }\n.keyword, .null{ font-weight: bold; color: #93C763; }\n.numeric{ color: #FACD22; }\n.line-comment{ color: #66747B; }\n.identifier{ }\n.control-flow{ color: #93C763; }\n.azerty1{ color: #66747B; }\n.azerty2{ color: #678CB1; }\n.azerty5{ color: #F1F2F3; }\n.azerty6{ color: #8AC763; }\n.azerty7{ color: #E0E2E4; }\n.azerty9{ color: purple; }\n</style>';
            stackTrace.forEach(function (item, i) {
                if (item.file && item.file.contents) {
                    str += '<span><a href="javascript:;" style="color:#CC7A00;text-decoration:none;outline:none;" ' + 'onclick="var el=this.parentNode.nextElementSibling; el.style.display=el.style.display==\'none\'?\'block\':\'none\';">';
                }

                str += '#' + i + ' ';
                if (item.fileName && item.fileName.startsWith('/')) {
                    str += _this.openLocalFile(item.fileName, item.lineNumber, item.columnNumber, item.realFileName);
                }

                if (!item.native) {
                    str += _this.replaceAppInFilePath(item.realFileName || item.fileName) + ':' + item.lineNumber + ':' + item.columnNumber;
                }

                if (item.fileName) {
                    str += '</a> ';
                }

                if (item.functionName) {
                    str += item.functionName;
                } else if (item.typeName) {
                    str += item.typeName + '.' + (item.methodName || '<anonymous>');
                }

                if (item.native) {
                    str += ' [native]';
                }

                if (item.file && item.file.contents) {
                    str += '</a></span>';
                    str += '<div style="margin-top:5px;display:none">';
                    if (item.compiledFileName) {
                        str += '<div>';
                        if (item.realCompiledFileName && item.realCompiledFileName.startsWith('/')) {
                            str += _this.openLocalFile(item.compiledFileName, item.compiledLineNumber, item.compiledColumnNumber, item.realCompiledFileName);
                        }

                        str += _this.replaceAppInFilePath(item.realCompiledFileName) + ':' + item.compiledLineNumber + ':' + item.compiledColumnNumber;
                        str += '</a></div>';
                    }

                    str += '<b>File content :</b><br />';
                    str += _this.highlightLine(item.file.contents, item.lineNumber, item.columnNumber);
                    str += '</div>';
                }

                str += '\n';
            });

            return str;
        }
    }, {
        key: 'highlightLine',
        /** @memberof HtmlRenderer 
        * @instance 
        * @method highlightLine 
        * @param contents 
        * @param lineNumber */value: function highlightLine(contents, lineNumber /* , columnNumber */) {
            let style = 'background:#3F1F1F;';
            let withLineNumbers = true;
            let minmax = 4;

            let hcontents;
            try {
                hcontents = (0, _eshighlightHarmony2.default)(contents);
            } catch (err) {
                hcontents = (0, _escapeHtml2.default)(contents);
            }

            hcontents = hcontents.split(/\r\n|\n\r|\n|\r/);

            let ok = lineNumber <= hcontents.length;
            let firstLine;
            let start;
            let lineContent;
            let end;

            if (ok) {
                firstLine = Math.max(0, minmax ? lineNumber - 1 - minmax : 0);
                start = hcontents.slice(firstLine, lineNumber - 1);
                lineContent = lineNumber === 0 ? '' : hcontents[lineNumber - 1];
                end = hcontents.slice(lineNumber, lineNumber + minmax);
            } else {
                start = hcontents;
            }

            /* if (withLineNumbers) {
                // $withLineNumbers = '%'.strlen((string)($ok ? $line+$minmax : $minmax+1)).'d';
            } */

            let content = this.lines(withLineNumbers, ok ? firstLine + 1 : 1, start);
            if (ok) {
                let attributes = { style: style };
                content += this.line(withLineNumbers, lineNumber, attributes, lineContent);
                content += this.lines(withLineNumbers, lineNumber + 1, end);
            }

            let preAttrs = { style: 'background:#0F0F0F;color:#E0E2E4;border:0;padding:0;position:relative;' };
            return this.tag('pre', preAttrs, content, false);
        }
    }, {
        key: 'lines',
        /** @memberof HtmlRenderer 
        * @instance 
        * @method lines 
        * @param withLineNumbers 
        * @param startNumber 
        * @param _lines */value: function lines(withLineNumbers, startNumber, _lines) {
            var _this2 = this;

            let content = '';
            _lines.forEach(function (line) {
                content += _this2.line(withLineNumbers, startNumber++, {}, line);
            });
            return content;
        }
    }, {
        key: 'line',
        /** @memberof HtmlRenderer 
        * @instance 
        * @method line 
        * @param withLineNumbers 
        * @param lineNumber 
        * @param attributes 
        * @param contentLine */value: function line(withLineNumbers, lineNumber, attributes, contentLine) {
            attributes.style = (attributes.style || '') + 'white-space:pre-wrap;' + (withLineNumbers ? 'padding-left:20px;' : '');

            if (withLineNumbers) {
                contentLine = '<i style="color:#AAA;font-size:7pt;position:absolute;left:1px;padding-top:1px;">' + lineNumber + '</i>' + contentLine;
            }

            return this.tag('div', attributes, contentLine);
        }
    }, {
        key: 'tag',
        /** @memberof HtmlRenderer 
        * @instance 
        * @method tag 
        * @param tagName 
        * @param attributes 
        * @param content 
        * @param contentEscape */value: function tag(tagName, attributes, content, contentEscape) {
            attributes = attributes || {};
            let str = '';
            for (let key in attributes) {
                str += ' ' + key;
                if (attributes[key]) {
                    str += '="' + (attributes[key] === true ? key : (0, _escapeHtml2.default)(attributes[key])) + '"';
                }
            }

            return '<' + tagName + str + (content == null ? '/>' : '>' + (contentEscape ? (0, _escapeHtml2.default)(content) : content) + '</' + tagName + '>');
        }
    }]);

    return HtmlRenderer;
})();

exports.default = HtmlRenderer;
module.exports = exports.default;
//# sourceMappingURL=HtmlRenderer.js.map
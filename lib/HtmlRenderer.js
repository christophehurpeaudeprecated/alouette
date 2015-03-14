"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/* jshint maxlen: 200 */
var highlight = require("eshighlight-harmony");
var escape = function escape(text) {
    return String(text).replace(/&(?!\w+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};

var parser = require("./index");

var HtmlRenderer = (function () {
    function HtmlRenderer(options) {
        _classCallCheck(this, HtmlRenderer);

        this.options = options || {};
    }

    _createClass(HtmlRenderer, {
        openLocalFile: {
            value: function openLocalFile(filePath, lineNumber, columnNumber, realFilePath) {
                if (this.openLocalFile.generatedPath && this.openLocalFile.sourcePath && filePath.startsWith(this.openLocalFile.generatedPath)) {
                    filePath = this.openLocalFile.sourcePath + filePath.substr(this.openLocalFile.generatedPath.length);
                }
                return "<a href=\"openlocalfile://" + escape(realFilePath || filePath) + (lineNumber && "?" + lineNumber + (columnNumber && ":" + columnNumber)) + "\">";
            }
        },
        replaceAppInFilePath: {
            value: function replaceAppInFilePath(filePath) {
                if (this.openLocalFile.generatedPath) {
                    filePath = "APP/" + filePath.substr(this.openLocalFile.generatedPath.length);
                }
                return filePath;
            }
        },
        render: {
            value: function render(error) {
                var str = "<div style=\"text-align: left\">";
                str += "<h4>" + error.name + "</h4>" + "\n";
                if (error.message) {
                    str += "<pre style=\"background:#FFF;color:#222;border:0;font-size:1em;white-space:pre-wrap;word-wrap:break-word\">";
                    str += escape(error.message);
                    str += "</pre>";
                }

                str += "<h5 style=\"background:#FFDDAA;color:#333;border:1px solid #E07308;padding:1px 2px;\">Call Stack:</h5>" + "\n";

                if (!this.options.production) {
                    str += "<pre style=\"background:#FFF;color:#222;border:0\">" + this.renderStack(error) + "</pre>";
                }
                return str;
            }
        },
        renderStack: {
            value: function renderStack(error) {
                var _this = this;

                var stackTrace = parser.parseErrorStack(error);

                var str = "<style>.string{ color: #EC7600; }\n.keyword, .null{ font-weight: bold; color: #93C763; }\n.numeric{ color: #FACD22; }\n.line-comment{ color: #66747B; }\n.identifier{ }\n.control-flow{ color: #93C763; }\n.azerty1{ color: #66747B; }\n.azerty2{ color: #678CB1; }\n.azerty5{ color: #F1F2F3; }\n.azerty6{ color: #8AC763; }\n.azerty7{ color: #E0E2E4; }\n.azerty9{ color: purple; }\n</style>";
                stackTrace.forEach(function (item, i) {
                    if (item.file && item.file.contents) {
                        str += "<span><a href=\"javascript:;\" style=\"color:#CC7A00;text-decoration:none;outline:none;\" " + "onclick=\"var el=this.parentNode.nextElementSibling; el.style.display=el.style.display=='none'?'block':'none';\">";
                    }
                    str += "#" + i + " ";
                    if (item.fileName && item.fileName.startsWith("/")) {
                        str += _this.openLocalFile(item.fileName, item.lineNumber, item.columnNumber, item.realFileName);
                    }
                    str += _this.replaceAppInFilePath(item.realFileName || item.fileName) + ":" + item.lineNumber + ":" + item.columnNumber;
                    if (item.fileName) {
                        str += "</a> ";
                    }

                    if (item.native) {
                        str += "[native] ";
                    }

                    if (item.typeName) {
                        str += item.typeName + ".";
                    }
                    if (item.methodName) {
                        str += item.methodName;
                    }
                    if (item.file && item.file.contents) {
                        str += "</a></span>";
                        str += "<div style=\"margin-top:5px;display:none\">";
                        if (item.compiledFileName) {
                            str += "<div>";
                            if (item.realCompiledFileName && item.realCompiledFileName.startsWith("/")) {
                                str += _this.openLocalFile(item.compiledFileName, item.compiledLineNumber, item.compiledColumnNumber, item.realCompiledFileName);
                            }
                            str += _this.replaceAppInFilePath(item.realCompiledFileName) + ":" + item.compiledLineNumber + ":" + item.compiledColumnNumber;
                            str += "</a></div>";
                        }
                        str += "<b>File content :</b><br />";
                        str += _this.highlightLine(item.file.contents, item.lineNumber, item.columnNumber);
                        str += "</div>";
                    }
                    str += "\n";
                });
                return str;
            }
        },
        highlightLine: {
            value: function highlightLine(contents, lineNumber, columnNumber) {
                var style = "background:#3F1F1F;";
                var withLineNumbers = true;
                var minmax = 4;

                var hcontents;
                try {
                    hcontents = highlight(contents);
                } catch (err) {
                    hcontents = escape(contents);
                }
                hcontents = hcontents.split(/\r\n|\n\r|\n|\r/);

                var ok = lineNumber <= hcontents.length;
                var firstLine, start, lineContent, end;
                if (ok) {
                    firstLine = Math.max(0, minmax ? lineNumber - 1 - minmax : 0);
                    start = hcontents.slice(firstLine, lineNumber - 1);
                    lineContent = lineNumber === 0 ? "" : hcontents[lineNumber - 1];
                    end = hcontents.slice(lineNumber, lineNumber + minmax);
                } else {
                    start = hcontents;
                }

                if (withLineNumbers) {}

                var content = this.lines(withLineNumbers, ok ? firstLine + 1 : 1, start);
                if (ok) {
                    var attributes = { style: style };
                    content += this.line(withLineNumbers, lineNumber, attributes, lineContent);
                    content += this.lines(withLineNumbers, lineNumber + 1, end);
                }

                var preAttrs = { style: "background:#0F0F0F;color:#E0E2E4;border:0;padding:0;position:relative;" };
                return this.tag("pre", preAttrs, content, false);
            }
        },
        lines: {
            value: function lines(withLineNumbers, startNumber, _lines) {
                var _this = this;

                var content = "";
                _lines.forEach(function (line) {
                    content += _this.line(withLineNumbers, startNumber++, {}, line);
                });
                return content;
            }
        },
        line: {
            value: function line(withLineNumbers, lineNumber, attributes, contentLine) {
                attributes.style = (attributes.style || "") + "white-space:pre-wrap;" + (withLineNumbers ? "padding-left:20px;" : "");

                if (withLineNumbers) {
                    contentLine = "<i style=\"color:#AAA;font-size:7pt;position:absolute;left:1px;padding-top:1px;\">" + lineNumber + "</i>" + contentLine;
                }
                return this.tag("div", attributes, contentLine);
            }
        },
        tag: {
            value: function tag(tagName, attributes, content, contentEscape) {
                attributes = attributes || {};
                var str = "";
                for (var key in attributes) {
                    str += " " + key;
                    if (attributes[key]) {
                        str += "=\"" + (attributes[key] === true ? key : escape(attributes[key])) + "\"";
                    }
                }
                return "<" + tagName + str + (content == null ? "/>" : ">" + (contentEscape ? escape(content) : content) + "</" + tagName + ">");
            }
        }
    });

    return HtmlRenderer;
})();

module.exports = HtmlRenderer;

//$withLineNumbers = '%'.strlen((string)($ok ? $line+$minmax : $minmax+1)).'d';
//# sourceMappingURL=HtmlRenderer.js.map
var $__Object$defineProperty = Object.defineProperty;
var hljs = require('highlight.js');

var escape = function(text) {
    return String(text)
        .replace(/&(?!\w+;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};

var parser = require('./index');

export default var HtmlRenderer = function() {
    "use strict";
    function HtmlRenderer() {}

    $__Object$defineProperty(HtmlRenderer.prototype, "construct", {
        value: function(options) {
            this.options = options;
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(HtmlRenderer.prototype, "openLocalFile", {
        value: function(filePath, lineNumber) {
            if (this.openLocalFile.generatedPath && this.openLocalFile.sourcePath
                         && filePath.startsWith(this.openLocalFile.generatedPath)) {
                filePath = this.openLocalFile.sourcePath + filePath.substr(this.openLocalFile.generatedPath.length);
            }
            return '<a href="openlocalfile://' + escape(filePath) + ( lineNumber && '?' + lineNumber) + '">';
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(HtmlRenderer.prototype, "replaceAppInFilePath", {
        value: function(filePath) {
            if (this.openLocalFile.generatedPath) {
                filePath = 'APP/' + filePath.substr(this.openLocalFile.generatedPath.length);
            }
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(HtmlRenderer.prototype, "render", {
        value: function(error) {
            var str = '<div style="text-align: left">';
            str += '<h4>' + error.name + '</h4>';
            str += '<pre style="background:#FFF;color:#222;border:0;font-size:1em;white-space:pre-wrap;word-wrap:break-word">';
            str += escape(error.message);
            str += '</pre>';

            str += '<h5 style="background:#FFDDAA;color:#333;border:1px solid #E07308;padding:1px 2px;">Call Stack:</h5>';
            str += '<pre style="background:#FFF;color:#222;border:0">' + this.renderStack(error.stack) + '</pre>';



            if (!this.options.production) {

            }
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(HtmlRenderer.prototype, "renderStack", {
        value: function(stackTrace) {
            if (!stackTrace) {
                return;
            }
            if (typeof stackTrace === 'string') {
                stackTrace = parser.parse(stackTrace);
            }

            var str = '';
            stackTrace.forEach(function(item, i) {
                if (item.contents) {
                    str += '<div><a href="javascript:;" style="color:#CC7A00;text-decoration:none;outline:none;" onclick="var el=this.parentNode.parentNode.children[1]; el.style.display=el.style.display==\'none\'?\'block\':\'none\';">';
                }
                str += '#' + i + ' ';
                if (item.fileName) {
                    str += this.openLocalFile(item.fileName, item.lineNumber, item.columnNumber);
                }
                str += this.replaceAppInFilePath(item.fileName)  + ':' + item.lineNumber + ':' + item.columnNumber;
                if (item.fileName) {
                    str += '</a>';
                }

                if (item.native) {
                    str += '[native] ';
                }

                if (item.typeName) {
                    str += item.typeName + '.';
                }
                if (item.methodName) {
                    str += item.methodName;
                }
                if (item.contents && !this.options.production) {
                    str += '</a></div>';
                    str += '<div style="margin-top:5px;display:none">';
                    str += '<b>File content :</b><br />';
                    str += this.highlightLine(item.contents, item.lineNumber, item.columnNumber);
                    str += '</div>';
                }
            }.bind(this));
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(HtmlRenderer.prototype, "highlightLine", {
        value: function(contents, lineNumber, columnNumber) {
            var style = 'background:#3F1F1F';
            var withLineNumbers = true;
            var minmax = 4;

            var hcontents = hljs.highlight('javascript', contents).value;
            hcontents.split("\n");

            var ok = lineNumber <= hcontents.length;
            var firstLine, start, lineContent, end;
            if (ok) {
                firstLine = Math.max(0, minmax ? lineNumber -1 -minmax : 0);
                start = hcontents.substring(firstLine, lineNumber -1 -firstLine);
                lineContent = lineNumber === 0 ? '' : hcontents[lineNumber - 1];
                end = hcontents.substring(lineNumber, minmax);
            } else {
                start = hcontents;
            }

            if (withLineNumbers) {
                //$withLineNumbers = '%'.strlen((string)($ok ? $line+$minmax : $minmax+1)).'d';
            }

            var content = this.lines(withLineNumbers, ok ? firstLine +1 : 1, start);
            if (ok) {
                var attributes = { style: style };
                content += this.line(withLineNumbers, lineNumber, attributes, lineContent);
                content += this.lines(withLineNumbers, lineNumber +1, end);
            }

            var preAttrs = { style: 'background:#0F0F0F;color:#E0E2E4;border:0;padding:0;position:relative;' };
            return this.tag('pre', preAttrs, content, false);
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(HtmlRenderer.prototype, "lines", {
        value: function(withLineNumbers, startNumber, lines) {
            var content = '';
            lines.forEach(function(line) {
                content += this.line(withLineNumbers, startNumber++, {}, line);
            }.bind(this));
            return content;
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(HtmlRenderer.prototype, "line", {
        value: function(withLineNumbers, lineNumber, attributes, contentLine) {
            attributes.style = (attributes.style || '')
                    + 'white-space:pre-wrap;'
                    + (withLineNumbers ? 'padding-left:20px;' : '');

            if (withLineNumbers) {
                contentLine = '<i style="color:#AAA;font-size:7pt;position:absolute;left:1px;padding-top:1px;">'
                                + lineNumber + '</i>'
                                + contentLine;
            }
            return this.tag('div', attributes, contentLine);
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(HtmlRenderer.prototype, "tag", {
        value: function(tagName, attributes, content, contentEscape) {
            attributes = attributes || {};
            var str = '';
            for (var key in attributes) {
                str += ' ' + key;
                if (attributes[key]) {
                    str += '="' + (attributes[key] === true ? key : escape(attributes[key]));
                }
            }
            return '<' + tagName + str + (content == null ? '/>' :
                            ('>' + (contentEscape ? escape(content) : content) + '</' + tagName + '>'));
        },

        enumerable: false,
        writable: true
    });

    return HtmlRenderer;
}();
//# sourceMappingURL=htmlRenderer.js.map
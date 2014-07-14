"use strict";
var $__Object$defineProperty = Object.defineProperty;
var highlight = require('eshighlight-harmony');
var escape = function(text) {
  return String(text).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};
var parser = require('./index');
var HtmlRenderer = function() {
  "use strict";
  function HtmlRenderer(options) {
    this.options = options || {};
  }
  $__Object$defineProperty(HtmlRenderer.prototype, "openLocalFile", {
    value: function(filePath, lineNumber, columnNumber) {
      if (this.openLocalFile.generatedPath && this.openLocalFile.sourcePath && filePath.startsWith(this.openLocalFile.generatedPath)) {
        filePath = this.openLocalFile.sourcePath + filePath.substr(this.openLocalFile.generatedPath.length);
      }
      return '<a href="openlocalfile://' + escape(filePath) + (lineNumber && '?' + lineNumber + (columnNumber && ':' + columnNumber)) + '">';
    },
    enumerable: false,
    writable: true
  });
  $__Object$defineProperty(HtmlRenderer.prototype, "replaceAppInFilePath", {
    value: function(filePath) {
      if (this.openLocalFile.generatedPath) {
        filePath = 'APP/' + filePath.substr(this.openLocalFile.generatedPath.length);
      }
      return filePath;
    },
    enumerable: false,
    writable: true
  });
  $__Object$defineProperty(HtmlRenderer.prototype, "render", {
    value: function(error) {
      var str = '<div style="text-align: left">';
      str += '<h4>' + error.name + '</h4>' + "\n";
      if (error.message) {
        str += '<pre style="background:#FFF;color:#222;border:0;font-size:1em;white-space:pre-wrap;word-wrap:break-word">';
        str += escape(error.message);
        str += '</pre>';
      }
      str += '<h5 style="background:#FFDDAA;color:#333;border:1px solid #E07308;padding:1px 2px;">Call Stack:</h5>' + "\n";
      if (!this.options.production) {
        str += '<pre style="background:#FFF;color:#222;border:0">' + this.renderStack(error) + '</pre>';
      }
      return str;
    },
    enumerable: false,
    writable: true
  });
  $__Object$defineProperty(HtmlRenderer.prototype, "renderStack", {
    value: function(error) {
      var stackTrace = parser.parseErrorStack(error);
      var str = '<style>.string{ color: #EC7600; }\
    .keyword, .null{ font-weight: bold; color: #93C763; }\
    .numeric{ color: #FACD22; }\
    .line-comment{ color: #66747B; }\
    .identifier{ }\
    .control-flow{ color: #93C763; }\
    .azerty1{ color: #66747B; }\
    .azerty2{ color: #678CB1; }\
    .azerty5{ color: #F1F2F3; }\
    .azerty6{ color: #8AC763; }\
    .azerty7{ color: #E0E2E4; }\
    .azerty9{ color: purple; }\
    </style>';
      stackTrace.forEach(function(item, i) {
        if (item.file && item.file.contents) {
          str += '<span><a href="javascript:;" style="color:#CC7A00;text-decoration:none;outline:none;" ' + 'onclick="var el=this.parentNode.nextElementSibling; el.style.display=el.style.display==\'none\'?\'block\':\'none\';">';
        }
        str += '#' + i + ' ';
        if (item.fileName && item.fileName.startsWith('/')) {
          str += this.openLocalFile(item.fileName, item.lineNumber, item.columnNumber);
        }
        str += this.replaceAppInFilePath(item.fileName) + ':' + item.lineNumber + ':' + item.columnNumber;
        if (item.fileName) {
          str += '</a> ';
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
        if (item.file && item.file.contents) {
          str += '</a></span>';
          str += '<div style="margin-top:5px;display:none">';
          str += '<b>File content :</b><br />';
          str += this.highlightLine(item.file.contents, item.lineNumber, item.columnNumber);
          str += '</div>';
        }
        str += "\n";
      }.bind(this));
      return str;
    },
    enumerable: false,
    writable: true
  });
  $__Object$defineProperty(HtmlRenderer.prototype, "highlightLine", {
    value: function(contents, lineNumber, columnNumber) {
      var style = 'background:#3F1F1F;';
      var withLineNumbers = true;
      var minmax = 4;
      var hcontents = highlight(contents);
      hcontents = hcontents.split(/\r\n|\n\r|\n|\r/);
      var ok = lineNumber <= hcontents.length;
      var firstLine,
          start,
          lineContent,
          end;
      if (ok) {
        firstLine = Math.max(0, minmax ? lineNumber - 1 - minmax : 0);
        start = hcontents.slice(firstLine, lineNumber - 1);
        lineContent = lineNumber === 0 ? '' : hcontents[lineNumber - 1];
        end = hcontents.slice(lineNumber, lineNumber + minmax);
      } else {
        start = hcontents;
      }
      if (withLineNumbers) {}
      var content = this.lines(withLineNumbers, ok ? firstLine + 1 : 1, start);
      if (ok) {
        var attributes = {style: style};
        content += this.line(withLineNumbers, lineNumber, attributes, lineContent);
        content += this.lines(withLineNumbers, lineNumber + 1, end);
      }
      var preAttrs = {style: 'background:#0F0F0F;color:#E0E2E4;border:0;padding:0;position:relative;'};
      return this.tag('pre', preAttrs, content, false);
    },
    enumerable: false,
    writable: true
  });
  $__Object$defineProperty(HtmlRenderer.prototype, "lines", {
    value: function(withLineNumbers, startNumber, _lines) {
      var content = '';
      _lines.forEach(function(line) {
        content += this.line(withLineNumbers, startNumber++, {}, line);
      }.bind(this));
      return content;
    },
    enumerable: false,
    writable: true
  });
  $__Object$defineProperty(HtmlRenderer.prototype, "line", {
    value: function(withLineNumbers, lineNumber, attributes, contentLine) {
      attributes.style = (attributes.style || '') + 'white-space:pre-wrap;' + (withLineNumbers ? 'padding-left:20px;' : '');
      if (withLineNumbers) {
        contentLine = '<i style="color:#AAA;font-size:7pt;position:absolute;left:1px;padding-top:1px;">' + lineNumber + '</i>' + contentLine;
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
          str += '="' + (attributes[key] === true ? key : escape(attributes[key])) + '"';
        }
      }
      return '<' + tagName + str + (content == null ? '/>' : ('>' + (contentEscape ? escape(content) : content) + '</' + tagName + '>'));
    },
    enumerable: false,
    writable: true
  });
  return HtmlRenderer;
}();
module.exports = HtmlRenderer;

//# sourceMappingURL=htmlRenderer.js.map
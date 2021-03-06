var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable max-len, max-lines */

import escape from 'escape-html';
import highlight from 'eshighlight-fb';
import { parseErrorStack } from './index';
import StackTrace from './StackTrace';

function tag(tagName, attributes, content, contentEscape) {
  attributes = attributes || {};
  var str = '';
  Object.keys(attributes).forEach(function (key) {
    str += ' ' + key;
    if (attributes[key]) {
      str += '="' + (attributes[key] === true ? key : escape(attributes[key])) + '"';
    }
  });

  return '<' + tagName + str + (content == null ? '/' : '>' + (contentEscape ? escape(content) : content) + '</' + tagName) + '>';
}

var HtmlRenderer = function () {
  function HtmlRenderer(options) {
    _classCallCheck(this, HtmlRenderer);

    this.options = Object.assign({
      fileProtocol: 'file'
    }, options);
  }

  /**
   * @ignore
   */


  _createClass(HtmlRenderer, [{
    key: 'openLocalFile',
    value: function openLocalFile(filePath, lineNumber, columnNumber, realFilePath) {
      if (this.openLocalFile.generatedPath && this.openLocalFile.sourcePath && filePath.startsWith(this.openLocalFile.generatedPath)) {
        filePath = this.openLocalFile.sourcePath + filePath.substr(this.openLocalFile.generatedPath.length);
      }

      return '<a download href="' + this.options.fileProtocol + '://' + escape(realFilePath || filePath) + ((!lineNumber ? '' : '?' + lineNumber + (!columnNumber ? '' : ':' + columnNumber)) + '">');
    }

    /**
     * @ignore
     */

  }, {
    key: 'replaceAppInFilePath',
    value: function replaceAppInFilePath(filePath) {
      if (this.openLocalFile.generatedPath) {
        filePath = 'APP/' + filePath.substr(this.openLocalFile.generatedPath.length);
      }

      return filePath;
    }

    /**
     * @ignore
     */

  }, {
    key: 'render',
    value: function render(error) {
      var str = '<div style="text-align: left">';
      str += '<h4>' + error.name + '</h4>\n';
      if (error.message) {
        str += '<pre style="background:#FFF;color:#222;border:0;font-size:1em;white-space:pre-wrap;word-wrap:break-word">';
        str += escape(error.message);
        str += '</pre>';
      }

      str += '<h5 style="background:#FFDDAA;color:#333;border:1px solid #E07308;padding:1px 2px;">Call Stack:</h5>\n';

      if (!this.options.production) {
        str += '<pre style="background:#FFF;color:#222;border:0">' + this.renderStack(error) + '</pre>';
      }

      return str;
    }

    /**
     * @ignore
     */

  }, {
    key: 'renderStack',
    value: function renderStack(error) {
      var _this = this;

      var stackTrace = error.stackTrace instanceof StackTrace ? error.stackTrace : parseErrorStack(error);

      var str = '<style>.string{ color: #EC7600; }\n.keyword, .null{ font-weight: bold; color: #93C763; }\n.numeric{ color: #FACD22; }\n.line-comment{ color: #66747B; }\n.identifier{ }\n.control-flow{ color: #93C763; }\n.azerty1{ color: #66747B; }\n.azerty2{ color: #678CB1; }\n.azerty5{ color: #F1F2F3; }\n.azerty6{ color: #8AC763; }\n.azerty7{ color: #E0E2E4; }\n.azerty9{ color: purple; }\n</style>';
      stackTrace.forEach(function (item, i) {
        if (item.file && item.file.contents || item.compiledFileName) {
          str += '<span><a href="javascript:;" style="color:#CC7A00;text-decoration:none;outline:none;" onclick="var el=this.parentNode.nextElementSibling; el.style.display=el.style.display==\\\'none\\\'?\\\'block\\\':\\\'none\\\';">';
        }

        str += '#' + i + ' ';
        if (item.fileName && item.fileName.startsWith('/')) {
          str += _this.openLocalFile(item.fileName, item.lineNumber, item.columnNumber, item.realFileName);
        }

        if (!item.native) {
          str += _this.replaceAppInFilePath(item.realFileName || item.fileName);
          str += ':' + item.lineNumber + ':' + item.columnNumber;
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

        if (item.file && item.file.contents || item.compiledFileName) {
          str += '</a></span>';
          str += '<div style="display:none">';
          if (item.compiledFileName) {
            str += '<div style="margin-top: 5px">';
            str += '<b>Compiled path :</b><br />';
            if (item.realCompiledFileName && item.realCompiledFileName.startsWith('/')) {
              str += _this.openLocalFile(item.compiledFileName, item.compiledLineNumber, item.compiledColumnNumber, item.realCompiledFileName);
            }

            str += _this.replaceAppInFilePath(item.realCompiledFileName);
            str += ':' + item.compiledLineNumber + ':' + item.compiledColumnNumber;
            if (item.realCompiledFileName && item.realCompiledFileName.startsWith('/')) {
              str += '</a>';
            }

            str += '</div>';
          }

          if (item.file && item.file.contents) {
            str += '<div style="margin-top: 5px">';
            str += '<b>File content :</b><br />';
            str += _this.highlightLine(item.file.contents, item.lineNumber, item.columnNumber);
            str += '</div>';
          }

          str += '</div>';
        }

        str += '\n';
      });

      return str;
    }

    /**
     * @ignore
     */

  }, {
    key: 'highlightLine',
    value: function highlightLine(contents, lineNumber /* , columnNumber */) {
      var withLineNumbers = true;
      var minmax = 4;

      var hcontents = void 0;
      try {
        hcontents = highlight(contents);
      } catch (err) {
        hcontents = escape(contents);
      }

      hcontents = hcontents.split(/\r\n|\n\r|\n|\r/);

      var ok = lineNumber <= hcontents.length;
      var firstLine = void 0;
      var start = void 0;
      var lineContent = void 0;
      var end = void 0;

      if (ok) {
        firstLine = Math.max(0, lineNumber - 1 - minmax);
        start = hcontents.slice(firstLine, lineNumber - 1);
        lineContent = lineNumber === 0 ? '' : hcontents[lineNumber - 1];
        end = hcontents.slice(lineNumber, lineNumber + minmax);
      } else {
        start = hcontents;
      }

      /* if (withLineNumbers) {
          // $withLineNumbers = '%'.strlen((string)($ok ? $line+$minmax : $minmax+1)).'d';
      } */

      var content = this.lines(withLineNumbers, ok ? firstLine + 1 : 1, start);
      if (ok) {
        content += this.line(withLineNumbers, lineNumber, { style: 'background:#3F1F1F;' }, lineContent);
        content += this.lines(withLineNumbers, lineNumber + 1, end);
      }

      return tag('pre', { style: 'background:#0F0F0F;color:#E0E2E4;border:0;padding:0;position:relative;' }, content, false);
    }

    /**
     * @ignore
     */

  }, {
    key: 'lines',
    value: function lines(withLineNumbers, startNumber, _lines) {
      var _this2 = this;

      var content = '';
      _lines.forEach(function (line) {
        content += _this2.line(withLineNumbers, startNumber + 1, {}, line);
      });
      return content;
    }

    /**
     * @ignore
     */

  }, {
    key: 'line',
    value: function line(withLineNumbers, lineNumber, attributes, contentLine) {
      attributes.style = (attributes.style || '') + 'white-space:pre-wrap;' + ('' + (withLineNumbers ? 'padding-left:20px;' : ''));

      if (withLineNumbers) {
        contentLine = '<i style="color:#AAA;font-size:7pt;position:absolute;left:1px;padding-top:1px;">' + (lineNumber + '</i>' + contentLine);
      }

      return tag('div', attributes, contentLine);
    }
  }]);

  return HtmlRenderer;
}();

export default HtmlRenderer;
//# sourceMappingURL=HtmlRenderer.js.map
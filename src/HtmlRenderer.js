/* eslint max-len: 'off', class-methods-use-this: 'off' */

import escape from 'escape-html';
import highlight from 'eshighlight-fb';
import { parseErrorStack } from './index';
import StackTrace from './StackTrace';

function tag(tagName, attributes, content, contentEscape) {
  attributes = attributes || {};
  let str = '';
  Object.keys(attributes).forEach(key => {
    str += ` ${key}`;
    if (attributes[key]) {
      str += `="${attributes[key] === true ? key : escape(attributes[key])}"`;
    }
  });

  return `<${tagName}${str}${content == null ? '/' :
                  `>${contentEscape ? escape(content) : content}</${tagName}`}>`;
}

export default class HtmlRenderer {
  constructor(options) {
    this.options = Object.assign({
      fileProtocol: 'file',
    }, options);
  }

  /**
   * @ignore
   */
  openLocalFile(filePath, lineNumber, columnNumber, realFilePath) {
    if (this.openLocalFile.generatedPath && this.openLocalFile.sourcePath
                     && filePath.startsWith(this.openLocalFile.generatedPath)) {
      filePath = this.openLocalFile.sourcePath + filePath.substr(this.openLocalFile.generatedPath.length);
    }

    return `<a download href="${this.options.fileProtocol}://${escape(realFilePath || filePath)}`
               + `${!lineNumber ? '' : `?${lineNumber}${!columnNumber ? '' : `:${columnNumber}`}`}">`;
  }

  /**
   * @ignore
   */
  replaceAppInFilePath(filePath) {
    if (this.openLocalFile.generatedPath) {
      filePath = `APP/${filePath.substr(this.openLocalFile.generatedPath.length)}`;
    }

    return filePath;
  }

  /**
   * @ignore
   */
  render(error) {
    let str = '<div style="text-align: left">';
    str += `<h4>${error.name}</h4>\n`;
    if (error.message) {
      str += '<pre style="background:#FFF;color:#222;border:0;font-size:1em;white-space:pre-wrap;word-wrap:break-word">';
      str += escape(error.message);
      str += '</pre>';
    }

    str += '<h5 style="background:#FFDDAA;color:#333;border:1px solid #E07308;padding:1px 2px;">Call Stack:</h5>\n';

    if (!this.options.production) {
      str += `<pre style="background:#FFF;color:#222;border:0">${this.renderStack(error)}</pre>`;
    }

    return str;
  }

  /**
   * @ignore
   */
  renderStack(error) {
    let stackTrace = error.stackTrace instanceof StackTrace ? error.stackTrace : parseErrorStack(error);

    let str = `<style>.string{ color: #EC7600; }
.keyword, .null{ font-weight: bold; color: #93C763; }
.numeric{ color: #FACD22; }
.line-comment{ color: #66747B; }
.identifier{ }
.control-flow{ color: #93C763; }
.azerty1{ color: #66747B; }
.azerty2{ color: #678CB1; }
.azerty5{ color: #F1F2F3; }
.azerty6{ color: #8AC763; }
.azerty7{ color: #E0E2E4; }
.azerty9{ color: purple; }
</style>`;
    stackTrace.forEach((item, i) => {
      if ((item.file && item.file.contents) || item.compiledFileName) {
        str += '<span><a href="javascript:;" style="color:#CC7A00;text-decoration:none;outline:none;" '
                        + 'onclick="var el=this.parentNode.nextElementSibling; el.style.display=el.style.display==\'none\'?\'block\':\'none\';">';
      }

      str += `#${i} `;
      if (item.fileName && item.fileName.startsWith('/')) {
        str += this.openLocalFile(item.fileName, item.lineNumber, item.columnNumber, item.realFileName);
      }

      if (!item.native) {
        str += this.replaceAppInFilePath(item.realFileName || item.fileName);
        str += `:${item.lineNumber}:${item.columnNumber}`;
      }

      if (item.fileName) {
        str += '</a> ';
      }

      if (item.functionName) {
        str += item.functionName;
      } else if (item.typeName) {
        str += `${item.typeName}.${item.methodName || '<anonymous>'}`;
      }

      if (item.native) {
        str += ' [native]';
      }

      if ((item.file && item.file.contents) || item.compiledFileName) {
        str += '</a></span>';
        str += '<div style="display:none">';
        if (item.compiledFileName) {
          str += '<div style="margin-top: 5px">';
          str += '<b>Compiled path :</b><br />';
          if (item.realCompiledFileName && item.realCompiledFileName.startsWith('/')) {
            str += this.openLocalFile(item.compiledFileName, item.compiledLineNumber,
                                item.compiledColumnNumber, item.realCompiledFileName);
          }

          str += this.replaceAppInFilePath(item.realCompiledFileName);
          str += `:${item.compiledLineNumber}:${item.compiledColumnNumber}`;
          if (item.realCompiledFileName && item.realCompiledFileName.startsWith('/')) {
            str += '</a>';
          }

          str += '</div>';
        }

        if (item.file && item.file.contents) {
          str += '<div style="margin-top: 5px">';
          str += '<b>File content :</b><br />';
          str += this.highlightLine(item.file.contents, item.lineNumber, item.columnNumber);
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
  highlightLine(contents, lineNumber /* , columnNumber */) {
    let style = 'background:#3F1F1F;';
    let withLineNumbers = true;
    let minmax = 4;

    let hcontents;
    try {
      hcontents = highlight(contents);
    } catch (err) {
      hcontents = escape(contents);
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
    return tag('pre', preAttrs, content, false);
  }

  /**
   * @ignore
   */
  lines(withLineNumbers, startNumber, _lines) {
    let content = '';
    _lines.forEach((line) => {
      content += this.line(withLineNumbers, startNumber + 1, {}, line);
    });
    return content;
  }

  /**
   * @ignore
   */
  line(withLineNumbers, lineNumber, attributes, contentLine) {
    attributes.style = `${attributes.style || ''}white-space:pre-wrap;`
            + `${withLineNumbers ? 'padding-left:20px;' : ''}`;

    if (withLineNumbers) {
      contentLine = '<i style="color:#AAA;font-size:7pt;position:absolute;left:1px;padding-top:1px;">'
                            + `${lineNumber}</i>${contentLine}`;
    }

    return tag('div', attributes, contentLine);
  }
}

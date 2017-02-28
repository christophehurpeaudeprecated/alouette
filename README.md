# alouette [![NPM version][npm-image]][npm-url]

Parse an error with its stack trace, apply source maps and render it in console or in html

[![Build Status][circleci-status-image]][circleci-status-url]
[![Travis Status][travisci-status-image]][travisci-status-url]
[![Dependency ci Status][dependencyci-image]][dependencyci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Coverage percentage][coverage-image]][coverage-url]

## Install

```sh
npm install --save alouette
```


## API

[https://christophehurpeau.github.io/alouette/docs](http://christophehurpeau.github.io/alouette/docs)


## Use

### For console

```js
import { parse as parseError } from 'alouette';
// es5: var parseError = require('alouette').parse;

try {
    //...
} catch (err) {
    console.error(parseError(err).toString());
}
```

### Html rendering

```js
import HtmlStackRenderer from 'alouette/HtmlRenderer';
// es5: var HtmlStackRenderer = require('alouette/HtmlRenderer');
const htmlStackRenderer = new HtmlStackRenderer();

function (req, res) {
    try {
        //...
    } catch (err) {
        res.send(500, htmlStackRenderer.render(err));
    }
}

```

### Open local files

You can use [this firefox extension](https://addons.mozilla.org/en-US/firefox/addon/locallink/) to open in a new tab.

To open in your editor, you can follow this below: (only works with linux)

```
sudo wget https://raw.github.com/christophehurpeau/ppa/master/openlocalfile/openlocalfile -o /usr/bin/openlocalfile
sudo wget https://raw.github.com/christophehurpeau/ppa/master/openlocalfile/openlocalfile.desktop -o /usr/share/applications/openlocalfile.desktop
sudo xdg-mime default openlocalfile.desktop x-scheme-handler/openlocalfile
```

And pass the `fileProtocol` option:
```js
const htmlStackRenderer = new HtmlStackRenderer({ fileProtocol: 'openlocalfile' });
```

You can modify /usr/bin/openlocalfile to change the editor.

[npm-image]: https://img.shields.io/npm/v/alouette.svg?style=flat-square
[npm-url]: https://npmjs.org/package/alouette
[daviddm-image]: https://david-dm.org/christophehurpeau/alouette.svg?style=flat-square
[daviddm-url]: https://david-dm.org/christophehurpeau/alouette
[dependencyci-image]: https://dependencyci.com/github/christophehurpeau/alouette/badge?style=flat-square
[dependencyci-url]: https://dependencyci.com/github/christophehurpeau/alouette
[circleci-status-image]: https://img.shields.io/circleci/project/christophehurpeau/alouette/master.svg?style=flat-square
[circleci-status-url]: https://circleci.com/gh/christophehurpeau/alouette
[travisci-status-image]: https://img.shields.io/travis/christophehurpeau/alouette/master.svg?style=flat-square
[travisci-status-url]: https://travis-ci.org/christophehurpeau/alouette
[coverage-image]: https://img.shields.io/codecov/c/github/christophehurpeau/alouette/master.svg?style=flat-square
[coverage-url]: https://codecov.io/gh/christophehurpeau/alouette
[docs-coverage-url]: https://christophehurpeau.github.io/alouette/coverage/lcov-report/

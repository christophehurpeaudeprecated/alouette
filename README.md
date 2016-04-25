alouette  [![NPM version][npm-image]][npm-url] [![Drone.io Status][droneio-image]][droneio-url]
============================

Parse an error with its stack trace, apply source maps and render it in console or in html

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
import HtmlStackRenderer from 'alouette/lib/HtmlRenderer';
// es5: var HtmlStackRenderer = require('alouette/lib/HtmlRenderer');
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


[npm-image]: https://img.shields.io/npm/v/alouette.svg?style=flat
[npm-url]: https://npmjs.org/package/alouette
[droneio-image]: https://drone.io/github.com/christophehurpeau/alouette/status.png
[droneio-url]: https://drone.io/github.com/christophehurpeau/alouette/latest

See the [auto-generated docs](http://christophehurpeau.github.io/alouette/docs/global.html)

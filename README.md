alouette  [![NPM version][npm-image]][npm-url] [![Drone.io Status][droneio-image]][droneio-url]
============================

Parse an error with its stack trace, apply source maps and render it in console or in html

## Use


### For console

```js
import { parse as errorParse } from 'alouette';
// es5: var errorParser = require('alouette').parse;

try {
    //...
} catch (err) {
    console.error(errorParse(err).toString());
}
```

### Html rendering

```js
import HtmlStackRenderer from 'alouette/lib/HtmlRenderer';
// es5: var HtmlStackRenderer = require('alouette/lib/HtmlRenderer');
var htmlStackRenderer = new HtmlStackRenderer();

function(req, res) {
    try {
        //...
    } catch (err) {
        res.send(500, htmlStackRenderer.render(err));
    }
}

```

[npm-image]: https://img.shields.io/npm/v/alouette.svg?style=flat
[npm-url]: https://npmjs.org/package/alouette
[droneio-image]: https://drone.io/github.com/christophehurpeau/alouette/status.png
[droneio-url]: https://drone.io/github.com/christophehurpeau/alouette/latest

See the [auto-generated docs](http://christophehurpeau.github.io/alouette/docs/global.html)

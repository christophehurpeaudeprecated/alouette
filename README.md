springbokjs-errors  [![NPM version][npm-image]][npm-url] [![Drone.io Status][droneio-image]][droneio-url]
============================

Parse an error with its stack trace, apply source maps and render it in console or in html

## Use


### For console

```
var stackParser = require('springbokjs-errors');

try {
    //...
} catch (err) {
    console.error(stackParser.parse(err).toString());
}
```

### Html rendering

```
var HtmlStackRenderer = require('springbokjs-errors/lib/HtmlRenderer');
var htmlStackRenderer = new HtmlStackRenderer();

function(req, res) {
    try {
        //...
    } catch (err) {
        res.send(500, htmlStackRenderer.render(err));
    }
}

```

[npm-image]: https://img.shields.io/npm/v/springbokjs-errors.svg?style=flat
[npm-url]: https://npmjs.org/package/springbokjs-errors
[droneio-image]: https://drone.io/github.com/christophehurpeau/springbokjs-errors/status.png
[droneio-url]: https://drone.io/github.com/christophehurpeau/springbokjs-errors/latest

See the [auto-generated docs](http://christophehurpeau.github.io/springbokjs-errors/docs/global.html)

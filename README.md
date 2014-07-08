springbokjs-stack-trace
============================

Parse a stack trace, apply source maps and render it in console or in html

## Use

```
var stackParser = require('springbokjs-stack-trace');
var HtmlStackRenderer = require('springbokjs-stack-trace/htmlRenderer');
var htmlStackRenderer = new HtmlStackRenderer();

function(req, res) {
    try {
        //...
    } catch (err) {
        var parsedStack = stackParser.parse(err.stack);
        htmlStackRenderer.render(parsedStack);
    }
}

```

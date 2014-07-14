springbokjs-errors
============================

Parse an error with its stack trace, apply source maps and render it in console or in html

## Use


### For console

```
var stackParser = require('springbokjs-stack-trace');

try {
    //...
} catch (err) {
    console.error(stackParser.parse(err).toString());
}
```

### Html rendering

```
var HtmlStackRenderer = require('springbokjs-stack-trace/htmlRenderer');
var htmlStackRenderer = new HtmlStackRenderer();

function(req, res) {
    try {
        //...
    } catch (err) {
        res.send(500, htmlStackRenderer.render(err));
    }
}

```

var assert = require('proclaim');
var parser = require('../../lib/index.js');

test('should have parsed the stack trace', function() {
    try {
        (function() {
            unknownFunction(); // jshint ignore:line
        })();
    } catch (err) {
        var stack = parser.parseErrorStack(err);
        var firstItem = stack.items[0];
        assert.strictEqual(firstItem.realFileName, __filename.replace('/lib/', '/src/'));
        assert.strictEqual(firstItem.lineNumber, 7);
        assert.strictEqual(firstItem.columnNumber, 13);
    }
});

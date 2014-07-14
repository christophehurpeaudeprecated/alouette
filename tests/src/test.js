var assert = require('proclaim');
var expect = assert.strictEqual;
var parser = require('../../lib/index.js');

test('should have parsed the stack trace', function() {
    try {
        (function() {
            unknownFunction(); // jshint ignore:line
        })();
    } catch (err) {
        var stack = parser.parseErrorStack(err);
        var firstItem = stack.items[0];
        expect(firstItem.fileName, __filename.replace('/lib/', '/src/'));
        expect(firstItem.lineNumber, 8);
        expect(firstItem.columnNumber, 12);
    }
});
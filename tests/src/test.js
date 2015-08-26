require('es6-shim/es6-shim');
var assert = require('proclaim');
var parser = require('../../lib/index.js');

test('should have parsed the stack trace', function() {
    try {
        (function() {
            unknownFunction(); // jshint ignore:line
        })();
    } catch (err) {
        // console.log(err.stack);
        var stack = parser.parseErrorStack(err);
        // console.log('========');
        // console.log(stack.toString());
        var firstItem = stack.items[0];
        // assert.strictEqual(firstItem.realFileName, __filename.replace('/lib/', '/src/'));
        assert.strictEqual(firstItem.fileName, 'src/test.js');
        assert.strictEqual(firstItem.realFileName, 'src/test.js');
        assert.strictEqual(firstItem.lineNumber, 8);
        assert.lessThan(firstItem.columnNumber, 14);
        assert.greaterThanOrEqual(firstItem.columnNumber, 12);
    }
});

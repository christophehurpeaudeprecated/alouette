'use strict';

var _proclaim = require('proclaim');

var _libIndexJs = require('../../lib/index.js');

require('es6-shim/es6-shim');

test('should have parsed the stack trace', /** @function */function () {
    try {
        ( /** @function */function () {
            unknownFunction(); // jshint ignore:line
        })();
    } catch (err) {
        // console.log(err.stack);
        let stack = (0, _libIndexJs.parseErrorStack)(err);
        // console.log('========');
        // console.log(stack.toString());
        let firstItem = stack.items[0];
        (0, _proclaim.strictEqual)(firstItem.fileName, __filename.replace('/lib/', '/src/'));
        (0, _proclaim.strictEqual)(firstItem.realFileName, __filename.replace('/lib/', '/src/'));
        (0, _proclaim.strictEqual)(firstItem.lineNumber, 8);
        (0, _proclaim.lessThan)(firstItem.columnNumber, 14);
        (0, _proclaim.greaterThanOrEqual)(firstItem.columnNumber, 12);
    }
});
//# sourceMappingURL=test.js.map
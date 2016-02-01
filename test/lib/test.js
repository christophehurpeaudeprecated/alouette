'use strict';

var _proclaim = require('proclaim');

var _index = require('../../lib/index.js');

/* global test */

test('should have parsed the stack trace', () => {
    try {
        ( /**
           * @function
          */function () {
            /* jshint ignore:start*/ /*eslint-disable */
            unknownFunction();
            /* jshint ignore:end */ /*eslint-enable */
        })();
    } catch (err) {
        // console.log(err.stack);
        let stack = (0, _index.parseErrorStack)(err);
        // console.log('========');
        // console.log(stack.toString());
        let firstItem = stack.items[0];
        (0, _proclaim.strictEqual)(firstItem.fileName, __filename.replace('/lib/', '/src/'));
        (0, _proclaim.strictEqual)(firstItem.realFileName, __filename.replace('/lib/', '/src/'));
        (0, _proclaim.strictEqual)(firstItem.lineNumber, 9);
        (0, _proclaim.lessThan)(firstItem.columnNumber, 14);
        (0, _proclaim.greaterThanOrEqual)(firstItem.columnNumber, 12);
    }
});
//# sourceMappingURL=test.js.map
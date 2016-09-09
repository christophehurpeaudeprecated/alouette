'use strict';

var _assert = require('assert');

var _ = require('../../');

/* global test */
test('should have parsed the stack trace', () => {
  try {
    (function () {
      /* jshint ignore:start*/ /*eslint-disable */
      unknownFunction();
      /* jshint ignore:end */ /*eslint-enable */
    })();
  } catch (err) {
    // console.log(err.stack);
    let stack = (0, _.parseErrorStack)(err);
    // console.log('========');
    // console.log(stack.toString());
    let firstItem = stack.items[0];
    (0, _assert.strictEqual)(firstItem.fileName, __filename.replace('/node6/', '/src/'));
    (0, _assert.strictEqual)(firstItem.realFileName, __filename.replace('/node6/', '/src/'));
    (0, _assert.strictEqual)(firstItem.lineNumber, 9);
    (0, _assert.strictEqual)(firstItem.columnNumber, 6);
  }
});
//# sourceMappingURL=index.js.map
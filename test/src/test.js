/* global test */
import { strictEqual, lessThan, greaterThanOrEqual } from 'proclaim';
import { parseErrorStack } from '../../lib/index.js';

test('should have parsed the stack trace', () => {
    try {
        (function () {
            /* jshint ignore:start*//*eslint-disable */
            unknownFunction();
            /* jshint ignore:end *//*eslint-enable */
        }());
    } catch (err) {
        // console.log(err.stack);
        let stack = parseErrorStack(err);
        // console.log('========');
        // console.log(stack.toString());
        let firstItem = stack.items[0];
        strictEqual(firstItem.fileName, __filename.replace('/lib/', '/src/'));
        strictEqual(firstItem.realFileName, __filename.replace('/lib/', '/src/'));
        strictEqual(firstItem.lineNumber, 9);
        lessThan(firstItem.columnNumber, 14);
        greaterThanOrEqual(firstItem.columnNumber, 12);
    }
});

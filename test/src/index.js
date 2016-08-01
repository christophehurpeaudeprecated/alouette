/* global test */
import { strictEqual } from 'assert';
import { parseErrorStack } from '../../';

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
        strictEqual(firstItem.fileName, __filename.replace('/node6/', '/src/'));
        strictEqual(firstItem.realFileName, __filename.replace('/node6/', '/src/'));
        strictEqual(firstItem.lineNumber, 9);
        strictEqual(firstItem.columnNumber, 12);
    }
});

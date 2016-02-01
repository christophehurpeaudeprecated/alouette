'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
let ParsedError = class ParsedError {
    /**
     * @param err
    */
    constructor(err) {
        this.name = err.name;
        this.message = err.message;
        this.originalStack = err.stack;
    }

    toString() {
        let str = `${ this.name }: ${ this.message }\n`;
        str += this.stack.toString();

        if (this.previous) {
            str += '\n';
            str += 'PREVIOUS: ';
            str += this.previous.toString();
        }

        return str;
    }
};
exports.default = ParsedError;
//# sourceMappingURL=ParsedError.js.map
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
let ParsedError = class ParsedError {
    /**
     * @param err
    */
    constructor(err) {
        this.originalError = err;
    }

    /**
     * @member name
    */get name() {
        return this.originalError.name;
    }

    /**
     * @member message
    */get message() {
        return this.originalError.message;
    }

    /**
     * @member originalStack
    */get originalStack() {
        return this.originalError.stack;
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
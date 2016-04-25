import StackTrace from './StackTrace';

export default class ParsedError {
    originalError: Error;
    stackTrace: StackTrace;

    constructor(err) {
        this.originalError = err;
    }

    get name() {
        return this.originalError.name;
    }

    get message() {
        return this.originalError.message;
    }

    get originalStack() {
        return this.originalError.stack;
    }

    get stack() {
        return this.toString();
    }

    toString() {
        if (this._toStringCache) {
            return this._toStringCache;
        }

        let str = `${this.name}: ${this.message}\n`;
        str += this.stackTrace.toString();

        if (this.previous) {
            str += '\n';
            str += 'PREVIOUS: ';
            str += this.previous.toString();
        }

        return this._toStringCache = str;
    }
}

export default class ParsedError {
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

    toString() {
        let str = `${this.name}: ${this.message}\n`;
        str += this.stack.toString();

        if (this.previous) {
            str += '\n';
            str += 'PREVIOUS: ';
            str += this.previous.toString();
        }

        return str;
    }
}

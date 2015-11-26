export default class ParsedError {
    constructor(err) {
        this.name = err.name;
        this.message = err.message;
        this.originalStack = err.stack;
    }

    toString() {
        let str = this.name + ': ' + this.message + '\n';
        str += this.stack.toString();

        if (this.previous) {
            str += '\n';
            str += 'PREVIOUS: ';
            str += this.previous.toString();
        }

        return str;
    }
}

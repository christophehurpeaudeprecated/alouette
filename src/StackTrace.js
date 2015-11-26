export default class StackTrace {
    constructor() {
        this.items = [];
    }

    forEach() {
        return this.items.forEach(...arguments);
    }

    toString() {
        let str = '';
        this.render(string => str += string + '\n');
        return str;
    }

    render(log) {
        this.forEach(line => line.render(log));
    }
}

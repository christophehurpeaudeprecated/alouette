import StackTraceItem from './StackTraceItem';

export default class StackTrace {

    constructor() {
        this.items = [];
    }

    forEach() {
        return this.items.forEach(...arguments);
    }

    toArray() {
        return this.items.map(item => item.toString());
    }

    toString() {
        return this.toArray().join('\n');
    }
}
//# sourceMappingURL=StackTrace.js.map
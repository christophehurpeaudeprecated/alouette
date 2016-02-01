'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
let StackTrace = class StackTrace {
    constructor() {
        this.items = [];
    }

    forEach() {
        return this.items.forEach(...arguments);
    }

    toString() {
        let str = '';
        this.render(string => str += `${ string }\n`);
        return str;
    }

    /**
     * @param log
    */render(log) {
        this.forEach(line => line.render(log));
    }
};
exports.default = StackTrace;
//# sourceMappingURL=StackTrace.js.map
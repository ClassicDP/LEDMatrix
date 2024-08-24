"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mutex = void 0;
class Mutex {
    constructor() {
        this._queue = [];
        this._lock = false;
    }
    lock(logMsg) {
        if (Mutex.logAllowed && logMsg)
            console.log("Mutex lock: ", logMsg, !this._lock);
        return new Promise((res) => {
            if (!this._lock) {
                this._lock = true;
                res();
            }
            else {
                this._queue.push(res);
            }
        });
    }
    unlock(logMsg) {
        if (Mutex.logAllowed && logMsg)
            console.log("Mutex unLock: ", logMsg);
        if (this._queue.length > 0) {
            const func = this._queue.shift();
            if (func)
                func();
        }
        else {
            this._lock = false;
        }
    }
}
exports.Mutex = Mutex;
Mutex.logAllowed = true;
//# sourceMappingURL=mutex.js.map
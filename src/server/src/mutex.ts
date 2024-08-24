export class Mutex {
    static logAllowed = true
    private _queue: (() => void)[] = [];
    private _lock = false;

    lock(logMsg?: string): Promise<void> {
        if (Mutex.logAllowed && logMsg) console.log("Mutex lock: ", logMsg, !this._lock)
        return new Promise((res) => {
            if (!this._lock) {
                this._lock = true;
                res();
            } else {
                this._queue.push(res);
            }
        });
    }

    unlock(logMsg?: string) {
        if (Mutex.logAllowed && logMsg) console.log("Mutex unLock: ", logMsg)
        if (this._queue.length > 0) {
            const func = this._queue.shift();
            if (func) func();
        } else {
            this._lock = false;
        }
    }
}
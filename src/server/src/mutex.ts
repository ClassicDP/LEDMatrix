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

    tryLock(logMsg?: string): boolean {
        if (this._lock) {
            // Если мьютекс уже залочен, возвращаем false
            return false;
        } else {
            // Если мьютекс свободен, лочим его и возвращаем true
            this._lock = true;
            if (Mutex.logAllowed && logMsg) console.log("Mutex tryLock successful: ", logMsg);
            return true;
        }
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
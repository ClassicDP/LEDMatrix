/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/serde-ts/dist/SerDe.js":
/*!*************************************************!*\
  !*** ../../node_modules/serde-ts/dist/SerDe.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SerDe = void 0;
// Function to check if a given function is a class constructor
function isClass(func) {
    return typeof func === 'function' && /^\s*class\s+/.test(func.toString());
}
class SerDe {
    // Method to handle simple types directly
    static fromSimple(obj) {
        if (obj instanceof Date || typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
            return obj;
        }
        return undefined;
    }
    // Method to set exclusive classes for serialization
    static setExclusively(list) {
        SerDe.only = new Set([...list, Array, Map, Set]);
    }
    // Main serialization method
    static serialise(obj, visited = new Map(), _map = new Map(), depth = 0, parent) {
        var _a, _b, _c, _d, _e;
        if (typeof obj === 'undefined' || obj === null)
            return obj;
        // If the object is a class and is not in the exclusive list, skip serialization
        if (((_a = SerDe.only) === null || _a === void 0 ? void 0 : _a.size) && isClass(obj === null || obj === void 0 ? void 0 : obj.constructor) && !SerDe.only.has(obj.constructor))
            return undefined;
        if (obj instanceof Date)
            return { t: 'Date', v: obj.valueOf() };
        let maybeSimple = SerDe.fromSimple(obj);
        if (maybeSimple !== undefined)
            return maybeSimple;
        if (visited.has(obj)) {
            visited.get(obj).times++;
            return { t: (_b = obj === null || obj === void 0 ? void 0 : obj.constructor) === null || _b === void 0 ? void 0 : _b.name, v: { _mapId: SerDe.weakMap.get(obj) } };
        }
        if (obj instanceof Function)
            return { t: 'function', v: obj.name };
        if (parent)
            visited.set(obj, { times: 1, parent });
        let id = (_c = SerDe.weakMap.get(obj)) !== null && _c !== void 0 ? _c : SerDe.id++;
        SerDe.weakMap.set(obj, id);
        // Handle Map objects
        if (obj instanceof Map) {
            let serialised = new Array(obj.size);
            _map.set(id, serialised);
            let i = 0;
            obj.forEach((value, key) => {
                serialised[i] = [
                    SerDe.serialise(key, visited, _map, depth + 1, { obj: serialised, key: [i, 0] }),
                    SerDe.serialise(value, visited, _map, depth + 1, { obj: serialised, key: [i, 1] }),
                ];
                i++;
            });
            return { t: obj.constructor.name, v: serialised };
        }
        // Handle Set and Array objects
        if (obj instanceof Set || obj instanceof Array) {
            let serialised = Array(obj instanceof Set ? obj.size : obj.length);
            _map.set(id, serialised);
            let i = 0;
            obj.forEach((value) => {
                serialised[i] = SerDe.serialise(value, visited, _map, depth + 1, { obj: serialised, key: i });
                i++;
            });
            return { t: obj.constructor.name, v: serialised };
        }
        // Handle generic objects
        let serialised = {};
        _map.set(id, serialised);
        for (let [key, value] of Object.entries(obj)) {
            serialised[key] = SerDe.serialise(value, visited, _map, depth + 1, { obj: serialised, key });
        }
        // If we are at the top level, handle circular references and multiple instances
        if (depth === 0) {
            let recursionVisited = Array.from(visited)
                .filter(([_, val]) => val.times > 1)
                .map(([obj, val]) => [SerDe.weakMap.get(obj), val]); // Explicitly cast id to number
            recursionVisited.forEach(([id, val]) => {
                if (val.parent.key instanceof Array) {
                    ;
                    val.parent.obj[val.parent.key[0]][val.parent.key[1]].v = { _mapId: id };
                }
                else {
                    ;
                    val.parent.obj[val.parent.key].v = { _mapId: id };
                }
            });
            // Attach the _map for serialization result
            return { t: (_d = obj === null || obj === void 0 ? void 0 : obj.constructor) === null || _d === void 0 ? void 0 : _d.name, v: serialised, _map: recursionVisited.map((x) => [x[0], _map.get(x[0])]) };
        }
        return { t: (_e = obj === null || obj === void 0 ? void 0 : obj.constructor) === null || _e === void 0 ? void 0 : _e.name, v: serialised };
    }
    // Main deserialization method
    static deserialize(obj) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        if (obj === undefined || obj === null)
            return obj;
        if ((obj === null || obj === void 0 ? void 0 : obj.t) === 'Date')
            return new Date(obj.v);
        // If obj is a primitive, return it directly (with Date handling)
        if (SerDe.isPrimitive(obj)) {
            return obj instanceof Date ? new Date(obj) : obj;
        }
        if (obj.t === 'function')
            return (_a = SerDe.classRegistry.get(obj.v)) !== null && _a !== void 0 ? _a : {};
        // Handles the restoration of _map for object references if it exists
        if (obj._map) {
            SerDe._map = new Map(obj._map);
            SerDe._tempMap = new Map();
        }
        // Retrieve the class constructor if available
        const classConstructor = SerDe.classRegistry.get(obj.t);
        let instance;
        if (((_b = obj.v) === null || _b === void 0 ? void 0 : _b._mapId) && ((_c = SerDe._tempMap) === null || _c === void 0 ? void 0 : _c.has(obj.v._mapId))) {
            return (_d = SerDe._tempMap) === null || _d === void 0 ? void 0 : _d.get(obj.v._mapId);
        }
        else {
            instance = classConstructor ? Object.create(classConstructor.prototype) : {};
            (_e = SerDe._tempMap) === null || _e === void 0 ? void 0 : _e.set(obj.v._mapId, instance);
        }
        let nested = (_h = (_f = SerDe._map) === null || _f === void 0 ? void 0 : _f.get((_g = obj.v) === null || _g === void 0 ? void 0 : _g._mapId)) !== null && _h !== void 0 ? _h : obj.v;
        // Deserialize based on the type of object
        switch (obj.t) {
            case 'Array': // Handle arrays
                instance = nested.map((item) => SerDe.deserialize(item));
                (_j = SerDe._tempMap) === null || _j === void 0 ? void 0 : _j.set(obj.v._mapId, instance);
                return instance;
            case 'Map': // Handle maps
                instance = new Map(nested.map(([key, value]) => [SerDe.deserialize(key), SerDe.deserialize(value)]));
                (_k = SerDe._tempMap) === null || _k === void 0 ? void 0 : _k.set(obj.v._mapId, instance);
                return instance;
            case 'Set': // Handle sets
                instance = new Set(nested.map((item) => SerDe.deserialize(item)));
                (_l = SerDe._tempMap) === null || _l === void 0 ? void 0 : _l.set(obj.v._mapId, instance);
                return instance;
            default: // Handle objects
                for (const [key, value] of Object.entries(nested)) {
                    instance[key] = SerDe.deserialize(value);
                }
                if (classConstructor && SerDe.initFuncName && typeof instance[SerDe.initFuncName] === 'function') {
                    instance[SerDe.initFuncName]();
                }
        }
        // Clear the _map after deserialization is complete to free memory
        if (obj._map) {
            SerDe._map = undefined;
            SerDe._tempMap = undefined;
        }
        return instance; // Return the deserialized instance
    }
    // Method to register classes for deserialization
    static classRegistration(classes) {
        classes.forEach((x) => SerDe.classRegistry.set(x.name, x));
    }
    // Helper method to check if a value is primitive
    static isPrimitive(value) {
        return (value === null ||
            ['number', 'string', 'boolean', 'undefined', 'symbol', 'bigint'].includes(typeof value) ||
            value instanceof Date);
    }
}
exports.SerDe = SerDe;
SerDe.initFuncName = '_initFn'; // Name of the initialization function (if exists)
SerDe.id = 0; // Unique ID counter for objects
SerDe.weakMap = new WeakMap(); // WeakMap to track objects during serialization
SerDe.classRegistry = new Map([
    ['Array', Array],
    ['Set', Set],
    ['Map', Map],
]); // Registry of classes for deserialization


/***/ }),

/***/ "../../node_modules/serde-ts/dist/index.js":
/*!*************************************************!*\
  !*** ../../node_modules/serde-ts/dist/index.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// src/index.ts
__exportStar(__webpack_require__(/*! ./SerDe */ "../../node_modules/serde-ts/dist/SerDe.js"), exports);


/***/ }),

/***/ "./src/server2.ts":
/*!************************!*\
  !*** ./src/server2.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const src_1 = __webpack_require__(/*! worker-threads-manager/dist/src */ "../../node_modules/worker-threads-manager/dist/src/index.js");
const path_1 = __webpack_require__(/*! path */ "path");
const manager = new src_1.WorkerManager();
(() => __awaiter(void 0, void 0, void 0, function* () {
    let w1 = yield manager.createWorkerWithHandlers((0, path_1.resolve)(__dirname, 'worker.js'));
    console.log(1);
    yield manager.call(w1, "initializePage");
    console.log(2);
    let frameGroup = yield manager.call(w1, 'generateNextFrameGroup');
    console.log(frameGroup);
}))();


/***/ }),

/***/ "../../node_modules/worker-threads-manager/dist/src/WorkerController.js":
/*!******************************************************************************!*\
  !*** ../../node_modules/worker-threads-manager/dist/src/WorkerController.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkerController = void 0;
const worker_threads_1 = __webpack_require__(/*! worker_threads */ "worker_threads");
const serde_ts_1 = __webpack_require__(/*! serde-ts */ "../../node_modules/serde-ts/dist/index.js");
class WorkerController {
    static initialize(handlers) {
        this.handlers = handlers;
        // Send initialization acknowledgment when the worker is fully ready
        const initAck = { type: 'initialization' };
        if (worker_threads_1.parentPort) {
            worker_threads_1.parentPort.postMessage(initAck);
        }
        if (worker_threads_1.parentPort) {
            worker_threads_1.parentPort.on('message', (event) => {
                this.handleMessage(event);
            });
        }
    }
    static handleMessage(message) {
        switch (message.type) {
            case 'request':
                this.handleRequest(message);
                break;
            case 'notification':
                this.handleNotification(message);
                break;
            default:
                console.warn(`Unknown message type: ${message.type}`);
        }
    }
    static handleRequest(message) {
        const { requestId, payload } = message;
        const { methodName, args } = serde_ts_1.SerDe.deserialize(payload);
        if (this.handlers && typeof this.handlers[methodName] === 'function') {
            (async () => {
                try {
                    const result = serde_ts_1.SerDe.serialise(await this.handlers[methodName](...args));
                    const response = { type: 'response', requestId, result };
                    if (worker_threads_1.parentPort) {
                        worker_threads_1.parentPort.postMessage(response);
                    }
                }
                catch (error) {
                    const response = { type: 'response', requestId, error };
                    if (worker_threads_1.parentPort) {
                        worker_threads_1.parentPort.postMessage(response);
                    }
                }
            })();
        }
        else {
            const response = {
                type: 'response',
                requestId,
                result: new Error(`Method ${methodName} not found on handlers`)
            };
            if (worker_threads_1.parentPort) {
                worker_threads_1.parentPort.postMessage(response);
            }
        }
    }
    static handleNotification(message) {
        const { methodName, args } = message.payload;
        if (this.handlers && typeof this.handlers[methodName] === 'function') {
            try {
                this.handlers[methodName](...args);
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error(`Error handling notification: ${error.message}`);
                }
                else {
                    console.error('Error handling notification: unknown error');
                }
            }
        }
        else {
            console.warn(`Notification method ${methodName} not found on handlers`);
        }
    }
    static registerClasses(classes) {
        serde_ts_1.SerDe.classRegistration(classes);
    }
}
exports.WorkerController = WorkerController;
//# sourceMappingURL=WorkerController.js.map

/***/ }),

/***/ "../../node_modules/worker-threads-manager/dist/src/WorkerManager.js":
/*!***************************************************************************!*\
  !*** ../../node_modules/worker-threads-manager/dist/src/WorkerManager.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkerManager = void 0;
const worker_threads_1 = __webpack_require__(/*! worker_threads */ "worker_threads");
const serde_ts_1 = __webpack_require__(/*! serde-ts */ "../../node_modules/serde-ts/dist/index.js");
class WorkerManager {
    constructor(timeout = 2 ** 31 - 1) {
        this.workers = new Map();
        this.requestIdCounter = 0;
        this.workerIdCounter = 0;
        this.responseHandlers = new Map();
        this.initializationHandlers = new Map();
        this.timeout = timeout;
    }
    async createWorkerWithHandlers(workerFile) {
        const worker = new worker_threads_1.Worker(workerFile);
        const workerId = ++this.workerIdCounter;
        this.workers.set(workerId, worker);
        worker.on('message', (message) => {
            this.handleMessage(message, workerId);
        });
        return new Promise((resolve, reject) => {
            this.initializationHandlers.set(workerId, () => {
                clearTimeout(timeoutId); // Clear timeout on success
                resolve(workerId);
            });
            const timeoutId = setTimeout(() => {
                if (this.initializationHandlers.has(workerId)) {
                    this.initializationHandlers.delete(workerId);
                    reject(new Error('Worker initialization timed out'));
                }
            }, this.timeout);
        });
    }
    handleMessage(message, workerId) {
        switch (message.type) {
            case 'initialization':
                const initHandler = this.initializationHandlers.get(workerId);
                if (initHandler) {
                    initHandler();
                    this.initializationHandlers.delete(workerId);
                }
                break;
            case 'response':
                const { requestId, result } = message;
                const responseHandler = this.responseHandlers.get(requestId);
                if (responseHandler) {
                    responseHandler(serde_ts_1.SerDe.deserialize(result));
                    this.responseHandlers.delete(requestId);
                }
                break;
            case 'notification':
                // Handle notifications if necessary
                break;
            default:
                throw new Error(`Unknown message type: ${message.type}`);
        }
    }
    async call(workerId, methodName, ...args) {
        const worker = this.workers.get(workerId);
        if (!worker) {
            throw new Error(`Worker with ID ${workerId} not found`);
        }
        const requestId = ++this.requestIdCounter;
        const request = {
            type: 'request',
            requestId,
            payload: serde_ts_1.SerDe.serialise({ methodName, args })
        };
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.responseHandlers.delete(requestId);
                reject(new Error('Request timed out'));
            }, this.timeout);
            this.responseHandlers.set(requestId, (result) => {
                clearTimeout(timeoutId); // Clear timeout on success
                resolve(result);
            });
            worker.postMessage(request);
        });
    }
    sendNotification(workerId, methodName, ...args) {
        const worker = this.workers.get(workerId);
        if (!worker) {
            throw new Error(`Worker with ID ${workerId} not found`);
        }
        const notification = {
            type: 'notification',
            payload: { methodName, args }
        };
        worker.postMessage(notification);
    }
    async terminateWorker(workerId) {
        const worker = this.workers.get(workerId);
        if (worker) {
            await worker.terminate();
            this.workers.delete(workerId);
        }
    }
    registerClasses(classes) {
        serde_ts_1.SerDe.classRegistration(classes);
    }
}
exports.WorkerManager = WorkerManager;
//# sourceMappingURL=WorkerManager.js.map

/***/ }),

/***/ "../../node_modules/worker-threads-manager/dist/src/index.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/worker-threads-manager/dist/src/index.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./WorkerManager */ "../../node_modules/worker-threads-manager/dist/src/WorkerManager.js"), exports);
__exportStar(__webpack_require__(/*! ./WorkerController */ "../../node_modules/worker-threads-manager/dist/src/WorkerController.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("worker_threads");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/server2.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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eC9ub2RlX21vZHVsZXMvc2VyZGUtdHMvZGlzdC9TZXJEZS5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9zZXJkZS10cy9kaXN0L2luZGV4LmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL3NlcnZlci9zcmMvc2VydmVyMi50cyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy93b3JrZXItdGhyZWFkcy1tYW5hZ2VyL2Rpc3Qvc3JjL1dvcmtlckNvbnRyb2xsZXIuanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvd29ya2VyLXRocmVhZHMtbWFuYWdlci9kaXN0L3NyYy9Xb3JrZXJNYW5hZ2VyLmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL3dvcmtlci10aHJlYWRzLW1hbmFnZXIvZGlzdC9zcmMvaW5kZXguanMiLCJmaWxlOi8vL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJwYXRoXCIiLCJmaWxlOi8vL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJ3b3JrZXJfdGhyZWFkc1wiIiwiZmlsZTovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsImZpbGU6Ly8vd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsImZpbGU6Ly8vd2VicGFjay9zdGFydHVwIiwiZmlsZTovLy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlNlckRlID0gdm9pZCAwO1xuLy8gRnVuY3Rpb24gdG8gY2hlY2sgaWYgYSBnaXZlbiBmdW5jdGlvbiBpcyBhIGNsYXNzIGNvbnN0cnVjdG9yXG5mdW5jdGlvbiBpc0NsYXNzKGZ1bmMpIHtcbiAgICByZXR1cm4gdHlwZW9mIGZ1bmMgPT09ICdmdW5jdGlvbicgJiYgL15cXHMqY2xhc3NcXHMrLy50ZXN0KGZ1bmMudG9TdHJpbmcoKSk7XG59XG5jbGFzcyBTZXJEZSB7XG4gICAgLy8gTWV0aG9kIHRvIGhhbmRsZSBzaW1wbGUgdHlwZXMgZGlyZWN0bHlcbiAgICBzdGF0aWMgZnJvbVNpbXBsZShvYmopIHtcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIERhdGUgfHwgdHlwZW9mIG9iaiA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIG9iaiA9PT0gJ251bWJlcicgfHwgdHlwZW9mIG9iaiA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8vIE1ldGhvZCB0byBzZXQgZXhjbHVzaXZlIGNsYXNzZXMgZm9yIHNlcmlhbGl6YXRpb25cbiAgICBzdGF0aWMgc2V0RXhjbHVzaXZlbHkobGlzdCkge1xuICAgICAgICBTZXJEZS5vbmx5ID0gbmV3IFNldChbLi4ubGlzdCwgQXJyYXksIE1hcCwgU2V0XSk7XG4gICAgfVxuICAgIC8vIE1haW4gc2VyaWFsaXphdGlvbiBtZXRob2RcbiAgICBzdGF0aWMgc2VyaWFsaXNlKG9iaiwgdmlzaXRlZCA9IG5ldyBNYXAoKSwgX21hcCA9IG5ldyBNYXAoKSwgZGVwdGggPSAwLCBwYXJlbnQpIHtcbiAgICAgICAgdmFyIF9hLCBfYiwgX2MsIF9kLCBfZTtcbiAgICAgICAgaWYgKHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnIHx8IG9iaiA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIC8vIElmIHRoZSBvYmplY3QgaXMgYSBjbGFzcyBhbmQgaXMgbm90IGluIHRoZSBleGNsdXNpdmUgbGlzdCwgc2tpcCBzZXJpYWxpemF0aW9uXG4gICAgICAgIGlmICgoKF9hID0gU2VyRGUub25seSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnNpemUpICYmIGlzQ2xhc3Mob2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLmNvbnN0cnVjdG9yKSAmJiAhU2VyRGUub25seS5oYXMob2JqLmNvbnN0cnVjdG9yKSlcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBEYXRlKVxuICAgICAgICAgICAgcmV0dXJuIHsgdDogJ0RhdGUnLCB2OiBvYmoudmFsdWVPZigpIH07XG4gICAgICAgIGxldCBtYXliZVNpbXBsZSA9IFNlckRlLmZyb21TaW1wbGUob2JqKTtcbiAgICAgICAgaWYgKG1heWJlU2ltcGxlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICByZXR1cm4gbWF5YmVTaW1wbGU7XG4gICAgICAgIGlmICh2aXNpdGVkLmhhcyhvYmopKSB7XG4gICAgICAgICAgICB2aXNpdGVkLmdldChvYmopLnRpbWVzKys7XG4gICAgICAgICAgICByZXR1cm4geyB0OiAoX2IgPSBvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmouY29uc3RydWN0b3IpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5uYW1lLCB2OiB7IF9tYXBJZDogU2VyRGUud2Vha01hcC5nZXQob2JqKSB9IH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICAgICAgcmV0dXJuIHsgdDogJ2Z1bmN0aW9uJywgdjogb2JqLm5hbWUgfTtcbiAgICAgICAgaWYgKHBhcmVudClcbiAgICAgICAgICAgIHZpc2l0ZWQuc2V0KG9iaiwgeyB0aW1lczogMSwgcGFyZW50IH0pO1xuICAgICAgICBsZXQgaWQgPSAoX2MgPSBTZXJEZS53ZWFrTWFwLmdldChvYmopKSAhPT0gbnVsbCAmJiBfYyAhPT0gdm9pZCAwID8gX2MgOiBTZXJEZS5pZCsrO1xuICAgICAgICBTZXJEZS53ZWFrTWFwLnNldChvYmosIGlkKTtcbiAgICAgICAgLy8gSGFuZGxlIE1hcCBvYmplY3RzXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIGxldCBzZXJpYWxpc2VkID0gbmV3IEFycmF5KG9iai5zaXplKTtcbiAgICAgICAgICAgIF9tYXAuc2V0KGlkLCBzZXJpYWxpc2VkKTtcbiAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgIG9iai5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgc2VyaWFsaXNlZFtpXSA9IFtcbiAgICAgICAgICAgICAgICAgICAgU2VyRGUuc2VyaWFsaXNlKGtleSwgdmlzaXRlZCwgX21hcCwgZGVwdGggKyAxLCB7IG9iajogc2VyaWFsaXNlZCwga2V5OiBbaSwgMF0gfSksXG4gICAgICAgICAgICAgICAgICAgIFNlckRlLnNlcmlhbGlzZSh2YWx1ZSwgdmlzaXRlZCwgX21hcCwgZGVwdGggKyAxLCB7IG9iajogc2VyaWFsaXNlZCwga2V5OiBbaSwgMV0gfSksXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB7IHQ6IG9iai5jb25zdHJ1Y3Rvci5uYW1lLCB2OiBzZXJpYWxpc2VkIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gSGFuZGxlIFNldCBhbmQgQXJyYXkgb2JqZWN0c1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgU2V0IHx8IG9iaiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBsZXQgc2VyaWFsaXNlZCA9IEFycmF5KG9iaiBpbnN0YW5jZW9mIFNldCA/IG9iai5zaXplIDogb2JqLmxlbmd0aCk7XG4gICAgICAgICAgICBfbWFwLnNldChpZCwgc2VyaWFsaXNlZCk7XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICBvYmouZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBzZXJpYWxpc2VkW2ldID0gU2VyRGUuc2VyaWFsaXNlKHZhbHVlLCB2aXNpdGVkLCBfbWFwLCBkZXB0aCArIDEsIHsgb2JqOiBzZXJpYWxpc2VkLCBrZXk6IGkgfSk7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4geyB0OiBvYmouY29uc3RydWN0b3IubmFtZSwgdjogc2VyaWFsaXNlZCB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEhhbmRsZSBnZW5lcmljIG9iamVjdHNcbiAgICAgICAgbGV0IHNlcmlhbGlzZWQgPSB7fTtcbiAgICAgICAgX21hcC5zZXQoaWQsIHNlcmlhbGlzZWQpO1xuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgICAgICAgICAgc2VyaWFsaXNlZFtrZXldID0gU2VyRGUuc2VyaWFsaXNlKHZhbHVlLCB2aXNpdGVkLCBfbWFwLCBkZXB0aCArIDEsIHsgb2JqOiBzZXJpYWxpc2VkLCBrZXkgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgd2UgYXJlIGF0IHRoZSB0b3AgbGV2ZWwsIGhhbmRsZSBjaXJjdWxhciByZWZlcmVuY2VzIGFuZCBtdWx0aXBsZSBpbnN0YW5jZXNcbiAgICAgICAgaWYgKGRlcHRoID09PSAwKSB7XG4gICAgICAgICAgICBsZXQgcmVjdXJzaW9uVmlzaXRlZCA9IEFycmF5LmZyb20odmlzaXRlZClcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChbXywgdmFsXSkgPT4gdmFsLnRpbWVzID4gMSlcbiAgICAgICAgICAgICAgICAubWFwKChbb2JqLCB2YWxdKSA9PiBbU2VyRGUud2Vha01hcC5nZXQob2JqKSwgdmFsXSk7IC8vIEV4cGxpY2l0bHkgY2FzdCBpZCB0byBudW1iZXJcbiAgICAgICAgICAgIHJlY3Vyc2lvblZpc2l0ZWQuZm9yRWFjaCgoW2lkLCB2YWxdKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbC5wYXJlbnQua2V5IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgICAgICB2YWwucGFyZW50Lm9ialt2YWwucGFyZW50LmtleVswXV1bdmFsLnBhcmVudC5rZXlbMV1dLnYgPSB7IF9tYXBJZDogaWQgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAgICAgdmFsLnBhcmVudC5vYmpbdmFsLnBhcmVudC5rZXldLnYgPSB7IF9tYXBJZDogaWQgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEF0dGFjaCB0aGUgX21hcCBmb3Igc2VyaWFsaXphdGlvbiByZXN1bHRcbiAgICAgICAgICAgIHJldHVybiB7IHQ6IChfZCA9IG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9iai5jb25zdHJ1Y3RvcikgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLm5hbWUsIHY6IHNlcmlhbGlzZWQsIF9tYXA6IHJlY3Vyc2lvblZpc2l0ZWQubWFwKCh4KSA9PiBbeFswXSwgX21hcC5nZXQoeFswXSldKSB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHQ6IChfZSA9IG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9iai5jb25zdHJ1Y3RvcikgPT09IG51bGwgfHwgX2UgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9lLm5hbWUsIHY6IHNlcmlhbGlzZWQgfTtcbiAgICB9XG4gICAgLy8gTWFpbiBkZXNlcmlhbGl6YXRpb24gbWV0aG9kXG4gICAgc3RhdGljIGRlc2VyaWFsaXplKG9iaikge1xuICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2QsIF9lLCBfZiwgX2csIF9oLCBfaiwgX2ssIF9sO1xuICAgICAgICBpZiAob2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgaWYgKChvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmoudCkgPT09ICdEYXRlJylcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShvYmoudik7XG4gICAgICAgIC8vIElmIG9iaiBpcyBhIHByaW1pdGl2ZSwgcmV0dXJuIGl0IGRpcmVjdGx5ICh3aXRoIERhdGUgaGFuZGxpbmcpXG4gICAgICAgIGlmIChTZXJEZS5pc1ByaW1pdGl2ZShvYmopKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqIGluc3RhbmNlb2YgRGF0ZSA/IG5ldyBEYXRlKG9iaikgOiBvYmo7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9iai50ID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgcmV0dXJuIChfYSA9IFNlckRlLmNsYXNzUmVnaXN0cnkuZ2V0KG9iai52KSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDoge307XG4gICAgICAgIC8vIEhhbmRsZXMgdGhlIHJlc3RvcmF0aW9uIG9mIF9tYXAgZm9yIG9iamVjdCByZWZlcmVuY2VzIGlmIGl0IGV4aXN0c1xuICAgICAgICBpZiAob2JqLl9tYXApIHtcbiAgICAgICAgICAgIFNlckRlLl9tYXAgPSBuZXcgTWFwKG9iai5fbWFwKTtcbiAgICAgICAgICAgIFNlckRlLl90ZW1wTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJldHJpZXZlIHRoZSBjbGFzcyBjb25zdHJ1Y3RvciBpZiBhdmFpbGFibGVcbiAgICAgICAgY29uc3QgY2xhc3NDb25zdHJ1Y3RvciA9IFNlckRlLmNsYXNzUmVnaXN0cnkuZ2V0KG9iai50KTtcbiAgICAgICAgbGV0IGluc3RhbmNlO1xuICAgICAgICBpZiAoKChfYiA9IG9iai52KSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuX21hcElkKSAmJiAoKF9jID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9jID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYy5oYXMob2JqLnYuX21hcElkKSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoX2QgPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLmdldChvYmoudi5fbWFwSWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW5zdGFuY2UgPSBjbGFzc0NvbnN0cnVjdG9yID8gT2JqZWN0LmNyZWF0ZShjbGFzc0NvbnN0cnVjdG9yLnByb3RvdHlwZSkgOiB7fTtcbiAgICAgICAgICAgIChfZSA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Uuc2V0KG9iai52Ll9tYXBJZCwgaW5zdGFuY2UpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBuZXN0ZWQgPSAoX2ggPSAoX2YgPSBTZXJEZS5fbWFwKSA9PT0gbnVsbCB8fCBfZiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2YuZ2V0KChfZyA9IG9iai52KSA9PT0gbnVsbCB8fCBfZyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2cuX21hcElkKSkgIT09IG51bGwgJiYgX2ggIT09IHZvaWQgMCA/IF9oIDogb2JqLnY7XG4gICAgICAgIC8vIERlc2VyaWFsaXplIGJhc2VkIG9uIHRoZSB0eXBlIG9mIG9iamVjdFxuICAgICAgICBzd2l0Y2ggKG9iai50KSB7XG4gICAgICAgICAgICBjYXNlICdBcnJheSc6IC8vIEhhbmRsZSBhcnJheXNcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5lc3RlZC5tYXAoKGl0ZW0pID0+IFNlckRlLmRlc2VyaWFsaXplKGl0ZW0pKTtcbiAgICAgICAgICAgICAgICAoX2ogPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2ogPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9qLnNldChvYmoudi5fbWFwSWQsIGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgICAgICBjYXNlICdNYXAnOiAvLyBIYW5kbGUgbWFwc1xuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IE1hcChuZXN0ZWQubWFwKChba2V5LCB2YWx1ZV0pID0+IFtTZXJEZS5kZXNlcmlhbGl6ZShrZXkpLCBTZXJEZS5kZXNlcmlhbGl6ZSh2YWx1ZSldKSk7XG4gICAgICAgICAgICAgICAgKF9rID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9rID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfay5zZXQob2JqLnYuX21hcElkLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICAgICAgY2FzZSAnU2V0JzogLy8gSGFuZGxlIHNldHNcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBTZXQobmVzdGVkLm1hcCgoaXRlbSkgPT4gU2VyRGUuZGVzZXJpYWxpemUoaXRlbSkpKTtcbiAgICAgICAgICAgICAgICAoX2wgPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2wgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9sLnNldChvYmoudi5fbWFwSWQsIGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgICAgICBkZWZhdWx0OiAvLyBIYW5kbGUgb2JqZWN0c1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG5lc3RlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Vba2V5XSA9IFNlckRlLmRlc2VyaWFsaXplKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNsYXNzQ29uc3RydWN0b3IgJiYgU2VyRGUuaW5pdEZ1bmNOYW1lICYmIHR5cGVvZiBpbnN0YW5jZVtTZXJEZS5pbml0RnVuY05hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW1NlckRlLmluaXRGdW5jTmFtZV0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2xlYXIgdGhlIF9tYXAgYWZ0ZXIgZGVzZXJpYWxpemF0aW9uIGlzIGNvbXBsZXRlIHRvIGZyZWUgbWVtb3J5XG4gICAgICAgIGlmIChvYmouX21hcCkge1xuICAgICAgICAgICAgU2VyRGUuX21hcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIFNlckRlLl90ZW1wTWFwID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTsgLy8gUmV0dXJuIHRoZSBkZXNlcmlhbGl6ZWQgaW5zdGFuY2VcbiAgICB9XG4gICAgLy8gTWV0aG9kIHRvIHJlZ2lzdGVyIGNsYXNzZXMgZm9yIGRlc2VyaWFsaXphdGlvblxuICAgIHN0YXRpYyBjbGFzc1JlZ2lzdHJhdGlvbihjbGFzc2VzKSB7XG4gICAgICAgIGNsYXNzZXMuZm9yRWFjaCgoeCkgPT4gU2VyRGUuY2xhc3NSZWdpc3RyeS5zZXQoeC5uYW1lLCB4KSk7XG4gICAgfVxuICAgIC8vIEhlbHBlciBtZXRob2QgdG8gY2hlY2sgaWYgYSB2YWx1ZSBpcyBwcmltaXRpdmVcbiAgICBzdGF0aWMgaXNQcmltaXRpdmUodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuICh2YWx1ZSA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgWydudW1iZXInLCAnc3RyaW5nJywgJ2Jvb2xlYW4nLCAndW5kZWZpbmVkJywgJ3N5bWJvbCcsICdiaWdpbnQnXS5pbmNsdWRlcyh0eXBlb2YgdmFsdWUpIHx8XG4gICAgICAgICAgICB2YWx1ZSBpbnN0YW5jZW9mIERhdGUpO1xuICAgIH1cbn1cbmV4cG9ydHMuU2VyRGUgPSBTZXJEZTtcblNlckRlLmluaXRGdW5jTmFtZSA9ICdfaW5pdEZuJzsgLy8gTmFtZSBvZiB0aGUgaW5pdGlhbGl6YXRpb24gZnVuY3Rpb24gKGlmIGV4aXN0cylcblNlckRlLmlkID0gMDsgLy8gVW5pcXVlIElEIGNvdW50ZXIgZm9yIG9iamVjdHNcblNlckRlLndlYWtNYXAgPSBuZXcgV2Vha01hcCgpOyAvLyBXZWFrTWFwIHRvIHRyYWNrIG9iamVjdHMgZHVyaW5nIHNlcmlhbGl6YXRpb25cblNlckRlLmNsYXNzUmVnaXN0cnkgPSBuZXcgTWFwKFtcbiAgICBbJ0FycmF5JywgQXJyYXldLFxuICAgIFsnU2V0JywgU2V0XSxcbiAgICBbJ01hcCcsIE1hcF0sXG5dKTsgLy8gUmVnaXN0cnkgb2YgY2xhc3NlcyBmb3IgZGVzZXJpYWxpemF0aW9uXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19leHBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2V4cG9ydFN0YXIpIHx8IGZ1bmN0aW9uKG0sIGV4cG9ydHMpIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4cG9ydHMsIHApKSBfX2NyZWF0ZUJpbmRpbmcoZXhwb3J0cywgbSwgcCk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLy8gc3JjL2luZGV4LnRzXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vU2VyRGVcIiksIGV4cG9ydHMpO1xuIiwiaW1wb3J0IHtXb3JrZXJNYW5hZ2VyfSBmcm9tIFwid29ya2VyLXRocmVhZHMtbWFuYWdlci9kaXN0L3NyY1wiO1xuaW1wb3J0IHtIYW5kbGVyc30gZnJvbSBcIi4vd29ya2VyXCI7XG5pbXBvcnQge3Jlc29sdmV9IGZyb20gXCJwYXRoXCI7XG5cbmNvbnN0IG1hbmFnZXIgPSBuZXcgV29ya2VyTWFuYWdlcjxIYW5kbGVycz4oKTtcbihhc3luYyAoKT0+e1xuICAgIGxldCB3MSA9IGF3YWl0IG1hbmFnZXIuY3JlYXRlV29ya2VyV2l0aEhhbmRsZXJzKHJlc29sdmUoX19kaXJuYW1lLCAnd29ya2VyLmpzJykpXG4gICAgY29uc29sZS5sb2coMSlcbiAgICBhd2FpdCBtYW5hZ2VyLmNhbGwodzEsIFwiaW5pdGlhbGl6ZVBhZ2VcIilcbiAgICBjb25zb2xlLmxvZygyKVxuICAgIGxldCBmcmFtZUdyb3VwID0gYXdhaXQgbWFuYWdlci5jYWxsKHcxLCAnZ2VuZXJhdGVOZXh0RnJhbWVHcm91cCcpXG4gICAgY29uc29sZS5sb2coZnJhbWVHcm91cClcblxufSkoKVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuV29ya2VyQ29udHJvbGxlciA9IHZvaWQgMDtcbmNvbnN0IHdvcmtlcl90aHJlYWRzXzEgPSByZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIik7XG5jb25zdCBzZXJkZV90c18xID0gcmVxdWlyZShcInNlcmRlLXRzXCIpO1xuY2xhc3MgV29ya2VyQ29udHJvbGxlciB7XG4gICAgc3RhdGljIGluaXRpYWxpemUoaGFuZGxlcnMpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVycyA9IGhhbmRsZXJzO1xuICAgICAgICAvLyBTZW5kIGluaXRpYWxpemF0aW9uIGFja25vd2xlZGdtZW50IHdoZW4gdGhlIHdvcmtlciBpcyBmdWxseSByZWFkeVxuICAgICAgICBjb25zdCBpbml0QWNrID0geyB0eXBlOiAnaW5pdGlhbGl6YXRpb24nIH07XG4gICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShpbml0QWNrKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAod29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0KSB7XG4gICAgICAgICAgICB3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQub24oJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZU1lc3NhZ2UoZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAncmVxdWVzdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0KG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbm90aWZpY2F0aW9uJzpcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZU5vdGlmaWNhdGlvbihtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBVbmtub3duIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGhhbmRsZVJlcXVlc3QobWVzc2FnZSkge1xuICAgICAgICBjb25zdCB7IHJlcXVlc3RJZCwgcGF5bG9hZCB9ID0gbWVzc2FnZTtcbiAgICAgICAgY29uc3QgeyBtZXRob2ROYW1lLCBhcmdzIH0gPSBzZXJkZV90c18xLlNlckRlLmRlc2VyaWFsaXplKHBheWxvYWQpO1xuICAgICAgICBpZiAodGhpcy5oYW5kbGVycyAmJiB0eXBlb2YgdGhpcy5oYW5kbGVyc1ttZXRob2ROYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBzZXJkZV90c18xLlNlckRlLnNlcmlhbGlzZShhd2FpdCB0aGlzLmhhbmRsZXJzW21ldGhvZE5hbWVdKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB7IHR5cGU6ICdyZXNwb25zZScsIHJlcXVlc3RJZCwgcmVzdWx0IH07XG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geyB0eXBlOiAncmVzcG9uc2UnLCByZXF1ZXN0SWQsIGVycm9yIH07XG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3Jlc3BvbnNlJyxcbiAgICAgICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICAgICAgcmVzdWx0OiBuZXcgRXJyb3IoYE1ldGhvZCAke21ldGhvZE5hbWV9IG5vdCBmb3VuZCBvbiBoYW5kbGVyc2ApXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydCkge1xuICAgICAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGhhbmRsZU5vdGlmaWNhdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IHsgbWV0aG9kTmFtZSwgYXJncyB9ID0gbWVzc2FnZS5wYXlsb2FkO1xuICAgICAgICBpZiAodGhpcy5oYW5kbGVycyAmJiB0eXBlb2YgdGhpcy5oYW5kbGVyc1ttZXRob2ROYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZXJzW21ldGhvZE5hbWVdKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaGFuZGxpbmcgbm90aWZpY2F0aW9uOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBoYW5kbGluZyBub3RpZmljYXRpb246IHVua25vd24gZXJyb3InKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYE5vdGlmaWNhdGlvbiBtZXRob2QgJHttZXRob2ROYW1lfSBub3QgZm91bmQgb24gaGFuZGxlcnNgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgcmVnaXN0ZXJDbGFzc2VzKGNsYXNzZXMpIHtcbiAgICAgICAgc2VyZGVfdHNfMS5TZXJEZS5jbGFzc1JlZ2lzdHJhdGlvbihjbGFzc2VzKTtcbiAgICB9XG59XG5leHBvcnRzLldvcmtlckNvbnRyb2xsZXIgPSBXb3JrZXJDb250cm9sbGVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9V29ya2VyQ29udHJvbGxlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuV29ya2VyTWFuYWdlciA9IHZvaWQgMDtcbmNvbnN0IHdvcmtlcl90aHJlYWRzXzEgPSByZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIik7XG5jb25zdCBzZXJkZV90c18xID0gcmVxdWlyZShcInNlcmRlLXRzXCIpO1xuY2xhc3MgV29ya2VyTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IodGltZW91dCA9IDIgKiogMzEgLSAxKSB7XG4gICAgICAgIHRoaXMud29ya2VycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5yZXF1ZXN0SWRDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy53b3JrZXJJZENvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gdGltZW91dDtcbiAgICB9XG4gICAgYXN5bmMgY3JlYXRlV29ya2VyV2l0aEhhbmRsZXJzKHdvcmtlckZpbGUpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gbmV3IHdvcmtlcl90aHJlYWRzXzEuV29ya2VyKHdvcmtlckZpbGUpO1xuICAgICAgICBjb25zdCB3b3JrZXJJZCA9ICsrdGhpcy53b3JrZXJJZENvdW50ZXI7XG4gICAgICAgIHRoaXMud29ya2Vycy5zZXQod29ya2VySWQsIHdvcmtlcik7XG4gICAgICAgIHdvcmtlci5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1lc3NhZ2UobWVzc2FnZSwgd29ya2VySWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5zZXQod29ya2VySWQsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTsgLy8gQ2xlYXIgdGltZW91dCBvbiBzdWNjZXNzXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh3b3JrZXJJZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuaGFzKHdvcmtlcklkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuZGVsZXRlKHdvcmtlcklkKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignV29ya2VyIGluaXRpYWxpemF0aW9uIHRpbWVkIG91dCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzLnRpbWVvdXQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaGFuZGxlTWVzc2FnZShtZXNzYWdlLCB3b3JrZXJJZCkge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnaW5pdGlhbGl6YXRpb24nOlxuICAgICAgICAgICAgICAgIGNvbnN0IGluaXRIYW5kbGVyID0gdGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzLmdldCh3b3JrZXJJZCk7XG4gICAgICAgICAgICAgICAgaWYgKGluaXRIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRIYW5kbGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5kZWxldGUod29ya2VySWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Jlc3BvbnNlJzpcbiAgICAgICAgICAgICAgICBjb25zdCB7IHJlcXVlc3RJZCwgcmVzdWx0IH0gPSBtZXNzYWdlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlSGFuZGxlciA9IHRoaXMucmVzcG9uc2VIYW5kbGVycy5nZXQocmVxdWVzdElkKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlSGFuZGxlcihzZXJkZV90c18xLlNlckRlLmRlc2VyaWFsaXplKHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMuZGVsZXRlKHJlcXVlc3RJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbm90aWZpY2F0aW9uJzpcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgbm90aWZpY2F0aW9ucyBpZiBuZWNlc3NhcnlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgY2FsbCh3b3JrZXJJZCwgbWV0aG9kTmFtZSwgLi4uYXJncykge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSB0aGlzLndvcmtlcnMuZ2V0KHdvcmtlcklkKTtcbiAgICAgICAgaWYgKCF3b3JrZXIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV29ya2VyIHdpdGggSUQgJHt3b3JrZXJJZH0gbm90IGZvdW5kYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVxdWVzdElkID0gKyt0aGlzLnJlcXVlc3RJZENvdW50ZXI7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICB0eXBlOiAncmVxdWVzdCcsXG4gICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICBwYXlsb2FkOiBzZXJkZV90c18xLlNlckRlLnNlcmlhbGlzZSh7IG1ldGhvZE5hbWUsIGFyZ3MgfSlcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzcG9uc2VIYW5kbGVycy5kZWxldGUocmVxdWVzdElkKTtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdSZXF1ZXN0IHRpbWVkIG91dCcpKTtcbiAgICAgICAgICAgIH0sIHRoaXMudGltZW91dCk7XG4gICAgICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMuc2V0KHJlcXVlc3RJZCwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpOyAvLyBDbGVhciB0aW1lb3V0IG9uIHN1Y2Nlc3NcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShyZXF1ZXN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNlbmROb3RpZmljYXRpb24od29ya2VySWQsIG1ldGhvZE5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gdGhpcy53b3JrZXJzLmdldCh3b3JrZXJJZCk7XG4gICAgICAgIGlmICghd29ya2VyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdvcmtlciB3aXRoIElEICR7d29ya2VySWR9IG5vdCBmb3VuZGApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdub3RpZmljYXRpb24nLFxuICAgICAgICAgICAgcGF5bG9hZDogeyBtZXRob2ROYW1lLCBhcmdzIH1cbiAgICAgICAgfTtcbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKG5vdGlmaWNhdGlvbik7XG4gICAgfVxuICAgIGFzeW5jIHRlcm1pbmF0ZVdvcmtlcih3b3JrZXJJZCkge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSB0aGlzLndvcmtlcnMuZ2V0KHdvcmtlcklkKTtcbiAgICAgICAgaWYgKHdvcmtlcikge1xuICAgICAgICAgICAgYXdhaXQgd29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgICAgICAgdGhpcy53b3JrZXJzLmRlbGV0ZSh3b3JrZXJJZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVnaXN0ZXJDbGFzc2VzKGNsYXNzZXMpIHtcbiAgICAgICAgc2VyZGVfdHNfMS5TZXJEZS5jbGFzc1JlZ2lzdHJhdGlvbihjbGFzc2VzKTtcbiAgICB9XG59XG5leHBvcnRzLldvcmtlck1hbmFnZXIgPSBXb3JrZXJNYW5hZ2VyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9V29ya2VyTWFuYWdlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19leHBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2V4cG9ydFN0YXIpIHx8IGZ1bmN0aW9uKG0sIGV4cG9ydHMpIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4cG9ydHMsIHApKSBfX2NyZWF0ZUJpbmRpbmcoZXhwb3J0cywgbSwgcCk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL1dvcmtlck1hbmFnZXJcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL1dvcmtlckNvbnRyb2xsZXJcIiksIGV4cG9ydHMpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGF0aFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvc2VydmVyMi50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
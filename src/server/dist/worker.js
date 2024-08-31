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

/***/ "./src/PointTracker.ts":
/*!*****************************!*\
  !*** ./src/PointTracker.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PointTracker = void 0;
const chalk_1 = __importDefault(__webpack_require__(/*! chalk */ "../../node_modules/chalk/source/index.js"));
class PointTracker {
    constructor() {
        this.points = new Map();
        this.lastTimestamps = new Map();
        this.lastPoint = null;
    }
    point(pointName, checkPoints) {
        const currentTime = Date.now();
        if (!this.points.has(pointName)) {
            this.points.set(pointName, new PointData());
        }
        const currentPointData = this.points.get(pointName);
        if (this.lastTimestamps.has(pointName)) {
            const timeSinceLastVisit = currentTime - this.lastTimestamps.get(pointName);
            currentPointData.updateIterationTime(timeSinceLastVisit);
        }
        currentPointData.incrementVisits();
        if (checkPoints) {
            checkPoints.forEach((checkPointName) => {
                if (this.lastTimestamps.has(checkPointName)) {
                    const timeSpent = currentTime - this.lastTimestamps.get(checkPointName);
                    currentPointData.updateTransition(checkPointName, timeSpent);
                }
            });
        }
        if (this.lastPoint !== null && this.lastPoint !== pointName) {
            const timeSpent = currentTime - this.lastTimestamps.get(this.lastPoint);
            currentPointData.updateTransition(this.lastPoint + " (previous)", timeSpent);
        }
        this.lastTimestamps.set(pointName, currentTime);
        this.lastPoint = pointName;
    }
    report(filter = {}) {
        const reportLines = [];
        const minTimeFilter = filter.minTime || 0;
        const minVisitsFilter = filter.visits || 0;
        const requireDependencies = filter.requireDependencies || false;
        // Фильтрация точек
        this.points.forEach((data, point) => {
            const avgTime = data.averageIterationTime();
            if (avgTime >= minTimeFilter && data.totalVisits >= minVisitsFilter) {
                // Фильтрация переходов
                const filteredTransitions = new Map();
                data.transitions.forEach((transitionData, fromPoint) => {
                    if (transitionData.averageTime() >= minTimeFilter) {
                        filteredTransitions.set(fromPoint, transitionData);
                    }
                });
                // Добавление в отчет только если есть переходы или не требуется обязательных зависимостей
                if (!requireDependencies || filteredTransitions.size > 0) {
                    this.addPointWithFilteredTransitions(reportLines, point, data, filteredTransitions);
                }
            }
        });
        return reportLines.join("\n");
    }
    addPointWithFilteredTransitions(reportLines, point, data, filteredTransitions) {
        reportLines.push(`${chalk_1.default.green(point)}: Visits=${data.totalVisits}, AvgTime=${chalk_1.default.red(data.averageIterationTime().toFixed(2))}ms`);
        filteredTransitions.forEach((transitionData, fromPoint) => {
            reportLines.push(`  ${chalk_1.default.cyan(fromPoint)} -> ${chalk_1.default.green(point)}: Count=${transitionData.count}, Min=${transitionData.minTime.toFixed(2)}ms, Max=${transitionData.maxTime.toFixed(2)}ms, Avg=${chalk_1.default.red(transitionData.averageTime().toFixed(2))}ms`);
        });
    }
}
exports.PointTracker = PointTracker;
class PointData {
    constructor() {
        this.totalVisits = 0;
        this.totalIterationTime = 0;
        this.transitions = new Map();
    }
    incrementVisits() {
        this.totalVisits += 1;
    }
    updateIterationTime(timeSpent) {
        this.totalIterationTime += timeSpent;
    }
    averageIterationTime() {
        return this.totalVisits > 1 ? this.totalIterationTime / (this.totalVisits - 1) : 0;
    }
    updateTransition(fromPoint, timeSpent) {
        if (!this.transitions.has(fromPoint)) {
            this.transitions.set(fromPoint, new TransitionData());
        }
        const transitionData = this.transitions.get(fromPoint);
        transitionData.update(timeSpent);
    }
}
class TransitionData {
    constructor() {
        this.count = 0;
        this.totalTime = 0;
        this.minTime = Infinity;
        this.maxTime = 0;
    }
    update(timeSpent) {
        this.count += 1;
        this.totalTime += timeSpent;
        this.minTime = Math.min(this.minTime, timeSpent);
        this.maxTime = Math.max(this.maxTime, timeSpent);
    }
    averageTime() {
        return this.count > 0 ? this.totalTime / this.count : 0;
    }
}


/***/ }),

/***/ "./src/mutex.ts":
/*!**********************!*\
  !*** ./src/mutex.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
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
    tryLock(logMsg) {
        if (this._lock) {
            // Если мьютекс уже залочен, возвращаем false
            return false;
        }
        else {
            // Если мьютекс свободен, лочим его и возвращаем true
            this._lock = true;
            if (Mutex.logAllowed && logMsg)
                console.log("Mutex tryLock successful: ", logMsg);
            return true;
        }
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


/***/ }),

/***/ "./src/worker.ts":
/*!***********************!*\
  !*** ./src/worker.ts ***!
  \***********************/
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Handlers = void 0;
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const playwright_1 = __webpack_require__(/*! playwright */ "playwright");
const ws_1 = __importDefault(__webpack_require__(/*! ws */ "ws"));
const ws_2 = __webpack_require__(/*! ws */ "ws");
const mutex_1 = __webpack_require__(/*! ./mutex */ "./src/mutex.ts");
const PointTracker_1 = __webpack_require__(/*! ./PointTracker */ "./src/PointTracker.ts");
const src_1 = __webpack_require__(/*! worker-threads-manager/dist/src */ "../../node_modules/worker-threads-manager/dist/src/index.js");
class Handlers {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.wss = null;
        this.frameRequestMutex = new mutex_1.Mutex();
        this.tracker = new PointTracker_1.PointTracker();
        this.resolveFunc = null;
        this.clients = []; // Массив для хранения активных соединений
    }
    initializePage() {
        return __awaiter(this, void 0, void 0, function* () {
            this.tracker.point('initialization-start');
            try {
                this.browser = yield playwright_1.webkit.launch();
                this.context = yield this.browser.newContext();
                yield this.createNewPage();
                this.tracker.point('initialization-end', ['initialization-start']);
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    createNewPage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.tracker.point('page-creation-start');
                this.page = yield this.context.newPage();
                const filePath = path_1.default.join(__dirname, '../../../src/render/dist/index.html');
                this.tracker.point('page-loading-start');
                yield this.page.goto(`file://${filePath}`, { waitUntil: 'load' });
                this.tracker.point('page-loading-end', ['page-loading-start']);
                this.page.on('console', (msg) => __awaiter(this, void 0, void 0, function* () {
                    const msgArgs = msg.args();
                    try {
                        const logValues = yield Promise.all(msgArgs.map((arg) => __awaiter(this, void 0, void 0, function* () { return yield arg.jsonValue(); })));
                        console.log("::", ...logValues);
                    }
                    catch (e) {
                        console.error("Error logging console output:", e);
                    }
                }));
                console.log('New page loaded');
                this.tracker.point('page-creation-end', ['page-creation-start']);
                yield this.initializeWebSocketAndWaitForOpen();
            }
            catch (error) {
                console.error('Error creating or loading new page:', error);
                this.tracker.point('page-creation-error');
            }
        });
    }
    initializeWebSocketAndWaitForOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const wss = new ws_2.Server({ port: 8081 });
                    this.wss = wss;
                    // Флаг, чтобы отследить, разрешён ли уже промис
                    let isResolved = false;
                    wss.on('connection', (ws) => {
                        console.log('WebSocket connection opened');
                        // Добавляем новое соединение в массив клиентов
                        this.clients.push(ws);
                        // Отправляем команду для инициализации элементов
                        ws.send(JSON.stringify({ command: 'initializeElements' }));
                        // Обрабатываем сообщения
                        ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                            yield this.handleWebSocketMessage({ data: message });
                        }));
                        // Удаляем закрытое соединение из массива клиентов
                        ws.on('close', () => {
                            console.log('WebSocket connection closed');
                            this.clients = this.clients.filter(client => client !== ws);
                        });
                        // Обрабатываем ошибки
                        ws.on('error', (error) => {
                            console.error('WebSocket error:', error.message);
                            this.tracker.point('error-occurred');
                        });
                        // Разрешаем промис после первого успешного подключения
                        if (!isResolved) {
                            isResolved = true;
                            resolve();
                        }
                    });
                    console.log('WebSocket server is running on ws://localhost:8081');
                }
                catch (error) {
                    console.error('Failed to start WebSocket server:', error);
                    reject(error); // Reject the promise if there's an error
                }
            });
        });
    }
    handleWebSocketMessage(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = JSON.parse(event.data.toString());
            if (message.command === 'loadSnapshot' && this.resolveFunc) {
                this.resolveFunc(message.value);
                this.resolveFunc = null;
            }
            if (message.frameGroup) {
                this.tracker.point('generate-next-group-end', ['generate-next-group-start']);
                const frameGroup = message.frameGroup;
                if (this.page) {
                    this.tracker.point('resize-start');
                    yield this.page.setViewportSize({ width: frameGroup.width, height: frameGroup.totalHeight });
                    this.tracker.point('resize-end', ['resize-start']);
                    this.lastTime = frameGroup.startTime + frameGroup.frameInterval * frameGroup.frameCount;
                    this.tracker.point('render-start');
                    yield this.captureScreenshot(frameGroup);
                    this.tracker.point('render-end', ['render-start']);
                    this.frameRequestMutex.unlock('render-end');
                }
                else {
                    console.log('Page is not available');
                }
            }
        });
    }
    captureScreenshot(frameGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const maxRetries = 5;
            const delayBetweenRetries = 10;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    this.tracker.point('screenshot-attempt-start');
                    const { totalHeight, width } = frameGroup;
                    if (this.page) {
                        this.tracker.point('evaluate-start');
                        yield this.page.evaluate((totalHeight) => {
                            const container = document.getElementById('matrix-container');
                            if (container) {
                                container.style.height = `${totalHeight}px`;
                            }
                        }, totalHeight);
                        this.tracker.point('evaluate-end', ['evaluate-start']);
                        this.tracker.point('selector-wait-start');
                        const elementHandle = yield this.page.waitForSelector('#matrix-container', { state: 'visible' });
                        this.tracker.point('selector-wait-end', ['selector-wait-start']);
                        const boundingBox = yield elementHandle.boundingBox();
                        this.tracker.point('screenshot-start');
                        const screenshotBuffer = yield this.page.screenshot({
                            clip: boundingBox,
                            timeout: 100,
                        });
                        this.tracker.point('screenshot-end', ['screenshot-start']);
                        // Фрейм сохраняется, но не отправляется в WebSocket
                        const frameData = {
                            startTime: frameGroup.startTime,
                            frameInterval: frameGroup.frameInterval,
                            frameCount: frameGroup.frameCount,
                            totalHeight: frameGroup.totalHeight,
                            width: frameGroup.width,
                            imageBuffer: screenshotBuffer.toString('base64'),
                        };
                        this.tracker.point('screenshot-attempt-end');
                        return;
                    }
                    else {
                        console.error('Page is not available');
                        this.tracker.point('page-not-available');
                    }
                }
                catch (error) {
                    console.error(`Attempt ${attempt} failed:`, error);
                    this.tracker.point('screenshot-attempt-failed');
                    if (attempt < maxRetries) {
                        console.log(`Retrying in ${delayBetweenRetries}ms...`);
                        yield new Promise(resolve => setTimeout(resolve, delayBetweenRetries));
                    }
                    else {
                        const now = new Date();
                        const hours = String(now.getHours()).padStart(2, '0');
                        const minutes = String(now.getMinutes()).padStart(2, '0');
                        const seconds = String(now.getSeconds()).padStart(2, '0');
                        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
                        const timeWithMilliseconds = `${hours}:${minutes}:${seconds}.${milliseconds}`;
                        console.error(timeWithMilliseconds, `Failed to capture screenshot after ${maxRetries} attempts.`);
                        this.tracker.point('screenshot-failed-final');
                    }
                }
            }
        });
    }
    generateNextFrameGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.frameRequestMutex.lock('generateNextGroup');
            try {
                const command = { command: 'generateNextGroup' };
                yield this.sendWebSocketCommand(command);
                return new Promise((resolve) => {
                    // Need to handle the response in the 'message' event of the individual WebSocket connection
                    this.wss.on('connection', (ws) => {
                        ws.on('message', (event) => {
                            const message = JSON.parse(event.toString());
                            if (message.frameGroup) {
                                resolve(message.frameGroup);
                            }
                        });
                    });
                });
            }
            finally {
                this.frameRequestMutex.unlock('generateNextGroup');
            }
        });
    }
    getSnapshot() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.resolveFunc = resolve;
                const command = { command: 'getSnapshot' };
                yield this.sendWebSocketCommand(command);
            }));
        });
    }
    setSnapshot(snapshot) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = { command: 'loadSnapshot', value: snapshot };
            yield this.sendWebSocketCommand(command);
        });
    }
    sendWebSocketCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            // Проходим по всем активным клиентам и отправляем команду
            this.clients.forEach(ws => {
                if (ws.readyState === ws_1.default.OPEN) {
                    ws.send(JSON.stringify(command));
                }
                else {
                    console.error("WebSocket is not open. Unable to send command:", command);
                }
            });
        });
    }
}
exports.Handlers = Handlers;
src_1.WorkerController.initialize(new Handlers());


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

/***/ "playwright":
/*!*****************************!*\
  !*** external "playwright" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("playwright");

/***/ }),

/***/ "ws":
/*!*********************!*\
  !*** external "ws" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("ws");

/***/ }),

/***/ "node:os":
/*!**************************!*\
  !*** external "node:os" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("node:os");

/***/ }),

/***/ "node:process":
/*!*******************************!*\
  !*** external "node:process" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("node:process");

/***/ }),

/***/ "node:tty":
/*!***************************!*\
  !*** external "node:tty" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("node:tty");

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

/***/ }),

/***/ "../../node_modules/chalk/source/index.js":
/*!************************************************!*\
  !*** ../../node_modules/chalk/source/index.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Chalk: () => (/* binding */ Chalk),
/* harmony export */   backgroundColorNames: () => (/* reexport safe */ _ansi_styles__WEBPACK_IMPORTED_MODULE_1__.backgroundColorNames),
/* harmony export */   backgroundColors: () => (/* reexport safe */ _ansi_styles__WEBPACK_IMPORTED_MODULE_1__.backgroundColorNames),
/* harmony export */   chalkStderr: () => (/* binding */ chalkStderr),
/* harmony export */   colorNames: () => (/* reexport safe */ _ansi_styles__WEBPACK_IMPORTED_MODULE_1__.colorNames),
/* harmony export */   colors: () => (/* reexport safe */ _ansi_styles__WEBPACK_IMPORTED_MODULE_1__.colorNames),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   foregroundColorNames: () => (/* reexport safe */ _ansi_styles__WEBPACK_IMPORTED_MODULE_1__.foregroundColorNames),
/* harmony export */   foregroundColors: () => (/* reexport safe */ _ansi_styles__WEBPACK_IMPORTED_MODULE_1__.foregroundColorNames),
/* harmony export */   modifierNames: () => (/* reexport safe */ _ansi_styles__WEBPACK_IMPORTED_MODULE_1__.modifierNames),
/* harmony export */   modifiers: () => (/* reexport safe */ _ansi_styles__WEBPACK_IMPORTED_MODULE_1__.modifierNames),
/* harmony export */   supportsColor: () => (/* binding */ stdoutColor),
/* harmony export */   supportsColorStderr: () => (/* binding */ stderrColor)
/* harmony export */ });
/* harmony import */ var _ansi_styles__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vendor/ansi-styles/index.js */ "../../node_modules/chalk/source/vendor/ansi-styles/index.js");
/* harmony import */ var _supports_color__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! #supports-color */ "../../node_modules/chalk/source/vendor/supports-color/index.js");
/* harmony import */ var _utilities_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utilities.js */ "../../node_modules/chalk/source/utilities.js");




const {stdout: stdoutColor, stderr: stderrColor} = _supports_color__WEBPACK_IMPORTED_MODULE_0__["default"];

const GENERATOR = Symbol('GENERATOR');
const STYLER = Symbol('STYLER');
const IS_EMPTY = Symbol('IS_EMPTY');

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m',
];

const styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

class Chalk {
	constructor(options) {
		// eslint-disable-next-line no-constructor-return
		return chalkFactory(options);
	}
}

const chalkFactory = options => {
	const chalk = (...strings) => strings.join(' ');
	applyOptions(chalk, options);

	Object.setPrototypeOf(chalk, createChalk.prototype);

	return chalk;
};

function createChalk(options) {
	return chalkFactory(options);
}

Object.setPrototypeOf(createChalk.prototype, Function.prototype);

for (const [styleName, style] of Object.entries(_ansi_styles__WEBPACK_IMPORTED_MODULE_1__["default"])) {
	styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		},
	};
}

styles.visible = {
	get() {
		const builder = createBuilder(this, this[STYLER], true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	},
};

const getModelAnsi = (model, level, type, ...arguments_) => {
	if (model === 'rgb') {
		if (level === 'ansi16m') {
			return _ansi_styles__WEBPACK_IMPORTED_MODULE_1__["default"][type].ansi16m(...arguments_);
		}

		if (level === 'ansi256') {
			return _ansi_styles__WEBPACK_IMPORTED_MODULE_1__["default"][type].ansi256(_ansi_styles__WEBPACK_IMPORTED_MODULE_1__["default"].rgbToAnsi256(...arguments_));
		}

		return _ansi_styles__WEBPACK_IMPORTED_MODULE_1__["default"][type].ansi(_ansi_styles__WEBPACK_IMPORTED_MODULE_1__["default"].rgbToAnsi(...arguments_));
	}

	if (model === 'hex') {
		return getModelAnsi('rgb', level, type, ..._ansi_styles__WEBPACK_IMPORTED_MODULE_1__["default"].hexToRgb(...arguments_));
	}

	return _ansi_styles__WEBPACK_IMPORTED_MODULE_1__["default"][type][model](...arguments_);
};

const usedModels = ['rgb', 'hex', 'ansi256'];

for (const model of usedModels) {
	styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(getModelAnsi(model, levelMapping[level], 'color', ...arguments_), _ansi_styles__WEBPACK_IMPORTED_MODULE_1__["default"].color.close, this[STYLER]);
				return createBuilder(this, styler, this[IS_EMPTY]);
			};
		},
	};

	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(getModelAnsi(model, levelMapping[level], 'bgColor', ...arguments_), _ansi_styles__WEBPACK_IMPORTED_MODULE_1__["default"].bgColor.close, this[STYLER]);
				return createBuilder(this, styler, this[IS_EMPTY]);
			};
		},
	};
}

const proto = Object.defineProperties(() => {}, {
	...styles,
	level: {
		enumerable: true,
		get() {
			return this[GENERATOR].level;
		},
		set(level) {
			this[GENERATOR].level = level;
		},
	},
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent,
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	// Single argument is hot path, implicit coercion is faster than anything
	// eslint-disable-next-line no-implicit-coercion
	const builder = (...arguments_) => applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder[GENERATOR] = self;
	builder[STYLER] = _styler;
	builder[IS_EMPTY] = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self[IS_EMPTY] ? '' : string;
	}

	let styler = self[STYLER];

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.includes('\u001B')) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = (0,_utilities_js__WEBPACK_IMPORTED_MODULE_2__.stringReplaceAll)(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = (0,_utilities_js__WEBPACK_IMPORTED_MODULE_2__.stringEncaseCRLFWithFirstIndex)(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

Object.defineProperties(createChalk.prototype, styles);

const chalk = createChalk();
const chalkStderr = createChalk({level: stderrColor ? stderrColor.level : 0});





/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (chalk);


/***/ }),

/***/ "../../node_modules/chalk/source/utilities.js":
/*!****************************************************!*\
  !*** ../../node_modules/chalk/source/utilities.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringEncaseCRLFWithFirstIndex: () => (/* binding */ stringEncaseCRLFWithFirstIndex),
/* harmony export */   stringReplaceAll: () => (/* binding */ stringReplaceAll)
/* harmony export */ });
// TODO: When targeting Node.js 16, use `String.prototype.replaceAll`.
function stringReplaceAll(string, substring, replacer) {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.slice(endIndex, index) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.slice(endIndex);
	return returnValue;
}

function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.slice(endIndex, (gotCR ? index - 1 : index)) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.slice(endIndex);
	return returnValue;
}


/***/ }),

/***/ "../../node_modules/chalk/source/vendor/ansi-styles/index.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/chalk/source/vendor/ansi-styles/index.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   backgroundColorNames: () => (/* binding */ backgroundColorNames),
/* harmony export */   colorNames: () => (/* binding */ colorNames),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   foregroundColorNames: () => (/* binding */ foregroundColorNames),
/* harmony export */   modifierNames: () => (/* binding */ modifierNames)
/* harmony export */ });
const ANSI_BACKGROUND_OFFSET = 10;

const wrapAnsi16 = (offset = 0) => code => `\u001B[${code + offset}m`;

const wrapAnsi256 = (offset = 0) => code => `\u001B[${38 + offset};5;${code}m`;

const wrapAnsi16m = (offset = 0) => (red, green, blue) => `\u001B[${38 + offset};2;${red};${green};${blue}m`;

const styles = {
	modifier: {
		reset: [0, 0],
		// 21 isn't widely supported and 22 does the same thing
		bold: [1, 22],
		dim: [2, 22],
		italic: [3, 23],
		underline: [4, 24],
		overline: [53, 55],
		inverse: [7, 27],
		hidden: [8, 28],
		strikethrough: [9, 29],
	},
	color: {
		black: [30, 39],
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		white: [37, 39],

		// Bright color
		blackBright: [90, 39],
		gray: [90, 39], // Alias of `blackBright`
		grey: [90, 39], // Alias of `blackBright`
		redBright: [91, 39],
		greenBright: [92, 39],
		yellowBright: [93, 39],
		blueBright: [94, 39],
		magentaBright: [95, 39],
		cyanBright: [96, 39],
		whiteBright: [97, 39],
	},
	bgColor: {
		bgBlack: [40, 49],
		bgRed: [41, 49],
		bgGreen: [42, 49],
		bgYellow: [43, 49],
		bgBlue: [44, 49],
		bgMagenta: [45, 49],
		bgCyan: [46, 49],
		bgWhite: [47, 49],

		// Bright color
		bgBlackBright: [100, 49],
		bgGray: [100, 49], // Alias of `bgBlackBright`
		bgGrey: [100, 49], // Alias of `bgBlackBright`
		bgRedBright: [101, 49],
		bgGreenBright: [102, 49],
		bgYellowBright: [103, 49],
		bgBlueBright: [104, 49],
		bgMagentaBright: [105, 49],
		bgCyanBright: [106, 49],
		bgWhiteBright: [107, 49],
	},
};

const modifierNames = Object.keys(styles.modifier);
const foregroundColorNames = Object.keys(styles.color);
const backgroundColorNames = Object.keys(styles.bgColor);
const colorNames = [...foregroundColorNames, ...backgroundColorNames];

function assembleStyles() {
	const codes = new Map();

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`,
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false,
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false,
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	styles.color.ansi = wrapAnsi16();
	styles.color.ansi256 = wrapAnsi256();
	styles.color.ansi16m = wrapAnsi16m();
	styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);

	// From https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js
	Object.defineProperties(styles, {
		rgbToAnsi256: {
			value(red, green, blue) {
				// We use the extended greyscale palette here, with the exception of
				// black and white. normal palette only has 4 greyscale shades.
				if (red === green && green === blue) {
					if (red < 8) {
						return 16;
					}

					if (red > 248) {
						return 231;
					}

					return Math.round(((red - 8) / 247) * 24) + 232;
				}

				return 16
					+ (36 * Math.round(red / 255 * 5))
					+ (6 * Math.round(green / 255 * 5))
					+ Math.round(blue / 255 * 5);
			},
			enumerable: false,
		},
		hexToRgb: {
			value(hex) {
				const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
				if (!matches) {
					return [0, 0, 0];
				}

				let [colorString] = matches;

				if (colorString.length === 3) {
					colorString = [...colorString].map(character => character + character).join('');
				}

				const integer = Number.parseInt(colorString, 16);

				return [
					/* eslint-disable no-bitwise */
					(integer >> 16) & 0xFF,
					(integer >> 8) & 0xFF,
					integer & 0xFF,
					/* eslint-enable no-bitwise */
				];
			},
			enumerable: false,
		},
		hexToAnsi256: {
			value: hex => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
			enumerable: false,
		},
		ansi256ToAnsi: {
			value(code) {
				if (code < 8) {
					return 30 + code;
				}

				if (code < 16) {
					return 90 + (code - 8);
				}

				let red;
				let green;
				let blue;

				if (code >= 232) {
					red = (((code - 232) * 10) + 8) / 255;
					green = red;
					blue = red;
				} else {
					code -= 16;

					const remainder = code % 36;

					red = Math.floor(code / 36) / 5;
					green = Math.floor(remainder / 6) / 5;
					blue = (remainder % 6) / 5;
				}

				const value = Math.max(red, green, blue) * 2;

				if (value === 0) {
					return 30;
				}

				// eslint-disable-next-line no-bitwise
				let result = 30 + ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red));

				if (value === 2) {
					result += 60;
				}

				return result;
			},
			enumerable: false,
		},
		rgbToAnsi: {
			value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
			enumerable: false,
		},
		hexToAnsi: {
			value: hex => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
			enumerable: false,
		},
	});

	return styles;
}

const ansiStyles = assembleStyles();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ansiStyles);


/***/ }),

/***/ "../../node_modules/chalk/source/vendor/supports-color/index.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/chalk/source/vendor/supports-color/index.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createSupportsColor: () => (/* binding */ createSupportsColor),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var node_process__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:process */ "node:process");
/* harmony import */ var node_os__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node:os */ "node:os");
/* harmony import */ var node_tty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! node:tty */ "node:tty");




// From: https://github.com/sindresorhus/has-flag/blob/main/index.js
/// function hasFlag(flag, argv = globalThis.Deno?.args ?? process.argv) {
function hasFlag(flag, argv = globalThis.Deno ? globalThis.Deno.args : node_process__WEBPACK_IMPORTED_MODULE_0__.argv) {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}

const {env} = node_process__WEBPACK_IMPORTED_MODULE_0__;

let flagForceColor;
if (
	hasFlag('no-color')
	|| hasFlag('no-colors')
	|| hasFlag('color=false')
	|| hasFlag('color=never')
) {
	flagForceColor = 0;
} else if (
	hasFlag('color')
	|| hasFlag('colors')
	|| hasFlag('color=true')
	|| hasFlag('color=always')
) {
	flagForceColor = 1;
}

function envForceColor() {
	if ('FORCE_COLOR' in env) {
		if (env.FORCE_COLOR === 'true') {
			return 1;
		}

		if (env.FORCE_COLOR === 'false') {
			return 0;
		}

		return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3,
	};
}

function _supportsColor(haveStream, {streamIsTTY, sniffFlags = true} = {}) {
	const noFlagForceColor = envForceColor();
	if (noFlagForceColor !== undefined) {
		flagForceColor = noFlagForceColor;
	}

	const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;

	if (forceColor === 0) {
		return 0;
	}

	if (sniffFlags) {
		if (hasFlag('color=16m')
			|| hasFlag('color=full')
			|| hasFlag('color=truecolor')) {
			return 3;
		}

		if (hasFlag('color=256')) {
			return 2;
		}
	}

	// Check for Azure DevOps pipelines.
	// Has to be above the `!streamIsTTY` check.
	if ('TF_BUILD' in env && 'AGENT_NAME' in env) {
		return 1;
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (node_process__WEBPACK_IMPORTED_MODULE_0__.platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = node_os__WEBPACK_IMPORTED_MODULE_1__.release().split('.');
		if (
			Number(osRelease[0]) >= 10
			&& Number(osRelease[2]) >= 10_586
		) {
			return Number(osRelease[2]) >= 14_931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if ('GITHUB_ACTIONS' in env || 'GITEA_ACTIONS' in env) {
			return 3;
		}

		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'BUILDKITE', 'DRONE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if (env.TERM === 'xterm-kitty') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = Number.parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app': {
				return version >= 3 ? 3 : 2;
			}

			case 'Apple_Terminal': {
				return 2;
			}
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function createSupportsColor(stream, options = {}) {
	const level = _supportsColor(stream, {
		streamIsTTY: stream && stream.isTTY,
		...options,
	});

	return translateLevel(level);
}

const supportsColor = {
	stdout: createSupportsColor({isTTY: node_tty__WEBPACK_IMPORTED_MODULE_2__.isatty(1)}),
	stderr: createSupportsColor({isTTY: node_tty__WEBPACK_IMPORTED_MODULE_2__.isatty(2)}),
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (supportsColor);


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
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/worker.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQix1SEFBdUg7QUFDNUk7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBLCtCQUErQixrQkFBa0I7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUVBQXFFLDhCQUE4QjtBQUNuRyx1RUFBdUUsOEJBQThCO0FBQ3JHO0FBQ0E7QUFDQSxhQUFhO0FBQ2IscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUZBQW1GLHlCQUF5QjtBQUM1RztBQUNBLGFBQWE7QUFDYixxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlGQUFpRixzQkFBc0I7QUFDdkc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFFQUFxRTtBQUNyRTtBQUNBO0FBQ0E7QUFDQSwrRUFBK0U7QUFDL0U7QUFDQTtBQUNBO0FBQ0EseURBQXlEO0FBQ3pEO0FBQ0EsYUFBYTtBQUNiO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsZ0NBQWdDO0FBQ2hDLGNBQWM7QUFDZCwrQkFBK0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOzs7Ozs7Ozs7OztBQzFLUztBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxvQ0FBb0M7QUFDbkQ7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RDtBQUNBLGFBQWEsbUJBQU8sQ0FBQywwREFBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqQjlCLDhHQUEwQjtBQVExQixNQUFhLFlBQVk7SUFLckI7UUFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBaUIsRUFBRSxXQUEyQjtRQUNoRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksU0FBUyxFQUFFLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUUsQ0FBQztRQUVyRCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDckMsTUFBTSxrQkFBa0IsR0FBRyxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFFLENBQUM7WUFDN0UsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFbkMsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUNkLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBRTtnQkFDbkMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO29CQUMxQyxNQUFNLFNBQVMsR0FBRyxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFFLENBQUM7b0JBQ3pFLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDakUsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMxRCxNQUFNLFNBQVMsR0FBRyxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDO1lBQ3pFLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7UUFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVELE1BQU0sQ0FBQyxTQUF1QixFQUFFO1FBQzVCLE1BQU0sV0FBVyxHQUFhLEVBQUUsQ0FBQztRQUNqQyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztRQUMxQyxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUMzQyxNQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsSUFBSSxLQUFLLENBQUM7UUFFaEUsbUJBQW1CO1FBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ2hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBRTVDLElBQUksT0FBTyxJQUFJLGFBQWEsSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLGVBQWUsRUFBRSxDQUFDO2dCQUNsRSx1QkFBdUI7Z0JBQ3ZCLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7Z0JBRTlELElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxFQUFFO29CQUNuRCxJQUFJLGNBQWMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxhQUFhLEVBQUUsQ0FBQzt3QkFDaEQsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDdkQsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFFSCwwRkFBMEY7Z0JBQzFGLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3ZELElBQUksQ0FBQywrQkFBK0IsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO2dCQUN4RixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFTywrQkFBK0IsQ0FDbkMsV0FBcUIsRUFDckIsS0FBYSxFQUNiLElBQWUsRUFDZixtQkFBZ0Q7UUFFaEQsV0FBVyxDQUFDLElBQUksQ0FDWixHQUFHLGVBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksSUFBSSxDQUFDLFdBQVcsYUFBYSxlQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQ3RILENBQUM7UUFFRixtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUUsU0FBUyxFQUFFLEVBQUU7WUFDdEQsV0FBVyxDQUFDLElBQUksQ0FDWixLQUFLLGVBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sZUFBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxjQUFjLENBQUMsS0FBSyxTQUFTLGNBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxXQUFXLGNBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxXQUFXLGVBQUssQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQzVPLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQTNGRCxvQ0EyRkM7QUFFRCxNQUFNLFNBQVM7SUFLWDtRQUNJLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxlQUFlO1FBQ1gsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELG1CQUFtQixDQUFDLFNBQWlCO1FBQ2pDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxTQUFTLENBQUM7SUFDekMsQ0FBQztJQUVELG9CQUFvQjtRQUNoQixPQUFPLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVELGdCQUFnQixDQUFDLFNBQWlCLEVBQUUsU0FBaUI7UUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksY0FBYyxFQUFFLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFFLENBQUM7UUFDeEQsY0FBYyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyQyxDQUFDO0NBQ0o7QUFFRCxNQUFNLGNBQWM7SUFNaEI7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxNQUFNLENBQUMsU0FBaUI7UUFDcEIsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELFdBQVc7UUFDUCxPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0NBQ0o7Ozs7Ozs7Ozs7Ozs7O0FDN0pELE1BQWEsS0FBSztJQUFsQjtRQUVZLFdBQU0sR0FBbUIsRUFBRSxDQUFDO1FBQzVCLFVBQUssR0FBRyxLQUFLLENBQUM7SUFvQzFCLENBQUM7SUFsQ0csSUFBSSxDQUFDLE1BQWU7UUFDaEIsSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLE1BQU07WUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2hGLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNkLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNsQixHQUFHLEVBQUUsQ0FBQztZQUNWLENBQUM7aUJBQU0sQ0FBQztnQkFDSixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQWU7UUFDbkIsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDYiw2Q0FBNkM7WUFDN0MsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQzthQUFNLENBQUM7WUFDSixxREFBcUQ7WUFDckQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLE1BQU07Z0JBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0lBQ0wsQ0FBQztJQUdELE1BQU0sQ0FBQyxNQUFlO1FBQ2xCLElBQUksS0FBSyxDQUFDLFVBQVUsSUFBSSxNQUFNO1lBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUM7UUFDckUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUN6QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2pDLElBQUksSUFBSTtnQkFBRSxJQUFJLEVBQUUsQ0FBQztRQUNyQixDQUFDO2FBQU0sQ0FBQztZQUNKLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLENBQUM7SUFDTCxDQUFDOztBQXRDTCxzQkF1Q0M7QUF0Q1UsZ0JBQVUsR0FBRyxJQUFJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0Q1Qix3RUFBd0I7QUFDeEIseUVBQWlFO0FBQ2pFLGtFQUE4QztBQUM5QyxpREFBMEI7QUFDMUIscUVBQThCO0FBQzlCLDBGQUE0QztBQUM1Qyx3SUFBaUU7QUFrQmpFLE1BQWEsUUFBUTtJQUFyQjtRQUNZLFlBQU8sR0FBbUIsSUFBSSxDQUFDO1FBQy9CLFlBQU8sR0FBMEIsSUFBSSxDQUFDO1FBQ3RDLFNBQUksR0FBZ0IsSUFBSSxDQUFDO1FBQ3pCLFFBQUcsR0FBMkIsSUFBSSxDQUFDO1FBQ25DLHNCQUFpQixHQUFHLElBQUksYUFBSyxFQUFFLENBQUM7UUFDaEMsWUFBTyxHQUFHLElBQUksMkJBQVksRUFBRSxDQUFDO1FBRzdCLGdCQUFXLEdBQXFDLElBQUksQ0FBQztRQUVyRCxZQUFPLEdBQWdCLEVBQUUsQ0FBQyxDQUFDLDBDQUEwQztJQTJPakYsQ0FBQztJQXpPUyxjQUFjOztZQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBRTNDLElBQUksQ0FBQztnQkFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sbUJBQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDckMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQy9DLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUN2RSxDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLENBQUM7UUFDTCxDQUFDO0tBQUE7SUFFYSxhQUFhOztZQUN2QixJQUFJLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBRTFDLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHFDQUFxQyxDQUFDLENBQUM7Z0JBQzdFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3pDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxRQUFRLEVBQUUsRUFBRSxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO2dCQUNoRSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztnQkFFL0QsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7b0JBQ2xDLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDM0IsSUFBSSxDQUFDO3dCQUNELE1BQU0sU0FBUyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQU8sR0FBRyxFQUFFLEVBQUUsZ0RBQUMsYUFBTSxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUMsQ0FBQyxDQUFDO3dCQUN2RixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDO29CQUNwQyxDQUFDO29CQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7d0JBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDdEQsQ0FBQztnQkFDTCxDQUFDLEVBQUMsQ0FBQztnQkFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO2dCQUNqRSxNQUFNLElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDO1lBQ25ELENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzVELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDOUMsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVhLGlDQUFpQzs7WUFDM0MsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDbkMsSUFBSSxDQUFDO29CQUNELE1BQU0sR0FBRyxHQUFHLElBQUksV0FBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7b0JBQ3JDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO29CQUVmLGdEQUFnRDtvQkFDaEQsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO29CQUV2QixHQUFHLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFO3dCQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7d0JBRTNDLCtDQUErQzt3QkFDL0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBRXRCLGlEQUFpRDt3QkFDakQsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUV6RCx5QkFBeUI7d0JBQ3pCLEVBQUUsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQU8sT0FBdUIsRUFBRSxFQUFFOzRCQUMvQyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQTJCLENBQUMsQ0FBQzt3QkFDakYsQ0FBQyxFQUFDLENBQUM7d0JBRUgsa0RBQWtEO3dCQUNsRCxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7NEJBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQzs0QkFDM0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sS0FBSyxFQUFFLENBQUMsQ0FBQzt3QkFDaEUsQ0FBQyxDQUFDLENBQUM7d0JBRUgsc0JBQXNCO3dCQUN0QixFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFOzRCQUNyQixPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDakQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDekMsQ0FBQyxDQUFDLENBQUM7d0JBRUgsdURBQXVEO3dCQUN2RCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7NEJBQ2QsVUFBVSxHQUFHLElBQUksQ0FBQzs0QkFDbEIsT0FBTyxFQUFFLENBQUM7d0JBQ2QsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztvQkFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7Z0JBRXRFLENBQUM7Z0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztvQkFDYixPQUFPLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUMxRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBRSx5Q0FBeUM7Z0JBQzdELENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FBQTtJQUNhLHNCQUFzQixDQUFDLEtBQTZCOztZQUM5RCxNQUFNLE9BQU8sR0FBcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDcEUsSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLGNBQWMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUM1QixDQUFDO1lBQ0QsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO2dCQUM3RSxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO2dCQUV0QyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDWixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDbkMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQztvQkFDM0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztvQkFFbkQsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQztvQkFFeEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ25DLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO29CQUNuRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNoRCxDQUFDO3FCQUFNLENBQUM7b0JBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVhLGlCQUFpQixDQUFDLFVBQXNCOztZQUNsRCxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUM7WUFDckIsTUFBTSxtQkFBbUIsR0FBRyxFQUFFLENBQUM7WUFFL0IsS0FBSyxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsT0FBTyxJQUFJLFVBQVUsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO2dCQUNyRCxJQUFJLENBQUM7b0JBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztvQkFDL0MsTUFBTSxFQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUMsR0FBRyxVQUFVLENBQUM7b0JBRXhDLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUNaLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQ3JDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFnQixFQUFFLEVBQUU7NEJBQzFDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs0QkFDOUQsSUFBSSxTQUFTLEVBQUUsQ0FBQztnQ0FDWixTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLFdBQVcsSUFBSSxDQUFDOzRCQUNoRCxDQUFDO3dCQUNMLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQzt3QkFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO3dCQUV2RCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO3dCQUMxQyxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixFQUFFLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7d0JBQy9GLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO3dCQUVqRSxNQUFNLFdBQVcsR0FBRyxNQUFNLGFBQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFFdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQzt3QkFDdkMsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDOzRCQUNoRCxJQUFJLEVBQUUsV0FBWTs0QkFDbEIsT0FBTyxFQUFFLEdBQUc7eUJBQ2YsQ0FBQyxDQUFDO3dCQUNILElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO3dCQUUzRCxvREFBb0Q7d0JBQ3BELE1BQU0sU0FBUyxHQUFlOzRCQUMxQixTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVM7NEJBQy9CLGFBQWEsRUFBRSxVQUFVLENBQUMsYUFBYTs0QkFDdkMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVOzRCQUNqQyxXQUFXLEVBQUUsVUFBVSxDQUFDLFdBQVc7NEJBQ25DLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSzs0QkFDdkIsV0FBVyxFQUFFLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7eUJBQ25ELENBQUM7d0JBRUYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQzt3QkFDN0MsT0FBTztvQkFDWCxDQUFDO3lCQUFNLENBQUM7d0JBQ0osT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO3dCQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUM3QyxDQUFDO2dCQUNMLENBQUM7Z0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztvQkFDYixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsT0FBTyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ25ELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7b0JBQ2hELElBQUksT0FBTyxHQUFHLFVBQVUsRUFBRSxDQUFDO3dCQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsbUJBQW1CLE9BQU8sQ0FBQyxDQUFDO3dCQUN2RCxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7b0JBQzNFLENBQUM7eUJBQU0sQ0FBQzt3QkFDSixNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO3dCQUN2QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDdEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQzFELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUMxRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFFcEUsTUFBTSxvQkFBb0IsR0FBRyxHQUFHLEtBQUssSUFBSSxPQUFPLElBQUksT0FBTyxJQUFJLFlBQVksRUFBRSxDQUFDO3dCQUM5RSxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLHNDQUFzQyxVQUFVLFlBQVksQ0FBQyxDQUFDO3dCQUNsRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO29CQUNsRCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBRVksc0JBQXNCOztZQUMvQixNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUM7Z0JBQ0QsTUFBTSxPQUFPLEdBQXFCLEVBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFDLENBQUM7Z0JBQ2pFLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUV6QyxPQUFPLElBQUksT0FBTyxDQUFhLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQ3ZDLDRGQUE0RjtvQkFDNUYsSUFBSSxDQUFDLEdBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUU7d0JBQzlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7NEJBQ3ZCLE1BQU0sT0FBTyxHQUFxQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDOzRCQUMvRCxJQUFJLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQ0FDckIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs0QkFDaEMsQ0FBQzt3QkFDTCxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7b0JBQVMsQ0FBQztnQkFDUCxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDdkQsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVZLFdBQVc7O1lBQ3BCLE9BQU8sSUFBSSxPQUFPLENBQVMsQ0FBTyxPQUFPLEVBQUUsRUFBRTtnQkFDekMsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7Z0JBQzNCLE1BQU0sT0FBTyxHQUFxQixFQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUMsQ0FBQztnQkFDM0QsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0MsQ0FBQyxFQUFDLENBQUM7UUFDUCxDQUFDO0tBQUE7SUFFWSxXQUFXLENBQUMsUUFBZ0I7O1lBQ3JDLE1BQU0sT0FBTyxHQUFxQixFQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBQyxDQUFDO1lBQzdFLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdDLENBQUM7S0FBQTtJQUVhLG9CQUFvQixDQUFDLE9BQXlCOztZQUN4RCwwREFBMEQ7WUFDMUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ3RCLElBQUksRUFBRSxDQUFDLFVBQVUsS0FBSyxZQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ25DLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxDQUFDO3FCQUFNLENBQUM7b0JBQ0osT0FBTyxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDN0UsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0NBQ0o7QUF0UEQsNEJBc1BDO0FBRUQsc0JBQWdCLENBQUMsVUFBVSxDQUFDLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7QUNoUi9CO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELHdCQUF3QjtBQUN4Qix5QkFBeUIsbUJBQU8sQ0FBQyxzQ0FBZ0I7QUFDakQsbUJBQW1CLG1CQUFPLENBQUMsMkRBQVU7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsYUFBYTtBQUNuRTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IscUJBQXFCO0FBQ3JDLGdCQUFnQixtQkFBbUI7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUM7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLFlBQVk7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsbUJBQW1CO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtFQUFrRSxjQUFjO0FBQ2hGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdELFlBQVk7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCO0FBQ3hCOzs7Ozs7Ozs7O0FDdEZhO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELHFCQUFxQjtBQUNyQix5QkFBeUIsbUJBQU8sQ0FBQyxzQ0FBZ0I7QUFDakQsbUJBQW1CLG1CQUFPLENBQUMsMkRBQVU7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSx5Q0FBeUM7QUFDekM7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixvQkFBb0I7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5REFBeUQsYUFBYTtBQUN0RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLFVBQVU7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRCxrQkFBa0I7QUFDcEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLHlDQUF5QztBQUN6QztBQUNBLGFBQWE7QUFDYjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QyxVQUFVO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCOzs7Ozs7Ozs7O0FDeEdhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLG9DQUFvQztBQUNuRDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELGFBQWEsbUJBQU8sQ0FBQyw0RkFBaUI7QUFDdEMsYUFBYSxtQkFBTyxDQUFDLGtHQUFvQjtBQUN6Qzs7Ozs7Ozs7OztBQ2xCQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBc0M7QUFDTTtBQUlwQjs7QUFFeEIsT0FBTywwQ0FBMEMsRUFBRSx1REFBYTs7QUFFaEU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLDBDQUEwQztBQUMxQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxnREFBZ0Qsb0RBQVU7QUFDMUQ7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLGVBQWU7QUFDMUQ7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsZUFBZTtBQUN6RDtBQUNBLEVBQUU7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLG9EQUFVO0FBQ3BCOztBQUVBO0FBQ0EsVUFBVSxvREFBVSxlQUFlLG9EQUFVO0FBQzdDOztBQUVBLFNBQVMsb0RBQVUsWUFBWSxvREFBVTtBQUN6Qzs7QUFFQTtBQUNBLDZDQUE2QyxvREFBVTtBQUN2RDs7QUFFQSxRQUFRLG9EQUFVO0FBQ2xCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVUsT0FBTztBQUNqQjtBQUNBLGtHQUFrRyxvREFBVTtBQUM1RztBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVUsT0FBTztBQUNqQjtBQUNBLG9HQUFvRyxvREFBVTtBQUM5RztBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUEsOENBQThDO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSCxFQUFFO0FBQ0YsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxRQUFRLG1CQUFtQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSwrREFBZ0I7O0FBRTVCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyw2RUFBOEI7QUFDekM7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNPLGlDQUFpQywyQ0FBMkM7O0FBYTVDOztBQUtyQzs7QUFFRixpRUFBZSxLQUFLLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoT3JCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hDQTs7QUFFQSxxREFBcUQsY0FBYzs7QUFFbkUsc0RBQXNELGFBQWEsRUFBRSxFQUFFLEtBQUs7O0FBRTVFLG9FQUFvRSxhQUFhLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUs7O0FBRTFHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjs7QUFFTztBQUNBO0FBQ0E7QUFDQTs7QUFFUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixTQUFTO0FBQzdCLHFCQUFxQixTQUFTO0FBQzlCOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7O0FBRUY7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLDZCQUE2QixFQUFFLFNBQVMsRUFBRTtBQUMxQztBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsRUFBRTs7QUFFRjtBQUNBOztBQUVBOztBQUVBLGlFQUFlLFVBQVUsRUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlOUztBQUNWO0FBQ0U7O0FBRTNCO0FBQ0E7QUFDQSx1RUFBdUUsOENBQVk7QUFDbkY7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPLEtBQUssRUFBRSx5Q0FBTzs7QUFFckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEscUNBQXFDLGdDQUFnQyxJQUFJO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEtBQUssa0RBQWdCO0FBQ3JCO0FBQ0E7QUFDQSxvQkFBb0IsNENBQVU7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxpQ0FBaUMsR0FBRztBQUNwQzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRU8saURBQWlEO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBLEVBQUU7O0FBRUY7QUFDQTs7QUFFQTtBQUNBLDhCQUE4QixPQUFPLDRDQUFVLElBQUk7QUFDbkQsOEJBQThCLE9BQU8sNENBQVUsSUFBSTtBQUNuRDs7QUFFQSxpRUFBZSxhQUFhLEVBQUM7Ozs7Ozs7VUNyTDdCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztVRU5BO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvc2VyZGUtdHMvZGlzdC9TZXJEZS5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9zZXJkZS10cy9kaXN0L2luZGV4LmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL3NlcnZlci9zcmMvUG9pbnRUcmFja2VyLnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL3NlcnZlci9zcmMvbXV0ZXgudHMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9zcmMvc2VydmVyL3NyYy93b3JrZXIudHMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvd29ya2VyLXRocmVhZHMtbWFuYWdlci9kaXN0L3NyYy9Xb3JrZXJDb250cm9sbGVyLmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL3dvcmtlci10aHJlYWRzLW1hbmFnZXIvZGlzdC9zcmMvV29ya2VyTWFuYWdlci5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy93b3JrZXItdGhyZWFkcy1tYW5hZ2VyL2Rpc3Qvc3JjL2luZGV4LmpzIiwiZmlsZTovLy9leHRlcm5hbCBjb21tb25qcyBcInBsYXl3cmlnaHRcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgY29tbW9uanMgXCJ3c1wiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwibm9kZTpvc1wiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwibm9kZTpwcm9jZXNzXCIiLCJmaWxlOi8vL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJub2RlOnR0eVwiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwicGF0aFwiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwid29ya2VyX3RocmVhZHNcIiIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9jaGFsay9zb3VyY2UvaW5kZXguanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvY2hhbGsvc291cmNlL3V0aWxpdGllcy5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9jaGFsay9zb3VyY2UvdmVuZG9yL2Fuc2ktc3R5bGVzL2luZGV4LmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL2NoYWxrL3NvdXJjZS92ZW5kb3Ivc3VwcG9ydHMtY29sb3IvaW5kZXguanMiLCJmaWxlOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwiZmlsZTovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJmaWxlOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJmaWxlOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJmaWxlOi8vL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJmaWxlOi8vL3dlYnBhY2svc3RhcnR1cCIsImZpbGU6Ly8vd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TZXJEZSA9IHZvaWQgMDtcbi8vIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIGEgZ2l2ZW4gZnVuY3Rpb24gaXMgYSBjbGFzcyBjb25zdHJ1Y3RvclxuZnVuY3Rpb24gaXNDbGFzcyhmdW5jKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBmdW5jID09PSAnZnVuY3Rpb24nICYmIC9eXFxzKmNsYXNzXFxzKy8udGVzdChmdW5jLnRvU3RyaW5nKCkpO1xufVxuY2xhc3MgU2VyRGUge1xuICAgIC8vIE1ldGhvZCB0byBoYW5kbGUgc2ltcGxlIHR5cGVzIGRpcmVjdGx5XG4gICAgc3RhdGljIGZyb21TaW1wbGUob2JqKSB7XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBEYXRlIHx8IHR5cGVvZiBvYmogPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBvYmogPT09ICdudW1iZXInIHx8IHR5cGVvZiBvYmogPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvLyBNZXRob2QgdG8gc2V0IGV4Y2x1c2l2ZSBjbGFzc2VzIGZvciBzZXJpYWxpemF0aW9uXG4gICAgc3RhdGljIHNldEV4Y2x1c2l2ZWx5KGxpc3QpIHtcbiAgICAgICAgU2VyRGUub25seSA9IG5ldyBTZXQoWy4uLmxpc3QsIEFycmF5LCBNYXAsIFNldF0pO1xuICAgIH1cbiAgICAvLyBNYWluIHNlcmlhbGl6YXRpb24gbWV0aG9kXG4gICAgc3RhdGljIHNlcmlhbGlzZShvYmosIHZpc2l0ZWQgPSBuZXcgTWFwKCksIF9tYXAgPSBuZXcgTWFwKCksIGRlcHRoID0gMCwgcGFyZW50KSB7XG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2U7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJyB8fCBvYmogPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAvLyBJZiB0aGUgb2JqZWN0IGlzIGEgY2xhc3MgYW5kIGlzIG5vdCBpbiB0aGUgZXhjbHVzaXZlIGxpc3QsIHNraXAgc2VyaWFsaXphdGlvblxuICAgICAgICBpZiAoKChfYSA9IFNlckRlLm9ubHkpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5zaXplKSAmJiBpc0NsYXNzKG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9iai5jb25zdHJ1Y3RvcikgJiYgIVNlckRlLm9ubHkuaGFzKG9iai5jb25zdHJ1Y3RvcikpXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRGF0ZSlcbiAgICAgICAgICAgIHJldHVybiB7IHQ6ICdEYXRlJywgdjogb2JqLnZhbHVlT2YoKSB9O1xuICAgICAgICBsZXQgbWF5YmVTaW1wbGUgPSBTZXJEZS5mcm9tU2ltcGxlKG9iaik7XG4gICAgICAgIGlmIChtYXliZVNpbXBsZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgcmV0dXJuIG1heWJlU2ltcGxlO1xuICAgICAgICBpZiAodmlzaXRlZC5oYXMob2JqKSkge1xuICAgICAgICAgICAgdmlzaXRlZC5nZXQob2JqKS50aW1lcysrO1xuICAgICAgICAgICAgcmV0dXJuIHsgdDogKF9iID0gb2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLmNvbnN0cnVjdG9yKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IubmFtZSwgdjogeyBfbWFwSWQ6IFNlckRlLndlYWtNYXAuZ2V0KG9iaikgfSB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgICAgIHJldHVybiB7IHQ6ICdmdW5jdGlvbicsIHY6IG9iai5uYW1lIH07XG4gICAgICAgIGlmIChwYXJlbnQpXG4gICAgICAgICAgICB2aXNpdGVkLnNldChvYmosIHsgdGltZXM6IDEsIHBhcmVudCB9KTtcbiAgICAgICAgbGV0IGlkID0gKF9jID0gU2VyRGUud2Vha01hcC5nZXQob2JqKSkgIT09IG51bGwgJiYgX2MgIT09IHZvaWQgMCA/IF9jIDogU2VyRGUuaWQrKztcbiAgICAgICAgU2VyRGUud2Vha01hcC5zZXQob2JqLCBpZCk7XG4gICAgICAgIC8vIEhhbmRsZSBNYXAgb2JqZWN0c1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBsZXQgc2VyaWFsaXNlZCA9IG5ldyBBcnJheShvYmouc2l6ZSk7XG4gICAgICAgICAgICBfbWFwLnNldChpZCwgc2VyaWFsaXNlZCk7XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICBvYmouZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHNlcmlhbGlzZWRbaV0gPSBbXG4gICAgICAgICAgICAgICAgICAgIFNlckRlLnNlcmlhbGlzZShrZXksIHZpc2l0ZWQsIF9tYXAsIGRlcHRoICsgMSwgeyBvYmo6IHNlcmlhbGlzZWQsIGtleTogW2ksIDBdIH0pLFxuICAgICAgICAgICAgICAgICAgICBTZXJEZS5zZXJpYWxpc2UodmFsdWUsIHZpc2l0ZWQsIF9tYXAsIGRlcHRoICsgMSwgeyBvYmo6IHNlcmlhbGlzZWQsIGtleTogW2ksIDFdIH0pLFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4geyB0OiBvYmouY29uc3RydWN0b3IubmFtZSwgdjogc2VyaWFsaXNlZCB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEhhbmRsZSBTZXQgYW5kIEFycmF5IG9iamVjdHNcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFNldCB8fCBvYmogaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgbGV0IHNlcmlhbGlzZWQgPSBBcnJheShvYmogaW5zdGFuY2VvZiBTZXQgPyBvYmouc2l6ZSA6IG9iai5sZW5ndGgpO1xuICAgICAgICAgICAgX21hcC5zZXQoaWQsIHNlcmlhbGlzZWQpO1xuICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgb2JqLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VyaWFsaXNlZFtpXSA9IFNlckRlLnNlcmlhbGlzZSh2YWx1ZSwgdmlzaXRlZCwgX21hcCwgZGVwdGggKyAxLCB7IG9iajogc2VyaWFsaXNlZCwga2V5OiBpIH0pO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgdDogb2JqLmNvbnN0cnVjdG9yLm5hbWUsIHY6IHNlcmlhbGlzZWQgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBIYW5kbGUgZ2VuZXJpYyBvYmplY3RzXG4gICAgICAgIGxldCBzZXJpYWxpc2VkID0ge307XG4gICAgICAgIF9tYXAuc2V0KGlkLCBzZXJpYWxpc2VkKTtcbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9iaikpIHtcbiAgICAgICAgICAgIHNlcmlhbGlzZWRba2V5XSA9IFNlckRlLnNlcmlhbGlzZSh2YWx1ZSwgdmlzaXRlZCwgX21hcCwgZGVwdGggKyAxLCB7IG9iajogc2VyaWFsaXNlZCwga2V5IH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHdlIGFyZSBhdCB0aGUgdG9wIGxldmVsLCBoYW5kbGUgY2lyY3VsYXIgcmVmZXJlbmNlcyBhbmQgbXVsdGlwbGUgaW5zdGFuY2VzXG4gICAgICAgIGlmIChkZXB0aCA9PT0gMCkge1xuICAgICAgICAgICAgbGV0IHJlY3Vyc2lvblZpc2l0ZWQgPSBBcnJheS5mcm9tKHZpc2l0ZWQpXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoW18sIHZhbF0pID0+IHZhbC50aW1lcyA+IDEpXG4gICAgICAgICAgICAgICAgLm1hcCgoW29iaiwgdmFsXSkgPT4gW1NlckRlLndlYWtNYXAuZ2V0KG9iaiksIHZhbF0pOyAvLyBFeHBsaWNpdGx5IGNhc3QgaWQgdG8gbnVtYmVyXG4gICAgICAgICAgICByZWN1cnNpb25WaXNpdGVkLmZvckVhY2goKFtpZCwgdmFsXSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh2YWwucGFyZW50LmtleSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAgICAgdmFsLnBhcmVudC5vYmpbdmFsLnBhcmVudC5rZXlbMF1dW3ZhbC5wYXJlbnQua2V5WzFdXS52ID0geyBfbWFwSWQ6IGlkIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5wYXJlbnQub2JqW3ZhbC5wYXJlbnQua2V5XS52ID0geyBfbWFwSWQ6IGlkIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBBdHRhY2ggdGhlIF9tYXAgZm9yIHNlcmlhbGl6YXRpb24gcmVzdWx0XG4gICAgICAgICAgICByZXR1cm4geyB0OiAoX2QgPSBvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmouY29uc3RydWN0b3IpID09PSBudWxsIHx8IF9kID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZC5uYW1lLCB2OiBzZXJpYWxpc2VkLCBfbWFwOiByZWN1cnNpb25WaXNpdGVkLm1hcCgoeCkgPT4gW3hbMF0sIF9tYXAuZ2V0KHhbMF0pXSkgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB0OiAoX2UgPSBvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmouY29uc3RydWN0b3IpID09PSBudWxsIHx8IF9lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZS5uYW1lLCB2OiBzZXJpYWxpc2VkIH07XG4gICAgfVxuICAgIC8vIE1haW4gZGVzZXJpYWxpemF0aW9uIG1ldGhvZFxuICAgIHN0YXRpYyBkZXNlcmlhbGl6ZShvYmopIHtcbiAgICAgICAgdmFyIF9hLCBfYiwgX2MsIF9kLCBfZSwgX2YsIF9nLCBfaCwgX2osIF9rLCBfbDtcbiAgICAgICAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIGlmICgob2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLnQpID09PSAnRGF0ZScpXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUob2JqLnYpO1xuICAgICAgICAvLyBJZiBvYmogaXMgYSBwcmltaXRpdmUsIHJldHVybiBpdCBkaXJlY3RseSAod2l0aCBEYXRlIGhhbmRsaW5nKVxuICAgICAgICBpZiAoU2VyRGUuaXNQcmltaXRpdmUob2JqKSkge1xuICAgICAgICAgICAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIERhdGUgPyBuZXcgRGF0ZShvYmopIDogb2JqO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvYmoudCA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIHJldHVybiAoX2EgPSBTZXJEZS5jbGFzc1JlZ2lzdHJ5LmdldChvYmoudikpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IHt9O1xuICAgICAgICAvLyBIYW5kbGVzIHRoZSByZXN0b3JhdGlvbiBvZiBfbWFwIGZvciBvYmplY3QgcmVmZXJlbmNlcyBpZiBpdCBleGlzdHNcbiAgICAgICAgaWYgKG9iai5fbWFwKSB7XG4gICAgICAgICAgICBTZXJEZS5fbWFwID0gbmV3IE1hcChvYmouX21hcCk7XG4gICAgICAgICAgICBTZXJEZS5fdGVtcE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXRyaWV2ZSB0aGUgY2xhc3MgY29uc3RydWN0b3IgaWYgYXZhaWxhYmxlXG4gICAgICAgIGNvbnN0IGNsYXNzQ29uc3RydWN0b3IgPSBTZXJEZS5jbGFzc1JlZ2lzdHJ5LmdldChvYmoudCk7XG4gICAgICAgIGxldCBpbnN0YW5jZTtcbiAgICAgICAgaWYgKCgoX2IgPSBvYmoudikgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLl9tYXBJZCkgJiYgKChfYyA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2MuaGFzKG9iai52Ll9tYXBJZCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gKF9kID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9kID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZC5nZXQob2JqLnYuX21hcElkKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGluc3RhbmNlID0gY2xhc3NDb25zdHJ1Y3RvciA/IE9iamVjdC5jcmVhdGUoY2xhc3NDb25zdHJ1Y3Rvci5wcm90b3R5cGUpIDoge307XG4gICAgICAgICAgICAoX2UgPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2UgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9lLnNldChvYmoudi5fbWFwSWQsIGluc3RhbmNlKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbmVzdGVkID0gKF9oID0gKF9mID0gU2VyRGUuX21hcCkgPT09IG51bGwgfHwgX2YgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9mLmdldCgoX2cgPSBvYmoudikgPT09IG51bGwgfHwgX2cgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9nLl9tYXBJZCkpICE9PSBudWxsICYmIF9oICE9PSB2b2lkIDAgPyBfaCA6IG9iai52O1xuICAgICAgICAvLyBEZXNlcmlhbGl6ZSBiYXNlZCBvbiB0aGUgdHlwZSBvZiBvYmplY3RcbiAgICAgICAgc3dpdGNoIChvYmoudCkge1xuICAgICAgICAgICAgY2FzZSAnQXJyYXknOiAvLyBIYW5kbGUgYXJyYXlzXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXN0ZWQubWFwKChpdGVtKSA9PiBTZXJEZS5kZXNlcmlhbGl6ZShpdGVtKSk7XG4gICAgICAgICAgICAgICAgKF9qID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9qID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfai5zZXQob2JqLnYuX21hcElkLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICAgICAgY2FzZSAnTWFwJzogLy8gSGFuZGxlIG1hcHNcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBNYXAobmVzdGVkLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBbU2VyRGUuZGVzZXJpYWxpemUoa2V5KSwgU2VyRGUuZGVzZXJpYWxpemUodmFsdWUpXSkpO1xuICAgICAgICAgICAgICAgIChfayA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfayA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2suc2V0KG9iai52Ll9tYXBJZCwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgICAgIGNhc2UgJ1NldCc6IC8vIEhhbmRsZSBzZXRzXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgU2V0KG5lc3RlZC5tYXAoKGl0ZW0pID0+IFNlckRlLmRlc2VyaWFsaXplKGl0ZW0pKSk7XG4gICAgICAgICAgICAgICAgKF9sID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9sID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfbC5zZXQob2JqLnYuX21hcElkLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICAgICAgZGVmYXVsdDogLy8gSGFuZGxlIG9iamVjdHNcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhuZXN0ZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW2tleV0gPSBTZXJEZS5kZXNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjbGFzc0NvbnN0cnVjdG9yICYmIFNlckRlLmluaXRGdW5jTmFtZSAmJiB0eXBlb2YgaW5zdGFuY2VbU2VyRGUuaW5pdEZ1bmNOYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtTZXJEZS5pbml0RnVuY05hbWVdKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIENsZWFyIHRoZSBfbWFwIGFmdGVyIGRlc2VyaWFsaXphdGlvbiBpcyBjb21wbGV0ZSB0byBmcmVlIG1lbW9yeVxuICAgICAgICBpZiAob2JqLl9tYXApIHtcbiAgICAgICAgICAgIFNlckRlLl9tYXAgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBTZXJEZS5fdGVtcE1hcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7IC8vIFJldHVybiB0aGUgZGVzZXJpYWxpemVkIGluc3RhbmNlXG4gICAgfVxuICAgIC8vIE1ldGhvZCB0byByZWdpc3RlciBjbGFzc2VzIGZvciBkZXNlcmlhbGl6YXRpb25cbiAgICBzdGF0aWMgY2xhc3NSZWdpc3RyYXRpb24oY2xhc3Nlcykge1xuICAgICAgICBjbGFzc2VzLmZvckVhY2goKHgpID0+IFNlckRlLmNsYXNzUmVnaXN0cnkuc2V0KHgubmFtZSwgeCkpO1xuICAgIH1cbiAgICAvLyBIZWxwZXIgbWV0aG9kIHRvIGNoZWNrIGlmIGEgdmFsdWUgaXMgcHJpbWl0aXZlXG4gICAgc3RhdGljIGlzUHJpbWl0aXZlKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiAodmFsdWUgPT09IG51bGwgfHxcbiAgICAgICAgICAgIFsnbnVtYmVyJywgJ3N0cmluZycsICdib29sZWFuJywgJ3VuZGVmaW5lZCcsICdzeW1ib2wnLCAnYmlnaW50J10uaW5jbHVkZXModHlwZW9mIHZhbHVlKSB8fFxuICAgICAgICAgICAgdmFsdWUgaW5zdGFuY2VvZiBEYXRlKTtcbiAgICB9XG59XG5leHBvcnRzLlNlckRlID0gU2VyRGU7XG5TZXJEZS5pbml0RnVuY05hbWUgPSAnX2luaXRGbic7IC8vIE5hbWUgb2YgdGhlIGluaXRpYWxpemF0aW9uIGZ1bmN0aW9uIChpZiBleGlzdHMpXG5TZXJEZS5pZCA9IDA7IC8vIFVuaXF1ZSBJRCBjb3VudGVyIGZvciBvYmplY3RzXG5TZXJEZS53ZWFrTWFwID0gbmV3IFdlYWtNYXAoKTsgLy8gV2Vha01hcCB0byB0cmFjayBvYmplY3RzIGR1cmluZyBzZXJpYWxpemF0aW9uXG5TZXJEZS5jbGFzc1JlZ2lzdHJ5ID0gbmV3IE1hcChbXG4gICAgWydBcnJheScsIEFycmF5XSxcbiAgICBbJ1NldCcsIFNldF0sXG4gICAgWydNYXAnLCBNYXBdLFxuXSk7IC8vIFJlZ2lzdHJ5IG9mIGNsYXNzZXMgZm9yIGRlc2VyaWFsaXphdGlvblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHBvcnRzLCBwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIHNyYy9pbmRleC50c1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL1NlckRlXCIpLCBleHBvcnRzKTtcbiIsImltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5cbmludGVyZmFjZSBSZXBvcnRGaWx0ZXIge1xuICAgIG1pblRpbWU/OiBudW1iZXI7XG4gICAgdmlzaXRzPzogbnVtYmVyO1xuICAgIHJlcXVpcmVEZXBlbmRlbmNpZXM/OiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgUG9pbnRUcmFja2VyIHtcbiAgICBwcml2YXRlIHBvaW50czogTWFwPHN0cmluZywgUG9pbnREYXRhPjtcbiAgICBwcml2YXRlIGxhc3RUaW1lc3RhbXBzOiBNYXA8c3RyaW5nLCBudW1iZXI+O1xuICAgIHByaXZhdGUgbGFzdFBvaW50OiBzdHJpbmcgfCBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucG9pbnRzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmxhc3RUaW1lc3RhbXBzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmxhc3RQb2ludCA9IG51bGw7XG4gICAgfVxuXG4gICAgcG9pbnQocG9pbnROYW1lOiBzdHJpbmcsIGNoZWNrUG9pbnRzPzogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IERhdGUubm93KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnBvaW50cy5oYXMocG9pbnROYW1lKSkge1xuICAgICAgICAgICAgdGhpcy5wb2ludHMuc2V0KHBvaW50TmFtZSwgbmV3IFBvaW50RGF0YSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGN1cnJlbnRQb2ludERhdGEgPSB0aGlzLnBvaW50cy5nZXQocG9pbnROYW1lKSE7XG5cbiAgICAgICAgaWYgKHRoaXMubGFzdFRpbWVzdGFtcHMuaGFzKHBvaW50TmFtZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVTaW5jZUxhc3RWaXNpdCA9IGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZXN0YW1wcy5nZXQocG9pbnROYW1lKSE7XG4gICAgICAgICAgICBjdXJyZW50UG9pbnREYXRhLnVwZGF0ZUl0ZXJhdGlvblRpbWUodGltZVNpbmNlTGFzdFZpc2l0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRQb2ludERhdGEuaW5jcmVtZW50VmlzaXRzKCk7XG5cbiAgICAgICAgaWYgKGNoZWNrUG9pbnRzKSB7XG4gICAgICAgICAgICBjaGVja1BvaW50cy5mb3JFYWNoKChjaGVja1BvaW50TmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxhc3RUaW1lc3RhbXBzLmhhcyhjaGVja1BvaW50TmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltZVNwZW50ID0gY3VycmVudFRpbWUgLSB0aGlzLmxhc3RUaW1lc3RhbXBzLmdldChjaGVja1BvaW50TmFtZSkhO1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50UG9pbnREYXRhLnVwZGF0ZVRyYW5zaXRpb24oY2hlY2tQb2ludE5hbWUsIHRpbWVTcGVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5sYXN0UG9pbnQgIT09IG51bGwgJiYgdGhpcy5sYXN0UG9pbnQgIT09IHBvaW50TmFtZSkge1xuICAgICAgICAgICAgY29uc3QgdGltZVNwZW50ID0gY3VycmVudFRpbWUgLSB0aGlzLmxhc3RUaW1lc3RhbXBzLmdldCh0aGlzLmxhc3RQb2ludCkhO1xuICAgICAgICAgICAgY3VycmVudFBvaW50RGF0YS51cGRhdGVUcmFuc2l0aW9uKHRoaXMubGFzdFBvaW50ICsgXCIgKHByZXZpb3VzKVwiLCB0aW1lU3BlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sYXN0VGltZXN0YW1wcy5zZXQocG9pbnROYW1lLCBjdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMubGFzdFBvaW50ID0gcG9pbnROYW1lO1xuICAgIH1cblxuICAgIHJlcG9ydChmaWx0ZXI6IFJlcG9ydEZpbHRlciA9IHt9KTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgcmVwb3J0TGluZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGNvbnN0IG1pblRpbWVGaWx0ZXIgPSBmaWx0ZXIubWluVGltZSB8fCAwO1xuICAgICAgICBjb25zdCBtaW5WaXNpdHNGaWx0ZXIgPSBmaWx0ZXIudmlzaXRzIHx8IDA7XG4gICAgICAgIGNvbnN0IHJlcXVpcmVEZXBlbmRlbmNpZXMgPSBmaWx0ZXIucmVxdWlyZURlcGVuZGVuY2llcyB8fCBmYWxzZTtcblxuICAgICAgICAvLyDQpNC40LvRjNGC0YDQsNGG0LjRjyDRgtC+0YfQtdC6XG4gICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goKGRhdGEsIHBvaW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhdmdUaW1lID0gZGF0YS5hdmVyYWdlSXRlcmF0aW9uVGltZSgpO1xuXG4gICAgICAgICAgICBpZiAoYXZnVGltZSA+PSBtaW5UaW1lRmlsdGVyICYmIGRhdGEudG90YWxWaXNpdHMgPj0gbWluVmlzaXRzRmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgLy8g0KTQuNC70YzRgtGA0LDRhtC40Y8g0L/QtdGA0LXRhdC+0LTQvtCyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyZWRUcmFuc2l0aW9ucyA9IG5ldyBNYXA8c3RyaW5nLCBUcmFuc2l0aW9uRGF0YT4oKTtcblxuICAgICAgICAgICAgICAgIGRhdGEudHJhbnNpdGlvbnMuZm9yRWFjaCgodHJhbnNpdGlvbkRhdGEsIGZyb21Qb2ludCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvbkRhdGEuYXZlcmFnZVRpbWUoKSA+PSBtaW5UaW1lRmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZFRyYW5zaXRpb25zLnNldChmcm9tUG9pbnQsIHRyYW5zaXRpb25EYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8g0JTQvtCx0LDQstC70LXQvdC40LUg0LIg0L7RgtGH0LXRgiDRgtC+0LvRjNC60L4g0LXRgdC70Lgg0LXRgdGC0Ywg0L/QtdGA0LXRhdC+0LTRiyDQuNC70Lgg0L3QtSDRgtGA0LXQsdGD0LXRgtGB0Y8g0L7QsdGP0LfQsNGC0LXQu9GM0L3Ri9GFINC30LDQstC40YHQuNC80L7RgdGC0LXQuVxuICAgICAgICAgICAgICAgIGlmICghcmVxdWlyZURlcGVuZGVuY2llcyB8fCBmaWx0ZXJlZFRyYW5zaXRpb25zLnNpemUgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkUG9pbnRXaXRoRmlsdGVyZWRUcmFuc2l0aW9ucyhyZXBvcnRMaW5lcywgcG9pbnQsIGRhdGEsIGZpbHRlcmVkVHJhbnNpdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlcG9ydExpbmVzLmpvaW4oXCJcXG5cIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRQb2ludFdpdGhGaWx0ZXJlZFRyYW5zaXRpb25zKFxuICAgICAgICByZXBvcnRMaW5lczogc3RyaW5nW10sXG4gICAgICAgIHBvaW50OiBzdHJpbmcsXG4gICAgICAgIGRhdGE6IFBvaW50RGF0YSxcbiAgICAgICAgZmlsdGVyZWRUcmFuc2l0aW9uczogTWFwPHN0cmluZywgVHJhbnNpdGlvbkRhdGE+XG4gICAgKSB7XG4gICAgICAgIHJlcG9ydExpbmVzLnB1c2goXG4gICAgICAgICAgICBgJHtjaGFsay5ncmVlbihwb2ludCl9OiBWaXNpdHM9JHtkYXRhLnRvdGFsVmlzaXRzfSwgQXZnVGltZT0ke2NoYWxrLnJlZChkYXRhLmF2ZXJhZ2VJdGVyYXRpb25UaW1lKCkudG9GaXhlZCgyKSl9bXNgXG4gICAgICAgICk7XG5cbiAgICAgICAgZmlsdGVyZWRUcmFuc2l0aW9ucy5mb3JFYWNoKCh0cmFuc2l0aW9uRGF0YSwgZnJvbVBvaW50KSA9PiB7XG4gICAgICAgICAgICByZXBvcnRMaW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgIGAgICR7Y2hhbGsuY3lhbihmcm9tUG9pbnQpfSAtPiAke2NoYWxrLmdyZWVuKHBvaW50KX06IENvdW50PSR7dHJhbnNpdGlvbkRhdGEuY291bnR9LCBNaW49JHt0cmFuc2l0aW9uRGF0YS5taW5UaW1lLnRvRml4ZWQoMil9bXMsIE1heD0ke3RyYW5zaXRpb25EYXRhLm1heFRpbWUudG9GaXhlZCgyKX1tcywgQXZnPSR7Y2hhbGsucmVkKHRyYW5zaXRpb25EYXRhLmF2ZXJhZ2VUaW1lKCkudG9GaXhlZCgyKSl9bXNgXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNsYXNzIFBvaW50RGF0YSB7XG4gICAgdG90YWxWaXNpdHM6IG51bWJlcjtcbiAgICB0b3RhbEl0ZXJhdGlvblRpbWU6IG51bWJlcjtcbiAgICB0cmFuc2l0aW9uczogTWFwPHN0cmluZywgVHJhbnNpdGlvbkRhdGE+O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudG90YWxWaXNpdHMgPSAwO1xuICAgICAgICB0aGlzLnRvdGFsSXRlcmF0aW9uVGltZSA9IDA7XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgaW5jcmVtZW50VmlzaXRzKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnRvdGFsVmlzaXRzICs9IDE7XG4gICAgfVxuXG4gICAgdXBkYXRlSXRlcmF0aW9uVGltZSh0aW1lU3BlbnQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnRvdGFsSXRlcmF0aW9uVGltZSArPSB0aW1lU3BlbnQ7XG4gICAgfVxuXG4gICAgYXZlcmFnZUl0ZXJhdGlvblRpbWUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG90YWxWaXNpdHMgPiAxID8gdGhpcy50b3RhbEl0ZXJhdGlvblRpbWUgLyAodGhpcy50b3RhbFZpc2l0cyAtIDEpIDogMDtcbiAgICB9XG5cbiAgICB1cGRhdGVUcmFuc2l0aW9uKGZyb21Qb2ludDogc3RyaW5nLCB0aW1lU3BlbnQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMudHJhbnNpdGlvbnMuaGFzKGZyb21Qb2ludCkpIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbnMuc2V0KGZyb21Qb2ludCwgbmV3IFRyYW5zaXRpb25EYXRhKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHJhbnNpdGlvbkRhdGEgPSB0aGlzLnRyYW5zaXRpb25zLmdldChmcm9tUG9pbnQpITtcbiAgICAgICAgdHJhbnNpdGlvbkRhdGEudXBkYXRlKHRpbWVTcGVudCk7XG4gICAgfVxufVxuXG5jbGFzcyBUcmFuc2l0aW9uRGF0YSB7XG4gICAgY291bnQ6IG51bWJlcjtcbiAgICB0b3RhbFRpbWU6IG51bWJlcjtcbiAgICBtaW5UaW1lOiBudW1iZXI7XG4gICAgbWF4VGltZTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY291bnQgPSAwO1xuICAgICAgICB0aGlzLnRvdGFsVGltZSA9IDA7XG4gICAgICAgIHRoaXMubWluVGltZSA9IEluZmluaXR5O1xuICAgICAgICB0aGlzLm1heFRpbWUgPSAwO1xuICAgIH1cblxuICAgIHVwZGF0ZSh0aW1lU3BlbnQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmNvdW50ICs9IDE7XG4gICAgICAgIHRoaXMudG90YWxUaW1lICs9IHRpbWVTcGVudDtcbiAgICAgICAgdGhpcy5taW5UaW1lID0gTWF0aC5taW4odGhpcy5taW5UaW1lLCB0aW1lU3BlbnQpO1xuICAgICAgICB0aGlzLm1heFRpbWUgPSBNYXRoLm1heCh0aGlzLm1heFRpbWUsIHRpbWVTcGVudCk7XG4gICAgfVxuXG4gICAgYXZlcmFnZVRpbWUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY291bnQgPiAwID8gdGhpcy50b3RhbFRpbWUgLyB0aGlzLmNvdW50IDogMDtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgTXV0ZXgge1xuICAgIHN0YXRpYyBsb2dBbGxvd2VkID0gdHJ1ZVxuICAgIHByaXZhdGUgX3F1ZXVlOiAoKCkgPT4gdm9pZClbXSA9IFtdO1xuICAgIHByaXZhdGUgX2xvY2sgPSBmYWxzZTtcblxuICAgIGxvY2sobG9nTXNnPzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmIChNdXRleC5sb2dBbGxvd2VkICYmIGxvZ01zZykgY29uc29sZS5sb2coXCJNdXRleCBsb2NrOiBcIiwgbG9nTXNnLCAhdGhpcy5fbG9jaylcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fbG9jaykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJlcygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9xdWV1ZS5wdXNoKHJlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRyeUxvY2sobG9nTXNnPzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLl9sb2NrKSB7XG4gICAgICAgICAgICAvLyDQldGB0LvQuCDQvNGM0Y7RgtC10LrRgSDRg9C20LUg0LfQsNC70L7Rh9C10L0sINCy0L7Qt9Cy0YDQsNGJ0LDQtdC8IGZhbHNlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDQldGB0LvQuCDQvNGM0Y7RgtC10LrRgSDRgdCy0L7QsdC+0LTQtdC9LCDQu9C+0YfQuNC8INC10LPQviDQuCDQstC+0LfQstGA0LDRidCw0LXQvCB0cnVlXG4gICAgICAgICAgICB0aGlzLl9sb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChNdXRleC5sb2dBbGxvd2VkICYmIGxvZ01zZykgY29uc29sZS5sb2coXCJNdXRleCB0cnlMb2NrIHN1Y2Nlc3NmdWw6IFwiLCBsb2dNc2cpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHVubG9jayhsb2dNc2c/OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKE11dGV4LmxvZ0FsbG93ZWQgJiYgbG9nTXNnKSBjb25zb2xlLmxvZyhcIk11dGV4IHVuTG9jazogXCIsIGxvZ01zZylcbiAgICAgICAgaWYgKHRoaXMuX3F1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGZ1bmMgPSB0aGlzLl9xdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgaWYgKGZ1bmMpIGZ1bmMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvY2sgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn0iLCJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7QnJvd3NlciwgQnJvd3NlckNvbnRleHQsIFBhZ2UsIHdlYmtpdH0gZnJvbSAncGxheXdyaWdodCc7XG5pbXBvcnQgV2ViU29ja2V0LCB7V2ViU29ja2V0U2VydmVyfSBmcm9tICd3cyc7XG5pbXBvcnQge1NlcnZlcn0gZnJvbSAnd3MnO1xuaW1wb3J0IHtNdXRleH0gZnJvbSBcIi4vbXV0ZXhcIjtcbmltcG9ydCB7UG9pbnRUcmFja2VyfSBmcm9tIFwiLi9Qb2ludFRyYWNrZXJcIjtcbmltcG9ydCB7V29ya2VyQ29udHJvbGxlcn0gZnJvbSBcIndvcmtlci10aHJlYWRzLW1hbmFnZXIvZGlzdC9zcmNcIjtcblxuaW50ZXJmYWNlIEZyYW1lR3JvdXAge1xuICAgIHN0YXJ0VGltZTogbnVtYmVyO1xuICAgIGZyYW1lSW50ZXJ2YWw6IG51bWJlcjtcbiAgICBmcmFtZUNvdW50OiBudW1iZXI7XG4gICAgdG90YWxIZWlnaHQ6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGltYWdlQnVmZmVyOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBXZWJTb2NrZXRDb21tYW5kIHtcbiAgICBjb21tYW5kOiAnZ2VuZXJhdGVOZXh0R3JvdXAnIHwgJ3NldFN0YXJ0VGltZScgfCAnZ2V0U25hcHNob3QnIHwgJ2xvYWRTbmFwc2hvdCcgfCAnaW5pdGlhbGl6ZUVsZW1lbnRzJztcbiAgICB2YWx1ZT86IGFueTtcbiAgICBpbWFnZUJ1ZmZlcj86IHN0cmluZztcbiAgICBmcmFtZUdyb3VwPzogRnJhbWVHcm91cDtcbn1cblxuZXhwb3J0IGNsYXNzIEhhbmRsZXJzIHtcbiAgICBwcml2YXRlIGJyb3dzZXI6IEJyb3dzZXIgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGNvbnRleHQ6IEJyb3dzZXJDb250ZXh0IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBwYWdlOiBQYWdlIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSB3c3M6IFdlYlNvY2tldFNlcnZlciB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgZnJhbWVSZXF1ZXN0TXV0ZXggPSBuZXcgTXV0ZXgoKTtcbiAgICBwcml2YXRlIHRyYWNrZXIgPSBuZXcgUG9pbnRUcmFja2VyKCk7XG4gICAgcHJpdmF0ZSBsYXN0VGltZTogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgc25hcHNob3Q6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIHJlc29sdmVGdW5jOiAoKHZhbHVlOiBzdHJpbmcpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcml2YXRlIGNsaWVudHM6IFdlYlNvY2tldFtdID0gW107IC8vINCc0LDRgdGB0LjQsiDQtNC70Y8g0YXRgNCw0L3QtdC90LjRjyDQsNC60YLQuNCy0L3Ri9GFINGB0L7QtdC00LjQvdC10L3QuNC5XG5cbiAgICBhc3luYyBpbml0aWFsaXplUGFnZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdpbml0aWFsaXphdGlvbi1zdGFydCcpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmJyb3dzZXIgPSBhd2FpdCB3ZWJraXQubGF1bmNoKCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQgPSBhd2FpdCB0aGlzLmJyb3dzZXIubmV3Q29udGV4dCgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVOZXdQYWdlKCk7XG4gICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ2luaXRpYWxpemF0aW9uLWVuZCcsIFsnaW5pdGlhbGl6YXRpb24tc3RhcnQnXSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVOZXdQYWdlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdwYWdlLWNyZWF0aW9uLXN0YXJ0Jyk7XG4gICAgICAgICAgICB0aGlzLnBhZ2UgPSBhd2FpdCB0aGlzLmNvbnRleHQhLm5ld1BhZ2UoKTtcblxuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3JjL3JlbmRlci9kaXN0L2luZGV4Lmh0bWwnKTtcbiAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgncGFnZS1sb2FkaW5nLXN0YXJ0Jyk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBhZ2UuZ290byhgZmlsZTovLyR7ZmlsZVBhdGh9YCwge3dhaXRVbnRpbDogJ2xvYWQnfSk7XG4gICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3BhZ2UtbG9hZGluZy1lbmQnLCBbJ3BhZ2UtbG9hZGluZy1zdGFydCddKTtcblxuICAgICAgICAgICAgdGhpcy5wYWdlLm9uKCdjb25zb2xlJywgYXN5bmMgKG1zZykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZ0FyZ3MgPSBtc2cuYXJncygpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvZ1ZhbHVlcyA9IGF3YWl0IFByb21pc2UuYWxsKG1zZ0FyZ3MubWFwKGFzeW5jIChhcmcpID0+IGF3YWl0IGFyZy5qc29uVmFsdWUoKSkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIjo6XCIsIC4uLmxvZ1ZhbHVlcyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbG9nZ2luZyBjb25zb2xlIG91dHB1dDpcIiwgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOZXcgcGFnZSBsb2FkZWQnKTtcbiAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgncGFnZS1jcmVhdGlvbi1lbmQnLCBbJ3BhZ2UtY3JlYXRpb24tc3RhcnQnXSk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmluaXRpYWxpemVXZWJTb2NrZXRBbmRXYWl0Rm9yT3BlbigpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgb3IgbG9hZGluZyBuZXcgcGFnZTonLCBlcnJvcik7XG4gICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3BhZ2UtY3JlYXRpb24tZXJyb3InKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgaW5pdGlhbGl6ZVdlYlNvY2tldEFuZFdhaXRGb3JPcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB3c3MgPSBuZXcgU2VydmVyKHtwb3J0OiA4MDgxfSk7XG4gICAgICAgICAgICAgICAgdGhpcy53c3MgPSB3c3M7XG5cbiAgICAgICAgICAgICAgICAvLyDQpNC70LDQsywg0YfRgtC+0LHRiyDQvtGC0YHQu9C10LTQuNGC0YwsINGA0LDQt9GA0LXRiNGR0L0g0LvQuCDRg9C20LUg0L/RgNC+0LzQuNGBXG4gICAgICAgICAgICAgICAgbGV0IGlzUmVzb2x2ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIHdzcy5vbignY29ubmVjdGlvbicsICh3cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnV2ViU29ja2V0IGNvbm5lY3Rpb24gb3BlbmVkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g0JTQvtCx0LDQstC70Y/QtdC8INC90L7QstC+0LUg0YHQvtC10LTQuNC90LXQvdC40LUg0LIg0LzQsNGB0YHQuNCyINC60LvQuNC10L3RgtC+0LJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGllbnRzLnB1c2god3MpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vINCe0YLQv9GA0LDQstC70Y/QtdC8INC60L7QvNCw0L3QtNGDINC00LvRjyDQuNC90LjRhtC40LDQu9C40LfQsNGG0LjQuCDRjdC70LXQvNC10L3RgtC+0LJcbiAgICAgICAgICAgICAgICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7Y29tbWFuZDogJ2luaXRpYWxpemVFbGVtZW50cyd9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g0J7QsdGA0LDQsdCw0YLRi9Cy0LDQtdC8INGB0L7QvtCx0YnQtdC90LjRj1xuICAgICAgICAgICAgICAgICAgICB3cy5vbignbWVzc2FnZScsIGFzeW5jIChtZXNzYWdlOiBXZWJTb2NrZXQuRGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVXZWJTb2NrZXRNZXNzYWdlKHtkYXRhOiBtZXNzYWdlfSBhcyBXZWJTb2NrZXQuTWVzc2FnZUV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g0KPQtNCw0LvRj9C10Lwg0LfQsNC60YDRi9GC0L7QtSDRgdC+0LXQtNC40L3QtdC90LjQtSDQuNC3INC80LDRgdGB0LjQstCwINC60LvQuNC10L3RgtC+0LJcbiAgICAgICAgICAgICAgICAgICAgd3Mub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dlYlNvY2tldCBjb25uZWN0aW9uIGNsb3NlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGllbnRzID0gdGhpcy5jbGllbnRzLmZpbHRlcihjbGllbnQgPT4gY2xpZW50ICE9PSB3cyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vINCe0LHRgNCw0LHQsNGC0YvQstCw0LXQvCDQvtGI0LjQsdC60LhcbiAgICAgICAgICAgICAgICAgICAgd3Mub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdXZWJTb2NrZXQgZXJyb3I6JywgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ2Vycm9yLW9jY3VycmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vINCg0LDQt9GA0LXRiNCw0LXQvCDQv9GA0L7QvNC40YEg0L/QvtGB0LvQtSDQv9C10YDQstC+0LPQviDRg9GB0L/QtdGI0L3QvtCz0L4g0L/QvtC00LrQu9GO0YfQtdC90LjRj1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzUmVzb2x2ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUmVzb2x2ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnV2ViU29ja2V0IHNlcnZlciBpcyBydW5uaW5nIG9uIHdzOi8vbG9jYWxob3N0OjgwODEnKTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc3RhcnQgV2ViU29ja2V0IHNlcnZlcjonLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTsgIC8vIFJlamVjdCB0aGUgcHJvbWlzZSBpZiB0aGVyZSdzIGFuIGVycm9yXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZVdlYlNvY2tldE1lc3NhZ2UoZXZlbnQ6IFdlYlNvY2tldC5NZXNzYWdlRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgbWVzc2FnZTogV2ViU29ja2V0Q29tbWFuZCA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YS50b1N0cmluZygpKTtcbiAgICAgICAgaWYgKG1lc3NhZ2UuY29tbWFuZCA9PT0gJ2xvYWRTbmFwc2hvdCcgJiYgdGhpcy5yZXNvbHZlRnVuYykge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlRnVuYyhtZXNzYWdlLnZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZUZ1bmMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtZXNzYWdlLmZyYW1lR3JvdXApIHtcbiAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgnZ2VuZXJhdGUtbmV4dC1ncm91cC1lbmQnLCBbJ2dlbmVyYXRlLW5leHQtZ3JvdXAtc3RhcnQnXSk7XG4gICAgICAgICAgICBjb25zdCBmcmFtZUdyb3VwID0gbWVzc2FnZS5mcmFtZUdyb3VwO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdyZXNpemUtc3RhcnQnKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBhZ2Uuc2V0Vmlld3BvcnRTaXplKHt3aWR0aDogZnJhbWVHcm91cC53aWR0aCwgaGVpZ2h0OiBmcmFtZUdyb3VwLnRvdGFsSGVpZ2h0fSk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdyZXNpemUtZW5kJywgWydyZXNpemUtc3RhcnQnXSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RUaW1lID0gZnJhbWVHcm91cC5zdGFydFRpbWUgKyBmcmFtZUdyb3VwLmZyYW1lSW50ZXJ2YWwgKiBmcmFtZUdyb3VwLmZyYW1lQ291bnQ7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3JlbmRlci1zdGFydCcpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuY2FwdHVyZVNjcmVlbnNob3QoZnJhbWVHcm91cCk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdyZW5kZXItZW5kJywgWydyZW5kZXItc3RhcnQnXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZVJlcXVlc3RNdXRleC51bmxvY2soJ3JlbmRlci1lbmQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1BhZ2UgaXMgbm90IGF2YWlsYWJsZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjYXB0dXJlU2NyZWVuc2hvdChmcmFtZUdyb3VwOiBGcmFtZUdyb3VwKSB7XG4gICAgICAgIGNvbnN0IG1heFJldHJpZXMgPSA1O1xuICAgICAgICBjb25zdCBkZWxheUJldHdlZW5SZXRyaWVzID0gMTA7XG5cbiAgICAgICAgZm9yIChsZXQgYXR0ZW1wdCA9IDE7IGF0dGVtcHQgPD0gbWF4UmV0cmllczsgYXR0ZW1wdCsrKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgnc2NyZWVuc2hvdC1hdHRlbXB0LXN0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgY29uc3Qge3RvdGFsSGVpZ2h0LCB3aWR0aH0gPSBmcmFtZUdyb3VwO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFnZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ2V2YWx1YXRlLXN0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGFnZS5ldmFsdWF0ZSgodG90YWxIZWlnaHQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hdHJpeC1jb250YWluZXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gYCR7dG90YWxIZWlnaHR9cHhgO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB0b3RhbEhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgnZXZhbHVhdGUtZW5kJywgWydldmFsdWF0ZS1zdGFydCddKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3NlbGVjdG9yLXdhaXQtc3RhcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudEhhbmRsZSA9IGF3YWl0IHRoaXMucGFnZS53YWl0Rm9yU2VsZWN0b3IoJyNtYXRyaXgtY29udGFpbmVyJywge3N0YXRlOiAndmlzaWJsZSd9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdzZWxlY3Rvci13YWl0LWVuZCcsIFsnc2VsZWN0b3Itd2FpdC1zdGFydCddKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBib3VuZGluZ0JveCA9IGF3YWl0IGVsZW1lbnRIYW5kbGUhLmJvdW5kaW5nQm94KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdzY3JlZW5zaG90LXN0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNjcmVlbnNob3RCdWZmZXIgPSBhd2FpdCB0aGlzLnBhZ2Uuc2NyZWVuc2hvdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGlwOiBib3VuZGluZ0JveCEsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3NjcmVlbnNob3QtZW5kJywgWydzY3JlZW5zaG90LXN0YXJ0J10pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vINCk0YDQtdC50Lwg0YHQvtGF0YDQsNC90Y/QtdGC0YHRjywg0L3QviDQvdC1INC+0YLQv9GA0LDQstC70Y/QtdGC0YHRjyDQsiBXZWJTb2NrZXRcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnJhbWVEYXRhOiBGcmFtZUdyb3VwID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBmcmFtZUdyb3VwLnN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYW1lSW50ZXJ2YWw6IGZyYW1lR3JvdXAuZnJhbWVJbnRlcnZhbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYW1lQ291bnQ6IGZyYW1lR3JvdXAuZnJhbWVDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsSGVpZ2h0OiBmcmFtZUdyb3VwLnRvdGFsSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGZyYW1lR3JvdXAud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZUJ1ZmZlcjogc2NyZWVuc2hvdEJ1ZmZlci50b1N0cmluZygnYmFzZTY0JyksXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdzY3JlZW5zaG90LWF0dGVtcHQtZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQYWdlIGlzIG5vdCBhdmFpbGFibGUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdwYWdlLW5vdC1hdmFpbGFibGUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEF0dGVtcHQgJHthdHRlbXB0fSBmYWlsZWQ6YCwgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgnc2NyZWVuc2hvdC1hdHRlbXB0LWZhaWxlZCcpO1xuICAgICAgICAgICAgICAgIGlmIChhdHRlbXB0IDwgbWF4UmV0cmllcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUmV0cnlpbmcgaW4gJHtkZWxheUJldHdlZW5SZXRyaWVzfW1zLi4uYCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkZWxheUJldHdlZW5SZXRyaWVzKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaG91cnMgPSBTdHJpbmcobm93LmdldEhvdXJzKCkpLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1pbnV0ZXMgPSBTdHJpbmcobm93LmdldE1pbnV0ZXMoKSkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2Vjb25kcyA9IFN0cmluZyhub3cuZ2V0U2Vjb25kcygpKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtaWxsaXNlY29uZHMgPSBTdHJpbmcobm93LmdldE1pbGxpc2Vjb25kcygpKS5wYWRTdGFydCgzLCAnMCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVXaXRoTWlsbGlzZWNvbmRzID0gYCR7aG91cnN9OiR7bWludXRlc306JHtzZWNvbmRzfS4ke21pbGxpc2Vjb25kc31gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHRpbWVXaXRoTWlsbGlzZWNvbmRzLCBgRmFpbGVkIHRvIGNhcHR1cmUgc2NyZWVuc2hvdCBhZnRlciAke21heFJldHJpZXN9IGF0dGVtcHRzLmApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3NjcmVlbnNob3QtZmFpbGVkLWZpbmFsJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGdlbmVyYXRlTmV4dEZyYW1lR3JvdXAoKTogUHJvbWlzZTxGcmFtZUdyb3VwIHwgdW5kZWZpbmVkPiB7XG4gICAgICAgIGF3YWl0IHRoaXMuZnJhbWVSZXF1ZXN0TXV0ZXgubG9jaygnZ2VuZXJhdGVOZXh0R3JvdXAnKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQ6IFdlYlNvY2tldENvbW1hbmQgPSB7Y29tbWFuZDogJ2dlbmVyYXRlTmV4dEdyb3VwJ307XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRXZWJTb2NrZXRDb21tYW5kKGNvbW1hbmQpO1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8RnJhbWVHcm91cD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIGhhbmRsZSB0aGUgcmVzcG9uc2UgaW4gdGhlICdtZXNzYWdlJyBldmVudCBvZiB0aGUgaW5kaXZpZHVhbCBXZWJTb2NrZXQgY29ubmVjdGlvblxuICAgICAgICAgICAgICAgIHRoaXMud3NzIS5vbignY29ubmVjdGlvbicsICh3cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB3cy5vbignbWVzc2FnZScsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZTogV2ViU29ja2V0Q29tbWFuZCA9IEpTT04ucGFyc2UoZXZlbnQudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWVzc2FnZS5mcmFtZUdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtZXNzYWdlLmZyYW1lR3JvdXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5mcmFtZVJlcXVlc3RNdXRleC51bmxvY2soJ2dlbmVyYXRlTmV4dEdyb3VwJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZ2V0U25hcHNob3QoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZUZ1bmMgPSByZXNvbHZlO1xuICAgICAgICAgICAgY29uc3QgY29tbWFuZDogV2ViU29ja2V0Q29tbWFuZCA9IHtjb21tYW5kOiAnZ2V0U25hcHNob3QnfTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZFdlYlNvY2tldENvbW1hbmQoY29tbWFuZCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBzZXRTbmFwc2hvdChzbmFwc2hvdDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQ6IFdlYlNvY2tldENvbW1hbmQgPSB7Y29tbWFuZDogJ2xvYWRTbmFwc2hvdCcsIHZhbHVlOiBzbmFwc2hvdH07XG4gICAgICAgIGF3YWl0IHRoaXMuc2VuZFdlYlNvY2tldENvbW1hbmQoY29tbWFuZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzZW5kV2ViU29ja2V0Q29tbWFuZChjb21tYW5kOiBXZWJTb2NrZXRDb21tYW5kKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIC8vINCf0YDQvtGF0L7QtNC40Lwg0L/QviDQstGB0LXQvCDQsNC60YLQuNCy0L3Ri9C8INC60LvQuNC10L3RgtCw0Lwg0Lgg0L7RgtC/0YDQsNCy0LvRj9C10Lwg0LrQvtC80LDQvdC00YNcbiAgICAgICAgdGhpcy5jbGllbnRzLmZvckVhY2god3MgPT4ge1xuICAgICAgICAgICAgaWYgKHdzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICAgICAgICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeShjb21tYW5kKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJXZWJTb2NrZXQgaXMgbm90IG9wZW4uIFVuYWJsZSB0byBzZW5kIGNvbW1hbmQ6XCIsIGNvbW1hbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbldvcmtlckNvbnRyb2xsZXIuaW5pdGlhbGl6ZShuZXcgSGFuZGxlcnMoKSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLldvcmtlckNvbnRyb2xsZXIgPSB2b2lkIDA7XG5jb25zdCB3b3JrZXJfdGhyZWFkc18xID0gcmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpO1xuY29uc3Qgc2VyZGVfdHNfMSA9IHJlcXVpcmUoXCJzZXJkZS10c1wiKTtcbmNsYXNzIFdvcmtlckNvbnRyb2xsZXIge1xuICAgIHN0YXRpYyBpbml0aWFsaXplKGhhbmRsZXJzKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlcnMgPSBoYW5kbGVycztcbiAgICAgICAgLy8gU2VuZCBpbml0aWFsaXphdGlvbiBhY2tub3dsZWRnbWVudCB3aGVuIHRoZSB3b3JrZXIgaXMgZnVsbHkgcmVhZHlcbiAgICAgICAgY29uc3QgaW5pdEFjayA9IHsgdHlwZTogJ2luaXRpYWxpemF0aW9uJyB9O1xuICAgICAgICBpZiAod29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0KSB7XG4gICAgICAgICAgICB3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQucG9zdE1lc3NhZ2UoaW5pdEFjayk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydCkge1xuICAgICAgICAgICAgd29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0Lm9uKCdtZXNzYWdlJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVNZXNzYWdlKGV2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBoYW5kbGVNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3JlcXVlc3QnOlxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlUmVxdWVzdChtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ25vdGlmaWNhdGlvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVOb3RpZmljYXRpb24obWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgVW5rbm93biBtZXNzYWdlIHR5cGU6ICR7bWVzc2FnZS50eXBlfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBoYW5kbGVSZXF1ZXN0KG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgeyByZXF1ZXN0SWQsIHBheWxvYWQgfSA9IG1lc3NhZ2U7XG4gICAgICAgIGNvbnN0IHsgbWV0aG9kTmFtZSwgYXJncyB9ID0gc2VyZGVfdHNfMS5TZXJEZS5kZXNlcmlhbGl6ZShwYXlsb2FkKTtcbiAgICAgICAgaWYgKHRoaXMuaGFuZGxlcnMgJiYgdHlwZW9mIHRoaXMuaGFuZGxlcnNbbWV0aG9kTmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gc2VyZGVfdHNfMS5TZXJEZS5zZXJpYWxpc2UoYXdhaXQgdGhpcy5oYW5kbGVyc1ttZXRob2ROYW1lXSguLi5hcmdzKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geyB0eXBlOiAncmVzcG9uc2UnLCByZXF1ZXN0SWQsIHJlc3VsdCB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAod29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQucG9zdE1lc3NhZ2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHsgdHlwZTogJ3Jlc3BvbnNlJywgcmVxdWVzdElkLCBlcnJvciB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAod29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQucG9zdE1lc3NhZ2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdyZXNwb25zZScsXG4gICAgICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgICAgIHJlc3VsdDogbmV3IEVycm9yKGBNZXRob2QgJHttZXRob2ROYW1lfSBub3QgZm91bmQgb24gaGFuZGxlcnNgKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgICAgICB3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQucG9zdE1lc3NhZ2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBoYW5kbGVOb3RpZmljYXRpb24obWVzc2FnZSkge1xuICAgICAgICBjb25zdCB7IG1ldGhvZE5hbWUsIGFyZ3MgfSA9IG1lc3NhZ2UucGF5bG9hZDtcbiAgICAgICAgaWYgKHRoaXMuaGFuZGxlcnMgJiYgdHlwZW9mIHRoaXMuaGFuZGxlcnNbbWV0aG9kTmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVyc1ttZXRob2ROYW1lXSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGhhbmRsaW5nIG5vdGlmaWNhdGlvbjogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaGFuZGxpbmcgbm90aWZpY2F0aW9uOiB1bmtub3duIGVycm9yJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBOb3RpZmljYXRpb24gbWV0aG9kICR7bWV0aG9kTmFtZX0gbm90IGZvdW5kIG9uIGhhbmRsZXJzYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIHJlZ2lzdGVyQ2xhc3NlcyhjbGFzc2VzKSB7XG4gICAgICAgIHNlcmRlX3RzXzEuU2VyRGUuY2xhc3NSZWdpc3RyYXRpb24oY2xhc3Nlcyk7XG4gICAgfVxufVxuZXhwb3J0cy5Xb3JrZXJDb250cm9sbGVyID0gV29ya2VyQ29udHJvbGxlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVdvcmtlckNvbnRyb2xsZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLldvcmtlck1hbmFnZXIgPSB2b2lkIDA7XG5jb25zdCB3b3JrZXJfdGhyZWFkc18xID0gcmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpO1xuY29uc3Qgc2VyZGVfdHNfMSA9IHJlcXVpcmUoXCJzZXJkZS10c1wiKTtcbmNsYXNzIFdvcmtlck1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKHRpbWVvdXQgPSAyICoqIDMxIC0gMSkge1xuICAgICAgICB0aGlzLndvcmtlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMucmVxdWVzdElkQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMud29ya2VySWRDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5yZXNwb25zZUhhbmRsZXJzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMudGltZW91dCA9IHRpbWVvdXQ7XG4gICAgfVxuICAgIGFzeW5jIGNyZWF0ZVdvcmtlcldpdGhIYW5kbGVycyh3b3JrZXJGaWxlKSB7XG4gICAgICAgIGNvbnN0IHdvcmtlciA9IG5ldyB3b3JrZXJfdGhyZWFkc18xLldvcmtlcih3b3JrZXJGaWxlKTtcbiAgICAgICAgY29uc3Qgd29ya2VySWQgPSArK3RoaXMud29ya2VySWRDb3VudGVyO1xuICAgICAgICB0aGlzLndvcmtlcnMuc2V0KHdvcmtlcklkLCB3b3JrZXIpO1xuICAgICAgICB3b3JrZXIub24oJ21lc3NhZ2UnLCAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVNZXNzYWdlKG1lc3NhZ2UsIHdvcmtlcklkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuc2V0KHdvcmtlcklkLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7IC8vIENsZWFyIHRpbWVvdXQgb24gc3VjY2Vzc1xuICAgICAgICAgICAgICAgIHJlc29sdmUod29ya2VySWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzLmhhcyh3b3JrZXJJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzLmRlbGV0ZSh3b3JrZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1dvcmtlciBpbml0aWFsaXphdGlvbiB0aW1lZCBvdXQnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcy50aW1lb3V0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSwgd29ya2VySWQpIHtcbiAgICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2luaXRpYWxpemF0aW9uJzpcbiAgICAgICAgICAgICAgICBjb25zdCBpbml0SGFuZGxlciA9IHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5nZXQod29ya2VySWQpO1xuICAgICAgICAgICAgICAgIGlmIChpbml0SGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICBpbml0SGFuZGxlcigpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuZGVsZXRlKHdvcmtlcklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyZXNwb25zZSc6XG4gICAgICAgICAgICAgICAgY29uc3QgeyByZXF1ZXN0SWQsIHJlc3VsdCB9ID0gbWVzc2FnZTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZUhhbmRsZXIgPSB0aGlzLnJlc3BvbnNlSGFuZGxlcnMuZ2V0KHJlcXVlc3RJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlSGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZUhhbmRsZXIoc2VyZGVfdHNfMS5TZXJEZS5kZXNlcmlhbGl6ZShyZXN1bHQpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNwb25zZUhhbmRsZXJzLmRlbGV0ZShyZXF1ZXN0SWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ25vdGlmaWNhdGlvbic6XG4gICAgICAgICAgICAgICAgLy8gSGFuZGxlIG5vdGlmaWNhdGlvbnMgaWYgbmVjZXNzYXJ5XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBtZXNzYWdlIHR5cGU6ICR7bWVzc2FnZS50eXBlfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGNhbGwod29ya2VySWQsIG1ldGhvZE5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gdGhpcy53b3JrZXJzLmdldCh3b3JrZXJJZCk7XG4gICAgICAgIGlmICghd29ya2VyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdvcmtlciB3aXRoIElEICR7d29ya2VySWR9IG5vdCBmb3VuZGApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlcXVlc3RJZCA9ICsrdGhpcy5yZXF1ZXN0SWRDb3VudGVyO1xuICAgICAgICBjb25zdCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ3JlcXVlc3QnLFxuICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgcGF5bG9hZDogc2VyZGVfdHNfMS5TZXJEZS5zZXJpYWxpc2UoeyBtZXRob2ROYW1lLCBhcmdzIH0pXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMuZGVsZXRlKHJlcXVlc3RJZCk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignUmVxdWVzdCB0aW1lZCBvdXQnKSk7XG4gICAgICAgICAgICB9LCB0aGlzLnRpbWVvdXQpO1xuICAgICAgICAgICAgdGhpcy5yZXNwb25zZUhhbmRsZXJzLnNldChyZXF1ZXN0SWQsIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTsgLy8gQ2xlYXIgdGltZW91dCBvbiBzdWNjZXNzXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2UocmVxdWVzdCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzZW5kTm90aWZpY2F0aW9uKHdvcmtlcklkLCBtZXRob2ROYW1lLCAuLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IHdvcmtlciA9IHRoaXMud29ya2Vycy5nZXQod29ya2VySWQpO1xuICAgICAgICBpZiAoIXdvcmtlcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXb3JrZXIgd2l0aCBJRCAke3dvcmtlcklkfSBub3QgZm91bmRgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBub3RpZmljYXRpb24gPSB7XG4gICAgICAgICAgICB0eXBlOiAnbm90aWZpY2F0aW9uJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHsgbWV0aG9kTmFtZSwgYXJncyB9XG4gICAgICAgIH07XG4gICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShub3RpZmljYXRpb24pO1xuICAgIH1cbiAgICBhc3luYyB0ZXJtaW5hdGVXb3JrZXIod29ya2VySWQpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gdGhpcy53b3JrZXJzLmdldCh3b3JrZXJJZCk7XG4gICAgICAgIGlmICh3b3JrZXIpIHtcbiAgICAgICAgICAgIGF3YWl0IHdvcmtlci50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgIHRoaXMud29ya2Vycy5kZWxldGUod29ya2VySWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlZ2lzdGVyQ2xhc3NlcyhjbGFzc2VzKSB7XG4gICAgICAgIHNlcmRlX3RzXzEuU2VyRGUuY2xhc3NSZWdpc3RyYXRpb24oY2xhc3Nlcyk7XG4gICAgfVxufVxuZXhwb3J0cy5Xb3JrZXJNYW5hZ2VyID0gV29ya2VyTWFuYWdlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVdvcmtlck1hbmFnZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHBvcnRzLCBwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9Xb3JrZXJNYW5hZ2VyXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9Xb3JrZXJDb250cm9sbGVyXCIpLCBleHBvcnRzKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBsYXl3cmlnaHRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwid3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZTpvc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJub2RlOnByb2Nlc3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZTp0dHlcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGF0aFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKTsiLCJpbXBvcnQgYW5zaVN0eWxlcyBmcm9tICcjYW5zaS1zdHlsZXMnO1xuaW1wb3J0IHN1cHBvcnRzQ29sb3IgZnJvbSAnI3N1cHBvcnRzLWNvbG9yJztcbmltcG9ydCB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L29yZGVyXG5cdHN0cmluZ1JlcGxhY2VBbGwsXG5cdHN0cmluZ0VuY2FzZUNSTEZXaXRoRmlyc3RJbmRleCxcbn0gZnJvbSAnLi91dGlsaXRpZXMuanMnO1xuXG5jb25zdCB7c3Rkb3V0OiBzdGRvdXRDb2xvciwgc3RkZXJyOiBzdGRlcnJDb2xvcn0gPSBzdXBwb3J0c0NvbG9yO1xuXG5jb25zdCBHRU5FUkFUT1IgPSBTeW1ib2woJ0dFTkVSQVRPUicpO1xuY29uc3QgU1RZTEVSID0gU3ltYm9sKCdTVFlMRVInKTtcbmNvbnN0IElTX0VNUFRZID0gU3ltYm9sKCdJU19FTVBUWScpO1xuXG4vLyBgc3VwcG9ydHNDb2xvci5sZXZlbGAg4oaSIGBhbnNpU3R5bGVzLmNvbG9yW25hbWVdYCBtYXBwaW5nXG5jb25zdCBsZXZlbE1hcHBpbmcgPSBbXG5cdCdhbnNpJyxcblx0J2Fuc2knLFxuXHQnYW5zaTI1NicsXG5cdCdhbnNpMTZtJyxcbl07XG5cbmNvbnN0IHN0eWxlcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbmNvbnN0IGFwcGx5T3B0aW9ucyA9IChvYmplY3QsIG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRpZiAob3B0aW9ucy5sZXZlbCAmJiAhKE51bWJlci5pc0ludGVnZXIob3B0aW9ucy5sZXZlbCkgJiYgb3B0aW9ucy5sZXZlbCA+PSAwICYmIG9wdGlvbnMubGV2ZWwgPD0gMykpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1RoZSBgbGV2ZWxgIG9wdGlvbiBzaG91bGQgYmUgYW4gaW50ZWdlciBmcm9tIDAgdG8gMycpO1xuXHR9XG5cblx0Ly8gRGV0ZWN0IGxldmVsIGlmIG5vdCBzZXQgbWFudWFsbHlcblx0Y29uc3QgY29sb3JMZXZlbCA9IHN0ZG91dENvbG9yID8gc3Rkb3V0Q29sb3IubGV2ZWwgOiAwO1xuXHRvYmplY3QubGV2ZWwgPSBvcHRpb25zLmxldmVsID09PSB1bmRlZmluZWQgPyBjb2xvckxldmVsIDogb3B0aW9ucy5sZXZlbDtcbn07XG5cbmV4cG9ydCBjbGFzcyBDaGFsayB7XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc3RydWN0b3ItcmV0dXJuXG5cdFx0cmV0dXJuIGNoYWxrRmFjdG9yeShvcHRpb25zKTtcblx0fVxufVxuXG5jb25zdCBjaGFsa0ZhY3RvcnkgPSBvcHRpb25zID0+IHtcblx0Y29uc3QgY2hhbGsgPSAoLi4uc3RyaW5ncykgPT4gc3RyaW5ncy5qb2luKCcgJyk7XG5cdGFwcGx5T3B0aW9ucyhjaGFsaywgb3B0aW9ucyk7XG5cblx0T2JqZWN0LnNldFByb3RvdHlwZU9mKGNoYWxrLCBjcmVhdGVDaGFsay5wcm90b3R5cGUpO1xuXG5cdHJldHVybiBjaGFsaztcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUNoYWxrKG9wdGlvbnMpIHtcblx0cmV0dXJuIGNoYWxrRmFjdG9yeShvcHRpb25zKTtcbn1cblxuT2JqZWN0LnNldFByb3RvdHlwZU9mKGNyZWF0ZUNoYWxrLnByb3RvdHlwZSwgRnVuY3Rpb24ucHJvdG90eXBlKTtcblxuZm9yIChjb25zdCBbc3R5bGVOYW1lLCBzdHlsZV0gb2YgT2JqZWN0LmVudHJpZXMoYW5zaVN0eWxlcykpIHtcblx0c3R5bGVzW3N0eWxlTmFtZV0gPSB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0Y29uc3QgYnVpbGRlciA9IGNyZWF0ZUJ1aWxkZXIodGhpcywgY3JlYXRlU3R5bGVyKHN0eWxlLm9wZW4sIHN0eWxlLmNsb3NlLCB0aGlzW1NUWUxFUl0pLCB0aGlzW0lTX0VNUFRZXSk7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgc3R5bGVOYW1lLCB7dmFsdWU6IGJ1aWxkZXJ9KTtcblx0XHRcdHJldHVybiBidWlsZGVyO1xuXHRcdH0sXG5cdH07XG59XG5cbnN0eWxlcy52aXNpYmxlID0ge1xuXHRnZXQoKSB7XG5cdFx0Y29uc3QgYnVpbGRlciA9IGNyZWF0ZUJ1aWxkZXIodGhpcywgdGhpc1tTVFlMRVJdLCB0cnVlKTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Zpc2libGUnLCB7dmFsdWU6IGJ1aWxkZXJ9KTtcblx0XHRyZXR1cm4gYnVpbGRlcjtcblx0fSxcbn07XG5cbmNvbnN0IGdldE1vZGVsQW5zaSA9IChtb2RlbCwgbGV2ZWwsIHR5cGUsIC4uLmFyZ3VtZW50c18pID0+IHtcblx0aWYgKG1vZGVsID09PSAncmdiJykge1xuXHRcdGlmIChsZXZlbCA9PT0gJ2Fuc2kxNm0nKSB7XG5cdFx0XHRyZXR1cm4gYW5zaVN0eWxlc1t0eXBlXS5hbnNpMTZtKC4uLmFyZ3VtZW50c18pO1xuXHRcdH1cblxuXHRcdGlmIChsZXZlbCA9PT0gJ2Fuc2kyNTYnKSB7XG5cdFx0XHRyZXR1cm4gYW5zaVN0eWxlc1t0eXBlXS5hbnNpMjU2KGFuc2lTdHlsZXMucmdiVG9BbnNpMjU2KC4uLmFyZ3VtZW50c18pKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYW5zaVN0eWxlc1t0eXBlXS5hbnNpKGFuc2lTdHlsZXMucmdiVG9BbnNpKC4uLmFyZ3VtZW50c18pKTtcblx0fVxuXG5cdGlmIChtb2RlbCA9PT0gJ2hleCcpIHtcblx0XHRyZXR1cm4gZ2V0TW9kZWxBbnNpKCdyZ2InLCBsZXZlbCwgdHlwZSwgLi4uYW5zaVN0eWxlcy5oZXhUb1JnYiguLi5hcmd1bWVudHNfKSk7XG5cdH1cblxuXHRyZXR1cm4gYW5zaVN0eWxlc1t0eXBlXVttb2RlbF0oLi4uYXJndW1lbnRzXyk7XG59O1xuXG5jb25zdCB1c2VkTW9kZWxzID0gWydyZ2InLCAnaGV4JywgJ2Fuc2kyNTYnXTtcblxuZm9yIChjb25zdCBtb2RlbCBvZiB1c2VkTW9kZWxzKSB7XG5cdHN0eWxlc1ttb2RlbF0gPSB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0Y29uc3Qge2xldmVsfSA9IHRoaXM7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3VtZW50c18pIHtcblx0XHRcdFx0Y29uc3Qgc3R5bGVyID0gY3JlYXRlU3R5bGVyKGdldE1vZGVsQW5zaShtb2RlbCwgbGV2ZWxNYXBwaW5nW2xldmVsXSwgJ2NvbG9yJywgLi4uYXJndW1lbnRzXyksIGFuc2lTdHlsZXMuY29sb3IuY2xvc2UsIHRoaXNbU1RZTEVSXSk7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVCdWlsZGVyKHRoaXMsIHN0eWxlciwgdGhpc1tJU19FTVBUWV0pO1xuXHRcdFx0fTtcblx0XHR9LFxuXHR9O1xuXG5cdGNvbnN0IGJnTW9kZWwgPSAnYmcnICsgbW9kZWxbMF0udG9VcHBlckNhc2UoKSArIG1vZGVsLnNsaWNlKDEpO1xuXHRzdHlsZXNbYmdNb2RlbF0gPSB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0Y29uc3Qge2xldmVsfSA9IHRoaXM7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3VtZW50c18pIHtcblx0XHRcdFx0Y29uc3Qgc3R5bGVyID0gY3JlYXRlU3R5bGVyKGdldE1vZGVsQW5zaShtb2RlbCwgbGV2ZWxNYXBwaW5nW2xldmVsXSwgJ2JnQ29sb3InLCAuLi5hcmd1bWVudHNfKSwgYW5zaVN0eWxlcy5iZ0NvbG9yLmNsb3NlLCB0aGlzW1NUWUxFUl0pO1xuXHRcdFx0XHRyZXR1cm4gY3JlYXRlQnVpbGRlcih0aGlzLCBzdHlsZXIsIHRoaXNbSVNfRU1QVFldKTtcblx0XHRcdH07XG5cdFx0fSxcblx0fTtcbn1cblxuY29uc3QgcHJvdG8gPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcygoKSA9PiB7fSwge1xuXHQuLi5zdHlsZXMsXG5cdGxldmVsOiB7XG5cdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gdGhpc1tHRU5FUkFUT1JdLmxldmVsO1xuXHRcdH0sXG5cdFx0c2V0KGxldmVsKSB7XG5cdFx0XHR0aGlzW0dFTkVSQVRPUl0ubGV2ZWwgPSBsZXZlbDtcblx0XHR9LFxuXHR9LFxufSk7XG5cbmNvbnN0IGNyZWF0ZVN0eWxlciA9IChvcGVuLCBjbG9zZSwgcGFyZW50KSA9PiB7XG5cdGxldCBvcGVuQWxsO1xuXHRsZXQgY2xvc2VBbGw7XG5cdGlmIChwYXJlbnQgPT09IHVuZGVmaW5lZCkge1xuXHRcdG9wZW5BbGwgPSBvcGVuO1xuXHRcdGNsb3NlQWxsID0gY2xvc2U7XG5cdH0gZWxzZSB7XG5cdFx0b3BlbkFsbCA9IHBhcmVudC5vcGVuQWxsICsgb3Blbjtcblx0XHRjbG9zZUFsbCA9IGNsb3NlICsgcGFyZW50LmNsb3NlQWxsO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRvcGVuLFxuXHRcdGNsb3NlLFxuXHRcdG9wZW5BbGwsXG5cdFx0Y2xvc2VBbGwsXG5cdFx0cGFyZW50LFxuXHR9O1xufTtcblxuY29uc3QgY3JlYXRlQnVpbGRlciA9IChzZWxmLCBfc3R5bGVyLCBfaXNFbXB0eSkgPT4ge1xuXHQvLyBTaW5nbGUgYXJndW1lbnQgaXMgaG90IHBhdGgsIGltcGxpY2l0IGNvZXJjaW9uIGlzIGZhc3RlciB0aGFuIGFueXRoaW5nXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1pbXBsaWNpdC1jb2VyY2lvblxuXHRjb25zdCBidWlsZGVyID0gKC4uLmFyZ3VtZW50c18pID0+IGFwcGx5U3R5bGUoYnVpbGRlciwgKGFyZ3VtZW50c18ubGVuZ3RoID09PSAxKSA/ICgnJyArIGFyZ3VtZW50c19bMF0pIDogYXJndW1lbnRzXy5qb2luKCcgJykpO1xuXG5cdC8vIFdlIGFsdGVyIHRoZSBwcm90b3R5cGUgYmVjYXVzZSB3ZSBtdXN0IHJldHVybiBhIGZ1bmN0aW9uLCBidXQgdGhlcmUgaXNcblx0Ly8gbm8gd2F5IHRvIGNyZWF0ZSBhIGZ1bmN0aW9uIHdpdGggYSBkaWZmZXJlbnQgcHJvdG90eXBlXG5cdE9iamVjdC5zZXRQcm90b3R5cGVPZihidWlsZGVyLCBwcm90byk7XG5cblx0YnVpbGRlcltHRU5FUkFUT1JdID0gc2VsZjtcblx0YnVpbGRlcltTVFlMRVJdID0gX3N0eWxlcjtcblx0YnVpbGRlcltJU19FTVBUWV0gPSBfaXNFbXB0eTtcblxuXHRyZXR1cm4gYnVpbGRlcjtcbn07XG5cbmNvbnN0IGFwcGx5U3R5bGUgPSAoc2VsZiwgc3RyaW5nKSA9PiB7XG5cdGlmIChzZWxmLmxldmVsIDw9IDAgfHwgIXN0cmluZykge1xuXHRcdHJldHVybiBzZWxmW0lTX0VNUFRZXSA/ICcnIDogc3RyaW5nO1xuXHR9XG5cblx0bGV0IHN0eWxlciA9IHNlbGZbU1RZTEVSXTtcblxuXHRpZiAoc3R5bGVyID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gc3RyaW5nO1xuXHR9XG5cblx0Y29uc3Qge29wZW5BbGwsIGNsb3NlQWxsfSA9IHN0eWxlcjtcblx0aWYgKHN0cmluZy5pbmNsdWRlcygnXFx1MDAxQicpKSB7XG5cdFx0d2hpbGUgKHN0eWxlciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBSZXBsYWNlIGFueSBpbnN0YW5jZXMgYWxyZWFkeSBwcmVzZW50IHdpdGggYSByZS1vcGVuaW5nIGNvZGVcblx0XHRcdC8vIG90aGVyd2lzZSBvbmx5IHRoZSBwYXJ0IG9mIHRoZSBzdHJpbmcgdW50aWwgc2FpZCBjbG9zaW5nIGNvZGVcblx0XHRcdC8vIHdpbGwgYmUgY29sb3JlZCwgYW5kIHRoZSByZXN0IHdpbGwgc2ltcGx5IGJlICdwbGFpbicuXG5cdFx0XHRzdHJpbmcgPSBzdHJpbmdSZXBsYWNlQWxsKHN0cmluZywgc3R5bGVyLmNsb3NlLCBzdHlsZXIub3Blbik7XG5cblx0XHRcdHN0eWxlciA9IHN0eWxlci5wYXJlbnQ7XG5cdFx0fVxuXHR9XG5cblx0Ly8gV2UgY2FuIG1vdmUgYm90aCBuZXh0IGFjdGlvbnMgb3V0IG9mIGxvb3AsIGJlY2F1c2UgcmVtYWluaW5nIGFjdGlvbnMgaW4gbG9vcCB3b24ndCBoYXZlXG5cdC8vIGFueS92aXNpYmxlIGVmZmVjdCBvbiBwYXJ0cyB3ZSBhZGQgaGVyZS4gQ2xvc2UgdGhlIHN0eWxpbmcgYmVmb3JlIGEgbGluZWJyZWFrIGFuZCByZW9wZW5cblx0Ly8gYWZ0ZXIgbmV4dCBsaW5lIHRvIGZpeCBhIGJsZWVkIGlzc3VlIG9uIG1hY09TOiBodHRwczovL2dpdGh1Yi5jb20vY2hhbGsvY2hhbGsvcHVsbC85MlxuXHRjb25zdCBsZkluZGV4ID0gc3RyaW5nLmluZGV4T2YoJ1xcbicpO1xuXHRpZiAobGZJbmRleCAhPT0gLTEpIHtcblx0XHRzdHJpbmcgPSBzdHJpbmdFbmNhc2VDUkxGV2l0aEZpcnN0SW5kZXgoc3RyaW5nLCBjbG9zZUFsbCwgb3BlbkFsbCwgbGZJbmRleCk7XG5cdH1cblxuXHRyZXR1cm4gb3BlbkFsbCArIHN0cmluZyArIGNsb3NlQWxsO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoY3JlYXRlQ2hhbGsucHJvdG90eXBlLCBzdHlsZXMpO1xuXG5jb25zdCBjaGFsayA9IGNyZWF0ZUNoYWxrKCk7XG5leHBvcnQgY29uc3QgY2hhbGtTdGRlcnIgPSBjcmVhdGVDaGFsayh7bGV2ZWw6IHN0ZGVyckNvbG9yID8gc3RkZXJyQ29sb3IubGV2ZWwgOiAwfSk7XG5cbmV4cG9ydCB7XG5cdG1vZGlmaWVyTmFtZXMsXG5cdGZvcmVncm91bmRDb2xvck5hbWVzLFxuXHRiYWNrZ3JvdW5kQ29sb3JOYW1lcyxcblx0Y29sb3JOYW1lcyxcblxuXHQvLyBUT0RPOiBSZW1vdmUgdGhlc2UgYWxpYXNlcyBpbiB0aGUgbmV4dCBtYWpvciB2ZXJzaW9uXG5cdG1vZGlmaWVyTmFtZXMgYXMgbW9kaWZpZXJzLFxuXHRmb3JlZ3JvdW5kQ29sb3JOYW1lcyBhcyBmb3JlZ3JvdW5kQ29sb3JzLFxuXHRiYWNrZ3JvdW5kQ29sb3JOYW1lcyBhcyBiYWNrZ3JvdW5kQ29sb3JzLFxuXHRjb2xvck5hbWVzIGFzIGNvbG9ycyxcbn0gZnJvbSAnLi92ZW5kb3IvYW5zaS1zdHlsZXMvaW5kZXguanMnO1xuXG5leHBvcnQge1xuXHRzdGRvdXRDb2xvciBhcyBzdXBwb3J0c0NvbG9yLFxuXHRzdGRlcnJDb2xvciBhcyBzdXBwb3J0c0NvbG9yU3RkZXJyLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2hhbGs7XG4iLCIvLyBUT0RPOiBXaGVuIHRhcmdldGluZyBOb2RlLmpzIDE2LCB1c2UgYFN0cmluZy5wcm90b3R5cGUucmVwbGFjZUFsbGAuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nUmVwbGFjZUFsbChzdHJpbmcsIHN1YnN0cmluZywgcmVwbGFjZXIpIHtcblx0bGV0IGluZGV4ID0gc3RyaW5nLmluZGV4T2Yoc3Vic3RyaW5nKTtcblx0aWYgKGluZGV4ID09PSAtMSkge1xuXHRcdHJldHVybiBzdHJpbmc7XG5cdH1cblxuXHRjb25zdCBzdWJzdHJpbmdMZW5ndGggPSBzdWJzdHJpbmcubGVuZ3RoO1xuXHRsZXQgZW5kSW5kZXggPSAwO1xuXHRsZXQgcmV0dXJuVmFsdWUgPSAnJztcblx0ZG8ge1xuXHRcdHJldHVyblZhbHVlICs9IHN0cmluZy5zbGljZShlbmRJbmRleCwgaW5kZXgpICsgc3Vic3RyaW5nICsgcmVwbGFjZXI7XG5cdFx0ZW5kSW5kZXggPSBpbmRleCArIHN1YnN0cmluZ0xlbmd0aDtcblx0XHRpbmRleCA9IHN0cmluZy5pbmRleE9mKHN1YnN0cmluZywgZW5kSW5kZXgpO1xuXHR9IHdoaWxlIChpbmRleCAhPT0gLTEpO1xuXG5cdHJldHVyblZhbHVlICs9IHN0cmluZy5zbGljZShlbmRJbmRleCk7XG5cdHJldHVybiByZXR1cm5WYWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ0VuY2FzZUNSTEZXaXRoRmlyc3RJbmRleChzdHJpbmcsIHByZWZpeCwgcG9zdGZpeCwgaW5kZXgpIHtcblx0bGV0IGVuZEluZGV4ID0gMDtcblx0bGV0IHJldHVyblZhbHVlID0gJyc7XG5cdGRvIHtcblx0XHRjb25zdCBnb3RDUiA9IHN0cmluZ1tpbmRleCAtIDFdID09PSAnXFxyJztcblx0XHRyZXR1cm5WYWx1ZSArPSBzdHJpbmcuc2xpY2UoZW5kSW5kZXgsIChnb3RDUiA/IGluZGV4IC0gMSA6IGluZGV4KSkgKyBwcmVmaXggKyAoZ290Q1IgPyAnXFxyXFxuJyA6ICdcXG4nKSArIHBvc3RmaXg7XG5cdFx0ZW5kSW5kZXggPSBpbmRleCArIDE7XG5cdFx0aW5kZXggPSBzdHJpbmcuaW5kZXhPZignXFxuJywgZW5kSW5kZXgpO1xuXHR9IHdoaWxlIChpbmRleCAhPT0gLTEpO1xuXG5cdHJldHVyblZhbHVlICs9IHN0cmluZy5zbGljZShlbmRJbmRleCk7XG5cdHJldHVybiByZXR1cm5WYWx1ZTtcbn1cbiIsImNvbnN0IEFOU0lfQkFDS0dST1VORF9PRkZTRVQgPSAxMDtcblxuY29uc3Qgd3JhcEFuc2kxNiA9IChvZmZzZXQgPSAwKSA9PiBjb2RlID0+IGBcXHUwMDFCWyR7Y29kZSArIG9mZnNldH1tYDtcblxuY29uc3Qgd3JhcEFuc2kyNTYgPSAob2Zmc2V0ID0gMCkgPT4gY29kZSA9PiBgXFx1MDAxQlskezM4ICsgb2Zmc2V0fTs1OyR7Y29kZX1tYDtcblxuY29uc3Qgd3JhcEFuc2kxNm0gPSAob2Zmc2V0ID0gMCkgPT4gKHJlZCwgZ3JlZW4sIGJsdWUpID0+IGBcXHUwMDFCWyR7MzggKyBvZmZzZXR9OzI7JHtyZWR9OyR7Z3JlZW59OyR7Ymx1ZX1tYDtcblxuY29uc3Qgc3R5bGVzID0ge1xuXHRtb2RpZmllcjoge1xuXHRcdHJlc2V0OiBbMCwgMF0sXG5cdFx0Ly8gMjEgaXNuJ3Qgd2lkZWx5IHN1cHBvcnRlZCBhbmQgMjIgZG9lcyB0aGUgc2FtZSB0aGluZ1xuXHRcdGJvbGQ6IFsxLCAyMl0sXG5cdFx0ZGltOiBbMiwgMjJdLFxuXHRcdGl0YWxpYzogWzMsIDIzXSxcblx0XHR1bmRlcmxpbmU6IFs0LCAyNF0sXG5cdFx0b3ZlcmxpbmU6IFs1MywgNTVdLFxuXHRcdGludmVyc2U6IFs3LCAyN10sXG5cdFx0aGlkZGVuOiBbOCwgMjhdLFxuXHRcdHN0cmlrZXRocm91Z2g6IFs5LCAyOV0sXG5cdH0sXG5cdGNvbG9yOiB7XG5cdFx0YmxhY2s6IFszMCwgMzldLFxuXHRcdHJlZDogWzMxLCAzOV0sXG5cdFx0Z3JlZW46IFszMiwgMzldLFxuXHRcdHllbGxvdzogWzMzLCAzOV0sXG5cdFx0Ymx1ZTogWzM0LCAzOV0sXG5cdFx0bWFnZW50YTogWzM1LCAzOV0sXG5cdFx0Y3lhbjogWzM2LCAzOV0sXG5cdFx0d2hpdGU6IFszNywgMzldLFxuXG5cdFx0Ly8gQnJpZ2h0IGNvbG9yXG5cdFx0YmxhY2tCcmlnaHQ6IFs5MCwgMzldLFxuXHRcdGdyYXk6IFs5MCwgMzldLCAvLyBBbGlhcyBvZiBgYmxhY2tCcmlnaHRgXG5cdFx0Z3JleTogWzkwLCAzOV0sIC8vIEFsaWFzIG9mIGBibGFja0JyaWdodGBcblx0XHRyZWRCcmlnaHQ6IFs5MSwgMzldLFxuXHRcdGdyZWVuQnJpZ2h0OiBbOTIsIDM5XSxcblx0XHR5ZWxsb3dCcmlnaHQ6IFs5MywgMzldLFxuXHRcdGJsdWVCcmlnaHQ6IFs5NCwgMzldLFxuXHRcdG1hZ2VudGFCcmlnaHQ6IFs5NSwgMzldLFxuXHRcdGN5YW5CcmlnaHQ6IFs5NiwgMzldLFxuXHRcdHdoaXRlQnJpZ2h0OiBbOTcsIDM5XSxcblx0fSxcblx0YmdDb2xvcjoge1xuXHRcdGJnQmxhY2s6IFs0MCwgNDldLFxuXHRcdGJnUmVkOiBbNDEsIDQ5XSxcblx0XHRiZ0dyZWVuOiBbNDIsIDQ5XSxcblx0XHRiZ1llbGxvdzogWzQzLCA0OV0sXG5cdFx0YmdCbHVlOiBbNDQsIDQ5XSxcblx0XHRiZ01hZ2VudGE6IFs0NSwgNDldLFxuXHRcdGJnQ3lhbjogWzQ2LCA0OV0sXG5cdFx0YmdXaGl0ZTogWzQ3LCA0OV0sXG5cblx0XHQvLyBCcmlnaHQgY29sb3Jcblx0XHRiZ0JsYWNrQnJpZ2h0OiBbMTAwLCA0OV0sXG5cdFx0YmdHcmF5OiBbMTAwLCA0OV0sIC8vIEFsaWFzIG9mIGBiZ0JsYWNrQnJpZ2h0YFxuXHRcdGJnR3JleTogWzEwMCwgNDldLCAvLyBBbGlhcyBvZiBgYmdCbGFja0JyaWdodGBcblx0XHRiZ1JlZEJyaWdodDogWzEwMSwgNDldLFxuXHRcdGJnR3JlZW5CcmlnaHQ6IFsxMDIsIDQ5XSxcblx0XHRiZ1llbGxvd0JyaWdodDogWzEwMywgNDldLFxuXHRcdGJnQmx1ZUJyaWdodDogWzEwNCwgNDldLFxuXHRcdGJnTWFnZW50YUJyaWdodDogWzEwNSwgNDldLFxuXHRcdGJnQ3lhbkJyaWdodDogWzEwNiwgNDldLFxuXHRcdGJnV2hpdGVCcmlnaHQ6IFsxMDcsIDQ5XSxcblx0fSxcbn07XG5cbmV4cG9ydCBjb25zdCBtb2RpZmllck5hbWVzID0gT2JqZWN0LmtleXMoc3R5bGVzLm1vZGlmaWVyKTtcbmV4cG9ydCBjb25zdCBmb3JlZ3JvdW5kQ29sb3JOYW1lcyA9IE9iamVjdC5rZXlzKHN0eWxlcy5jb2xvcik7XG5leHBvcnQgY29uc3QgYmFja2dyb3VuZENvbG9yTmFtZXMgPSBPYmplY3Qua2V5cyhzdHlsZXMuYmdDb2xvcik7XG5leHBvcnQgY29uc3QgY29sb3JOYW1lcyA9IFsuLi5mb3JlZ3JvdW5kQ29sb3JOYW1lcywgLi4uYmFja2dyb3VuZENvbG9yTmFtZXNdO1xuXG5mdW5jdGlvbiBhc3NlbWJsZVN0eWxlcygpIHtcblx0Y29uc3QgY29kZXMgPSBuZXcgTWFwKCk7XG5cblx0Zm9yIChjb25zdCBbZ3JvdXBOYW1lLCBncm91cF0gb2YgT2JqZWN0LmVudHJpZXMoc3R5bGVzKSkge1xuXHRcdGZvciAoY29uc3QgW3N0eWxlTmFtZSwgc3R5bGVdIG9mIE9iamVjdC5lbnRyaWVzKGdyb3VwKSkge1xuXHRcdFx0c3R5bGVzW3N0eWxlTmFtZV0gPSB7XG5cdFx0XHRcdG9wZW46IGBcXHUwMDFCWyR7c3R5bGVbMF19bWAsXG5cdFx0XHRcdGNsb3NlOiBgXFx1MDAxQlske3N0eWxlWzFdfW1gLFxuXHRcdFx0fTtcblxuXHRcdFx0Z3JvdXBbc3R5bGVOYW1lXSA9IHN0eWxlc1tzdHlsZU5hbWVdO1xuXG5cdFx0XHRjb2Rlcy5zZXQoc3R5bGVbMF0sIHN0eWxlWzFdKTtcblx0XHR9XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc3R5bGVzLCBncm91cE5hbWUsIHtcblx0XHRcdHZhbHVlOiBncm91cCxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0pO1xuXHR9XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHN0eWxlcywgJ2NvZGVzJywge1xuXHRcdHZhbHVlOiBjb2Rlcyxcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0fSk7XG5cblx0c3R5bGVzLmNvbG9yLmNsb3NlID0gJ1xcdTAwMUJbMzltJztcblx0c3R5bGVzLmJnQ29sb3IuY2xvc2UgPSAnXFx1MDAxQls0OW0nO1xuXG5cdHN0eWxlcy5jb2xvci5hbnNpID0gd3JhcEFuc2kxNigpO1xuXHRzdHlsZXMuY29sb3IuYW5zaTI1NiA9IHdyYXBBbnNpMjU2KCk7XG5cdHN0eWxlcy5jb2xvci5hbnNpMTZtID0gd3JhcEFuc2kxNm0oKTtcblx0c3R5bGVzLmJnQ29sb3IuYW5zaSA9IHdyYXBBbnNpMTYoQU5TSV9CQUNLR1JPVU5EX09GRlNFVCk7XG5cdHN0eWxlcy5iZ0NvbG9yLmFuc2kyNTYgPSB3cmFwQW5zaTI1NihBTlNJX0JBQ0tHUk9VTkRfT0ZGU0VUKTtcblx0c3R5bGVzLmJnQ29sb3IuYW5zaTE2bSA9IHdyYXBBbnNpMTZtKEFOU0lfQkFDS0dST1VORF9PRkZTRVQpO1xuXG5cdC8vIEZyb20gaHR0cHM6Ly9naXRodWIuY29tL1FpeC0vY29sb3ItY29udmVydC9ibG9iLzNmMGUwZDRlOTJlMjM1Nzk2Y2NiMTdmNmU4NWM3MjA5NGE2NTFmNDkvY29udmVyc2lvbnMuanNcblx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoc3R5bGVzLCB7XG5cdFx0cmdiVG9BbnNpMjU2OiB7XG5cdFx0XHR2YWx1ZShyZWQsIGdyZWVuLCBibHVlKSB7XG5cdFx0XHRcdC8vIFdlIHVzZSB0aGUgZXh0ZW5kZWQgZ3JleXNjYWxlIHBhbGV0dGUgaGVyZSwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mXG5cdFx0XHRcdC8vIGJsYWNrIGFuZCB3aGl0ZS4gbm9ybWFsIHBhbGV0dGUgb25seSBoYXMgNCBncmV5c2NhbGUgc2hhZGVzLlxuXHRcdFx0XHRpZiAocmVkID09PSBncmVlbiAmJiBncmVlbiA9PT0gYmx1ZSkge1xuXHRcdFx0XHRcdGlmIChyZWQgPCA4KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMTY7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKHJlZCA+IDI0OCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDIzMTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCgoKHJlZCAtIDgpIC8gMjQ3KSAqIDI0KSArIDIzMjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiAxNlxuXHRcdFx0XHRcdCsgKDM2ICogTWF0aC5yb3VuZChyZWQgLyAyNTUgKiA1KSlcblx0XHRcdFx0XHQrICg2ICogTWF0aC5yb3VuZChncmVlbiAvIDI1NSAqIDUpKVxuXHRcdFx0XHRcdCsgTWF0aC5yb3VuZChibHVlIC8gMjU1ICogNSk7XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0XHRoZXhUb1JnYjoge1xuXHRcdFx0dmFsdWUoaGV4KSB7XG5cdFx0XHRcdGNvbnN0IG1hdGNoZXMgPSAvW2EtZlxcZF17Nn18W2EtZlxcZF17M30vaS5leGVjKGhleC50b1N0cmluZygxNikpO1xuXHRcdFx0XHRpZiAoIW1hdGNoZXMpIHtcblx0XHRcdFx0XHRyZXR1cm4gWzAsIDAsIDBdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IFtjb2xvclN0cmluZ10gPSBtYXRjaGVzO1xuXG5cdFx0XHRcdGlmIChjb2xvclN0cmluZy5sZW5ndGggPT09IDMpIHtcblx0XHRcdFx0XHRjb2xvclN0cmluZyA9IFsuLi5jb2xvclN0cmluZ10ubWFwKGNoYXJhY3RlciA9PiBjaGFyYWN0ZXIgKyBjaGFyYWN0ZXIpLmpvaW4oJycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgaW50ZWdlciA9IE51bWJlci5wYXJzZUludChjb2xvclN0cmluZywgMTYpO1xuXG5cdFx0XHRcdHJldHVybiBbXG5cdFx0XHRcdFx0LyogZXNsaW50LWRpc2FibGUgbm8tYml0d2lzZSAqL1xuXHRcdFx0XHRcdChpbnRlZ2VyID4+IDE2KSAmIDB4RkYsXG5cdFx0XHRcdFx0KGludGVnZXIgPj4gOCkgJiAweEZGLFxuXHRcdFx0XHRcdGludGVnZXIgJiAweEZGLFxuXHRcdFx0XHRcdC8qIGVzbGludC1lbmFibGUgbm8tYml0d2lzZSAqL1xuXHRcdFx0XHRdO1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0sXG5cdFx0aGV4VG9BbnNpMjU2OiB7XG5cdFx0XHR2YWx1ZTogaGV4ID0+IHN0eWxlcy5yZ2JUb0Fuc2kyNTYoLi4uc3R5bGVzLmhleFRvUmdiKGhleCkpLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0XHRhbnNpMjU2VG9BbnNpOiB7XG5cdFx0XHR2YWx1ZShjb2RlKSB7XG5cdFx0XHRcdGlmIChjb2RlIDwgOCkge1xuXHRcdFx0XHRcdHJldHVybiAzMCArIGNvZGU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY29kZSA8IDE2KSB7XG5cdFx0XHRcdFx0cmV0dXJuIDkwICsgKGNvZGUgLSA4KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCByZWQ7XG5cdFx0XHRcdGxldCBncmVlbjtcblx0XHRcdFx0bGV0IGJsdWU7XG5cblx0XHRcdFx0aWYgKGNvZGUgPj0gMjMyKSB7XG5cdFx0XHRcdFx0cmVkID0gKCgoY29kZSAtIDIzMikgKiAxMCkgKyA4KSAvIDI1NTtcblx0XHRcdFx0XHRncmVlbiA9IHJlZDtcblx0XHRcdFx0XHRibHVlID0gcmVkO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvZGUgLT0gMTY7XG5cblx0XHRcdFx0XHRjb25zdCByZW1haW5kZXIgPSBjb2RlICUgMzY7XG5cblx0XHRcdFx0XHRyZWQgPSBNYXRoLmZsb29yKGNvZGUgLyAzNikgLyA1O1xuXHRcdFx0XHRcdGdyZWVuID0gTWF0aC5mbG9vcihyZW1haW5kZXIgLyA2KSAvIDU7XG5cdFx0XHRcdFx0Ymx1ZSA9IChyZW1haW5kZXIgJSA2KSAvIDU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IE1hdGgubWF4KHJlZCwgZ3JlZW4sIGJsdWUpICogMjtcblxuXHRcdFx0XHRpZiAodmFsdWUgPT09IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gMzA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYml0d2lzZVxuXHRcdFx0XHRsZXQgcmVzdWx0ID0gMzAgKyAoKE1hdGgucm91bmQoYmx1ZSkgPDwgMikgfCAoTWF0aC5yb3VuZChncmVlbikgPDwgMSkgfCBNYXRoLnJvdW5kKHJlZCkpO1xuXG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gMikge1xuXHRcdFx0XHRcdHJlc3VsdCArPSA2MDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0XHRyZ2JUb0Fuc2k6IHtcblx0XHRcdHZhbHVlOiAocmVkLCBncmVlbiwgYmx1ZSkgPT4gc3R5bGVzLmFuc2kyNTZUb0Fuc2koc3R5bGVzLnJnYlRvQW5zaTI1NihyZWQsIGdyZWVuLCBibHVlKSksXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9LFxuXHRcdGhleFRvQW5zaToge1xuXHRcdFx0dmFsdWU6IGhleCA9PiBzdHlsZXMuYW5zaTI1NlRvQW5zaShzdHlsZXMuaGV4VG9BbnNpMjU2KGhleCkpLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0fSk7XG5cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuY29uc3QgYW5zaVN0eWxlcyA9IGFzc2VtYmxlU3R5bGVzKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGFuc2lTdHlsZXM7XG4iLCJpbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IG9zIGZyb20gJ25vZGU6b3MnO1xuaW1wb3J0IHR0eSBmcm9tICdub2RlOnR0eSc7XG5cbi8vIEZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvaGFzLWZsYWcvYmxvYi9tYWluL2luZGV4LmpzXG4vLy8gZnVuY3Rpb24gaGFzRmxhZyhmbGFnLCBhcmd2ID0gZ2xvYmFsVGhpcy5EZW5vPy5hcmdzID8/IHByb2Nlc3MuYXJndikge1xuZnVuY3Rpb24gaGFzRmxhZyhmbGFnLCBhcmd2ID0gZ2xvYmFsVGhpcy5EZW5vID8gZ2xvYmFsVGhpcy5EZW5vLmFyZ3MgOiBwcm9jZXNzLmFyZ3YpIHtcblx0Y29uc3QgcHJlZml4ID0gZmxhZy5zdGFydHNXaXRoKCctJykgPyAnJyA6IChmbGFnLmxlbmd0aCA9PT0gMSA/ICctJyA6ICctLScpO1xuXHRjb25zdCBwb3NpdGlvbiA9IGFyZ3YuaW5kZXhPZihwcmVmaXggKyBmbGFnKTtcblx0Y29uc3QgdGVybWluYXRvclBvc2l0aW9uID0gYXJndi5pbmRleE9mKCctLScpO1xuXHRyZXR1cm4gcG9zaXRpb24gIT09IC0xICYmICh0ZXJtaW5hdG9yUG9zaXRpb24gPT09IC0xIHx8IHBvc2l0aW9uIDwgdGVybWluYXRvclBvc2l0aW9uKTtcbn1cblxuY29uc3Qge2Vudn0gPSBwcm9jZXNzO1xuXG5sZXQgZmxhZ0ZvcmNlQ29sb3I7XG5pZiAoXG5cdGhhc0ZsYWcoJ25vLWNvbG9yJylcblx0fHwgaGFzRmxhZygnbm8tY29sb3JzJylcblx0fHwgaGFzRmxhZygnY29sb3I9ZmFsc2UnKVxuXHR8fCBoYXNGbGFnKCdjb2xvcj1uZXZlcicpXG4pIHtcblx0ZmxhZ0ZvcmNlQ29sb3IgPSAwO1xufSBlbHNlIGlmIChcblx0aGFzRmxhZygnY29sb3InKVxuXHR8fCBoYXNGbGFnKCdjb2xvcnMnKVxuXHR8fCBoYXNGbGFnKCdjb2xvcj10cnVlJylcblx0fHwgaGFzRmxhZygnY29sb3I9YWx3YXlzJylcbikge1xuXHRmbGFnRm9yY2VDb2xvciA9IDE7XG59XG5cbmZ1bmN0aW9uIGVudkZvcmNlQ29sb3IoKSB7XG5cdGlmICgnRk9SQ0VfQ09MT1InIGluIGVudikge1xuXHRcdGlmIChlbnYuRk9SQ0VfQ09MT1IgPT09ICd0cnVlJykge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fVxuXG5cdFx0aWYgKGVudi5GT1JDRV9DT0xPUiA9PT0gJ2ZhbHNlJykge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVudi5GT1JDRV9DT0xPUi5sZW5ndGggPT09IDAgPyAxIDogTWF0aC5taW4oTnVtYmVyLnBhcnNlSW50KGVudi5GT1JDRV9DT0xPUiwgMTApLCAzKTtcblx0fVxufVxuXG5mdW5jdGlvbiB0cmFuc2xhdGVMZXZlbChsZXZlbCkge1xuXHRpZiAobGV2ZWwgPT09IDApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGxldmVsLFxuXHRcdGhhc0Jhc2ljOiB0cnVlLFxuXHRcdGhhczI1NjogbGV2ZWwgPj0gMixcblx0XHRoYXMxNm06IGxldmVsID49IDMsXG5cdH07XG59XG5cbmZ1bmN0aW9uIF9zdXBwb3J0c0NvbG9yKGhhdmVTdHJlYW0sIHtzdHJlYW1Jc1RUWSwgc25pZmZGbGFncyA9IHRydWV9ID0ge30pIHtcblx0Y29uc3Qgbm9GbGFnRm9yY2VDb2xvciA9IGVudkZvcmNlQ29sb3IoKTtcblx0aWYgKG5vRmxhZ0ZvcmNlQ29sb3IgIT09IHVuZGVmaW5lZCkge1xuXHRcdGZsYWdGb3JjZUNvbG9yID0gbm9GbGFnRm9yY2VDb2xvcjtcblx0fVxuXG5cdGNvbnN0IGZvcmNlQ29sb3IgPSBzbmlmZkZsYWdzID8gZmxhZ0ZvcmNlQ29sb3IgOiBub0ZsYWdGb3JjZUNvbG9yO1xuXG5cdGlmIChmb3JjZUNvbG9yID09PSAwKSB7XG5cdFx0cmV0dXJuIDA7XG5cdH1cblxuXHRpZiAoc25pZmZGbGFncykge1xuXHRcdGlmIChoYXNGbGFnKCdjb2xvcj0xNm0nKVxuXHRcdFx0fHwgaGFzRmxhZygnY29sb3I9ZnVsbCcpXG5cdFx0XHR8fCBoYXNGbGFnKCdjb2xvcj10cnVlY29sb3InKSkge1xuXHRcdFx0cmV0dXJuIDM7XG5cdFx0fVxuXG5cdFx0aWYgKGhhc0ZsYWcoJ2NvbG9yPTI1NicpKSB7XG5cdFx0XHRyZXR1cm4gMjtcblx0XHR9XG5cdH1cblxuXHQvLyBDaGVjayBmb3IgQXp1cmUgRGV2T3BzIHBpcGVsaW5lcy5cblx0Ly8gSGFzIHRvIGJlIGFib3ZlIHRoZSBgIXN0cmVhbUlzVFRZYCBjaGVjay5cblx0aWYgKCdURl9CVUlMRCcgaW4gZW52ICYmICdBR0VOVF9OQU1FJyBpbiBlbnYpIHtcblx0XHRyZXR1cm4gMTtcblx0fVxuXG5cdGlmIChoYXZlU3RyZWFtICYmICFzdHJlYW1Jc1RUWSAmJiBmb3JjZUNvbG9yID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gMDtcblx0fVxuXG5cdGNvbnN0IG1pbiA9IGZvcmNlQ29sb3IgfHwgMDtcblxuXHRpZiAoZW52LlRFUk0gPT09ICdkdW1iJykge1xuXHRcdHJldHVybiBtaW47XG5cdH1cblxuXHRpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xuXHRcdC8vIFdpbmRvd3MgMTAgYnVpbGQgMTA1ODYgaXMgdGhlIGZpcnN0IFdpbmRvd3MgcmVsZWFzZSB0aGF0IHN1cHBvcnRzIDI1NiBjb2xvcnMuXG5cdFx0Ly8gV2luZG93cyAxMCBidWlsZCAxNDkzMSBpcyB0aGUgZmlyc3QgcmVsZWFzZSB0aGF0IHN1cHBvcnRzIDE2bS9UcnVlQ29sb3IuXG5cdFx0Y29uc3Qgb3NSZWxlYXNlID0gb3MucmVsZWFzZSgpLnNwbGl0KCcuJyk7XG5cdFx0aWYgKFxuXHRcdFx0TnVtYmVyKG9zUmVsZWFzZVswXSkgPj0gMTBcblx0XHRcdCYmIE51bWJlcihvc1JlbGVhc2VbMl0pID49IDEwXzU4NlxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIE51bWJlcihvc1JlbGVhc2VbMl0pID49IDE0XzkzMSA/IDMgOiAyO1xuXHRcdH1cblxuXHRcdHJldHVybiAxO1xuXHR9XG5cblx0aWYgKCdDSScgaW4gZW52KSB7XG5cdFx0aWYgKCdHSVRIVUJfQUNUSU9OUycgaW4gZW52IHx8ICdHSVRFQV9BQ1RJT05TJyBpbiBlbnYpIHtcblx0XHRcdHJldHVybiAzO1xuXHRcdH1cblxuXHRcdGlmIChbJ1RSQVZJUycsICdDSVJDTEVDSScsICdBUFBWRVlPUicsICdHSVRMQUJfQ0knLCAnQlVJTERLSVRFJywgJ0RST05FJ10uc29tZShzaWduID0+IHNpZ24gaW4gZW52KSB8fCBlbnYuQ0lfTkFNRSA9PT0gJ2NvZGVzaGlwJykge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1pbjtcblx0fVxuXG5cdGlmICgnVEVBTUNJVFlfVkVSU0lPTicgaW4gZW52KSB7XG5cdFx0cmV0dXJuIC9eKDlcXC4oMCpbMS05XVxcZCopXFwufFxcZHsyLH1cXC4pLy50ZXN0KGVudi5URUFNQ0lUWV9WRVJTSU9OKSA/IDEgOiAwO1xuXHR9XG5cblx0aWYgKGVudi5DT0xPUlRFUk0gPT09ICd0cnVlY29sb3InKSB7XG5cdFx0cmV0dXJuIDM7XG5cdH1cblxuXHRpZiAoZW52LlRFUk0gPT09ICd4dGVybS1raXR0eScpIHtcblx0XHRyZXR1cm4gMztcblx0fVxuXG5cdGlmICgnVEVSTV9QUk9HUkFNJyBpbiBlbnYpIHtcblx0XHRjb25zdCB2ZXJzaW9uID0gTnVtYmVyLnBhcnNlSW50KChlbnYuVEVSTV9QUk9HUkFNX1ZFUlNJT04gfHwgJycpLnNwbGl0KCcuJylbMF0sIDEwKTtcblxuXHRcdHN3aXRjaCAoZW52LlRFUk1fUFJPR1JBTSkge1xuXHRcdFx0Y2FzZSAnaVRlcm0uYXBwJzoge1xuXHRcdFx0XHRyZXR1cm4gdmVyc2lvbiA+PSAzID8gMyA6IDI7XG5cdFx0XHR9XG5cblx0XHRcdGNhc2UgJ0FwcGxlX1Rlcm1pbmFsJzoge1xuXHRcdFx0XHRyZXR1cm4gMjtcblx0XHRcdH1cblx0XHRcdC8vIE5vIGRlZmF1bHRcblx0XHR9XG5cdH1cblxuXHRpZiAoLy0yNTYoY29sb3IpPyQvaS50ZXN0KGVudi5URVJNKSkge1xuXHRcdHJldHVybiAyO1xuXHR9XG5cblx0aWYgKC9ec2NyZWVufF54dGVybXxednQxMDB8XnZ0MjIwfF5yeHZ0fGNvbG9yfGFuc2l8Y3lnd2lufGxpbnV4L2kudGVzdChlbnYuVEVSTSkpIHtcblx0XHRyZXR1cm4gMTtcblx0fVxuXG5cdGlmICgnQ09MT1JURVJNJyBpbiBlbnYpIHtcblx0XHRyZXR1cm4gMTtcblx0fVxuXG5cdHJldHVybiBtaW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdXBwb3J0c0NvbG9yKHN0cmVhbSwgb3B0aW9ucyA9IHt9KSB7XG5cdGNvbnN0IGxldmVsID0gX3N1cHBvcnRzQ29sb3Ioc3RyZWFtLCB7XG5cdFx0c3RyZWFtSXNUVFk6IHN0cmVhbSAmJiBzdHJlYW0uaXNUVFksXG5cdFx0Li4ub3B0aW9ucyxcblx0fSk7XG5cblx0cmV0dXJuIHRyYW5zbGF0ZUxldmVsKGxldmVsKTtcbn1cblxuY29uc3Qgc3VwcG9ydHNDb2xvciA9IHtcblx0c3Rkb3V0OiBjcmVhdGVTdXBwb3J0c0NvbG9yKHtpc1RUWTogdHR5LmlzYXR0eSgxKX0pLFxuXHRzdGRlcnI6IGNyZWF0ZVN1cHBvcnRzQ29sb3Ioe2lzVFRZOiB0dHkuaXNhdHR5KDIpfSksXG59O1xuXG5leHBvcnQgZGVmYXVsdCBzdXBwb3J0c0NvbG9yO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy93b3JrZXIudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
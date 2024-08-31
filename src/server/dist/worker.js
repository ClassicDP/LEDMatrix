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
const PointTracker_1 = __webpack_require__(/*! ./PointTracker */ "./src/PointTracker.ts");
const src_1 = __webpack_require__(/*! worker-threads-manager/dist/src */ "../../node_modules/worker-threads-manager/dist/src/index.js");
class Handlers {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.wss = null;
        this.tracker = new PointTracker_1.PointTracker();
        this.resolveFunc = null;
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
    setStartTime(newTime) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sendWebSocketCommand({ command: "setStartTime", value: newTime.valueOf() });
            return new Promise(resolve => {
                this.resolveFunc = resolve;
            });
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
                        this.ws = ws;
                        // Отправляем команду для инициализации элементов
                        ws.send(JSON.stringify({ command: 'initializeElements' }));
                        // Обрабатываем сообщения
                        ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                            yield this.handleWebSocketMessage({ data: message });
                        }));
                        // Удаляем закрытое соединение из массива клиентов
                        ws.on('close', () => {
                            console.log('WebSocket connection closed');
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
            var _a;
            const message = JSON.parse(event.data.toString());
            if ((message.command === 'loadSnapshot' || message.command === 'setStartTime') && this.resolveFunc) {
                this.resolveFunc((_a = message.value) !== null && _a !== void 0 ? _a : '');
                this.resolveFunc = null;
            }
            if (message.frameGroup) {
                this.tracker.point('generate-next-group-end', ['generate-next-group-start']);
                let frameGroup = message.frameGroup;
                if (this.page) {
                    this.tracker.point('resize-start');
                    yield this.page.setViewportSize({ width: frameGroup.width, height: frameGroup.totalHeight });
                    this.tracker.point('resize-end', ['resize-start']);
                    this.lastTime = frameGroup.startTime + frameGroup.frameInterval * frameGroup.frameCount;
                    this.tracker.point('render-start');
                    frameGroup = yield this.captureScreenshot(frameGroup);
                    this.tracker.point('render-end', ['render-start']);
                    if (this.resolveOnMassage && frameGroup) {
                        this.resolveOnMassage(frameGroup);
                    }
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
                        return frameData;
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
            try {
                const command = { command: 'generateNextGroup' };
                const responsePromise = new Promise((resolve) => {
                    this.resolveOnMassage = resolve;
                });
                yield this.sendWebSocketCommand(command);
                // Ждем ответ от клиента, который пришлет frameGroup
                return yield responsePromise;
            }
            finally {
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
            if (this.ws && this.ws.readyState === ws_1.default.OPEN) {
                this.ws.send(JSON.stringify(command));
            }
            else {
                console.error("WebSocket is not open. Unable to send command:", command);
            }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEtBQUssa0RBQWdCO0FBQ3JCO0FBQ0E7QUFDQSxvQkFBb0IsNENBQVU7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxpQ0FBaUMsR0FBRztBQUNwQzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRU8saURBQWlEO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBLEVBQUU7O0FBRUY7QUFDQTs7QUFFQTtBQUNBLDhCQUE4QixPQUFPLDRDQUFVLElBQUk7QUFDbkQsOEJBQThCLE9BQU8sNENBQVUsSUFBSTtBQUNuRDs7QUFFQSxpRUFBZSxhQUFhLEVBQUM7Ozs7Ozs7VUNyTDdCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztVRU5BO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvc2VyZGUtdHMvZGlzdC9TZXJEZS5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9zZXJkZS10cy9kaXN0L2luZGV4LmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL3NlcnZlci9zcmMvUG9pbnRUcmFja2VyLnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL3NlcnZlci9zcmMvd29ya2VyLnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL3dvcmtlci10aHJlYWRzLW1hbmFnZXIvZGlzdC9zcmMvV29ya2VyQ29udHJvbGxlci5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy93b3JrZXItdGhyZWFkcy1tYW5hZ2VyL2Rpc3Qvc3JjL1dvcmtlck1hbmFnZXIuanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvd29ya2VyLXRocmVhZHMtbWFuYWdlci9kaXN0L3NyYy9pbmRleC5qcyIsImZpbGU6Ly8vZXh0ZXJuYWwgY29tbW9uanMgXCJwbGF5d3JpZ2h0XCIiLCJmaWxlOi8vL2V4dGVybmFsIGNvbW1vbmpzIFwid3NcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcIm5vZGU6b3NcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcIm5vZGU6cHJvY2Vzc1wiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwibm9kZTp0dHlcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcInBhdGhcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcIndvcmtlcl90aHJlYWRzXCIiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvY2hhbGsvc291cmNlL2luZGV4LmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL2NoYWxrL3NvdXJjZS91dGlsaXRpZXMuanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvY2hhbGsvc291cmNlL3ZlbmRvci9hbnNpLXN0eWxlcy9pbmRleC5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9jaGFsay9zb3VyY2UvdmVuZG9yL3N1cHBvcnRzLWNvbG9yL2luZGV4LmpzIiwiZmlsZTovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsImZpbGU6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwiZmlsZTovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwiZmlsZTovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0IiwiZmlsZTovLy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwiZmlsZTovLy93ZWJwYWNrL3N0YXJ0dXAiLCJmaWxlOi8vL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuU2VyRGUgPSB2b2lkIDA7XG4vLyBGdW5jdGlvbiB0byBjaGVjayBpZiBhIGdpdmVuIGZ1bmN0aW9uIGlzIGEgY2xhc3MgY29uc3RydWN0b3JcbmZ1bmN0aW9uIGlzQ2xhc3MoZnVuYykge1xuICAgIHJldHVybiB0eXBlb2YgZnVuYyA9PT0gJ2Z1bmN0aW9uJyAmJiAvXlxccypjbGFzc1xccysvLnRlc3QoZnVuYy50b1N0cmluZygpKTtcbn1cbmNsYXNzIFNlckRlIHtcbiAgICAvLyBNZXRob2QgdG8gaGFuZGxlIHNpbXBsZSB0eXBlcyBkaXJlY3RseVxuICAgIHN0YXRpYyBmcm9tU2ltcGxlKG9iaikge1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRGF0ZSB8fCB0eXBlb2Ygb2JqID09PSAnc3RyaW5nJyB8fCB0eXBlb2Ygb2JqID09PSAnbnVtYmVyJyB8fCB0eXBlb2Ygb2JqID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLy8gTWV0aG9kIHRvIHNldCBleGNsdXNpdmUgY2xhc3NlcyBmb3Igc2VyaWFsaXphdGlvblxuICAgIHN0YXRpYyBzZXRFeGNsdXNpdmVseShsaXN0KSB7XG4gICAgICAgIFNlckRlLm9ubHkgPSBuZXcgU2V0KFsuLi5saXN0LCBBcnJheSwgTWFwLCBTZXRdKTtcbiAgICB9XG4gICAgLy8gTWFpbiBzZXJpYWxpemF0aW9uIG1ldGhvZFxuICAgIHN0YXRpYyBzZXJpYWxpc2Uob2JqLCB2aXNpdGVkID0gbmV3IE1hcCgpLCBfbWFwID0gbmV3IE1hcCgpLCBkZXB0aCA9IDAsIHBhcmVudCkge1xuICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2QsIF9lO1xuICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcgfHwgb2JqID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgLy8gSWYgdGhlIG9iamVjdCBpcyBhIGNsYXNzIGFuZCBpcyBub3QgaW4gdGhlIGV4Y2x1c2l2ZSBsaXN0LCBza2lwIHNlcmlhbGl6YXRpb25cbiAgICAgICAgaWYgKCgoX2EgPSBTZXJEZS5vbmx5KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Euc2l6ZSkgJiYgaXNDbGFzcyhvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmouY29uc3RydWN0b3IpICYmICFTZXJEZS5vbmx5LmhhcyhvYmouY29uc3RydWN0b3IpKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIERhdGUpXG4gICAgICAgICAgICByZXR1cm4geyB0OiAnRGF0ZScsIHY6IG9iai52YWx1ZU9mKCkgfTtcbiAgICAgICAgbGV0IG1heWJlU2ltcGxlID0gU2VyRGUuZnJvbVNpbXBsZShvYmopO1xuICAgICAgICBpZiAobWF5YmVTaW1wbGUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHJldHVybiBtYXliZVNpbXBsZTtcbiAgICAgICAgaWYgKHZpc2l0ZWQuaGFzKG9iaikpIHtcbiAgICAgICAgICAgIHZpc2l0ZWQuZ2V0KG9iaikudGltZXMrKztcbiAgICAgICAgICAgIHJldHVybiB7IHQ6IChfYiA9IG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9iai5jb25zdHJ1Y3RvcikgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLm5hbWUsIHY6IHsgX21hcElkOiBTZXJEZS53ZWFrTWFwLmdldChvYmopIH0gfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgICAgICByZXR1cm4geyB0OiAnZnVuY3Rpb24nLCB2OiBvYmoubmFtZSB9O1xuICAgICAgICBpZiAocGFyZW50KVxuICAgICAgICAgICAgdmlzaXRlZC5zZXQob2JqLCB7IHRpbWVzOiAxLCBwYXJlbnQgfSk7XG4gICAgICAgIGxldCBpZCA9IChfYyA9IFNlckRlLndlYWtNYXAuZ2V0KG9iaikpICE9PSBudWxsICYmIF9jICE9PSB2b2lkIDAgPyBfYyA6IFNlckRlLmlkKys7XG4gICAgICAgIFNlckRlLndlYWtNYXAuc2V0KG9iaiwgaWQpO1xuICAgICAgICAvLyBIYW5kbGUgTWFwIG9iamVjdHNcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgbGV0IHNlcmlhbGlzZWQgPSBuZXcgQXJyYXkob2JqLnNpemUpO1xuICAgICAgICAgICAgX21hcC5zZXQoaWQsIHNlcmlhbGlzZWQpO1xuICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgb2JqLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICBzZXJpYWxpc2VkW2ldID0gW1xuICAgICAgICAgICAgICAgICAgICBTZXJEZS5zZXJpYWxpc2Uoa2V5LCB2aXNpdGVkLCBfbWFwLCBkZXB0aCArIDEsIHsgb2JqOiBzZXJpYWxpc2VkLCBrZXk6IFtpLCAwXSB9KSxcbiAgICAgICAgICAgICAgICAgICAgU2VyRGUuc2VyaWFsaXNlKHZhbHVlLCB2aXNpdGVkLCBfbWFwLCBkZXB0aCArIDEsIHsgb2JqOiBzZXJpYWxpc2VkLCBrZXk6IFtpLCAxXSB9KSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgdDogb2JqLmNvbnN0cnVjdG9yLm5hbWUsIHY6IHNlcmlhbGlzZWQgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBIYW5kbGUgU2V0IGFuZCBBcnJheSBvYmplY3RzXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBTZXQgfHwgb2JqIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGxldCBzZXJpYWxpc2VkID0gQXJyYXkob2JqIGluc3RhbmNlb2YgU2V0ID8gb2JqLnNpemUgOiBvYmoubGVuZ3RoKTtcbiAgICAgICAgICAgIF9tYXAuc2V0KGlkLCBzZXJpYWxpc2VkKTtcbiAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgIG9iai5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHNlcmlhbGlzZWRbaV0gPSBTZXJEZS5zZXJpYWxpc2UodmFsdWUsIHZpc2l0ZWQsIF9tYXAsIGRlcHRoICsgMSwgeyBvYmo6IHNlcmlhbGlzZWQsIGtleTogaSB9KTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB7IHQ6IG9iai5jb25zdHJ1Y3Rvci5uYW1lLCB2OiBzZXJpYWxpc2VkIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gSGFuZGxlIGdlbmVyaWMgb2JqZWN0c1xuICAgICAgICBsZXQgc2VyaWFsaXNlZCA9IHt9O1xuICAgICAgICBfbWFwLnNldChpZCwgc2VyaWFsaXNlZCk7XG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgICAgICAgICBzZXJpYWxpc2VkW2tleV0gPSBTZXJEZS5zZXJpYWxpc2UodmFsdWUsIHZpc2l0ZWQsIF9tYXAsIGRlcHRoICsgMSwgeyBvYmo6IHNlcmlhbGlzZWQsIGtleSB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB3ZSBhcmUgYXQgdGhlIHRvcCBsZXZlbCwgaGFuZGxlIGNpcmN1bGFyIHJlZmVyZW5jZXMgYW5kIG11bHRpcGxlIGluc3RhbmNlc1xuICAgICAgICBpZiAoZGVwdGggPT09IDApIHtcbiAgICAgICAgICAgIGxldCByZWN1cnNpb25WaXNpdGVkID0gQXJyYXkuZnJvbSh2aXNpdGVkKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKFtfLCB2YWxdKSA9PiB2YWwudGltZXMgPiAxKVxuICAgICAgICAgICAgICAgIC5tYXAoKFtvYmosIHZhbF0pID0+IFtTZXJEZS53ZWFrTWFwLmdldChvYmopLCB2YWxdKTsgLy8gRXhwbGljaXRseSBjYXN0IGlkIHRvIG51bWJlclxuICAgICAgICAgICAgcmVjdXJzaW9uVmlzaXRlZC5mb3JFYWNoKChbaWQsIHZhbF0pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodmFsLnBhcmVudC5rZXkgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5wYXJlbnQub2JqW3ZhbC5wYXJlbnQua2V5WzBdXVt2YWwucGFyZW50LmtleVsxXV0udiA9IHsgX21hcElkOiBpZCB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgICAgICB2YWwucGFyZW50Lm9ialt2YWwucGFyZW50LmtleV0udiA9IHsgX21hcElkOiBpZCB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQXR0YWNoIHRoZSBfbWFwIGZvciBzZXJpYWxpemF0aW9uIHJlc3VsdFxuICAgICAgICAgICAgcmV0dXJuIHsgdDogKF9kID0gb2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLmNvbnN0cnVjdG9yKSA9PT0gbnVsbCB8fCBfZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2QubmFtZSwgdjogc2VyaWFsaXNlZCwgX21hcDogcmVjdXJzaW9uVmlzaXRlZC5tYXAoKHgpID0+IFt4WzBdLCBfbWFwLmdldCh4WzBdKV0pIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgdDogKF9lID0gb2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLmNvbnN0cnVjdG9yKSA9PT0gbnVsbCB8fCBfZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2UubmFtZSwgdjogc2VyaWFsaXNlZCB9O1xuICAgIH1cbiAgICAvLyBNYWluIGRlc2VyaWFsaXphdGlvbiBtZXRob2RcbiAgICBzdGF0aWMgZGVzZXJpYWxpemUob2JqKSB7XG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2UsIF9mLCBfZywgX2gsIF9qLCBfaywgX2w7XG4gICAgICAgIGlmIChvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICBpZiAoKG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9iai50KSA9PT0gJ0RhdGUnKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG9iai52KTtcbiAgICAgICAgLy8gSWYgb2JqIGlzIGEgcHJpbWl0aXZlLCByZXR1cm4gaXQgZGlyZWN0bHkgKHdpdGggRGF0ZSBoYW5kbGluZylcbiAgICAgICAgaWYgKFNlckRlLmlzUHJpbWl0aXZlKG9iaikpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBEYXRlID8gbmV3IERhdGUob2JqKSA6IG9iajtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2JqLnQgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICByZXR1cm4gKF9hID0gU2VyRGUuY2xhc3NSZWdpc3RyeS5nZXQob2JqLnYpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiB7fTtcbiAgICAgICAgLy8gSGFuZGxlcyB0aGUgcmVzdG9yYXRpb24gb2YgX21hcCBmb3Igb2JqZWN0IHJlZmVyZW5jZXMgaWYgaXQgZXhpc3RzXG4gICAgICAgIGlmIChvYmouX21hcCkge1xuICAgICAgICAgICAgU2VyRGUuX21hcCA9IG5ldyBNYXAob2JqLl9tYXApO1xuICAgICAgICAgICAgU2VyRGUuX3RlbXBNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmV0cmlldmUgdGhlIGNsYXNzIGNvbnN0cnVjdG9yIGlmIGF2YWlsYWJsZVxuICAgICAgICBjb25zdCBjbGFzc0NvbnN0cnVjdG9yID0gU2VyRGUuY2xhc3NSZWdpc3RyeS5nZXQob2JqLnQpO1xuICAgICAgICBsZXQgaW5zdGFuY2U7XG4gICAgICAgIGlmICgoKF9iID0gb2JqLnYpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5fbWFwSWQpICYmICgoX2MgPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLmhhcyhvYmoudi5fbWFwSWQpKSkge1xuICAgICAgICAgICAgcmV0dXJuIChfZCA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2QuZ2V0KG9iai52Ll9tYXBJZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpbnN0YW5jZSA9IGNsYXNzQ29uc3RydWN0b3IgPyBPYmplY3QuY3JlYXRlKGNsYXNzQ29uc3RydWN0b3IucHJvdG90eXBlKSA6IHt9O1xuICAgICAgICAgICAgKF9lID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZS5zZXQob2JqLnYuX21hcElkLCBpbnN0YW5jZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG5lc3RlZCA9IChfaCA9IChfZiA9IFNlckRlLl9tYXApID09PSBudWxsIHx8IF9mID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZi5nZXQoKF9nID0gb2JqLnYpID09PSBudWxsIHx8IF9nID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZy5fbWFwSWQpKSAhPT0gbnVsbCAmJiBfaCAhPT0gdm9pZCAwID8gX2ggOiBvYmoudjtcbiAgICAgICAgLy8gRGVzZXJpYWxpemUgYmFzZWQgb24gdGhlIHR5cGUgb2Ygb2JqZWN0XG4gICAgICAgIHN3aXRjaCAob2JqLnQpIHtcbiAgICAgICAgICAgIGNhc2UgJ0FycmF5JzogLy8gSGFuZGxlIGFycmF5c1xuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmVzdGVkLm1hcCgoaXRlbSkgPT4gU2VyRGUuZGVzZXJpYWxpemUoaXRlbSkpO1xuICAgICAgICAgICAgICAgIChfaiA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2ouc2V0KG9iai52Ll9tYXBJZCwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgICAgIGNhc2UgJ01hcCc6IC8vIEhhbmRsZSBtYXBzXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgTWFwKG5lc3RlZC5tYXAoKFtrZXksIHZhbHVlXSkgPT4gW1NlckRlLmRlc2VyaWFsaXplKGtleSksIFNlckRlLmRlc2VyaWFsaXplKHZhbHVlKV0pKTtcbiAgICAgICAgICAgICAgICAoX2sgPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2sgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9rLnNldChvYmoudi5fbWFwSWQsIGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgICAgICBjYXNlICdTZXQnOiAvLyBIYW5kbGUgc2V0c1xuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IFNldChuZXN0ZWQubWFwKChpdGVtKSA9PiBTZXJEZS5kZXNlcmlhbGl6ZShpdGVtKSkpO1xuICAgICAgICAgICAgICAgIChfbCA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2wuc2V0KG9iai52Ll9tYXBJZCwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6IC8vIEhhbmRsZSBvYmplY3RzXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMobmVzdGVkKSkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtrZXldID0gU2VyRGUuZGVzZXJpYWxpemUodmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2xhc3NDb25zdHJ1Y3RvciAmJiBTZXJEZS5pbml0RnVuY05hbWUgJiYgdHlwZW9mIGluc3RhbmNlW1NlckRlLmluaXRGdW5jTmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VbU2VyRGUuaW5pdEZ1bmNOYW1lXSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBDbGVhciB0aGUgX21hcCBhZnRlciBkZXNlcmlhbGl6YXRpb24gaXMgY29tcGxldGUgdG8gZnJlZSBtZW1vcnlcbiAgICAgICAgaWYgKG9iai5fbWFwKSB7XG4gICAgICAgICAgICBTZXJEZS5fbWFwID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgU2VyRGUuX3RlbXBNYXAgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlOyAvLyBSZXR1cm4gdGhlIGRlc2VyaWFsaXplZCBpbnN0YW5jZVxuICAgIH1cbiAgICAvLyBNZXRob2QgdG8gcmVnaXN0ZXIgY2xhc3NlcyBmb3IgZGVzZXJpYWxpemF0aW9uXG4gICAgc3RhdGljIGNsYXNzUmVnaXN0cmF0aW9uKGNsYXNzZXMpIHtcbiAgICAgICAgY2xhc3Nlcy5mb3JFYWNoKCh4KSA9PiBTZXJEZS5jbGFzc1JlZ2lzdHJ5LnNldCh4Lm5hbWUsIHgpKTtcbiAgICB9XG4gICAgLy8gSGVscGVyIG1ldGhvZCB0byBjaGVjayBpZiBhIHZhbHVlIGlzIHByaW1pdGl2ZVxuICAgIHN0YXRpYyBpc1ByaW1pdGl2ZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gKHZhbHVlID09PSBudWxsIHx8XG4gICAgICAgICAgICBbJ251bWJlcicsICdzdHJpbmcnLCAnYm9vbGVhbicsICd1bmRlZmluZWQnLCAnc3ltYm9sJywgJ2JpZ2ludCddLmluY2x1ZGVzKHR5cGVvZiB2YWx1ZSkgfHxcbiAgICAgICAgICAgIHZhbHVlIGluc3RhbmNlb2YgRGF0ZSk7XG4gICAgfVxufVxuZXhwb3J0cy5TZXJEZSA9IFNlckRlO1xuU2VyRGUuaW5pdEZ1bmNOYW1lID0gJ19pbml0Rm4nOyAvLyBOYW1lIG9mIHRoZSBpbml0aWFsaXphdGlvbiBmdW5jdGlvbiAoaWYgZXhpc3RzKVxuU2VyRGUuaWQgPSAwOyAvLyBVbmlxdWUgSUQgY291bnRlciBmb3Igb2JqZWN0c1xuU2VyRGUud2Vha01hcCA9IG5ldyBXZWFrTWFwKCk7IC8vIFdlYWtNYXAgdG8gdHJhY2sgb2JqZWN0cyBkdXJpbmcgc2VyaWFsaXphdGlvblxuU2VyRGUuY2xhc3NSZWdpc3RyeSA9IG5ldyBNYXAoW1xuICAgIFsnQXJyYXknLCBBcnJheV0sXG4gICAgWydTZXQnLCBTZXRdLFxuICAgIFsnTWFwJywgTWFwXSxcbl0pOyAvLyBSZWdpc3RyeSBvZiBjbGFzc2VzIGZvciBkZXNlcmlhbGl6YXRpb25cbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX2V4cG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9fZXhwb3J0U3RhcikgfHwgZnVuY3Rpb24obSwgZXhwb3J0cykge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZXhwb3J0cywgcCkpIF9fY3JlYXRlQmluZGluZyhleHBvcnRzLCBtLCBwKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vLyBzcmMvaW5kZXgudHNcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9TZXJEZVwiKSwgZXhwb3J0cyk7XG4iLCJpbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuXG5pbnRlcmZhY2UgUmVwb3J0RmlsdGVyIHtcbiAgICBtaW5UaW1lPzogbnVtYmVyO1xuICAgIHZpc2l0cz86IG51bWJlcjtcbiAgICByZXF1aXJlRGVwZW5kZW5jaWVzPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFBvaW50VHJhY2tlciB7XG4gICAgcHJpdmF0ZSBwb2ludHM6IE1hcDxzdHJpbmcsIFBvaW50RGF0YT47XG4gICAgcHJpdmF0ZSBsYXN0VGltZXN0YW1wczogTWFwPHN0cmluZywgbnVtYmVyPjtcbiAgICBwcml2YXRlIGxhc3RQb2ludDogc3RyaW5nIHwgbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnBvaW50cyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5sYXN0VGltZXN0YW1wcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5sYXN0UG9pbnQgPSBudWxsO1xuICAgIH1cblxuICAgIHBvaW50KHBvaW50TmFtZTogc3RyaW5nLCBjaGVja1BvaW50cz86IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgIGlmICghdGhpcy5wb2ludHMuaGFzKHBvaW50TmFtZSkpIHtcbiAgICAgICAgICAgIHRoaXMucG9pbnRzLnNldChwb2ludE5hbWUsIG5ldyBQb2ludERhdGEoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjdXJyZW50UG9pbnREYXRhID0gdGhpcy5wb2ludHMuZ2V0KHBvaW50TmFtZSkhO1xuXG4gICAgICAgIGlmICh0aGlzLmxhc3RUaW1lc3RhbXBzLmhhcyhwb2ludE5hbWUpKSB7XG4gICAgICAgICAgICBjb25zdCB0aW1lU2luY2VMYXN0VmlzaXQgPSBjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWVzdGFtcHMuZ2V0KHBvaW50TmFtZSkhO1xuICAgICAgICAgICAgY3VycmVudFBvaW50RGF0YS51cGRhdGVJdGVyYXRpb25UaW1lKHRpbWVTaW5jZUxhc3RWaXNpdCk7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50UG9pbnREYXRhLmluY3JlbWVudFZpc2l0cygpO1xuXG4gICAgICAgIGlmIChjaGVja1BvaW50cykge1xuICAgICAgICAgICAgY2hlY2tQb2ludHMuZm9yRWFjaCgoY2hlY2tQb2ludE5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0VGltZXN0YW1wcy5oYXMoY2hlY2tQb2ludE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVTcGVudCA9IGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZXN0YW1wcy5nZXQoY2hlY2tQb2ludE5hbWUpITtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFBvaW50RGF0YS51cGRhdGVUcmFuc2l0aW9uKGNoZWNrUG9pbnROYW1lLCB0aW1lU3BlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubGFzdFBvaW50ICE9PSBudWxsICYmIHRoaXMubGFzdFBvaW50ICE9PSBwb2ludE5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVTcGVudCA9IGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZXN0YW1wcy5nZXQodGhpcy5sYXN0UG9pbnQpITtcbiAgICAgICAgICAgIGN1cnJlbnRQb2ludERhdGEudXBkYXRlVHJhbnNpdGlvbih0aGlzLmxhc3RQb2ludCArIFwiIChwcmV2aW91cylcIiwgdGltZVNwZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubGFzdFRpbWVzdGFtcHMuc2V0KHBvaW50TmFtZSwgY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmxhc3RQb2ludCA9IHBvaW50TmFtZTtcbiAgICB9XG5cbiAgICByZXBvcnQoZmlsdGVyOiBSZXBvcnRGaWx0ZXIgPSB7fSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHJlcG9ydExpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCBtaW5UaW1lRmlsdGVyID0gZmlsdGVyLm1pblRpbWUgfHwgMDtcbiAgICAgICAgY29uc3QgbWluVmlzaXRzRmlsdGVyID0gZmlsdGVyLnZpc2l0cyB8fCAwO1xuICAgICAgICBjb25zdCByZXF1aXJlRGVwZW5kZW5jaWVzID0gZmlsdGVyLnJlcXVpcmVEZXBlbmRlbmNpZXMgfHwgZmFsc2U7XG5cbiAgICAgICAgLy8g0KTQuNC70YzRgtGA0LDRhtC40Y8g0YLQvtGH0LXQulxuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKChkYXRhLCBwb2ludCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXZnVGltZSA9IGRhdGEuYXZlcmFnZUl0ZXJhdGlvblRpbWUoKTtcblxuICAgICAgICAgICAgaWYgKGF2Z1RpbWUgPj0gbWluVGltZUZpbHRlciAmJiBkYXRhLnRvdGFsVmlzaXRzID49IG1pblZpc2l0c0ZpbHRlcikge1xuICAgICAgICAgICAgICAgIC8vINCk0LjQu9GM0YLRgNCw0YbQuNGPINC/0LXRgNC10YXQvtC00L7QslxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkVHJhbnNpdGlvbnMgPSBuZXcgTWFwPHN0cmluZywgVHJhbnNpdGlvbkRhdGE+KCk7XG5cbiAgICAgICAgICAgICAgICBkYXRhLnRyYW5zaXRpb25zLmZvckVhY2goKHRyYW5zaXRpb25EYXRhLCBmcm9tUG9pbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25EYXRhLmF2ZXJhZ2VUaW1lKCkgPj0gbWluVGltZUZpbHRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRUcmFuc2l0aW9ucy5zZXQoZnJvbVBvaW50LCB0cmFuc2l0aW9uRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vINCU0L7QsdCw0LLQu9C10L3QuNC1INCyINC+0YLRh9C10YIg0YLQvtC70YzQutC+INC10YHQu9C4INC10YHRgtGMINC/0LXRgNC10YXQvtC00Ysg0LjQu9C4INC90LUg0YLRgNC10LHRg9C10YLRgdGPINC+0LHRj9C30LDRgtC10LvRjNC90YvRhSDQt9Cw0LLQuNGB0LjQvNC+0YHRgtC10LlcbiAgICAgICAgICAgICAgICBpZiAoIXJlcXVpcmVEZXBlbmRlbmNpZXMgfHwgZmlsdGVyZWRUcmFuc2l0aW9ucy5zaXplID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFBvaW50V2l0aEZpbHRlcmVkVHJhbnNpdGlvbnMocmVwb3J0TGluZXMsIHBvaW50LCBkYXRhLCBmaWx0ZXJlZFRyYW5zaXRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXBvcnRMaW5lcy5qb2luKFwiXFxuXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkUG9pbnRXaXRoRmlsdGVyZWRUcmFuc2l0aW9ucyhcbiAgICAgICAgcmVwb3J0TGluZXM6IHN0cmluZ1tdLFxuICAgICAgICBwb2ludDogc3RyaW5nLFxuICAgICAgICBkYXRhOiBQb2ludERhdGEsXG4gICAgICAgIGZpbHRlcmVkVHJhbnNpdGlvbnM6IE1hcDxzdHJpbmcsIFRyYW5zaXRpb25EYXRhPlxuICAgICkge1xuICAgICAgICByZXBvcnRMaW5lcy5wdXNoKFxuICAgICAgICAgICAgYCR7Y2hhbGsuZ3JlZW4ocG9pbnQpfTogVmlzaXRzPSR7ZGF0YS50b3RhbFZpc2l0c30sIEF2Z1RpbWU9JHtjaGFsay5yZWQoZGF0YS5hdmVyYWdlSXRlcmF0aW9uVGltZSgpLnRvRml4ZWQoMikpfW1zYFxuICAgICAgICApO1xuXG4gICAgICAgIGZpbHRlcmVkVHJhbnNpdGlvbnMuZm9yRWFjaCgodHJhbnNpdGlvbkRhdGEsIGZyb21Qb2ludCkgPT4ge1xuICAgICAgICAgICAgcmVwb3J0TGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBgICAke2NoYWxrLmN5YW4oZnJvbVBvaW50KX0gLT4gJHtjaGFsay5ncmVlbihwb2ludCl9OiBDb3VudD0ke3RyYW5zaXRpb25EYXRhLmNvdW50fSwgTWluPSR7dHJhbnNpdGlvbkRhdGEubWluVGltZS50b0ZpeGVkKDIpfW1zLCBNYXg9JHt0cmFuc2l0aW9uRGF0YS5tYXhUaW1lLnRvRml4ZWQoMil9bXMsIEF2Zz0ke2NoYWxrLnJlZCh0cmFuc2l0aW9uRGF0YS5hdmVyYWdlVGltZSgpLnRvRml4ZWQoMikpfW1zYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jbGFzcyBQb2ludERhdGEge1xuICAgIHRvdGFsVmlzaXRzOiBudW1iZXI7XG4gICAgdG90YWxJdGVyYXRpb25UaW1lOiBudW1iZXI7XG4gICAgdHJhbnNpdGlvbnM6IE1hcDxzdHJpbmcsIFRyYW5zaXRpb25EYXRhPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnRvdGFsVmlzaXRzID0gMDtcbiAgICAgICAgdGhpcy50b3RhbEl0ZXJhdGlvblRpbWUgPSAwO1xuICAgICAgICB0aGlzLnRyYW5zaXRpb25zID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIGluY3JlbWVudFZpc2l0cygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy50b3RhbFZpc2l0cyArPSAxO1xuICAgIH1cblxuICAgIHVwZGF0ZUl0ZXJhdGlvblRpbWUodGltZVNwZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy50b3RhbEl0ZXJhdGlvblRpbWUgKz0gdGltZVNwZW50O1xuICAgIH1cblxuICAgIGF2ZXJhZ2VJdGVyYXRpb25UaW1lKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvdGFsVmlzaXRzID4gMSA/IHRoaXMudG90YWxJdGVyYXRpb25UaW1lIC8gKHRoaXMudG90YWxWaXNpdHMgLSAxKSA6IDA7XG4gICAgfVxuXG4gICAgdXBkYXRlVHJhbnNpdGlvbihmcm9tUG9pbnQ6IHN0cmluZywgdGltZVNwZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLnRyYW5zaXRpb25zLmhhcyhmcm9tUG9pbnQpKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25zLnNldChmcm9tUG9pbnQsIG5ldyBUcmFuc2l0aW9uRGF0YSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRyYW5zaXRpb25EYXRhID0gdGhpcy50cmFuc2l0aW9ucy5nZXQoZnJvbVBvaW50KSE7XG4gICAgICAgIHRyYW5zaXRpb25EYXRhLnVwZGF0ZSh0aW1lU3BlbnQpO1xuICAgIH1cbn1cblxuY2xhc3MgVHJhbnNpdGlvbkRhdGEge1xuICAgIGNvdW50OiBudW1iZXI7XG4gICAgdG90YWxUaW1lOiBudW1iZXI7XG4gICAgbWluVGltZTogbnVtYmVyO1xuICAgIG1heFRpbWU6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvdW50ID0gMDtcbiAgICAgICAgdGhpcy50b3RhbFRpbWUgPSAwO1xuICAgICAgICB0aGlzLm1pblRpbWUgPSBJbmZpbml0eTtcbiAgICAgICAgdGhpcy5tYXhUaW1lID0gMDtcbiAgICB9XG5cbiAgICB1cGRhdGUodGltZVNwZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jb3VudCArPSAxO1xuICAgICAgICB0aGlzLnRvdGFsVGltZSArPSB0aW1lU3BlbnQ7XG4gICAgICAgIHRoaXMubWluVGltZSA9IE1hdGgubWluKHRoaXMubWluVGltZSwgdGltZVNwZW50KTtcbiAgICAgICAgdGhpcy5tYXhUaW1lID0gTWF0aC5tYXgodGhpcy5tYXhUaW1lLCB0aW1lU3BlbnQpO1xuICAgIH1cblxuICAgIGF2ZXJhZ2VUaW1lKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvdW50ID4gMCA/IHRoaXMudG90YWxUaW1lIC8gdGhpcy5jb3VudCA6IDA7XG4gICAgfVxufVxuIiwiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge0Jyb3dzZXIsIEJyb3dzZXJDb250ZXh0LCBQYWdlLCB3ZWJraXR9IGZyb20gJ3BsYXl3cmlnaHQnO1xuaW1wb3J0IFdlYlNvY2tldCwge1dlYlNvY2tldFNlcnZlcn0gZnJvbSAnd3MnO1xuaW1wb3J0IHtTZXJ2ZXJ9IGZyb20gJ3dzJztcbmltcG9ydCB7UG9pbnRUcmFja2VyfSBmcm9tIFwiLi9Qb2ludFRyYWNrZXJcIjtcbmltcG9ydCB7V29ya2VyQ29udHJvbGxlcn0gZnJvbSBcIndvcmtlci10aHJlYWRzLW1hbmFnZXIvZGlzdC9zcmNcIjtcblxuaW50ZXJmYWNlIEZyYW1lR3JvdXAge1xuICAgIHN0YXJ0VGltZTogbnVtYmVyO1xuICAgIGZyYW1lSW50ZXJ2YWw6IG51bWJlcjtcbiAgICBmcmFtZUNvdW50OiBudW1iZXI7XG4gICAgdG90YWxIZWlnaHQ6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGltYWdlQnVmZmVyOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBXZWJTb2NrZXRDb21tYW5kIHtcbiAgICBjb21tYW5kOiAnZ2VuZXJhdGVOZXh0R3JvdXAnIHwgJ3NldFN0YXJ0VGltZScgfCAnZ2V0U25hcHNob3QnIHwgJ2xvYWRTbmFwc2hvdCcgfCAnaW5pdGlhbGl6ZUVsZW1lbnRzJztcbiAgICB2YWx1ZT86IGFueTtcbiAgICBpbWFnZUJ1ZmZlcj86IHN0cmluZztcbiAgICBmcmFtZUdyb3VwPzogRnJhbWVHcm91cDtcbn1cblxuZXhwb3J0IGNsYXNzIEhhbmRsZXJzIHtcbiAgICBwcml2YXRlIGJyb3dzZXI6IEJyb3dzZXIgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGNvbnRleHQ6IEJyb3dzZXJDb250ZXh0IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBwYWdlOiBQYWdlIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSB3c3M6IFdlYlNvY2tldFNlcnZlciB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmVzb2x2ZU9uTWFzc2FnZTogKCh2YWx1ZTogRnJhbWVHcm91cCB8IFByb21pc2VMaWtlPEZyYW1lR3JvdXA+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZFxuICAgIHByaXZhdGUgdHJhY2tlciA9IG5ldyBQb2ludFRyYWNrZXIoKTtcbiAgICBwcml2YXRlIGxhc3RUaW1lOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBzbmFwc2hvdDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgcmVzb2x2ZUZ1bmM6ICgodmFsdWU6IHN0cmluZykgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHdzOiBXZWJTb2NrZXQgfCB1bmRlZmluZWQ7XG5cbiAgICBhc3luYyBpbml0aWFsaXplUGFnZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdpbml0aWFsaXphdGlvbi1zdGFydCcpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmJyb3dzZXIgPSBhd2FpdCB3ZWJraXQubGF1bmNoKCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQgPSBhd2FpdCB0aGlzLmJyb3dzZXIubmV3Q29udGV4dCgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVOZXdQYWdlKCk7XG4gICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ2luaXRpYWxpemF0aW9uLWVuZCcsIFsnaW5pdGlhbGl6YXRpb24tc3RhcnQnXSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgc2V0U3RhcnRUaW1lIChuZXdUaW1lOiBudW1iZXIgfCBEYXRlKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2VuZFdlYlNvY2tldENvbW1hbmQoe2NvbW1hbmQ6IFwic2V0U3RhcnRUaW1lXCIsIHZhbHVlOiBuZXdUaW1lLnZhbHVlT2YoKX0pXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZUZ1bmMgPSByZXNvbHZlXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVOZXdQYWdlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdwYWdlLWNyZWF0aW9uLXN0YXJ0Jyk7XG4gICAgICAgICAgICB0aGlzLnBhZ2UgPSBhd2FpdCB0aGlzLmNvbnRleHQhLm5ld1BhZ2UoKTtcblxuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3JjL3JlbmRlci9kaXN0L2luZGV4Lmh0bWwnKTtcbiAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgncGFnZS1sb2FkaW5nLXN0YXJ0Jyk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBhZ2UuZ290byhgZmlsZTovLyR7ZmlsZVBhdGh9YCwge3dhaXRVbnRpbDogJ2xvYWQnfSk7XG4gICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3BhZ2UtbG9hZGluZy1lbmQnLCBbJ3BhZ2UtbG9hZGluZy1zdGFydCddKTtcblxuICAgICAgICAgICAgdGhpcy5wYWdlLm9uKCdjb25zb2xlJywgYXN5bmMgKG1zZykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZ0FyZ3MgPSBtc2cuYXJncygpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvZ1ZhbHVlcyA9IGF3YWl0IFByb21pc2UuYWxsKG1zZ0FyZ3MubWFwKGFzeW5jIChhcmcpID0+IGF3YWl0IGFyZy5qc29uVmFsdWUoKSkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIjo6XCIsIC4uLmxvZ1ZhbHVlcyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbG9nZ2luZyBjb25zb2xlIG91dHB1dDpcIiwgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOZXcgcGFnZSBsb2FkZWQnKTtcbiAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgncGFnZS1jcmVhdGlvbi1lbmQnLCBbJ3BhZ2UtY3JlYXRpb24tc3RhcnQnXSk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmluaXRpYWxpemVXZWJTb2NrZXRBbmRXYWl0Rm9yT3BlbigpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgb3IgbG9hZGluZyBuZXcgcGFnZTonLCBlcnJvcik7XG4gICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3BhZ2UtY3JlYXRpb24tZXJyb3InKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgaW5pdGlhbGl6ZVdlYlNvY2tldEFuZFdhaXRGb3JPcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB3c3MgPSBuZXcgU2VydmVyKHtwb3J0OiA4MDgxfSk7XG4gICAgICAgICAgICAgICAgdGhpcy53c3MgPSB3c3M7XG5cbiAgICAgICAgICAgICAgICAvLyDQpNC70LDQsywg0YfRgtC+0LHRiyDQvtGC0YHQu9C10LTQuNGC0YwsINGA0LDQt9GA0LXRiNGR0L0g0LvQuCDRg9C20LUg0L/RgNC+0LzQuNGBXG4gICAgICAgICAgICAgICAgbGV0IGlzUmVzb2x2ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIHdzcy5vbignY29ubmVjdGlvbicsICh3cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnV2ViU29ja2V0IGNvbm5lY3Rpb24gb3BlbmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud3MgPSB3c1xuXG4gICAgICAgICAgICAgICAgICAgIC8vINCe0YLQv9GA0LDQstC70Y/QtdC8INC60L7QvNCw0L3QtNGDINC00LvRjyDQuNC90LjRhtC40LDQu9C40LfQsNGG0LjQuCDRjdC70LXQvNC10L3RgtC+0LJcbiAgICAgICAgICAgICAgICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7Y29tbWFuZDogJ2luaXRpYWxpemVFbGVtZW50cyd9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g0J7QsdGA0LDQsdCw0YLRi9Cy0LDQtdC8INGB0L7QvtCx0YnQtdC90LjRj1xuICAgICAgICAgICAgICAgICAgICB3cy5vbignbWVzc2FnZScsIGFzeW5jIChtZXNzYWdlOiBXZWJTb2NrZXQuRGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVXZWJTb2NrZXRNZXNzYWdlKHtkYXRhOiBtZXNzYWdlfSBhcyBXZWJTb2NrZXQuTWVzc2FnZUV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g0KPQtNCw0LvRj9C10Lwg0LfQsNC60YDRi9GC0L7QtSDRgdC+0LXQtNC40L3QtdC90LjQtSDQuNC3INC80LDRgdGB0LjQstCwINC60LvQuNC10L3RgtC+0LJcbiAgICAgICAgICAgICAgICAgICAgd3Mub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dlYlNvY2tldCBjb25uZWN0aW9uIGNsb3NlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyDQntCx0YDQsNCx0LDRgtGL0LLQsNC10Lwg0L7RiNC40LHQutC4XG4gICAgICAgICAgICAgICAgICAgIHdzLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignV2ViU29ja2V0IGVycm9yOicsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdlcnJvci1vY2N1cnJlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyDQoNCw0LfRgNC10YjQsNC10Lwg0L/RgNC+0LzQuNGBINC/0L7RgdC70LUg0L/QtdGA0LLQvtCz0L4g0YPRgdC/0LXRiNC90L7Qs9C+INC/0L7QtNC60LvRjtGH0LXQvdC40Y9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1Jlc29sdmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1Jlc29sdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dlYlNvY2tldCBzZXJ2ZXIgaXMgcnVubmluZyBvbiB3czovL2xvY2FsaG9zdDo4MDgxJyk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHN0YXJ0IFdlYlNvY2tldCBzZXJ2ZXI6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7ICAvLyBSZWplY3QgdGhlIHByb21pc2UgaWYgdGhlcmUncyBhbiBlcnJvclxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVXZWJTb2NrZXRNZXNzYWdlKGV2ZW50OiBXZWJTb2NrZXQuTWVzc2FnZUV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2U6IFdlYlNvY2tldENvbW1hbmQgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEudG9TdHJpbmcoKSk7XG4gICAgICAgIGlmICgobWVzc2FnZS5jb21tYW5kID09PSAnbG9hZFNuYXBzaG90JyB8fCBtZXNzYWdlLmNvbW1hbmQgPT09ICdzZXRTdGFydFRpbWUnKSAmJiB0aGlzLnJlc29sdmVGdW5jKSB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmVGdW5jKG1lc3NhZ2UudmFsdWUgPz8gJycpO1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlRnVuYyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lc3NhZ2UuZnJhbWVHcm91cCkge1xuICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdnZW5lcmF0ZS1uZXh0LWdyb3VwLWVuZCcsIFsnZ2VuZXJhdGUtbmV4dC1ncm91cC1zdGFydCddKTtcbiAgICAgICAgICAgIGxldCBmcmFtZUdyb3VwOiBGcmFtZUdyb3VwIHwgdW5kZWZpbmVkID0gbWVzc2FnZS5mcmFtZUdyb3VwO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdyZXNpemUtc3RhcnQnKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBhZ2Uuc2V0Vmlld3BvcnRTaXplKHt3aWR0aDogZnJhbWVHcm91cC53aWR0aCwgaGVpZ2h0OiBmcmFtZUdyb3VwLnRvdGFsSGVpZ2h0fSk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdyZXNpemUtZW5kJywgWydyZXNpemUtc3RhcnQnXSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RUaW1lID0gZnJhbWVHcm91cC5zdGFydFRpbWUgKyBmcmFtZUdyb3VwLmZyYW1lSW50ZXJ2YWwgKiBmcmFtZUdyb3VwLmZyYW1lQ291bnQ7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3JlbmRlci1zdGFydCcpO1xuICAgICAgICAgICAgICAgIGZyYW1lR3JvdXAgPSBhd2FpdCB0aGlzLmNhcHR1cmVTY3JlZW5zaG90KGZyYW1lR3JvdXApO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgncmVuZGVyLWVuZCcsIFsncmVuZGVyLXN0YXJ0J10pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlc29sdmVPbk1hc3NhZ2UgJiYgZnJhbWVHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29sdmVPbk1hc3NhZ2UoZnJhbWVHcm91cClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQYWdlIGlzIG5vdCBhdmFpbGFibGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY2FwdHVyZVNjcmVlbnNob3QoZnJhbWVHcm91cDogRnJhbWVHcm91cCkge1xuICAgICAgICBjb25zdCBtYXhSZXRyaWVzID0gNTtcbiAgICAgICAgY29uc3QgZGVsYXlCZXR3ZWVuUmV0cmllcyA9IDEwO1xuXG4gICAgICAgIGZvciAobGV0IGF0dGVtcHQgPSAxOyBhdHRlbXB0IDw9IG1heFJldHJpZXM7IGF0dGVtcHQrKykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3NjcmVlbnNob3QtYXR0ZW1wdC1zdGFydCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHt0b3RhbEhlaWdodCwgd2lkdGh9ID0gZnJhbWVHcm91cDtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdldmFsdWF0ZS1zdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBhZ2UuZXZhbHVhdGUoKHRvdGFsSGVpZ2h0OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXRyaXgtY29udGFpbmVyJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGAke3RvdGFsSGVpZ2h0fXB4YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgdG90YWxIZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ2V2YWx1YXRlLWVuZCcsIFsnZXZhbHVhdGUtc3RhcnQnXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdzZWxlY3Rvci13YWl0LXN0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRIYW5kbGUgPSBhd2FpdCB0aGlzLnBhZ2Uud2FpdEZvclNlbGVjdG9yKCcjbWF0cml4LWNvbnRhaW5lcicsIHtzdGF0ZTogJ3Zpc2libGUnfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgnc2VsZWN0b3Itd2FpdC1lbmQnLCBbJ3NlbGVjdG9yLXdhaXQtc3RhcnQnXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYm91bmRpbmdCb3ggPSBhd2FpdCBlbGVtZW50SGFuZGxlIS5ib3VuZGluZ0JveCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgnc2NyZWVuc2hvdC1zdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzY3JlZW5zaG90QnVmZmVyID0gYXdhaXQgdGhpcy5wYWdlLnNjcmVlbnNob3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xpcDogYm91bmRpbmdCb3ghLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMTAwLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdzY3JlZW5zaG90LWVuZCcsIFsnc2NyZWVuc2hvdC1zdGFydCddKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyDQpNGA0LXQudC8INGB0L7RhdGA0LDQvdGP0LXRgtGB0Y8sINC90L4g0L3QtSDQvtGC0L/RgNCw0LLQu9GP0LXRgtGB0Y8g0LIgV2ViU29ja2V0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZyYW1lRGF0YTogRnJhbWVHcm91cCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZTogZnJhbWVHcm91cC5zdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFtZUludGVydmFsOiBmcmFtZUdyb3VwLmZyYW1lSW50ZXJ2YWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFtZUNvdW50OiBmcmFtZUdyb3VwLmZyYW1lQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbEhlaWdodDogZnJhbWVHcm91cC50b3RhbEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBmcmFtZUdyb3VwLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VCdWZmZXI6IHNjcmVlbnNob3RCdWZmZXIudG9TdHJpbmcoJ2Jhc2U2NCcpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgnc2NyZWVuc2hvdC1hdHRlbXB0LWVuZCcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnJhbWVEYXRhO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1BhZ2UgaXMgbm90IGF2YWlsYWJsZScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3BhZ2Utbm90LWF2YWlsYWJsZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQXR0ZW1wdCAke2F0dGVtcHR9IGZhaWxlZDpgLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdzY3JlZW5zaG90LWF0dGVtcHQtZmFpbGVkJyk7XG4gICAgICAgICAgICAgICAgaWYgKGF0dGVtcHQgPCBtYXhSZXRyaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBSZXRyeWluZyBpbiAke2RlbGF5QmV0d2VlblJldHJpZXN9bXMuLi5gKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGRlbGF5QmV0d2VlblJldHJpZXMpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBob3VycyA9IFN0cmluZyhub3cuZ2V0SG91cnMoKSkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWludXRlcyA9IFN0cmluZyhub3cuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWNvbmRzID0gU3RyaW5nKG5vdy5nZXRTZWNvbmRzKCkpLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1pbGxpc2Vjb25kcyA9IFN0cmluZyhub3cuZ2V0TWlsbGlzZWNvbmRzKCkpLnBhZFN0YXJ0KDMsICcwJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltZVdpdGhNaWxsaXNlY29uZHMgPSBgJHtob3Vyc306JHttaW51dGVzfToke3NlY29uZHN9LiR7bWlsbGlzZWNvbmRzfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IodGltZVdpdGhNaWxsaXNlY29uZHMsIGBGYWlsZWQgdG8gY2FwdHVyZSBzY3JlZW5zaG90IGFmdGVyICR7bWF4UmV0cmllc30gYXR0ZW1wdHMuYCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgnc2NyZWVuc2hvdC1mYWlsZWQtZmluYWwnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZ2VuZXJhdGVOZXh0RnJhbWVHcm91cCgpOiBQcm9taXNlPEZyYW1lR3JvdXAgfCB1bmRlZmluZWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQ6IFdlYlNvY2tldENvbW1hbmQgPSB7Y29tbWFuZDogJ2dlbmVyYXRlTmV4dEdyb3VwJ307XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZVByb21pc2UgPSBuZXcgUHJvbWlzZTxGcmFtZUdyb3VwPigocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzb2x2ZU9uTWFzc2FnZSA9IHJlc29sdmVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRXZWJTb2NrZXRDb21tYW5kKGNvbW1hbmQpO1xuXG4gICAgICAgICAgICAvLyDQltC00LXQvCDQvtGC0LLQtdGCINC+0YIg0LrQu9C40LXQvdGC0LAsINC60L7RgtC+0YDRi9C5INC/0YDQuNGI0LvQtdGCIGZyYW1lR3JvdXBcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCByZXNwb25zZVByb21pc2U7XG4gICAgICAgIH0gZmluYWxseSB7XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBnZXRTbmFwc2hvdCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlRnVuYyA9IHJlc29sdmU7XG4gICAgICAgICAgICBjb25zdCBjb21tYW5kOiBXZWJTb2NrZXRDb21tYW5kID0ge2NvbW1hbmQ6ICdnZXRTbmFwc2hvdCd9O1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kV2ViU29ja2V0Q29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHNldFNuYXBzaG90KHNuYXBzaG90OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgY29tbWFuZDogV2ViU29ja2V0Q29tbWFuZCA9IHtjb21tYW5kOiAnbG9hZFNuYXBzaG90JywgdmFsdWU6IHNuYXBzaG90fTtcbiAgICAgICAgYXdhaXQgdGhpcy5zZW5kV2ViU29ja2V0Q29tbWFuZChjb21tYW5kKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHNlbmRXZWJTb2NrZXRDb21tYW5kKGNvbW1hbmQ6IFdlYlNvY2tldENvbW1hbmQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKHRoaXMud3MgJiYgdGhpcy53cy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuT1BFTikge1xuICAgICAgICAgICAgdGhpcy53cy5zZW5kKEpTT04uc3RyaW5naWZ5KGNvbW1hbmQpKTtcbiAgICAgICAgfSAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiV2ViU29ja2V0IGlzIG5vdCBvcGVuLiBVbmFibGUgdG8gc2VuZCBjb21tYW5kOlwiLCBjb21tYW5kKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuV29ya2VyQ29udHJvbGxlci5pbml0aWFsaXplKG5ldyBIYW5kbGVycygpKTsiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuV29ya2VyQ29udHJvbGxlciA9IHZvaWQgMDtcbmNvbnN0IHdvcmtlcl90aHJlYWRzXzEgPSByZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIik7XG5jb25zdCBzZXJkZV90c18xID0gcmVxdWlyZShcInNlcmRlLXRzXCIpO1xuY2xhc3MgV29ya2VyQ29udHJvbGxlciB7XG4gICAgc3RhdGljIGluaXRpYWxpemUoaGFuZGxlcnMpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVycyA9IGhhbmRsZXJzO1xuICAgICAgICAvLyBTZW5kIGluaXRpYWxpemF0aW9uIGFja25vd2xlZGdtZW50IHdoZW4gdGhlIHdvcmtlciBpcyBmdWxseSByZWFkeVxuICAgICAgICBjb25zdCBpbml0QWNrID0geyB0eXBlOiAnaW5pdGlhbGl6YXRpb24nIH07XG4gICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShpbml0QWNrKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAod29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0KSB7XG4gICAgICAgICAgICB3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQub24oJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZU1lc3NhZ2UoZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAncmVxdWVzdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0KG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbm90aWZpY2F0aW9uJzpcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZU5vdGlmaWNhdGlvbihtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBVbmtub3duIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGhhbmRsZVJlcXVlc3QobWVzc2FnZSkge1xuICAgICAgICBjb25zdCB7IHJlcXVlc3RJZCwgcGF5bG9hZCB9ID0gbWVzc2FnZTtcbiAgICAgICAgY29uc3QgeyBtZXRob2ROYW1lLCBhcmdzIH0gPSBzZXJkZV90c18xLlNlckRlLmRlc2VyaWFsaXplKHBheWxvYWQpO1xuICAgICAgICBpZiAodGhpcy5oYW5kbGVycyAmJiB0eXBlb2YgdGhpcy5oYW5kbGVyc1ttZXRob2ROYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBzZXJkZV90c18xLlNlckRlLnNlcmlhbGlzZShhd2FpdCB0aGlzLmhhbmRsZXJzW21ldGhvZE5hbWVdKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB7IHR5cGU6ICdyZXNwb25zZScsIHJlcXVlc3RJZCwgcmVzdWx0IH07XG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geyB0eXBlOiAncmVzcG9uc2UnLCByZXF1ZXN0SWQsIGVycm9yIH07XG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3Jlc3BvbnNlJyxcbiAgICAgICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICAgICAgcmVzdWx0OiBuZXcgRXJyb3IoYE1ldGhvZCAke21ldGhvZE5hbWV9IG5vdCBmb3VuZCBvbiBoYW5kbGVyc2ApXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydCkge1xuICAgICAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGhhbmRsZU5vdGlmaWNhdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IHsgbWV0aG9kTmFtZSwgYXJncyB9ID0gbWVzc2FnZS5wYXlsb2FkO1xuICAgICAgICBpZiAodGhpcy5oYW5kbGVycyAmJiB0eXBlb2YgdGhpcy5oYW5kbGVyc1ttZXRob2ROYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZXJzW21ldGhvZE5hbWVdKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaGFuZGxpbmcgbm90aWZpY2F0aW9uOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBoYW5kbGluZyBub3RpZmljYXRpb246IHVua25vd24gZXJyb3InKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYE5vdGlmaWNhdGlvbiBtZXRob2QgJHttZXRob2ROYW1lfSBub3QgZm91bmQgb24gaGFuZGxlcnNgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgcmVnaXN0ZXJDbGFzc2VzKGNsYXNzZXMpIHtcbiAgICAgICAgc2VyZGVfdHNfMS5TZXJEZS5jbGFzc1JlZ2lzdHJhdGlvbihjbGFzc2VzKTtcbiAgICB9XG59XG5leHBvcnRzLldvcmtlckNvbnRyb2xsZXIgPSBXb3JrZXJDb250cm9sbGVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9V29ya2VyQ29udHJvbGxlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuV29ya2VyTWFuYWdlciA9IHZvaWQgMDtcbmNvbnN0IHdvcmtlcl90aHJlYWRzXzEgPSByZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIik7XG5jb25zdCBzZXJkZV90c18xID0gcmVxdWlyZShcInNlcmRlLXRzXCIpO1xuY2xhc3MgV29ya2VyTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IodGltZW91dCA9IDIgKiogMzEgLSAxKSB7XG4gICAgICAgIHRoaXMud29ya2VycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5yZXF1ZXN0SWRDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy53b3JrZXJJZENvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gdGltZW91dDtcbiAgICB9XG4gICAgYXN5bmMgY3JlYXRlV29ya2VyV2l0aEhhbmRsZXJzKHdvcmtlckZpbGUpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gbmV3IHdvcmtlcl90aHJlYWRzXzEuV29ya2VyKHdvcmtlckZpbGUpO1xuICAgICAgICBjb25zdCB3b3JrZXJJZCA9ICsrdGhpcy53b3JrZXJJZENvdW50ZXI7XG4gICAgICAgIHRoaXMud29ya2Vycy5zZXQod29ya2VySWQsIHdvcmtlcik7XG4gICAgICAgIHdvcmtlci5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1lc3NhZ2UobWVzc2FnZSwgd29ya2VySWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5zZXQod29ya2VySWQsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTsgLy8gQ2xlYXIgdGltZW91dCBvbiBzdWNjZXNzXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh3b3JrZXJJZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuaGFzKHdvcmtlcklkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuZGVsZXRlKHdvcmtlcklkKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignV29ya2VyIGluaXRpYWxpemF0aW9uIHRpbWVkIG91dCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzLnRpbWVvdXQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaGFuZGxlTWVzc2FnZShtZXNzYWdlLCB3b3JrZXJJZCkge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnaW5pdGlhbGl6YXRpb24nOlxuICAgICAgICAgICAgICAgIGNvbnN0IGluaXRIYW5kbGVyID0gdGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzLmdldCh3b3JrZXJJZCk7XG4gICAgICAgICAgICAgICAgaWYgKGluaXRIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRIYW5kbGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5kZWxldGUod29ya2VySWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Jlc3BvbnNlJzpcbiAgICAgICAgICAgICAgICBjb25zdCB7IHJlcXVlc3RJZCwgcmVzdWx0IH0gPSBtZXNzYWdlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlSGFuZGxlciA9IHRoaXMucmVzcG9uc2VIYW5kbGVycy5nZXQocmVxdWVzdElkKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlSGFuZGxlcihzZXJkZV90c18xLlNlckRlLmRlc2VyaWFsaXplKHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMuZGVsZXRlKHJlcXVlc3RJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbm90aWZpY2F0aW9uJzpcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgbm90aWZpY2F0aW9ucyBpZiBuZWNlc3NhcnlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgY2FsbCh3b3JrZXJJZCwgbWV0aG9kTmFtZSwgLi4uYXJncykge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSB0aGlzLndvcmtlcnMuZ2V0KHdvcmtlcklkKTtcbiAgICAgICAgaWYgKCF3b3JrZXIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV29ya2VyIHdpdGggSUQgJHt3b3JrZXJJZH0gbm90IGZvdW5kYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVxdWVzdElkID0gKyt0aGlzLnJlcXVlc3RJZENvdW50ZXI7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICB0eXBlOiAncmVxdWVzdCcsXG4gICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICBwYXlsb2FkOiBzZXJkZV90c18xLlNlckRlLnNlcmlhbGlzZSh7IG1ldGhvZE5hbWUsIGFyZ3MgfSlcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzcG9uc2VIYW5kbGVycy5kZWxldGUocmVxdWVzdElkKTtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdSZXF1ZXN0IHRpbWVkIG91dCcpKTtcbiAgICAgICAgICAgIH0sIHRoaXMudGltZW91dCk7XG4gICAgICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMuc2V0KHJlcXVlc3RJZCwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpOyAvLyBDbGVhciB0aW1lb3V0IG9uIHN1Y2Nlc3NcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShyZXF1ZXN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNlbmROb3RpZmljYXRpb24od29ya2VySWQsIG1ldGhvZE5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gdGhpcy53b3JrZXJzLmdldCh3b3JrZXJJZCk7XG4gICAgICAgIGlmICghd29ya2VyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdvcmtlciB3aXRoIElEICR7d29ya2VySWR9IG5vdCBmb3VuZGApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdub3RpZmljYXRpb24nLFxuICAgICAgICAgICAgcGF5bG9hZDogeyBtZXRob2ROYW1lLCBhcmdzIH1cbiAgICAgICAgfTtcbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKG5vdGlmaWNhdGlvbik7XG4gICAgfVxuICAgIGFzeW5jIHRlcm1pbmF0ZVdvcmtlcih3b3JrZXJJZCkge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSB0aGlzLndvcmtlcnMuZ2V0KHdvcmtlcklkKTtcbiAgICAgICAgaWYgKHdvcmtlcikge1xuICAgICAgICAgICAgYXdhaXQgd29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgICAgICAgdGhpcy53b3JrZXJzLmRlbGV0ZSh3b3JrZXJJZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVnaXN0ZXJDbGFzc2VzKGNsYXNzZXMpIHtcbiAgICAgICAgc2VyZGVfdHNfMS5TZXJEZS5jbGFzc1JlZ2lzdHJhdGlvbihjbGFzc2VzKTtcbiAgICB9XG59XG5leHBvcnRzLldvcmtlck1hbmFnZXIgPSBXb3JrZXJNYW5hZ2VyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9V29ya2VyTWFuYWdlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19leHBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2V4cG9ydFN0YXIpIHx8IGZ1bmN0aW9uKG0sIGV4cG9ydHMpIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4cG9ydHMsIHApKSBfX2NyZWF0ZUJpbmRpbmcoZXhwb3J0cywgbSwgcCk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL1dvcmtlck1hbmFnZXJcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL1dvcmtlckNvbnRyb2xsZXJcIiksIGV4cG9ydHMpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGxheXdyaWdodFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ3c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJub2RlOm9zXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5vZGU6cHJvY2Vzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJub2RlOnR0eVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXRoXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpOyIsImltcG9ydCBhbnNpU3R5bGVzIGZyb20gJyNhbnNpLXN0eWxlcyc7XG5pbXBvcnQgc3VwcG9ydHNDb2xvciBmcm9tICcjc3VwcG9ydHMtY29sb3InO1xuaW1wb3J0IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBpbXBvcnQvb3JkZXJcblx0c3RyaW5nUmVwbGFjZUFsbCxcblx0c3RyaW5nRW5jYXNlQ1JMRldpdGhGaXJzdEluZGV4LFxufSBmcm9tICcuL3V0aWxpdGllcy5qcyc7XG5cbmNvbnN0IHtzdGRvdXQ6IHN0ZG91dENvbG9yLCBzdGRlcnI6IHN0ZGVyckNvbG9yfSA9IHN1cHBvcnRzQ29sb3I7XG5cbmNvbnN0IEdFTkVSQVRPUiA9IFN5bWJvbCgnR0VORVJBVE9SJyk7XG5jb25zdCBTVFlMRVIgPSBTeW1ib2woJ1NUWUxFUicpO1xuY29uc3QgSVNfRU1QVFkgPSBTeW1ib2woJ0lTX0VNUFRZJyk7XG5cbi8vIGBzdXBwb3J0c0NvbG9yLmxldmVsYCDihpIgYGFuc2lTdHlsZXMuY29sb3JbbmFtZV1gIG1hcHBpbmdcbmNvbnN0IGxldmVsTWFwcGluZyA9IFtcblx0J2Fuc2knLFxuXHQnYW5zaScsXG5cdCdhbnNpMjU2Jyxcblx0J2Fuc2kxNm0nLFxuXTtcblxuY29uc3Qgc3R5bGVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuY29uc3QgYXBwbHlPcHRpb25zID0gKG9iamVjdCwgb3B0aW9ucyA9IHt9KSA9PiB7XG5cdGlmIChvcHRpb25zLmxldmVsICYmICEoTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxldmVsKSAmJiBvcHRpb25zLmxldmVsID49IDAgJiYgb3B0aW9ucy5sZXZlbCA8PSAzKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignVGhlIGBsZXZlbGAgb3B0aW9uIHNob3VsZCBiZSBhbiBpbnRlZ2VyIGZyb20gMCB0byAzJyk7XG5cdH1cblxuXHQvLyBEZXRlY3QgbGV2ZWwgaWYgbm90IHNldCBtYW51YWxseVxuXHRjb25zdCBjb2xvckxldmVsID0gc3Rkb3V0Q29sb3IgPyBzdGRvdXRDb2xvci5sZXZlbCA6IDA7XG5cdG9iamVjdC5sZXZlbCA9IG9wdGlvbnMubGV2ZWwgPT09IHVuZGVmaW5lZCA/IGNvbG9yTGV2ZWwgOiBvcHRpb25zLmxldmVsO1xufTtcblxuZXhwb3J0IGNsYXNzIENoYWxrIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucykge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zdHJ1Y3Rvci1yZXR1cm5cblx0XHRyZXR1cm4gY2hhbGtGYWN0b3J5KG9wdGlvbnMpO1xuXHR9XG59XG5cbmNvbnN0IGNoYWxrRmFjdG9yeSA9IG9wdGlvbnMgPT4ge1xuXHRjb25zdCBjaGFsayA9ICguLi5zdHJpbmdzKSA9PiBzdHJpbmdzLmpvaW4oJyAnKTtcblx0YXBwbHlPcHRpb25zKGNoYWxrLCBvcHRpb25zKTtcblxuXHRPYmplY3Quc2V0UHJvdG90eXBlT2YoY2hhbGssIGNyZWF0ZUNoYWxrLnByb3RvdHlwZSk7XG5cblx0cmV0dXJuIGNoYWxrO1xufTtcblxuZnVuY3Rpb24gY3JlYXRlQ2hhbGsob3B0aW9ucykge1xuXHRyZXR1cm4gY2hhbGtGYWN0b3J5KG9wdGlvbnMpO1xufVxuXG5PYmplY3Quc2V0UHJvdG90eXBlT2YoY3JlYXRlQ2hhbGsucHJvdG90eXBlLCBGdW5jdGlvbi5wcm90b3R5cGUpO1xuXG5mb3IgKGNvbnN0IFtzdHlsZU5hbWUsIHN0eWxlXSBvZiBPYmplY3QuZW50cmllcyhhbnNpU3R5bGVzKSkge1xuXHRzdHlsZXNbc3R5bGVOYW1lXSA9IHtcblx0XHRnZXQoKSB7XG5cdFx0XHRjb25zdCBidWlsZGVyID0gY3JlYXRlQnVpbGRlcih0aGlzLCBjcmVhdGVTdHlsZXIoc3R5bGUub3Blbiwgc3R5bGUuY2xvc2UsIHRoaXNbU1RZTEVSXSksIHRoaXNbSVNfRU1QVFldKTtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBzdHlsZU5hbWUsIHt2YWx1ZTogYnVpbGRlcn0pO1xuXHRcdFx0cmV0dXJuIGJ1aWxkZXI7XG5cdFx0fSxcblx0fTtcbn1cblxuc3R5bGVzLnZpc2libGUgPSB7XG5cdGdldCgpIHtcblx0XHRjb25zdCBidWlsZGVyID0gY3JlYXRlQnVpbGRlcih0aGlzLCB0aGlzW1NUWUxFUl0sIHRydWUpO1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmlzaWJsZScsIHt2YWx1ZTogYnVpbGRlcn0pO1xuXHRcdHJldHVybiBidWlsZGVyO1xuXHR9LFxufTtcblxuY29uc3QgZ2V0TW9kZWxBbnNpID0gKG1vZGVsLCBsZXZlbCwgdHlwZSwgLi4uYXJndW1lbnRzXykgPT4ge1xuXHRpZiAobW9kZWwgPT09ICdyZ2InKSB7XG5cdFx0aWYgKGxldmVsID09PSAnYW5zaTE2bScpIHtcblx0XHRcdHJldHVybiBhbnNpU3R5bGVzW3R5cGVdLmFuc2kxNm0oLi4uYXJndW1lbnRzXyk7XG5cdFx0fVxuXG5cdFx0aWYgKGxldmVsID09PSAnYW5zaTI1NicpIHtcblx0XHRcdHJldHVybiBhbnNpU3R5bGVzW3R5cGVdLmFuc2kyNTYoYW5zaVN0eWxlcy5yZ2JUb0Fuc2kyNTYoLi4uYXJndW1lbnRzXykpO1xuXHRcdH1cblxuXHRcdHJldHVybiBhbnNpU3R5bGVzW3R5cGVdLmFuc2koYW5zaVN0eWxlcy5yZ2JUb0Fuc2koLi4uYXJndW1lbnRzXykpO1xuXHR9XG5cblx0aWYgKG1vZGVsID09PSAnaGV4Jykge1xuXHRcdHJldHVybiBnZXRNb2RlbEFuc2koJ3JnYicsIGxldmVsLCB0eXBlLCAuLi5hbnNpU3R5bGVzLmhleFRvUmdiKC4uLmFyZ3VtZW50c18pKTtcblx0fVxuXG5cdHJldHVybiBhbnNpU3R5bGVzW3R5cGVdW21vZGVsXSguLi5hcmd1bWVudHNfKTtcbn07XG5cbmNvbnN0IHVzZWRNb2RlbHMgPSBbJ3JnYicsICdoZXgnLCAnYW5zaTI1NiddO1xuXG5mb3IgKGNvbnN0IG1vZGVsIG9mIHVzZWRNb2RlbHMpIHtcblx0c3R5bGVzW21vZGVsXSA9IHtcblx0XHRnZXQoKSB7XG5cdFx0XHRjb25zdCB7bGV2ZWx9ID0gdGhpcztcblx0XHRcdHJldHVybiBmdW5jdGlvbiAoLi4uYXJndW1lbnRzXykge1xuXHRcdFx0XHRjb25zdCBzdHlsZXIgPSBjcmVhdGVTdHlsZXIoZ2V0TW9kZWxBbnNpKG1vZGVsLCBsZXZlbE1hcHBpbmdbbGV2ZWxdLCAnY29sb3InLCAuLi5hcmd1bWVudHNfKSwgYW5zaVN0eWxlcy5jb2xvci5jbG9zZSwgdGhpc1tTVFlMRVJdKTtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUJ1aWxkZXIodGhpcywgc3R5bGVyLCB0aGlzW0lTX0VNUFRZXSk7XG5cdFx0XHR9O1xuXHRcdH0sXG5cdH07XG5cblx0Y29uc3QgYmdNb2RlbCA9ICdiZycgKyBtb2RlbFswXS50b1VwcGVyQ2FzZSgpICsgbW9kZWwuc2xpY2UoMSk7XG5cdHN0eWxlc1tiZ01vZGVsXSA9IHtcblx0XHRnZXQoKSB7XG5cdFx0XHRjb25zdCB7bGV2ZWx9ID0gdGhpcztcblx0XHRcdHJldHVybiBmdW5jdGlvbiAoLi4uYXJndW1lbnRzXykge1xuXHRcdFx0XHRjb25zdCBzdHlsZXIgPSBjcmVhdGVTdHlsZXIoZ2V0TW9kZWxBbnNpKG1vZGVsLCBsZXZlbE1hcHBpbmdbbGV2ZWxdLCAnYmdDb2xvcicsIC4uLmFyZ3VtZW50c18pLCBhbnNpU3R5bGVzLmJnQ29sb3IuY2xvc2UsIHRoaXNbU1RZTEVSXSk7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVCdWlsZGVyKHRoaXMsIHN0eWxlciwgdGhpc1tJU19FTVBUWV0pO1xuXHRcdFx0fTtcblx0XHR9LFxuXHR9O1xufVxuXG5jb25zdCBwcm90byA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCgpID0+IHt9LCB7XG5cdC4uLnN0eWxlcyxcblx0bGV2ZWw6IHtcblx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiB0aGlzW0dFTkVSQVRPUl0ubGV2ZWw7XG5cdFx0fSxcblx0XHRzZXQobGV2ZWwpIHtcblx0XHRcdHRoaXNbR0VORVJBVE9SXS5sZXZlbCA9IGxldmVsO1xuXHRcdH0sXG5cdH0sXG59KTtcblxuY29uc3QgY3JlYXRlU3R5bGVyID0gKG9wZW4sIGNsb3NlLCBwYXJlbnQpID0+IHtcblx0bGV0IG9wZW5BbGw7XG5cdGxldCBjbG9zZUFsbDtcblx0aWYgKHBhcmVudCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0b3BlbkFsbCA9IG9wZW47XG5cdFx0Y2xvc2VBbGwgPSBjbG9zZTtcblx0fSBlbHNlIHtcblx0XHRvcGVuQWxsID0gcGFyZW50Lm9wZW5BbGwgKyBvcGVuO1xuXHRcdGNsb3NlQWxsID0gY2xvc2UgKyBwYXJlbnQuY2xvc2VBbGw7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdG9wZW4sXG5cdFx0Y2xvc2UsXG5cdFx0b3BlbkFsbCxcblx0XHRjbG9zZUFsbCxcblx0XHRwYXJlbnQsXG5cdH07XG59O1xuXG5jb25zdCBjcmVhdGVCdWlsZGVyID0gKHNlbGYsIF9zdHlsZXIsIF9pc0VtcHR5KSA9PiB7XG5cdC8vIFNpbmdsZSBhcmd1bWVudCBpcyBob3QgcGF0aCwgaW1wbGljaXQgY29lcmNpb24gaXMgZmFzdGVyIHRoYW4gYW55dGhpbmdcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWltcGxpY2l0LWNvZXJjaW9uXG5cdGNvbnN0IGJ1aWxkZXIgPSAoLi4uYXJndW1lbnRzXykgPT4gYXBwbHlTdHlsZShidWlsZGVyLCAoYXJndW1lbnRzXy5sZW5ndGggPT09IDEpID8gKCcnICsgYXJndW1lbnRzX1swXSkgOiBhcmd1bWVudHNfLmpvaW4oJyAnKSk7XG5cblx0Ly8gV2UgYWx0ZXIgdGhlIHByb3RvdHlwZSBiZWNhdXNlIHdlIG11c3QgcmV0dXJuIGEgZnVuY3Rpb24sIGJ1dCB0aGVyZSBpc1xuXHQvLyBubyB3YXkgdG8gY3JlYXRlIGEgZnVuY3Rpb24gd2l0aCBhIGRpZmZlcmVudCBwcm90b3R5cGVcblx0T2JqZWN0LnNldFByb3RvdHlwZU9mKGJ1aWxkZXIsIHByb3RvKTtcblxuXHRidWlsZGVyW0dFTkVSQVRPUl0gPSBzZWxmO1xuXHRidWlsZGVyW1NUWUxFUl0gPSBfc3R5bGVyO1xuXHRidWlsZGVyW0lTX0VNUFRZXSA9IF9pc0VtcHR5O1xuXG5cdHJldHVybiBidWlsZGVyO1xufTtcblxuY29uc3QgYXBwbHlTdHlsZSA9IChzZWxmLCBzdHJpbmcpID0+IHtcblx0aWYgKHNlbGYubGV2ZWwgPD0gMCB8fCAhc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHNlbGZbSVNfRU1QVFldID8gJycgOiBzdHJpbmc7XG5cdH1cblxuXHRsZXQgc3R5bGVyID0gc2VsZltTVFlMRVJdO1xuXG5cdGlmIChzdHlsZXIgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBzdHJpbmc7XG5cdH1cblxuXHRjb25zdCB7b3BlbkFsbCwgY2xvc2VBbGx9ID0gc3R5bGVyO1xuXHRpZiAoc3RyaW5nLmluY2x1ZGVzKCdcXHUwMDFCJykpIHtcblx0XHR3aGlsZSAoc3R5bGVyICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIFJlcGxhY2UgYW55IGluc3RhbmNlcyBhbHJlYWR5IHByZXNlbnQgd2l0aCBhIHJlLW9wZW5pbmcgY29kZVxuXHRcdFx0Ly8gb3RoZXJ3aXNlIG9ubHkgdGhlIHBhcnQgb2YgdGhlIHN0cmluZyB1bnRpbCBzYWlkIGNsb3NpbmcgY29kZVxuXHRcdFx0Ly8gd2lsbCBiZSBjb2xvcmVkLCBhbmQgdGhlIHJlc3Qgd2lsbCBzaW1wbHkgYmUgJ3BsYWluJy5cblx0XHRcdHN0cmluZyA9IHN0cmluZ1JlcGxhY2VBbGwoc3RyaW5nLCBzdHlsZXIuY2xvc2UsIHN0eWxlci5vcGVuKTtcblxuXHRcdFx0c3R5bGVyID0gc3R5bGVyLnBhcmVudDtcblx0XHR9XG5cdH1cblxuXHQvLyBXZSBjYW4gbW92ZSBib3RoIG5leHQgYWN0aW9ucyBvdXQgb2YgbG9vcCwgYmVjYXVzZSByZW1haW5pbmcgYWN0aW9ucyBpbiBsb29wIHdvbid0IGhhdmVcblx0Ly8gYW55L3Zpc2libGUgZWZmZWN0IG9uIHBhcnRzIHdlIGFkZCBoZXJlLiBDbG9zZSB0aGUgc3R5bGluZyBiZWZvcmUgYSBsaW5lYnJlYWsgYW5kIHJlb3BlblxuXHQvLyBhZnRlciBuZXh0IGxpbmUgdG8gZml4IGEgYmxlZWQgaXNzdWUgb24gbWFjT1M6IGh0dHBzOi8vZ2l0aHViLmNvbS9jaGFsay9jaGFsay9wdWxsLzkyXG5cdGNvbnN0IGxmSW5kZXggPSBzdHJpbmcuaW5kZXhPZignXFxuJyk7XG5cdGlmIChsZkluZGV4ICE9PSAtMSkge1xuXHRcdHN0cmluZyA9IHN0cmluZ0VuY2FzZUNSTEZXaXRoRmlyc3RJbmRleChzdHJpbmcsIGNsb3NlQWxsLCBvcGVuQWxsLCBsZkluZGV4KTtcblx0fVxuXG5cdHJldHVybiBvcGVuQWxsICsgc3RyaW5nICsgY2xvc2VBbGw7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhjcmVhdGVDaGFsay5wcm90b3R5cGUsIHN0eWxlcyk7XG5cbmNvbnN0IGNoYWxrID0gY3JlYXRlQ2hhbGsoKTtcbmV4cG9ydCBjb25zdCBjaGFsa1N0ZGVyciA9IGNyZWF0ZUNoYWxrKHtsZXZlbDogc3RkZXJyQ29sb3IgPyBzdGRlcnJDb2xvci5sZXZlbCA6IDB9KTtcblxuZXhwb3J0IHtcblx0bW9kaWZpZXJOYW1lcyxcblx0Zm9yZWdyb3VuZENvbG9yTmFtZXMsXG5cdGJhY2tncm91bmRDb2xvck5hbWVzLFxuXHRjb2xvck5hbWVzLFxuXG5cdC8vIFRPRE86IFJlbW92ZSB0aGVzZSBhbGlhc2VzIGluIHRoZSBuZXh0IG1ham9yIHZlcnNpb25cblx0bW9kaWZpZXJOYW1lcyBhcyBtb2RpZmllcnMsXG5cdGZvcmVncm91bmRDb2xvck5hbWVzIGFzIGZvcmVncm91bmRDb2xvcnMsXG5cdGJhY2tncm91bmRDb2xvck5hbWVzIGFzIGJhY2tncm91bmRDb2xvcnMsXG5cdGNvbG9yTmFtZXMgYXMgY29sb3JzLFxufSBmcm9tICcuL3ZlbmRvci9hbnNpLXN0eWxlcy9pbmRleC5qcyc7XG5cbmV4cG9ydCB7XG5cdHN0ZG91dENvbG9yIGFzIHN1cHBvcnRzQ29sb3IsXG5cdHN0ZGVyckNvbG9yIGFzIHN1cHBvcnRzQ29sb3JTdGRlcnIsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjaGFsaztcbiIsIi8vIFRPRE86IFdoZW4gdGFyZ2V0aW5nIE5vZGUuanMgMTYsIHVzZSBgU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlQWxsYC5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdSZXBsYWNlQWxsKHN0cmluZywgc3Vic3RyaW5nLCByZXBsYWNlcikge1xuXHRsZXQgaW5kZXggPSBzdHJpbmcuaW5kZXhPZihzdWJzdHJpbmcpO1xuXHRpZiAoaW5kZXggPT09IC0xKSB7XG5cdFx0cmV0dXJuIHN0cmluZztcblx0fVxuXG5cdGNvbnN0IHN1YnN0cmluZ0xlbmd0aCA9IHN1YnN0cmluZy5sZW5ndGg7XG5cdGxldCBlbmRJbmRleCA9IDA7XG5cdGxldCByZXR1cm5WYWx1ZSA9ICcnO1xuXHRkbyB7XG5cdFx0cmV0dXJuVmFsdWUgKz0gc3RyaW5nLnNsaWNlKGVuZEluZGV4LCBpbmRleCkgKyBzdWJzdHJpbmcgKyByZXBsYWNlcjtcblx0XHRlbmRJbmRleCA9IGluZGV4ICsgc3Vic3RyaW5nTGVuZ3RoO1xuXHRcdGluZGV4ID0gc3RyaW5nLmluZGV4T2Yoc3Vic3RyaW5nLCBlbmRJbmRleCk7XG5cdH0gd2hpbGUgKGluZGV4ICE9PSAtMSk7XG5cblx0cmV0dXJuVmFsdWUgKz0gc3RyaW5nLnNsaWNlKGVuZEluZGV4KTtcblx0cmV0dXJuIHJldHVyblZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nRW5jYXNlQ1JMRldpdGhGaXJzdEluZGV4KHN0cmluZywgcHJlZml4LCBwb3N0Zml4LCBpbmRleCkge1xuXHRsZXQgZW5kSW5kZXggPSAwO1xuXHRsZXQgcmV0dXJuVmFsdWUgPSAnJztcblx0ZG8ge1xuXHRcdGNvbnN0IGdvdENSID0gc3RyaW5nW2luZGV4IC0gMV0gPT09ICdcXHInO1xuXHRcdHJldHVyblZhbHVlICs9IHN0cmluZy5zbGljZShlbmRJbmRleCwgKGdvdENSID8gaW5kZXggLSAxIDogaW5kZXgpKSArIHByZWZpeCArIChnb3RDUiA/ICdcXHJcXG4nIDogJ1xcbicpICsgcG9zdGZpeDtcblx0XHRlbmRJbmRleCA9IGluZGV4ICsgMTtcblx0XHRpbmRleCA9IHN0cmluZy5pbmRleE9mKCdcXG4nLCBlbmRJbmRleCk7XG5cdH0gd2hpbGUgKGluZGV4ICE9PSAtMSk7XG5cblx0cmV0dXJuVmFsdWUgKz0gc3RyaW5nLnNsaWNlKGVuZEluZGV4KTtcblx0cmV0dXJuIHJldHVyblZhbHVlO1xufVxuIiwiY29uc3QgQU5TSV9CQUNLR1JPVU5EX09GRlNFVCA9IDEwO1xuXG5jb25zdCB3cmFwQW5zaTE2ID0gKG9mZnNldCA9IDApID0+IGNvZGUgPT4gYFxcdTAwMUJbJHtjb2RlICsgb2Zmc2V0fW1gO1xuXG5jb25zdCB3cmFwQW5zaTI1NiA9IChvZmZzZXQgPSAwKSA9PiBjb2RlID0+IGBcXHUwMDFCWyR7MzggKyBvZmZzZXR9OzU7JHtjb2RlfW1gO1xuXG5jb25zdCB3cmFwQW5zaTE2bSA9IChvZmZzZXQgPSAwKSA9PiAocmVkLCBncmVlbiwgYmx1ZSkgPT4gYFxcdTAwMUJbJHszOCArIG9mZnNldH07Mjske3JlZH07JHtncmVlbn07JHtibHVlfW1gO1xuXG5jb25zdCBzdHlsZXMgPSB7XG5cdG1vZGlmaWVyOiB7XG5cdFx0cmVzZXQ6IFswLCAwXSxcblx0XHQvLyAyMSBpc24ndCB3aWRlbHkgc3VwcG9ydGVkIGFuZCAyMiBkb2VzIHRoZSBzYW1lIHRoaW5nXG5cdFx0Ym9sZDogWzEsIDIyXSxcblx0XHRkaW06IFsyLCAyMl0sXG5cdFx0aXRhbGljOiBbMywgMjNdLFxuXHRcdHVuZGVybGluZTogWzQsIDI0XSxcblx0XHRvdmVybGluZTogWzUzLCA1NV0sXG5cdFx0aW52ZXJzZTogWzcsIDI3XSxcblx0XHRoaWRkZW46IFs4LCAyOF0sXG5cdFx0c3RyaWtldGhyb3VnaDogWzksIDI5XSxcblx0fSxcblx0Y29sb3I6IHtcblx0XHRibGFjazogWzMwLCAzOV0sXG5cdFx0cmVkOiBbMzEsIDM5XSxcblx0XHRncmVlbjogWzMyLCAzOV0sXG5cdFx0eWVsbG93OiBbMzMsIDM5XSxcblx0XHRibHVlOiBbMzQsIDM5XSxcblx0XHRtYWdlbnRhOiBbMzUsIDM5XSxcblx0XHRjeWFuOiBbMzYsIDM5XSxcblx0XHR3aGl0ZTogWzM3LCAzOV0sXG5cblx0XHQvLyBCcmlnaHQgY29sb3Jcblx0XHRibGFja0JyaWdodDogWzkwLCAzOV0sXG5cdFx0Z3JheTogWzkwLCAzOV0sIC8vIEFsaWFzIG9mIGBibGFja0JyaWdodGBcblx0XHRncmV5OiBbOTAsIDM5XSwgLy8gQWxpYXMgb2YgYGJsYWNrQnJpZ2h0YFxuXHRcdHJlZEJyaWdodDogWzkxLCAzOV0sXG5cdFx0Z3JlZW5CcmlnaHQ6IFs5MiwgMzldLFxuXHRcdHllbGxvd0JyaWdodDogWzkzLCAzOV0sXG5cdFx0Ymx1ZUJyaWdodDogWzk0LCAzOV0sXG5cdFx0bWFnZW50YUJyaWdodDogWzk1LCAzOV0sXG5cdFx0Y3lhbkJyaWdodDogWzk2LCAzOV0sXG5cdFx0d2hpdGVCcmlnaHQ6IFs5NywgMzldLFxuXHR9LFxuXHRiZ0NvbG9yOiB7XG5cdFx0YmdCbGFjazogWzQwLCA0OV0sXG5cdFx0YmdSZWQ6IFs0MSwgNDldLFxuXHRcdGJnR3JlZW46IFs0MiwgNDldLFxuXHRcdGJnWWVsbG93OiBbNDMsIDQ5XSxcblx0XHRiZ0JsdWU6IFs0NCwgNDldLFxuXHRcdGJnTWFnZW50YTogWzQ1LCA0OV0sXG5cdFx0YmdDeWFuOiBbNDYsIDQ5XSxcblx0XHRiZ1doaXRlOiBbNDcsIDQ5XSxcblxuXHRcdC8vIEJyaWdodCBjb2xvclxuXHRcdGJnQmxhY2tCcmlnaHQ6IFsxMDAsIDQ5XSxcblx0XHRiZ0dyYXk6IFsxMDAsIDQ5XSwgLy8gQWxpYXMgb2YgYGJnQmxhY2tCcmlnaHRgXG5cdFx0YmdHcmV5OiBbMTAwLCA0OV0sIC8vIEFsaWFzIG9mIGBiZ0JsYWNrQnJpZ2h0YFxuXHRcdGJnUmVkQnJpZ2h0OiBbMTAxLCA0OV0sXG5cdFx0YmdHcmVlbkJyaWdodDogWzEwMiwgNDldLFxuXHRcdGJnWWVsbG93QnJpZ2h0OiBbMTAzLCA0OV0sXG5cdFx0YmdCbHVlQnJpZ2h0OiBbMTA0LCA0OV0sXG5cdFx0YmdNYWdlbnRhQnJpZ2h0OiBbMTA1LCA0OV0sXG5cdFx0YmdDeWFuQnJpZ2h0OiBbMTA2LCA0OV0sXG5cdFx0YmdXaGl0ZUJyaWdodDogWzEwNywgNDldLFxuXHR9LFxufTtcblxuZXhwb3J0IGNvbnN0IG1vZGlmaWVyTmFtZXMgPSBPYmplY3Qua2V5cyhzdHlsZXMubW9kaWZpZXIpO1xuZXhwb3J0IGNvbnN0IGZvcmVncm91bmRDb2xvck5hbWVzID0gT2JqZWN0LmtleXMoc3R5bGVzLmNvbG9yKTtcbmV4cG9ydCBjb25zdCBiYWNrZ3JvdW5kQ29sb3JOYW1lcyA9IE9iamVjdC5rZXlzKHN0eWxlcy5iZ0NvbG9yKTtcbmV4cG9ydCBjb25zdCBjb2xvck5hbWVzID0gWy4uLmZvcmVncm91bmRDb2xvck5hbWVzLCAuLi5iYWNrZ3JvdW5kQ29sb3JOYW1lc107XG5cbmZ1bmN0aW9uIGFzc2VtYmxlU3R5bGVzKCkge1xuXHRjb25zdCBjb2RlcyA9IG5ldyBNYXAoKTtcblxuXHRmb3IgKGNvbnN0IFtncm91cE5hbWUsIGdyb3VwXSBvZiBPYmplY3QuZW50cmllcyhzdHlsZXMpKSB7XG5cdFx0Zm9yIChjb25zdCBbc3R5bGVOYW1lLCBzdHlsZV0gb2YgT2JqZWN0LmVudHJpZXMoZ3JvdXApKSB7XG5cdFx0XHRzdHlsZXNbc3R5bGVOYW1lXSA9IHtcblx0XHRcdFx0b3BlbjogYFxcdTAwMUJbJHtzdHlsZVswXX1tYCxcblx0XHRcdFx0Y2xvc2U6IGBcXHUwMDFCWyR7c3R5bGVbMV19bWAsXG5cdFx0XHR9O1xuXG5cdFx0XHRncm91cFtzdHlsZU5hbWVdID0gc3R5bGVzW3N0eWxlTmFtZV07XG5cblx0XHRcdGNvZGVzLnNldChzdHlsZVswXSwgc3R5bGVbMV0pO1xuXHRcdH1cblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdHlsZXMsIGdyb3VwTmFtZSwge1xuXHRcdFx0dmFsdWU6IGdyb3VwLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSk7XG5cdH1cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc3R5bGVzLCAnY29kZXMnLCB7XG5cdFx0dmFsdWU6IGNvZGVzLFxuXHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHR9KTtcblxuXHRzdHlsZXMuY29sb3IuY2xvc2UgPSAnXFx1MDAxQlszOW0nO1xuXHRzdHlsZXMuYmdDb2xvci5jbG9zZSA9ICdcXHUwMDFCWzQ5bSc7XG5cblx0c3R5bGVzLmNvbG9yLmFuc2kgPSB3cmFwQW5zaTE2KCk7XG5cdHN0eWxlcy5jb2xvci5hbnNpMjU2ID0gd3JhcEFuc2kyNTYoKTtcblx0c3R5bGVzLmNvbG9yLmFuc2kxNm0gPSB3cmFwQW5zaTE2bSgpO1xuXHRzdHlsZXMuYmdDb2xvci5hbnNpID0gd3JhcEFuc2kxNihBTlNJX0JBQ0tHUk9VTkRfT0ZGU0VUKTtcblx0c3R5bGVzLmJnQ29sb3IuYW5zaTI1NiA9IHdyYXBBbnNpMjU2KEFOU0lfQkFDS0dST1VORF9PRkZTRVQpO1xuXHRzdHlsZXMuYmdDb2xvci5hbnNpMTZtID0gd3JhcEFuc2kxNm0oQU5TSV9CQUNLR1JPVU5EX09GRlNFVCk7XG5cblx0Ly8gRnJvbSBodHRwczovL2dpdGh1Yi5jb20vUWl4LS9jb2xvci1jb252ZXJ0L2Jsb2IvM2YwZTBkNGU5MmUyMzU3OTZjY2IxN2Y2ZTg1YzcyMDk0YTY1MWY0OS9jb252ZXJzaW9ucy5qc1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzdHlsZXMsIHtcblx0XHRyZ2JUb0Fuc2kyNTY6IHtcblx0XHRcdHZhbHVlKHJlZCwgZ3JlZW4sIGJsdWUpIHtcblx0XHRcdFx0Ly8gV2UgdXNlIHRoZSBleHRlbmRlZCBncmV5c2NhbGUgcGFsZXR0ZSBoZXJlLCB3aXRoIHRoZSBleGNlcHRpb24gb2Zcblx0XHRcdFx0Ly8gYmxhY2sgYW5kIHdoaXRlLiBub3JtYWwgcGFsZXR0ZSBvbmx5IGhhcyA0IGdyZXlzY2FsZSBzaGFkZXMuXG5cdFx0XHRcdGlmIChyZWQgPT09IGdyZWVuICYmIGdyZWVuID09PSBibHVlKSB7XG5cdFx0XHRcdFx0aWYgKHJlZCA8IDgpIHtcblx0XHRcdFx0XHRcdHJldHVybiAxNjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAocmVkID4gMjQ4KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMjMxO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBNYXRoLnJvdW5kKCgocmVkIC0gOCkgLyAyNDcpICogMjQpICsgMjMyO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIDE2XG5cdFx0XHRcdFx0KyAoMzYgKiBNYXRoLnJvdW5kKHJlZCAvIDI1NSAqIDUpKVxuXHRcdFx0XHRcdCsgKDYgKiBNYXRoLnJvdW5kKGdyZWVuIC8gMjU1ICogNSkpXG5cdFx0XHRcdFx0KyBNYXRoLnJvdW5kKGJsdWUgLyAyNTUgKiA1KTtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9LFxuXHRcdGhleFRvUmdiOiB7XG5cdFx0XHR2YWx1ZShoZXgpIHtcblx0XHRcdFx0Y29uc3QgbWF0Y2hlcyA9IC9bYS1mXFxkXXs2fXxbYS1mXFxkXXszfS9pLmV4ZWMoaGV4LnRvU3RyaW5nKDE2KSk7XG5cdFx0XHRcdGlmICghbWF0Y2hlcykge1xuXHRcdFx0XHRcdHJldHVybiBbMCwgMCwgMF07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgW2NvbG9yU3RyaW5nXSA9IG1hdGNoZXM7XG5cblx0XHRcdFx0aWYgKGNvbG9yU3RyaW5nLmxlbmd0aCA9PT0gMykge1xuXHRcdFx0XHRcdGNvbG9yU3RyaW5nID0gWy4uLmNvbG9yU3RyaW5nXS5tYXAoY2hhcmFjdGVyID0+IGNoYXJhY3RlciArIGNoYXJhY3Rlcikuam9pbignJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBpbnRlZ2VyID0gTnVtYmVyLnBhcnNlSW50KGNvbG9yU3RyaW5nLCAxNik7XG5cblx0XHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0XHQvKiBlc2xpbnQtZGlzYWJsZSBuby1iaXR3aXNlICovXG5cdFx0XHRcdFx0KGludGVnZXIgPj4gMTYpICYgMHhGRixcblx0XHRcdFx0XHQoaW50ZWdlciA+PiA4KSAmIDB4RkYsXG5cdFx0XHRcdFx0aW50ZWdlciAmIDB4RkYsXG5cdFx0XHRcdFx0LyogZXNsaW50LWVuYWJsZSBuby1iaXR3aXNlICovXG5cdFx0XHRcdF07XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0XHRoZXhUb0Fuc2kyNTY6IHtcblx0XHRcdHZhbHVlOiBoZXggPT4gc3R5bGVzLnJnYlRvQW5zaTI1NiguLi5zdHlsZXMuaGV4VG9SZ2IoaGV4KSksXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9LFxuXHRcdGFuc2kyNTZUb0Fuc2k6IHtcblx0XHRcdHZhbHVlKGNvZGUpIHtcblx0XHRcdFx0aWYgKGNvZGUgPCA4KSB7XG5cdFx0XHRcdFx0cmV0dXJuIDMwICsgY29kZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjb2RlIDwgMTYpIHtcblx0XHRcdFx0XHRyZXR1cm4gOTAgKyAoY29kZSAtIDgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHJlZDtcblx0XHRcdFx0bGV0IGdyZWVuO1xuXHRcdFx0XHRsZXQgYmx1ZTtcblxuXHRcdFx0XHRpZiAoY29kZSA+PSAyMzIpIHtcblx0XHRcdFx0XHRyZWQgPSAoKChjb2RlIC0gMjMyKSAqIDEwKSArIDgpIC8gMjU1O1xuXHRcdFx0XHRcdGdyZWVuID0gcmVkO1xuXHRcdFx0XHRcdGJsdWUgPSByZWQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29kZSAtPSAxNjtcblxuXHRcdFx0XHRcdGNvbnN0IHJlbWFpbmRlciA9IGNvZGUgJSAzNjtcblxuXHRcdFx0XHRcdHJlZCA9IE1hdGguZmxvb3IoY29kZSAvIDM2KSAvIDU7XG5cdFx0XHRcdFx0Z3JlZW4gPSBNYXRoLmZsb29yKHJlbWFpbmRlciAvIDYpIC8gNTtcblx0XHRcdFx0XHRibHVlID0gKHJlbWFpbmRlciAlIDYpIC8gNTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gTWF0aC5tYXgocmVkLCBncmVlbiwgYmx1ZSkgKiAyO1xuXG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gMCkge1xuXHRcdFx0XHRcdHJldHVybiAzMDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1iaXR3aXNlXG5cdFx0XHRcdGxldCByZXN1bHQgPSAzMCArICgoTWF0aC5yb3VuZChibHVlKSA8PCAyKSB8IChNYXRoLnJvdW5kKGdyZWVuKSA8PCAxKSB8IE1hdGgucm91bmQocmVkKSk7XG5cblx0XHRcdFx0aWYgKHZhbHVlID09PSAyKSB7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IDYwO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9LFxuXHRcdHJnYlRvQW5zaToge1xuXHRcdFx0dmFsdWU6IChyZWQsIGdyZWVuLCBibHVlKSA9PiBzdHlsZXMuYW5zaTI1NlRvQW5zaShzdHlsZXMucmdiVG9BbnNpMjU2KHJlZCwgZ3JlZW4sIGJsdWUpKSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0sXG5cdFx0aGV4VG9BbnNpOiB7XG5cdFx0XHR2YWx1ZTogaGV4ID0+IHN0eWxlcy5hbnNpMjU2VG9BbnNpKHN0eWxlcy5oZXhUb0Fuc2kyNTYoaGV4KSksXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9LFxuXHR9KTtcblxuXHRyZXR1cm4gc3R5bGVzO1xufVxuXG5jb25zdCBhbnNpU3R5bGVzID0gYXNzZW1ibGVTdHlsZXMoKTtcblxuZXhwb3J0IGRlZmF1bHQgYW5zaVN0eWxlcztcbiIsImltcG9ydCBwcm9jZXNzIGZyb20gJ25vZGU6cHJvY2Vzcyc7XG5pbXBvcnQgb3MgZnJvbSAnbm9kZTpvcyc7XG5pbXBvcnQgdHR5IGZyb20gJ25vZGU6dHR5JztcblxuLy8gRnJvbTogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9oYXMtZmxhZy9ibG9iL21haW4vaW5kZXguanNcbi8vLyBmdW5jdGlvbiBoYXNGbGFnKGZsYWcsIGFyZ3YgPSBnbG9iYWxUaGlzLkRlbm8/LmFyZ3MgPz8gcHJvY2Vzcy5hcmd2KSB7XG5mdW5jdGlvbiBoYXNGbGFnKGZsYWcsIGFyZ3YgPSBnbG9iYWxUaGlzLkRlbm8gPyBnbG9iYWxUaGlzLkRlbm8uYXJncyA6IHByb2Nlc3MuYXJndikge1xuXHRjb25zdCBwcmVmaXggPSBmbGFnLnN0YXJ0c1dpdGgoJy0nKSA/ICcnIDogKGZsYWcubGVuZ3RoID09PSAxID8gJy0nIDogJy0tJyk7XG5cdGNvbnN0IHBvc2l0aW9uID0gYXJndi5pbmRleE9mKHByZWZpeCArIGZsYWcpO1xuXHRjb25zdCB0ZXJtaW5hdG9yUG9zaXRpb24gPSBhcmd2LmluZGV4T2YoJy0tJyk7XG5cdHJldHVybiBwb3NpdGlvbiAhPT0gLTEgJiYgKHRlcm1pbmF0b3JQb3NpdGlvbiA9PT0gLTEgfHwgcG9zaXRpb24gPCB0ZXJtaW5hdG9yUG9zaXRpb24pO1xufVxuXG5jb25zdCB7ZW52fSA9IHByb2Nlc3M7XG5cbmxldCBmbGFnRm9yY2VDb2xvcjtcbmlmIChcblx0aGFzRmxhZygnbm8tY29sb3InKVxuXHR8fCBoYXNGbGFnKCduby1jb2xvcnMnKVxuXHR8fCBoYXNGbGFnKCdjb2xvcj1mYWxzZScpXG5cdHx8IGhhc0ZsYWcoJ2NvbG9yPW5ldmVyJylcbikge1xuXHRmbGFnRm9yY2VDb2xvciA9IDA7XG59IGVsc2UgaWYgKFxuXHRoYXNGbGFnKCdjb2xvcicpXG5cdHx8IGhhc0ZsYWcoJ2NvbG9ycycpXG5cdHx8IGhhc0ZsYWcoJ2NvbG9yPXRydWUnKVxuXHR8fCBoYXNGbGFnKCdjb2xvcj1hbHdheXMnKVxuKSB7XG5cdGZsYWdGb3JjZUNvbG9yID0gMTtcbn1cblxuZnVuY3Rpb24gZW52Rm9yY2VDb2xvcigpIHtcblx0aWYgKCdGT1JDRV9DT0xPUicgaW4gZW52KSB7XG5cdFx0aWYgKGVudi5GT1JDRV9DT0xPUiA9PT0gJ3RydWUnKSB7XG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9XG5cblx0XHRpZiAoZW52LkZPUkNFX0NPTE9SID09PSAnZmFsc2UnKSB7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9XG5cblx0XHRyZXR1cm4gZW52LkZPUkNFX0NPTE9SLmxlbmd0aCA9PT0gMCA/IDEgOiBNYXRoLm1pbihOdW1iZXIucGFyc2VJbnQoZW52LkZPUkNFX0NPTE9SLCAxMCksIDMpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHRyYW5zbGF0ZUxldmVsKGxldmVsKSB7XG5cdGlmIChsZXZlbCA9PT0gMCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0bGV2ZWwsXG5cdFx0aGFzQmFzaWM6IHRydWUsXG5cdFx0aGFzMjU2OiBsZXZlbCA+PSAyLFxuXHRcdGhhczE2bTogbGV2ZWwgPj0gMyxcblx0fTtcbn1cblxuZnVuY3Rpb24gX3N1cHBvcnRzQ29sb3IoaGF2ZVN0cmVhbSwge3N0cmVhbUlzVFRZLCBzbmlmZkZsYWdzID0gdHJ1ZX0gPSB7fSkge1xuXHRjb25zdCBub0ZsYWdGb3JjZUNvbG9yID0gZW52Rm9yY2VDb2xvcigpO1xuXHRpZiAobm9GbGFnRm9yY2VDb2xvciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0ZmxhZ0ZvcmNlQ29sb3IgPSBub0ZsYWdGb3JjZUNvbG9yO1xuXHR9XG5cblx0Y29uc3QgZm9yY2VDb2xvciA9IHNuaWZmRmxhZ3MgPyBmbGFnRm9yY2VDb2xvciA6IG5vRmxhZ0ZvcmNlQ29sb3I7XG5cblx0aWYgKGZvcmNlQ29sb3IgPT09IDApIHtcblx0XHRyZXR1cm4gMDtcblx0fVxuXG5cdGlmIChzbmlmZkZsYWdzKSB7XG5cdFx0aWYgKGhhc0ZsYWcoJ2NvbG9yPTE2bScpXG5cdFx0XHR8fCBoYXNGbGFnKCdjb2xvcj1mdWxsJylcblx0XHRcdHx8IGhhc0ZsYWcoJ2NvbG9yPXRydWVjb2xvcicpKSB7XG5cdFx0XHRyZXR1cm4gMztcblx0XHR9XG5cblx0XHRpZiAoaGFzRmxhZygnY29sb3I9MjU2JykpIHtcblx0XHRcdHJldHVybiAyO1xuXHRcdH1cblx0fVxuXG5cdC8vIENoZWNrIGZvciBBenVyZSBEZXZPcHMgcGlwZWxpbmVzLlxuXHQvLyBIYXMgdG8gYmUgYWJvdmUgdGhlIGAhc3RyZWFtSXNUVFlgIGNoZWNrLlxuXHRpZiAoJ1RGX0JVSUxEJyBpbiBlbnYgJiYgJ0FHRU5UX05BTUUnIGluIGVudikge1xuXHRcdHJldHVybiAxO1xuXHR9XG5cblx0aWYgKGhhdmVTdHJlYW0gJiYgIXN0cmVhbUlzVFRZICYmIGZvcmNlQ29sb3IgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiAwO1xuXHR9XG5cblx0Y29uc3QgbWluID0gZm9yY2VDb2xvciB8fCAwO1xuXG5cdGlmIChlbnYuVEVSTSA9PT0gJ2R1bWInKSB7XG5cdFx0cmV0dXJuIG1pbjtcblx0fVxuXG5cdGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG5cdFx0Ly8gV2luZG93cyAxMCBidWlsZCAxMDU4NiBpcyB0aGUgZmlyc3QgV2luZG93cyByZWxlYXNlIHRoYXQgc3VwcG9ydHMgMjU2IGNvbG9ycy5cblx0XHQvLyBXaW5kb3dzIDEwIGJ1aWxkIDE0OTMxIGlzIHRoZSBmaXJzdCByZWxlYXNlIHRoYXQgc3VwcG9ydHMgMTZtL1RydWVDb2xvci5cblx0XHRjb25zdCBvc1JlbGVhc2UgPSBvcy5yZWxlYXNlKCkuc3BsaXQoJy4nKTtcblx0XHRpZiAoXG5cdFx0XHROdW1iZXIob3NSZWxlYXNlWzBdKSA+PSAxMFxuXHRcdFx0JiYgTnVtYmVyKG9zUmVsZWFzZVsyXSkgPj0gMTBfNTg2XG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gTnVtYmVyKG9zUmVsZWFzZVsyXSkgPj0gMTRfOTMxID8gMyA6IDI7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIDE7XG5cdH1cblxuXHRpZiAoJ0NJJyBpbiBlbnYpIHtcblx0XHRpZiAoJ0dJVEhVQl9BQ1RJT05TJyBpbiBlbnYgfHwgJ0dJVEVBX0FDVElPTlMnIGluIGVudikge1xuXHRcdFx0cmV0dXJuIDM7XG5cdFx0fVxuXG5cdFx0aWYgKFsnVFJBVklTJywgJ0NJUkNMRUNJJywgJ0FQUFZFWU9SJywgJ0dJVExBQl9DSScsICdCVUlMREtJVEUnLCAnRFJPTkUnXS5zb21lKHNpZ24gPT4gc2lnbiBpbiBlbnYpIHx8IGVudi5DSV9OQU1FID09PSAnY29kZXNoaXAnKSB7XG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbWluO1xuXHR9XG5cblx0aWYgKCdURUFNQ0lUWV9WRVJTSU9OJyBpbiBlbnYpIHtcblx0XHRyZXR1cm4gL14oOVxcLigwKlsxLTldXFxkKilcXC58XFxkezIsfVxcLikvLnRlc3QoZW52LlRFQU1DSVRZX1ZFUlNJT04pID8gMSA6IDA7XG5cdH1cblxuXHRpZiAoZW52LkNPTE9SVEVSTSA9PT0gJ3RydWVjb2xvcicpIHtcblx0XHRyZXR1cm4gMztcblx0fVxuXG5cdGlmIChlbnYuVEVSTSA9PT0gJ3h0ZXJtLWtpdHR5Jykge1xuXHRcdHJldHVybiAzO1xuXHR9XG5cblx0aWYgKCdURVJNX1BST0dSQU0nIGluIGVudikge1xuXHRcdGNvbnN0IHZlcnNpb24gPSBOdW1iZXIucGFyc2VJbnQoKGVudi5URVJNX1BST0dSQU1fVkVSU0lPTiB8fCAnJykuc3BsaXQoJy4nKVswXSwgMTApO1xuXG5cdFx0c3dpdGNoIChlbnYuVEVSTV9QUk9HUkFNKSB7XG5cdFx0XHRjYXNlICdpVGVybS5hcHAnOiB7XG5cdFx0XHRcdHJldHVybiB2ZXJzaW9uID49IDMgPyAzIDogMjtcblx0XHRcdH1cblxuXHRcdFx0Y2FzZSAnQXBwbGVfVGVybWluYWwnOiB7XG5cdFx0XHRcdHJldHVybiAyO1xuXHRcdFx0fVxuXHRcdFx0Ly8gTm8gZGVmYXVsdFxuXHRcdH1cblx0fVxuXG5cdGlmICgvLTI1Nihjb2xvcik/JC9pLnRlc3QoZW52LlRFUk0pKSB7XG5cdFx0cmV0dXJuIDI7XG5cdH1cblxuXHRpZiAoL15zY3JlZW58Xnh0ZXJtfF52dDEwMHxednQyMjB8XnJ4dnR8Y29sb3J8YW5zaXxjeWd3aW58bGludXgvaS50ZXN0KGVudi5URVJNKSkge1xuXHRcdHJldHVybiAxO1xuXHR9XG5cblx0aWYgKCdDT0xPUlRFUk0nIGluIGVudikge1xuXHRcdHJldHVybiAxO1xuXHR9XG5cblx0cmV0dXJuIG1pbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN1cHBvcnRzQ29sb3Ioc3RyZWFtLCBvcHRpb25zID0ge30pIHtcblx0Y29uc3QgbGV2ZWwgPSBfc3VwcG9ydHNDb2xvcihzdHJlYW0sIHtcblx0XHRzdHJlYW1Jc1RUWTogc3RyZWFtICYmIHN0cmVhbS5pc1RUWSxcblx0XHQuLi5vcHRpb25zLFxuXHR9KTtcblxuXHRyZXR1cm4gdHJhbnNsYXRlTGV2ZWwobGV2ZWwpO1xufVxuXG5jb25zdCBzdXBwb3J0c0NvbG9yID0ge1xuXHRzdGRvdXQ6IGNyZWF0ZVN1cHBvcnRzQ29sb3Ioe2lzVFRZOiB0dHkuaXNhdHR5KDEpfSksXG5cdHN0ZGVycjogY3JlYXRlU3VwcG9ydHNDb2xvcih7aXNUVFk6IHR0eS5pc2F0dHkoMil9KSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHN1cHBvcnRzQ29sb3I7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3dvcmtlci50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
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
    initializePage(port) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tracker.point('initialization-start');
            try {
                this.browser = yield playwright_1.webkit.launch();
                this.context = yield this.browser.newContext();
                yield this.createNewPage(port);
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
    createNewPage(port) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.tracker.point('page-creation-start');
                this.page = yield this.context.newPage();
                const filePath = path_1.default.join(__dirname, '../../../src/render/dist/index.html');
                const url = `file://${filePath}?wsPort=${port}`;
                this.tracker.point('page-loading-start');
                yield this.page.goto(url, { waitUntil: 'load' });
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
                yield this.initializeWebSocketAndWaitForOpen(port);
            }
            catch (error) {
                console.error('Error creating or loading new page:', error);
                this.tracker.point('page-creation-error');
                yield this.cleanup(); // Закрываем ресурсы в случае ошибки
            }
        });
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.page) {
                    yield this.page.close(); // Закрываем страницу
                    console.log('Page closed');
                }
                if (this.context) {
                    yield this.context.close(); // Закрываем контекст браузера
                    console.log('Browser context closed');
                }
                if (this.browser) {
                    yield this.browser.close();
                    console.log('Browser closed');
                }
            }
            catch (error) {
                console.error('Error during cleanup:', error);
            }
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.cleanup();
            console.log('Browser shutdown complete');
        });
    }
    initializeWebSocketAndWaitForOpen(port) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const wss = new ws_2.Server({ port: port });
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
                    console.log(`WebSocket server is running on ws://localhost:${port}`);
                }
                catch (error) {
                    console.error('Failed to start WebSocket server:', error);
                    reject(error); // Reject the promise if there's an error
                }
            });
        });
    }
    closeWebSocketServerAndPage() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this.wss) === null || _a === void 0 ? void 0 : _a.close();
            yield this.cleanup();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEtBQUssa0RBQWdCO0FBQ3JCO0FBQ0E7QUFDQSxvQkFBb0IsNENBQVU7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxpQ0FBaUMsR0FBRztBQUNwQzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRU8saURBQWlEO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBLEVBQUU7O0FBRUY7QUFDQTs7QUFFQTtBQUNBLDhCQUE4QixPQUFPLDRDQUFVLElBQUk7QUFDbkQsOEJBQThCLE9BQU8sNENBQVUsSUFBSTtBQUNuRDs7QUFFQSxpRUFBZSxhQUFhLEVBQUM7Ozs7Ozs7VUNyTDdCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztVRU5BO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvc2VyZGUtdHMvZGlzdC9TZXJEZS5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9zZXJkZS10cy9kaXN0L2luZGV4LmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL3NlcnZlci9zcmMvUG9pbnRUcmFja2VyLnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL3NlcnZlci9zcmMvd29ya2VyLnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL3dvcmtlci10aHJlYWRzLW1hbmFnZXIvZGlzdC9zcmMvV29ya2VyQ29udHJvbGxlci5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy93b3JrZXItdGhyZWFkcy1tYW5hZ2VyL2Rpc3Qvc3JjL1dvcmtlck1hbmFnZXIuanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvd29ya2VyLXRocmVhZHMtbWFuYWdlci9kaXN0L3NyYy9pbmRleC5qcyIsImZpbGU6Ly8vZXh0ZXJuYWwgY29tbW9uanMgXCJwbGF5d3JpZ2h0XCIiLCJmaWxlOi8vL2V4dGVybmFsIGNvbW1vbmpzIFwid3NcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcIm5vZGU6b3NcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcIm5vZGU6cHJvY2Vzc1wiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwibm9kZTp0dHlcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcInBhdGhcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcIndvcmtlcl90aHJlYWRzXCIiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvY2hhbGsvc291cmNlL2luZGV4LmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL2NoYWxrL3NvdXJjZS91dGlsaXRpZXMuanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvY2hhbGsvc291cmNlL3ZlbmRvci9hbnNpLXN0eWxlcy9pbmRleC5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9jaGFsay9zb3VyY2UvdmVuZG9yL3N1cHBvcnRzLWNvbG9yL2luZGV4LmpzIiwiZmlsZTovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsImZpbGU6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwiZmlsZTovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwiZmlsZTovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0IiwiZmlsZTovLy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwiZmlsZTovLy93ZWJwYWNrL3N0YXJ0dXAiLCJmaWxlOi8vL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuU2VyRGUgPSB2b2lkIDA7XG4vLyBGdW5jdGlvbiB0byBjaGVjayBpZiBhIGdpdmVuIGZ1bmN0aW9uIGlzIGEgY2xhc3MgY29uc3RydWN0b3JcbmZ1bmN0aW9uIGlzQ2xhc3MoZnVuYykge1xuICAgIHJldHVybiB0eXBlb2YgZnVuYyA9PT0gJ2Z1bmN0aW9uJyAmJiAvXlxccypjbGFzc1xccysvLnRlc3QoZnVuYy50b1N0cmluZygpKTtcbn1cbmNsYXNzIFNlckRlIHtcbiAgICAvLyBNZXRob2QgdG8gaGFuZGxlIHNpbXBsZSB0eXBlcyBkaXJlY3RseVxuICAgIHN0YXRpYyBmcm9tU2ltcGxlKG9iaikge1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRGF0ZSB8fCB0eXBlb2Ygb2JqID09PSAnc3RyaW5nJyB8fCB0eXBlb2Ygb2JqID09PSAnbnVtYmVyJyB8fCB0eXBlb2Ygb2JqID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLy8gTWV0aG9kIHRvIHNldCBleGNsdXNpdmUgY2xhc3NlcyBmb3Igc2VyaWFsaXphdGlvblxuICAgIHN0YXRpYyBzZXRFeGNsdXNpdmVseShsaXN0KSB7XG4gICAgICAgIFNlckRlLm9ubHkgPSBuZXcgU2V0KFsuLi5saXN0LCBBcnJheSwgTWFwLCBTZXRdKTtcbiAgICB9XG4gICAgLy8gTWFpbiBzZXJpYWxpemF0aW9uIG1ldGhvZFxuICAgIHN0YXRpYyBzZXJpYWxpc2Uob2JqLCB2aXNpdGVkID0gbmV3IE1hcCgpLCBfbWFwID0gbmV3IE1hcCgpLCBkZXB0aCA9IDAsIHBhcmVudCkge1xuICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2QsIF9lO1xuICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcgfHwgb2JqID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgLy8gSWYgdGhlIG9iamVjdCBpcyBhIGNsYXNzIGFuZCBpcyBub3QgaW4gdGhlIGV4Y2x1c2l2ZSBsaXN0LCBza2lwIHNlcmlhbGl6YXRpb25cbiAgICAgICAgaWYgKCgoX2EgPSBTZXJEZS5vbmx5KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Euc2l6ZSkgJiYgaXNDbGFzcyhvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmouY29uc3RydWN0b3IpICYmICFTZXJEZS5vbmx5LmhhcyhvYmouY29uc3RydWN0b3IpKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIERhdGUpXG4gICAgICAgICAgICByZXR1cm4geyB0OiAnRGF0ZScsIHY6IG9iai52YWx1ZU9mKCkgfTtcbiAgICAgICAgbGV0IG1heWJlU2ltcGxlID0gU2VyRGUuZnJvbVNpbXBsZShvYmopO1xuICAgICAgICBpZiAobWF5YmVTaW1wbGUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHJldHVybiBtYXliZVNpbXBsZTtcbiAgICAgICAgaWYgKHZpc2l0ZWQuaGFzKG9iaikpIHtcbiAgICAgICAgICAgIHZpc2l0ZWQuZ2V0KG9iaikudGltZXMrKztcbiAgICAgICAgICAgIHJldHVybiB7IHQ6IChfYiA9IG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9iai5jb25zdHJ1Y3RvcikgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLm5hbWUsIHY6IHsgX21hcElkOiBTZXJEZS53ZWFrTWFwLmdldChvYmopIH0gfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgICAgICByZXR1cm4geyB0OiAnZnVuY3Rpb24nLCB2OiBvYmoubmFtZSB9O1xuICAgICAgICBpZiAocGFyZW50KVxuICAgICAgICAgICAgdmlzaXRlZC5zZXQob2JqLCB7IHRpbWVzOiAxLCBwYXJlbnQgfSk7XG4gICAgICAgIGxldCBpZCA9IChfYyA9IFNlckRlLndlYWtNYXAuZ2V0KG9iaikpICE9PSBudWxsICYmIF9jICE9PSB2b2lkIDAgPyBfYyA6IFNlckRlLmlkKys7XG4gICAgICAgIFNlckRlLndlYWtNYXAuc2V0KG9iaiwgaWQpO1xuICAgICAgICAvLyBIYW5kbGUgTWFwIG9iamVjdHNcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgbGV0IHNlcmlhbGlzZWQgPSBuZXcgQXJyYXkob2JqLnNpemUpO1xuICAgICAgICAgICAgX21hcC5zZXQoaWQsIHNlcmlhbGlzZWQpO1xuICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgb2JqLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICBzZXJpYWxpc2VkW2ldID0gW1xuICAgICAgICAgICAgICAgICAgICBTZXJEZS5zZXJpYWxpc2Uoa2V5LCB2aXNpdGVkLCBfbWFwLCBkZXB0aCArIDEsIHsgb2JqOiBzZXJpYWxpc2VkLCBrZXk6IFtpLCAwXSB9KSxcbiAgICAgICAgICAgICAgICAgICAgU2VyRGUuc2VyaWFsaXNlKHZhbHVlLCB2aXNpdGVkLCBfbWFwLCBkZXB0aCArIDEsIHsgb2JqOiBzZXJpYWxpc2VkLCBrZXk6IFtpLCAxXSB9KSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgdDogb2JqLmNvbnN0cnVjdG9yLm5hbWUsIHY6IHNlcmlhbGlzZWQgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBIYW5kbGUgU2V0IGFuZCBBcnJheSBvYmplY3RzXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBTZXQgfHwgb2JqIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGxldCBzZXJpYWxpc2VkID0gQXJyYXkob2JqIGluc3RhbmNlb2YgU2V0ID8gb2JqLnNpemUgOiBvYmoubGVuZ3RoKTtcbiAgICAgICAgICAgIF9tYXAuc2V0KGlkLCBzZXJpYWxpc2VkKTtcbiAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgIG9iai5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHNlcmlhbGlzZWRbaV0gPSBTZXJEZS5zZXJpYWxpc2UodmFsdWUsIHZpc2l0ZWQsIF9tYXAsIGRlcHRoICsgMSwgeyBvYmo6IHNlcmlhbGlzZWQsIGtleTogaSB9KTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB7IHQ6IG9iai5jb25zdHJ1Y3Rvci5uYW1lLCB2OiBzZXJpYWxpc2VkIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gSGFuZGxlIGdlbmVyaWMgb2JqZWN0c1xuICAgICAgICBsZXQgc2VyaWFsaXNlZCA9IHt9O1xuICAgICAgICBfbWFwLnNldChpZCwgc2VyaWFsaXNlZCk7XG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgICAgICAgICBzZXJpYWxpc2VkW2tleV0gPSBTZXJEZS5zZXJpYWxpc2UodmFsdWUsIHZpc2l0ZWQsIF9tYXAsIGRlcHRoICsgMSwgeyBvYmo6IHNlcmlhbGlzZWQsIGtleSB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB3ZSBhcmUgYXQgdGhlIHRvcCBsZXZlbCwgaGFuZGxlIGNpcmN1bGFyIHJlZmVyZW5jZXMgYW5kIG11bHRpcGxlIGluc3RhbmNlc1xuICAgICAgICBpZiAoZGVwdGggPT09IDApIHtcbiAgICAgICAgICAgIGxldCByZWN1cnNpb25WaXNpdGVkID0gQXJyYXkuZnJvbSh2aXNpdGVkKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKFtfLCB2YWxdKSA9PiB2YWwudGltZXMgPiAxKVxuICAgICAgICAgICAgICAgIC5tYXAoKFtvYmosIHZhbF0pID0+IFtTZXJEZS53ZWFrTWFwLmdldChvYmopLCB2YWxdKTsgLy8gRXhwbGljaXRseSBjYXN0IGlkIHRvIG51bWJlclxuICAgICAgICAgICAgcmVjdXJzaW9uVmlzaXRlZC5mb3JFYWNoKChbaWQsIHZhbF0pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodmFsLnBhcmVudC5rZXkgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5wYXJlbnQub2JqW3ZhbC5wYXJlbnQua2V5WzBdXVt2YWwucGFyZW50LmtleVsxXV0udiA9IHsgX21hcElkOiBpZCB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgICAgICB2YWwucGFyZW50Lm9ialt2YWwucGFyZW50LmtleV0udiA9IHsgX21hcElkOiBpZCB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQXR0YWNoIHRoZSBfbWFwIGZvciBzZXJpYWxpemF0aW9uIHJlc3VsdFxuICAgICAgICAgICAgcmV0dXJuIHsgdDogKF9kID0gb2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLmNvbnN0cnVjdG9yKSA9PT0gbnVsbCB8fCBfZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2QubmFtZSwgdjogc2VyaWFsaXNlZCwgX21hcDogcmVjdXJzaW9uVmlzaXRlZC5tYXAoKHgpID0+IFt4WzBdLCBfbWFwLmdldCh4WzBdKV0pIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgdDogKF9lID0gb2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLmNvbnN0cnVjdG9yKSA9PT0gbnVsbCB8fCBfZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2UubmFtZSwgdjogc2VyaWFsaXNlZCB9O1xuICAgIH1cbiAgICAvLyBNYWluIGRlc2VyaWFsaXphdGlvbiBtZXRob2RcbiAgICBzdGF0aWMgZGVzZXJpYWxpemUob2JqKSB7XG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2UsIF9mLCBfZywgX2gsIF9qLCBfaywgX2w7XG4gICAgICAgIGlmIChvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICBpZiAoKG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9iai50KSA9PT0gJ0RhdGUnKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG9iai52KTtcbiAgICAgICAgLy8gSWYgb2JqIGlzIGEgcHJpbWl0aXZlLCByZXR1cm4gaXQgZGlyZWN0bHkgKHdpdGggRGF0ZSBoYW5kbGluZylcbiAgICAgICAgaWYgKFNlckRlLmlzUHJpbWl0aXZlKG9iaikpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBEYXRlID8gbmV3IERhdGUob2JqKSA6IG9iajtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2JqLnQgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICByZXR1cm4gKF9hID0gU2VyRGUuY2xhc3NSZWdpc3RyeS5nZXQob2JqLnYpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiB7fTtcbiAgICAgICAgLy8gSGFuZGxlcyB0aGUgcmVzdG9yYXRpb24gb2YgX21hcCBmb3Igb2JqZWN0IHJlZmVyZW5jZXMgaWYgaXQgZXhpc3RzXG4gICAgICAgIGlmIChvYmouX21hcCkge1xuICAgICAgICAgICAgU2VyRGUuX21hcCA9IG5ldyBNYXAob2JqLl9tYXApO1xuICAgICAgICAgICAgU2VyRGUuX3RlbXBNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmV0cmlldmUgdGhlIGNsYXNzIGNvbnN0cnVjdG9yIGlmIGF2YWlsYWJsZVxuICAgICAgICBjb25zdCBjbGFzc0NvbnN0cnVjdG9yID0gU2VyRGUuY2xhc3NSZWdpc3RyeS5nZXQob2JqLnQpO1xuICAgICAgICBsZXQgaW5zdGFuY2U7XG4gICAgICAgIGlmICgoKF9iID0gb2JqLnYpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5fbWFwSWQpICYmICgoX2MgPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLmhhcyhvYmoudi5fbWFwSWQpKSkge1xuICAgICAgICAgICAgcmV0dXJuIChfZCA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2QuZ2V0KG9iai52Ll9tYXBJZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpbnN0YW5jZSA9IGNsYXNzQ29uc3RydWN0b3IgPyBPYmplY3QuY3JlYXRlKGNsYXNzQ29uc3RydWN0b3IucHJvdG90eXBlKSA6IHt9O1xuICAgICAgICAgICAgKF9lID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZS5zZXQob2JqLnYuX21hcElkLCBpbnN0YW5jZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG5lc3RlZCA9IChfaCA9IChfZiA9IFNlckRlLl9tYXApID09PSBudWxsIHx8IF9mID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZi5nZXQoKF9nID0gb2JqLnYpID09PSBudWxsIHx8IF9nID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZy5fbWFwSWQpKSAhPT0gbnVsbCAmJiBfaCAhPT0gdm9pZCAwID8gX2ggOiBvYmoudjtcbiAgICAgICAgLy8gRGVzZXJpYWxpemUgYmFzZWQgb24gdGhlIHR5cGUgb2Ygb2JqZWN0XG4gICAgICAgIHN3aXRjaCAob2JqLnQpIHtcbiAgICAgICAgICAgIGNhc2UgJ0FycmF5JzogLy8gSGFuZGxlIGFycmF5c1xuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmVzdGVkLm1hcCgoaXRlbSkgPT4gU2VyRGUuZGVzZXJpYWxpemUoaXRlbSkpO1xuICAgICAgICAgICAgICAgIChfaiA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2ouc2V0KG9iai52Ll9tYXBJZCwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgICAgIGNhc2UgJ01hcCc6IC8vIEhhbmRsZSBtYXBzXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgTWFwKG5lc3RlZC5tYXAoKFtrZXksIHZhbHVlXSkgPT4gW1NlckRlLmRlc2VyaWFsaXplKGtleSksIFNlckRlLmRlc2VyaWFsaXplKHZhbHVlKV0pKTtcbiAgICAgICAgICAgICAgICAoX2sgPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2sgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9rLnNldChvYmoudi5fbWFwSWQsIGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgICAgICBjYXNlICdTZXQnOiAvLyBIYW5kbGUgc2V0c1xuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IFNldChuZXN0ZWQubWFwKChpdGVtKSA9PiBTZXJEZS5kZXNlcmlhbGl6ZShpdGVtKSkpO1xuICAgICAgICAgICAgICAgIChfbCA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2wuc2V0KG9iai52Ll9tYXBJZCwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6IC8vIEhhbmRsZSBvYmplY3RzXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMobmVzdGVkKSkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtrZXldID0gU2VyRGUuZGVzZXJpYWxpemUodmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2xhc3NDb25zdHJ1Y3RvciAmJiBTZXJEZS5pbml0RnVuY05hbWUgJiYgdHlwZW9mIGluc3RhbmNlW1NlckRlLmluaXRGdW5jTmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VbU2VyRGUuaW5pdEZ1bmNOYW1lXSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBDbGVhciB0aGUgX21hcCBhZnRlciBkZXNlcmlhbGl6YXRpb24gaXMgY29tcGxldGUgdG8gZnJlZSBtZW1vcnlcbiAgICAgICAgaWYgKG9iai5fbWFwKSB7XG4gICAgICAgICAgICBTZXJEZS5fbWFwID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgU2VyRGUuX3RlbXBNYXAgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlOyAvLyBSZXR1cm4gdGhlIGRlc2VyaWFsaXplZCBpbnN0YW5jZVxuICAgIH1cbiAgICAvLyBNZXRob2QgdG8gcmVnaXN0ZXIgY2xhc3NlcyBmb3IgZGVzZXJpYWxpemF0aW9uXG4gICAgc3RhdGljIGNsYXNzUmVnaXN0cmF0aW9uKGNsYXNzZXMpIHtcbiAgICAgICAgY2xhc3Nlcy5mb3JFYWNoKCh4KSA9PiBTZXJEZS5jbGFzc1JlZ2lzdHJ5LnNldCh4Lm5hbWUsIHgpKTtcbiAgICB9XG4gICAgLy8gSGVscGVyIG1ldGhvZCB0byBjaGVjayBpZiBhIHZhbHVlIGlzIHByaW1pdGl2ZVxuICAgIHN0YXRpYyBpc1ByaW1pdGl2ZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gKHZhbHVlID09PSBudWxsIHx8XG4gICAgICAgICAgICBbJ251bWJlcicsICdzdHJpbmcnLCAnYm9vbGVhbicsICd1bmRlZmluZWQnLCAnc3ltYm9sJywgJ2JpZ2ludCddLmluY2x1ZGVzKHR5cGVvZiB2YWx1ZSkgfHxcbiAgICAgICAgICAgIHZhbHVlIGluc3RhbmNlb2YgRGF0ZSk7XG4gICAgfVxufVxuZXhwb3J0cy5TZXJEZSA9IFNlckRlO1xuU2VyRGUuaW5pdEZ1bmNOYW1lID0gJ19pbml0Rm4nOyAvLyBOYW1lIG9mIHRoZSBpbml0aWFsaXphdGlvbiBmdW5jdGlvbiAoaWYgZXhpc3RzKVxuU2VyRGUuaWQgPSAwOyAvLyBVbmlxdWUgSUQgY291bnRlciBmb3Igb2JqZWN0c1xuU2VyRGUud2Vha01hcCA9IG5ldyBXZWFrTWFwKCk7IC8vIFdlYWtNYXAgdG8gdHJhY2sgb2JqZWN0cyBkdXJpbmcgc2VyaWFsaXphdGlvblxuU2VyRGUuY2xhc3NSZWdpc3RyeSA9IG5ldyBNYXAoW1xuICAgIFsnQXJyYXknLCBBcnJheV0sXG4gICAgWydTZXQnLCBTZXRdLFxuICAgIFsnTWFwJywgTWFwXSxcbl0pOyAvLyBSZWdpc3RyeSBvZiBjbGFzc2VzIGZvciBkZXNlcmlhbGl6YXRpb25cbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX2V4cG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9fZXhwb3J0U3RhcikgfHwgZnVuY3Rpb24obSwgZXhwb3J0cykge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZXhwb3J0cywgcCkpIF9fY3JlYXRlQmluZGluZyhleHBvcnRzLCBtLCBwKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vLyBzcmMvaW5kZXgudHNcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9TZXJEZVwiKSwgZXhwb3J0cyk7XG4iLCJpbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuXG5pbnRlcmZhY2UgUmVwb3J0RmlsdGVyIHtcbiAgICBtaW5UaW1lPzogbnVtYmVyO1xuICAgIHZpc2l0cz86IG51bWJlcjtcbiAgICByZXF1aXJlRGVwZW5kZW5jaWVzPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFBvaW50VHJhY2tlciB7XG4gICAgcHJpdmF0ZSBwb2ludHM6IE1hcDxzdHJpbmcsIFBvaW50RGF0YT47XG4gICAgcHJpdmF0ZSBsYXN0VGltZXN0YW1wczogTWFwPHN0cmluZywgbnVtYmVyPjtcbiAgICBwcml2YXRlIGxhc3RQb2ludDogc3RyaW5nIHwgbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnBvaW50cyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5sYXN0VGltZXN0YW1wcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5sYXN0UG9pbnQgPSBudWxsO1xuICAgIH1cblxuICAgIHBvaW50KHBvaW50TmFtZTogc3RyaW5nLCBjaGVja1BvaW50cz86IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgIGlmICghdGhpcy5wb2ludHMuaGFzKHBvaW50TmFtZSkpIHtcbiAgICAgICAgICAgIHRoaXMucG9pbnRzLnNldChwb2ludE5hbWUsIG5ldyBQb2ludERhdGEoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjdXJyZW50UG9pbnREYXRhID0gdGhpcy5wb2ludHMuZ2V0KHBvaW50TmFtZSkhO1xuXG4gICAgICAgIGlmICh0aGlzLmxhc3RUaW1lc3RhbXBzLmhhcyhwb2ludE5hbWUpKSB7XG4gICAgICAgICAgICBjb25zdCB0aW1lU2luY2VMYXN0VmlzaXQgPSBjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWVzdGFtcHMuZ2V0KHBvaW50TmFtZSkhO1xuICAgICAgICAgICAgY3VycmVudFBvaW50RGF0YS51cGRhdGVJdGVyYXRpb25UaW1lKHRpbWVTaW5jZUxhc3RWaXNpdCk7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50UG9pbnREYXRhLmluY3JlbWVudFZpc2l0cygpO1xuXG4gICAgICAgIGlmIChjaGVja1BvaW50cykge1xuICAgICAgICAgICAgY2hlY2tQb2ludHMuZm9yRWFjaCgoY2hlY2tQb2ludE5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0VGltZXN0YW1wcy5oYXMoY2hlY2tQb2ludE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVTcGVudCA9IGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZXN0YW1wcy5nZXQoY2hlY2tQb2ludE5hbWUpITtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFBvaW50RGF0YS51cGRhdGVUcmFuc2l0aW9uKGNoZWNrUG9pbnROYW1lLCB0aW1lU3BlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubGFzdFBvaW50ICE9PSBudWxsICYmIHRoaXMubGFzdFBvaW50ICE9PSBwb2ludE5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVTcGVudCA9IGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZXN0YW1wcy5nZXQodGhpcy5sYXN0UG9pbnQpITtcbiAgICAgICAgICAgIGN1cnJlbnRQb2ludERhdGEudXBkYXRlVHJhbnNpdGlvbih0aGlzLmxhc3RQb2ludCArIFwiIChwcmV2aW91cylcIiwgdGltZVNwZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubGFzdFRpbWVzdGFtcHMuc2V0KHBvaW50TmFtZSwgY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmxhc3RQb2ludCA9IHBvaW50TmFtZTtcbiAgICB9XG5cbiAgICByZXBvcnQoZmlsdGVyOiBSZXBvcnRGaWx0ZXIgPSB7fSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHJlcG9ydExpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCBtaW5UaW1lRmlsdGVyID0gZmlsdGVyLm1pblRpbWUgfHwgMDtcbiAgICAgICAgY29uc3QgbWluVmlzaXRzRmlsdGVyID0gZmlsdGVyLnZpc2l0cyB8fCAwO1xuICAgICAgICBjb25zdCByZXF1aXJlRGVwZW5kZW5jaWVzID0gZmlsdGVyLnJlcXVpcmVEZXBlbmRlbmNpZXMgfHwgZmFsc2U7XG5cbiAgICAgICAgLy8g0KTQuNC70YzRgtGA0LDRhtC40Y8g0YLQvtGH0LXQulxuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKChkYXRhLCBwb2ludCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXZnVGltZSA9IGRhdGEuYXZlcmFnZUl0ZXJhdGlvblRpbWUoKTtcblxuICAgICAgICAgICAgaWYgKGF2Z1RpbWUgPj0gbWluVGltZUZpbHRlciAmJiBkYXRhLnRvdGFsVmlzaXRzID49IG1pblZpc2l0c0ZpbHRlcikge1xuICAgICAgICAgICAgICAgIC8vINCk0LjQu9GM0YLRgNCw0YbQuNGPINC/0LXRgNC10YXQvtC00L7QslxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkVHJhbnNpdGlvbnMgPSBuZXcgTWFwPHN0cmluZywgVHJhbnNpdGlvbkRhdGE+KCk7XG5cbiAgICAgICAgICAgICAgICBkYXRhLnRyYW5zaXRpb25zLmZvckVhY2goKHRyYW5zaXRpb25EYXRhLCBmcm9tUG9pbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25EYXRhLmF2ZXJhZ2VUaW1lKCkgPj0gbWluVGltZUZpbHRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRUcmFuc2l0aW9ucy5zZXQoZnJvbVBvaW50LCB0cmFuc2l0aW9uRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vINCU0L7QsdCw0LLQu9C10L3QuNC1INCyINC+0YLRh9C10YIg0YLQvtC70YzQutC+INC10YHQu9C4INC10YHRgtGMINC/0LXRgNC10YXQvtC00Ysg0LjQu9C4INC90LUg0YLRgNC10LHRg9C10YLRgdGPINC+0LHRj9C30LDRgtC10LvRjNC90YvRhSDQt9Cw0LLQuNGB0LjQvNC+0YHRgtC10LlcbiAgICAgICAgICAgICAgICBpZiAoIXJlcXVpcmVEZXBlbmRlbmNpZXMgfHwgZmlsdGVyZWRUcmFuc2l0aW9ucy5zaXplID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFBvaW50V2l0aEZpbHRlcmVkVHJhbnNpdGlvbnMocmVwb3J0TGluZXMsIHBvaW50LCBkYXRhLCBmaWx0ZXJlZFRyYW5zaXRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXBvcnRMaW5lcy5qb2luKFwiXFxuXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkUG9pbnRXaXRoRmlsdGVyZWRUcmFuc2l0aW9ucyhcbiAgICAgICAgcmVwb3J0TGluZXM6IHN0cmluZ1tdLFxuICAgICAgICBwb2ludDogc3RyaW5nLFxuICAgICAgICBkYXRhOiBQb2ludERhdGEsXG4gICAgICAgIGZpbHRlcmVkVHJhbnNpdGlvbnM6IE1hcDxzdHJpbmcsIFRyYW5zaXRpb25EYXRhPlxuICAgICkge1xuICAgICAgICByZXBvcnRMaW5lcy5wdXNoKFxuICAgICAgICAgICAgYCR7Y2hhbGsuZ3JlZW4ocG9pbnQpfTogVmlzaXRzPSR7ZGF0YS50b3RhbFZpc2l0c30sIEF2Z1RpbWU9JHtjaGFsay5yZWQoZGF0YS5hdmVyYWdlSXRlcmF0aW9uVGltZSgpLnRvRml4ZWQoMikpfW1zYFxuICAgICAgICApO1xuXG4gICAgICAgIGZpbHRlcmVkVHJhbnNpdGlvbnMuZm9yRWFjaCgodHJhbnNpdGlvbkRhdGEsIGZyb21Qb2ludCkgPT4ge1xuICAgICAgICAgICAgcmVwb3J0TGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBgICAke2NoYWxrLmN5YW4oZnJvbVBvaW50KX0gLT4gJHtjaGFsay5ncmVlbihwb2ludCl9OiBDb3VudD0ke3RyYW5zaXRpb25EYXRhLmNvdW50fSwgTWluPSR7dHJhbnNpdGlvbkRhdGEubWluVGltZS50b0ZpeGVkKDIpfW1zLCBNYXg9JHt0cmFuc2l0aW9uRGF0YS5tYXhUaW1lLnRvRml4ZWQoMil9bXMsIEF2Zz0ke2NoYWxrLnJlZCh0cmFuc2l0aW9uRGF0YS5hdmVyYWdlVGltZSgpLnRvRml4ZWQoMikpfW1zYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jbGFzcyBQb2ludERhdGEge1xuICAgIHRvdGFsVmlzaXRzOiBudW1iZXI7XG4gICAgdG90YWxJdGVyYXRpb25UaW1lOiBudW1iZXI7XG4gICAgdHJhbnNpdGlvbnM6IE1hcDxzdHJpbmcsIFRyYW5zaXRpb25EYXRhPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnRvdGFsVmlzaXRzID0gMDtcbiAgICAgICAgdGhpcy50b3RhbEl0ZXJhdGlvblRpbWUgPSAwO1xuICAgICAgICB0aGlzLnRyYW5zaXRpb25zID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIGluY3JlbWVudFZpc2l0cygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy50b3RhbFZpc2l0cyArPSAxO1xuICAgIH1cblxuICAgIHVwZGF0ZUl0ZXJhdGlvblRpbWUodGltZVNwZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy50b3RhbEl0ZXJhdGlvblRpbWUgKz0gdGltZVNwZW50O1xuICAgIH1cblxuICAgIGF2ZXJhZ2VJdGVyYXRpb25UaW1lKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvdGFsVmlzaXRzID4gMSA/IHRoaXMudG90YWxJdGVyYXRpb25UaW1lIC8gKHRoaXMudG90YWxWaXNpdHMgLSAxKSA6IDA7XG4gICAgfVxuXG4gICAgdXBkYXRlVHJhbnNpdGlvbihmcm9tUG9pbnQ6IHN0cmluZywgdGltZVNwZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLnRyYW5zaXRpb25zLmhhcyhmcm9tUG9pbnQpKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25zLnNldChmcm9tUG9pbnQsIG5ldyBUcmFuc2l0aW9uRGF0YSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRyYW5zaXRpb25EYXRhID0gdGhpcy50cmFuc2l0aW9ucy5nZXQoZnJvbVBvaW50KSE7XG4gICAgICAgIHRyYW5zaXRpb25EYXRhLnVwZGF0ZSh0aW1lU3BlbnQpO1xuICAgIH1cbn1cblxuY2xhc3MgVHJhbnNpdGlvbkRhdGEge1xuICAgIGNvdW50OiBudW1iZXI7XG4gICAgdG90YWxUaW1lOiBudW1iZXI7XG4gICAgbWluVGltZTogbnVtYmVyO1xuICAgIG1heFRpbWU6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvdW50ID0gMDtcbiAgICAgICAgdGhpcy50b3RhbFRpbWUgPSAwO1xuICAgICAgICB0aGlzLm1pblRpbWUgPSBJbmZpbml0eTtcbiAgICAgICAgdGhpcy5tYXhUaW1lID0gMDtcbiAgICB9XG5cbiAgICB1cGRhdGUodGltZVNwZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jb3VudCArPSAxO1xuICAgICAgICB0aGlzLnRvdGFsVGltZSArPSB0aW1lU3BlbnQ7XG4gICAgICAgIHRoaXMubWluVGltZSA9IE1hdGgubWluKHRoaXMubWluVGltZSwgdGltZVNwZW50KTtcbiAgICAgICAgdGhpcy5tYXhUaW1lID0gTWF0aC5tYXgodGhpcy5tYXhUaW1lLCB0aW1lU3BlbnQpO1xuICAgIH1cblxuICAgIGF2ZXJhZ2VUaW1lKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvdW50ID4gMCA/IHRoaXMudG90YWxUaW1lIC8gdGhpcy5jb3VudCA6IDA7XG4gICAgfVxufVxuIiwiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge0Jyb3dzZXIsIEJyb3dzZXJDb250ZXh0LCBQYWdlLCB3ZWJraXR9IGZyb20gJ3BsYXl3cmlnaHQnO1xuaW1wb3J0IFdlYlNvY2tldCwge1dlYlNvY2tldFNlcnZlcn0gZnJvbSAnd3MnO1xuaW1wb3J0IHtTZXJ2ZXJ9IGZyb20gJ3dzJztcbmltcG9ydCB7UG9pbnRUcmFja2VyfSBmcm9tIFwiLi9Qb2ludFRyYWNrZXJcIjtcbmltcG9ydCB7V29ya2VyQ29udHJvbGxlcn0gZnJvbSBcIndvcmtlci10aHJlYWRzLW1hbmFnZXIvZGlzdC9zcmNcIjtcblxuaW50ZXJmYWNlIEZyYW1lR3JvdXAge1xuICAgIHN0YXJ0VGltZTogbnVtYmVyO1xuICAgIGZyYW1lSW50ZXJ2YWw6IG51bWJlcjtcbiAgICBmcmFtZUNvdW50OiBudW1iZXI7XG4gICAgdG90YWxIZWlnaHQ6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGltYWdlQnVmZmVyOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBXZWJTb2NrZXRDb21tYW5kIHtcbiAgICBjb21tYW5kOiAnZ2VuZXJhdGVOZXh0R3JvdXAnIHwgJ3NldFN0YXJ0VGltZScgfCAnZ2V0U25hcHNob3QnIHwgJ2xvYWRTbmFwc2hvdCcgfCAnaW5pdGlhbGl6ZUVsZW1lbnRzJztcbiAgICB2YWx1ZT86IGFueTtcbiAgICBpbWFnZUJ1ZmZlcj86IHN0cmluZztcbiAgICBmcmFtZUdyb3VwPzogRnJhbWVHcm91cDtcbn1cblxuZXhwb3J0IGNsYXNzIEhhbmRsZXJzIHtcbiAgICBwcml2YXRlIGJyb3dzZXI6IEJyb3dzZXIgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGNvbnRleHQ6IEJyb3dzZXJDb250ZXh0IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBwYWdlOiBQYWdlIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSB3c3M6IFdlYlNvY2tldFNlcnZlciB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcmVzb2x2ZU9uTWFzc2FnZTogKCh2YWx1ZTogRnJhbWVHcm91cCB8IFByb21pc2VMaWtlPEZyYW1lR3JvdXA+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZFxuICAgIHByaXZhdGUgdHJhY2tlciA9IG5ldyBQb2ludFRyYWNrZXIoKTtcbiAgICBwcml2YXRlIGxhc3RUaW1lOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBzbmFwc2hvdDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgcmVzb2x2ZUZ1bmM6ICgodmFsdWU6IHN0cmluZykgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHdzOiBXZWJTb2NrZXQgfCB1bmRlZmluZWQ7XG5cbiAgICBhc3luYyBpbml0aWFsaXplUGFnZShwb3J0OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdpbml0aWFsaXphdGlvbi1zdGFydCcpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmJyb3dzZXIgPSBhd2FpdCB3ZWJraXQubGF1bmNoKCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQgPSBhd2FpdCB0aGlzLmJyb3dzZXIubmV3Q29udGV4dCgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVOZXdQYWdlKHBvcnQpO1xuICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdpbml0aWFsaXphdGlvbi1lbmQnLCBbJ2luaXRpYWxpemF0aW9uLXN0YXJ0J10pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHNldFN0YXJ0VGltZSAobmV3VGltZTogbnVtYmVyIHwgRGF0ZSkge1xuICAgICAgICBhd2FpdCB0aGlzLnNlbmRXZWJTb2NrZXRDb21tYW5kKHtjb21tYW5kOiBcInNldFN0YXJ0VGltZVwiLCB2YWx1ZTogbmV3VGltZS52YWx1ZU9mKCl9KVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmVGdW5jID0gcmVzb2x2ZVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlTmV3UGFnZShwb3J0OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgncGFnZS1jcmVhdGlvbi1zdGFydCcpO1xuICAgICAgICAgICAgdGhpcy5wYWdlID0gYXdhaXQgdGhpcy5jb250ZXh0IS5uZXdQYWdlKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3NyYy9yZW5kZXIvZGlzdC9pbmRleC5odG1sJyk7XG4gICAgICAgICAgICBjb25zdCB1cmwgPSBgZmlsZTovLyR7ZmlsZVBhdGh9P3dzUG9ydD0ke3BvcnR9YDtcbiAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgncGFnZS1sb2FkaW5nLXN0YXJ0Jyk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBhZ2UuZ290byh1cmwsIHt3YWl0VW50aWw6ICdsb2FkJ30pO1xuICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdwYWdlLWxvYWRpbmctZW5kJywgWydwYWdlLWxvYWRpbmctc3RhcnQnXSk7XG5cbiAgICAgICAgICAgIHRoaXMucGFnZS5vbignY29uc29sZScsIGFzeW5jIChtc2cpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2dBcmdzID0gbXNnLmFyZ3MoKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2dWYWx1ZXMgPSBhd2FpdCBQcm9taXNlLmFsbChtc2dBcmdzLm1hcChhc3luYyAoYXJnKSA9PiBhd2FpdCBhcmcuanNvblZhbHVlKCkpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCI6OlwiLCAuLi5sb2dWYWx1ZXMpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGxvZ2dpbmcgY29uc29sZSBvdXRwdXQ6XCIsIGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTmV3IHBhZ2UgbG9hZGVkJyk7XG4gICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3BhZ2UtY3JlYXRpb24tZW5kJywgWydwYWdlLWNyZWF0aW9uLXN0YXJ0J10pO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5pbml0aWFsaXplV2ViU29ja2V0QW5kV2FpdEZvck9wZW4ocG9ydCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBvciBsb2FkaW5nIG5ldyBwYWdlOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgncGFnZS1jcmVhdGlvbi1lcnJvcicpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jbGVhbnVwKCk7ICAvLyDQl9Cw0LrRgNGL0LLQsNC10Lwg0YDQtdGB0YPRgNGB0Ysg0LIg0YHQu9GD0YfQsNC1INC+0YjQuNCx0LrQuFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjbGVhbnVwKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHRoaXMucGFnZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGFnZS5jbG9zZSgpOyAgLy8g0JfQsNC60YDRi9Cy0LDQtdC8INGB0YLRgNCw0L3QuNGG0YNcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUGFnZSBjbG9zZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNvbnRleHQuY2xvc2UoKTsgIC8vINCX0LDQutGA0YvQstCw0LXQvCDQutC+0L3RgtC10LrRgdGCINCx0YDQsNGD0LfQtdGA0LBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQnJvd3NlciBjb250ZXh0IGNsb3NlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuYnJvd3Nlcikge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYnJvd3Nlci5jbG9zZSgpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Jyb3dzZXIgY2xvc2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkdXJpbmcgY2xlYW51cDonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc2h1dGRvd24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGF3YWl0IHRoaXMuY2xlYW51cCgpO1xuICAgICAgICBjb25zb2xlLmxvZygnQnJvd3NlciBzaHV0ZG93biBjb21wbGV0ZScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgaW5pdGlhbGl6ZVdlYlNvY2tldEFuZFdhaXRGb3JPcGVuKHBvcnQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB3c3MgPSBuZXcgU2VydmVyKHtwb3J0OiBwb3J0fSk7XG4gICAgICAgICAgICAgICAgdGhpcy53c3MgPSB3c3M7XG5cbiAgICAgICAgICAgICAgICAvLyDQpNC70LDQsywg0YfRgtC+0LHRiyDQvtGC0YHQu9C10LTQuNGC0YwsINGA0LDQt9GA0LXRiNGR0L0g0LvQuCDRg9C20LUg0L/RgNC+0LzQuNGBXG4gICAgICAgICAgICAgICAgbGV0IGlzUmVzb2x2ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIHdzcy5vbignY29ubmVjdGlvbicsICh3cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnV2ViU29ja2V0IGNvbm5lY3Rpb24gb3BlbmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud3MgPSB3c1xuXG4gICAgICAgICAgICAgICAgICAgIC8vINCe0YLQv9GA0LDQstC70Y/QtdC8INC60L7QvNCw0L3QtNGDINC00LvRjyDQuNC90LjRhtC40LDQu9C40LfQsNGG0LjQuCDRjdC70LXQvNC10L3RgtC+0LJcbiAgICAgICAgICAgICAgICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7Y29tbWFuZDogJ2luaXRpYWxpemVFbGVtZW50cyd9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g0J7QsdGA0LDQsdCw0YLRi9Cy0LDQtdC8INGB0L7QvtCx0YnQtdC90LjRj1xuICAgICAgICAgICAgICAgICAgICB3cy5vbignbWVzc2FnZScsIGFzeW5jIChtZXNzYWdlOiBXZWJTb2NrZXQuRGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVXZWJTb2NrZXRNZXNzYWdlKHtkYXRhOiBtZXNzYWdlfSBhcyBXZWJTb2NrZXQuTWVzc2FnZUV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g0KPQtNCw0LvRj9C10Lwg0LfQsNC60YDRi9GC0L7QtSDRgdC+0LXQtNC40L3QtdC90LjQtSDQuNC3INC80LDRgdGB0LjQstCwINC60LvQuNC10L3RgtC+0LJcbiAgICAgICAgICAgICAgICAgICAgd3Mub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dlYlNvY2tldCBjb25uZWN0aW9uIGNsb3NlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyDQntCx0YDQsNCx0LDRgtGL0LLQsNC10Lwg0L7RiNC40LHQutC4XG4gICAgICAgICAgICAgICAgICAgIHdzLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignV2ViU29ja2V0IGVycm9yOicsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdlcnJvci1vY2N1cnJlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyDQoNCw0LfRgNC10YjQsNC10Lwg0L/RgNC+0LzQuNGBINC/0L7RgdC70LUg0L/QtdGA0LLQvtCz0L4g0YPRgdC/0LXRiNC90L7Qs9C+INC/0L7QtNC60LvRjtGH0LXQvdC40Y9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1Jlc29sdmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1Jlc29sdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFdlYlNvY2tldCBzZXJ2ZXIgaXMgcnVubmluZyBvbiB3czovL2xvY2FsaG9zdDoke3BvcnR9YCk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHN0YXJ0IFdlYlNvY2tldCBzZXJ2ZXI6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7ICAvLyBSZWplY3QgdGhlIHByb21pc2UgaWYgdGhlcmUncyBhbiBlcnJvclxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBjbG9zZVdlYlNvY2tldFNlcnZlckFuZFBhZ2UgICgpIHtcbiAgICAgICAgdGhpcy53c3M/LmNsb3NlKClcbiAgICAgICAgYXdhaXQgdGhpcy5jbGVhbnVwKClcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZVdlYlNvY2tldE1lc3NhZ2UoZXZlbnQ6IFdlYlNvY2tldC5NZXNzYWdlRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgbWVzc2FnZTogV2ViU29ja2V0Q29tbWFuZCA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YS50b1N0cmluZygpKTtcbiAgICAgICAgaWYgKChtZXNzYWdlLmNvbW1hbmQgPT09ICdsb2FkU25hcHNob3QnIHx8IG1lc3NhZ2UuY29tbWFuZCA9PT0gJ3NldFN0YXJ0VGltZScpICYmIHRoaXMucmVzb2x2ZUZ1bmMpIHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZUZ1bmMobWVzc2FnZS52YWx1ZSA/PyAnJyk7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmVGdW5jID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWVzc2FnZS5mcmFtZUdyb3VwKSB7XG4gICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ2dlbmVyYXRlLW5leHQtZ3JvdXAtZW5kJywgWydnZW5lcmF0ZS1uZXh0LWdyb3VwLXN0YXJ0J10pO1xuICAgICAgICAgICAgbGV0IGZyYW1lR3JvdXA6IEZyYW1lR3JvdXAgfCB1bmRlZmluZWQgPSBtZXNzYWdlLmZyYW1lR3JvdXA7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3Jlc2l6ZS1zdGFydCcpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGFnZS5zZXRWaWV3cG9ydFNpemUoe3dpZHRoOiBmcmFtZUdyb3VwLndpZHRoLCBoZWlnaHQ6IGZyYW1lR3JvdXAudG90YWxIZWlnaHR9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3Jlc2l6ZS1lbmQnLCBbJ3Jlc2l6ZS1zdGFydCddKTtcblxuICAgICAgICAgICAgICAgIHRoaXMubGFzdFRpbWUgPSBmcmFtZUdyb3VwLnN0YXJ0VGltZSArIGZyYW1lR3JvdXAuZnJhbWVJbnRlcnZhbCAqIGZyYW1lR3JvdXAuZnJhbWVDb3VudDtcblxuICAgICAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgncmVuZGVyLXN0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgZnJhbWVHcm91cCA9IGF3YWl0IHRoaXMuY2FwdHVyZVNjcmVlbnNob3QoZnJhbWVHcm91cCk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdyZW5kZXItZW5kJywgWydyZW5kZXItc3RhcnQnXSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVzb2x2ZU9uTWFzc2FnZSAmJiBmcmFtZUdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb2x2ZU9uTWFzc2FnZShmcmFtZUdyb3VwKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1BhZ2UgaXMgbm90IGF2YWlsYWJsZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjYXB0dXJlU2NyZWVuc2hvdChmcmFtZUdyb3VwOiBGcmFtZUdyb3VwKSB7XG4gICAgICAgIGNvbnN0IG1heFJldHJpZXMgPSA1O1xuICAgICAgICBjb25zdCBkZWxheUJldHdlZW5SZXRyaWVzID0gMTA7XG5cbiAgICAgICAgZm9yIChsZXQgYXR0ZW1wdCA9IDE7IGF0dGVtcHQgPD0gbWF4UmV0cmllczsgYXR0ZW1wdCsrKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgnc2NyZWVuc2hvdC1hdHRlbXB0LXN0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgY29uc3Qge3RvdGFsSGVpZ2h0LCB3aWR0aH0gPSBmcmFtZUdyb3VwO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFnZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ2V2YWx1YXRlLXN0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGFnZS5ldmFsdWF0ZSgodG90YWxIZWlnaHQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hdHJpeC1jb250YWluZXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gYCR7dG90YWxIZWlnaHR9cHhgO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB0b3RhbEhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgnZXZhbHVhdGUtZW5kJywgWydldmFsdWF0ZS1zdGFydCddKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3NlbGVjdG9yLXdhaXQtc3RhcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudEhhbmRsZSA9IGF3YWl0IHRoaXMucGFnZS53YWl0Rm9yU2VsZWN0b3IoJyNtYXRyaXgtY29udGFpbmVyJywge3N0YXRlOiAndmlzaWJsZSd9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdzZWxlY3Rvci13YWl0LWVuZCcsIFsnc2VsZWN0b3Itd2FpdC1zdGFydCddKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBib3VuZGluZ0JveCA9IGF3YWl0IGVsZW1lbnRIYW5kbGUhLmJvdW5kaW5nQm94KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdzY3JlZW5zaG90LXN0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNjcmVlbnNob3RCdWZmZXIgPSBhd2FpdCB0aGlzLnBhZ2Uuc2NyZWVuc2hvdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGlwOiBib3VuZGluZ0JveCEsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3NjcmVlbnNob3QtZW5kJywgWydzY3JlZW5zaG90LXN0YXJ0J10pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vINCk0YDQtdC50Lwg0YHQvtGF0YDQsNC90Y/QtdGC0YHRjywg0L3QviDQvdC1INC+0YLQv9GA0LDQstC70Y/QtdGC0YHRjyDQsiBXZWJTb2NrZXRcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnJhbWVEYXRhOiBGcmFtZUdyb3VwID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBmcmFtZUdyb3VwLnN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYW1lSW50ZXJ2YWw6IGZyYW1lR3JvdXAuZnJhbWVJbnRlcnZhbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYW1lQ291bnQ6IGZyYW1lR3JvdXAuZnJhbWVDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsSGVpZ2h0OiBmcmFtZUdyb3VwLnRvdGFsSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGZyYW1lR3JvdXAud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZUJ1ZmZlcjogc2NyZWVuc2hvdEJ1ZmZlci50b1N0cmluZygnYmFzZTY0JyksXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdzY3JlZW5zaG90LWF0dGVtcHQtZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmcmFtZURhdGE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignUGFnZSBpcyBub3QgYXZhaWxhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhY2tlci5wb2ludCgncGFnZS1ub3QtYXZhaWxhYmxlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBBdHRlbXB0ICR7YXR0ZW1wdH0gZmFpbGVkOmAsIGVycm9yKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYWNrZXIucG9pbnQoJ3NjcmVlbnNob3QtYXR0ZW1wdC1mYWlsZWQnKTtcbiAgICAgICAgICAgICAgICBpZiAoYXR0ZW1wdCA8IG1heFJldHJpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFJldHJ5aW5nIGluICR7ZGVsYXlCZXR3ZWVuUmV0cmllc31tcy4uLmApO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXlCZXR3ZWVuUmV0cmllcykpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhvdXJzID0gU3RyaW5nKG5vdy5nZXRIb3VycygpKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtaW51dGVzID0gU3RyaW5nKG5vdy5nZXRNaW51dGVzKCkpLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlY29uZHMgPSBTdHJpbmcobm93LmdldFNlY29uZHMoKSkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWlsbGlzZWNvbmRzID0gU3RyaW5nKG5vdy5nZXRNaWxsaXNlY29uZHMoKSkucGFkU3RhcnQoMywgJzAnKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lV2l0aE1pbGxpc2Vjb25kcyA9IGAke2hvdXJzfToke21pbnV0ZXN9OiR7c2Vjb25kc30uJHttaWxsaXNlY29uZHN9YDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcih0aW1lV2l0aE1pbGxpc2Vjb25kcywgYEZhaWxlZCB0byBjYXB0dXJlIHNjcmVlbnNob3QgYWZ0ZXIgJHttYXhSZXRyaWVzfSBhdHRlbXB0cy5gKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFja2VyLnBvaW50KCdzY3JlZW5zaG90LWZhaWxlZC1maW5hbCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBnZW5lcmF0ZU5leHRGcmFtZUdyb3VwKCk6IFByb21pc2U8RnJhbWVHcm91cCB8IHVuZGVmaW5lZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29tbWFuZDogV2ViU29ja2V0Q29tbWFuZCA9IHtjb21tYW5kOiAnZ2VuZXJhdGVOZXh0R3JvdXAnfTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlUHJvbWlzZSA9IG5ldyBQcm9taXNlPEZyYW1lR3JvdXA+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNvbHZlT25NYXNzYWdlID0gcmVzb2x2ZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZFdlYlNvY2tldENvbW1hbmQoY29tbWFuZCk7XG5cbiAgICAgICAgICAgIC8vINCW0LTQtdC8INC+0YLQstC10YIg0L7RgiDQutC70LjQtdC90YLQsCwg0LrQvtGC0L7RgNGL0Lkg0L/RgNC40YjQu9C10YIgZnJhbWVHcm91cFxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlUHJvbWlzZTtcbiAgICAgICAgfSBmaW5hbGx5IHtcblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGdldFNuYXBzaG90KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmc+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmVGdW5jID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQ6IFdlYlNvY2tldENvbW1hbmQgPSB7Y29tbWFuZDogJ2dldFNuYXBzaG90J307XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRXZWJTb2NrZXRDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc2V0U25hcHNob3Qoc25hcHNob3Q6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBjb21tYW5kOiBXZWJTb2NrZXRDb21tYW5kID0ge2NvbW1hbmQ6ICdsb2FkU25hcHNob3QnLCB2YWx1ZTogc25hcHNob3R9O1xuICAgICAgICBhd2FpdCB0aGlzLnNlbmRXZWJTb2NrZXRDb21tYW5kKGNvbW1hbmQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgc2VuZFdlYlNvY2tldENvbW1hbmQoY29tbWFuZDogV2ViU29ja2V0Q29tbWFuZCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAodGhpcy53cyAmJiB0aGlzLndzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICAgICAgICB0aGlzLndzLnNlbmQoSlNPTi5zdHJpbmdpZnkoY29tbWFuZCkpO1xuICAgICAgICB9ICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJXZWJTb2NrZXQgaXMgbm90IG9wZW4uIFVuYWJsZSB0byBzZW5kIGNvbW1hbmQ6XCIsIGNvbW1hbmQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5Xb3JrZXJDb250cm9sbGVyLmluaXRpYWxpemUobmV3IEhhbmRsZXJzKCkpOyIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Xb3JrZXJDb250cm9sbGVyID0gdm9pZCAwO1xuY29uc3Qgd29ya2VyX3RocmVhZHNfMSA9IHJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKTtcbmNvbnN0IHNlcmRlX3RzXzEgPSByZXF1aXJlKFwic2VyZGUtdHNcIik7XG5jbGFzcyBXb3JrZXJDb250cm9sbGVyIHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZShoYW5kbGVycykge1xuICAgICAgICB0aGlzLmhhbmRsZXJzID0gaGFuZGxlcnM7XG4gICAgICAgIC8vIFNlbmQgaW5pdGlhbGl6YXRpb24gYWNrbm93bGVkZ21lbnQgd2hlbiB0aGUgd29ya2VyIGlzIGZ1bGx5IHJlYWR5XG4gICAgICAgIGNvbnN0IGluaXRBY2sgPSB7IHR5cGU6ICdpbml0aWFsaXphdGlvbicgfTtcbiAgICAgICAgaWYgKHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydCkge1xuICAgICAgICAgICAgd29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0LnBvc3RNZXNzYWdlKGluaXRBY2spO1xuICAgICAgICB9XG4gICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5vbignbWVzc2FnZScsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlTWVzc2FnZShldmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgaGFuZGxlTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdyZXF1ZXN0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVJlcXVlc3QobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdub3RpZmljYXRpb24nOlxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlTm90aWZpY2F0aW9uKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFVua25vd24gbWVzc2FnZSB0eXBlOiAke21lc3NhZ2UudHlwZX1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgaGFuZGxlUmVxdWVzdChtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IHsgcmVxdWVzdElkLCBwYXlsb2FkIH0gPSBtZXNzYWdlO1xuICAgICAgICBjb25zdCB7IG1ldGhvZE5hbWUsIGFyZ3MgfSA9IHNlcmRlX3RzXzEuU2VyRGUuZGVzZXJpYWxpemUocGF5bG9hZCk7XG4gICAgICAgIGlmICh0aGlzLmhhbmRsZXJzICYmIHR5cGVvZiB0aGlzLmhhbmRsZXJzW21ldGhvZE5hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHNlcmRlX3RzXzEuU2VyRGUuc2VyaWFsaXNlKGF3YWl0IHRoaXMuaGFuZGxlcnNbbWV0aG9kTmFtZV0oLi4uYXJncykpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHsgdHlwZTogJ3Jlc3BvbnNlJywgcmVxdWVzdElkLCByZXN1bHQgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0LnBvc3RNZXNzYWdlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB7IHR5cGU6ICdyZXNwb25zZScsIHJlcXVlc3RJZCwgZXJyb3IgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0LnBvc3RNZXNzYWdlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncmVzcG9uc2UnLFxuICAgICAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgICAgICByZXN1bHQ6IG5ldyBFcnJvcihgTWV0aG9kICR7bWV0aG9kTmFtZX0gbm90IGZvdW5kIG9uIGhhbmRsZXJzYClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAod29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0KSB7XG4gICAgICAgICAgICAgICAgd29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0LnBvc3RNZXNzYWdlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgaGFuZGxlTm90aWZpY2F0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgeyBtZXRob2ROYW1lLCBhcmdzIH0gPSBtZXNzYWdlLnBheWxvYWQ7XG4gICAgICAgIGlmICh0aGlzLmhhbmRsZXJzICYmIHR5cGVvZiB0aGlzLmhhbmRsZXJzW21ldGhvZE5hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlcnNbbWV0aG9kTmFtZV0oLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBoYW5kbGluZyBub3RpZmljYXRpb246ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGhhbmRsaW5nIG5vdGlmaWNhdGlvbjogdW5rbm93biBlcnJvcicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgTm90aWZpY2F0aW9uIG1ldGhvZCAke21ldGhvZE5hbWV9IG5vdCBmb3VuZCBvbiBoYW5kbGVyc2ApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyByZWdpc3RlckNsYXNzZXMoY2xhc3Nlcykge1xuICAgICAgICBzZXJkZV90c18xLlNlckRlLmNsYXNzUmVnaXN0cmF0aW9uKGNsYXNzZXMpO1xuICAgIH1cbn1cbmV4cG9ydHMuV29ya2VyQ29udHJvbGxlciA9IFdvcmtlckNvbnRyb2xsZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Xb3JrZXJDb250cm9sbGVyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Xb3JrZXJNYW5hZ2VyID0gdm9pZCAwO1xuY29uc3Qgd29ya2VyX3RocmVhZHNfMSA9IHJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKTtcbmNvbnN0IHNlcmRlX3RzXzEgPSByZXF1aXJlKFwic2VyZGUtdHNcIik7XG5jbGFzcyBXb3JrZXJNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3Rvcih0aW1lb3V0ID0gMiAqKiAzMSAtIDEpIHtcbiAgICAgICAgdGhpcy53b3JrZXJzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnJlcXVlc3RJZENvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLndvcmtlcklkQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMucmVzcG9uc2VIYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnRpbWVvdXQgPSB0aW1lb3V0O1xuICAgIH1cbiAgICBhc3luYyBjcmVhdGVXb3JrZXJXaXRoSGFuZGxlcnMod29ya2VyRmlsZSkge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSBuZXcgd29ya2VyX3RocmVhZHNfMS5Xb3JrZXIod29ya2VyRmlsZSk7XG4gICAgICAgIGNvbnN0IHdvcmtlcklkID0gKyt0aGlzLndvcmtlcklkQ291bnRlcjtcbiAgICAgICAgdGhpcy53b3JrZXJzLnNldCh3b3JrZXJJZCwgd29ya2VyKTtcbiAgICAgICAgd29ya2VyLm9uKCdtZXNzYWdlJywgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTWVzc2FnZShtZXNzYWdlLCB3b3JrZXJJZCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzLnNldCh3b3JrZXJJZCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpOyAvLyBDbGVhciB0aW1lb3V0IG9uIHN1Y2Nlc3NcbiAgICAgICAgICAgICAgICByZXNvbHZlKHdvcmtlcklkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5oYXMod29ya2VySWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5kZWxldGUod29ya2VySWQpO1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdXb3JrZXIgaW5pdGlhbGl6YXRpb24gdGltZWQgb3V0JykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMudGltZW91dCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBoYW5kbGVNZXNzYWdlKG1lc3NhZ2UsIHdvcmtlcklkKSB7XG4gICAgICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdpbml0aWFsaXphdGlvbic6XG4gICAgICAgICAgICAgICAgY29uc3QgaW5pdEhhbmRsZXIgPSB0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuZ2V0KHdvcmtlcklkKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5pdEhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdEhhbmRsZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzLmRlbGV0ZSh3b3JrZXJJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmVzcG9uc2UnOlxuICAgICAgICAgICAgICAgIGNvbnN0IHsgcmVxdWVzdElkLCByZXN1bHQgfSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VIYW5kbGVyID0gdGhpcy5yZXNwb25zZUhhbmRsZXJzLmdldChyZXF1ZXN0SWQpO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZUhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VIYW5kbGVyKHNlcmRlX3RzXzEuU2VyRGUuZGVzZXJpYWxpemUocmVzdWx0KSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzcG9uc2VIYW5kbGVycy5kZWxldGUocmVxdWVzdElkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdub3RpZmljYXRpb24nOlxuICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBub3RpZmljYXRpb25zIGlmIG5lY2Vzc2FyeVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gbWVzc2FnZSB0eXBlOiAke21lc3NhZ2UudHlwZX1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBjYWxsKHdvcmtlcklkLCBtZXRob2ROYW1lLCAuLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IHdvcmtlciA9IHRoaXMud29ya2Vycy5nZXQod29ya2VySWQpO1xuICAgICAgICBpZiAoIXdvcmtlcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXb3JrZXIgd2l0aCBJRCAke3dvcmtlcklkfSBub3QgZm91bmRgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXF1ZXN0SWQgPSArK3RoaXMucmVxdWVzdElkQ291bnRlcjtcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdyZXF1ZXN0JyxcbiAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgIHBheWxvYWQ6IHNlcmRlX3RzXzEuU2VyRGUuc2VyaWFsaXNlKHsgbWV0aG9kTmFtZSwgYXJncyB9KVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNwb25zZUhhbmRsZXJzLmRlbGV0ZShyZXF1ZXN0SWQpO1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1JlcXVlc3QgdGltZWQgb3V0JykpO1xuICAgICAgICAgICAgfSwgdGhpcy50aW1lb3V0KTtcbiAgICAgICAgICAgIHRoaXMucmVzcG9uc2VIYW5kbGVycy5zZXQocmVxdWVzdElkLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7IC8vIENsZWFyIHRpbWVvdXQgb24gc3VjY2Vzc1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHJlcXVlc3QpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2VuZE5vdGlmaWNhdGlvbih3b3JrZXJJZCwgbWV0aG9kTmFtZSwgLi4uYXJncykge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSB0aGlzLndvcmtlcnMuZ2V0KHdvcmtlcklkKTtcbiAgICAgICAgaWYgKCF3b3JrZXIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV29ya2VyIHdpdGggSUQgJHt3b3JrZXJJZH0gbm90IGZvdW5kYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uID0ge1xuICAgICAgICAgICAgdHlwZTogJ25vdGlmaWNhdGlvbicsXG4gICAgICAgICAgICBwYXlsb2FkOiB7IG1ldGhvZE5hbWUsIGFyZ3MgfVxuICAgICAgICB9O1xuICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2Uobm90aWZpY2F0aW9uKTtcbiAgICB9XG4gICAgYXN5bmMgdGVybWluYXRlV29ya2VyKHdvcmtlcklkKSB7XG4gICAgICAgIGNvbnN0IHdvcmtlciA9IHRoaXMud29ya2Vycy5nZXQod29ya2VySWQpO1xuICAgICAgICBpZiAod29ya2VyKSB7XG4gICAgICAgICAgICBhd2FpdCB3b3JrZXIudGVybWluYXRlKCk7XG4gICAgICAgICAgICB0aGlzLndvcmtlcnMuZGVsZXRlKHdvcmtlcklkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZWdpc3RlckNsYXNzZXMoY2xhc3Nlcykge1xuICAgICAgICBzZXJkZV90c18xLlNlckRlLmNsYXNzUmVnaXN0cmF0aW9uKGNsYXNzZXMpO1xuICAgIH1cbn1cbmV4cG9ydHMuV29ya2VyTWFuYWdlciA9IFdvcmtlck1hbmFnZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Xb3JrZXJNYW5hZ2VyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX2V4cG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9fZXhwb3J0U3RhcikgfHwgZnVuY3Rpb24obSwgZXhwb3J0cykge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZXhwb3J0cywgcCkpIF9fY3JlYXRlQmluZGluZyhleHBvcnRzLCBtLCBwKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vV29ya2VyTWFuYWdlclwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vV29ya2VyQ29udHJvbGxlclwiKSwgZXhwb3J0cyk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwbGF5d3JpZ2h0XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIndzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5vZGU6b3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZTpwcm9jZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5vZGU6dHR5XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIik7IiwiaW1wb3J0IGFuc2lTdHlsZXMgZnJvbSAnI2Fuc2ktc3R5bGVzJztcbmltcG9ydCBzdXBwb3J0c0NvbG9yIGZyb20gJyNzdXBwb3J0cy1jb2xvcic7XG5pbXBvcnQgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGltcG9ydC9vcmRlclxuXHRzdHJpbmdSZXBsYWNlQWxsLFxuXHRzdHJpbmdFbmNhc2VDUkxGV2l0aEZpcnN0SW5kZXgsXG59IGZyb20gJy4vdXRpbGl0aWVzLmpzJztcblxuY29uc3Qge3N0ZG91dDogc3Rkb3V0Q29sb3IsIHN0ZGVycjogc3RkZXJyQ29sb3J9ID0gc3VwcG9ydHNDb2xvcjtcblxuY29uc3QgR0VORVJBVE9SID0gU3ltYm9sKCdHRU5FUkFUT1InKTtcbmNvbnN0IFNUWUxFUiA9IFN5bWJvbCgnU1RZTEVSJyk7XG5jb25zdCBJU19FTVBUWSA9IFN5bWJvbCgnSVNfRU1QVFknKTtcblxuLy8gYHN1cHBvcnRzQ29sb3IubGV2ZWxgIOKGkiBgYW5zaVN0eWxlcy5jb2xvcltuYW1lXWAgbWFwcGluZ1xuY29uc3QgbGV2ZWxNYXBwaW5nID0gW1xuXHQnYW5zaScsXG5cdCdhbnNpJyxcblx0J2Fuc2kyNTYnLFxuXHQnYW5zaTE2bScsXG5dO1xuXG5jb25zdCBzdHlsZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5jb25zdCBhcHBseU9wdGlvbnMgPSAob2JqZWN0LCBvcHRpb25zID0ge30pID0+IHtcblx0aWYgKG9wdGlvbnMubGV2ZWwgJiYgIShOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMubGV2ZWwpICYmIG9wdGlvbnMubGV2ZWwgPj0gMCAmJiBvcHRpb25zLmxldmVsIDw9IDMpKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdUaGUgYGxldmVsYCBvcHRpb24gc2hvdWxkIGJlIGFuIGludGVnZXIgZnJvbSAwIHRvIDMnKTtcblx0fVxuXG5cdC8vIERldGVjdCBsZXZlbCBpZiBub3Qgc2V0IG1hbnVhbGx5XG5cdGNvbnN0IGNvbG9yTGV2ZWwgPSBzdGRvdXRDb2xvciA/IHN0ZG91dENvbG9yLmxldmVsIDogMDtcblx0b2JqZWN0LmxldmVsID0gb3B0aW9ucy5sZXZlbCA9PT0gdW5kZWZpbmVkID8gY29sb3JMZXZlbCA6IG9wdGlvbnMubGV2ZWw7XG59O1xuXG5leHBvcnQgY2xhc3MgQ2hhbGsge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnN0cnVjdG9yLXJldHVyblxuXHRcdHJldHVybiBjaGFsa0ZhY3Rvcnkob3B0aW9ucyk7XG5cdH1cbn1cblxuY29uc3QgY2hhbGtGYWN0b3J5ID0gb3B0aW9ucyA9PiB7XG5cdGNvbnN0IGNoYWxrID0gKC4uLnN0cmluZ3MpID0+IHN0cmluZ3Muam9pbignICcpO1xuXHRhcHBseU9wdGlvbnMoY2hhbGssIG9wdGlvbnMpO1xuXG5cdE9iamVjdC5zZXRQcm90b3R5cGVPZihjaGFsaywgY3JlYXRlQ2hhbGsucHJvdG90eXBlKTtcblxuXHRyZXR1cm4gY2hhbGs7XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVDaGFsayhvcHRpb25zKSB7XG5cdHJldHVybiBjaGFsa0ZhY3Rvcnkob3B0aW9ucyk7XG59XG5cbk9iamVjdC5zZXRQcm90b3R5cGVPZihjcmVhdGVDaGFsay5wcm90b3R5cGUsIEZ1bmN0aW9uLnByb3RvdHlwZSk7XG5cbmZvciAoY29uc3QgW3N0eWxlTmFtZSwgc3R5bGVdIG9mIE9iamVjdC5lbnRyaWVzKGFuc2lTdHlsZXMpKSB7XG5cdHN0eWxlc1tzdHlsZU5hbWVdID0ge1xuXHRcdGdldCgpIHtcblx0XHRcdGNvbnN0IGJ1aWxkZXIgPSBjcmVhdGVCdWlsZGVyKHRoaXMsIGNyZWF0ZVN0eWxlcihzdHlsZS5vcGVuLCBzdHlsZS5jbG9zZSwgdGhpc1tTVFlMRVJdKSwgdGhpc1tJU19FTVBUWV0pO1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIHN0eWxlTmFtZSwge3ZhbHVlOiBidWlsZGVyfSk7XG5cdFx0XHRyZXR1cm4gYnVpbGRlcjtcblx0XHR9LFxuXHR9O1xufVxuXG5zdHlsZXMudmlzaWJsZSA9IHtcblx0Z2V0KCkge1xuXHRcdGNvbnN0IGJ1aWxkZXIgPSBjcmVhdGVCdWlsZGVyKHRoaXMsIHRoaXNbU1RZTEVSXSwgdHJ1ZSk7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2aXNpYmxlJywge3ZhbHVlOiBidWlsZGVyfSk7XG5cdFx0cmV0dXJuIGJ1aWxkZXI7XG5cdH0sXG59O1xuXG5jb25zdCBnZXRNb2RlbEFuc2kgPSAobW9kZWwsIGxldmVsLCB0eXBlLCAuLi5hcmd1bWVudHNfKSA9PiB7XG5cdGlmIChtb2RlbCA9PT0gJ3JnYicpIHtcblx0XHRpZiAobGV2ZWwgPT09ICdhbnNpMTZtJykge1xuXHRcdFx0cmV0dXJuIGFuc2lTdHlsZXNbdHlwZV0uYW5zaTE2bSguLi5hcmd1bWVudHNfKTtcblx0XHR9XG5cblx0XHRpZiAobGV2ZWwgPT09ICdhbnNpMjU2Jykge1xuXHRcdFx0cmV0dXJuIGFuc2lTdHlsZXNbdHlwZV0uYW5zaTI1NihhbnNpU3R5bGVzLnJnYlRvQW5zaTI1NiguLi5hcmd1bWVudHNfKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFuc2lTdHlsZXNbdHlwZV0uYW5zaShhbnNpU3R5bGVzLnJnYlRvQW5zaSguLi5hcmd1bWVudHNfKSk7XG5cdH1cblxuXHRpZiAobW9kZWwgPT09ICdoZXgnKSB7XG5cdFx0cmV0dXJuIGdldE1vZGVsQW5zaSgncmdiJywgbGV2ZWwsIHR5cGUsIC4uLmFuc2lTdHlsZXMuaGV4VG9SZ2IoLi4uYXJndW1lbnRzXykpO1xuXHR9XG5cblx0cmV0dXJuIGFuc2lTdHlsZXNbdHlwZV1bbW9kZWxdKC4uLmFyZ3VtZW50c18pO1xufTtcblxuY29uc3QgdXNlZE1vZGVscyA9IFsncmdiJywgJ2hleCcsICdhbnNpMjU2J107XG5cbmZvciAoY29uc3QgbW9kZWwgb2YgdXNlZE1vZGVscykge1xuXHRzdHlsZXNbbW9kZWxdID0ge1xuXHRcdGdldCgpIHtcblx0XHRcdGNvbnN0IHtsZXZlbH0gPSB0aGlzO1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uICguLi5hcmd1bWVudHNfKSB7XG5cdFx0XHRcdGNvbnN0IHN0eWxlciA9IGNyZWF0ZVN0eWxlcihnZXRNb2RlbEFuc2kobW9kZWwsIGxldmVsTWFwcGluZ1tsZXZlbF0sICdjb2xvcicsIC4uLmFyZ3VtZW50c18pLCBhbnNpU3R5bGVzLmNvbG9yLmNsb3NlLCB0aGlzW1NUWUxFUl0pO1xuXHRcdFx0XHRyZXR1cm4gY3JlYXRlQnVpbGRlcih0aGlzLCBzdHlsZXIsIHRoaXNbSVNfRU1QVFldKTtcblx0XHRcdH07XG5cdFx0fSxcblx0fTtcblxuXHRjb25zdCBiZ01vZGVsID0gJ2JnJyArIG1vZGVsWzBdLnRvVXBwZXJDYXNlKCkgKyBtb2RlbC5zbGljZSgxKTtcblx0c3R5bGVzW2JnTW9kZWxdID0ge1xuXHRcdGdldCgpIHtcblx0XHRcdGNvbnN0IHtsZXZlbH0gPSB0aGlzO1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uICguLi5hcmd1bWVudHNfKSB7XG5cdFx0XHRcdGNvbnN0IHN0eWxlciA9IGNyZWF0ZVN0eWxlcihnZXRNb2RlbEFuc2kobW9kZWwsIGxldmVsTWFwcGluZ1tsZXZlbF0sICdiZ0NvbG9yJywgLi4uYXJndW1lbnRzXyksIGFuc2lTdHlsZXMuYmdDb2xvci5jbG9zZSwgdGhpc1tTVFlMRVJdKTtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUJ1aWxkZXIodGhpcywgc3R5bGVyLCB0aGlzW0lTX0VNUFRZXSk7XG5cdFx0XHR9O1xuXHRcdH0sXG5cdH07XG59XG5cbmNvbnN0IHByb3RvID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoKCkgPT4ge30sIHtcblx0Li4uc3R5bGVzLFxuXHRsZXZlbDoge1xuXHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIHRoaXNbR0VORVJBVE9SXS5sZXZlbDtcblx0XHR9LFxuXHRcdHNldChsZXZlbCkge1xuXHRcdFx0dGhpc1tHRU5FUkFUT1JdLmxldmVsID0gbGV2ZWw7XG5cdFx0fSxcblx0fSxcbn0pO1xuXG5jb25zdCBjcmVhdGVTdHlsZXIgPSAob3BlbiwgY2xvc2UsIHBhcmVudCkgPT4ge1xuXHRsZXQgb3BlbkFsbDtcblx0bGV0IGNsb3NlQWxsO1xuXHRpZiAocGFyZW50ID09PSB1bmRlZmluZWQpIHtcblx0XHRvcGVuQWxsID0gb3Blbjtcblx0XHRjbG9zZUFsbCA9IGNsb3NlO1xuXHR9IGVsc2Uge1xuXHRcdG9wZW5BbGwgPSBwYXJlbnQub3BlbkFsbCArIG9wZW47XG5cdFx0Y2xvc2VBbGwgPSBjbG9zZSArIHBhcmVudC5jbG9zZUFsbDtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0b3Blbixcblx0XHRjbG9zZSxcblx0XHRvcGVuQWxsLFxuXHRcdGNsb3NlQWxsLFxuXHRcdHBhcmVudCxcblx0fTtcbn07XG5cbmNvbnN0IGNyZWF0ZUJ1aWxkZXIgPSAoc2VsZiwgX3N0eWxlciwgX2lzRW1wdHkpID0+IHtcblx0Ly8gU2luZ2xlIGFyZ3VtZW50IGlzIGhvdCBwYXRoLCBpbXBsaWNpdCBjb2VyY2lvbiBpcyBmYXN0ZXIgdGhhbiBhbnl0aGluZ1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8taW1wbGljaXQtY29lcmNpb25cblx0Y29uc3QgYnVpbGRlciA9ICguLi5hcmd1bWVudHNfKSA9PiBhcHBseVN0eWxlKGJ1aWxkZXIsIChhcmd1bWVudHNfLmxlbmd0aCA9PT0gMSkgPyAoJycgKyBhcmd1bWVudHNfWzBdKSA6IGFyZ3VtZW50c18uam9pbignICcpKTtcblxuXHQvLyBXZSBhbHRlciB0aGUgcHJvdG90eXBlIGJlY2F1c2Ugd2UgbXVzdCByZXR1cm4gYSBmdW5jdGlvbiwgYnV0IHRoZXJlIGlzXG5cdC8vIG5vIHdheSB0byBjcmVhdGUgYSBmdW5jdGlvbiB3aXRoIGEgZGlmZmVyZW50IHByb3RvdHlwZVxuXHRPYmplY3Quc2V0UHJvdG90eXBlT2YoYnVpbGRlciwgcHJvdG8pO1xuXG5cdGJ1aWxkZXJbR0VORVJBVE9SXSA9IHNlbGY7XG5cdGJ1aWxkZXJbU1RZTEVSXSA9IF9zdHlsZXI7XG5cdGJ1aWxkZXJbSVNfRU1QVFldID0gX2lzRW1wdHk7XG5cblx0cmV0dXJuIGJ1aWxkZXI7XG59O1xuXG5jb25zdCBhcHBseVN0eWxlID0gKHNlbGYsIHN0cmluZykgPT4ge1xuXHRpZiAoc2VsZi5sZXZlbCA8PSAwIHx8ICFzdHJpbmcpIHtcblx0XHRyZXR1cm4gc2VsZltJU19FTVBUWV0gPyAnJyA6IHN0cmluZztcblx0fVxuXG5cdGxldCBzdHlsZXIgPSBzZWxmW1NUWUxFUl07XG5cblx0aWYgKHN0eWxlciA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIHN0cmluZztcblx0fVxuXG5cdGNvbnN0IHtvcGVuQWxsLCBjbG9zZUFsbH0gPSBzdHlsZXI7XG5cdGlmIChzdHJpbmcuaW5jbHVkZXMoJ1xcdTAwMUInKSkge1xuXHRcdHdoaWxlIChzdHlsZXIgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gUmVwbGFjZSBhbnkgaW5zdGFuY2VzIGFscmVhZHkgcHJlc2VudCB3aXRoIGEgcmUtb3BlbmluZyBjb2RlXG5cdFx0XHQvLyBvdGhlcndpc2Ugb25seSB0aGUgcGFydCBvZiB0aGUgc3RyaW5nIHVudGlsIHNhaWQgY2xvc2luZyBjb2RlXG5cdFx0XHQvLyB3aWxsIGJlIGNvbG9yZWQsIGFuZCB0aGUgcmVzdCB3aWxsIHNpbXBseSBiZSAncGxhaW4nLlxuXHRcdFx0c3RyaW5nID0gc3RyaW5nUmVwbGFjZUFsbChzdHJpbmcsIHN0eWxlci5jbG9zZSwgc3R5bGVyLm9wZW4pO1xuXG5cdFx0XHRzdHlsZXIgPSBzdHlsZXIucGFyZW50O1xuXHRcdH1cblx0fVxuXG5cdC8vIFdlIGNhbiBtb3ZlIGJvdGggbmV4dCBhY3Rpb25zIG91dCBvZiBsb29wLCBiZWNhdXNlIHJlbWFpbmluZyBhY3Rpb25zIGluIGxvb3Agd29uJ3QgaGF2ZVxuXHQvLyBhbnkvdmlzaWJsZSBlZmZlY3Qgb24gcGFydHMgd2UgYWRkIGhlcmUuIENsb3NlIHRoZSBzdHlsaW5nIGJlZm9yZSBhIGxpbmVicmVhayBhbmQgcmVvcGVuXG5cdC8vIGFmdGVyIG5leHQgbGluZSB0byBmaXggYSBibGVlZCBpc3N1ZSBvbiBtYWNPUzogaHR0cHM6Ly9naXRodWIuY29tL2NoYWxrL2NoYWxrL3B1bGwvOTJcblx0Y29uc3QgbGZJbmRleCA9IHN0cmluZy5pbmRleE9mKCdcXG4nKTtcblx0aWYgKGxmSW5kZXggIT09IC0xKSB7XG5cdFx0c3RyaW5nID0gc3RyaW5nRW5jYXNlQ1JMRldpdGhGaXJzdEluZGV4KHN0cmluZywgY2xvc2VBbGwsIG9wZW5BbGwsIGxmSW5kZXgpO1xuXHR9XG5cblx0cmV0dXJuIG9wZW5BbGwgKyBzdHJpbmcgKyBjbG9zZUFsbDtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGNyZWF0ZUNoYWxrLnByb3RvdHlwZSwgc3R5bGVzKTtcblxuY29uc3QgY2hhbGsgPSBjcmVhdGVDaGFsaygpO1xuZXhwb3J0IGNvbnN0IGNoYWxrU3RkZXJyID0gY3JlYXRlQ2hhbGsoe2xldmVsOiBzdGRlcnJDb2xvciA/IHN0ZGVyckNvbG9yLmxldmVsIDogMH0pO1xuXG5leHBvcnQge1xuXHRtb2RpZmllck5hbWVzLFxuXHRmb3JlZ3JvdW5kQ29sb3JOYW1lcyxcblx0YmFja2dyb3VuZENvbG9yTmFtZXMsXG5cdGNvbG9yTmFtZXMsXG5cblx0Ly8gVE9ETzogUmVtb3ZlIHRoZXNlIGFsaWFzZXMgaW4gdGhlIG5leHQgbWFqb3IgdmVyc2lvblxuXHRtb2RpZmllck5hbWVzIGFzIG1vZGlmaWVycyxcblx0Zm9yZWdyb3VuZENvbG9yTmFtZXMgYXMgZm9yZWdyb3VuZENvbG9ycyxcblx0YmFja2dyb3VuZENvbG9yTmFtZXMgYXMgYmFja2dyb3VuZENvbG9ycyxcblx0Y29sb3JOYW1lcyBhcyBjb2xvcnMsXG59IGZyb20gJy4vdmVuZG9yL2Fuc2ktc3R5bGVzL2luZGV4LmpzJztcblxuZXhwb3J0IHtcblx0c3Rkb3V0Q29sb3IgYXMgc3VwcG9ydHNDb2xvcixcblx0c3RkZXJyQ29sb3IgYXMgc3VwcG9ydHNDb2xvclN0ZGVycixcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNoYWxrO1xuIiwiLy8gVE9ETzogV2hlbiB0YXJnZXRpbmcgTm9kZS5qcyAxNiwgdXNlIGBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2VBbGxgLlxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1JlcGxhY2VBbGwoc3RyaW5nLCBzdWJzdHJpbmcsIHJlcGxhY2VyKSB7XG5cdGxldCBpbmRleCA9IHN0cmluZy5pbmRleE9mKHN1YnN0cmluZyk7XG5cdGlmIChpbmRleCA9PT0gLTEpIHtcblx0XHRyZXR1cm4gc3RyaW5nO1xuXHR9XG5cblx0Y29uc3Qgc3Vic3RyaW5nTGVuZ3RoID0gc3Vic3RyaW5nLmxlbmd0aDtcblx0bGV0IGVuZEluZGV4ID0gMDtcblx0bGV0IHJldHVyblZhbHVlID0gJyc7XG5cdGRvIHtcblx0XHRyZXR1cm5WYWx1ZSArPSBzdHJpbmcuc2xpY2UoZW5kSW5kZXgsIGluZGV4KSArIHN1YnN0cmluZyArIHJlcGxhY2VyO1xuXHRcdGVuZEluZGV4ID0gaW5kZXggKyBzdWJzdHJpbmdMZW5ndGg7XG5cdFx0aW5kZXggPSBzdHJpbmcuaW5kZXhPZihzdWJzdHJpbmcsIGVuZEluZGV4KTtcblx0fSB3aGlsZSAoaW5kZXggIT09IC0xKTtcblxuXHRyZXR1cm5WYWx1ZSArPSBzdHJpbmcuc2xpY2UoZW5kSW5kZXgpO1xuXHRyZXR1cm4gcmV0dXJuVmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdFbmNhc2VDUkxGV2l0aEZpcnN0SW5kZXgoc3RyaW5nLCBwcmVmaXgsIHBvc3RmaXgsIGluZGV4KSB7XG5cdGxldCBlbmRJbmRleCA9IDA7XG5cdGxldCByZXR1cm5WYWx1ZSA9ICcnO1xuXHRkbyB7XG5cdFx0Y29uc3QgZ290Q1IgPSBzdHJpbmdbaW5kZXggLSAxXSA9PT0gJ1xccic7XG5cdFx0cmV0dXJuVmFsdWUgKz0gc3RyaW5nLnNsaWNlKGVuZEluZGV4LCAoZ290Q1IgPyBpbmRleCAtIDEgOiBpbmRleCkpICsgcHJlZml4ICsgKGdvdENSID8gJ1xcclxcbicgOiAnXFxuJykgKyBwb3N0Zml4O1xuXHRcdGVuZEluZGV4ID0gaW5kZXggKyAxO1xuXHRcdGluZGV4ID0gc3RyaW5nLmluZGV4T2YoJ1xcbicsIGVuZEluZGV4KTtcblx0fSB3aGlsZSAoaW5kZXggIT09IC0xKTtcblxuXHRyZXR1cm5WYWx1ZSArPSBzdHJpbmcuc2xpY2UoZW5kSW5kZXgpO1xuXHRyZXR1cm4gcmV0dXJuVmFsdWU7XG59XG4iLCJjb25zdCBBTlNJX0JBQ0tHUk9VTkRfT0ZGU0VUID0gMTA7XG5cbmNvbnN0IHdyYXBBbnNpMTYgPSAob2Zmc2V0ID0gMCkgPT4gY29kZSA9PiBgXFx1MDAxQlske2NvZGUgKyBvZmZzZXR9bWA7XG5cbmNvbnN0IHdyYXBBbnNpMjU2ID0gKG9mZnNldCA9IDApID0+IGNvZGUgPT4gYFxcdTAwMUJbJHszOCArIG9mZnNldH07NTske2NvZGV9bWA7XG5cbmNvbnN0IHdyYXBBbnNpMTZtID0gKG9mZnNldCA9IDApID0+IChyZWQsIGdyZWVuLCBibHVlKSA9PiBgXFx1MDAxQlskezM4ICsgb2Zmc2V0fTsyOyR7cmVkfTske2dyZWVufTske2JsdWV9bWA7XG5cbmNvbnN0IHN0eWxlcyA9IHtcblx0bW9kaWZpZXI6IHtcblx0XHRyZXNldDogWzAsIDBdLFxuXHRcdC8vIDIxIGlzbid0IHdpZGVseSBzdXBwb3J0ZWQgYW5kIDIyIGRvZXMgdGhlIHNhbWUgdGhpbmdcblx0XHRib2xkOiBbMSwgMjJdLFxuXHRcdGRpbTogWzIsIDIyXSxcblx0XHRpdGFsaWM6IFszLCAyM10sXG5cdFx0dW5kZXJsaW5lOiBbNCwgMjRdLFxuXHRcdG92ZXJsaW5lOiBbNTMsIDU1XSxcblx0XHRpbnZlcnNlOiBbNywgMjddLFxuXHRcdGhpZGRlbjogWzgsIDI4XSxcblx0XHRzdHJpa2V0aHJvdWdoOiBbOSwgMjldLFxuXHR9LFxuXHRjb2xvcjoge1xuXHRcdGJsYWNrOiBbMzAsIDM5XSxcblx0XHRyZWQ6IFszMSwgMzldLFxuXHRcdGdyZWVuOiBbMzIsIDM5XSxcblx0XHR5ZWxsb3c6IFszMywgMzldLFxuXHRcdGJsdWU6IFszNCwgMzldLFxuXHRcdG1hZ2VudGE6IFszNSwgMzldLFxuXHRcdGN5YW46IFszNiwgMzldLFxuXHRcdHdoaXRlOiBbMzcsIDM5XSxcblxuXHRcdC8vIEJyaWdodCBjb2xvclxuXHRcdGJsYWNrQnJpZ2h0OiBbOTAsIDM5XSxcblx0XHRncmF5OiBbOTAsIDM5XSwgLy8gQWxpYXMgb2YgYGJsYWNrQnJpZ2h0YFxuXHRcdGdyZXk6IFs5MCwgMzldLCAvLyBBbGlhcyBvZiBgYmxhY2tCcmlnaHRgXG5cdFx0cmVkQnJpZ2h0OiBbOTEsIDM5XSxcblx0XHRncmVlbkJyaWdodDogWzkyLCAzOV0sXG5cdFx0eWVsbG93QnJpZ2h0OiBbOTMsIDM5XSxcblx0XHRibHVlQnJpZ2h0OiBbOTQsIDM5XSxcblx0XHRtYWdlbnRhQnJpZ2h0OiBbOTUsIDM5XSxcblx0XHRjeWFuQnJpZ2h0OiBbOTYsIDM5XSxcblx0XHR3aGl0ZUJyaWdodDogWzk3LCAzOV0sXG5cdH0sXG5cdGJnQ29sb3I6IHtcblx0XHRiZ0JsYWNrOiBbNDAsIDQ5XSxcblx0XHRiZ1JlZDogWzQxLCA0OV0sXG5cdFx0YmdHcmVlbjogWzQyLCA0OV0sXG5cdFx0YmdZZWxsb3c6IFs0MywgNDldLFxuXHRcdGJnQmx1ZTogWzQ0LCA0OV0sXG5cdFx0YmdNYWdlbnRhOiBbNDUsIDQ5XSxcblx0XHRiZ0N5YW46IFs0NiwgNDldLFxuXHRcdGJnV2hpdGU6IFs0NywgNDldLFxuXG5cdFx0Ly8gQnJpZ2h0IGNvbG9yXG5cdFx0YmdCbGFja0JyaWdodDogWzEwMCwgNDldLFxuXHRcdGJnR3JheTogWzEwMCwgNDldLCAvLyBBbGlhcyBvZiBgYmdCbGFja0JyaWdodGBcblx0XHRiZ0dyZXk6IFsxMDAsIDQ5XSwgLy8gQWxpYXMgb2YgYGJnQmxhY2tCcmlnaHRgXG5cdFx0YmdSZWRCcmlnaHQ6IFsxMDEsIDQ5XSxcblx0XHRiZ0dyZWVuQnJpZ2h0OiBbMTAyLCA0OV0sXG5cdFx0YmdZZWxsb3dCcmlnaHQ6IFsxMDMsIDQ5XSxcblx0XHRiZ0JsdWVCcmlnaHQ6IFsxMDQsIDQ5XSxcblx0XHRiZ01hZ2VudGFCcmlnaHQ6IFsxMDUsIDQ5XSxcblx0XHRiZ0N5YW5CcmlnaHQ6IFsxMDYsIDQ5XSxcblx0XHRiZ1doaXRlQnJpZ2h0OiBbMTA3LCA0OV0sXG5cdH0sXG59O1xuXG5leHBvcnQgY29uc3QgbW9kaWZpZXJOYW1lcyA9IE9iamVjdC5rZXlzKHN0eWxlcy5tb2RpZmllcik7XG5leHBvcnQgY29uc3QgZm9yZWdyb3VuZENvbG9yTmFtZXMgPSBPYmplY3Qua2V5cyhzdHlsZXMuY29sb3IpO1xuZXhwb3J0IGNvbnN0IGJhY2tncm91bmRDb2xvck5hbWVzID0gT2JqZWN0LmtleXMoc3R5bGVzLmJnQ29sb3IpO1xuZXhwb3J0IGNvbnN0IGNvbG9yTmFtZXMgPSBbLi4uZm9yZWdyb3VuZENvbG9yTmFtZXMsIC4uLmJhY2tncm91bmRDb2xvck5hbWVzXTtcblxuZnVuY3Rpb24gYXNzZW1ibGVTdHlsZXMoKSB7XG5cdGNvbnN0IGNvZGVzID0gbmV3IE1hcCgpO1xuXG5cdGZvciAoY29uc3QgW2dyb3VwTmFtZSwgZ3JvdXBdIG9mIE9iamVjdC5lbnRyaWVzKHN0eWxlcykpIHtcblx0XHRmb3IgKGNvbnN0IFtzdHlsZU5hbWUsIHN0eWxlXSBvZiBPYmplY3QuZW50cmllcyhncm91cCkpIHtcblx0XHRcdHN0eWxlc1tzdHlsZU5hbWVdID0ge1xuXHRcdFx0XHRvcGVuOiBgXFx1MDAxQlske3N0eWxlWzBdfW1gLFxuXHRcdFx0XHRjbG9zZTogYFxcdTAwMUJbJHtzdHlsZVsxXX1tYCxcblx0XHRcdH07XG5cblx0XHRcdGdyb3VwW3N0eWxlTmFtZV0gPSBzdHlsZXNbc3R5bGVOYW1lXTtcblxuXHRcdFx0Y29kZXMuc2V0KHN0eWxlWzBdLCBzdHlsZVsxXSk7XG5cdFx0fVxuXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHN0eWxlcywgZ3JvdXBOYW1lLCB7XG5cdFx0XHR2YWx1ZTogZ3JvdXAsXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9KTtcblx0fVxuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdHlsZXMsICdjb2RlcycsIHtcblx0XHR2YWx1ZTogY29kZXMsXG5cdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdH0pO1xuXG5cdHN0eWxlcy5jb2xvci5jbG9zZSA9ICdcXHUwMDFCWzM5bSc7XG5cdHN0eWxlcy5iZ0NvbG9yLmNsb3NlID0gJ1xcdTAwMUJbNDltJztcblxuXHRzdHlsZXMuY29sb3IuYW5zaSA9IHdyYXBBbnNpMTYoKTtcblx0c3R5bGVzLmNvbG9yLmFuc2kyNTYgPSB3cmFwQW5zaTI1NigpO1xuXHRzdHlsZXMuY29sb3IuYW5zaTE2bSA9IHdyYXBBbnNpMTZtKCk7XG5cdHN0eWxlcy5iZ0NvbG9yLmFuc2kgPSB3cmFwQW5zaTE2KEFOU0lfQkFDS0dST1VORF9PRkZTRVQpO1xuXHRzdHlsZXMuYmdDb2xvci5hbnNpMjU2ID0gd3JhcEFuc2kyNTYoQU5TSV9CQUNLR1JPVU5EX09GRlNFVCk7XG5cdHN0eWxlcy5iZ0NvbG9yLmFuc2kxNm0gPSB3cmFwQW5zaTE2bShBTlNJX0JBQ0tHUk9VTkRfT0ZGU0VUKTtcblxuXHQvLyBGcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9RaXgtL2NvbG9yLWNvbnZlcnQvYmxvYi8zZjBlMGQ0ZTkyZTIzNTc5NmNjYjE3ZjZlODVjNzIwOTRhNjUxZjQ5L2NvbnZlcnNpb25zLmpzXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHN0eWxlcywge1xuXHRcdHJnYlRvQW5zaTI1Njoge1xuXHRcdFx0dmFsdWUocmVkLCBncmVlbiwgYmx1ZSkge1xuXHRcdFx0XHQvLyBXZSB1c2UgdGhlIGV4dGVuZGVkIGdyZXlzY2FsZSBwYWxldHRlIGhlcmUsIHdpdGggdGhlIGV4Y2VwdGlvbiBvZlxuXHRcdFx0XHQvLyBibGFjayBhbmQgd2hpdGUuIG5vcm1hbCBwYWxldHRlIG9ubHkgaGFzIDQgZ3JleXNjYWxlIHNoYWRlcy5cblx0XHRcdFx0aWYgKHJlZCA9PT0gZ3JlZW4gJiYgZ3JlZW4gPT09IGJsdWUpIHtcblx0XHRcdFx0XHRpZiAocmVkIDwgOCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDE2O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChyZWQgPiAyNDgpIHtcblx0XHRcdFx0XHRcdHJldHVybiAyMzE7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIE1hdGgucm91bmQoKChyZWQgLSA4KSAvIDI0NykgKiAyNCkgKyAyMzI7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gMTZcblx0XHRcdFx0XHQrICgzNiAqIE1hdGgucm91bmQocmVkIC8gMjU1ICogNSkpXG5cdFx0XHRcdFx0KyAoNiAqIE1hdGgucm91bmQoZ3JlZW4gLyAyNTUgKiA1KSlcblx0XHRcdFx0XHQrIE1hdGgucm91bmQoYmx1ZSAvIDI1NSAqIDUpO1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0sXG5cdFx0aGV4VG9SZ2I6IHtcblx0XHRcdHZhbHVlKGhleCkge1xuXHRcdFx0XHRjb25zdCBtYXRjaGVzID0gL1thLWZcXGRdezZ9fFthLWZcXGRdezN9L2kuZXhlYyhoZXgudG9TdHJpbmcoMTYpKTtcblx0XHRcdFx0aWYgKCFtYXRjaGVzKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFswLCAwLCAwXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBbY29sb3JTdHJpbmddID0gbWF0Y2hlcztcblxuXHRcdFx0XHRpZiAoY29sb3JTdHJpbmcubGVuZ3RoID09PSAzKSB7XG5cdFx0XHRcdFx0Y29sb3JTdHJpbmcgPSBbLi4uY29sb3JTdHJpbmddLm1hcChjaGFyYWN0ZXIgPT4gY2hhcmFjdGVyICsgY2hhcmFjdGVyKS5qb2luKCcnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGludGVnZXIgPSBOdW1iZXIucGFyc2VJbnQoY29sb3JTdHJpbmcsIDE2KTtcblxuXHRcdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHRcdC8qIGVzbGludC1kaXNhYmxlIG5vLWJpdHdpc2UgKi9cblx0XHRcdFx0XHQoaW50ZWdlciA+PiAxNikgJiAweEZGLFxuXHRcdFx0XHRcdChpbnRlZ2VyID4+IDgpICYgMHhGRixcblx0XHRcdFx0XHRpbnRlZ2VyICYgMHhGRixcblx0XHRcdFx0XHQvKiBlc2xpbnQtZW5hYmxlIG5vLWJpdHdpc2UgKi9cblx0XHRcdFx0XTtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9LFxuXHRcdGhleFRvQW5zaTI1Njoge1xuXHRcdFx0dmFsdWU6IGhleCA9PiBzdHlsZXMucmdiVG9BbnNpMjU2KC4uLnN0eWxlcy5oZXhUb1JnYihoZXgpKSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0sXG5cdFx0YW5zaTI1NlRvQW5zaToge1xuXHRcdFx0dmFsdWUoY29kZSkge1xuXHRcdFx0XHRpZiAoY29kZSA8IDgpIHtcblx0XHRcdFx0XHRyZXR1cm4gMzAgKyBjb2RlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGNvZGUgPCAxNikge1xuXHRcdFx0XHRcdHJldHVybiA5MCArIChjb2RlIC0gOCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgcmVkO1xuXHRcdFx0XHRsZXQgZ3JlZW47XG5cdFx0XHRcdGxldCBibHVlO1xuXG5cdFx0XHRcdGlmIChjb2RlID49IDIzMikge1xuXHRcdFx0XHRcdHJlZCA9ICgoKGNvZGUgLSAyMzIpICogMTApICsgOCkgLyAyNTU7XG5cdFx0XHRcdFx0Z3JlZW4gPSByZWQ7XG5cdFx0XHRcdFx0Ymx1ZSA9IHJlZDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb2RlIC09IDE2O1xuXG5cdFx0XHRcdFx0Y29uc3QgcmVtYWluZGVyID0gY29kZSAlIDM2O1xuXG5cdFx0XHRcdFx0cmVkID0gTWF0aC5mbG9vcihjb2RlIC8gMzYpIC8gNTtcblx0XHRcdFx0XHRncmVlbiA9IE1hdGguZmxvb3IocmVtYWluZGVyIC8gNikgLyA1O1xuXHRcdFx0XHRcdGJsdWUgPSAocmVtYWluZGVyICUgNikgLyA1O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgdmFsdWUgPSBNYXRoLm1heChyZWQsIGdyZWVuLCBibHVlKSAqIDI7XG5cblx0XHRcdFx0aWYgKHZhbHVlID09PSAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIDMwO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWJpdHdpc2Vcblx0XHRcdFx0bGV0IHJlc3VsdCA9IDMwICsgKChNYXRoLnJvdW5kKGJsdWUpIDw8IDIpIHwgKE1hdGgucm91bmQoZ3JlZW4pIDw8IDEpIHwgTWF0aC5yb3VuZChyZWQpKTtcblxuXHRcdFx0XHRpZiAodmFsdWUgPT09IDIpIHtcblx0XHRcdFx0XHRyZXN1bHQgKz0gNjA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0sXG5cdFx0cmdiVG9BbnNpOiB7XG5cdFx0XHR2YWx1ZTogKHJlZCwgZ3JlZW4sIGJsdWUpID0+IHN0eWxlcy5hbnNpMjU2VG9BbnNpKHN0eWxlcy5yZ2JUb0Fuc2kyNTYocmVkLCBncmVlbiwgYmx1ZSkpLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0XHRoZXhUb0Fuc2k6IHtcblx0XHRcdHZhbHVlOiBoZXggPT4gc3R5bGVzLmFuc2kyNTZUb0Fuc2koc3R5bGVzLmhleFRvQW5zaTI1NihoZXgpKSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0sXG5cdH0pO1xuXG5cdHJldHVybiBzdHlsZXM7XG59XG5cbmNvbnN0IGFuc2lTdHlsZXMgPSBhc3NlbWJsZVN0eWxlcygpO1xuXG5leHBvcnQgZGVmYXVsdCBhbnNpU3R5bGVzO1xuIiwiaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJztcbmltcG9ydCBvcyBmcm9tICdub2RlOm9zJztcbmltcG9ydCB0dHkgZnJvbSAnbm9kZTp0dHknO1xuXG4vLyBGcm9tOiBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL2hhcy1mbGFnL2Jsb2IvbWFpbi9pbmRleC5qc1xuLy8vIGZ1bmN0aW9uIGhhc0ZsYWcoZmxhZywgYXJndiA9IGdsb2JhbFRoaXMuRGVubz8uYXJncyA/PyBwcm9jZXNzLmFyZ3YpIHtcbmZ1bmN0aW9uIGhhc0ZsYWcoZmxhZywgYXJndiA9IGdsb2JhbFRoaXMuRGVubyA/IGdsb2JhbFRoaXMuRGVuby5hcmdzIDogcHJvY2Vzcy5hcmd2KSB7XG5cdGNvbnN0IHByZWZpeCA9IGZsYWcuc3RhcnRzV2l0aCgnLScpID8gJycgOiAoZmxhZy5sZW5ndGggPT09IDEgPyAnLScgOiAnLS0nKTtcblx0Y29uc3QgcG9zaXRpb24gPSBhcmd2LmluZGV4T2YocHJlZml4ICsgZmxhZyk7XG5cdGNvbnN0IHRlcm1pbmF0b3JQb3NpdGlvbiA9IGFyZ3YuaW5kZXhPZignLS0nKTtcblx0cmV0dXJuIHBvc2l0aW9uICE9PSAtMSAmJiAodGVybWluYXRvclBvc2l0aW9uID09PSAtMSB8fCBwb3NpdGlvbiA8IHRlcm1pbmF0b3JQb3NpdGlvbik7XG59XG5cbmNvbnN0IHtlbnZ9ID0gcHJvY2VzcztcblxubGV0IGZsYWdGb3JjZUNvbG9yO1xuaWYgKFxuXHRoYXNGbGFnKCduby1jb2xvcicpXG5cdHx8IGhhc0ZsYWcoJ25vLWNvbG9ycycpXG5cdHx8IGhhc0ZsYWcoJ2NvbG9yPWZhbHNlJylcblx0fHwgaGFzRmxhZygnY29sb3I9bmV2ZXInKVxuKSB7XG5cdGZsYWdGb3JjZUNvbG9yID0gMDtcbn0gZWxzZSBpZiAoXG5cdGhhc0ZsYWcoJ2NvbG9yJylcblx0fHwgaGFzRmxhZygnY29sb3JzJylcblx0fHwgaGFzRmxhZygnY29sb3I9dHJ1ZScpXG5cdHx8IGhhc0ZsYWcoJ2NvbG9yPWFsd2F5cycpXG4pIHtcblx0ZmxhZ0ZvcmNlQ29sb3IgPSAxO1xufVxuXG5mdW5jdGlvbiBlbnZGb3JjZUNvbG9yKCkge1xuXHRpZiAoJ0ZPUkNFX0NPTE9SJyBpbiBlbnYpIHtcblx0XHRpZiAoZW52LkZPUkNFX0NPTE9SID09PSAndHJ1ZScpIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH1cblxuXHRcdGlmIChlbnYuRk9SQ0VfQ09MT1IgPT09ICdmYWxzZScpIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblxuXHRcdHJldHVybiBlbnYuRk9SQ0VfQ09MT1IubGVuZ3RoID09PSAwID8gMSA6IE1hdGgubWluKE51bWJlci5wYXJzZUludChlbnYuRk9SQ0VfQ09MT1IsIDEwKSwgMyk7XG5cdH1cbn1cblxuZnVuY3Rpb24gdHJhbnNsYXRlTGV2ZWwobGV2ZWwpIHtcblx0aWYgKGxldmVsID09PSAwKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRsZXZlbCxcblx0XHRoYXNCYXNpYzogdHJ1ZSxcblx0XHRoYXMyNTY6IGxldmVsID49IDIsXG5cdFx0aGFzMTZtOiBsZXZlbCA+PSAzLFxuXHR9O1xufVxuXG5mdW5jdGlvbiBfc3VwcG9ydHNDb2xvcihoYXZlU3RyZWFtLCB7c3RyZWFtSXNUVFksIHNuaWZmRmxhZ3MgPSB0cnVlfSA9IHt9KSB7XG5cdGNvbnN0IG5vRmxhZ0ZvcmNlQ29sb3IgPSBlbnZGb3JjZUNvbG9yKCk7XG5cdGlmIChub0ZsYWdGb3JjZUNvbG9yICE9PSB1bmRlZmluZWQpIHtcblx0XHRmbGFnRm9yY2VDb2xvciA9IG5vRmxhZ0ZvcmNlQ29sb3I7XG5cdH1cblxuXHRjb25zdCBmb3JjZUNvbG9yID0gc25pZmZGbGFncyA/IGZsYWdGb3JjZUNvbG9yIDogbm9GbGFnRm9yY2VDb2xvcjtcblxuXHRpZiAoZm9yY2VDb2xvciA9PT0gMCkge1xuXHRcdHJldHVybiAwO1xuXHR9XG5cblx0aWYgKHNuaWZmRmxhZ3MpIHtcblx0XHRpZiAoaGFzRmxhZygnY29sb3I9MTZtJylcblx0XHRcdHx8IGhhc0ZsYWcoJ2NvbG9yPWZ1bGwnKVxuXHRcdFx0fHwgaGFzRmxhZygnY29sb3I9dHJ1ZWNvbG9yJykpIHtcblx0XHRcdHJldHVybiAzO1xuXHRcdH1cblxuXHRcdGlmIChoYXNGbGFnKCdjb2xvcj0yNTYnKSkge1xuXHRcdFx0cmV0dXJuIDI7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2hlY2sgZm9yIEF6dXJlIERldk9wcyBwaXBlbGluZXMuXG5cdC8vIEhhcyB0byBiZSBhYm92ZSB0aGUgYCFzdHJlYW1Jc1RUWWAgY2hlY2suXG5cdGlmICgnVEZfQlVJTEQnIGluIGVudiAmJiAnQUdFTlRfTkFNRScgaW4gZW52KSB7XG5cdFx0cmV0dXJuIDE7XG5cdH1cblxuXHRpZiAoaGF2ZVN0cmVhbSAmJiAhc3RyZWFtSXNUVFkgJiYgZm9yY2VDb2xvciA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIDA7XG5cdH1cblxuXHRjb25zdCBtaW4gPSBmb3JjZUNvbG9yIHx8IDA7XG5cblx0aWYgKGVudi5URVJNID09PSAnZHVtYicpIHtcblx0XHRyZXR1cm4gbWluO1xuXHR9XG5cblx0aWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcblx0XHQvLyBXaW5kb3dzIDEwIGJ1aWxkIDEwNTg2IGlzIHRoZSBmaXJzdCBXaW5kb3dzIHJlbGVhc2UgdGhhdCBzdXBwb3J0cyAyNTYgY29sb3JzLlxuXHRcdC8vIFdpbmRvd3MgMTAgYnVpbGQgMTQ5MzEgaXMgdGhlIGZpcnN0IHJlbGVhc2UgdGhhdCBzdXBwb3J0cyAxNm0vVHJ1ZUNvbG9yLlxuXHRcdGNvbnN0IG9zUmVsZWFzZSA9IG9zLnJlbGVhc2UoKS5zcGxpdCgnLicpO1xuXHRcdGlmIChcblx0XHRcdE51bWJlcihvc1JlbGVhc2VbMF0pID49IDEwXG5cdFx0XHQmJiBOdW1iZXIob3NSZWxlYXNlWzJdKSA+PSAxMF81ODZcblx0XHQpIHtcblx0XHRcdHJldHVybiBOdW1iZXIob3NSZWxlYXNlWzJdKSA+PSAxNF85MzEgPyAzIDogMjtcblx0XHR9XG5cblx0XHRyZXR1cm4gMTtcblx0fVxuXG5cdGlmICgnQ0knIGluIGVudikge1xuXHRcdGlmICgnR0lUSFVCX0FDVElPTlMnIGluIGVudiB8fCAnR0lURUFfQUNUSU9OUycgaW4gZW52KSB7XG5cdFx0XHRyZXR1cm4gMztcblx0XHR9XG5cblx0XHRpZiAoWydUUkFWSVMnLCAnQ0lSQ0xFQ0knLCAnQVBQVkVZT1InLCAnR0lUTEFCX0NJJywgJ0JVSUxES0lURScsICdEUk9ORSddLnNvbWUoc2lnbiA9PiBzaWduIGluIGVudikgfHwgZW52LkNJX05BTUUgPT09ICdjb2Rlc2hpcCcpIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH1cblxuXHRcdHJldHVybiBtaW47XG5cdH1cblxuXHRpZiAoJ1RFQU1DSVRZX1ZFUlNJT04nIGluIGVudikge1xuXHRcdHJldHVybiAvXig5XFwuKDAqWzEtOV1cXGQqKVxcLnxcXGR7Mix9XFwuKS8udGVzdChlbnYuVEVBTUNJVFlfVkVSU0lPTikgPyAxIDogMDtcblx0fVxuXG5cdGlmIChlbnYuQ09MT1JURVJNID09PSAndHJ1ZWNvbG9yJykge1xuXHRcdHJldHVybiAzO1xuXHR9XG5cblx0aWYgKGVudi5URVJNID09PSAneHRlcm0ta2l0dHknKSB7XG5cdFx0cmV0dXJuIDM7XG5cdH1cblxuXHRpZiAoJ1RFUk1fUFJPR1JBTScgaW4gZW52KSB7XG5cdFx0Y29uc3QgdmVyc2lvbiA9IE51bWJlci5wYXJzZUludCgoZW52LlRFUk1fUFJPR1JBTV9WRVJTSU9OIHx8ICcnKS5zcGxpdCgnLicpWzBdLCAxMCk7XG5cblx0XHRzd2l0Y2ggKGVudi5URVJNX1BST0dSQU0pIHtcblx0XHRcdGNhc2UgJ2lUZXJtLmFwcCc6IHtcblx0XHRcdFx0cmV0dXJuIHZlcnNpb24gPj0gMyA/IDMgOiAyO1xuXHRcdFx0fVxuXG5cdFx0XHRjYXNlICdBcHBsZV9UZXJtaW5hbCc6IHtcblx0XHRcdFx0cmV0dXJuIDI7XG5cdFx0XHR9XG5cdFx0XHQvLyBObyBkZWZhdWx0XG5cdFx0fVxuXHR9XG5cblx0aWYgKC8tMjU2KGNvbG9yKT8kL2kudGVzdChlbnYuVEVSTSkpIHtcblx0XHRyZXR1cm4gMjtcblx0fVxuXG5cdGlmICgvXnNjcmVlbnxeeHRlcm18XnZ0MTAwfF52dDIyMHxecnh2dHxjb2xvcnxhbnNpfGN5Z3dpbnxsaW51eC9pLnRlc3QoZW52LlRFUk0pKSB7XG5cdFx0cmV0dXJuIDE7XG5cdH1cblxuXHRpZiAoJ0NPTE9SVEVSTScgaW4gZW52KSB7XG5cdFx0cmV0dXJuIDE7XG5cdH1cblxuXHRyZXR1cm4gbWluO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3VwcG9ydHNDb2xvcihzdHJlYW0sIG9wdGlvbnMgPSB7fSkge1xuXHRjb25zdCBsZXZlbCA9IF9zdXBwb3J0c0NvbG9yKHN0cmVhbSwge1xuXHRcdHN0cmVhbUlzVFRZOiBzdHJlYW0gJiYgc3RyZWFtLmlzVFRZLFxuXHRcdC4uLm9wdGlvbnMsXG5cdH0pO1xuXG5cdHJldHVybiB0cmFuc2xhdGVMZXZlbChsZXZlbCk7XG59XG5cbmNvbnN0IHN1cHBvcnRzQ29sb3IgPSB7XG5cdHN0ZG91dDogY3JlYXRlU3VwcG9ydHNDb2xvcih7aXNUVFk6IHR0eS5pc2F0dHkoMSl9KSxcblx0c3RkZXJyOiBjcmVhdGVTdXBwb3J0c0NvbG9yKHtpc1RUWTogdHR5LmlzYXR0eSgyKX0pLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgc3VwcG9ydHNDb2xvcjtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvd29ya2VyLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
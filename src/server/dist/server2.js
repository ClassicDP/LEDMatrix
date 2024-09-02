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

/***/ "../Matrix/src/FrameGroup.ts":
/*!***********************************!*\
  !*** ../Matrix/src/FrameGroup.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FrameGroup = void 0;
class FrameGroup {
    constructor(startTime, frameInterval, frameCount, framesPerSecond, framePositions, totalHeight, width) {
        this.startTime = startTime;
        this.frameInterval = frameInterval;
        this.frameCount = frameCount;
        this.framesPerSecond = framesPerSecond;
        this.framePositions = framePositions;
        this.totalHeight = totalHeight;
        this.width = width;
    }
}
exports.FrameGroup = FrameGroup;


/***/ }),

/***/ "../Matrix/src/Matrix.ts":
/*!*******************************!*\
  !*** ../Matrix/src/Matrix.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Matrix = void 0;
const FrameGroup_1 = __webpack_require__(/*! ./FrameGroup */ "../Matrix/src/FrameGroup.ts");
class Matrix {
    constructor(width, height, framesPerSecond, framesPerGroup, startTime) {
        this.elementIdCounter = 0;
        this.elements = [];
        this.width = width;
        this.height = height;
        this.framesPerSecond = framesPerSecond;
        this.framesPerGroup = framesPerGroup;
        this.startTime = startTime;
        this.lastEndTime = startTime;
    }
    generateElementId() {
        return `element-${this.elementIdCounter++}`;
    }
    setStartTime(newStartTime) {
        this.startTime = newStartTime;
        console.log(this.startTime);
        this.lastEndTime = newStartTime;
    }
    generateNextGroup(container, matrixElements) {
        const existingFrames = Array.from(container.children);
        const frameInterval = 1000 / this.framesPerSecond;
        const frameCount = this.framesPerGroup;
        // Начало новой группы
        const startTime = this.lastEndTime;
        const framePositions = Array.from({ length: frameCount }, (_, i) => startTime + i * frameInterval);
        this.lastEndTime = startTime + frameInterval * frameCount;
        for (let i = 0; i < frameCount; i++) {
            let frame;
            if (i < existingFrames.length) {
                // Используем существующий элемент
                frame = existingFrames[i];
            }
            else {
                // Создаем новый элемент, если его еще нет
                frame = document.createElement('div');
                frame.style.position = 'absolute';
                frame.style.width = `${this.width}px`;
                frame.style.height = `${this.height}px`;
                frame.style.overflow = 'hidden';
                container.appendChild(frame);
            }
            frame.style.top = `${i * this.height}px`;
            // Очищаем содержимое фрейма перед добавлением новых элементов
            frame.innerHTML = '';
            matrixElements.sort((a, b) => b.layer - a.layer);
            // Применяем модификаторы и рендерим каждый элемент матрицы
            for (const matrixElement of matrixElements) {
                matrixElement.applyModifiers(framePositions[i]);
                matrixElement.renderTo(frame);
            }
        }
        // Удаляем лишние элементы, если они есть
        if (existingFrames.length > frameCount) {
            for (let j = existingFrames.length - 1; j >= frameCount; j--) {
                container.removeChild(existingFrames[j]);
            }
        }
        const totalHeight = this.height * frameCount;
        return new FrameGroup_1.FrameGroup(startTime, frameInterval, frameCount, this.framesPerSecond, framePositions, totalHeight, this.width);
    }
    addElement(matrixElement) {
        if (!this.elements.includes(matrixElement)) {
            this.elements.push(matrixElement);
        }
    }
    removeElement(matrixElement) {
        this.elements = this.elements.filter(x => x !== matrixElement);
    }
    clearElements() {
        this.elements = [];
    }
}
exports.Matrix = Matrix;


/***/ }),

/***/ "../Matrix/src/MatrixElement.ts":
/*!**************************************!*\
  !*** ../Matrix/src/MatrixElement.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimeMatrixElement = exports.MatrixElement = void 0;
class MatrixElement {
    constructor(matrix, content, x, y, width, height) {
        this.visible = true;
        this.layer = 0;
        this.id = matrix.generateElementId();
        this.content = content;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.modifiers = [];
        this.textStyle = {};
        this.additionalStyles = {}; // Инициализация нового поля
        this.textWidth = this.calculateTextWidth();
    }
    // Метод для вычисления ширины текста без добавления элемента в DOM
    calculateTextWidth() {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.whiteSpace = 'nowrap';
        tempDiv.style.font = this.textStyle.font || '16px Arial';
        tempDiv.innerText = this.content;
        document.body.appendChild(tempDiv);
        const width = tempDiv.clientWidth;
        document.body.removeChild(tempDiv);
        return width;
    }
    setText(newText) {
        this.content = newText;
        // this.textWidth = this.calculateTextWidth();
    }
    updateTextStyle(newStyles) {
        Object.assign(this.textStyle, newStyles);
        this.textWidth = this.calculateTextWidth();
    }
    updateAdditionalStyles(newStyles) {
        Object.assign(this.additionalStyles, newStyles);
    }
    setTextUpdateCallback(callback) {
        this.textUpdateCallback = callback;
    }
    applyModifiers(timestamp) {
        if (this.textUpdateCallback) {
            const newText = this.textUpdateCallback(timestamp);
            this.setText(newText);
        }
        for (const modifier of this.modifiers) {
            modifier.apply(timestamp);
        }
    }
    addModifier(modifier) {
        this.modifiers.push(modifier);
    }
    renderTo(container) {
        this.calculateTextWidth();
        if (!this.visible)
            return;
        // Ищем существующий элемент в контейнере по id
        let div = container.querySelector(`#${this.id}`);
        if (!div) {
            // Если элемент не найден, создаем новый
            div = document.createElement('div');
            div.id = this.id;
            container.appendChild(div);
        }
        // Обновляем свойства элемента
        div.style.position = 'absolute';
        div.style.left = `${Math.floor(this.x + 0.0001)}px`;
        div.style.top = `${Math.floor(this.y + 0.0001)}px`;
        div.style.width = `${this.width}px`;
        div.style.height = `${this.height}px`;
        div.style.overflow = 'hidden';
        // Применяем основные стили и дополнительные стили
        Object.assign(div.style, this.textStyle, this.additionalStyles);
        if (typeof this.content === 'string') {
            div.innerText = this.content;
        }
        else if (this.content instanceof HTMLImageElement || this.content instanceof SVGElement) {
            div.innerHTML = ''; // Очистка перед добавлением
            div.appendChild(this.content);
        }
    }
}
exports.MatrixElement = MatrixElement;
class TimeMatrixElement extends MatrixElement {
    constructor(matrix, content, x, y, width, height) {
        super(matrix, content, x, y, width, height);
        this._initFn();
    }
    _initFn() {
        this.setTextUpdateCallback((timestamp) => {
            const now = new Date(timestamp);
            return now.toISOString().substr(11, 12); // Формат времени с миллисекундами (HH:mm:ss.sss)
        });
    }
}
exports.TimeMatrixElement = TimeMatrixElement;


/***/ }),

/***/ "../Matrix/src/Modifiers.ts":
/*!**********************************!*\
  !*** ../Matrix/src/Modifiers.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScaleModifier = exports.BlinkModifier = exports.ScrollingTextModifier = exports.RainbowEffectModifier = exports.RotationModifier = exports.DynamicModifier = void 0;
class DynamicModifier {
    constructor(element, framesPerSecond) {
        this.element = element;
        this.framesPerSecond = framesPerSecond;
        element.addModifier(this);
    }
}
exports.DynamicModifier = DynamicModifier;
class RotationModifier extends DynamicModifier {
    constructor(element, angle) {
        super(element);
        this.angle = angle;
    }
    apply(timestamp) {
        // Здесь можно применить вращение для расчетов, если это имеет смысл
        const rotation = this.angle * (timestamp / 1000);
        // Например, мы можем сохранить угол вращения или другую информацию в элементе
        // Но это будет чисто для логики, не для прямого рендеринга в DOM
    }
}
exports.RotationModifier = RotationModifier;
class RainbowEffectModifier extends DynamicModifier {
    constructor(element, period) {
        super(element);
        this.period = period;
    }
    apply(timestamp) {
        const phase = (timestamp % this.period) / this.period;
        const hue = Math.floor(phase * 360);
        this.element.updateTextStyle({ color: `hsl(${hue}, 100%, 50%)` });
    }
}
exports.RainbowEffectModifier = RainbowEffectModifier;
class ScrollingTextModifier extends DynamicModifier {
    constructor(element, speedPixelsPerSecond, framesPerSecond) {
        super(element, framesPerSecond);
        this.speedPixelsPerSecond = speedPixelsPerSecond;
        this.previousTime = undefined;
    }
    apply(timestamp) {
        if (!this.previousTime) {
            this.previousTime = timestamp;
            this.element.x = this.element.width;
            return;
        }
        this.element.x -= this.speedPixelsPerSecond * (timestamp - this.previousTime) / 1000;
        this.previousTime = timestamp;
        if (this.element.x + this.element.textWidth < 0) {
            this.element.x = this.element.width;
        }
    }
}
exports.ScrollingTextModifier = ScrollingTextModifier;
class BlinkModifier extends DynamicModifier {
    apply(timestamp) {
        let t = timestamp % 1000;
        this.element.visible = t < 500;
    }
}
exports.BlinkModifier = BlinkModifier;
class ScaleModifier extends DynamicModifier {
    apply(timestamp) {
        // Вычисляем масштаб на основе времени
        let t = (timestamp % 2000) / 2000;
        if (t > 0.5)
            t = 1 - t;
        t = 1 + t;
        // Применяем масштабирование к элементу
        this.element.updateAdditionalStyles({
            transform: `scale(${t})`
        });
    }
}
exports.ScaleModifier = ScaleModifier;


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

/***/ "./src/server2.ts":
/*!************************!*\
  !*** ./src/server2.ts ***!
  \************************/
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const ws_1 = __webpack_require__(/*! ws */ "ws");
const PointTracker_1 = __webpack_require__(/*! @server/PointTracker */ "./src/PointTracker.ts");
const Matrix_1 = __webpack_require__(/*! ../../Matrix/src/Matrix */ "../Matrix/src/Matrix.ts");
const serde_ts_1 = __webpack_require__(/*! serde-ts */ "../../node_modules/serde-ts/dist/index.js");
const MatrixElement_1 = __webpack_require__(/*! ../../Matrix/src/MatrixElement */ "../Matrix/src/MatrixElement.ts");
const Modifiers_1 = __webpack_require__(/*! ../../Matrix/src/Modifiers */ "../Matrix/src/Modifiers.ts");
const mutex_1 = __webpack_require__(/*! @server/mutex */ "./src/mutex.ts");
const process = __importStar(__webpack_require__(/*! node:process */ "node:process"));
let i = 0;
let clientCounter = 0;
let clients = [];
let tracker = new PointTracker_1.PointTracker();
let mutex = new mutex_1.Mutex();
class WorkerManager {
    constructor() {
        this.currentWorkerId = undefined;
        this.ports = [8085, 8086];
        this.currentPortIndex = 0;
        this.interval = undefined;
        this.timeout = undefined;
        this.oldWorkerId = undefined;
        this.manager = new src_1.WorkerManager();
    }
    createWorker() {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentPortIndex = 1 - this.currentPortIndex; // Alternate between 8085 and 8086
            const port = this.ports[this.currentPortIndex];
            const workerId = yield this.manager.createWorkerWithHandlers((0, path_1.resolve)(__dirname, 'worker.js'));
            yield this.manager.call(workerId, "initializePage", port);
            console.log(`Worker with ID ${workerId} created on port ${port}.`);
            this.oldWorkerId = this.currentWorkerId;
            this.currentWorkerId = workerId;
            return workerId;
        });
    }
    swapWorkers() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentWorkerId === undefined)
                return;
            if (this.oldWorkerId !== undefined) {
                yield mutex.lock();
                try {
                    console.log(`Swapping from worker ID ${this.oldWorkerId} to ${this.currentWorkerId}`);
                    // Transfer state from old worker to new worker
                    const snapshot = yield this.manager.call(this.oldWorkerId, 'getSnapshot');
                    yield this.manager.call(this.currentWorkerId, 'setSnapshot', snapshot);
                    // Cancel all tasks related to the old worker and close WebSocket server
                    yield this.manager.call(this.oldWorkerId, 'closeWebSocketServer');
                    yield this.manager.terminateWorker(this.oldWorkerId);
                }
                finally {
                    mutex.unlock();
                }
            }
            this.startRenderingProcess();
            console.log(`Worker ID ${this.currentWorkerId} is now the active worker.`);
        });
    }
    updateMatrix() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentWorkerId === undefined)
                return;
            yield mutex.lock();
            try {
                let matrix = serde_ts_1.SerDe.deserialize(yield this.manager.call(this.currentWorkerId, 'getSnapshot'));
                matrix.elements[1].setText((i++).toString());
                yield this.manager.call(this.currentWorkerId, 'setSnapshot', serde_ts_1.SerDe.serialise(matrix));
            }
            finally {
                mutex.unlock();
            }
        });
    }
    ;
    startRenderingProcess() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.interval)
                this.interval = setInterval(this.updateMatrix.bind(this), 1000);
            const processFrameGroup = () => __awaiter(this, void 0, void 0, function* () {
                yield mutex.lock();
                try {
                    if (this.currentWorkerId !== undefined) { // Ensure worker is still valid
                        console.log(`Calling worker with ID: ${this.currentWorkerId}, method: generateNextFrameGroup`);
                        let frameGroup = yield this.manager.call(this.currentWorkerId, 'generateNextFrameGroup');
                        if (frameGroup) {
                            for (let client of clients) {
                                client.send(JSON.stringify(frameGroup));
                            }
                        }
                        let nextTimeout = frameGroup.startTime - Date.now() - 300;
                        if (this.timeout)
                            clearTimeout(this.timeout);
                        this.timeout = setTimeout(processFrameGroup, Math.max(nextTimeout, 0));
                    }
                    else {
                        console.error(`Worker with ID ${this.currentWorkerId} is no longer valid during processFrameGroup.`);
                    }
                }
                finally {
                    mutex.unlock();
                }
            });
            // Start frame processing and matrix updates immediately
            yield processFrameGroup();
        });
    }
    startNewWorkerAndSwap() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createWorker();
            yield this.swapWorkers(); // Swap after new worker is fully ready
        });
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const manager = new WorkerManager();
    yield manager.createWorker();
    manager.startRenderingProcess();
    while (1) {
        yield manager.startNewWorkerAndSwap();
    }
}))();
(() => __awaiter(void 0, void 0, void 0, function* () {
    const wss = new ws_1.Server({ port: 8083 }); // Only one instance of the WebSocket server
    wss.on('connection', (ws) => {
        const clientId = ++clientCounter;
        clients.push(ws);
        console.log(`Client connected: ${clientId}`);
        tracker.point('client-connected');
        ws.once('close', () => {
            clients = clients.filter((client) => client !== ws);
            console.log(`Client disconnected: ${clientId}`);
            tracker.point('client-disconnected');
        });
        ws.on('error', (error) => {
            console.error(`WebSocket error with client ${clientId}:`, error);
            tracker.point('error-occurred');
        });
    });
    // Register classes for serialization/deserialization
    serde_ts_1.SerDe.classRegistration([
        Matrix_1.Matrix, MatrixElement_1.MatrixElement, MatrixElement_1.TimeMatrixElement, Modifiers_1.ScrollingTextModifier, Modifiers_1.ScaleModifier, Modifiers_1.RainbowEffectModifier
    ]);
}))();
setInterval(() => {
    const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
    const memoryData = process.memoryUsage();
    const memoryUsage = {
        rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
        heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
        heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
        external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
    };
    console.log(memoryUsage);
}, 10000);


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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/server2.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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ZSxhQUFhLEVBQUM7Ozs7Ozs7VUNyTDdCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztVRU5BO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvc2VyZGUtdHMvZGlzdC9TZXJEZS5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9zZXJkZS10cy9kaXN0L2luZGV4LmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL01hdHJpeC9zcmMvRnJhbWVHcm91cC50cyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L3NyYy9NYXRyaXgvc3JjL01hdHJpeC50cyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L3NyYy9NYXRyaXgvc3JjL01hdHJpeEVsZW1lbnQudHMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9zcmMvTWF0cml4L3NyYy9Nb2RpZmllcnMudHMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9zcmMvc2VydmVyL3NyYy9Qb2ludFRyYWNrZXIudHMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9zcmMvc2VydmVyL3NyYy9tdXRleC50cyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L3NyYy9zZXJ2ZXIvc3JjL3NlcnZlcjIudHMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvd29ya2VyLXRocmVhZHMtbWFuYWdlci9kaXN0L3NyYy9Xb3JrZXJDb250cm9sbGVyLmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL3dvcmtlci10aHJlYWRzLW1hbmFnZXIvZGlzdC9zcmMvV29ya2VyTWFuYWdlci5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy93b3JrZXItdGhyZWFkcy1tYW5hZ2VyL2Rpc3Qvc3JjL2luZGV4LmpzIiwiZmlsZTovLy9leHRlcm5hbCBjb21tb25qcyBcIndzXCIiLCJmaWxlOi8vL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJub2RlOm9zXCIiLCJmaWxlOi8vL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJub2RlOnByb2Nlc3NcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcIm5vZGU6dHR5XCIiLCJmaWxlOi8vL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJwYXRoXCIiLCJmaWxlOi8vL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJ3b3JrZXJfdGhyZWFkc1wiIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL2NoYWxrL3NvdXJjZS9pbmRleC5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9jaGFsay9zb3VyY2UvdXRpbGl0aWVzLmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL2NoYWxrL3NvdXJjZS92ZW5kb3IvYW5zaS1zdHlsZXMvaW5kZXguanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvY2hhbGsvc291cmNlL3ZlbmRvci9zdXBwb3J0cy1jb2xvci9pbmRleC5qcyIsImZpbGU6Ly8vd2VicGFjay9ib290c3RyYXAiLCJmaWxlOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsImZpbGU6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsImZpbGU6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsImZpbGU6Ly8vd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsImZpbGU6Ly8vd2VicGFjay9zdGFydHVwIiwiZmlsZTovLy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlNlckRlID0gdm9pZCAwO1xuLy8gRnVuY3Rpb24gdG8gY2hlY2sgaWYgYSBnaXZlbiBmdW5jdGlvbiBpcyBhIGNsYXNzIGNvbnN0cnVjdG9yXG5mdW5jdGlvbiBpc0NsYXNzKGZ1bmMpIHtcbiAgICByZXR1cm4gdHlwZW9mIGZ1bmMgPT09ICdmdW5jdGlvbicgJiYgL15cXHMqY2xhc3NcXHMrLy50ZXN0KGZ1bmMudG9TdHJpbmcoKSk7XG59XG5jbGFzcyBTZXJEZSB7XG4gICAgLy8gTWV0aG9kIHRvIGhhbmRsZSBzaW1wbGUgdHlwZXMgZGlyZWN0bHlcbiAgICBzdGF0aWMgZnJvbVNpbXBsZShvYmopIHtcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIERhdGUgfHwgdHlwZW9mIG9iaiA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIG9iaiA9PT0gJ251bWJlcicgfHwgdHlwZW9mIG9iaiA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8vIE1ldGhvZCB0byBzZXQgZXhjbHVzaXZlIGNsYXNzZXMgZm9yIHNlcmlhbGl6YXRpb25cbiAgICBzdGF0aWMgc2V0RXhjbHVzaXZlbHkobGlzdCkge1xuICAgICAgICBTZXJEZS5vbmx5ID0gbmV3IFNldChbLi4ubGlzdCwgQXJyYXksIE1hcCwgU2V0XSk7XG4gICAgfVxuICAgIC8vIE1haW4gc2VyaWFsaXphdGlvbiBtZXRob2RcbiAgICBzdGF0aWMgc2VyaWFsaXNlKG9iaiwgdmlzaXRlZCA9IG5ldyBNYXAoKSwgX21hcCA9IG5ldyBNYXAoKSwgZGVwdGggPSAwLCBwYXJlbnQpIHtcbiAgICAgICAgdmFyIF9hLCBfYiwgX2MsIF9kLCBfZTtcbiAgICAgICAgaWYgKHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnIHx8IG9iaiA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIC8vIElmIHRoZSBvYmplY3QgaXMgYSBjbGFzcyBhbmQgaXMgbm90IGluIHRoZSBleGNsdXNpdmUgbGlzdCwgc2tpcCBzZXJpYWxpemF0aW9uXG4gICAgICAgIGlmICgoKF9hID0gU2VyRGUub25seSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnNpemUpICYmIGlzQ2xhc3Mob2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLmNvbnN0cnVjdG9yKSAmJiAhU2VyRGUub25seS5oYXMob2JqLmNvbnN0cnVjdG9yKSlcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBEYXRlKVxuICAgICAgICAgICAgcmV0dXJuIHsgdDogJ0RhdGUnLCB2OiBvYmoudmFsdWVPZigpIH07XG4gICAgICAgIGxldCBtYXliZVNpbXBsZSA9IFNlckRlLmZyb21TaW1wbGUob2JqKTtcbiAgICAgICAgaWYgKG1heWJlU2ltcGxlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICByZXR1cm4gbWF5YmVTaW1wbGU7XG4gICAgICAgIGlmICh2aXNpdGVkLmhhcyhvYmopKSB7XG4gICAgICAgICAgICB2aXNpdGVkLmdldChvYmopLnRpbWVzKys7XG4gICAgICAgICAgICByZXR1cm4geyB0OiAoX2IgPSBvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmouY29uc3RydWN0b3IpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5uYW1lLCB2OiB7IF9tYXBJZDogU2VyRGUud2Vha01hcC5nZXQob2JqKSB9IH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICAgICAgICAgICAgcmV0dXJuIHsgdDogJ2Z1bmN0aW9uJywgdjogb2JqLm5hbWUgfTtcbiAgICAgICAgaWYgKHBhcmVudClcbiAgICAgICAgICAgIHZpc2l0ZWQuc2V0KG9iaiwgeyB0aW1lczogMSwgcGFyZW50IH0pO1xuICAgICAgICBsZXQgaWQgPSAoX2MgPSBTZXJEZS53ZWFrTWFwLmdldChvYmopKSAhPT0gbnVsbCAmJiBfYyAhPT0gdm9pZCAwID8gX2MgOiBTZXJEZS5pZCsrO1xuICAgICAgICBTZXJEZS53ZWFrTWFwLnNldChvYmosIGlkKTtcbiAgICAgICAgLy8gSGFuZGxlIE1hcCBvYmplY3RzXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIGxldCBzZXJpYWxpc2VkID0gbmV3IEFycmF5KG9iai5zaXplKTtcbiAgICAgICAgICAgIF9tYXAuc2V0KGlkLCBzZXJpYWxpc2VkKTtcbiAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgIG9iai5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgc2VyaWFsaXNlZFtpXSA9IFtcbiAgICAgICAgICAgICAgICAgICAgU2VyRGUuc2VyaWFsaXNlKGtleSwgdmlzaXRlZCwgX21hcCwgZGVwdGggKyAxLCB7IG9iajogc2VyaWFsaXNlZCwga2V5OiBbaSwgMF0gfSksXG4gICAgICAgICAgICAgICAgICAgIFNlckRlLnNlcmlhbGlzZSh2YWx1ZSwgdmlzaXRlZCwgX21hcCwgZGVwdGggKyAxLCB7IG9iajogc2VyaWFsaXNlZCwga2V5OiBbaSwgMV0gfSksXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB7IHQ6IG9iai5jb25zdHJ1Y3Rvci5uYW1lLCB2OiBzZXJpYWxpc2VkIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gSGFuZGxlIFNldCBhbmQgQXJyYXkgb2JqZWN0c1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgU2V0IHx8IG9iaiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBsZXQgc2VyaWFsaXNlZCA9IEFycmF5KG9iaiBpbnN0YW5jZW9mIFNldCA/IG9iai5zaXplIDogb2JqLmxlbmd0aCk7XG4gICAgICAgICAgICBfbWFwLnNldChpZCwgc2VyaWFsaXNlZCk7XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICBvYmouZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBzZXJpYWxpc2VkW2ldID0gU2VyRGUuc2VyaWFsaXNlKHZhbHVlLCB2aXNpdGVkLCBfbWFwLCBkZXB0aCArIDEsIHsgb2JqOiBzZXJpYWxpc2VkLCBrZXk6IGkgfSk7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4geyB0OiBvYmouY29uc3RydWN0b3IubmFtZSwgdjogc2VyaWFsaXNlZCB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEhhbmRsZSBnZW5lcmljIG9iamVjdHNcbiAgICAgICAgbGV0IHNlcmlhbGlzZWQgPSB7fTtcbiAgICAgICAgX21hcC5zZXQoaWQsIHNlcmlhbGlzZWQpO1xuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgICAgICAgICAgc2VyaWFsaXNlZFtrZXldID0gU2VyRGUuc2VyaWFsaXNlKHZhbHVlLCB2aXNpdGVkLCBfbWFwLCBkZXB0aCArIDEsIHsgb2JqOiBzZXJpYWxpc2VkLCBrZXkgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgd2UgYXJlIGF0IHRoZSB0b3AgbGV2ZWwsIGhhbmRsZSBjaXJjdWxhciByZWZlcmVuY2VzIGFuZCBtdWx0aXBsZSBpbnN0YW5jZXNcbiAgICAgICAgaWYgKGRlcHRoID09PSAwKSB7XG4gICAgICAgICAgICBsZXQgcmVjdXJzaW9uVmlzaXRlZCA9IEFycmF5LmZyb20odmlzaXRlZClcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChbXywgdmFsXSkgPT4gdmFsLnRpbWVzID4gMSlcbiAgICAgICAgICAgICAgICAubWFwKChbb2JqLCB2YWxdKSA9PiBbU2VyRGUud2Vha01hcC5nZXQob2JqKSwgdmFsXSk7IC8vIEV4cGxpY2l0bHkgY2FzdCBpZCB0byBudW1iZXJcbiAgICAgICAgICAgIHJlY3Vyc2lvblZpc2l0ZWQuZm9yRWFjaCgoW2lkLCB2YWxdKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbC5wYXJlbnQua2V5IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgICAgICB2YWwucGFyZW50Lm9ialt2YWwucGFyZW50LmtleVswXV1bdmFsLnBhcmVudC5rZXlbMV1dLnYgPSB7IF9tYXBJZDogaWQgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAgICAgdmFsLnBhcmVudC5vYmpbdmFsLnBhcmVudC5rZXldLnYgPSB7IF9tYXBJZDogaWQgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEF0dGFjaCB0aGUgX21hcCBmb3Igc2VyaWFsaXphdGlvbiByZXN1bHRcbiAgICAgICAgICAgIHJldHVybiB7IHQ6IChfZCA9IG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9iai5jb25zdHJ1Y3RvcikgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLm5hbWUsIHY6IHNlcmlhbGlzZWQsIF9tYXA6IHJlY3Vyc2lvblZpc2l0ZWQubWFwKCh4KSA9PiBbeFswXSwgX21hcC5nZXQoeFswXSldKSB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHQ6IChfZSA9IG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9iai5jb25zdHJ1Y3RvcikgPT09IG51bGwgfHwgX2UgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9lLm5hbWUsIHY6IHNlcmlhbGlzZWQgfTtcbiAgICB9XG4gICAgLy8gTWFpbiBkZXNlcmlhbGl6YXRpb24gbWV0aG9kXG4gICAgc3RhdGljIGRlc2VyaWFsaXplKG9iaikge1xuICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2QsIF9lLCBfZiwgX2csIF9oLCBfaiwgX2ssIF9sO1xuICAgICAgICBpZiAob2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgaWYgKChvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmoudCkgPT09ICdEYXRlJylcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShvYmoudik7XG4gICAgICAgIC8vIElmIG9iaiBpcyBhIHByaW1pdGl2ZSwgcmV0dXJuIGl0IGRpcmVjdGx5ICh3aXRoIERhdGUgaGFuZGxpbmcpXG4gICAgICAgIGlmIChTZXJEZS5pc1ByaW1pdGl2ZShvYmopKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqIGluc3RhbmNlb2YgRGF0ZSA/IG5ldyBEYXRlKG9iaikgOiBvYmo7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9iai50ID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgcmV0dXJuIChfYSA9IFNlckRlLmNsYXNzUmVnaXN0cnkuZ2V0KG9iai52KSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDoge307XG4gICAgICAgIC8vIEhhbmRsZXMgdGhlIHJlc3RvcmF0aW9uIG9mIF9tYXAgZm9yIG9iamVjdCByZWZlcmVuY2VzIGlmIGl0IGV4aXN0c1xuICAgICAgICBpZiAob2JqLl9tYXApIHtcbiAgICAgICAgICAgIFNlckRlLl9tYXAgPSBuZXcgTWFwKG9iai5fbWFwKTtcbiAgICAgICAgICAgIFNlckRlLl90ZW1wTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJldHJpZXZlIHRoZSBjbGFzcyBjb25zdHJ1Y3RvciBpZiBhdmFpbGFibGVcbiAgICAgICAgY29uc3QgY2xhc3NDb25zdHJ1Y3RvciA9IFNlckRlLmNsYXNzUmVnaXN0cnkuZ2V0KG9iai50KTtcbiAgICAgICAgbGV0IGluc3RhbmNlO1xuICAgICAgICBpZiAoKChfYiA9IG9iai52KSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuX21hcElkKSAmJiAoKF9jID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9jID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYy5oYXMob2JqLnYuX21hcElkKSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoX2QgPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLmdldChvYmoudi5fbWFwSWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW5zdGFuY2UgPSBjbGFzc0NvbnN0cnVjdG9yID8gT2JqZWN0LmNyZWF0ZShjbGFzc0NvbnN0cnVjdG9yLnByb3RvdHlwZSkgOiB7fTtcbiAgICAgICAgICAgIChfZSA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Uuc2V0KG9iai52Ll9tYXBJZCwgaW5zdGFuY2UpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBuZXN0ZWQgPSAoX2ggPSAoX2YgPSBTZXJEZS5fbWFwKSA9PT0gbnVsbCB8fCBfZiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2YuZ2V0KChfZyA9IG9iai52KSA9PT0gbnVsbCB8fCBfZyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2cuX21hcElkKSkgIT09IG51bGwgJiYgX2ggIT09IHZvaWQgMCA/IF9oIDogb2JqLnY7XG4gICAgICAgIC8vIERlc2VyaWFsaXplIGJhc2VkIG9uIHRoZSB0eXBlIG9mIG9iamVjdFxuICAgICAgICBzd2l0Y2ggKG9iai50KSB7XG4gICAgICAgICAgICBjYXNlICdBcnJheSc6IC8vIEhhbmRsZSBhcnJheXNcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5lc3RlZC5tYXAoKGl0ZW0pID0+IFNlckRlLmRlc2VyaWFsaXplKGl0ZW0pKTtcbiAgICAgICAgICAgICAgICAoX2ogPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2ogPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9qLnNldChvYmoudi5fbWFwSWQsIGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgICAgICBjYXNlICdNYXAnOiAvLyBIYW5kbGUgbWFwc1xuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IE1hcChuZXN0ZWQubWFwKChba2V5LCB2YWx1ZV0pID0+IFtTZXJEZS5kZXNlcmlhbGl6ZShrZXkpLCBTZXJEZS5kZXNlcmlhbGl6ZSh2YWx1ZSldKSk7XG4gICAgICAgICAgICAgICAgKF9rID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9rID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfay5zZXQob2JqLnYuX21hcElkLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICAgICAgY2FzZSAnU2V0JzogLy8gSGFuZGxlIHNldHNcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBTZXQobmVzdGVkLm1hcCgoaXRlbSkgPT4gU2VyRGUuZGVzZXJpYWxpemUoaXRlbSkpKTtcbiAgICAgICAgICAgICAgICAoX2wgPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2wgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9sLnNldChvYmoudi5fbWFwSWQsIGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgICAgICBkZWZhdWx0OiAvLyBIYW5kbGUgb2JqZWN0c1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG5lc3RlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Vba2V5XSA9IFNlckRlLmRlc2VyaWFsaXplKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNsYXNzQ29uc3RydWN0b3IgJiYgU2VyRGUuaW5pdEZ1bmNOYW1lICYmIHR5cGVvZiBpbnN0YW5jZVtTZXJEZS5pbml0RnVuY05hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW1NlckRlLmluaXRGdW5jTmFtZV0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2xlYXIgdGhlIF9tYXAgYWZ0ZXIgZGVzZXJpYWxpemF0aW9uIGlzIGNvbXBsZXRlIHRvIGZyZWUgbWVtb3J5XG4gICAgICAgIGlmIChvYmouX21hcCkge1xuICAgICAgICAgICAgU2VyRGUuX21hcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIFNlckRlLl90ZW1wTWFwID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTsgLy8gUmV0dXJuIHRoZSBkZXNlcmlhbGl6ZWQgaW5zdGFuY2VcbiAgICB9XG4gICAgLy8gTWV0aG9kIHRvIHJlZ2lzdGVyIGNsYXNzZXMgZm9yIGRlc2VyaWFsaXphdGlvblxuICAgIHN0YXRpYyBjbGFzc1JlZ2lzdHJhdGlvbihjbGFzc2VzKSB7XG4gICAgICAgIGNsYXNzZXMuZm9yRWFjaCgoeCkgPT4gU2VyRGUuY2xhc3NSZWdpc3RyeS5zZXQoeC5uYW1lLCB4KSk7XG4gICAgfVxuICAgIC8vIEhlbHBlciBtZXRob2QgdG8gY2hlY2sgaWYgYSB2YWx1ZSBpcyBwcmltaXRpdmVcbiAgICBzdGF0aWMgaXNQcmltaXRpdmUodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuICh2YWx1ZSA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgWydudW1iZXInLCAnc3RyaW5nJywgJ2Jvb2xlYW4nLCAndW5kZWZpbmVkJywgJ3N5bWJvbCcsICdiaWdpbnQnXS5pbmNsdWRlcyh0eXBlb2YgdmFsdWUpIHx8XG4gICAgICAgICAgICB2YWx1ZSBpbnN0YW5jZW9mIERhdGUpO1xuICAgIH1cbn1cbmV4cG9ydHMuU2VyRGUgPSBTZXJEZTtcblNlckRlLmluaXRGdW5jTmFtZSA9ICdfaW5pdEZuJzsgLy8gTmFtZSBvZiB0aGUgaW5pdGlhbGl6YXRpb24gZnVuY3Rpb24gKGlmIGV4aXN0cylcblNlckRlLmlkID0gMDsgLy8gVW5pcXVlIElEIGNvdW50ZXIgZm9yIG9iamVjdHNcblNlckRlLndlYWtNYXAgPSBuZXcgV2Vha01hcCgpOyAvLyBXZWFrTWFwIHRvIHRyYWNrIG9iamVjdHMgZHVyaW5nIHNlcmlhbGl6YXRpb25cblNlckRlLmNsYXNzUmVnaXN0cnkgPSBuZXcgTWFwKFtcbiAgICBbJ0FycmF5JywgQXJyYXldLFxuICAgIFsnU2V0JywgU2V0XSxcbiAgICBbJ01hcCcsIE1hcF0sXG5dKTsgLy8gUmVnaXN0cnkgb2YgY2xhc3NlcyBmb3IgZGVzZXJpYWxpemF0aW9uXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19leHBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2V4cG9ydFN0YXIpIHx8IGZ1bmN0aW9uKG0sIGV4cG9ydHMpIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4cG9ydHMsIHApKSBfX2NyZWF0ZUJpbmRpbmcoZXhwb3J0cywgbSwgcCk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLy8gc3JjL2luZGV4LnRzXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vU2VyRGVcIiksIGV4cG9ydHMpO1xuIiwiZXhwb3J0IGNsYXNzIEZyYW1lR3JvdXAge1xuICAgIHN0YXJ0VGltZTogbnVtYmVyO1xuICAgIGZyYW1lSW50ZXJ2YWw6IG51bWJlcjtcbiAgICBmcmFtZUNvdW50OiBudW1iZXI7XG4gICAgZnJhbWVzUGVyU2Vjb25kOiBudW1iZXI7XG4gICAgZnJhbWVQb3NpdGlvbnM6IG51bWJlcltdO1xuICAgIHRvdGFsSGVpZ2h0OiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHN0YXJ0VGltZTogbnVtYmVyLCBmcmFtZUludGVydmFsOiBudW1iZXIsIGZyYW1lQ291bnQ6IG51bWJlciwgZnJhbWVzUGVyU2Vjb25kOiBudW1iZXIsIGZyYW1lUG9zaXRpb25zOiBudW1iZXJbXSwgdG90YWxIZWlnaHQ6IG51bWJlciwgd2lkdGg6IG51bWJlcikge1xuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IHN0YXJ0VGltZTtcbiAgICAgICAgdGhpcy5mcmFtZUludGVydmFsID0gZnJhbWVJbnRlcnZhbDtcbiAgICAgICAgdGhpcy5mcmFtZUNvdW50ID0gZnJhbWVDb3VudDtcbiAgICAgICAgdGhpcy5mcmFtZXNQZXJTZWNvbmQgPSBmcmFtZXNQZXJTZWNvbmQ7XG4gICAgICAgIHRoaXMuZnJhbWVQb3NpdGlvbnMgPSBmcmFtZVBvc2l0aW9ucztcbiAgICAgICAgdGhpcy50b3RhbEhlaWdodCA9IHRvdGFsSGVpZ2h0O1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtNYXRyaXhFbGVtZW50fSBmcm9tIFwiLi9NYXRyaXhFbGVtZW50XCI7XG5pbXBvcnQge0ZyYW1lR3JvdXB9IGZyb20gXCIuL0ZyYW1lR3JvdXBcIjtcblxuZXhwb3J0IGNsYXNzIE1hdHJpeCB7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICBmcmFtZXNQZXJTZWNvbmQ6IG51bWJlcjtcbiAgICBmcmFtZXNQZXJHcm91cDogbnVtYmVyO1xuICAgIHN0YXJ0VGltZTogbnVtYmVyO1xuICAgIGxhc3RFbmRUaW1lOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBlbGVtZW50SWRDb3VudGVyOiBudW1iZXIgPSAwO1xuICAgIHB1YmxpYyBlbGVtZW50czogTWF0cml4RWxlbWVudFtdID0gW107XG5cblxuICAgIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBmcmFtZXNQZXJTZWNvbmQ6IG51bWJlciwgZnJhbWVzUGVyR3JvdXA6IG51bWJlciwgc3RhcnRUaW1lOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5mcmFtZXNQZXJTZWNvbmQgPSBmcmFtZXNQZXJTZWNvbmQ7XG4gICAgICAgIHRoaXMuZnJhbWVzUGVyR3JvdXAgPSBmcmFtZXNQZXJHcm91cDtcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBzdGFydFRpbWU7XG4gICAgICAgIHRoaXMubGFzdEVuZFRpbWUgPSBzdGFydFRpbWU7XG4gICAgfVxuXG4gICAgZ2VuZXJhdGVFbGVtZW50SWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBlbGVtZW50LSR7dGhpcy5lbGVtZW50SWRDb3VudGVyKyt9YDtcbiAgICB9XG5cbiAgICBzZXRTdGFydFRpbWUobmV3U3RhcnRUaW1lOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBuZXdTdGFydFRpbWU7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc3RhcnRUaW1lKVxuICAgICAgICB0aGlzLmxhc3RFbmRUaW1lID0gbmV3U3RhcnRUaW1lO1xuICAgIH1cblxuICAgIGdlbmVyYXRlTmV4dEdyb3VwKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIG1hdHJpeEVsZW1lbnRzOiBNYXRyaXhFbGVtZW50W10pOiBGcmFtZUdyb3VwIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdGcmFtZXMgPSBBcnJheS5mcm9tKGNvbnRhaW5lci5jaGlsZHJlbikgYXMgSFRNTEVsZW1lbnRbXTtcbiAgICAgICAgY29uc3QgZnJhbWVJbnRlcnZhbCA9IDEwMDAgLyB0aGlzLmZyYW1lc1BlclNlY29uZDtcbiAgICAgICAgY29uc3QgZnJhbWVDb3VudCA9IHRoaXMuZnJhbWVzUGVyR3JvdXA7XG5cbiAgICAgICAgLy8g0J3QsNGH0LDQu9C+INC90L7QstC+0Lkg0LPRgNGD0L/Qv9GLXG4gICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IHRoaXMubGFzdEVuZFRpbWU7XG4gICAgICAgIGNvbnN0IGZyYW1lUG9zaXRpb25zID0gQXJyYXkuZnJvbSh7bGVuZ3RoOiBmcmFtZUNvdW50fSwgKF8sIGkpID0+IHN0YXJ0VGltZSArIGkgKiBmcmFtZUludGVydmFsKTtcbiAgICAgICAgdGhpcy5sYXN0RW5kVGltZSA9IHN0YXJ0VGltZSArIGZyYW1lSW50ZXJ2YWwgKiBmcmFtZUNvdW50O1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZnJhbWVDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgZnJhbWU6IEhUTUxFbGVtZW50O1xuXG4gICAgICAgICAgICBpZiAoaSA8IGV4aXN0aW5nRnJhbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIC8vINCY0YHQv9C+0LvRjNC30YPQtdC8INGB0YPRidC10YHRgtCy0YPRjtGJ0LjQuSDRjdC70LXQvNC10L3RglxuICAgICAgICAgICAgICAgIGZyYW1lID0gZXhpc3RpbmdGcmFtZXNbaV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vINCh0L7Qt9C00LDQtdC8INC90L7QstGL0Lkg0Y3Qu9C10LzQtdC90YIsINC10YHQu9C4INC10LPQviDQtdGJ0LUg0L3QtdGCXG4gICAgICAgICAgICAgICAgZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICBmcmFtZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgICAgICAgICAgZnJhbWUuc3R5bGUud2lkdGggPSBgJHt0aGlzLndpZHRofXB4YDtcbiAgICAgICAgICAgICAgICBmcmFtZS5zdHlsZS5oZWlnaHQgPSBgJHt0aGlzLmhlaWdodH1weGA7XG4gICAgICAgICAgICAgICAgZnJhbWUuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZnJhbWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmcmFtZS5zdHlsZS50b3AgPSBgJHtpICogdGhpcy5oZWlnaHR9cHhgO1xuXG4gICAgICAgICAgICAvLyDQntGH0LjRidCw0LXQvCDRgdC+0LTQtdGA0LbQuNC80L7QtSDRhNGA0LXQudC80LAg0L/QtdGA0LXQtCDQtNC+0LHQsNCy0LvQtdC90LjQtdC8INC90L7QstGL0YUg0Y3Qu9C10LzQtdC90YLQvtCyXG4gICAgICAgICAgICBmcmFtZS5pbm5lckhUTUwgPSAnJztcblxuICAgICAgICAgICAgbWF0cml4RWxlbWVudHMuc29ydCgoYSwgYikgPT4gYi5sYXllciAtIGEubGF5ZXIpXG4gICAgICAgICAgICAvLyDQn9GA0LjQvNC10L3Rj9C10Lwg0LzQvtC00LjRhNC40LrQsNGC0L7RgNGLINC4INGA0LXQvdC00LXRgNC40Lwg0LrQsNC20LTRi9C5INGN0LvQtdC80LXQvdGCINC80LDRgtGA0LjRhtGLXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1hdHJpeEVsZW1lbnQgb2YgbWF0cml4RWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICBtYXRyaXhFbGVtZW50LmFwcGx5TW9kaWZpZXJzKGZyYW1lUG9zaXRpb25zW2ldKTtcbiAgICAgICAgICAgICAgICBtYXRyaXhFbGVtZW50LnJlbmRlclRvKGZyYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vINCj0LTQsNC70Y/QtdC8INC70LjRiNC90LjQtSDRjdC70LXQvNC10L3RgtGLLCDQtdGB0LvQuCDQvtC90Lgg0LXRgdGC0YxcbiAgICAgICAgaWYgKGV4aXN0aW5nRnJhbWVzLmxlbmd0aCA+IGZyYW1lQ291bnQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBleGlzdGluZ0ZyYW1lcy5sZW5ndGggLSAxOyBqID49IGZyYW1lQ291bnQ7IGotLSkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChleGlzdGluZ0ZyYW1lc1tqXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b3RhbEhlaWdodCA9IHRoaXMuaGVpZ2h0ICogZnJhbWVDb3VudDtcbiAgICAgICAgcmV0dXJuIG5ldyBGcmFtZUdyb3VwKHN0YXJ0VGltZSwgZnJhbWVJbnRlcnZhbCwgZnJhbWVDb3VudCwgdGhpcy5mcmFtZXNQZXJTZWNvbmQsIGZyYW1lUG9zaXRpb25zLCB0b3RhbEhlaWdodCwgdGhpcy53aWR0aCk7XG4gICAgfVxuXG4gICAgYWRkRWxlbWVudChtYXRyaXhFbGVtZW50OiBNYXRyaXhFbGVtZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5lbGVtZW50cy5pbmNsdWRlcyhtYXRyaXhFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50cy5wdXNoKG1hdHJpeEVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICByZW1vdmVFbGVtZW50KG1hdHJpeEVsZW1lbnQ6IE1hdHJpeEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50cyA9IHRoaXMuZWxlbWVudHMuZmlsdGVyKHggPT4geCAhPT0gbWF0cml4RWxlbWVudClcbiAgICB9XG5cbiAgICBjbGVhckVsZW1lbnRzKCkge1xuICAgICAgICB0aGlzLmVsZW1lbnRzID0gW11cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBEeW5hbWljTW9kaWZpZXIgfSBmcm9tIFwiLi9Nb2RpZmllcnNcIjtcbmltcG9ydCB7IE1hdHJpeCB9IGZyb20gXCIuL01hdHJpeFwiO1xuXG5leHBvcnQgY2xhc3MgTWF0cml4RWxlbWVudCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBjb250ZW50OiBzdHJpbmcgfCBIVE1MSW1hZ2VFbGVtZW50IHwgU1ZHRWxlbWVudDtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgbW9kaWZpZXJzOiBEeW5hbWljTW9kaWZpZXJbXTtcbiAgICB0ZXh0V2lkdGg6IG51bWJlcjtcbiAgICB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAgICBsYXllciA9IDA7XG4gICAgdGV4dFVwZGF0ZUNhbGxiYWNrPzogKHRpbWVzdGFtcDogbnVtYmVyKSA9PiBzdHJpbmc7XG4gICAgdGV4dFN0eWxlOiBQYXJ0aWFsPENTU1N0eWxlRGVjbGFyYXRpb24+O1xuICAgIGFkZGl0aW9uYWxTdHlsZXM6IFBhcnRpYWw8Q1NTU3R5bGVEZWNsYXJhdGlvbj47ICAvLyDQndC+0LLQvtC1INC/0L7Qu9C1INC00LvRjyDQtNC+0L/QvtC70L3QuNGC0LXQu9GM0L3Ri9GFINGB0YLQuNC70LXQuVxuXG4gICAgY29uc3RydWN0b3IobWF0cml4OiBNYXRyaXgsIGNvbnRlbnQ6IHN0cmluZyB8IEhUTUxJbWFnZUVsZW1lbnQgfCBTVkdFbGVtZW50LCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5pZCA9IG1hdHJpeC5nZW5lcmF0ZUVsZW1lbnRJZCgpO1xuICAgICAgICB0aGlzLmNvbnRlbnQgPSBjb250ZW50O1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLm1vZGlmaWVycyA9IFtdO1xuICAgICAgICB0aGlzLnRleHRTdHlsZSA9IHt9O1xuICAgICAgICB0aGlzLmFkZGl0aW9uYWxTdHlsZXMgPSB7fTsgIC8vINCY0L3QuNGG0LjQsNC70LjQt9Cw0YbQuNGPINC90L7QstC+0LPQviDQv9C+0LvRj1xuXG4gICAgICAgIHRoaXMudGV4dFdpZHRoID0gdGhpcy5jYWxjdWxhdGVUZXh0V2lkdGgoKTtcbiAgICB9XG5cbiAgICAvLyDQnNC10YLQvtC0INC00LvRjyDQstGL0YfQuNGB0LvQtdC90LjRjyDRiNC40YDQuNC90Ysg0YLQtdC60YHRgtCwINCx0LXQtyDQtNC+0LHQsNCy0LvQtdC90LjRjyDRjdC70LXQvNC10L3RgtCwINCyIERPTVxuICAgIGNhbGN1bGF0ZVRleHRXaWR0aCgpOiBudW1iZXIge1xuICAgICAgICBjb25zdCB0ZW1wRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRlbXBEaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICB0ZW1wRGl2LnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICAgICAgdGVtcERpdi5zdHlsZS53aGl0ZVNwYWNlID0gJ25vd3JhcCc7XG4gICAgICAgIHRlbXBEaXYuc3R5bGUuZm9udCA9IHRoaXMudGV4dFN0eWxlLmZvbnQgfHwgJzE2cHggQXJpYWwnO1xuICAgICAgICB0ZW1wRGl2LmlubmVyVGV4dCA9IHRoaXMuY29udGVudCBhcyBzdHJpbmc7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGVtcERpdik7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGVtcERpdi5jbGllbnRXaWR0aDtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0ZW1wRGl2KTtcbiAgICAgICAgcmV0dXJuIHdpZHRoO1xuICAgIH1cblxuICAgIHNldFRleHQobmV3VGV4dDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuY29udGVudCA9IG5ld1RleHQ7XG4gICAgICAgIC8vIHRoaXMudGV4dFdpZHRoID0gdGhpcy5jYWxjdWxhdGVUZXh0V2lkdGgoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVUZXh0U3R5bGUobmV3U3R5bGVzOiBQYXJ0aWFsPENTU1N0eWxlRGVjbGFyYXRpb24+KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy50ZXh0U3R5bGUsIG5ld1N0eWxlcyk7XG4gICAgICAgIHRoaXMudGV4dFdpZHRoID0gdGhpcy5jYWxjdWxhdGVUZXh0V2lkdGgoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVBZGRpdGlvbmFsU3R5bGVzKG5ld1N0eWxlczogUGFydGlhbDxDU1NTdHlsZURlY2xhcmF0aW9uPikgeyAgLy8g0J3QvtCy0YvQuSDQvNC10YLQvtC0INC00LvRjyDQvtCx0L3QvtCy0LvQtdC90LjRjyDQtNC+0L/QvtC70L3QuNGC0LXQu9GM0L3Ri9GFINGB0YLQuNC70LXQuVxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuYWRkaXRpb25hbFN0eWxlcywgbmV3U3R5bGVzKTtcbiAgICB9XG5cbiAgICBzZXRUZXh0VXBkYXRlQ2FsbGJhY2soY2FsbGJhY2s6ICh0aW1lc3RhbXA6IG51bWJlcikgPT4gc3RyaW5nKSB7XG4gICAgICAgIHRoaXMudGV4dFVwZGF0ZUNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuXG4gICAgYXBwbHlNb2RpZmllcnModGltZXN0YW1wOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMudGV4dFVwZGF0ZUNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdUZXh0ID0gdGhpcy50ZXh0VXBkYXRlQ2FsbGJhY2sodGltZXN0YW1wKTtcbiAgICAgICAgICAgIHRoaXMuc2V0VGV4dChuZXdUZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IG1vZGlmaWVyIG9mIHRoaXMubW9kaWZpZXJzKSB7XG4gICAgICAgICAgICBtb2RpZmllci5hcHBseSh0aW1lc3RhbXApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkTW9kaWZpZXIobW9kaWZpZXI6IER5bmFtaWNNb2RpZmllcikge1xuICAgICAgICB0aGlzLm1vZGlmaWVycy5wdXNoKG1vZGlmaWVyKTtcbiAgICB9XG5cbiAgICByZW5kZXJUbyhjb250YWluZXI6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlVGV4dFdpZHRoKClcbiAgICAgICAgaWYgKCF0aGlzLnZpc2libGUpIHJldHVybjtcbiAgICAgICAgLy8g0JjRidC10Lwg0YHRg9GJ0LXRgdGC0LLRg9GO0YnQuNC5INGN0LvQtdC80LXQvdGCINCyINC60L7QvdGC0LXQudC90LXRgNC1INC/0L4gaWRcbiAgICAgICAgbGV0IGRpdiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGAjJHt0aGlzLmlkfWApIGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAgIGlmICghZGl2KSB7XG4gICAgICAgICAgICAvLyDQldGB0LvQuCDRjdC70LXQvNC10L3RgiDQvdC1INC90LDQudC00LXQvSwg0YHQvtC30LTQsNC10Lwg0L3QvtCy0YvQuVxuICAgICAgICAgICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBkaXYuaWQgPSB0aGlzLmlkO1xuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDQntCx0L3QvtCy0LvRj9C10Lwg0YHQstC+0LnRgdGC0LLQsCDRjdC70LXQvNC10L3RgtCwXG4gICAgICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIGRpdi5zdHlsZS5sZWZ0ID0gYCR7TWF0aC5mbG9vcih0aGlzLnggKyAwLjAwMDEpfXB4YDtcbiAgICAgICAgZGl2LnN0eWxlLnRvcCA9IGAke01hdGguZmxvb3IodGhpcy55ICsgMC4wMDAxKX1weGA7XG4gICAgICAgIGRpdi5zdHlsZS53aWR0aCA9IGAke3RoaXMud2lkdGh9cHhgO1xuICAgICAgICBkaXYuc3R5bGUuaGVpZ2h0ID0gYCR7dGhpcy5oZWlnaHR9cHhgO1xuICAgICAgICBkaXYuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcblxuICAgICAgICAvLyDQn9GA0LjQvNC10L3Rj9C10Lwg0L7RgdC90L7QstC90YvQtSDRgdGC0LjQu9C4INC4INC00L7Qv9C+0LvQvdC40YLQtdC70YzQvdGL0LUg0YHRgtC40LvQuFxuICAgICAgICBPYmplY3QuYXNzaWduKGRpdi5zdHlsZSwgdGhpcy50ZXh0U3R5bGUsIHRoaXMuYWRkaXRpb25hbFN0eWxlcyk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNvbnRlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBkaXYuaW5uZXJUZXh0ID0gdGhpcy5jb250ZW50O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY29udGVudCBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQgfHwgdGhpcy5jb250ZW50IGluc3RhbmNlb2YgU1ZHRWxlbWVudCkge1xuICAgICAgICAgICAgZGl2LmlubmVySFRNTCA9ICcnOyAvLyDQntGH0LjRgdGC0LrQsCDQv9C10YDQtdC0INC00L7QsdCw0LLQu9C10L3QuNC10LxcbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZCh0aGlzLmNvbnRlbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVGltZU1hdHJpeEVsZW1lbnQgZXh0ZW5kcyBNYXRyaXhFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihtYXRyaXg6IE1hdHJpeCwgY29udGVudDogc3RyaW5nIHwgSFRNTEltYWdlRWxlbWVudCB8IFNWR0VsZW1lbnQsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBzdXBlcihtYXRyaXgsIGNvbnRlbnQsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB0aGlzLl9pbml0Rm4oKTtcbiAgICB9XG5cbiAgICBfaW5pdEZuKCkge1xuICAgICAgICB0aGlzLnNldFRleHRVcGRhdGVDYWxsYmFjaygodGltZXN0YW1wKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuICAgICAgICAgICAgcmV0dXJuIG5vdy50b0lTT1N0cmluZygpLnN1YnN0cigxMSwgMTIpOyAvLyDQpNC+0YDQvNCw0YIg0LLRgNC10LzQtdC90Lgg0YEg0LzQuNC70LvQuNGB0LXQutGD0L3QtNCw0LzQuCAoSEg6bW06c3Muc3NzKVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQge01hdHJpeEVsZW1lbnR9IGZyb20gXCIuL01hdHJpeEVsZW1lbnRcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIER5bmFtaWNNb2RpZmllciB7XG4gICAgcHJvdGVjdGVkIGVsZW1lbnQ6IE1hdHJpeEVsZW1lbnQ7XG4gICAgZnJhbWVzUGVyU2Vjb25kOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBNYXRyaXhFbGVtZW50LCBmcmFtZXNQZXJTZWNvbmQ/OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5mcmFtZXNQZXJTZWNvbmQgPSBmcmFtZXNQZXJTZWNvbmRcbiAgICAgICAgZWxlbWVudC5hZGRNb2RpZmllcih0aGlzKVxuICAgIH1cblxuICAgIGFic3RyYWN0IGFwcGx5KHRpbWVzdGFtcDogbnVtYmVyKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIFJvdGF0aW9uTW9kaWZpZXIgZXh0ZW5kcyBEeW5hbWljTW9kaWZpZXIge1xuICAgIGFuZ2xlOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBNYXRyaXhFbGVtZW50LCBhbmdsZTogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLmFuZ2xlID0gYW5nbGU7XG4gICAgfVxuXG4gICAgYXBwbHkodGltZXN0YW1wOiBudW1iZXIpIHtcbiAgICAgICAgLy8g0JfQtNC10YHRjCDQvNC+0LbQvdC+INC/0YDQuNC80LXQvdC40YLRjCDQstGA0LDRidC10L3QuNC1INC00LvRjyDRgNCw0YHRh9C10YLQvtCyLCDQtdGB0LvQuCDRjdGC0L4g0LjQvNC10LXRgiDRgdC80YvRgdC7XG4gICAgICAgIGNvbnN0IHJvdGF0aW9uID0gdGhpcy5hbmdsZSAqICh0aW1lc3RhbXAgLyAxMDAwKTtcbiAgICAgICAgLy8g0J3QsNC/0YDQuNC80LXRgCwg0LzRiyDQvNC+0LbQtdC8INGB0L7RhdGA0LDQvdC40YLRjCDRg9Cz0L7QuyDQstGA0LDRidC10L3QuNGPINC40LvQuCDQtNGA0YPQs9GD0Y4g0LjQvdGE0L7RgNC80LDRhtC40Y4g0LIg0Y3Qu9C10LzQtdC90YLQtVxuICAgICAgICAvLyDQndC+INGN0YLQviDQsdGD0LTQtdGCINGH0LjRgdGC0L4g0LTQu9GPINC70L7Qs9C40LrQuCwg0L3QtSDQtNC70Y8g0L/RgNGP0LzQvtCz0L4g0YDQtdC90LTQtdGA0LjQvdCz0LAg0LIgRE9NXG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmFpbmJvd0VmZmVjdE1vZGlmaWVyIGV4dGVuZHMgRHluYW1pY01vZGlmaWVyIHtcbiAgICBwZXJpb2Q6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IE1hdHJpeEVsZW1lbnQsIHBlcmlvZDogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnBlcmlvZCA9IHBlcmlvZDtcbiAgICB9XG5cbiAgICBhcHBseSh0aW1lc3RhbXA6IG51bWJlcikge1xuICAgICAgICBjb25zdCBwaGFzZSA9ICh0aW1lc3RhbXAgJSB0aGlzLnBlcmlvZCkgLyB0aGlzLnBlcmlvZDtcbiAgICAgICAgY29uc3QgaHVlID0gTWF0aC5mbG9vcihwaGFzZSAqIDM2MCk7XG4gICAgICAgIHRoaXMuZWxlbWVudC51cGRhdGVUZXh0U3R5bGUoe2NvbG9yOiBgaHNsKCR7aHVlfSwgMTAwJSwgNTAlKWB9KTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFNjcm9sbGluZ1RleHRNb2RpZmllciBleHRlbmRzIER5bmFtaWNNb2RpZmllciB7XG4gICAgc3BlZWRQaXhlbHNQZXJTZWNvbmQ6IG51bWJlcjtcbiAgICBwcmV2aW91c1RpbWU6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogTWF0cml4RWxlbWVudCwgc3BlZWRQaXhlbHNQZXJTZWNvbmQ6IG51bWJlciwgZnJhbWVzUGVyU2Vjb25kOiBudW1iZXIpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgZnJhbWVzUGVyU2Vjb25kKTtcbiAgICAgICAgdGhpcy5zcGVlZFBpeGVsc1BlclNlY29uZCA9IHNwZWVkUGl4ZWxzUGVyU2Vjb25kO1xuICAgICAgICB0aGlzLnByZXZpb3VzVGltZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBhcHBseSh0aW1lc3RhbXA6IG51bWJlcikge1xuICAgICAgICBpZiAoIXRoaXMucHJldmlvdXNUaW1lKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzVGltZSA9IHRpbWVzdGFtcDtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC54ID0gdGhpcy5lbGVtZW50LndpZHRoO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LnggLT0gdGhpcy5zcGVlZFBpeGVsc1BlclNlY29uZCAqICh0aW1lc3RhbXAgLSB0aGlzLnByZXZpb3VzVGltZSkgLyAxMDAwO1xuICAgICAgICB0aGlzLnByZXZpb3VzVGltZSA9IHRpbWVzdGFtcDtcblxuICAgICAgICBpZiAodGhpcy5lbGVtZW50LnggKyB0aGlzLmVsZW1lbnQudGV4dFdpZHRoIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnggPSB0aGlzLmVsZW1lbnQud2lkdGg7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCbGlua01vZGlmaWVyIGV4dGVuZHMgRHluYW1pY01vZGlmaWVyIHtcbiAgICBhcHBseSh0aW1lc3RhbXA6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBsZXQgdCA9IHRpbWVzdGFtcCAlIDEwMDBcbiAgICAgICAgdGhpcy5lbGVtZW50LnZpc2libGUgPSB0IDwgNTAwXG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBTY2FsZU1vZGlmaWVyIGV4dGVuZHMgRHluYW1pY01vZGlmaWVyIHtcbiAgICBhcHBseSh0aW1lc3RhbXA6IG51bWJlcik6IHZvaWQge1xuICAgICAgICAvLyDQktGL0YfQuNGB0LvRj9C10Lwg0LzQsNGB0YjRgtCw0LEg0L3QsCDQvtGB0L3QvtCy0LUg0LLRgNC10LzQtdC90LhcbiAgICAgICAgbGV0IHQgPSAodGltZXN0YW1wICUgMjAwMCkgLyAyMDAwO1xuICAgICAgICBpZiAodCA+IDAuNSkgdCA9IDEgLSB0XG4gICAgICAgIHQgPSAxICsgdFxuXG4gICAgICAgIC8vINCf0YDQuNC80LXQvdGP0LXQvCDQvNCw0YHRiNGC0LDQsdC40YDQvtCy0LDQvdC40LUg0Log0Y3Qu9C10LzQtdC90YLRg1xuICAgICAgICB0aGlzLmVsZW1lbnQudXBkYXRlQWRkaXRpb25hbFN0eWxlcyh7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IGBzY2FsZSgke3R9KWBcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJztcblxuaW50ZXJmYWNlIFJlcG9ydEZpbHRlciB7XG4gICAgbWluVGltZT86IG51bWJlcjtcbiAgICB2aXNpdHM/OiBudW1iZXI7XG4gICAgcmVxdWlyZURlcGVuZGVuY2llcz86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBQb2ludFRyYWNrZXIge1xuICAgIHByaXZhdGUgcG9pbnRzOiBNYXA8c3RyaW5nLCBQb2ludERhdGE+O1xuICAgIHByaXZhdGUgbGFzdFRpbWVzdGFtcHM6IE1hcDxzdHJpbmcsIG51bWJlcj47XG4gICAgcHJpdmF0ZSBsYXN0UG9pbnQ6IHN0cmluZyB8IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wb2ludHMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMubGFzdFRpbWVzdGFtcHMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMubGFzdFBvaW50ID0gbnVsbDtcbiAgICB9XG5cbiAgICBwb2ludChwb2ludE5hbWU6IHN0cmluZywgY2hlY2tQb2ludHM/OiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gRGF0ZS5ub3coKTtcblxuICAgICAgICBpZiAoIXRoaXMucG9pbnRzLmhhcyhwb2ludE5hbWUpKSB7XG4gICAgICAgICAgICB0aGlzLnBvaW50cy5zZXQocG9pbnROYW1lLCBuZXcgUG9pbnREYXRhKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY3VycmVudFBvaW50RGF0YSA9IHRoaXMucG9pbnRzLmdldChwb2ludE5hbWUpITtcblxuICAgICAgICBpZiAodGhpcy5sYXN0VGltZXN0YW1wcy5oYXMocG9pbnROYW1lKSkge1xuICAgICAgICAgICAgY29uc3QgdGltZVNpbmNlTGFzdFZpc2l0ID0gY3VycmVudFRpbWUgLSB0aGlzLmxhc3RUaW1lc3RhbXBzLmdldChwb2ludE5hbWUpITtcbiAgICAgICAgICAgIGN1cnJlbnRQb2ludERhdGEudXBkYXRlSXRlcmF0aW9uVGltZSh0aW1lU2luY2VMYXN0VmlzaXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudFBvaW50RGF0YS5pbmNyZW1lbnRWaXNpdHMoKTtcblxuICAgICAgICBpZiAoY2hlY2tQb2ludHMpIHtcbiAgICAgICAgICAgIGNoZWNrUG9pbnRzLmZvckVhY2goKGNoZWNrUG9pbnROYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGFzdFRpbWVzdGFtcHMuaGFzKGNoZWNrUG9pbnROYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lU3BlbnQgPSBjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWVzdGFtcHMuZ2V0KGNoZWNrUG9pbnROYW1lKSE7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRQb2ludERhdGEudXBkYXRlVHJhbnNpdGlvbihjaGVja1BvaW50TmFtZSwgdGltZVNwZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxhc3RQb2ludCAhPT0gbnVsbCAmJiB0aGlzLmxhc3RQb2ludCAhPT0gcG9pbnROYW1lKSB7XG4gICAgICAgICAgICBjb25zdCB0aW1lU3BlbnQgPSBjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWVzdGFtcHMuZ2V0KHRoaXMubGFzdFBvaW50KSE7XG4gICAgICAgICAgICBjdXJyZW50UG9pbnREYXRhLnVwZGF0ZVRyYW5zaXRpb24odGhpcy5sYXN0UG9pbnQgKyBcIiAocHJldmlvdXMpXCIsIHRpbWVTcGVudCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxhc3RUaW1lc3RhbXBzLnNldChwb2ludE5hbWUsIGN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5sYXN0UG9pbnQgPSBwb2ludE5hbWU7XG4gICAgfVxuXG4gICAgcmVwb3J0KGZpbHRlcjogUmVwb3J0RmlsdGVyID0ge30pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCByZXBvcnRMaW5lczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgY29uc3QgbWluVGltZUZpbHRlciA9IGZpbHRlci5taW5UaW1lIHx8IDA7XG4gICAgICAgIGNvbnN0IG1pblZpc2l0c0ZpbHRlciA9IGZpbHRlci52aXNpdHMgfHwgMDtcbiAgICAgICAgY29uc3QgcmVxdWlyZURlcGVuZGVuY2llcyA9IGZpbHRlci5yZXF1aXJlRGVwZW5kZW5jaWVzIHx8IGZhbHNlO1xuXG4gICAgICAgIC8vINCk0LjQu9GM0YLRgNCw0YbQuNGPINGC0L7Rh9C10LpcbiAgICAgICAgdGhpcy5wb2ludHMuZm9yRWFjaCgoZGF0YSwgcG9pbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGF2Z1RpbWUgPSBkYXRhLmF2ZXJhZ2VJdGVyYXRpb25UaW1lKCk7XG5cbiAgICAgICAgICAgIGlmIChhdmdUaW1lID49IG1pblRpbWVGaWx0ZXIgJiYgZGF0YS50b3RhbFZpc2l0cyA+PSBtaW5WaXNpdHNGaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICAvLyDQpNC40LvRjNGC0YDQsNGG0LjRjyDQv9C10YDQtdGF0L7QtNC+0LJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWx0ZXJlZFRyYW5zaXRpb25zID0gbmV3IE1hcDxzdHJpbmcsIFRyYW5zaXRpb25EYXRhPigpO1xuXG4gICAgICAgICAgICAgICAgZGF0YS50cmFuc2l0aW9ucy5mb3JFYWNoKCh0cmFuc2l0aW9uRGF0YSwgZnJvbVBvaW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uRGF0YS5hdmVyYWdlVGltZSgpID49IG1pblRpbWVGaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkVHJhbnNpdGlvbnMuc2V0KGZyb21Qb2ludCwgdHJhbnNpdGlvbkRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyDQlNC+0LHQsNCy0LvQtdC90LjQtSDQsiDQvtGC0YfQtdGCINGC0L7Qu9GM0LrQviDQtdGB0LvQuCDQtdGB0YLRjCDQv9C10YDQtdGF0L7QtNGLINC40LvQuCDQvdC1INGC0YDQtdCx0YPQtdGC0YHRjyDQvtCx0Y/Qt9Cw0YLQtdC70YzQvdGL0YUg0LfQsNCy0LjRgdC40LzQvtGB0YLQtdC5XG4gICAgICAgICAgICAgICAgaWYgKCFyZXF1aXJlRGVwZW5kZW5jaWVzIHx8IGZpbHRlcmVkVHJhbnNpdGlvbnMuc2l6ZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRQb2ludFdpdGhGaWx0ZXJlZFRyYW5zaXRpb25zKHJlcG9ydExpbmVzLCBwb2ludCwgZGF0YSwgZmlsdGVyZWRUcmFuc2l0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVwb3J0TGluZXMuam9pbihcIlxcblwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZFBvaW50V2l0aEZpbHRlcmVkVHJhbnNpdGlvbnMoXG4gICAgICAgIHJlcG9ydExpbmVzOiBzdHJpbmdbXSxcbiAgICAgICAgcG9pbnQ6IHN0cmluZyxcbiAgICAgICAgZGF0YTogUG9pbnREYXRhLFxuICAgICAgICBmaWx0ZXJlZFRyYW5zaXRpb25zOiBNYXA8c3RyaW5nLCBUcmFuc2l0aW9uRGF0YT5cbiAgICApIHtcbiAgICAgICAgcmVwb3J0TGluZXMucHVzaChcbiAgICAgICAgICAgIGAke2NoYWxrLmdyZWVuKHBvaW50KX06IFZpc2l0cz0ke2RhdGEudG90YWxWaXNpdHN9LCBBdmdUaW1lPSR7Y2hhbGsucmVkKGRhdGEuYXZlcmFnZUl0ZXJhdGlvblRpbWUoKS50b0ZpeGVkKDIpKX1tc2BcbiAgICAgICAgKTtcblxuICAgICAgICBmaWx0ZXJlZFRyYW5zaXRpb25zLmZvckVhY2goKHRyYW5zaXRpb25EYXRhLCBmcm9tUG9pbnQpID0+IHtcbiAgICAgICAgICAgIHJlcG9ydExpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgYCAgJHtjaGFsay5jeWFuKGZyb21Qb2ludCl9IC0+ICR7Y2hhbGsuZ3JlZW4ocG9pbnQpfTogQ291bnQ9JHt0cmFuc2l0aW9uRGF0YS5jb3VudH0sIE1pbj0ke3RyYW5zaXRpb25EYXRhLm1pblRpbWUudG9GaXhlZCgyKX1tcywgTWF4PSR7dHJhbnNpdGlvbkRhdGEubWF4VGltZS50b0ZpeGVkKDIpfW1zLCBBdmc9JHtjaGFsay5yZWQodHJhbnNpdGlvbkRhdGEuYXZlcmFnZVRpbWUoKS50b0ZpeGVkKDIpKX1tc2BcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuY2xhc3MgUG9pbnREYXRhIHtcbiAgICB0b3RhbFZpc2l0czogbnVtYmVyO1xuICAgIHRvdGFsSXRlcmF0aW9uVGltZTogbnVtYmVyO1xuICAgIHRyYW5zaXRpb25zOiBNYXA8c3RyaW5nLCBUcmFuc2l0aW9uRGF0YT47XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy50b3RhbFZpc2l0cyA9IDA7XG4gICAgICAgIHRoaXMudG90YWxJdGVyYXRpb25UaW1lID0gMDtcbiAgICAgICAgdGhpcy50cmFuc2l0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICBpbmNyZW1lbnRWaXNpdHMoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudG90YWxWaXNpdHMgKz0gMTtcbiAgICB9XG5cbiAgICB1cGRhdGVJdGVyYXRpb25UaW1lKHRpbWVTcGVudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMudG90YWxJdGVyYXRpb25UaW1lICs9IHRpbWVTcGVudDtcbiAgICB9XG5cbiAgICBhdmVyYWdlSXRlcmF0aW9uVGltZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy50b3RhbFZpc2l0cyA+IDEgPyB0aGlzLnRvdGFsSXRlcmF0aW9uVGltZSAvICh0aGlzLnRvdGFsVmlzaXRzIC0gMSkgOiAwO1xuICAgIH1cblxuICAgIHVwZGF0ZVRyYW5zaXRpb24oZnJvbVBvaW50OiBzdHJpbmcsIHRpbWVTcGVudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy50cmFuc2l0aW9ucy5oYXMoZnJvbVBvaW50KSkge1xuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9ucy5zZXQoZnJvbVBvaW50LCBuZXcgVHJhbnNpdGlvbkRhdGEoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0cmFuc2l0aW9uRGF0YSA9IHRoaXMudHJhbnNpdGlvbnMuZ2V0KGZyb21Qb2ludCkhO1xuICAgICAgICB0cmFuc2l0aW9uRGF0YS51cGRhdGUodGltZVNwZW50KTtcbiAgICB9XG59XG5cbmNsYXNzIFRyYW5zaXRpb25EYXRhIHtcbiAgICBjb3VudDogbnVtYmVyO1xuICAgIHRvdGFsVGltZTogbnVtYmVyO1xuICAgIG1pblRpbWU6IG51bWJlcjtcbiAgICBtYXhUaW1lOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IDA7XG4gICAgICAgIHRoaXMudG90YWxUaW1lID0gMDtcbiAgICAgICAgdGhpcy5taW5UaW1lID0gSW5maW5pdHk7XG4gICAgICAgIHRoaXMubWF4VGltZSA9IDA7XG4gICAgfVxuXG4gICAgdXBkYXRlKHRpbWVTcGVudDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY291bnQgKz0gMTtcbiAgICAgICAgdGhpcy50b3RhbFRpbWUgKz0gdGltZVNwZW50O1xuICAgICAgICB0aGlzLm1pblRpbWUgPSBNYXRoLm1pbih0aGlzLm1pblRpbWUsIHRpbWVTcGVudCk7XG4gICAgICAgIHRoaXMubWF4VGltZSA9IE1hdGgubWF4KHRoaXMubWF4VGltZSwgdGltZVNwZW50KTtcbiAgICB9XG5cbiAgICBhdmVyYWdlVGltZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5jb3VudCA+IDAgPyB0aGlzLnRvdGFsVGltZSAvIHRoaXMuY291bnQgOiAwO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBNdXRleCB7XG4gICAgc3RhdGljIGxvZ0FsbG93ZWQgPSB0cnVlXG4gICAgcHJpdmF0ZSBfcXVldWU6ICgoKSA9PiB2b2lkKVtdID0gW107XG4gICAgcHJpdmF0ZSBfbG9jayA9IGZhbHNlO1xuXG4gICAgbG9jayhsb2dNc2c/OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKE11dGV4LmxvZ0FsbG93ZWQgJiYgbG9nTXNnKSBjb25zb2xlLmxvZyhcIk11dGV4IGxvY2s6IFwiLCBsb2dNc2csICF0aGlzLl9sb2NrKVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcykgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9sb2NrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9jayA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmVzKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX3F1ZXVlLnB1c2gocmVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdHJ5TG9jayhsb2dNc2c/OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuX2xvY2spIHtcbiAgICAgICAgICAgIC8vINCV0YHQu9C4INC80YzRjtGC0LXQutGBINGD0LbQtSDQt9Cw0LvQvtGH0LXQvSwg0LLQvtC30LLRgNCw0YnQsNC10LwgZmFsc2VcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vINCV0YHQu9C4INC80YzRjtGC0LXQutGBINGB0LLQvtCx0L7QtNC10L0sINC70L7Rh9C40Lwg0LXQs9C+INC4INCy0L7Qt9Cy0YDQsNGJ0LDQtdC8IHRydWVcbiAgICAgICAgICAgIHRoaXMuX2xvY2sgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKE11dGV4LmxvZ0FsbG93ZWQgJiYgbG9nTXNnKSBjb25zb2xlLmxvZyhcIk11dGV4IHRyeUxvY2sgc3VjY2Vzc2Z1bDogXCIsIGxvZ01zZyk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgdW5sb2NrKGxvZ01zZz86IHN0cmluZykge1xuICAgICAgICBpZiAoTXV0ZXgubG9nQWxsb3dlZCAmJiBsb2dNc2cpIGNvbnNvbGUubG9nKFwiTXV0ZXggdW5Mb2NrOiBcIiwgbG9nTXNnKVxuICAgICAgICBpZiAodGhpcy5fcXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZnVuYyA9IHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICBpZiAoZnVuYykgZnVuYygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbG9jayA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufSIsImltcG9ydCB7V29ya2VyTWFuYWdlciBhcyBCYXNlV29ya2VyTWFuYWdlcn0gZnJvbSBcIndvcmtlci10aHJlYWRzLW1hbmFnZXIvZGlzdC9zcmNcIjtcbmltcG9ydCB7SGFuZGxlcnN9IGZyb20gXCIuL3dvcmtlclwiO1xuaW1wb3J0IHtyZXNvbHZlfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IFdlYlNvY2tldCwge1NlcnZlcn0gZnJvbSBcIndzXCI7XG5pbXBvcnQge1BvaW50VHJhY2tlcn0gZnJvbSBcIkBzZXJ2ZXIvUG9pbnRUcmFja2VyXCI7XG5pbXBvcnQge01hdHJpeH0gZnJvbSBcIi4uLy4uL01hdHJpeC9zcmMvTWF0cml4XCI7XG5pbXBvcnQge1NlckRlfSBmcm9tIFwic2VyZGUtdHNcIjtcbmltcG9ydCB7TWF0cml4RWxlbWVudCwgVGltZU1hdHJpeEVsZW1lbnR9IGZyb20gXCIuLi8uLi9NYXRyaXgvc3JjL01hdHJpeEVsZW1lbnRcIjtcbmltcG9ydCB7XG4gICAgUmFpbmJvd0VmZmVjdE1vZGlmaWVyLFxuICAgIFJvdGF0aW9uTW9kaWZpZXIsXG4gICAgU2NhbGVNb2RpZmllcixcbiAgICBTY3JvbGxpbmdUZXh0TW9kaWZpZXJcbn0gZnJvbSBcIi4uLy4uL01hdHJpeC9zcmMvTW9kaWZpZXJzXCI7XG5pbXBvcnQge011dGV4fSBmcm9tIFwiQHNlcnZlci9tdXRleFwiO1xuaW1wb3J0ICogYXMgcHJvY2VzcyBmcm9tIFwibm9kZTpwcm9jZXNzXCI7XG5cbmxldCBpID0gMDtcbmxldCBjbGllbnRDb3VudGVyID0gMDtcbmxldCBjbGllbnRzOiBXZWJTb2NrZXRbXSA9IFtdO1xubGV0IHRyYWNrZXIgPSBuZXcgUG9pbnRUcmFja2VyKCk7XG5sZXQgbXV0ZXggPSBuZXcgTXV0ZXgoKTtcblxuY2xhc3MgV29ya2VyTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBtYW5hZ2VyOiBCYXNlV29ya2VyTWFuYWdlcjxIYW5kbGVycz47XG4gICAgY3VycmVudFdvcmtlcklkOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBwb3J0cyA9IFs4MDg1LCA4MDg2XTtcbiAgICBwcml2YXRlIGN1cnJlbnRQb3J0SW5kZXggPSAwO1xuICAgIHByaXZhdGUgaW50ZXJ2YWw6IE5vZGVKUy5UaW1lb3V0IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgdGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBvbGRXb3JrZXJJZDogdW5kZWZpbmVkIHwgbnVtYmVyID0gdW5kZWZpbmVkO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMubWFuYWdlciA9IG5ldyBCYXNlV29ya2VyTWFuYWdlcjxIYW5kbGVycz4oKTtcbiAgICB9XG5cbiAgICBhc3luYyBjcmVhdGVXb3JrZXIoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgdGhpcy5jdXJyZW50UG9ydEluZGV4ID0gMSAtIHRoaXMuY3VycmVudFBvcnRJbmRleDsgIC8vIEFsdGVybmF0ZSBiZXR3ZWVuIDgwODUgYW5kIDgwODZcbiAgICAgICAgY29uc3QgcG9ydCA9IHRoaXMucG9ydHNbdGhpcy5jdXJyZW50UG9ydEluZGV4XTtcblxuICAgICAgICBjb25zdCB3b3JrZXJJZCA9IGF3YWl0IHRoaXMubWFuYWdlci5jcmVhdGVXb3JrZXJXaXRoSGFuZGxlcnMocmVzb2x2ZShfX2Rpcm5hbWUsICd3b3JrZXIuanMnKSk7XG4gICAgICAgIGF3YWl0IHRoaXMubWFuYWdlci5jYWxsKHdvcmtlcklkLCBcImluaXRpYWxpemVQYWdlXCIsIHBvcnQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgV29ya2VyIHdpdGggSUQgJHt3b3JrZXJJZH0gY3JlYXRlZCBvbiBwb3J0ICR7cG9ydH0uYCk7XG4gICAgICAgIHRoaXMub2xkV29ya2VySWQgPSB0aGlzLmN1cnJlbnRXb3JrZXJJZFxuICAgICAgICB0aGlzLmN1cnJlbnRXb3JrZXJJZCA9IHdvcmtlcklkXG4gICAgICAgIHJldHVybiB3b3JrZXJJZDtcbiAgICB9XG5cbiAgICBhc3luYyBzd2FwV29ya2VycygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdvcmtlcklkID09PSB1bmRlZmluZWQpIHJldHVyblxuXG4gICAgICAgIGlmICh0aGlzLm9sZFdvcmtlcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGF3YWl0IG11dGV4LmxvY2soKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFN3YXBwaW5nIGZyb20gd29ya2VyIElEICR7dGhpcy5vbGRXb3JrZXJJZH0gdG8gJHt0aGlzLmN1cnJlbnRXb3JrZXJJZH1gKTtcblxuICAgICAgICAgICAgICAgIC8vIFRyYW5zZmVyIHN0YXRlIGZyb20gb2xkIHdvcmtlciB0byBuZXcgd29ya2VyXG4gICAgICAgICAgICAgICAgY29uc3Qgc25hcHNob3Q6IHN0cmluZyA9IGF3YWl0IHRoaXMubWFuYWdlci5jYWxsKHRoaXMub2xkV29ya2VySWQsICdnZXRTbmFwc2hvdCcpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMubWFuYWdlci5jYWxsKHRoaXMuY3VycmVudFdvcmtlcklkLCAnc2V0U25hcHNob3QnLCBzbmFwc2hvdCk7XG5cbiAgICAgICAgICAgICAgICAvLyBDYW5jZWwgYWxsIHRhc2tzIHJlbGF0ZWQgdG8gdGhlIG9sZCB3b3JrZXIgYW5kIGNsb3NlIFdlYlNvY2tldCBzZXJ2ZXJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1hbmFnZXIuY2FsbCh0aGlzLm9sZFdvcmtlcklkLCAnY2xvc2VXZWJTb2NrZXRTZXJ2ZXInKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1hbmFnZXIudGVybWluYXRlV29ya2VyKHRoaXMub2xkV29ya2VySWQpO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBtdXRleC51bmxvY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhcnRSZW5kZXJpbmdQcm9jZXNzKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBXb3JrZXIgSUQgJHt0aGlzLmN1cnJlbnRXb3JrZXJJZH0gaXMgbm93IHRoZSBhY3RpdmUgd29ya2VyLmApO1xuICAgIH1cblxuICAgIGFzeW5jIHVwZGF0ZU1hdHJpeCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdvcmtlcklkID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgYXdhaXQgbXV0ZXgubG9jaygpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IG1hdHJpeDogTWF0cml4ID0gU2VyRGUuZGVzZXJpYWxpemUoYXdhaXQgdGhpcy5tYW5hZ2VyLmNhbGwodGhpcy5jdXJyZW50V29ya2VySWQsICdnZXRTbmFwc2hvdCcpKTtcbiAgICAgICAgICAgIG1hdHJpeC5lbGVtZW50c1sxXS5zZXRUZXh0KChpKyspLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5tYW5hZ2VyLmNhbGwodGhpcy5jdXJyZW50V29ya2VySWQsICdzZXRTbmFwc2hvdCcsIFNlckRlLnNlcmlhbGlzZShtYXRyaXgpKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIG11dGV4LnVubG9jaygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jIHN0YXJ0UmVuZGVyaW5nUHJvY2VzcygpOiBQcm9taXNlPHZvaWQ+IHtcblxuICAgICAgICBpZiAoIXRoaXMuaW50ZXJ2YWwpXG4gICAgICAgICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwodGhpcy51cGRhdGVNYXRyaXguYmluZCh0aGlzKSwgMTAwMClcblxuICAgICAgICBjb25zdCBwcm9jZXNzRnJhbWVHcm91cCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IG11dGV4LmxvY2soKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFdvcmtlcklkICE9PSB1bmRlZmluZWQpIHsgLy8gRW5zdXJlIHdvcmtlciBpcyBzdGlsbCB2YWxpZFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2FsbGluZyB3b3JrZXIgd2l0aCBJRDogJHt0aGlzLmN1cnJlbnRXb3JrZXJJZH0sIG1ldGhvZDogZ2VuZXJhdGVOZXh0RnJhbWVHcm91cGApO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZnJhbWVHcm91cCA9IGF3YWl0IHRoaXMubWFuYWdlci5jYWxsKHRoaXMuY3VycmVudFdvcmtlcklkLCAnZ2VuZXJhdGVOZXh0RnJhbWVHcm91cCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZnJhbWVHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY2xpZW50IG9mIGNsaWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnQuc2VuZChKU09OLnN0cmluZ2lmeShmcmFtZUdyb3VwKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGV0IG5leHRUaW1lb3V0ID0gZnJhbWVHcm91cCEuc3RhcnRUaW1lIC0gRGF0ZS5ub3coKSAtIDMwMDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudGltZW91dCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChwcm9jZXNzRnJhbWVHcm91cCwgTWF0aC5tYXgobmV4dFRpbWVvdXQsIDApKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBXb3JrZXIgd2l0aCBJRCAke3RoaXMuY3VycmVudFdvcmtlcklkfSBpcyBubyBsb25nZXIgdmFsaWQgZHVyaW5nIHByb2Nlc3NGcmFtZUdyb3VwLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgbXV0ZXgudW5sb2NrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU3RhcnQgZnJhbWUgcHJvY2Vzc2luZyBhbmQgbWF0cml4IHVwZGF0ZXMgaW1tZWRpYXRlbHlcbiAgICAgICAgYXdhaXQgcHJvY2Vzc0ZyYW1lR3JvdXAoKTtcbiAgICB9XG5cbiAgICBhc3luYyBzdGFydE5ld1dvcmtlckFuZFN3YXAoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuY3JlYXRlV29ya2VyKCk7XG4gICAgICAgIGF3YWl0IHRoaXMuc3dhcFdvcmtlcnMoKTsgIC8vIFN3YXAgYWZ0ZXIgbmV3IHdvcmtlciBpcyBmdWxseSByZWFkeVxuICAgIH1cbn1cblxuKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgbWFuYWdlciA9IG5ldyBXb3JrZXJNYW5hZ2VyKCk7XG4gICAgICAgIGF3YWl0IG1hbmFnZXIuY3JlYXRlV29ya2VyKCk7XG4gICAgICAgIG1hbmFnZXIuc3RhcnRSZW5kZXJpbmdQcm9jZXNzKClcbiAgICAgICAgd2hpbGUgKDEpIHtcbiAgICAgICAgICAgIGF3YWl0IG1hbmFnZXIuc3RhcnROZXdXb3JrZXJBbmRTd2FwKClcbiAgICAgICAgfVxuICAgIH1cbikoKTtcblxuXG4oYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHdzcyA9IG5ldyBTZXJ2ZXIoe3BvcnQ6IDgwODN9KTsgIC8vIE9ubHkgb25lIGluc3RhbmNlIG9mIHRoZSBXZWJTb2NrZXQgc2VydmVyXG4gICAgd3NzLm9uKCdjb25uZWN0aW9uJywgKHdzOiBXZWJTb2NrZXQpID0+IHtcbiAgICAgICAgY29uc3QgY2xpZW50SWQgPSArK2NsaWVudENvdW50ZXI7XG4gICAgICAgIGNsaWVudHMucHVzaCh3cyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBDbGllbnQgY29ubmVjdGVkOiAke2NsaWVudElkfWApO1xuICAgICAgICB0cmFja2VyLnBvaW50KCdjbGllbnQtY29ubmVjdGVkJyk7XG5cbiAgICAgICAgd3Mub25jZSgnY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICBjbGllbnRzID0gY2xpZW50cy5maWx0ZXIoKGNsaWVudCkgPT4gY2xpZW50ICE9PSB3cyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2xpZW50IGRpc2Nvbm5lY3RlZDogJHtjbGllbnRJZH1gKTtcbiAgICAgICAgICAgIHRyYWNrZXIucG9pbnQoJ2NsaWVudC1kaXNjb25uZWN0ZWQnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgd3Mub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBXZWJTb2NrZXQgZXJyb3Igd2l0aCBjbGllbnQgJHtjbGllbnRJZH06YCwgZXJyb3IpO1xuICAgICAgICAgICAgdHJhY2tlci5wb2ludCgnZXJyb3Itb2NjdXJyZWQnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBSZWdpc3RlciBjbGFzc2VzIGZvciBzZXJpYWxpemF0aW9uL2Rlc2VyaWFsaXphdGlvblxuICAgIFNlckRlLmNsYXNzUmVnaXN0cmF0aW9uKFtcbiAgICAgICAgTWF0cml4LCBNYXRyaXhFbGVtZW50LCBUaW1lTWF0cml4RWxlbWVudCwgU2Nyb2xsaW5nVGV4dE1vZGlmaWVyLCBTY2FsZU1vZGlmaWVyLCBSYWluYm93RWZmZWN0TW9kaWZpZXJcbiAgICBdKTtcbn0pKCk7XG5cbnNldEludGVydmFsKCgpID0+IHtcbiAgICBjb25zdCBmb3JtYXRNZW1vcnlVc2FnZSA9IChkYXRhOiBhbnkpID0+IGAke01hdGgucm91bmQoZGF0YSAvIDEwMjQgLyAxMDI0ICogMTAwKSAvIDEwMH0gTUJgO1xuXG4gICAgY29uc3QgbWVtb3J5RGF0YSA9IHByb2Nlc3MubWVtb3J5VXNhZ2UoKTtcblxuICAgIGNvbnN0IG1lbW9yeVVzYWdlID0ge1xuICAgICAgICByc3M6IGAke2Zvcm1hdE1lbW9yeVVzYWdlKG1lbW9yeURhdGEucnNzKX0gLT4gUmVzaWRlbnQgU2V0IFNpemUgLSB0b3RhbCBtZW1vcnkgYWxsb2NhdGVkIGZvciB0aGUgcHJvY2VzcyBleGVjdXRpb25gLFxuICAgICAgICBoZWFwVG90YWw6IGAke2Zvcm1hdE1lbW9yeVVzYWdlKG1lbW9yeURhdGEuaGVhcFRvdGFsKX0gLT4gdG90YWwgc2l6ZSBvZiB0aGUgYWxsb2NhdGVkIGhlYXBgLFxuICAgICAgICBoZWFwVXNlZDogYCR7Zm9ybWF0TWVtb3J5VXNhZ2UobWVtb3J5RGF0YS5oZWFwVXNlZCl9IC0+IGFjdHVhbCBtZW1vcnkgdXNlZCBkdXJpbmcgdGhlIGV4ZWN1dGlvbmAsXG4gICAgICAgIGV4dGVybmFsOiBgJHtmb3JtYXRNZW1vcnlVc2FnZShtZW1vcnlEYXRhLmV4dGVybmFsKX0gLT4gVjggZXh0ZXJuYWwgbWVtb3J5YCxcbiAgICB9O1xuXG4gICAgY29uc29sZS5sb2cobWVtb3J5VXNhZ2UpO1xufSwgMTAwMDApXG5cblxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuV29ya2VyQ29udHJvbGxlciA9IHZvaWQgMDtcbmNvbnN0IHdvcmtlcl90aHJlYWRzXzEgPSByZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIik7XG5jb25zdCBzZXJkZV90c18xID0gcmVxdWlyZShcInNlcmRlLXRzXCIpO1xuY2xhc3MgV29ya2VyQ29udHJvbGxlciB7XG4gICAgc3RhdGljIGluaXRpYWxpemUoaGFuZGxlcnMpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVycyA9IGhhbmRsZXJzO1xuICAgICAgICAvLyBTZW5kIGluaXRpYWxpemF0aW9uIGFja25vd2xlZGdtZW50IHdoZW4gdGhlIHdvcmtlciBpcyBmdWxseSByZWFkeVxuICAgICAgICBjb25zdCBpbml0QWNrID0geyB0eXBlOiAnaW5pdGlhbGl6YXRpb24nIH07XG4gICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShpbml0QWNrKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAod29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0KSB7XG4gICAgICAgICAgICB3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQub24oJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZU1lc3NhZ2UoZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAncmVxdWVzdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0KG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbm90aWZpY2F0aW9uJzpcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZU5vdGlmaWNhdGlvbihtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBVbmtub3duIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGhhbmRsZVJlcXVlc3QobWVzc2FnZSkge1xuICAgICAgICBjb25zdCB7IHJlcXVlc3RJZCwgcGF5bG9hZCB9ID0gbWVzc2FnZTtcbiAgICAgICAgY29uc3QgeyBtZXRob2ROYW1lLCBhcmdzIH0gPSBzZXJkZV90c18xLlNlckRlLmRlc2VyaWFsaXplKHBheWxvYWQpO1xuICAgICAgICBpZiAodGhpcy5oYW5kbGVycyAmJiB0eXBlb2YgdGhpcy5oYW5kbGVyc1ttZXRob2ROYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBzZXJkZV90c18xLlNlckRlLnNlcmlhbGlzZShhd2FpdCB0aGlzLmhhbmRsZXJzW21ldGhvZE5hbWVdKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB7IHR5cGU6ICdyZXNwb25zZScsIHJlcXVlc3RJZCwgcmVzdWx0IH07XG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geyB0eXBlOiAncmVzcG9uc2UnLCByZXF1ZXN0SWQsIGVycm9yIH07XG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3Jlc3BvbnNlJyxcbiAgICAgICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICAgICAgcmVzdWx0OiBuZXcgRXJyb3IoYE1ldGhvZCAke21ldGhvZE5hbWV9IG5vdCBmb3VuZCBvbiBoYW5kbGVyc2ApXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydCkge1xuICAgICAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGhhbmRsZU5vdGlmaWNhdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IHsgbWV0aG9kTmFtZSwgYXJncyB9ID0gbWVzc2FnZS5wYXlsb2FkO1xuICAgICAgICBpZiAodGhpcy5oYW5kbGVycyAmJiB0eXBlb2YgdGhpcy5oYW5kbGVyc1ttZXRob2ROYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZXJzW21ldGhvZE5hbWVdKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaGFuZGxpbmcgbm90aWZpY2F0aW9uOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBoYW5kbGluZyBub3RpZmljYXRpb246IHVua25vd24gZXJyb3InKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYE5vdGlmaWNhdGlvbiBtZXRob2QgJHttZXRob2ROYW1lfSBub3QgZm91bmQgb24gaGFuZGxlcnNgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgcmVnaXN0ZXJDbGFzc2VzKGNsYXNzZXMpIHtcbiAgICAgICAgc2VyZGVfdHNfMS5TZXJEZS5jbGFzc1JlZ2lzdHJhdGlvbihjbGFzc2VzKTtcbiAgICB9XG59XG5leHBvcnRzLldvcmtlckNvbnRyb2xsZXIgPSBXb3JrZXJDb250cm9sbGVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9V29ya2VyQ29udHJvbGxlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuV29ya2VyTWFuYWdlciA9IHZvaWQgMDtcbmNvbnN0IHdvcmtlcl90aHJlYWRzXzEgPSByZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIik7XG5jb25zdCBzZXJkZV90c18xID0gcmVxdWlyZShcInNlcmRlLXRzXCIpO1xuY2xhc3MgV29ya2VyTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IodGltZW91dCA9IDIgKiogMzEgLSAxKSB7XG4gICAgICAgIHRoaXMud29ya2VycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5yZXF1ZXN0SWRDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy53b3JrZXJJZENvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gdGltZW91dDtcbiAgICB9XG4gICAgYXN5bmMgY3JlYXRlV29ya2VyV2l0aEhhbmRsZXJzKHdvcmtlckZpbGUpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gbmV3IHdvcmtlcl90aHJlYWRzXzEuV29ya2VyKHdvcmtlckZpbGUpO1xuICAgICAgICBjb25zdCB3b3JrZXJJZCA9ICsrdGhpcy53b3JrZXJJZENvdW50ZXI7XG4gICAgICAgIHRoaXMud29ya2Vycy5zZXQod29ya2VySWQsIHdvcmtlcik7XG4gICAgICAgIHdvcmtlci5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1lc3NhZ2UobWVzc2FnZSwgd29ya2VySWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5zZXQod29ya2VySWQsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTsgLy8gQ2xlYXIgdGltZW91dCBvbiBzdWNjZXNzXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh3b3JrZXJJZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuaGFzKHdvcmtlcklkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuZGVsZXRlKHdvcmtlcklkKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignV29ya2VyIGluaXRpYWxpemF0aW9uIHRpbWVkIG91dCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzLnRpbWVvdXQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaGFuZGxlTWVzc2FnZShtZXNzYWdlLCB3b3JrZXJJZCkge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnaW5pdGlhbGl6YXRpb24nOlxuICAgICAgICAgICAgICAgIGNvbnN0IGluaXRIYW5kbGVyID0gdGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzLmdldCh3b3JrZXJJZCk7XG4gICAgICAgICAgICAgICAgaWYgKGluaXRIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRIYW5kbGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5kZWxldGUod29ya2VySWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Jlc3BvbnNlJzpcbiAgICAgICAgICAgICAgICBjb25zdCB7IHJlcXVlc3RJZCwgcmVzdWx0IH0gPSBtZXNzYWdlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlSGFuZGxlciA9IHRoaXMucmVzcG9uc2VIYW5kbGVycy5nZXQocmVxdWVzdElkKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlSGFuZGxlcihzZXJkZV90c18xLlNlckRlLmRlc2VyaWFsaXplKHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMuZGVsZXRlKHJlcXVlc3RJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbm90aWZpY2F0aW9uJzpcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgbm90aWZpY2F0aW9ucyBpZiBuZWNlc3NhcnlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgY2FsbCh3b3JrZXJJZCwgbWV0aG9kTmFtZSwgLi4uYXJncykge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSB0aGlzLndvcmtlcnMuZ2V0KHdvcmtlcklkKTtcbiAgICAgICAgaWYgKCF3b3JrZXIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV29ya2VyIHdpdGggSUQgJHt3b3JrZXJJZH0gbm90IGZvdW5kYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVxdWVzdElkID0gKyt0aGlzLnJlcXVlc3RJZENvdW50ZXI7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICB0eXBlOiAncmVxdWVzdCcsXG4gICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICBwYXlsb2FkOiBzZXJkZV90c18xLlNlckRlLnNlcmlhbGlzZSh7IG1ldGhvZE5hbWUsIGFyZ3MgfSlcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzcG9uc2VIYW5kbGVycy5kZWxldGUocmVxdWVzdElkKTtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdSZXF1ZXN0IHRpbWVkIG91dCcpKTtcbiAgICAgICAgICAgIH0sIHRoaXMudGltZW91dCk7XG4gICAgICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMuc2V0KHJlcXVlc3RJZCwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpOyAvLyBDbGVhciB0aW1lb3V0IG9uIHN1Y2Nlc3NcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShyZXF1ZXN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNlbmROb3RpZmljYXRpb24od29ya2VySWQsIG1ldGhvZE5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gdGhpcy53b3JrZXJzLmdldCh3b3JrZXJJZCk7XG4gICAgICAgIGlmICghd29ya2VyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdvcmtlciB3aXRoIElEICR7d29ya2VySWR9IG5vdCBmb3VuZGApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdub3RpZmljYXRpb24nLFxuICAgICAgICAgICAgcGF5bG9hZDogeyBtZXRob2ROYW1lLCBhcmdzIH1cbiAgICAgICAgfTtcbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKG5vdGlmaWNhdGlvbik7XG4gICAgfVxuICAgIGFzeW5jIHRlcm1pbmF0ZVdvcmtlcih3b3JrZXJJZCkge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSB0aGlzLndvcmtlcnMuZ2V0KHdvcmtlcklkKTtcbiAgICAgICAgaWYgKHdvcmtlcikge1xuICAgICAgICAgICAgYXdhaXQgd29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgICAgICAgdGhpcy53b3JrZXJzLmRlbGV0ZSh3b3JrZXJJZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVnaXN0ZXJDbGFzc2VzKGNsYXNzZXMpIHtcbiAgICAgICAgc2VyZGVfdHNfMS5TZXJEZS5jbGFzc1JlZ2lzdHJhdGlvbihjbGFzc2VzKTtcbiAgICB9XG59XG5leHBvcnRzLldvcmtlck1hbmFnZXIgPSBXb3JrZXJNYW5hZ2VyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9V29ya2VyTWFuYWdlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19leHBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2V4cG9ydFN0YXIpIHx8IGZ1bmN0aW9uKG0sIGV4cG9ydHMpIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4cG9ydHMsIHApKSBfX2NyZWF0ZUJpbmRpbmcoZXhwb3J0cywgbSwgcCk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL1dvcmtlck1hbmFnZXJcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL1dvcmtlckNvbnRyb2xsZXJcIiksIGV4cG9ydHMpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwid3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZTpvc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJub2RlOnByb2Nlc3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZTp0dHlcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGF0aFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKTsiLCJpbXBvcnQgYW5zaVN0eWxlcyBmcm9tICcjYW5zaS1zdHlsZXMnO1xuaW1wb3J0IHN1cHBvcnRzQ29sb3IgZnJvbSAnI3N1cHBvcnRzLWNvbG9yJztcbmltcG9ydCB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L29yZGVyXG5cdHN0cmluZ1JlcGxhY2VBbGwsXG5cdHN0cmluZ0VuY2FzZUNSTEZXaXRoRmlyc3RJbmRleCxcbn0gZnJvbSAnLi91dGlsaXRpZXMuanMnO1xuXG5jb25zdCB7c3Rkb3V0OiBzdGRvdXRDb2xvciwgc3RkZXJyOiBzdGRlcnJDb2xvcn0gPSBzdXBwb3J0c0NvbG9yO1xuXG5jb25zdCBHRU5FUkFUT1IgPSBTeW1ib2woJ0dFTkVSQVRPUicpO1xuY29uc3QgU1RZTEVSID0gU3ltYm9sKCdTVFlMRVInKTtcbmNvbnN0IElTX0VNUFRZID0gU3ltYm9sKCdJU19FTVBUWScpO1xuXG4vLyBgc3VwcG9ydHNDb2xvci5sZXZlbGAg4oaSIGBhbnNpU3R5bGVzLmNvbG9yW25hbWVdYCBtYXBwaW5nXG5jb25zdCBsZXZlbE1hcHBpbmcgPSBbXG5cdCdhbnNpJyxcblx0J2Fuc2knLFxuXHQnYW5zaTI1NicsXG5cdCdhbnNpMTZtJyxcbl07XG5cbmNvbnN0IHN0eWxlcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbmNvbnN0IGFwcGx5T3B0aW9ucyA9IChvYmplY3QsIG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRpZiAob3B0aW9ucy5sZXZlbCAmJiAhKE51bWJlci5pc0ludGVnZXIob3B0aW9ucy5sZXZlbCkgJiYgb3B0aW9ucy5sZXZlbCA+PSAwICYmIG9wdGlvbnMubGV2ZWwgPD0gMykpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1RoZSBgbGV2ZWxgIG9wdGlvbiBzaG91bGQgYmUgYW4gaW50ZWdlciBmcm9tIDAgdG8gMycpO1xuXHR9XG5cblx0Ly8gRGV0ZWN0IGxldmVsIGlmIG5vdCBzZXQgbWFudWFsbHlcblx0Y29uc3QgY29sb3JMZXZlbCA9IHN0ZG91dENvbG9yID8gc3Rkb3V0Q29sb3IubGV2ZWwgOiAwO1xuXHRvYmplY3QubGV2ZWwgPSBvcHRpb25zLmxldmVsID09PSB1bmRlZmluZWQgPyBjb2xvckxldmVsIDogb3B0aW9ucy5sZXZlbDtcbn07XG5cbmV4cG9ydCBjbGFzcyBDaGFsayB7XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc3RydWN0b3ItcmV0dXJuXG5cdFx0cmV0dXJuIGNoYWxrRmFjdG9yeShvcHRpb25zKTtcblx0fVxufVxuXG5jb25zdCBjaGFsa0ZhY3RvcnkgPSBvcHRpb25zID0+IHtcblx0Y29uc3QgY2hhbGsgPSAoLi4uc3RyaW5ncykgPT4gc3RyaW5ncy5qb2luKCcgJyk7XG5cdGFwcGx5T3B0aW9ucyhjaGFsaywgb3B0aW9ucyk7XG5cblx0T2JqZWN0LnNldFByb3RvdHlwZU9mKGNoYWxrLCBjcmVhdGVDaGFsay5wcm90b3R5cGUpO1xuXG5cdHJldHVybiBjaGFsaztcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUNoYWxrKG9wdGlvbnMpIHtcblx0cmV0dXJuIGNoYWxrRmFjdG9yeShvcHRpb25zKTtcbn1cblxuT2JqZWN0LnNldFByb3RvdHlwZU9mKGNyZWF0ZUNoYWxrLnByb3RvdHlwZSwgRnVuY3Rpb24ucHJvdG90eXBlKTtcblxuZm9yIChjb25zdCBbc3R5bGVOYW1lLCBzdHlsZV0gb2YgT2JqZWN0LmVudHJpZXMoYW5zaVN0eWxlcykpIHtcblx0c3R5bGVzW3N0eWxlTmFtZV0gPSB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0Y29uc3QgYnVpbGRlciA9IGNyZWF0ZUJ1aWxkZXIodGhpcywgY3JlYXRlU3R5bGVyKHN0eWxlLm9wZW4sIHN0eWxlLmNsb3NlLCB0aGlzW1NUWUxFUl0pLCB0aGlzW0lTX0VNUFRZXSk7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgc3R5bGVOYW1lLCB7dmFsdWU6IGJ1aWxkZXJ9KTtcblx0XHRcdHJldHVybiBidWlsZGVyO1xuXHRcdH0sXG5cdH07XG59XG5cbnN0eWxlcy52aXNpYmxlID0ge1xuXHRnZXQoKSB7XG5cdFx0Y29uc3QgYnVpbGRlciA9IGNyZWF0ZUJ1aWxkZXIodGhpcywgdGhpc1tTVFlMRVJdLCB0cnVlKTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Zpc2libGUnLCB7dmFsdWU6IGJ1aWxkZXJ9KTtcblx0XHRyZXR1cm4gYnVpbGRlcjtcblx0fSxcbn07XG5cbmNvbnN0IGdldE1vZGVsQW5zaSA9IChtb2RlbCwgbGV2ZWwsIHR5cGUsIC4uLmFyZ3VtZW50c18pID0+IHtcblx0aWYgKG1vZGVsID09PSAncmdiJykge1xuXHRcdGlmIChsZXZlbCA9PT0gJ2Fuc2kxNm0nKSB7XG5cdFx0XHRyZXR1cm4gYW5zaVN0eWxlc1t0eXBlXS5hbnNpMTZtKC4uLmFyZ3VtZW50c18pO1xuXHRcdH1cblxuXHRcdGlmIChsZXZlbCA9PT0gJ2Fuc2kyNTYnKSB7XG5cdFx0XHRyZXR1cm4gYW5zaVN0eWxlc1t0eXBlXS5hbnNpMjU2KGFuc2lTdHlsZXMucmdiVG9BbnNpMjU2KC4uLmFyZ3VtZW50c18pKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYW5zaVN0eWxlc1t0eXBlXS5hbnNpKGFuc2lTdHlsZXMucmdiVG9BbnNpKC4uLmFyZ3VtZW50c18pKTtcblx0fVxuXG5cdGlmIChtb2RlbCA9PT0gJ2hleCcpIHtcblx0XHRyZXR1cm4gZ2V0TW9kZWxBbnNpKCdyZ2InLCBsZXZlbCwgdHlwZSwgLi4uYW5zaVN0eWxlcy5oZXhUb1JnYiguLi5hcmd1bWVudHNfKSk7XG5cdH1cblxuXHRyZXR1cm4gYW5zaVN0eWxlc1t0eXBlXVttb2RlbF0oLi4uYXJndW1lbnRzXyk7XG59O1xuXG5jb25zdCB1c2VkTW9kZWxzID0gWydyZ2InLCAnaGV4JywgJ2Fuc2kyNTYnXTtcblxuZm9yIChjb25zdCBtb2RlbCBvZiB1c2VkTW9kZWxzKSB7XG5cdHN0eWxlc1ttb2RlbF0gPSB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0Y29uc3Qge2xldmVsfSA9IHRoaXM7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3VtZW50c18pIHtcblx0XHRcdFx0Y29uc3Qgc3R5bGVyID0gY3JlYXRlU3R5bGVyKGdldE1vZGVsQW5zaShtb2RlbCwgbGV2ZWxNYXBwaW5nW2xldmVsXSwgJ2NvbG9yJywgLi4uYXJndW1lbnRzXyksIGFuc2lTdHlsZXMuY29sb3IuY2xvc2UsIHRoaXNbU1RZTEVSXSk7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVCdWlsZGVyKHRoaXMsIHN0eWxlciwgdGhpc1tJU19FTVBUWV0pO1xuXHRcdFx0fTtcblx0XHR9LFxuXHR9O1xuXG5cdGNvbnN0IGJnTW9kZWwgPSAnYmcnICsgbW9kZWxbMF0udG9VcHBlckNhc2UoKSArIG1vZGVsLnNsaWNlKDEpO1xuXHRzdHlsZXNbYmdNb2RlbF0gPSB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0Y29uc3Qge2xldmVsfSA9IHRoaXM7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3VtZW50c18pIHtcblx0XHRcdFx0Y29uc3Qgc3R5bGVyID0gY3JlYXRlU3R5bGVyKGdldE1vZGVsQW5zaShtb2RlbCwgbGV2ZWxNYXBwaW5nW2xldmVsXSwgJ2JnQ29sb3InLCAuLi5hcmd1bWVudHNfKSwgYW5zaVN0eWxlcy5iZ0NvbG9yLmNsb3NlLCB0aGlzW1NUWUxFUl0pO1xuXHRcdFx0XHRyZXR1cm4gY3JlYXRlQnVpbGRlcih0aGlzLCBzdHlsZXIsIHRoaXNbSVNfRU1QVFldKTtcblx0XHRcdH07XG5cdFx0fSxcblx0fTtcbn1cblxuY29uc3QgcHJvdG8gPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcygoKSA9PiB7fSwge1xuXHQuLi5zdHlsZXMsXG5cdGxldmVsOiB7XG5cdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gdGhpc1tHRU5FUkFUT1JdLmxldmVsO1xuXHRcdH0sXG5cdFx0c2V0KGxldmVsKSB7XG5cdFx0XHR0aGlzW0dFTkVSQVRPUl0ubGV2ZWwgPSBsZXZlbDtcblx0XHR9LFxuXHR9LFxufSk7XG5cbmNvbnN0IGNyZWF0ZVN0eWxlciA9IChvcGVuLCBjbG9zZSwgcGFyZW50KSA9PiB7XG5cdGxldCBvcGVuQWxsO1xuXHRsZXQgY2xvc2VBbGw7XG5cdGlmIChwYXJlbnQgPT09IHVuZGVmaW5lZCkge1xuXHRcdG9wZW5BbGwgPSBvcGVuO1xuXHRcdGNsb3NlQWxsID0gY2xvc2U7XG5cdH0gZWxzZSB7XG5cdFx0b3BlbkFsbCA9IHBhcmVudC5vcGVuQWxsICsgb3Blbjtcblx0XHRjbG9zZUFsbCA9IGNsb3NlICsgcGFyZW50LmNsb3NlQWxsO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRvcGVuLFxuXHRcdGNsb3NlLFxuXHRcdG9wZW5BbGwsXG5cdFx0Y2xvc2VBbGwsXG5cdFx0cGFyZW50LFxuXHR9O1xufTtcblxuY29uc3QgY3JlYXRlQnVpbGRlciA9IChzZWxmLCBfc3R5bGVyLCBfaXNFbXB0eSkgPT4ge1xuXHQvLyBTaW5nbGUgYXJndW1lbnQgaXMgaG90IHBhdGgsIGltcGxpY2l0IGNvZXJjaW9uIGlzIGZhc3RlciB0aGFuIGFueXRoaW5nXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1pbXBsaWNpdC1jb2VyY2lvblxuXHRjb25zdCBidWlsZGVyID0gKC4uLmFyZ3VtZW50c18pID0+IGFwcGx5U3R5bGUoYnVpbGRlciwgKGFyZ3VtZW50c18ubGVuZ3RoID09PSAxKSA/ICgnJyArIGFyZ3VtZW50c19bMF0pIDogYXJndW1lbnRzXy5qb2luKCcgJykpO1xuXG5cdC8vIFdlIGFsdGVyIHRoZSBwcm90b3R5cGUgYmVjYXVzZSB3ZSBtdXN0IHJldHVybiBhIGZ1bmN0aW9uLCBidXQgdGhlcmUgaXNcblx0Ly8gbm8gd2F5IHRvIGNyZWF0ZSBhIGZ1bmN0aW9uIHdpdGggYSBkaWZmZXJlbnQgcHJvdG90eXBlXG5cdE9iamVjdC5zZXRQcm90b3R5cGVPZihidWlsZGVyLCBwcm90byk7XG5cblx0YnVpbGRlcltHRU5FUkFUT1JdID0gc2VsZjtcblx0YnVpbGRlcltTVFlMRVJdID0gX3N0eWxlcjtcblx0YnVpbGRlcltJU19FTVBUWV0gPSBfaXNFbXB0eTtcblxuXHRyZXR1cm4gYnVpbGRlcjtcbn07XG5cbmNvbnN0IGFwcGx5U3R5bGUgPSAoc2VsZiwgc3RyaW5nKSA9PiB7XG5cdGlmIChzZWxmLmxldmVsIDw9IDAgfHwgIXN0cmluZykge1xuXHRcdHJldHVybiBzZWxmW0lTX0VNUFRZXSA/ICcnIDogc3RyaW5nO1xuXHR9XG5cblx0bGV0IHN0eWxlciA9IHNlbGZbU1RZTEVSXTtcblxuXHRpZiAoc3R5bGVyID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gc3RyaW5nO1xuXHR9XG5cblx0Y29uc3Qge29wZW5BbGwsIGNsb3NlQWxsfSA9IHN0eWxlcjtcblx0aWYgKHN0cmluZy5pbmNsdWRlcygnXFx1MDAxQicpKSB7XG5cdFx0d2hpbGUgKHN0eWxlciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBSZXBsYWNlIGFueSBpbnN0YW5jZXMgYWxyZWFkeSBwcmVzZW50IHdpdGggYSByZS1vcGVuaW5nIGNvZGVcblx0XHRcdC8vIG90aGVyd2lzZSBvbmx5IHRoZSBwYXJ0IG9mIHRoZSBzdHJpbmcgdW50aWwgc2FpZCBjbG9zaW5nIGNvZGVcblx0XHRcdC8vIHdpbGwgYmUgY29sb3JlZCwgYW5kIHRoZSByZXN0IHdpbGwgc2ltcGx5IGJlICdwbGFpbicuXG5cdFx0XHRzdHJpbmcgPSBzdHJpbmdSZXBsYWNlQWxsKHN0cmluZywgc3R5bGVyLmNsb3NlLCBzdHlsZXIub3Blbik7XG5cblx0XHRcdHN0eWxlciA9IHN0eWxlci5wYXJlbnQ7XG5cdFx0fVxuXHR9XG5cblx0Ly8gV2UgY2FuIG1vdmUgYm90aCBuZXh0IGFjdGlvbnMgb3V0IG9mIGxvb3AsIGJlY2F1c2UgcmVtYWluaW5nIGFjdGlvbnMgaW4gbG9vcCB3b24ndCBoYXZlXG5cdC8vIGFueS92aXNpYmxlIGVmZmVjdCBvbiBwYXJ0cyB3ZSBhZGQgaGVyZS4gQ2xvc2UgdGhlIHN0eWxpbmcgYmVmb3JlIGEgbGluZWJyZWFrIGFuZCByZW9wZW5cblx0Ly8gYWZ0ZXIgbmV4dCBsaW5lIHRvIGZpeCBhIGJsZWVkIGlzc3VlIG9uIG1hY09TOiBodHRwczovL2dpdGh1Yi5jb20vY2hhbGsvY2hhbGsvcHVsbC85MlxuXHRjb25zdCBsZkluZGV4ID0gc3RyaW5nLmluZGV4T2YoJ1xcbicpO1xuXHRpZiAobGZJbmRleCAhPT0gLTEpIHtcblx0XHRzdHJpbmcgPSBzdHJpbmdFbmNhc2VDUkxGV2l0aEZpcnN0SW5kZXgoc3RyaW5nLCBjbG9zZUFsbCwgb3BlbkFsbCwgbGZJbmRleCk7XG5cdH1cblxuXHRyZXR1cm4gb3BlbkFsbCArIHN0cmluZyArIGNsb3NlQWxsO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoY3JlYXRlQ2hhbGsucHJvdG90eXBlLCBzdHlsZXMpO1xuXG5jb25zdCBjaGFsayA9IGNyZWF0ZUNoYWxrKCk7XG5leHBvcnQgY29uc3QgY2hhbGtTdGRlcnIgPSBjcmVhdGVDaGFsayh7bGV2ZWw6IHN0ZGVyckNvbG9yID8gc3RkZXJyQ29sb3IubGV2ZWwgOiAwfSk7XG5cbmV4cG9ydCB7XG5cdG1vZGlmaWVyTmFtZXMsXG5cdGZvcmVncm91bmRDb2xvck5hbWVzLFxuXHRiYWNrZ3JvdW5kQ29sb3JOYW1lcyxcblx0Y29sb3JOYW1lcyxcblxuXHQvLyBUT0RPOiBSZW1vdmUgdGhlc2UgYWxpYXNlcyBpbiB0aGUgbmV4dCBtYWpvciB2ZXJzaW9uXG5cdG1vZGlmaWVyTmFtZXMgYXMgbW9kaWZpZXJzLFxuXHRmb3JlZ3JvdW5kQ29sb3JOYW1lcyBhcyBmb3JlZ3JvdW5kQ29sb3JzLFxuXHRiYWNrZ3JvdW5kQ29sb3JOYW1lcyBhcyBiYWNrZ3JvdW5kQ29sb3JzLFxuXHRjb2xvck5hbWVzIGFzIGNvbG9ycyxcbn0gZnJvbSAnLi92ZW5kb3IvYW5zaS1zdHlsZXMvaW5kZXguanMnO1xuXG5leHBvcnQge1xuXHRzdGRvdXRDb2xvciBhcyBzdXBwb3J0c0NvbG9yLFxuXHRzdGRlcnJDb2xvciBhcyBzdXBwb3J0c0NvbG9yU3RkZXJyLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2hhbGs7XG4iLCIvLyBUT0RPOiBXaGVuIHRhcmdldGluZyBOb2RlLmpzIDE2LCB1c2UgYFN0cmluZy5wcm90b3R5cGUucmVwbGFjZUFsbGAuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nUmVwbGFjZUFsbChzdHJpbmcsIHN1YnN0cmluZywgcmVwbGFjZXIpIHtcblx0bGV0IGluZGV4ID0gc3RyaW5nLmluZGV4T2Yoc3Vic3RyaW5nKTtcblx0aWYgKGluZGV4ID09PSAtMSkge1xuXHRcdHJldHVybiBzdHJpbmc7XG5cdH1cblxuXHRjb25zdCBzdWJzdHJpbmdMZW5ndGggPSBzdWJzdHJpbmcubGVuZ3RoO1xuXHRsZXQgZW5kSW5kZXggPSAwO1xuXHRsZXQgcmV0dXJuVmFsdWUgPSAnJztcblx0ZG8ge1xuXHRcdHJldHVyblZhbHVlICs9IHN0cmluZy5zbGljZShlbmRJbmRleCwgaW5kZXgpICsgc3Vic3RyaW5nICsgcmVwbGFjZXI7XG5cdFx0ZW5kSW5kZXggPSBpbmRleCArIHN1YnN0cmluZ0xlbmd0aDtcblx0XHRpbmRleCA9IHN0cmluZy5pbmRleE9mKHN1YnN0cmluZywgZW5kSW5kZXgpO1xuXHR9IHdoaWxlIChpbmRleCAhPT0gLTEpO1xuXG5cdHJldHVyblZhbHVlICs9IHN0cmluZy5zbGljZShlbmRJbmRleCk7XG5cdHJldHVybiByZXR1cm5WYWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ0VuY2FzZUNSTEZXaXRoRmlyc3RJbmRleChzdHJpbmcsIHByZWZpeCwgcG9zdGZpeCwgaW5kZXgpIHtcblx0bGV0IGVuZEluZGV4ID0gMDtcblx0bGV0IHJldHVyblZhbHVlID0gJyc7XG5cdGRvIHtcblx0XHRjb25zdCBnb3RDUiA9IHN0cmluZ1tpbmRleCAtIDFdID09PSAnXFxyJztcblx0XHRyZXR1cm5WYWx1ZSArPSBzdHJpbmcuc2xpY2UoZW5kSW5kZXgsIChnb3RDUiA/IGluZGV4IC0gMSA6IGluZGV4KSkgKyBwcmVmaXggKyAoZ290Q1IgPyAnXFxyXFxuJyA6ICdcXG4nKSArIHBvc3RmaXg7XG5cdFx0ZW5kSW5kZXggPSBpbmRleCArIDE7XG5cdFx0aW5kZXggPSBzdHJpbmcuaW5kZXhPZignXFxuJywgZW5kSW5kZXgpO1xuXHR9IHdoaWxlIChpbmRleCAhPT0gLTEpO1xuXG5cdHJldHVyblZhbHVlICs9IHN0cmluZy5zbGljZShlbmRJbmRleCk7XG5cdHJldHVybiByZXR1cm5WYWx1ZTtcbn1cbiIsImNvbnN0IEFOU0lfQkFDS0dST1VORF9PRkZTRVQgPSAxMDtcblxuY29uc3Qgd3JhcEFuc2kxNiA9IChvZmZzZXQgPSAwKSA9PiBjb2RlID0+IGBcXHUwMDFCWyR7Y29kZSArIG9mZnNldH1tYDtcblxuY29uc3Qgd3JhcEFuc2kyNTYgPSAob2Zmc2V0ID0gMCkgPT4gY29kZSA9PiBgXFx1MDAxQlskezM4ICsgb2Zmc2V0fTs1OyR7Y29kZX1tYDtcblxuY29uc3Qgd3JhcEFuc2kxNm0gPSAob2Zmc2V0ID0gMCkgPT4gKHJlZCwgZ3JlZW4sIGJsdWUpID0+IGBcXHUwMDFCWyR7MzggKyBvZmZzZXR9OzI7JHtyZWR9OyR7Z3JlZW59OyR7Ymx1ZX1tYDtcblxuY29uc3Qgc3R5bGVzID0ge1xuXHRtb2RpZmllcjoge1xuXHRcdHJlc2V0OiBbMCwgMF0sXG5cdFx0Ly8gMjEgaXNuJ3Qgd2lkZWx5IHN1cHBvcnRlZCBhbmQgMjIgZG9lcyB0aGUgc2FtZSB0aGluZ1xuXHRcdGJvbGQ6IFsxLCAyMl0sXG5cdFx0ZGltOiBbMiwgMjJdLFxuXHRcdGl0YWxpYzogWzMsIDIzXSxcblx0XHR1bmRlcmxpbmU6IFs0LCAyNF0sXG5cdFx0b3ZlcmxpbmU6IFs1MywgNTVdLFxuXHRcdGludmVyc2U6IFs3LCAyN10sXG5cdFx0aGlkZGVuOiBbOCwgMjhdLFxuXHRcdHN0cmlrZXRocm91Z2g6IFs5LCAyOV0sXG5cdH0sXG5cdGNvbG9yOiB7XG5cdFx0YmxhY2s6IFszMCwgMzldLFxuXHRcdHJlZDogWzMxLCAzOV0sXG5cdFx0Z3JlZW46IFszMiwgMzldLFxuXHRcdHllbGxvdzogWzMzLCAzOV0sXG5cdFx0Ymx1ZTogWzM0LCAzOV0sXG5cdFx0bWFnZW50YTogWzM1LCAzOV0sXG5cdFx0Y3lhbjogWzM2LCAzOV0sXG5cdFx0d2hpdGU6IFszNywgMzldLFxuXG5cdFx0Ly8gQnJpZ2h0IGNvbG9yXG5cdFx0YmxhY2tCcmlnaHQ6IFs5MCwgMzldLFxuXHRcdGdyYXk6IFs5MCwgMzldLCAvLyBBbGlhcyBvZiBgYmxhY2tCcmlnaHRgXG5cdFx0Z3JleTogWzkwLCAzOV0sIC8vIEFsaWFzIG9mIGBibGFja0JyaWdodGBcblx0XHRyZWRCcmlnaHQ6IFs5MSwgMzldLFxuXHRcdGdyZWVuQnJpZ2h0OiBbOTIsIDM5XSxcblx0XHR5ZWxsb3dCcmlnaHQ6IFs5MywgMzldLFxuXHRcdGJsdWVCcmlnaHQ6IFs5NCwgMzldLFxuXHRcdG1hZ2VudGFCcmlnaHQ6IFs5NSwgMzldLFxuXHRcdGN5YW5CcmlnaHQ6IFs5NiwgMzldLFxuXHRcdHdoaXRlQnJpZ2h0OiBbOTcsIDM5XSxcblx0fSxcblx0YmdDb2xvcjoge1xuXHRcdGJnQmxhY2s6IFs0MCwgNDldLFxuXHRcdGJnUmVkOiBbNDEsIDQ5XSxcblx0XHRiZ0dyZWVuOiBbNDIsIDQ5XSxcblx0XHRiZ1llbGxvdzogWzQzLCA0OV0sXG5cdFx0YmdCbHVlOiBbNDQsIDQ5XSxcblx0XHRiZ01hZ2VudGE6IFs0NSwgNDldLFxuXHRcdGJnQ3lhbjogWzQ2LCA0OV0sXG5cdFx0YmdXaGl0ZTogWzQ3LCA0OV0sXG5cblx0XHQvLyBCcmlnaHQgY29sb3Jcblx0XHRiZ0JsYWNrQnJpZ2h0OiBbMTAwLCA0OV0sXG5cdFx0YmdHcmF5OiBbMTAwLCA0OV0sIC8vIEFsaWFzIG9mIGBiZ0JsYWNrQnJpZ2h0YFxuXHRcdGJnR3JleTogWzEwMCwgNDldLCAvLyBBbGlhcyBvZiBgYmdCbGFja0JyaWdodGBcblx0XHRiZ1JlZEJyaWdodDogWzEwMSwgNDldLFxuXHRcdGJnR3JlZW5CcmlnaHQ6IFsxMDIsIDQ5XSxcblx0XHRiZ1llbGxvd0JyaWdodDogWzEwMywgNDldLFxuXHRcdGJnQmx1ZUJyaWdodDogWzEwNCwgNDldLFxuXHRcdGJnTWFnZW50YUJyaWdodDogWzEwNSwgNDldLFxuXHRcdGJnQ3lhbkJyaWdodDogWzEwNiwgNDldLFxuXHRcdGJnV2hpdGVCcmlnaHQ6IFsxMDcsIDQ5XSxcblx0fSxcbn07XG5cbmV4cG9ydCBjb25zdCBtb2RpZmllck5hbWVzID0gT2JqZWN0LmtleXMoc3R5bGVzLm1vZGlmaWVyKTtcbmV4cG9ydCBjb25zdCBmb3JlZ3JvdW5kQ29sb3JOYW1lcyA9IE9iamVjdC5rZXlzKHN0eWxlcy5jb2xvcik7XG5leHBvcnQgY29uc3QgYmFja2dyb3VuZENvbG9yTmFtZXMgPSBPYmplY3Qua2V5cyhzdHlsZXMuYmdDb2xvcik7XG5leHBvcnQgY29uc3QgY29sb3JOYW1lcyA9IFsuLi5mb3JlZ3JvdW5kQ29sb3JOYW1lcywgLi4uYmFja2dyb3VuZENvbG9yTmFtZXNdO1xuXG5mdW5jdGlvbiBhc3NlbWJsZVN0eWxlcygpIHtcblx0Y29uc3QgY29kZXMgPSBuZXcgTWFwKCk7XG5cblx0Zm9yIChjb25zdCBbZ3JvdXBOYW1lLCBncm91cF0gb2YgT2JqZWN0LmVudHJpZXMoc3R5bGVzKSkge1xuXHRcdGZvciAoY29uc3QgW3N0eWxlTmFtZSwgc3R5bGVdIG9mIE9iamVjdC5lbnRyaWVzKGdyb3VwKSkge1xuXHRcdFx0c3R5bGVzW3N0eWxlTmFtZV0gPSB7XG5cdFx0XHRcdG9wZW46IGBcXHUwMDFCWyR7c3R5bGVbMF19bWAsXG5cdFx0XHRcdGNsb3NlOiBgXFx1MDAxQlske3N0eWxlWzFdfW1gLFxuXHRcdFx0fTtcblxuXHRcdFx0Z3JvdXBbc3R5bGVOYW1lXSA9IHN0eWxlc1tzdHlsZU5hbWVdO1xuXG5cdFx0XHRjb2Rlcy5zZXQoc3R5bGVbMF0sIHN0eWxlWzFdKTtcblx0XHR9XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc3R5bGVzLCBncm91cE5hbWUsIHtcblx0XHRcdHZhbHVlOiBncm91cCxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0pO1xuXHR9XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHN0eWxlcywgJ2NvZGVzJywge1xuXHRcdHZhbHVlOiBjb2Rlcyxcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0fSk7XG5cblx0c3R5bGVzLmNvbG9yLmNsb3NlID0gJ1xcdTAwMUJbMzltJztcblx0c3R5bGVzLmJnQ29sb3IuY2xvc2UgPSAnXFx1MDAxQls0OW0nO1xuXG5cdHN0eWxlcy5jb2xvci5hbnNpID0gd3JhcEFuc2kxNigpO1xuXHRzdHlsZXMuY29sb3IuYW5zaTI1NiA9IHdyYXBBbnNpMjU2KCk7XG5cdHN0eWxlcy5jb2xvci5hbnNpMTZtID0gd3JhcEFuc2kxNm0oKTtcblx0c3R5bGVzLmJnQ29sb3IuYW5zaSA9IHdyYXBBbnNpMTYoQU5TSV9CQUNLR1JPVU5EX09GRlNFVCk7XG5cdHN0eWxlcy5iZ0NvbG9yLmFuc2kyNTYgPSB3cmFwQW5zaTI1NihBTlNJX0JBQ0tHUk9VTkRfT0ZGU0VUKTtcblx0c3R5bGVzLmJnQ29sb3IuYW5zaTE2bSA9IHdyYXBBbnNpMTZtKEFOU0lfQkFDS0dST1VORF9PRkZTRVQpO1xuXG5cdC8vIEZyb20gaHR0cHM6Ly9naXRodWIuY29tL1FpeC0vY29sb3ItY29udmVydC9ibG9iLzNmMGUwZDRlOTJlMjM1Nzk2Y2NiMTdmNmU4NWM3MjA5NGE2NTFmNDkvY29udmVyc2lvbnMuanNcblx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoc3R5bGVzLCB7XG5cdFx0cmdiVG9BbnNpMjU2OiB7XG5cdFx0XHR2YWx1ZShyZWQsIGdyZWVuLCBibHVlKSB7XG5cdFx0XHRcdC8vIFdlIHVzZSB0aGUgZXh0ZW5kZWQgZ3JleXNjYWxlIHBhbGV0dGUgaGVyZSwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mXG5cdFx0XHRcdC8vIGJsYWNrIGFuZCB3aGl0ZS4gbm9ybWFsIHBhbGV0dGUgb25seSBoYXMgNCBncmV5c2NhbGUgc2hhZGVzLlxuXHRcdFx0XHRpZiAocmVkID09PSBncmVlbiAmJiBncmVlbiA9PT0gYmx1ZSkge1xuXHRcdFx0XHRcdGlmIChyZWQgPCA4KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMTY7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKHJlZCA+IDI0OCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDIzMTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCgoKHJlZCAtIDgpIC8gMjQ3KSAqIDI0KSArIDIzMjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiAxNlxuXHRcdFx0XHRcdCsgKDM2ICogTWF0aC5yb3VuZChyZWQgLyAyNTUgKiA1KSlcblx0XHRcdFx0XHQrICg2ICogTWF0aC5yb3VuZChncmVlbiAvIDI1NSAqIDUpKVxuXHRcdFx0XHRcdCsgTWF0aC5yb3VuZChibHVlIC8gMjU1ICogNSk7XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0XHRoZXhUb1JnYjoge1xuXHRcdFx0dmFsdWUoaGV4KSB7XG5cdFx0XHRcdGNvbnN0IG1hdGNoZXMgPSAvW2EtZlxcZF17Nn18W2EtZlxcZF17M30vaS5leGVjKGhleC50b1N0cmluZygxNikpO1xuXHRcdFx0XHRpZiAoIW1hdGNoZXMpIHtcblx0XHRcdFx0XHRyZXR1cm4gWzAsIDAsIDBdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IFtjb2xvclN0cmluZ10gPSBtYXRjaGVzO1xuXG5cdFx0XHRcdGlmIChjb2xvclN0cmluZy5sZW5ndGggPT09IDMpIHtcblx0XHRcdFx0XHRjb2xvclN0cmluZyA9IFsuLi5jb2xvclN0cmluZ10ubWFwKGNoYXJhY3RlciA9PiBjaGFyYWN0ZXIgKyBjaGFyYWN0ZXIpLmpvaW4oJycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgaW50ZWdlciA9IE51bWJlci5wYXJzZUludChjb2xvclN0cmluZywgMTYpO1xuXG5cdFx0XHRcdHJldHVybiBbXG5cdFx0XHRcdFx0LyogZXNsaW50LWRpc2FibGUgbm8tYml0d2lzZSAqL1xuXHRcdFx0XHRcdChpbnRlZ2VyID4+IDE2KSAmIDB4RkYsXG5cdFx0XHRcdFx0KGludGVnZXIgPj4gOCkgJiAweEZGLFxuXHRcdFx0XHRcdGludGVnZXIgJiAweEZGLFxuXHRcdFx0XHRcdC8qIGVzbGludC1lbmFibGUgbm8tYml0d2lzZSAqL1xuXHRcdFx0XHRdO1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0sXG5cdFx0aGV4VG9BbnNpMjU2OiB7XG5cdFx0XHR2YWx1ZTogaGV4ID0+IHN0eWxlcy5yZ2JUb0Fuc2kyNTYoLi4uc3R5bGVzLmhleFRvUmdiKGhleCkpLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0XHRhbnNpMjU2VG9BbnNpOiB7XG5cdFx0XHR2YWx1ZShjb2RlKSB7XG5cdFx0XHRcdGlmIChjb2RlIDwgOCkge1xuXHRcdFx0XHRcdHJldHVybiAzMCArIGNvZGU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY29kZSA8IDE2KSB7XG5cdFx0XHRcdFx0cmV0dXJuIDkwICsgKGNvZGUgLSA4KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCByZWQ7XG5cdFx0XHRcdGxldCBncmVlbjtcblx0XHRcdFx0bGV0IGJsdWU7XG5cblx0XHRcdFx0aWYgKGNvZGUgPj0gMjMyKSB7XG5cdFx0XHRcdFx0cmVkID0gKCgoY29kZSAtIDIzMikgKiAxMCkgKyA4KSAvIDI1NTtcblx0XHRcdFx0XHRncmVlbiA9IHJlZDtcblx0XHRcdFx0XHRibHVlID0gcmVkO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvZGUgLT0gMTY7XG5cblx0XHRcdFx0XHRjb25zdCByZW1haW5kZXIgPSBjb2RlICUgMzY7XG5cblx0XHRcdFx0XHRyZWQgPSBNYXRoLmZsb29yKGNvZGUgLyAzNikgLyA1O1xuXHRcdFx0XHRcdGdyZWVuID0gTWF0aC5mbG9vcihyZW1haW5kZXIgLyA2KSAvIDU7XG5cdFx0XHRcdFx0Ymx1ZSA9IChyZW1haW5kZXIgJSA2KSAvIDU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IE1hdGgubWF4KHJlZCwgZ3JlZW4sIGJsdWUpICogMjtcblxuXHRcdFx0XHRpZiAodmFsdWUgPT09IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gMzA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYml0d2lzZVxuXHRcdFx0XHRsZXQgcmVzdWx0ID0gMzAgKyAoKE1hdGgucm91bmQoYmx1ZSkgPDwgMikgfCAoTWF0aC5yb3VuZChncmVlbikgPDwgMSkgfCBNYXRoLnJvdW5kKHJlZCkpO1xuXG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gMikge1xuXHRcdFx0XHRcdHJlc3VsdCArPSA2MDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0XHRyZ2JUb0Fuc2k6IHtcblx0XHRcdHZhbHVlOiAocmVkLCBncmVlbiwgYmx1ZSkgPT4gc3R5bGVzLmFuc2kyNTZUb0Fuc2koc3R5bGVzLnJnYlRvQW5zaTI1NihyZWQsIGdyZWVuLCBibHVlKSksXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9LFxuXHRcdGhleFRvQW5zaToge1xuXHRcdFx0dmFsdWU6IGhleCA9PiBzdHlsZXMuYW5zaTI1NlRvQW5zaShzdHlsZXMuaGV4VG9BbnNpMjU2KGhleCkpLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0fSk7XG5cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuY29uc3QgYW5zaVN0eWxlcyA9IGFzc2VtYmxlU3R5bGVzKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGFuc2lTdHlsZXM7XG4iLCJpbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IG9zIGZyb20gJ25vZGU6b3MnO1xuaW1wb3J0IHR0eSBmcm9tICdub2RlOnR0eSc7XG5cbi8vIEZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvaGFzLWZsYWcvYmxvYi9tYWluL2luZGV4LmpzXG4vLy8gZnVuY3Rpb24gaGFzRmxhZyhmbGFnLCBhcmd2ID0gZ2xvYmFsVGhpcy5EZW5vPy5hcmdzID8/IHByb2Nlc3MuYXJndikge1xuZnVuY3Rpb24gaGFzRmxhZyhmbGFnLCBhcmd2ID0gZ2xvYmFsVGhpcy5EZW5vID8gZ2xvYmFsVGhpcy5EZW5vLmFyZ3MgOiBwcm9jZXNzLmFyZ3YpIHtcblx0Y29uc3QgcHJlZml4ID0gZmxhZy5zdGFydHNXaXRoKCctJykgPyAnJyA6IChmbGFnLmxlbmd0aCA9PT0gMSA/ICctJyA6ICctLScpO1xuXHRjb25zdCBwb3NpdGlvbiA9IGFyZ3YuaW5kZXhPZihwcmVmaXggKyBmbGFnKTtcblx0Y29uc3QgdGVybWluYXRvclBvc2l0aW9uID0gYXJndi5pbmRleE9mKCctLScpO1xuXHRyZXR1cm4gcG9zaXRpb24gIT09IC0xICYmICh0ZXJtaW5hdG9yUG9zaXRpb24gPT09IC0xIHx8IHBvc2l0aW9uIDwgdGVybWluYXRvclBvc2l0aW9uKTtcbn1cblxuY29uc3Qge2Vudn0gPSBwcm9jZXNzO1xuXG5sZXQgZmxhZ0ZvcmNlQ29sb3I7XG5pZiAoXG5cdGhhc0ZsYWcoJ25vLWNvbG9yJylcblx0fHwgaGFzRmxhZygnbm8tY29sb3JzJylcblx0fHwgaGFzRmxhZygnY29sb3I9ZmFsc2UnKVxuXHR8fCBoYXNGbGFnKCdjb2xvcj1uZXZlcicpXG4pIHtcblx0ZmxhZ0ZvcmNlQ29sb3IgPSAwO1xufSBlbHNlIGlmIChcblx0aGFzRmxhZygnY29sb3InKVxuXHR8fCBoYXNGbGFnKCdjb2xvcnMnKVxuXHR8fCBoYXNGbGFnKCdjb2xvcj10cnVlJylcblx0fHwgaGFzRmxhZygnY29sb3I9YWx3YXlzJylcbikge1xuXHRmbGFnRm9yY2VDb2xvciA9IDE7XG59XG5cbmZ1bmN0aW9uIGVudkZvcmNlQ29sb3IoKSB7XG5cdGlmICgnRk9SQ0VfQ09MT1InIGluIGVudikge1xuXHRcdGlmIChlbnYuRk9SQ0VfQ09MT1IgPT09ICd0cnVlJykge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fVxuXG5cdFx0aWYgKGVudi5GT1JDRV9DT0xPUiA9PT0gJ2ZhbHNlJykge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVudi5GT1JDRV9DT0xPUi5sZW5ndGggPT09IDAgPyAxIDogTWF0aC5taW4oTnVtYmVyLnBhcnNlSW50KGVudi5GT1JDRV9DT0xPUiwgMTApLCAzKTtcblx0fVxufVxuXG5mdW5jdGlvbiB0cmFuc2xhdGVMZXZlbChsZXZlbCkge1xuXHRpZiAobGV2ZWwgPT09IDApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGxldmVsLFxuXHRcdGhhc0Jhc2ljOiB0cnVlLFxuXHRcdGhhczI1NjogbGV2ZWwgPj0gMixcblx0XHRoYXMxNm06IGxldmVsID49IDMsXG5cdH07XG59XG5cbmZ1bmN0aW9uIF9zdXBwb3J0c0NvbG9yKGhhdmVTdHJlYW0sIHtzdHJlYW1Jc1RUWSwgc25pZmZGbGFncyA9IHRydWV9ID0ge30pIHtcblx0Y29uc3Qgbm9GbGFnRm9yY2VDb2xvciA9IGVudkZvcmNlQ29sb3IoKTtcblx0aWYgKG5vRmxhZ0ZvcmNlQ29sb3IgIT09IHVuZGVmaW5lZCkge1xuXHRcdGZsYWdGb3JjZUNvbG9yID0gbm9GbGFnRm9yY2VDb2xvcjtcblx0fVxuXG5cdGNvbnN0IGZvcmNlQ29sb3IgPSBzbmlmZkZsYWdzID8gZmxhZ0ZvcmNlQ29sb3IgOiBub0ZsYWdGb3JjZUNvbG9yO1xuXG5cdGlmIChmb3JjZUNvbG9yID09PSAwKSB7XG5cdFx0cmV0dXJuIDA7XG5cdH1cblxuXHRpZiAoc25pZmZGbGFncykge1xuXHRcdGlmIChoYXNGbGFnKCdjb2xvcj0xNm0nKVxuXHRcdFx0fHwgaGFzRmxhZygnY29sb3I9ZnVsbCcpXG5cdFx0XHR8fCBoYXNGbGFnKCdjb2xvcj10cnVlY29sb3InKSkge1xuXHRcdFx0cmV0dXJuIDM7XG5cdFx0fVxuXG5cdFx0aWYgKGhhc0ZsYWcoJ2NvbG9yPTI1NicpKSB7XG5cdFx0XHRyZXR1cm4gMjtcblx0XHR9XG5cdH1cblxuXHQvLyBDaGVjayBmb3IgQXp1cmUgRGV2T3BzIHBpcGVsaW5lcy5cblx0Ly8gSGFzIHRvIGJlIGFib3ZlIHRoZSBgIXN0cmVhbUlzVFRZYCBjaGVjay5cblx0aWYgKCdURl9CVUlMRCcgaW4gZW52ICYmICdBR0VOVF9OQU1FJyBpbiBlbnYpIHtcblx0XHRyZXR1cm4gMTtcblx0fVxuXG5cdGlmIChoYXZlU3RyZWFtICYmICFzdHJlYW1Jc1RUWSAmJiBmb3JjZUNvbG9yID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gMDtcblx0fVxuXG5cdGNvbnN0IG1pbiA9IGZvcmNlQ29sb3IgfHwgMDtcblxuXHRpZiAoZW52LlRFUk0gPT09ICdkdW1iJykge1xuXHRcdHJldHVybiBtaW47XG5cdH1cblxuXHRpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xuXHRcdC8vIFdpbmRvd3MgMTAgYnVpbGQgMTA1ODYgaXMgdGhlIGZpcnN0IFdpbmRvd3MgcmVsZWFzZSB0aGF0IHN1cHBvcnRzIDI1NiBjb2xvcnMuXG5cdFx0Ly8gV2luZG93cyAxMCBidWlsZCAxNDkzMSBpcyB0aGUgZmlyc3QgcmVsZWFzZSB0aGF0IHN1cHBvcnRzIDE2bS9UcnVlQ29sb3IuXG5cdFx0Y29uc3Qgb3NSZWxlYXNlID0gb3MucmVsZWFzZSgpLnNwbGl0KCcuJyk7XG5cdFx0aWYgKFxuXHRcdFx0TnVtYmVyKG9zUmVsZWFzZVswXSkgPj0gMTBcblx0XHRcdCYmIE51bWJlcihvc1JlbGVhc2VbMl0pID49IDEwXzU4NlxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIE51bWJlcihvc1JlbGVhc2VbMl0pID49IDE0XzkzMSA/IDMgOiAyO1xuXHRcdH1cblxuXHRcdHJldHVybiAxO1xuXHR9XG5cblx0aWYgKCdDSScgaW4gZW52KSB7XG5cdFx0aWYgKCdHSVRIVUJfQUNUSU9OUycgaW4gZW52IHx8ICdHSVRFQV9BQ1RJT05TJyBpbiBlbnYpIHtcblx0XHRcdHJldHVybiAzO1xuXHRcdH1cblxuXHRcdGlmIChbJ1RSQVZJUycsICdDSVJDTEVDSScsICdBUFBWRVlPUicsICdHSVRMQUJfQ0knLCAnQlVJTERLSVRFJywgJ0RST05FJ10uc29tZShzaWduID0+IHNpZ24gaW4gZW52KSB8fCBlbnYuQ0lfTkFNRSA9PT0gJ2NvZGVzaGlwJykge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1pbjtcblx0fVxuXG5cdGlmICgnVEVBTUNJVFlfVkVSU0lPTicgaW4gZW52KSB7XG5cdFx0cmV0dXJuIC9eKDlcXC4oMCpbMS05XVxcZCopXFwufFxcZHsyLH1cXC4pLy50ZXN0KGVudi5URUFNQ0lUWV9WRVJTSU9OKSA/IDEgOiAwO1xuXHR9XG5cblx0aWYgKGVudi5DT0xPUlRFUk0gPT09ICd0cnVlY29sb3InKSB7XG5cdFx0cmV0dXJuIDM7XG5cdH1cblxuXHRpZiAoZW52LlRFUk0gPT09ICd4dGVybS1raXR0eScpIHtcblx0XHRyZXR1cm4gMztcblx0fVxuXG5cdGlmICgnVEVSTV9QUk9HUkFNJyBpbiBlbnYpIHtcblx0XHRjb25zdCB2ZXJzaW9uID0gTnVtYmVyLnBhcnNlSW50KChlbnYuVEVSTV9QUk9HUkFNX1ZFUlNJT04gfHwgJycpLnNwbGl0KCcuJylbMF0sIDEwKTtcblxuXHRcdHN3aXRjaCAoZW52LlRFUk1fUFJPR1JBTSkge1xuXHRcdFx0Y2FzZSAnaVRlcm0uYXBwJzoge1xuXHRcdFx0XHRyZXR1cm4gdmVyc2lvbiA+PSAzID8gMyA6IDI7XG5cdFx0XHR9XG5cblx0XHRcdGNhc2UgJ0FwcGxlX1Rlcm1pbmFsJzoge1xuXHRcdFx0XHRyZXR1cm4gMjtcblx0XHRcdH1cblx0XHRcdC8vIE5vIGRlZmF1bHRcblx0XHR9XG5cdH1cblxuXHRpZiAoLy0yNTYoY29sb3IpPyQvaS50ZXN0KGVudi5URVJNKSkge1xuXHRcdHJldHVybiAyO1xuXHR9XG5cblx0aWYgKC9ec2NyZWVufF54dGVybXxednQxMDB8XnZ0MjIwfF5yeHZ0fGNvbG9yfGFuc2l8Y3lnd2lufGxpbnV4L2kudGVzdChlbnYuVEVSTSkpIHtcblx0XHRyZXR1cm4gMTtcblx0fVxuXG5cdGlmICgnQ09MT1JURVJNJyBpbiBlbnYpIHtcblx0XHRyZXR1cm4gMTtcblx0fVxuXG5cdHJldHVybiBtaW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdXBwb3J0c0NvbG9yKHN0cmVhbSwgb3B0aW9ucyA9IHt9KSB7XG5cdGNvbnN0IGxldmVsID0gX3N1cHBvcnRzQ29sb3Ioc3RyZWFtLCB7XG5cdFx0c3RyZWFtSXNUVFk6IHN0cmVhbSAmJiBzdHJlYW0uaXNUVFksXG5cdFx0Li4ub3B0aW9ucyxcblx0fSk7XG5cblx0cmV0dXJuIHRyYW5zbGF0ZUxldmVsKGxldmVsKTtcbn1cblxuY29uc3Qgc3VwcG9ydHNDb2xvciA9IHtcblx0c3Rkb3V0OiBjcmVhdGVTdXBwb3J0c0NvbG9yKHtpc1RUWTogdHR5LmlzYXR0eSgxKX0pLFxuXHRzdGRlcnI6IGNyZWF0ZVN1cHBvcnRzQ29sb3Ioe2lzVFRZOiB0dHkuaXNhdHR5KDIpfSksXG59O1xuXG5leHBvcnQgZGVmYXVsdCBzdXBwb3J0c0NvbG9yO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9zZXJ2ZXIyLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
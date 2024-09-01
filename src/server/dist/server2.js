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
let clientCounter = 0;
let clients = [];
let tracker = new PointTracker_1.PointTracker();
const manager = new src_1.WorkerManager();
let mutex = new mutex_1.Mutex();
let i = 0;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const wss = new ws_1.Server({ port: 8083 });
    wss.on('connection', (ws) => __awaiter(void 0, void 0, void 0, function* () {
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
    }));
    let w1 = yield manager.createWorkerWithHandlers((0, path_1.resolve)(__dirname, 'worker.js'));
    yield manager.call(w1, "initializePage");
    yield manager.call(w1, "setStartTime", new Date());
    serde_ts_1.SerDe.classRegistration([
        Matrix_1.Matrix, MatrixElement_1.MatrixElement, MatrixElement_1.MatrixElement, MatrixElement_1.TimeMatrixElement, Modifiers_1.ScrollingTextModifier, Modifiers_1.ScaleModifier, Modifiers_1.RainbowEffectModifier
    ]);
    let i = 0;
    function updateMatrix() {
        return __awaiter(this, void 0, void 0, function* () {
            yield mutex.lock();
            try {
                let matrix = serde_ts_1.SerDe.deserialize(yield manager.call(w1, 'getSnapshot'));
                matrix.elements[1].setText((i++).toString());
                yield manager.call(w1, 'setSnapshot', serde_ts_1.SerDe.serialise(matrix));
            }
            finally {
                mutex.unlock();
            }
        });
    }
    function processFrameGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield mutex.lock();
            try {
                let frameGroup = yield manager.call(w1, 'generateNextFrameGroup');
                for (let client of clients) {
                    client.send(JSON.stringify(frameGroup));
                }
                let nextTimeout = frameGroup.startTime - Date.now() - 300;
                // Запланируем следующий вызов
                setTimeout(processFrameGroup, Math.max(nextTimeout, 0));
            }
            finally {
                mutex.unlock();
            }
        });
    }
    // Запускаем оба процесса
    setInterval(updateMatrix, 1000);
    processFrameGroup(); // Начальный запуск
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7VUVOQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL3NlcmRlLXRzL2Rpc3QvU2VyRGUuanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvc2VyZGUtdHMvZGlzdC9pbmRleC5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L3NyYy9NYXRyaXgvc3JjL0ZyYW1lR3JvdXAudHMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9zcmMvTWF0cml4L3NyYy9NYXRyaXgudHMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9zcmMvTWF0cml4L3NyYy9NYXRyaXhFbGVtZW50LnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL01hdHJpeC9zcmMvTW9kaWZpZXJzLnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL3NlcnZlci9zcmMvUG9pbnRUcmFja2VyLnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL3NlcnZlci9zcmMvbXV0ZXgudHMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9zcmMvc2VydmVyL3NyYy9zZXJ2ZXIyLnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL3dvcmtlci10aHJlYWRzLW1hbmFnZXIvZGlzdC9zcmMvV29ya2VyQ29udHJvbGxlci5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy93b3JrZXItdGhyZWFkcy1tYW5hZ2VyL2Rpc3Qvc3JjL1dvcmtlck1hbmFnZXIuanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvd29ya2VyLXRocmVhZHMtbWFuYWdlci9kaXN0L3NyYy9pbmRleC5qcyIsImZpbGU6Ly8vZXh0ZXJuYWwgY29tbW9uanMgXCJ3c1wiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwibm9kZTpvc1wiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwibm9kZTpwcm9jZXNzXCIiLCJmaWxlOi8vL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJub2RlOnR0eVwiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwicGF0aFwiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwid29ya2VyX3RocmVhZHNcIiIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9jaGFsay9zb3VyY2UvaW5kZXguanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvY2hhbGsvc291cmNlL3V0aWxpdGllcy5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9jaGFsay9zb3VyY2UvdmVuZG9yL2Fuc2ktc3R5bGVzL2luZGV4LmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL2NoYWxrL3NvdXJjZS92ZW5kb3Ivc3VwcG9ydHMtY29sb3IvaW5kZXguanMiLCJmaWxlOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwiZmlsZTovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJmaWxlOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJmaWxlOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJmaWxlOi8vL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJmaWxlOi8vL3dlYnBhY2svc3RhcnR1cCIsImZpbGU6Ly8vd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TZXJEZSA9IHZvaWQgMDtcbi8vIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIGEgZ2l2ZW4gZnVuY3Rpb24gaXMgYSBjbGFzcyBjb25zdHJ1Y3RvclxuZnVuY3Rpb24gaXNDbGFzcyhmdW5jKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBmdW5jID09PSAnZnVuY3Rpb24nICYmIC9eXFxzKmNsYXNzXFxzKy8udGVzdChmdW5jLnRvU3RyaW5nKCkpO1xufVxuY2xhc3MgU2VyRGUge1xuICAgIC8vIE1ldGhvZCB0byBoYW5kbGUgc2ltcGxlIHR5cGVzIGRpcmVjdGx5XG4gICAgc3RhdGljIGZyb21TaW1wbGUob2JqKSB7XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBEYXRlIHx8IHR5cGVvZiBvYmogPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBvYmogPT09ICdudW1iZXInIHx8IHR5cGVvZiBvYmogPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvLyBNZXRob2QgdG8gc2V0IGV4Y2x1c2l2ZSBjbGFzc2VzIGZvciBzZXJpYWxpemF0aW9uXG4gICAgc3RhdGljIHNldEV4Y2x1c2l2ZWx5KGxpc3QpIHtcbiAgICAgICAgU2VyRGUub25seSA9IG5ldyBTZXQoWy4uLmxpc3QsIEFycmF5LCBNYXAsIFNldF0pO1xuICAgIH1cbiAgICAvLyBNYWluIHNlcmlhbGl6YXRpb24gbWV0aG9kXG4gICAgc3RhdGljIHNlcmlhbGlzZShvYmosIHZpc2l0ZWQgPSBuZXcgTWFwKCksIF9tYXAgPSBuZXcgTWFwKCksIGRlcHRoID0gMCwgcGFyZW50KSB7XG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2U7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJyB8fCBvYmogPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAvLyBJZiB0aGUgb2JqZWN0IGlzIGEgY2xhc3MgYW5kIGlzIG5vdCBpbiB0aGUgZXhjbHVzaXZlIGxpc3QsIHNraXAgc2VyaWFsaXphdGlvblxuICAgICAgICBpZiAoKChfYSA9IFNlckRlLm9ubHkpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5zaXplKSAmJiBpc0NsYXNzKG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9iai5jb25zdHJ1Y3RvcikgJiYgIVNlckRlLm9ubHkuaGFzKG9iai5jb25zdHJ1Y3RvcikpXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRGF0ZSlcbiAgICAgICAgICAgIHJldHVybiB7IHQ6ICdEYXRlJywgdjogb2JqLnZhbHVlT2YoKSB9O1xuICAgICAgICBsZXQgbWF5YmVTaW1wbGUgPSBTZXJEZS5mcm9tU2ltcGxlKG9iaik7XG4gICAgICAgIGlmIChtYXliZVNpbXBsZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgcmV0dXJuIG1heWJlU2ltcGxlO1xuICAgICAgICBpZiAodmlzaXRlZC5oYXMob2JqKSkge1xuICAgICAgICAgICAgdmlzaXRlZC5nZXQob2JqKS50aW1lcysrO1xuICAgICAgICAgICAgcmV0dXJuIHsgdDogKF9iID0gb2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLmNvbnN0cnVjdG9yKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IubmFtZSwgdjogeyBfbWFwSWQ6IFNlckRlLndlYWtNYXAuZ2V0KG9iaikgfSB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgICAgIHJldHVybiB7IHQ6ICdmdW5jdGlvbicsIHY6IG9iai5uYW1lIH07XG4gICAgICAgIGlmIChwYXJlbnQpXG4gICAgICAgICAgICB2aXNpdGVkLnNldChvYmosIHsgdGltZXM6IDEsIHBhcmVudCB9KTtcbiAgICAgICAgbGV0IGlkID0gKF9jID0gU2VyRGUud2Vha01hcC5nZXQob2JqKSkgIT09IG51bGwgJiYgX2MgIT09IHZvaWQgMCA/IF9jIDogU2VyRGUuaWQrKztcbiAgICAgICAgU2VyRGUud2Vha01hcC5zZXQob2JqLCBpZCk7XG4gICAgICAgIC8vIEhhbmRsZSBNYXAgb2JqZWN0c1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBsZXQgc2VyaWFsaXNlZCA9IG5ldyBBcnJheShvYmouc2l6ZSk7XG4gICAgICAgICAgICBfbWFwLnNldChpZCwgc2VyaWFsaXNlZCk7XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICBvYmouZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHNlcmlhbGlzZWRbaV0gPSBbXG4gICAgICAgICAgICAgICAgICAgIFNlckRlLnNlcmlhbGlzZShrZXksIHZpc2l0ZWQsIF9tYXAsIGRlcHRoICsgMSwgeyBvYmo6IHNlcmlhbGlzZWQsIGtleTogW2ksIDBdIH0pLFxuICAgICAgICAgICAgICAgICAgICBTZXJEZS5zZXJpYWxpc2UodmFsdWUsIHZpc2l0ZWQsIF9tYXAsIGRlcHRoICsgMSwgeyBvYmo6IHNlcmlhbGlzZWQsIGtleTogW2ksIDFdIH0pLFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4geyB0OiBvYmouY29uc3RydWN0b3IubmFtZSwgdjogc2VyaWFsaXNlZCB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEhhbmRsZSBTZXQgYW5kIEFycmF5IG9iamVjdHNcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFNldCB8fCBvYmogaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgbGV0IHNlcmlhbGlzZWQgPSBBcnJheShvYmogaW5zdGFuY2VvZiBTZXQgPyBvYmouc2l6ZSA6IG9iai5sZW5ndGgpO1xuICAgICAgICAgICAgX21hcC5zZXQoaWQsIHNlcmlhbGlzZWQpO1xuICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgb2JqLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VyaWFsaXNlZFtpXSA9IFNlckRlLnNlcmlhbGlzZSh2YWx1ZSwgdmlzaXRlZCwgX21hcCwgZGVwdGggKyAxLCB7IG9iajogc2VyaWFsaXNlZCwga2V5OiBpIH0pO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgdDogb2JqLmNvbnN0cnVjdG9yLm5hbWUsIHY6IHNlcmlhbGlzZWQgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBIYW5kbGUgZ2VuZXJpYyBvYmplY3RzXG4gICAgICAgIGxldCBzZXJpYWxpc2VkID0ge307XG4gICAgICAgIF9tYXAuc2V0KGlkLCBzZXJpYWxpc2VkKTtcbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9iaikpIHtcbiAgICAgICAgICAgIHNlcmlhbGlzZWRba2V5XSA9IFNlckRlLnNlcmlhbGlzZSh2YWx1ZSwgdmlzaXRlZCwgX21hcCwgZGVwdGggKyAxLCB7IG9iajogc2VyaWFsaXNlZCwga2V5IH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHdlIGFyZSBhdCB0aGUgdG9wIGxldmVsLCBoYW5kbGUgY2lyY3VsYXIgcmVmZXJlbmNlcyBhbmQgbXVsdGlwbGUgaW5zdGFuY2VzXG4gICAgICAgIGlmIChkZXB0aCA9PT0gMCkge1xuICAgICAgICAgICAgbGV0IHJlY3Vyc2lvblZpc2l0ZWQgPSBBcnJheS5mcm9tKHZpc2l0ZWQpXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoW18sIHZhbF0pID0+IHZhbC50aW1lcyA+IDEpXG4gICAgICAgICAgICAgICAgLm1hcCgoW29iaiwgdmFsXSkgPT4gW1NlckRlLndlYWtNYXAuZ2V0KG9iaiksIHZhbF0pOyAvLyBFeHBsaWNpdGx5IGNhc3QgaWQgdG8gbnVtYmVyXG4gICAgICAgICAgICByZWN1cnNpb25WaXNpdGVkLmZvckVhY2goKFtpZCwgdmFsXSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh2YWwucGFyZW50LmtleSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAgICAgdmFsLnBhcmVudC5vYmpbdmFsLnBhcmVudC5rZXlbMF1dW3ZhbC5wYXJlbnQua2V5WzFdXS52ID0geyBfbWFwSWQ6IGlkIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5wYXJlbnQub2JqW3ZhbC5wYXJlbnQua2V5XS52ID0geyBfbWFwSWQ6IGlkIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBBdHRhY2ggdGhlIF9tYXAgZm9yIHNlcmlhbGl6YXRpb24gcmVzdWx0XG4gICAgICAgICAgICByZXR1cm4geyB0OiAoX2QgPSBvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmouY29uc3RydWN0b3IpID09PSBudWxsIHx8IF9kID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZC5uYW1lLCB2OiBzZXJpYWxpc2VkLCBfbWFwOiByZWN1cnNpb25WaXNpdGVkLm1hcCgoeCkgPT4gW3hbMF0sIF9tYXAuZ2V0KHhbMF0pXSkgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB0OiAoX2UgPSBvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmouY29uc3RydWN0b3IpID09PSBudWxsIHx8IF9lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZS5uYW1lLCB2OiBzZXJpYWxpc2VkIH07XG4gICAgfVxuICAgIC8vIE1haW4gZGVzZXJpYWxpemF0aW9uIG1ldGhvZFxuICAgIHN0YXRpYyBkZXNlcmlhbGl6ZShvYmopIHtcbiAgICAgICAgdmFyIF9hLCBfYiwgX2MsIF9kLCBfZSwgX2YsIF9nLCBfaCwgX2osIF9rLCBfbDtcbiAgICAgICAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIGlmICgob2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLnQpID09PSAnRGF0ZScpXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUob2JqLnYpO1xuICAgICAgICAvLyBJZiBvYmogaXMgYSBwcmltaXRpdmUsIHJldHVybiBpdCBkaXJlY3RseSAod2l0aCBEYXRlIGhhbmRsaW5nKVxuICAgICAgICBpZiAoU2VyRGUuaXNQcmltaXRpdmUob2JqKSkge1xuICAgICAgICAgICAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIERhdGUgPyBuZXcgRGF0ZShvYmopIDogb2JqO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvYmoudCA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIHJldHVybiAoX2EgPSBTZXJEZS5jbGFzc1JlZ2lzdHJ5LmdldChvYmoudikpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IHt9O1xuICAgICAgICAvLyBIYW5kbGVzIHRoZSByZXN0b3JhdGlvbiBvZiBfbWFwIGZvciBvYmplY3QgcmVmZXJlbmNlcyBpZiBpdCBleGlzdHNcbiAgICAgICAgaWYgKG9iai5fbWFwKSB7XG4gICAgICAgICAgICBTZXJEZS5fbWFwID0gbmV3IE1hcChvYmouX21hcCk7XG4gICAgICAgICAgICBTZXJEZS5fdGVtcE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXRyaWV2ZSB0aGUgY2xhc3MgY29uc3RydWN0b3IgaWYgYXZhaWxhYmxlXG4gICAgICAgIGNvbnN0IGNsYXNzQ29uc3RydWN0b3IgPSBTZXJEZS5jbGFzc1JlZ2lzdHJ5LmdldChvYmoudCk7XG4gICAgICAgIGxldCBpbnN0YW5jZTtcbiAgICAgICAgaWYgKCgoX2IgPSBvYmoudikgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLl9tYXBJZCkgJiYgKChfYyA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2MuaGFzKG9iai52Ll9tYXBJZCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gKF9kID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9kID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZC5nZXQob2JqLnYuX21hcElkKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGluc3RhbmNlID0gY2xhc3NDb25zdHJ1Y3RvciA/IE9iamVjdC5jcmVhdGUoY2xhc3NDb25zdHJ1Y3Rvci5wcm90b3R5cGUpIDoge307XG4gICAgICAgICAgICAoX2UgPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2UgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9lLnNldChvYmoudi5fbWFwSWQsIGluc3RhbmNlKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbmVzdGVkID0gKF9oID0gKF9mID0gU2VyRGUuX21hcCkgPT09IG51bGwgfHwgX2YgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9mLmdldCgoX2cgPSBvYmoudikgPT09IG51bGwgfHwgX2cgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9nLl9tYXBJZCkpICE9PSBudWxsICYmIF9oICE9PSB2b2lkIDAgPyBfaCA6IG9iai52O1xuICAgICAgICAvLyBEZXNlcmlhbGl6ZSBiYXNlZCBvbiB0aGUgdHlwZSBvZiBvYmplY3RcbiAgICAgICAgc3dpdGNoIChvYmoudCkge1xuICAgICAgICAgICAgY2FzZSAnQXJyYXknOiAvLyBIYW5kbGUgYXJyYXlzXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXN0ZWQubWFwKChpdGVtKSA9PiBTZXJEZS5kZXNlcmlhbGl6ZShpdGVtKSk7XG4gICAgICAgICAgICAgICAgKF9qID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9qID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfai5zZXQob2JqLnYuX21hcElkLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICAgICAgY2FzZSAnTWFwJzogLy8gSGFuZGxlIG1hcHNcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBNYXAobmVzdGVkLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBbU2VyRGUuZGVzZXJpYWxpemUoa2V5KSwgU2VyRGUuZGVzZXJpYWxpemUodmFsdWUpXSkpO1xuICAgICAgICAgICAgICAgIChfayA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfayA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2suc2V0KG9iai52Ll9tYXBJZCwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgICAgIGNhc2UgJ1NldCc6IC8vIEhhbmRsZSBzZXRzXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgU2V0KG5lc3RlZC5tYXAoKGl0ZW0pID0+IFNlckRlLmRlc2VyaWFsaXplKGl0ZW0pKSk7XG4gICAgICAgICAgICAgICAgKF9sID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9sID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfbC5zZXQob2JqLnYuX21hcElkLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICAgICAgZGVmYXVsdDogLy8gSGFuZGxlIG9iamVjdHNcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhuZXN0ZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW2tleV0gPSBTZXJEZS5kZXNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjbGFzc0NvbnN0cnVjdG9yICYmIFNlckRlLmluaXRGdW5jTmFtZSAmJiB0eXBlb2YgaW5zdGFuY2VbU2VyRGUuaW5pdEZ1bmNOYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtTZXJEZS5pbml0RnVuY05hbWVdKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIENsZWFyIHRoZSBfbWFwIGFmdGVyIGRlc2VyaWFsaXphdGlvbiBpcyBjb21wbGV0ZSB0byBmcmVlIG1lbW9yeVxuICAgICAgICBpZiAob2JqLl9tYXApIHtcbiAgICAgICAgICAgIFNlckRlLl9tYXAgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBTZXJEZS5fdGVtcE1hcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7IC8vIFJldHVybiB0aGUgZGVzZXJpYWxpemVkIGluc3RhbmNlXG4gICAgfVxuICAgIC8vIE1ldGhvZCB0byByZWdpc3RlciBjbGFzc2VzIGZvciBkZXNlcmlhbGl6YXRpb25cbiAgICBzdGF0aWMgY2xhc3NSZWdpc3RyYXRpb24oY2xhc3Nlcykge1xuICAgICAgICBjbGFzc2VzLmZvckVhY2goKHgpID0+IFNlckRlLmNsYXNzUmVnaXN0cnkuc2V0KHgubmFtZSwgeCkpO1xuICAgIH1cbiAgICAvLyBIZWxwZXIgbWV0aG9kIHRvIGNoZWNrIGlmIGEgdmFsdWUgaXMgcHJpbWl0aXZlXG4gICAgc3RhdGljIGlzUHJpbWl0aXZlKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiAodmFsdWUgPT09IG51bGwgfHxcbiAgICAgICAgICAgIFsnbnVtYmVyJywgJ3N0cmluZycsICdib29sZWFuJywgJ3VuZGVmaW5lZCcsICdzeW1ib2wnLCAnYmlnaW50J10uaW5jbHVkZXModHlwZW9mIHZhbHVlKSB8fFxuICAgICAgICAgICAgdmFsdWUgaW5zdGFuY2VvZiBEYXRlKTtcbiAgICB9XG59XG5leHBvcnRzLlNlckRlID0gU2VyRGU7XG5TZXJEZS5pbml0RnVuY05hbWUgPSAnX2luaXRGbic7IC8vIE5hbWUgb2YgdGhlIGluaXRpYWxpemF0aW9uIGZ1bmN0aW9uIChpZiBleGlzdHMpXG5TZXJEZS5pZCA9IDA7IC8vIFVuaXF1ZSBJRCBjb3VudGVyIGZvciBvYmplY3RzXG5TZXJEZS53ZWFrTWFwID0gbmV3IFdlYWtNYXAoKTsgLy8gV2Vha01hcCB0byB0cmFjayBvYmplY3RzIGR1cmluZyBzZXJpYWxpemF0aW9uXG5TZXJEZS5jbGFzc1JlZ2lzdHJ5ID0gbmV3IE1hcChbXG4gICAgWydBcnJheScsIEFycmF5XSxcbiAgICBbJ1NldCcsIFNldF0sXG4gICAgWydNYXAnLCBNYXBdLFxuXSk7IC8vIFJlZ2lzdHJ5IG9mIGNsYXNzZXMgZm9yIGRlc2VyaWFsaXphdGlvblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHBvcnRzLCBwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIHNyYy9pbmRleC50c1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL1NlckRlXCIpLCBleHBvcnRzKTtcbiIsImV4cG9ydCBjbGFzcyBGcmFtZUdyb3VwIHtcbiAgICBzdGFydFRpbWU6IG51bWJlcjtcbiAgICBmcmFtZUludGVydmFsOiBudW1iZXI7XG4gICAgZnJhbWVDb3VudDogbnVtYmVyO1xuICAgIGZyYW1lc1BlclNlY29uZDogbnVtYmVyO1xuICAgIGZyYW1lUG9zaXRpb25zOiBudW1iZXJbXTtcbiAgICB0b3RhbEhlaWdodDogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihzdGFydFRpbWU6IG51bWJlciwgZnJhbWVJbnRlcnZhbDogbnVtYmVyLCBmcmFtZUNvdW50OiBudW1iZXIsIGZyYW1lc1BlclNlY29uZDogbnVtYmVyLCBmcmFtZVBvc2l0aW9uczogbnVtYmVyW10sIHRvdGFsSGVpZ2h0OiBudW1iZXIsIHdpZHRoOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBzdGFydFRpbWU7XG4gICAgICAgIHRoaXMuZnJhbWVJbnRlcnZhbCA9IGZyYW1lSW50ZXJ2YWw7XG4gICAgICAgIHRoaXMuZnJhbWVDb3VudCA9IGZyYW1lQ291bnQ7XG4gICAgICAgIHRoaXMuZnJhbWVzUGVyU2Vjb25kID0gZnJhbWVzUGVyU2Vjb25kO1xuICAgICAgICB0aGlzLmZyYW1lUG9zaXRpb25zID0gZnJhbWVQb3NpdGlvbnM7XG4gICAgICAgIHRoaXMudG90YWxIZWlnaHQgPSB0b3RhbEhlaWdodDtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIH1cbn1cbiIsImltcG9ydCB7TWF0cml4RWxlbWVudH0gZnJvbSBcIi4vTWF0cml4RWxlbWVudFwiO1xuaW1wb3J0IHtGcmFtZUdyb3VwfSBmcm9tIFwiLi9GcmFtZUdyb3VwXCI7XG5cbmV4cG9ydCBjbGFzcyBNYXRyaXgge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgZnJhbWVzUGVyU2Vjb25kOiBudW1iZXI7XG4gICAgZnJhbWVzUGVyR3JvdXA6IG51bWJlcjtcbiAgICBzdGFydFRpbWU6IG51bWJlcjtcbiAgICBsYXN0RW5kVGltZTogbnVtYmVyO1xuICAgIHByaXZhdGUgZWxlbWVudElkQ291bnRlcjogbnVtYmVyID0gMDtcbiAgICBwdWJsaWMgZWxlbWVudHM6IE1hdHJpeEVsZW1lbnRbXSA9IFtdO1xuXG5cbiAgICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgZnJhbWVzUGVyU2Vjb25kOiBudW1iZXIsIGZyYW1lc1Blckdyb3VwOiBudW1iZXIsIHN0YXJ0VGltZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuZnJhbWVzUGVyU2Vjb25kID0gZnJhbWVzUGVyU2Vjb25kO1xuICAgICAgICB0aGlzLmZyYW1lc1Blckdyb3VwID0gZnJhbWVzUGVyR3JvdXA7XG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gc3RhcnRUaW1lO1xuICAgICAgICB0aGlzLmxhc3RFbmRUaW1lID0gc3RhcnRUaW1lO1xuICAgIH1cblxuICAgIGdlbmVyYXRlRWxlbWVudElkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgZWxlbWVudC0ke3RoaXMuZWxlbWVudElkQ291bnRlcisrfWA7XG4gICAgfVxuXG4gICAgc2V0U3RhcnRUaW1lKG5ld1N0YXJ0VGltZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gbmV3U3RhcnRUaW1lO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnN0YXJ0VGltZSlcbiAgICAgICAgdGhpcy5sYXN0RW5kVGltZSA9IG5ld1N0YXJ0VGltZTtcbiAgICB9XG5cbiAgICBnZW5lcmF0ZU5leHRHcm91cChjb250YWluZXI6IEhUTUxFbGVtZW50LCBtYXRyaXhFbGVtZW50czogTWF0cml4RWxlbWVudFtdKTogRnJhbWVHcm91cCB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nRnJhbWVzID0gQXJyYXkuZnJvbShjb250YWluZXIuY2hpbGRyZW4pIGFzIEhUTUxFbGVtZW50W107XG4gICAgICAgIGNvbnN0IGZyYW1lSW50ZXJ2YWwgPSAxMDAwIC8gdGhpcy5mcmFtZXNQZXJTZWNvbmQ7XG4gICAgICAgIGNvbnN0IGZyYW1lQ291bnQgPSB0aGlzLmZyYW1lc1Blckdyb3VwO1xuXG4gICAgICAgIC8vINCd0LDRh9Cw0LvQviDQvdC+0LLQvtC5INCz0YDRg9C/0L/Ri1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSB0aGlzLmxhc3RFbmRUaW1lO1xuICAgICAgICBjb25zdCBmcmFtZVBvc2l0aW9ucyA9IEFycmF5LmZyb20oe2xlbmd0aDogZnJhbWVDb3VudH0sIChfLCBpKSA9PiBzdGFydFRpbWUgKyBpICogZnJhbWVJbnRlcnZhbCk7XG4gICAgICAgIHRoaXMubGFzdEVuZFRpbWUgPSBzdGFydFRpbWUgKyBmcmFtZUludGVydmFsICogZnJhbWVDb3VudDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZyYW1lQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgbGV0IGZyYW1lOiBIVE1MRWxlbWVudDtcblxuICAgICAgICAgICAgaWYgKGkgPCBleGlzdGluZ0ZyYW1lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvLyDQmNGB0L/QvtC70YzQt9GD0LXQvCDRgdGD0YnQtdGB0YLQstGD0Y7RidC40Lkg0Y3Qu9C10LzQtdC90YJcbiAgICAgICAgICAgICAgICBmcmFtZSA9IGV4aXN0aW5nRnJhbWVzW2ldO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDQodC+0LfQtNCw0LXQvCDQvdC+0LLRi9C5INGN0LvQtdC80LXQvdGCLCDQtdGB0LvQuCDQtdCz0L4g0LXRidC1INC90LXRglxuICAgICAgICAgICAgICAgIGZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgZnJhbWUuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgICAgIGZyYW1lLnN0eWxlLndpZHRoID0gYCR7dGhpcy53aWR0aH1weGA7XG4gICAgICAgICAgICAgICAgZnJhbWUuc3R5bGUuaGVpZ2h0ID0gYCR7dGhpcy5oZWlnaHR9cHhgO1xuICAgICAgICAgICAgICAgIGZyYW1lLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGZyYW1lKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnJhbWUuc3R5bGUudG9wID0gYCR7aSAqIHRoaXMuaGVpZ2h0fXB4YDtcblxuICAgICAgICAgICAgLy8g0J7Rh9C40YnQsNC10Lwg0YHQvtC00LXRgNC20LjQvNC+0LUg0YTRgNC10LnQvNCwINC/0LXRgNC10LQg0LTQvtCx0LDQstC70LXQvdC40LXQvCDQvdC+0LLRi9GFINGN0LvQtdC80LXQvdGC0L7QslxuICAgICAgICAgICAgZnJhbWUuaW5uZXJIVE1MID0gJyc7XG5cbiAgICAgICAgICAgIG1hdHJpeEVsZW1lbnRzLnNvcnQoKGEsIGIpID0+IGIubGF5ZXIgLSBhLmxheWVyKVxuICAgICAgICAgICAgLy8g0J/RgNC40LzQtdC90Y/QtdC8INC80L7QtNC40YTQuNC60LDRgtC+0YDRiyDQuCDRgNC10L3QtNC10YDQuNC8INC60LDQttC00YvQuSDRjdC70LXQvNC10L3RgiDQvNCw0YLRgNC40YbRi1xuICAgICAgICAgICAgZm9yIChjb25zdCBtYXRyaXhFbGVtZW50IG9mIG1hdHJpeEVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgbWF0cml4RWxlbWVudC5hcHBseU1vZGlmaWVycyhmcmFtZVBvc2l0aW9uc1tpXSk7XG4gICAgICAgICAgICAgICAgbWF0cml4RWxlbWVudC5yZW5kZXJUbyhmcmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDQo9C00LDQu9GP0LXQvCDQu9C40YjQvdC40LUg0Y3Qu9C10LzQtdC90YLRiywg0LXRgdC70Lgg0L7QvdC4INC10YHRgtGMXG4gICAgICAgIGlmIChleGlzdGluZ0ZyYW1lcy5sZW5ndGggPiBmcmFtZUNvdW50KSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gZXhpc3RpbmdGcmFtZXMubGVuZ3RoIC0gMTsgaiA+PSBmcmFtZUNvdW50OyBqLS0pIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoZXhpc3RpbmdGcmFtZXNbal0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdG90YWxIZWlnaHQgPSB0aGlzLmhlaWdodCAqIGZyYW1lQ291bnQ7XG4gICAgICAgIHJldHVybiBuZXcgRnJhbWVHcm91cChzdGFydFRpbWUsIGZyYW1lSW50ZXJ2YWwsIGZyYW1lQ291bnQsIHRoaXMuZnJhbWVzUGVyU2Vjb25kLCBmcmFtZVBvc2l0aW9ucywgdG90YWxIZWlnaHQsIHRoaXMud2lkdGgpO1xuICAgIH1cblxuICAgIGFkZEVsZW1lbnQobWF0cml4RWxlbWVudDogTWF0cml4RWxlbWVudCkge1xuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudHMuaW5jbHVkZXMobWF0cml4RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMucHVzaChtYXRyaXhFbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgcmVtb3ZlRWxlbWVudChtYXRyaXhFbGVtZW50OiBNYXRyaXhFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSB0aGlzLmVsZW1lbnRzLmZpbHRlcih4ID0+IHggIT09IG1hdHJpeEVsZW1lbnQpXG4gICAgfVxuXG4gICAgY2xlYXJFbGVtZW50cygpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50cyA9IFtdXG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRHluYW1pY01vZGlmaWVyIH0gZnJvbSBcIi4vTW9kaWZpZXJzXCI7XG5pbXBvcnQgeyBNYXRyaXggfSBmcm9tIFwiLi9NYXRyaXhcIjtcblxuZXhwb3J0IGNsYXNzIE1hdHJpeEVsZW1lbnQge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY29udGVudDogc3RyaW5nIHwgSFRNTEltYWdlRWxlbWVudCB8IFNWR0VsZW1lbnQ7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIG1vZGlmaWVyczogRHluYW1pY01vZGlmaWVyW107XG4gICAgdGV4dFdpZHRoOiBudW1iZXI7XG4gICAgdmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG4gICAgbGF5ZXIgPSAwO1xuICAgIHRleHRVcGRhdGVDYWxsYmFjaz86ICh0aW1lc3RhbXA6IG51bWJlcikgPT4gc3RyaW5nO1xuICAgIHRleHRTdHlsZTogUGFydGlhbDxDU1NTdHlsZURlY2xhcmF0aW9uPjtcbiAgICBhZGRpdGlvbmFsU3R5bGVzOiBQYXJ0aWFsPENTU1N0eWxlRGVjbGFyYXRpb24+OyAgLy8g0J3QvtCy0L7QtSDQv9C+0LvQtSDQtNC70Y8g0LTQvtC/0L7Qu9C90LjRgtC10LvRjNC90YvRhSDRgdGC0LjQu9C10LlcblxuICAgIGNvbnN0cnVjdG9yKG1hdHJpeDogTWF0cml4LCBjb250ZW50OiBzdHJpbmcgfCBIVE1MSW1hZ2VFbGVtZW50IHwgU1ZHRWxlbWVudCwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuaWQgPSBtYXRyaXguZ2VuZXJhdGVFbGVtZW50SWQoKTtcbiAgICAgICAgdGhpcy5jb250ZW50ID0gY29udGVudDtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5tb2RpZmllcnMgPSBbXTtcbiAgICAgICAgdGhpcy50ZXh0U3R5bGUgPSB7fTtcbiAgICAgICAgdGhpcy5hZGRpdGlvbmFsU3R5bGVzID0ge307ICAvLyDQmNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDQvdC+0LLQvtCz0L4g0L/QvtC70Y9cblxuICAgICAgICB0aGlzLnRleHRXaWR0aCA9IHRoaXMuY2FsY3VsYXRlVGV4dFdpZHRoKCk7XG4gICAgfVxuXG4gICAgLy8g0JzQtdGC0L7QtCDQtNC70Y8g0LLRi9GH0LjRgdC70LXQvdC40Y8g0YjQuNGA0LjQvdGLINGC0LXQutGB0YLQsCDQsdC10Lcg0LTQvtCx0LDQstC70LXQvdC40Y8g0Y3Qu9C10LzQtdC90YLQsCDQsiBET01cbiAgICBjYWxjdWxhdGVUZXh0V2lkdGgoKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgdGVtcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0ZW1wRGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgdGVtcERpdi5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAgIHRlbXBEaXYuc3R5bGUud2hpdGVTcGFjZSA9ICdub3dyYXAnO1xuICAgICAgICB0ZW1wRGl2LnN0eWxlLmZvbnQgPSB0aGlzLnRleHRTdHlsZS5mb250IHx8ICcxNnB4IEFyaWFsJztcbiAgICAgICAgdGVtcERpdi5pbm5lclRleHQgPSB0aGlzLmNvbnRlbnQgYXMgc3RyaW5nO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRlbXBEaXYpO1xuICAgICAgICBjb25zdCB3aWR0aCA9IHRlbXBEaXYuY2xpZW50V2lkdGg7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGVtcERpdik7XG4gICAgICAgIHJldHVybiB3aWR0aDtcbiAgICB9XG5cbiAgICBzZXRUZXh0KG5ld1RleHQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNvbnRlbnQgPSBuZXdUZXh0O1xuICAgICAgICAvLyB0aGlzLnRleHRXaWR0aCA9IHRoaXMuY2FsY3VsYXRlVGV4dFdpZHRoKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlVGV4dFN0eWxlKG5ld1N0eWxlczogUGFydGlhbDxDU1NTdHlsZURlY2xhcmF0aW9uPikge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMudGV4dFN0eWxlLCBuZXdTdHlsZXMpO1xuICAgICAgICB0aGlzLnRleHRXaWR0aCA9IHRoaXMuY2FsY3VsYXRlVGV4dFdpZHRoKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlQWRkaXRpb25hbFN0eWxlcyhuZXdTdHlsZXM6IFBhcnRpYWw8Q1NTU3R5bGVEZWNsYXJhdGlvbj4pIHsgIC8vINCd0L7QstGL0Lkg0LzQtdGC0L7QtCDQtNC70Y8g0L7QsdC90L7QstC70LXQvdC40Y8g0LTQvtC/0L7Qu9C90LjRgtC10LvRjNC90YvRhSDRgdGC0LjQu9C10LlcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLmFkZGl0aW9uYWxTdHlsZXMsIG5ld1N0eWxlcyk7XG4gICAgfVxuXG4gICAgc2V0VGV4dFVwZGF0ZUNhbGxiYWNrKGNhbGxiYWNrOiAodGltZXN0YW1wOiBudW1iZXIpID0+IHN0cmluZykge1xuICAgICAgICB0aGlzLnRleHRVcGRhdGVDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIGFwcGx5TW9kaWZpZXJzKHRpbWVzdGFtcDogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLnRleHRVcGRhdGVDYWxsYmFjaykge1xuICAgICAgICAgICAgY29uc3QgbmV3VGV4dCA9IHRoaXMudGV4dFVwZGF0ZUNhbGxiYWNrKHRpbWVzdGFtcCk7XG4gICAgICAgICAgICB0aGlzLnNldFRleHQobmV3VGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBtb2RpZmllciBvZiB0aGlzLm1vZGlmaWVycykge1xuICAgICAgICAgICAgbW9kaWZpZXIuYXBwbHkodGltZXN0YW1wKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZE1vZGlmaWVyKG1vZGlmaWVyOiBEeW5hbWljTW9kaWZpZXIpIHtcbiAgICAgICAgdGhpcy5tb2RpZmllcnMucHVzaChtb2RpZmllcik7XG4gICAgfVxuXG4gICAgcmVuZGVyVG8oY29udGFpbmVyOiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZVRleHRXaWR0aCgpXG4gICAgICAgIGlmICghdGhpcy52aXNpYmxlKSByZXR1cm47XG4gICAgICAgIC8vINCY0YnQtdC8INGB0YPRidC10YHRgtCy0YPRjtGJ0LjQuSDRjdC70LXQvNC10L3RgiDQsiDQutC+0L3RgtC10LnQvdC10YDQtSDQv9C+IGlkXG4gICAgICAgIGxldCBkaXYgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihgIyR7dGhpcy5pZH1gKSBhcyBIVE1MRWxlbWVudDtcblxuICAgICAgICBpZiAoIWRpdikge1xuICAgICAgICAgICAgLy8g0JXRgdC70Lgg0Y3Qu9C10LzQtdC90YIg0L3QtSDQvdCw0LnQtNC10L0sINGB0L7Qt9C00LDQtdC8INC90L7QstGL0LlcbiAgICAgICAgICAgIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZGl2LmlkID0gdGhpcy5pZDtcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g0J7QsdC90L7QstC70Y/QtdC8INGB0LLQvtC50YHRgtCy0LAg0Y3Qu9C10LzQtdC90YLQsFxuICAgICAgICBkaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBkaXYuc3R5bGUubGVmdCA9IGAke01hdGguZmxvb3IodGhpcy54ICsgMC4wMDAxKX1weGA7XG4gICAgICAgIGRpdi5zdHlsZS50b3AgPSBgJHtNYXRoLmZsb29yKHRoaXMueSArIDAuMDAwMSl9cHhgO1xuICAgICAgICBkaXYuc3R5bGUud2lkdGggPSBgJHt0aGlzLndpZHRofXB4YDtcbiAgICAgICAgZGl2LnN0eWxlLmhlaWdodCA9IGAke3RoaXMuaGVpZ2h0fXB4YDtcbiAgICAgICAgZGl2LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG5cbiAgICAgICAgLy8g0J/RgNC40LzQtdC90Y/QtdC8INC+0YHQvdC+0LLQvdGL0LUg0YHRgtC40LvQuCDQuCDQtNC+0L/QvtC70L3QuNGC0LXQu9GM0L3Ri9C1INGB0YLQuNC70LhcbiAgICAgICAgT2JqZWN0LmFzc2lnbihkaXYuc3R5bGUsIHRoaXMudGV4dFN0eWxlLCB0aGlzLmFkZGl0aW9uYWxTdHlsZXMpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5jb250ZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZGl2LmlubmVyVGV4dCA9IHRoaXMuY29udGVudDtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmNvbnRlbnQgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50IHx8IHRoaXMuY29udGVudCBpbnN0YW5jZW9mIFNWR0VsZW1lbnQpIHtcbiAgICAgICAgICAgIGRpdi5pbm5lckhUTUwgPSAnJzsgLy8g0J7Rh9C40YHRgtC60LAg0L/QtdGA0LXQtCDQtNC+0LHQsNCy0LvQtdC90LjQtdC8XG4gICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQodGhpcy5jb250ZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRpbWVNYXRyaXhFbGVtZW50IGV4dGVuZHMgTWF0cml4RWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IobWF0cml4OiBNYXRyaXgsIGNvbnRlbnQ6IHN0cmluZyB8IEhUTUxJbWFnZUVsZW1lbnQgfCBTVkdFbGVtZW50LCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgc3VwZXIobWF0cml4LCBjb250ZW50LCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5faW5pdEZuKCk7XG4gICAgfVxuXG4gICAgX2luaXRGbigpIHtcbiAgICAgICAgdGhpcy5zZXRUZXh0VXBkYXRlQ2FsbGJhY2soKHRpbWVzdGFtcCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUodGltZXN0YW1wKTtcbiAgICAgICAgICAgIHJldHVybiBub3cudG9JU09TdHJpbmcoKS5zdWJzdHIoMTEsIDEyKTsgLy8g0KTQvtGA0LzQsNGCINCy0YDQtdC80LXQvdC4INGBINC80LjQu9C70LjRgdC10LrRg9C90LTQsNC80LggKEhIOm1tOnNzLnNzcylcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtNYXRyaXhFbGVtZW50fSBmcm9tIFwiLi9NYXRyaXhFbGVtZW50XCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEeW5hbWljTW9kaWZpZXIge1xuICAgIHByb3RlY3RlZCBlbGVtZW50OiBNYXRyaXhFbGVtZW50O1xuICAgIGZyYW1lc1BlclNlY29uZDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogTWF0cml4RWxlbWVudCwgZnJhbWVzUGVyU2Vjb25kPzogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuZnJhbWVzUGVyU2Vjb25kID0gZnJhbWVzUGVyU2Vjb25kXG4gICAgICAgIGVsZW1lbnQuYWRkTW9kaWZpZXIodGhpcylcbiAgICB9XG5cbiAgICBhYnN0cmFjdCBhcHBseSh0aW1lc3RhbXA6IG51bWJlcik6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBSb3RhdGlvbk1vZGlmaWVyIGV4dGVuZHMgRHluYW1pY01vZGlmaWVyIHtcbiAgICBhbmdsZTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogTWF0cml4RWxlbWVudCwgYW5nbGU6IG51bWJlcikge1xuICAgICAgICBzdXBlcihlbGVtZW50KTtcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xuICAgIH1cblxuICAgIGFwcGx5KHRpbWVzdGFtcDogbnVtYmVyKSB7XG4gICAgICAgIC8vINCX0LTQtdGB0Ywg0LzQvtC20L3QviDQv9GA0LjQvNC10L3QuNGC0Ywg0LLRgNCw0YnQtdC90LjQtSDQtNC70Y8g0YDQsNGB0YfQtdGC0L7Qsiwg0LXRgdC70Lgg0Y3RgtC+INC40LzQtdC10YIg0YHQvNGL0YHQu1xuICAgICAgICBjb25zdCByb3RhdGlvbiA9IHRoaXMuYW5nbGUgKiAodGltZXN0YW1wIC8gMTAwMCk7XG4gICAgICAgIC8vINCd0LDQv9GA0LjQvNC10YAsINC80Ysg0LzQvtC20LXQvCDRgdC+0YXRgNCw0L3QuNGC0Ywg0YPQs9C+0Lsg0LLRgNCw0YnQtdC90LjRjyDQuNC70Lgg0LTRgNGD0LPRg9GOINC40L3RhNC+0YDQvNCw0YbQuNGOINCyINGN0LvQtdC80LXQvdGC0LVcbiAgICAgICAgLy8g0J3QviDRjdGC0L4g0LHRg9C00LXRgiDRh9C40YHRgtC+INC00LvRjyDQu9C+0LPQuNC60LgsINC90LUg0LTQu9GPINC/0YDRj9C80L7Qs9C+INGA0LXQvdC00LXRgNC40L3Qs9CwINCyIERPTVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJhaW5ib3dFZmZlY3RNb2RpZmllciBleHRlbmRzIER5bmFtaWNNb2RpZmllciB7XG4gICAgcGVyaW9kOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBNYXRyaXhFbGVtZW50LCBwZXJpb2Q6IG51bWJlcikge1xuICAgICAgICBzdXBlcihlbGVtZW50KTtcbiAgICAgICAgdGhpcy5wZXJpb2QgPSBwZXJpb2Q7XG4gICAgfVxuXG4gICAgYXBwbHkodGltZXN0YW1wOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgcGhhc2UgPSAodGltZXN0YW1wICUgdGhpcy5wZXJpb2QpIC8gdGhpcy5wZXJpb2Q7XG4gICAgICAgIGNvbnN0IGh1ZSA9IE1hdGguZmxvb3IocGhhc2UgKiAzNjApO1xuICAgICAgICB0aGlzLmVsZW1lbnQudXBkYXRlVGV4dFN0eWxlKHtjb2xvcjogYGhzbCgke2h1ZX0sIDEwMCUsIDUwJSlgfSk7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBTY3JvbGxpbmdUZXh0TW9kaWZpZXIgZXh0ZW5kcyBEeW5hbWljTW9kaWZpZXIge1xuICAgIHNwZWVkUGl4ZWxzUGVyU2Vjb25kOiBudW1iZXI7XG4gICAgcHJldmlvdXNUaW1lOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IE1hdHJpeEVsZW1lbnQsIHNwZWVkUGl4ZWxzUGVyU2Vjb25kOiBudW1iZXIsIGZyYW1lc1BlclNlY29uZDogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGZyYW1lc1BlclNlY29uZCk7XG4gICAgICAgIHRoaXMuc3BlZWRQaXhlbHNQZXJTZWNvbmQgPSBzcGVlZFBpeGVsc1BlclNlY29uZDtcbiAgICAgICAgdGhpcy5wcmV2aW91c1RpbWUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgYXBwbHkodGltZXN0YW1wOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLnByZXZpb3VzVGltZSkge1xuICAgICAgICAgICAgdGhpcy5wcmV2aW91c1RpbWUgPSB0aW1lc3RhbXA7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQueCA9IHRoaXMuZWxlbWVudC53aWR0aDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWxlbWVudC54IC09IHRoaXMuc3BlZWRQaXhlbHNQZXJTZWNvbmQgKiAodGltZXN0YW1wIC0gdGhpcy5wcmV2aW91c1RpbWUpIC8gMTAwMDtcbiAgICAgICAgdGhpcy5wcmV2aW91c1RpbWUgPSB0aW1lc3RhbXA7XG5cbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudC54ICsgdGhpcy5lbGVtZW50LnRleHRXaWR0aCA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC54ID0gdGhpcy5lbGVtZW50LndpZHRoO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQmxpbmtNb2RpZmllciBleHRlbmRzIER5bmFtaWNNb2RpZmllciB7XG4gICAgYXBwbHkodGltZXN0YW1wOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IHQgPSB0aW1lc3RhbXAgJSAxMDAwXG4gICAgICAgIHRoaXMuZWxlbWVudC52aXNpYmxlID0gdCA8IDUwMFxuICAgIH1cblxufVxuXG5leHBvcnQgY2xhc3MgU2NhbGVNb2RpZmllciBleHRlbmRzIER5bmFtaWNNb2RpZmllciB7XG4gICAgYXBwbHkodGltZXN0YW1wOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgLy8g0JLRi9GH0LjRgdC70Y/QtdC8INC80LDRgdGI0YLQsNCxINC90LAg0L7RgdC90L7QstC1INCy0YDQtdC80LXQvdC4XG4gICAgICAgIGxldCB0ID0gKHRpbWVzdGFtcCAlIDIwMDApIC8gMjAwMDtcbiAgICAgICAgaWYgKHQgPiAwLjUpIHQgPSAxIC0gdFxuICAgICAgICB0ID0gMSArIHRcblxuICAgICAgICAvLyDQn9GA0LjQvNC10L3Rj9C10Lwg0LzQsNGB0YjRgtCw0LHQuNGA0L7QstCw0L3QuNC1INC6INGN0LvQtdC80LXQvdGC0YNcbiAgICAgICAgdGhpcy5lbGVtZW50LnVwZGF0ZUFkZGl0aW9uYWxTdHlsZXMoe1xuICAgICAgICAgICAgdHJhbnNmb3JtOiBgc2NhbGUoJHt0fSlgXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5cbmludGVyZmFjZSBSZXBvcnRGaWx0ZXIge1xuICAgIG1pblRpbWU/OiBudW1iZXI7XG4gICAgdmlzaXRzPzogbnVtYmVyO1xuICAgIHJlcXVpcmVEZXBlbmRlbmNpZXM/OiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgUG9pbnRUcmFja2VyIHtcbiAgICBwcml2YXRlIHBvaW50czogTWFwPHN0cmluZywgUG9pbnREYXRhPjtcbiAgICBwcml2YXRlIGxhc3RUaW1lc3RhbXBzOiBNYXA8c3RyaW5nLCBudW1iZXI+O1xuICAgIHByaXZhdGUgbGFzdFBvaW50OiBzdHJpbmcgfCBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucG9pbnRzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmxhc3RUaW1lc3RhbXBzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmxhc3RQb2ludCA9IG51bGw7XG4gICAgfVxuXG4gICAgcG9pbnQocG9pbnROYW1lOiBzdHJpbmcsIGNoZWNrUG9pbnRzPzogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IERhdGUubm93KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnBvaW50cy5oYXMocG9pbnROYW1lKSkge1xuICAgICAgICAgICAgdGhpcy5wb2ludHMuc2V0KHBvaW50TmFtZSwgbmV3IFBvaW50RGF0YSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGN1cnJlbnRQb2ludERhdGEgPSB0aGlzLnBvaW50cy5nZXQocG9pbnROYW1lKSE7XG5cbiAgICAgICAgaWYgKHRoaXMubGFzdFRpbWVzdGFtcHMuaGFzKHBvaW50TmFtZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVTaW5jZUxhc3RWaXNpdCA9IGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZXN0YW1wcy5nZXQocG9pbnROYW1lKSE7XG4gICAgICAgICAgICBjdXJyZW50UG9pbnREYXRhLnVwZGF0ZUl0ZXJhdGlvblRpbWUodGltZVNpbmNlTGFzdFZpc2l0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRQb2ludERhdGEuaW5jcmVtZW50VmlzaXRzKCk7XG5cbiAgICAgICAgaWYgKGNoZWNrUG9pbnRzKSB7XG4gICAgICAgICAgICBjaGVja1BvaW50cy5mb3JFYWNoKChjaGVja1BvaW50TmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxhc3RUaW1lc3RhbXBzLmhhcyhjaGVja1BvaW50TmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltZVNwZW50ID0gY3VycmVudFRpbWUgLSB0aGlzLmxhc3RUaW1lc3RhbXBzLmdldChjaGVja1BvaW50TmFtZSkhO1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50UG9pbnREYXRhLnVwZGF0ZVRyYW5zaXRpb24oY2hlY2tQb2ludE5hbWUsIHRpbWVTcGVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5sYXN0UG9pbnQgIT09IG51bGwgJiYgdGhpcy5sYXN0UG9pbnQgIT09IHBvaW50TmFtZSkge1xuICAgICAgICAgICAgY29uc3QgdGltZVNwZW50ID0gY3VycmVudFRpbWUgLSB0aGlzLmxhc3RUaW1lc3RhbXBzLmdldCh0aGlzLmxhc3RQb2ludCkhO1xuICAgICAgICAgICAgY3VycmVudFBvaW50RGF0YS51cGRhdGVUcmFuc2l0aW9uKHRoaXMubGFzdFBvaW50ICsgXCIgKHByZXZpb3VzKVwiLCB0aW1lU3BlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sYXN0VGltZXN0YW1wcy5zZXQocG9pbnROYW1lLCBjdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMubGFzdFBvaW50ID0gcG9pbnROYW1lO1xuICAgIH1cblxuICAgIHJlcG9ydChmaWx0ZXI6IFJlcG9ydEZpbHRlciA9IHt9KTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgcmVwb3J0TGluZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGNvbnN0IG1pblRpbWVGaWx0ZXIgPSBmaWx0ZXIubWluVGltZSB8fCAwO1xuICAgICAgICBjb25zdCBtaW5WaXNpdHNGaWx0ZXIgPSBmaWx0ZXIudmlzaXRzIHx8IDA7XG4gICAgICAgIGNvbnN0IHJlcXVpcmVEZXBlbmRlbmNpZXMgPSBmaWx0ZXIucmVxdWlyZURlcGVuZGVuY2llcyB8fCBmYWxzZTtcblxuICAgICAgICAvLyDQpNC40LvRjNGC0YDQsNGG0LjRjyDRgtC+0YfQtdC6XG4gICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goKGRhdGEsIHBvaW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhdmdUaW1lID0gZGF0YS5hdmVyYWdlSXRlcmF0aW9uVGltZSgpO1xuXG4gICAgICAgICAgICBpZiAoYXZnVGltZSA+PSBtaW5UaW1lRmlsdGVyICYmIGRhdGEudG90YWxWaXNpdHMgPj0gbWluVmlzaXRzRmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgLy8g0KTQuNC70YzRgtGA0LDRhtC40Y8g0L/QtdGA0LXRhdC+0LTQvtCyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyZWRUcmFuc2l0aW9ucyA9IG5ldyBNYXA8c3RyaW5nLCBUcmFuc2l0aW9uRGF0YT4oKTtcblxuICAgICAgICAgICAgICAgIGRhdGEudHJhbnNpdGlvbnMuZm9yRWFjaCgodHJhbnNpdGlvbkRhdGEsIGZyb21Qb2ludCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvbkRhdGEuYXZlcmFnZVRpbWUoKSA+PSBtaW5UaW1lRmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZFRyYW5zaXRpb25zLnNldChmcm9tUG9pbnQsIHRyYW5zaXRpb25EYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8g0JTQvtCx0LDQstC70LXQvdC40LUg0LIg0L7RgtGH0LXRgiDRgtC+0LvRjNC60L4g0LXRgdC70Lgg0LXRgdGC0Ywg0L/QtdGA0LXRhdC+0LTRiyDQuNC70Lgg0L3QtSDRgtGA0LXQsdGD0LXRgtGB0Y8g0L7QsdGP0LfQsNGC0LXQu9GM0L3Ri9GFINC30LDQstC40YHQuNC80L7RgdGC0LXQuVxuICAgICAgICAgICAgICAgIGlmICghcmVxdWlyZURlcGVuZGVuY2llcyB8fCBmaWx0ZXJlZFRyYW5zaXRpb25zLnNpemUgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkUG9pbnRXaXRoRmlsdGVyZWRUcmFuc2l0aW9ucyhyZXBvcnRMaW5lcywgcG9pbnQsIGRhdGEsIGZpbHRlcmVkVHJhbnNpdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlcG9ydExpbmVzLmpvaW4oXCJcXG5cIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRQb2ludFdpdGhGaWx0ZXJlZFRyYW5zaXRpb25zKFxuICAgICAgICByZXBvcnRMaW5lczogc3RyaW5nW10sXG4gICAgICAgIHBvaW50OiBzdHJpbmcsXG4gICAgICAgIGRhdGE6IFBvaW50RGF0YSxcbiAgICAgICAgZmlsdGVyZWRUcmFuc2l0aW9uczogTWFwPHN0cmluZywgVHJhbnNpdGlvbkRhdGE+XG4gICAgKSB7XG4gICAgICAgIHJlcG9ydExpbmVzLnB1c2goXG4gICAgICAgICAgICBgJHtjaGFsay5ncmVlbihwb2ludCl9OiBWaXNpdHM9JHtkYXRhLnRvdGFsVmlzaXRzfSwgQXZnVGltZT0ke2NoYWxrLnJlZChkYXRhLmF2ZXJhZ2VJdGVyYXRpb25UaW1lKCkudG9GaXhlZCgyKSl9bXNgXG4gICAgICAgICk7XG5cbiAgICAgICAgZmlsdGVyZWRUcmFuc2l0aW9ucy5mb3JFYWNoKCh0cmFuc2l0aW9uRGF0YSwgZnJvbVBvaW50KSA9PiB7XG4gICAgICAgICAgICByZXBvcnRMaW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgIGAgICR7Y2hhbGsuY3lhbihmcm9tUG9pbnQpfSAtPiAke2NoYWxrLmdyZWVuKHBvaW50KX06IENvdW50PSR7dHJhbnNpdGlvbkRhdGEuY291bnR9LCBNaW49JHt0cmFuc2l0aW9uRGF0YS5taW5UaW1lLnRvRml4ZWQoMil9bXMsIE1heD0ke3RyYW5zaXRpb25EYXRhLm1heFRpbWUudG9GaXhlZCgyKX1tcywgQXZnPSR7Y2hhbGsucmVkKHRyYW5zaXRpb25EYXRhLmF2ZXJhZ2VUaW1lKCkudG9GaXhlZCgyKSl9bXNgXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNsYXNzIFBvaW50RGF0YSB7XG4gICAgdG90YWxWaXNpdHM6IG51bWJlcjtcbiAgICB0b3RhbEl0ZXJhdGlvblRpbWU6IG51bWJlcjtcbiAgICB0cmFuc2l0aW9uczogTWFwPHN0cmluZywgVHJhbnNpdGlvbkRhdGE+O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudG90YWxWaXNpdHMgPSAwO1xuICAgICAgICB0aGlzLnRvdGFsSXRlcmF0aW9uVGltZSA9IDA7XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgaW5jcmVtZW50VmlzaXRzKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnRvdGFsVmlzaXRzICs9IDE7XG4gICAgfVxuXG4gICAgdXBkYXRlSXRlcmF0aW9uVGltZSh0aW1lU3BlbnQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnRvdGFsSXRlcmF0aW9uVGltZSArPSB0aW1lU3BlbnQ7XG4gICAgfVxuXG4gICAgYXZlcmFnZUl0ZXJhdGlvblRpbWUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG90YWxWaXNpdHMgPiAxID8gdGhpcy50b3RhbEl0ZXJhdGlvblRpbWUgLyAodGhpcy50b3RhbFZpc2l0cyAtIDEpIDogMDtcbiAgICB9XG5cbiAgICB1cGRhdGVUcmFuc2l0aW9uKGZyb21Qb2ludDogc3RyaW5nLCB0aW1lU3BlbnQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMudHJhbnNpdGlvbnMuaGFzKGZyb21Qb2ludCkpIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbnMuc2V0KGZyb21Qb2ludCwgbmV3IFRyYW5zaXRpb25EYXRhKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHJhbnNpdGlvbkRhdGEgPSB0aGlzLnRyYW5zaXRpb25zLmdldChmcm9tUG9pbnQpITtcbiAgICAgICAgdHJhbnNpdGlvbkRhdGEudXBkYXRlKHRpbWVTcGVudCk7XG4gICAgfVxufVxuXG5jbGFzcyBUcmFuc2l0aW9uRGF0YSB7XG4gICAgY291bnQ6IG51bWJlcjtcbiAgICB0b3RhbFRpbWU6IG51bWJlcjtcbiAgICBtaW5UaW1lOiBudW1iZXI7XG4gICAgbWF4VGltZTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY291bnQgPSAwO1xuICAgICAgICB0aGlzLnRvdGFsVGltZSA9IDA7XG4gICAgICAgIHRoaXMubWluVGltZSA9IEluZmluaXR5O1xuICAgICAgICB0aGlzLm1heFRpbWUgPSAwO1xuICAgIH1cblxuICAgIHVwZGF0ZSh0aW1lU3BlbnQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmNvdW50ICs9IDE7XG4gICAgICAgIHRoaXMudG90YWxUaW1lICs9IHRpbWVTcGVudDtcbiAgICAgICAgdGhpcy5taW5UaW1lID0gTWF0aC5taW4odGhpcy5taW5UaW1lLCB0aW1lU3BlbnQpO1xuICAgICAgICB0aGlzLm1heFRpbWUgPSBNYXRoLm1heCh0aGlzLm1heFRpbWUsIHRpbWVTcGVudCk7XG4gICAgfVxuXG4gICAgYXZlcmFnZVRpbWUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY291bnQgPiAwID8gdGhpcy50b3RhbFRpbWUgLyB0aGlzLmNvdW50IDogMDtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgTXV0ZXgge1xuICAgIHN0YXRpYyBsb2dBbGxvd2VkID0gdHJ1ZVxuICAgIHByaXZhdGUgX3F1ZXVlOiAoKCkgPT4gdm9pZClbXSA9IFtdO1xuICAgIHByaXZhdGUgX2xvY2sgPSBmYWxzZTtcblxuICAgIGxvY2sobG9nTXNnPzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmIChNdXRleC5sb2dBbGxvd2VkICYmIGxvZ01zZykgY29uc29sZS5sb2coXCJNdXRleCBsb2NrOiBcIiwgbG9nTXNnLCAhdGhpcy5fbG9jaylcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fbG9jaykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJlcygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9xdWV1ZS5wdXNoKHJlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRyeUxvY2sobG9nTXNnPzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLl9sb2NrKSB7XG4gICAgICAgICAgICAvLyDQldGB0LvQuCDQvNGM0Y7RgtC10LrRgSDRg9C20LUg0LfQsNC70L7Rh9C10L0sINCy0L7Qt9Cy0YDQsNGJ0LDQtdC8IGZhbHNlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDQldGB0LvQuCDQvNGM0Y7RgtC10LrRgSDRgdCy0L7QsdC+0LTQtdC9LCDQu9C+0YfQuNC8INC10LPQviDQuCDQstC+0LfQstGA0LDRidCw0LXQvCB0cnVlXG4gICAgICAgICAgICB0aGlzLl9sb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChNdXRleC5sb2dBbGxvd2VkICYmIGxvZ01zZykgY29uc29sZS5sb2coXCJNdXRleCB0cnlMb2NrIHN1Y2Nlc3NmdWw6IFwiLCBsb2dNc2cpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHVubG9jayhsb2dNc2c/OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKE11dGV4LmxvZ0FsbG93ZWQgJiYgbG9nTXNnKSBjb25zb2xlLmxvZyhcIk11dGV4IHVuTG9jazogXCIsIGxvZ01zZylcbiAgICAgICAgaWYgKHRoaXMuX3F1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGZ1bmMgPSB0aGlzLl9xdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgaWYgKGZ1bmMpIGZ1bmMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvY2sgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn0iLCJpbXBvcnQge1dvcmtlck1hbmFnZXJ9IGZyb20gXCJ3b3JrZXItdGhyZWFkcy1tYW5hZ2VyL2Rpc3Qvc3JjXCI7XG5pbXBvcnQge0hhbmRsZXJzfSBmcm9tIFwiLi93b3JrZXJcIjtcbmltcG9ydCB7cmVzb2x2ZX0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCBXZWJTb2NrZXQsIHtTZXJ2ZXJ9IGZyb20gXCJ3c1wiO1xuaW1wb3J0IHtQb2ludFRyYWNrZXJ9IGZyb20gXCJAc2VydmVyL1BvaW50VHJhY2tlclwiO1xuaW1wb3J0IHtNYXRyaXh9IGZyb20gXCIuLi8uLi9NYXRyaXgvc3JjL01hdHJpeFwiO1xuaW1wb3J0IHtTZXJEZX0gZnJvbSBcInNlcmRlLXRzXCI7XG5pbXBvcnQge01hdHJpeEVsZW1lbnQsIFRpbWVNYXRyaXhFbGVtZW50fSBmcm9tIFwiLi4vLi4vTWF0cml4L3NyYy9NYXRyaXhFbGVtZW50XCI7XG5pbXBvcnQge1xuICAgIFJhaW5ib3dFZmZlY3RNb2RpZmllcixcbiAgICBSb3RhdGlvbk1vZGlmaWVyLFxuICAgIFNjYWxlTW9kaWZpZXIsXG4gICAgU2Nyb2xsaW5nVGV4dE1vZGlmaWVyXG59IGZyb20gXCIuLi8uLi9NYXRyaXgvc3JjL01vZGlmaWVyc1wiO1xuaW1wb3J0IHtNdXRleH0gZnJvbSBcIkBzZXJ2ZXIvbXV0ZXhcIjtcbmxldCBjbGllbnRDb3VudGVyID0gMFxubGV0IGNsaWVudHM6IFdlYlNvY2tldFtdID0gW11cbmxldCB0cmFja2VyID0gbmV3IFBvaW50VHJhY2tlcigpXG5jb25zdCBtYW5hZ2VyID0gbmV3IFdvcmtlck1hbmFnZXI8SGFuZGxlcnM+KCk7XG5sZXQgbXV0ZXggPSBuZXcgTXV0ZXgoKTtcbmxldCBpID0gMDtcbihhc3luYyAoKT0+e1xuICAgIGNvbnN0IHdzcyA9IG5ldyBTZXJ2ZXIoe3BvcnQ6IDgwODN9KTtcbiAgICB3c3Mub24oJ2Nvbm5lY3Rpb24nLCBhc3luYyAod3M6IFdlYlNvY2tldCkgPT4ge1xuICAgICAgICBjb25zdCBjbGllbnRJZCA9ICsrY2xpZW50Q291bnRlcjtcbiAgICAgICAgY2xpZW50cy5wdXNoKHdzKTtcbiAgICAgICAgY29uc29sZS5sb2coYENsaWVudCBjb25uZWN0ZWQ6ICR7Y2xpZW50SWR9YCk7XG4gICAgICAgIHRyYWNrZXIucG9pbnQoJ2NsaWVudC1jb25uZWN0ZWQnKTtcblxuXG5cbiAgICAgICAgd3Mub25jZSgnY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICBjbGllbnRzID0gY2xpZW50cy5maWx0ZXIoKGNsaWVudCkgPT4gY2xpZW50ICE9PSB3cyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2xpZW50IGRpc2Nvbm5lY3RlZDogJHtjbGllbnRJZH1gKTtcbiAgICAgICAgICAgIHRyYWNrZXIucG9pbnQoJ2NsaWVudC1kaXNjb25uZWN0ZWQnKTtcblxuICAgICAgICB9KTtcblxuXG4gICAgICAgIHdzLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgV2ViU29ja2V0IGVycm9yIHdpdGggY2xpZW50ICR7Y2xpZW50SWR9OmAsIGVycm9yKTtcbiAgICAgICAgICAgIHRyYWNrZXIucG9pbnQoJ2Vycm9yLW9jY3VycmVkJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgbGV0IHcxID0gYXdhaXQgbWFuYWdlci5jcmVhdGVXb3JrZXJXaXRoSGFuZGxlcnMocmVzb2x2ZShfX2Rpcm5hbWUsICd3b3JrZXIuanMnKSlcbiAgICBhd2FpdCBtYW5hZ2VyLmNhbGwodzEsIFwiaW5pdGlhbGl6ZVBhZ2VcIilcbiAgICBhd2FpdCBtYW5hZ2VyLmNhbGwodzEsIFwic2V0U3RhcnRUaW1lXCIsIG5ldyBEYXRlKCkpXG4gICAgU2VyRGUuY2xhc3NSZWdpc3RyYXRpb24oW1xuICAgICAgICBNYXRyaXgsIE1hdHJpeEVsZW1lbnQsIE1hdHJpeEVsZW1lbnQsIFRpbWVNYXRyaXhFbGVtZW50LCBTY3JvbGxpbmdUZXh0TW9kaWZpZXIsIFNjYWxlTW9kaWZpZXIsIFJhaW5ib3dFZmZlY3RNb2RpZmllcl0pXG4gICAgbGV0IGkgPSAwO1xuXG4gICAgYXN5bmMgZnVuY3Rpb24gdXBkYXRlTWF0cml4KCkge1xuICAgICAgICBhd2FpdCBtdXRleC5sb2NrKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgbWF0cml4OiBNYXRyaXggPSBTZXJEZS5kZXNlcmlhbGl6ZShhd2FpdCBtYW5hZ2VyLmNhbGwodzEsICdnZXRTbmFwc2hvdCcpKTtcbiAgICAgICAgICAgIG1hdHJpeC5lbGVtZW50c1sxXS5zZXRUZXh0KChpKyspLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgYXdhaXQgbWFuYWdlci5jYWxsKHcxLCAnc2V0U25hcHNob3QnLCBTZXJEZS5zZXJpYWxpc2UobWF0cml4KSk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBtdXRleC51bmxvY2soKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NGcmFtZUdyb3VwKCkge1xuICAgICAgICBhd2FpdCBtdXRleC5sb2NrKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgZnJhbWVHcm91cCA9IGF3YWl0IG1hbmFnZXIuY2FsbCh3MSwgJ2dlbmVyYXRlTmV4dEZyYW1lR3JvdXAnKTtcbiAgICAgICAgICAgIGZvciAobGV0IGNsaWVudCBvZiBjbGllbnRzKSB7XG4gICAgICAgICAgICAgICAgY2xpZW50LnNlbmQoSlNPTi5zdHJpbmdpZnkoZnJhbWVHcm91cCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IG5leHRUaW1lb3V0ID0gZnJhbWVHcm91cCEuc3RhcnRUaW1lIC0gRGF0ZS5ub3coKSAtIDMwMDtcblxuICAgICAgICAgICAgLy8g0JfQsNC/0LvQsNC90LjRgNGD0LXQvCDRgdC70LXQtNGD0Y7RidC40Lkg0LLRi9C30L7QslxuICAgICAgICAgICAgc2V0VGltZW91dChwcm9jZXNzRnJhbWVHcm91cCwgTWF0aC5tYXgobmV4dFRpbWVvdXQsIDApKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIG11dGV4LnVubG9jaygpO1xuICAgICAgICB9XG4gICAgfVxuXG4vLyDQl9Cw0L/Rg9GB0LrQsNC10Lwg0L7QsdCwINC/0YDQvtGG0LXRgdGB0LBcbiAgICBzZXRJbnRlcnZhbCh1cGRhdGVNYXRyaXgsIDEwMDApO1xuICAgIHByb2Nlc3NGcmFtZUdyb3VwKCk7IC8vINCd0LDRh9Cw0LvRjNC90YvQuSDQt9Cw0L/Rg9GB0LpcblxuXG59KSgpXG5cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Xb3JrZXJDb250cm9sbGVyID0gdm9pZCAwO1xuY29uc3Qgd29ya2VyX3RocmVhZHNfMSA9IHJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKTtcbmNvbnN0IHNlcmRlX3RzXzEgPSByZXF1aXJlKFwic2VyZGUtdHNcIik7XG5jbGFzcyBXb3JrZXJDb250cm9sbGVyIHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZShoYW5kbGVycykge1xuICAgICAgICB0aGlzLmhhbmRsZXJzID0gaGFuZGxlcnM7XG4gICAgICAgIC8vIFNlbmQgaW5pdGlhbGl6YXRpb24gYWNrbm93bGVkZ21lbnQgd2hlbiB0aGUgd29ya2VyIGlzIGZ1bGx5IHJlYWR5XG4gICAgICAgIGNvbnN0IGluaXRBY2sgPSB7IHR5cGU6ICdpbml0aWFsaXphdGlvbicgfTtcbiAgICAgICAgaWYgKHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydCkge1xuICAgICAgICAgICAgd29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0LnBvc3RNZXNzYWdlKGluaXRBY2spO1xuICAgICAgICB9XG4gICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5vbignbWVzc2FnZScsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlTWVzc2FnZShldmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgaGFuZGxlTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdyZXF1ZXN0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVJlcXVlc3QobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdub3RpZmljYXRpb24nOlxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlTm90aWZpY2F0aW9uKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFVua25vd24gbWVzc2FnZSB0eXBlOiAke21lc3NhZ2UudHlwZX1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgaGFuZGxlUmVxdWVzdChtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IHsgcmVxdWVzdElkLCBwYXlsb2FkIH0gPSBtZXNzYWdlO1xuICAgICAgICBjb25zdCB7IG1ldGhvZE5hbWUsIGFyZ3MgfSA9IHNlcmRlX3RzXzEuU2VyRGUuZGVzZXJpYWxpemUocGF5bG9hZCk7XG4gICAgICAgIGlmICh0aGlzLmhhbmRsZXJzICYmIHR5cGVvZiB0aGlzLmhhbmRsZXJzW21ldGhvZE5hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHNlcmRlX3RzXzEuU2VyRGUuc2VyaWFsaXNlKGF3YWl0IHRoaXMuaGFuZGxlcnNbbWV0aG9kTmFtZV0oLi4uYXJncykpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHsgdHlwZTogJ3Jlc3BvbnNlJywgcmVxdWVzdElkLCByZXN1bHQgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0LnBvc3RNZXNzYWdlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB7IHR5cGU6ICdyZXNwb25zZScsIHJlcXVlc3RJZCwgZXJyb3IgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0LnBvc3RNZXNzYWdlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncmVzcG9uc2UnLFxuICAgICAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgICAgICByZXN1bHQ6IG5ldyBFcnJvcihgTWV0aG9kICR7bWV0aG9kTmFtZX0gbm90IGZvdW5kIG9uIGhhbmRsZXJzYClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAod29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0KSB7XG4gICAgICAgICAgICAgICAgd29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0LnBvc3RNZXNzYWdlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgaGFuZGxlTm90aWZpY2F0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgeyBtZXRob2ROYW1lLCBhcmdzIH0gPSBtZXNzYWdlLnBheWxvYWQ7XG4gICAgICAgIGlmICh0aGlzLmhhbmRsZXJzICYmIHR5cGVvZiB0aGlzLmhhbmRsZXJzW21ldGhvZE5hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlcnNbbWV0aG9kTmFtZV0oLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBoYW5kbGluZyBub3RpZmljYXRpb246ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGhhbmRsaW5nIG5vdGlmaWNhdGlvbjogdW5rbm93biBlcnJvcicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgTm90aWZpY2F0aW9uIG1ldGhvZCAke21ldGhvZE5hbWV9IG5vdCBmb3VuZCBvbiBoYW5kbGVyc2ApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyByZWdpc3RlckNsYXNzZXMoY2xhc3Nlcykge1xuICAgICAgICBzZXJkZV90c18xLlNlckRlLmNsYXNzUmVnaXN0cmF0aW9uKGNsYXNzZXMpO1xuICAgIH1cbn1cbmV4cG9ydHMuV29ya2VyQ29udHJvbGxlciA9IFdvcmtlckNvbnRyb2xsZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Xb3JrZXJDb250cm9sbGVyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Xb3JrZXJNYW5hZ2VyID0gdm9pZCAwO1xuY29uc3Qgd29ya2VyX3RocmVhZHNfMSA9IHJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKTtcbmNvbnN0IHNlcmRlX3RzXzEgPSByZXF1aXJlKFwic2VyZGUtdHNcIik7XG5jbGFzcyBXb3JrZXJNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3Rvcih0aW1lb3V0ID0gMiAqKiAzMSAtIDEpIHtcbiAgICAgICAgdGhpcy53b3JrZXJzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnJlcXVlc3RJZENvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLndvcmtlcklkQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMucmVzcG9uc2VIYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnRpbWVvdXQgPSB0aW1lb3V0O1xuICAgIH1cbiAgICBhc3luYyBjcmVhdGVXb3JrZXJXaXRoSGFuZGxlcnMod29ya2VyRmlsZSkge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSBuZXcgd29ya2VyX3RocmVhZHNfMS5Xb3JrZXIod29ya2VyRmlsZSk7XG4gICAgICAgIGNvbnN0IHdvcmtlcklkID0gKyt0aGlzLndvcmtlcklkQ291bnRlcjtcbiAgICAgICAgdGhpcy53b3JrZXJzLnNldCh3b3JrZXJJZCwgd29ya2VyKTtcbiAgICAgICAgd29ya2VyLm9uKCdtZXNzYWdlJywgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTWVzc2FnZShtZXNzYWdlLCB3b3JrZXJJZCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzLnNldCh3b3JrZXJJZCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpOyAvLyBDbGVhciB0aW1lb3V0IG9uIHN1Y2Nlc3NcbiAgICAgICAgICAgICAgICByZXNvbHZlKHdvcmtlcklkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5oYXMod29ya2VySWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5kZWxldGUod29ya2VySWQpO1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdXb3JrZXIgaW5pdGlhbGl6YXRpb24gdGltZWQgb3V0JykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMudGltZW91dCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBoYW5kbGVNZXNzYWdlKG1lc3NhZ2UsIHdvcmtlcklkKSB7XG4gICAgICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdpbml0aWFsaXphdGlvbic6XG4gICAgICAgICAgICAgICAgY29uc3QgaW5pdEhhbmRsZXIgPSB0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuZ2V0KHdvcmtlcklkKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5pdEhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdEhhbmRsZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzLmRlbGV0ZSh3b3JrZXJJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmVzcG9uc2UnOlxuICAgICAgICAgICAgICAgIGNvbnN0IHsgcmVxdWVzdElkLCByZXN1bHQgfSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VIYW5kbGVyID0gdGhpcy5yZXNwb25zZUhhbmRsZXJzLmdldChyZXF1ZXN0SWQpO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZUhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VIYW5kbGVyKHNlcmRlX3RzXzEuU2VyRGUuZGVzZXJpYWxpemUocmVzdWx0KSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzcG9uc2VIYW5kbGVycy5kZWxldGUocmVxdWVzdElkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdub3RpZmljYXRpb24nOlxuICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBub3RpZmljYXRpb25zIGlmIG5lY2Vzc2FyeVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gbWVzc2FnZSB0eXBlOiAke21lc3NhZ2UudHlwZX1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBjYWxsKHdvcmtlcklkLCBtZXRob2ROYW1lLCAuLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IHdvcmtlciA9IHRoaXMud29ya2Vycy5nZXQod29ya2VySWQpO1xuICAgICAgICBpZiAoIXdvcmtlcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXb3JrZXIgd2l0aCBJRCAke3dvcmtlcklkfSBub3QgZm91bmRgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXF1ZXN0SWQgPSArK3RoaXMucmVxdWVzdElkQ291bnRlcjtcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdyZXF1ZXN0JyxcbiAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgIHBheWxvYWQ6IHNlcmRlX3RzXzEuU2VyRGUuc2VyaWFsaXNlKHsgbWV0aG9kTmFtZSwgYXJncyB9KVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNwb25zZUhhbmRsZXJzLmRlbGV0ZShyZXF1ZXN0SWQpO1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1JlcXVlc3QgdGltZWQgb3V0JykpO1xuICAgICAgICAgICAgfSwgdGhpcy50aW1lb3V0KTtcbiAgICAgICAgICAgIHRoaXMucmVzcG9uc2VIYW5kbGVycy5zZXQocmVxdWVzdElkLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7IC8vIENsZWFyIHRpbWVvdXQgb24gc3VjY2Vzc1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHJlcXVlc3QpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2VuZE5vdGlmaWNhdGlvbih3b3JrZXJJZCwgbWV0aG9kTmFtZSwgLi4uYXJncykge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSB0aGlzLndvcmtlcnMuZ2V0KHdvcmtlcklkKTtcbiAgICAgICAgaWYgKCF3b3JrZXIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV29ya2VyIHdpdGggSUQgJHt3b3JrZXJJZH0gbm90IGZvdW5kYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uID0ge1xuICAgICAgICAgICAgdHlwZTogJ25vdGlmaWNhdGlvbicsXG4gICAgICAgICAgICBwYXlsb2FkOiB7IG1ldGhvZE5hbWUsIGFyZ3MgfVxuICAgICAgICB9O1xuICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2Uobm90aWZpY2F0aW9uKTtcbiAgICB9XG4gICAgYXN5bmMgdGVybWluYXRlV29ya2VyKHdvcmtlcklkKSB7XG4gICAgICAgIGNvbnN0IHdvcmtlciA9IHRoaXMud29ya2Vycy5nZXQod29ya2VySWQpO1xuICAgICAgICBpZiAod29ya2VyKSB7XG4gICAgICAgICAgICBhd2FpdCB3b3JrZXIudGVybWluYXRlKCk7XG4gICAgICAgICAgICB0aGlzLndvcmtlcnMuZGVsZXRlKHdvcmtlcklkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZWdpc3RlckNsYXNzZXMoY2xhc3Nlcykge1xuICAgICAgICBzZXJkZV90c18xLlNlckRlLmNsYXNzUmVnaXN0cmF0aW9uKGNsYXNzZXMpO1xuICAgIH1cbn1cbmV4cG9ydHMuV29ya2VyTWFuYWdlciA9IFdvcmtlck1hbmFnZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Xb3JrZXJNYW5hZ2VyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX2V4cG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9fZXhwb3J0U3RhcikgfHwgZnVuY3Rpb24obSwgZXhwb3J0cykge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZXhwb3J0cywgcCkpIF9fY3JlYXRlQmluZGluZyhleHBvcnRzLCBtLCBwKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vV29ya2VyTWFuYWdlclwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vV29ya2VyQ29udHJvbGxlclwiKSwgZXhwb3J0cyk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ3c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJub2RlOm9zXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5vZGU6cHJvY2Vzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJub2RlOnR0eVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXRoXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpOyIsImltcG9ydCBhbnNpU3R5bGVzIGZyb20gJyNhbnNpLXN0eWxlcyc7XG5pbXBvcnQgc3VwcG9ydHNDb2xvciBmcm9tICcjc3VwcG9ydHMtY29sb3InO1xuaW1wb3J0IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBpbXBvcnQvb3JkZXJcblx0c3RyaW5nUmVwbGFjZUFsbCxcblx0c3RyaW5nRW5jYXNlQ1JMRldpdGhGaXJzdEluZGV4LFxufSBmcm9tICcuL3V0aWxpdGllcy5qcyc7XG5cbmNvbnN0IHtzdGRvdXQ6IHN0ZG91dENvbG9yLCBzdGRlcnI6IHN0ZGVyckNvbG9yfSA9IHN1cHBvcnRzQ29sb3I7XG5cbmNvbnN0IEdFTkVSQVRPUiA9IFN5bWJvbCgnR0VORVJBVE9SJyk7XG5jb25zdCBTVFlMRVIgPSBTeW1ib2woJ1NUWUxFUicpO1xuY29uc3QgSVNfRU1QVFkgPSBTeW1ib2woJ0lTX0VNUFRZJyk7XG5cbi8vIGBzdXBwb3J0c0NvbG9yLmxldmVsYCDihpIgYGFuc2lTdHlsZXMuY29sb3JbbmFtZV1gIG1hcHBpbmdcbmNvbnN0IGxldmVsTWFwcGluZyA9IFtcblx0J2Fuc2knLFxuXHQnYW5zaScsXG5cdCdhbnNpMjU2Jyxcblx0J2Fuc2kxNm0nLFxuXTtcblxuY29uc3Qgc3R5bGVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuY29uc3QgYXBwbHlPcHRpb25zID0gKG9iamVjdCwgb3B0aW9ucyA9IHt9KSA9PiB7XG5cdGlmIChvcHRpb25zLmxldmVsICYmICEoTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxldmVsKSAmJiBvcHRpb25zLmxldmVsID49IDAgJiYgb3B0aW9ucy5sZXZlbCA8PSAzKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignVGhlIGBsZXZlbGAgb3B0aW9uIHNob3VsZCBiZSBhbiBpbnRlZ2VyIGZyb20gMCB0byAzJyk7XG5cdH1cblxuXHQvLyBEZXRlY3QgbGV2ZWwgaWYgbm90IHNldCBtYW51YWxseVxuXHRjb25zdCBjb2xvckxldmVsID0gc3Rkb3V0Q29sb3IgPyBzdGRvdXRDb2xvci5sZXZlbCA6IDA7XG5cdG9iamVjdC5sZXZlbCA9IG9wdGlvbnMubGV2ZWwgPT09IHVuZGVmaW5lZCA/IGNvbG9yTGV2ZWwgOiBvcHRpb25zLmxldmVsO1xufTtcblxuZXhwb3J0IGNsYXNzIENoYWxrIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucykge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zdHJ1Y3Rvci1yZXR1cm5cblx0XHRyZXR1cm4gY2hhbGtGYWN0b3J5KG9wdGlvbnMpO1xuXHR9XG59XG5cbmNvbnN0IGNoYWxrRmFjdG9yeSA9IG9wdGlvbnMgPT4ge1xuXHRjb25zdCBjaGFsayA9ICguLi5zdHJpbmdzKSA9PiBzdHJpbmdzLmpvaW4oJyAnKTtcblx0YXBwbHlPcHRpb25zKGNoYWxrLCBvcHRpb25zKTtcblxuXHRPYmplY3Quc2V0UHJvdG90eXBlT2YoY2hhbGssIGNyZWF0ZUNoYWxrLnByb3RvdHlwZSk7XG5cblx0cmV0dXJuIGNoYWxrO1xufTtcblxuZnVuY3Rpb24gY3JlYXRlQ2hhbGsob3B0aW9ucykge1xuXHRyZXR1cm4gY2hhbGtGYWN0b3J5KG9wdGlvbnMpO1xufVxuXG5PYmplY3Quc2V0UHJvdG90eXBlT2YoY3JlYXRlQ2hhbGsucHJvdG90eXBlLCBGdW5jdGlvbi5wcm90b3R5cGUpO1xuXG5mb3IgKGNvbnN0IFtzdHlsZU5hbWUsIHN0eWxlXSBvZiBPYmplY3QuZW50cmllcyhhbnNpU3R5bGVzKSkge1xuXHRzdHlsZXNbc3R5bGVOYW1lXSA9IHtcblx0XHRnZXQoKSB7XG5cdFx0XHRjb25zdCBidWlsZGVyID0gY3JlYXRlQnVpbGRlcih0aGlzLCBjcmVhdGVTdHlsZXIoc3R5bGUub3Blbiwgc3R5bGUuY2xvc2UsIHRoaXNbU1RZTEVSXSksIHRoaXNbSVNfRU1QVFldKTtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBzdHlsZU5hbWUsIHt2YWx1ZTogYnVpbGRlcn0pO1xuXHRcdFx0cmV0dXJuIGJ1aWxkZXI7XG5cdFx0fSxcblx0fTtcbn1cblxuc3R5bGVzLnZpc2libGUgPSB7XG5cdGdldCgpIHtcblx0XHRjb25zdCBidWlsZGVyID0gY3JlYXRlQnVpbGRlcih0aGlzLCB0aGlzW1NUWUxFUl0sIHRydWUpO1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndmlzaWJsZScsIHt2YWx1ZTogYnVpbGRlcn0pO1xuXHRcdHJldHVybiBidWlsZGVyO1xuXHR9LFxufTtcblxuY29uc3QgZ2V0TW9kZWxBbnNpID0gKG1vZGVsLCBsZXZlbCwgdHlwZSwgLi4uYXJndW1lbnRzXykgPT4ge1xuXHRpZiAobW9kZWwgPT09ICdyZ2InKSB7XG5cdFx0aWYgKGxldmVsID09PSAnYW5zaTE2bScpIHtcblx0XHRcdHJldHVybiBhbnNpU3R5bGVzW3R5cGVdLmFuc2kxNm0oLi4uYXJndW1lbnRzXyk7XG5cdFx0fVxuXG5cdFx0aWYgKGxldmVsID09PSAnYW5zaTI1NicpIHtcblx0XHRcdHJldHVybiBhbnNpU3R5bGVzW3R5cGVdLmFuc2kyNTYoYW5zaVN0eWxlcy5yZ2JUb0Fuc2kyNTYoLi4uYXJndW1lbnRzXykpO1xuXHRcdH1cblxuXHRcdHJldHVybiBhbnNpU3R5bGVzW3R5cGVdLmFuc2koYW5zaVN0eWxlcy5yZ2JUb0Fuc2koLi4uYXJndW1lbnRzXykpO1xuXHR9XG5cblx0aWYgKG1vZGVsID09PSAnaGV4Jykge1xuXHRcdHJldHVybiBnZXRNb2RlbEFuc2koJ3JnYicsIGxldmVsLCB0eXBlLCAuLi5hbnNpU3R5bGVzLmhleFRvUmdiKC4uLmFyZ3VtZW50c18pKTtcblx0fVxuXG5cdHJldHVybiBhbnNpU3R5bGVzW3R5cGVdW21vZGVsXSguLi5hcmd1bWVudHNfKTtcbn07XG5cbmNvbnN0IHVzZWRNb2RlbHMgPSBbJ3JnYicsICdoZXgnLCAnYW5zaTI1NiddO1xuXG5mb3IgKGNvbnN0IG1vZGVsIG9mIHVzZWRNb2RlbHMpIHtcblx0c3R5bGVzW21vZGVsXSA9IHtcblx0XHRnZXQoKSB7XG5cdFx0XHRjb25zdCB7bGV2ZWx9ID0gdGhpcztcblx0XHRcdHJldHVybiBmdW5jdGlvbiAoLi4uYXJndW1lbnRzXykge1xuXHRcdFx0XHRjb25zdCBzdHlsZXIgPSBjcmVhdGVTdHlsZXIoZ2V0TW9kZWxBbnNpKG1vZGVsLCBsZXZlbE1hcHBpbmdbbGV2ZWxdLCAnY29sb3InLCAuLi5hcmd1bWVudHNfKSwgYW5zaVN0eWxlcy5jb2xvci5jbG9zZSwgdGhpc1tTVFlMRVJdKTtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUJ1aWxkZXIodGhpcywgc3R5bGVyLCB0aGlzW0lTX0VNUFRZXSk7XG5cdFx0XHR9O1xuXHRcdH0sXG5cdH07XG5cblx0Y29uc3QgYmdNb2RlbCA9ICdiZycgKyBtb2RlbFswXS50b1VwcGVyQ2FzZSgpICsgbW9kZWwuc2xpY2UoMSk7XG5cdHN0eWxlc1tiZ01vZGVsXSA9IHtcblx0XHRnZXQoKSB7XG5cdFx0XHRjb25zdCB7bGV2ZWx9ID0gdGhpcztcblx0XHRcdHJldHVybiBmdW5jdGlvbiAoLi4uYXJndW1lbnRzXykge1xuXHRcdFx0XHRjb25zdCBzdHlsZXIgPSBjcmVhdGVTdHlsZXIoZ2V0TW9kZWxBbnNpKG1vZGVsLCBsZXZlbE1hcHBpbmdbbGV2ZWxdLCAnYmdDb2xvcicsIC4uLmFyZ3VtZW50c18pLCBhbnNpU3R5bGVzLmJnQ29sb3IuY2xvc2UsIHRoaXNbU1RZTEVSXSk7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVCdWlsZGVyKHRoaXMsIHN0eWxlciwgdGhpc1tJU19FTVBUWV0pO1xuXHRcdFx0fTtcblx0XHR9LFxuXHR9O1xufVxuXG5jb25zdCBwcm90byA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCgpID0+IHt9LCB7XG5cdC4uLnN0eWxlcyxcblx0bGV2ZWw6IHtcblx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdGdldCgpIHtcblx0XHRcdHJldHVybiB0aGlzW0dFTkVSQVRPUl0ubGV2ZWw7XG5cdFx0fSxcblx0XHRzZXQobGV2ZWwpIHtcblx0XHRcdHRoaXNbR0VORVJBVE9SXS5sZXZlbCA9IGxldmVsO1xuXHRcdH0sXG5cdH0sXG59KTtcblxuY29uc3QgY3JlYXRlU3R5bGVyID0gKG9wZW4sIGNsb3NlLCBwYXJlbnQpID0+IHtcblx0bGV0IG9wZW5BbGw7XG5cdGxldCBjbG9zZUFsbDtcblx0aWYgKHBhcmVudCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0b3BlbkFsbCA9IG9wZW47XG5cdFx0Y2xvc2VBbGwgPSBjbG9zZTtcblx0fSBlbHNlIHtcblx0XHRvcGVuQWxsID0gcGFyZW50Lm9wZW5BbGwgKyBvcGVuO1xuXHRcdGNsb3NlQWxsID0gY2xvc2UgKyBwYXJlbnQuY2xvc2VBbGw7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdG9wZW4sXG5cdFx0Y2xvc2UsXG5cdFx0b3BlbkFsbCxcblx0XHRjbG9zZUFsbCxcblx0XHRwYXJlbnQsXG5cdH07XG59O1xuXG5jb25zdCBjcmVhdGVCdWlsZGVyID0gKHNlbGYsIF9zdHlsZXIsIF9pc0VtcHR5KSA9PiB7XG5cdC8vIFNpbmdsZSBhcmd1bWVudCBpcyBob3QgcGF0aCwgaW1wbGljaXQgY29lcmNpb24gaXMgZmFzdGVyIHRoYW4gYW55dGhpbmdcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWltcGxpY2l0LWNvZXJjaW9uXG5cdGNvbnN0IGJ1aWxkZXIgPSAoLi4uYXJndW1lbnRzXykgPT4gYXBwbHlTdHlsZShidWlsZGVyLCAoYXJndW1lbnRzXy5sZW5ndGggPT09IDEpID8gKCcnICsgYXJndW1lbnRzX1swXSkgOiBhcmd1bWVudHNfLmpvaW4oJyAnKSk7XG5cblx0Ly8gV2UgYWx0ZXIgdGhlIHByb3RvdHlwZSBiZWNhdXNlIHdlIG11c3QgcmV0dXJuIGEgZnVuY3Rpb24sIGJ1dCB0aGVyZSBpc1xuXHQvLyBubyB3YXkgdG8gY3JlYXRlIGEgZnVuY3Rpb24gd2l0aCBhIGRpZmZlcmVudCBwcm90b3R5cGVcblx0T2JqZWN0LnNldFByb3RvdHlwZU9mKGJ1aWxkZXIsIHByb3RvKTtcblxuXHRidWlsZGVyW0dFTkVSQVRPUl0gPSBzZWxmO1xuXHRidWlsZGVyW1NUWUxFUl0gPSBfc3R5bGVyO1xuXHRidWlsZGVyW0lTX0VNUFRZXSA9IF9pc0VtcHR5O1xuXG5cdHJldHVybiBidWlsZGVyO1xufTtcblxuY29uc3QgYXBwbHlTdHlsZSA9IChzZWxmLCBzdHJpbmcpID0+IHtcblx0aWYgKHNlbGYubGV2ZWwgPD0gMCB8fCAhc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHNlbGZbSVNfRU1QVFldID8gJycgOiBzdHJpbmc7XG5cdH1cblxuXHRsZXQgc3R5bGVyID0gc2VsZltTVFlMRVJdO1xuXG5cdGlmIChzdHlsZXIgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBzdHJpbmc7XG5cdH1cblxuXHRjb25zdCB7b3BlbkFsbCwgY2xvc2VBbGx9ID0gc3R5bGVyO1xuXHRpZiAoc3RyaW5nLmluY2x1ZGVzKCdcXHUwMDFCJykpIHtcblx0XHR3aGlsZSAoc3R5bGVyICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIFJlcGxhY2UgYW55IGluc3RhbmNlcyBhbHJlYWR5IHByZXNlbnQgd2l0aCBhIHJlLW9wZW5pbmcgY29kZVxuXHRcdFx0Ly8gb3RoZXJ3aXNlIG9ubHkgdGhlIHBhcnQgb2YgdGhlIHN0cmluZyB1bnRpbCBzYWlkIGNsb3NpbmcgY29kZVxuXHRcdFx0Ly8gd2lsbCBiZSBjb2xvcmVkLCBhbmQgdGhlIHJlc3Qgd2lsbCBzaW1wbHkgYmUgJ3BsYWluJy5cblx0XHRcdHN0cmluZyA9IHN0cmluZ1JlcGxhY2VBbGwoc3RyaW5nLCBzdHlsZXIuY2xvc2UsIHN0eWxlci5vcGVuKTtcblxuXHRcdFx0c3R5bGVyID0gc3R5bGVyLnBhcmVudDtcblx0XHR9XG5cdH1cblxuXHQvLyBXZSBjYW4gbW92ZSBib3RoIG5leHQgYWN0aW9ucyBvdXQgb2YgbG9vcCwgYmVjYXVzZSByZW1haW5pbmcgYWN0aW9ucyBpbiBsb29wIHdvbid0IGhhdmVcblx0Ly8gYW55L3Zpc2libGUgZWZmZWN0IG9uIHBhcnRzIHdlIGFkZCBoZXJlLiBDbG9zZSB0aGUgc3R5bGluZyBiZWZvcmUgYSBsaW5lYnJlYWsgYW5kIHJlb3BlblxuXHQvLyBhZnRlciBuZXh0IGxpbmUgdG8gZml4IGEgYmxlZWQgaXNzdWUgb24gbWFjT1M6IGh0dHBzOi8vZ2l0aHViLmNvbS9jaGFsay9jaGFsay9wdWxsLzkyXG5cdGNvbnN0IGxmSW5kZXggPSBzdHJpbmcuaW5kZXhPZignXFxuJyk7XG5cdGlmIChsZkluZGV4ICE9PSAtMSkge1xuXHRcdHN0cmluZyA9IHN0cmluZ0VuY2FzZUNSTEZXaXRoRmlyc3RJbmRleChzdHJpbmcsIGNsb3NlQWxsLCBvcGVuQWxsLCBsZkluZGV4KTtcblx0fVxuXG5cdHJldHVybiBvcGVuQWxsICsgc3RyaW5nICsgY2xvc2VBbGw7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhjcmVhdGVDaGFsay5wcm90b3R5cGUsIHN0eWxlcyk7XG5cbmNvbnN0IGNoYWxrID0gY3JlYXRlQ2hhbGsoKTtcbmV4cG9ydCBjb25zdCBjaGFsa1N0ZGVyciA9IGNyZWF0ZUNoYWxrKHtsZXZlbDogc3RkZXJyQ29sb3IgPyBzdGRlcnJDb2xvci5sZXZlbCA6IDB9KTtcblxuZXhwb3J0IHtcblx0bW9kaWZpZXJOYW1lcyxcblx0Zm9yZWdyb3VuZENvbG9yTmFtZXMsXG5cdGJhY2tncm91bmRDb2xvck5hbWVzLFxuXHRjb2xvck5hbWVzLFxuXG5cdC8vIFRPRE86IFJlbW92ZSB0aGVzZSBhbGlhc2VzIGluIHRoZSBuZXh0IG1ham9yIHZlcnNpb25cblx0bW9kaWZpZXJOYW1lcyBhcyBtb2RpZmllcnMsXG5cdGZvcmVncm91bmRDb2xvck5hbWVzIGFzIGZvcmVncm91bmRDb2xvcnMsXG5cdGJhY2tncm91bmRDb2xvck5hbWVzIGFzIGJhY2tncm91bmRDb2xvcnMsXG5cdGNvbG9yTmFtZXMgYXMgY29sb3JzLFxufSBmcm9tICcuL3ZlbmRvci9hbnNpLXN0eWxlcy9pbmRleC5qcyc7XG5cbmV4cG9ydCB7XG5cdHN0ZG91dENvbG9yIGFzIHN1cHBvcnRzQ29sb3IsXG5cdHN0ZGVyckNvbG9yIGFzIHN1cHBvcnRzQ29sb3JTdGRlcnIsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjaGFsaztcbiIsIi8vIFRPRE86IFdoZW4gdGFyZ2V0aW5nIE5vZGUuanMgMTYsIHVzZSBgU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlQWxsYC5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdSZXBsYWNlQWxsKHN0cmluZywgc3Vic3RyaW5nLCByZXBsYWNlcikge1xuXHRsZXQgaW5kZXggPSBzdHJpbmcuaW5kZXhPZihzdWJzdHJpbmcpO1xuXHRpZiAoaW5kZXggPT09IC0xKSB7XG5cdFx0cmV0dXJuIHN0cmluZztcblx0fVxuXG5cdGNvbnN0IHN1YnN0cmluZ0xlbmd0aCA9IHN1YnN0cmluZy5sZW5ndGg7XG5cdGxldCBlbmRJbmRleCA9IDA7XG5cdGxldCByZXR1cm5WYWx1ZSA9ICcnO1xuXHRkbyB7XG5cdFx0cmV0dXJuVmFsdWUgKz0gc3RyaW5nLnNsaWNlKGVuZEluZGV4LCBpbmRleCkgKyBzdWJzdHJpbmcgKyByZXBsYWNlcjtcblx0XHRlbmRJbmRleCA9IGluZGV4ICsgc3Vic3RyaW5nTGVuZ3RoO1xuXHRcdGluZGV4ID0gc3RyaW5nLmluZGV4T2Yoc3Vic3RyaW5nLCBlbmRJbmRleCk7XG5cdH0gd2hpbGUgKGluZGV4ICE9PSAtMSk7XG5cblx0cmV0dXJuVmFsdWUgKz0gc3RyaW5nLnNsaWNlKGVuZEluZGV4KTtcblx0cmV0dXJuIHJldHVyblZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nRW5jYXNlQ1JMRldpdGhGaXJzdEluZGV4KHN0cmluZywgcHJlZml4LCBwb3N0Zml4LCBpbmRleCkge1xuXHRsZXQgZW5kSW5kZXggPSAwO1xuXHRsZXQgcmV0dXJuVmFsdWUgPSAnJztcblx0ZG8ge1xuXHRcdGNvbnN0IGdvdENSID0gc3RyaW5nW2luZGV4IC0gMV0gPT09ICdcXHInO1xuXHRcdHJldHVyblZhbHVlICs9IHN0cmluZy5zbGljZShlbmRJbmRleCwgKGdvdENSID8gaW5kZXggLSAxIDogaW5kZXgpKSArIHByZWZpeCArIChnb3RDUiA/ICdcXHJcXG4nIDogJ1xcbicpICsgcG9zdGZpeDtcblx0XHRlbmRJbmRleCA9IGluZGV4ICsgMTtcblx0XHRpbmRleCA9IHN0cmluZy5pbmRleE9mKCdcXG4nLCBlbmRJbmRleCk7XG5cdH0gd2hpbGUgKGluZGV4ICE9PSAtMSk7XG5cblx0cmV0dXJuVmFsdWUgKz0gc3RyaW5nLnNsaWNlKGVuZEluZGV4KTtcblx0cmV0dXJuIHJldHVyblZhbHVlO1xufVxuIiwiY29uc3QgQU5TSV9CQUNLR1JPVU5EX09GRlNFVCA9IDEwO1xuXG5jb25zdCB3cmFwQW5zaTE2ID0gKG9mZnNldCA9IDApID0+IGNvZGUgPT4gYFxcdTAwMUJbJHtjb2RlICsgb2Zmc2V0fW1gO1xuXG5jb25zdCB3cmFwQW5zaTI1NiA9IChvZmZzZXQgPSAwKSA9PiBjb2RlID0+IGBcXHUwMDFCWyR7MzggKyBvZmZzZXR9OzU7JHtjb2RlfW1gO1xuXG5jb25zdCB3cmFwQW5zaTE2bSA9IChvZmZzZXQgPSAwKSA9PiAocmVkLCBncmVlbiwgYmx1ZSkgPT4gYFxcdTAwMUJbJHszOCArIG9mZnNldH07Mjske3JlZH07JHtncmVlbn07JHtibHVlfW1gO1xuXG5jb25zdCBzdHlsZXMgPSB7XG5cdG1vZGlmaWVyOiB7XG5cdFx0cmVzZXQ6IFswLCAwXSxcblx0XHQvLyAyMSBpc24ndCB3aWRlbHkgc3VwcG9ydGVkIGFuZCAyMiBkb2VzIHRoZSBzYW1lIHRoaW5nXG5cdFx0Ym9sZDogWzEsIDIyXSxcblx0XHRkaW06IFsyLCAyMl0sXG5cdFx0aXRhbGljOiBbMywgMjNdLFxuXHRcdHVuZGVybGluZTogWzQsIDI0XSxcblx0XHRvdmVybGluZTogWzUzLCA1NV0sXG5cdFx0aW52ZXJzZTogWzcsIDI3XSxcblx0XHRoaWRkZW46IFs4LCAyOF0sXG5cdFx0c3RyaWtldGhyb3VnaDogWzksIDI5XSxcblx0fSxcblx0Y29sb3I6IHtcblx0XHRibGFjazogWzMwLCAzOV0sXG5cdFx0cmVkOiBbMzEsIDM5XSxcblx0XHRncmVlbjogWzMyLCAzOV0sXG5cdFx0eWVsbG93OiBbMzMsIDM5XSxcblx0XHRibHVlOiBbMzQsIDM5XSxcblx0XHRtYWdlbnRhOiBbMzUsIDM5XSxcblx0XHRjeWFuOiBbMzYsIDM5XSxcblx0XHR3aGl0ZTogWzM3LCAzOV0sXG5cblx0XHQvLyBCcmlnaHQgY29sb3Jcblx0XHRibGFja0JyaWdodDogWzkwLCAzOV0sXG5cdFx0Z3JheTogWzkwLCAzOV0sIC8vIEFsaWFzIG9mIGBibGFja0JyaWdodGBcblx0XHRncmV5OiBbOTAsIDM5XSwgLy8gQWxpYXMgb2YgYGJsYWNrQnJpZ2h0YFxuXHRcdHJlZEJyaWdodDogWzkxLCAzOV0sXG5cdFx0Z3JlZW5CcmlnaHQ6IFs5MiwgMzldLFxuXHRcdHllbGxvd0JyaWdodDogWzkzLCAzOV0sXG5cdFx0Ymx1ZUJyaWdodDogWzk0LCAzOV0sXG5cdFx0bWFnZW50YUJyaWdodDogWzk1LCAzOV0sXG5cdFx0Y3lhbkJyaWdodDogWzk2LCAzOV0sXG5cdFx0d2hpdGVCcmlnaHQ6IFs5NywgMzldLFxuXHR9LFxuXHRiZ0NvbG9yOiB7XG5cdFx0YmdCbGFjazogWzQwLCA0OV0sXG5cdFx0YmdSZWQ6IFs0MSwgNDldLFxuXHRcdGJnR3JlZW46IFs0MiwgNDldLFxuXHRcdGJnWWVsbG93OiBbNDMsIDQ5XSxcblx0XHRiZ0JsdWU6IFs0NCwgNDldLFxuXHRcdGJnTWFnZW50YTogWzQ1LCA0OV0sXG5cdFx0YmdDeWFuOiBbNDYsIDQ5XSxcblx0XHRiZ1doaXRlOiBbNDcsIDQ5XSxcblxuXHRcdC8vIEJyaWdodCBjb2xvclxuXHRcdGJnQmxhY2tCcmlnaHQ6IFsxMDAsIDQ5XSxcblx0XHRiZ0dyYXk6IFsxMDAsIDQ5XSwgLy8gQWxpYXMgb2YgYGJnQmxhY2tCcmlnaHRgXG5cdFx0YmdHcmV5OiBbMTAwLCA0OV0sIC8vIEFsaWFzIG9mIGBiZ0JsYWNrQnJpZ2h0YFxuXHRcdGJnUmVkQnJpZ2h0OiBbMTAxLCA0OV0sXG5cdFx0YmdHcmVlbkJyaWdodDogWzEwMiwgNDldLFxuXHRcdGJnWWVsbG93QnJpZ2h0OiBbMTAzLCA0OV0sXG5cdFx0YmdCbHVlQnJpZ2h0OiBbMTA0LCA0OV0sXG5cdFx0YmdNYWdlbnRhQnJpZ2h0OiBbMTA1LCA0OV0sXG5cdFx0YmdDeWFuQnJpZ2h0OiBbMTA2LCA0OV0sXG5cdFx0YmdXaGl0ZUJyaWdodDogWzEwNywgNDldLFxuXHR9LFxufTtcblxuZXhwb3J0IGNvbnN0IG1vZGlmaWVyTmFtZXMgPSBPYmplY3Qua2V5cyhzdHlsZXMubW9kaWZpZXIpO1xuZXhwb3J0IGNvbnN0IGZvcmVncm91bmRDb2xvck5hbWVzID0gT2JqZWN0LmtleXMoc3R5bGVzLmNvbG9yKTtcbmV4cG9ydCBjb25zdCBiYWNrZ3JvdW5kQ29sb3JOYW1lcyA9IE9iamVjdC5rZXlzKHN0eWxlcy5iZ0NvbG9yKTtcbmV4cG9ydCBjb25zdCBjb2xvck5hbWVzID0gWy4uLmZvcmVncm91bmRDb2xvck5hbWVzLCAuLi5iYWNrZ3JvdW5kQ29sb3JOYW1lc107XG5cbmZ1bmN0aW9uIGFzc2VtYmxlU3R5bGVzKCkge1xuXHRjb25zdCBjb2RlcyA9IG5ldyBNYXAoKTtcblxuXHRmb3IgKGNvbnN0IFtncm91cE5hbWUsIGdyb3VwXSBvZiBPYmplY3QuZW50cmllcyhzdHlsZXMpKSB7XG5cdFx0Zm9yIChjb25zdCBbc3R5bGVOYW1lLCBzdHlsZV0gb2YgT2JqZWN0LmVudHJpZXMoZ3JvdXApKSB7XG5cdFx0XHRzdHlsZXNbc3R5bGVOYW1lXSA9IHtcblx0XHRcdFx0b3BlbjogYFxcdTAwMUJbJHtzdHlsZVswXX1tYCxcblx0XHRcdFx0Y2xvc2U6IGBcXHUwMDFCWyR7c3R5bGVbMV19bWAsXG5cdFx0XHR9O1xuXG5cdFx0XHRncm91cFtzdHlsZU5hbWVdID0gc3R5bGVzW3N0eWxlTmFtZV07XG5cblx0XHRcdGNvZGVzLnNldChzdHlsZVswXSwgc3R5bGVbMV0pO1xuXHRcdH1cblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdHlsZXMsIGdyb3VwTmFtZSwge1xuXHRcdFx0dmFsdWU6IGdyb3VwLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSk7XG5cdH1cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc3R5bGVzLCAnY29kZXMnLCB7XG5cdFx0dmFsdWU6IGNvZGVzLFxuXHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHR9KTtcblxuXHRzdHlsZXMuY29sb3IuY2xvc2UgPSAnXFx1MDAxQlszOW0nO1xuXHRzdHlsZXMuYmdDb2xvci5jbG9zZSA9ICdcXHUwMDFCWzQ5bSc7XG5cblx0c3R5bGVzLmNvbG9yLmFuc2kgPSB3cmFwQW5zaTE2KCk7XG5cdHN0eWxlcy5jb2xvci5hbnNpMjU2ID0gd3JhcEFuc2kyNTYoKTtcblx0c3R5bGVzLmNvbG9yLmFuc2kxNm0gPSB3cmFwQW5zaTE2bSgpO1xuXHRzdHlsZXMuYmdDb2xvci5hbnNpID0gd3JhcEFuc2kxNihBTlNJX0JBQ0tHUk9VTkRfT0ZGU0VUKTtcblx0c3R5bGVzLmJnQ29sb3IuYW5zaTI1NiA9IHdyYXBBbnNpMjU2KEFOU0lfQkFDS0dST1VORF9PRkZTRVQpO1xuXHRzdHlsZXMuYmdDb2xvci5hbnNpMTZtID0gd3JhcEFuc2kxNm0oQU5TSV9CQUNLR1JPVU5EX09GRlNFVCk7XG5cblx0Ly8gRnJvbSBodHRwczovL2dpdGh1Yi5jb20vUWl4LS9jb2xvci1jb252ZXJ0L2Jsb2IvM2YwZTBkNGU5MmUyMzU3OTZjY2IxN2Y2ZTg1YzcyMDk0YTY1MWY0OS9jb252ZXJzaW9ucy5qc1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzdHlsZXMsIHtcblx0XHRyZ2JUb0Fuc2kyNTY6IHtcblx0XHRcdHZhbHVlKHJlZCwgZ3JlZW4sIGJsdWUpIHtcblx0XHRcdFx0Ly8gV2UgdXNlIHRoZSBleHRlbmRlZCBncmV5c2NhbGUgcGFsZXR0ZSBoZXJlLCB3aXRoIHRoZSBleGNlcHRpb24gb2Zcblx0XHRcdFx0Ly8gYmxhY2sgYW5kIHdoaXRlLiBub3JtYWwgcGFsZXR0ZSBvbmx5IGhhcyA0IGdyZXlzY2FsZSBzaGFkZXMuXG5cdFx0XHRcdGlmIChyZWQgPT09IGdyZWVuICYmIGdyZWVuID09PSBibHVlKSB7XG5cdFx0XHRcdFx0aWYgKHJlZCA8IDgpIHtcblx0XHRcdFx0XHRcdHJldHVybiAxNjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAocmVkID4gMjQ4KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMjMxO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBNYXRoLnJvdW5kKCgocmVkIC0gOCkgLyAyNDcpICogMjQpICsgMjMyO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIDE2XG5cdFx0XHRcdFx0KyAoMzYgKiBNYXRoLnJvdW5kKHJlZCAvIDI1NSAqIDUpKVxuXHRcdFx0XHRcdCsgKDYgKiBNYXRoLnJvdW5kKGdyZWVuIC8gMjU1ICogNSkpXG5cdFx0XHRcdFx0KyBNYXRoLnJvdW5kKGJsdWUgLyAyNTUgKiA1KTtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9LFxuXHRcdGhleFRvUmdiOiB7XG5cdFx0XHR2YWx1ZShoZXgpIHtcblx0XHRcdFx0Y29uc3QgbWF0Y2hlcyA9IC9bYS1mXFxkXXs2fXxbYS1mXFxkXXszfS9pLmV4ZWMoaGV4LnRvU3RyaW5nKDE2KSk7XG5cdFx0XHRcdGlmICghbWF0Y2hlcykge1xuXHRcdFx0XHRcdHJldHVybiBbMCwgMCwgMF07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgW2NvbG9yU3RyaW5nXSA9IG1hdGNoZXM7XG5cblx0XHRcdFx0aWYgKGNvbG9yU3RyaW5nLmxlbmd0aCA9PT0gMykge1xuXHRcdFx0XHRcdGNvbG9yU3RyaW5nID0gWy4uLmNvbG9yU3RyaW5nXS5tYXAoY2hhcmFjdGVyID0+IGNoYXJhY3RlciArIGNoYXJhY3Rlcikuam9pbignJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBpbnRlZ2VyID0gTnVtYmVyLnBhcnNlSW50KGNvbG9yU3RyaW5nLCAxNik7XG5cblx0XHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0XHQvKiBlc2xpbnQtZGlzYWJsZSBuby1iaXR3aXNlICovXG5cdFx0XHRcdFx0KGludGVnZXIgPj4gMTYpICYgMHhGRixcblx0XHRcdFx0XHQoaW50ZWdlciA+PiA4KSAmIDB4RkYsXG5cdFx0XHRcdFx0aW50ZWdlciAmIDB4RkYsXG5cdFx0XHRcdFx0LyogZXNsaW50LWVuYWJsZSBuby1iaXR3aXNlICovXG5cdFx0XHRcdF07XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0XHRoZXhUb0Fuc2kyNTY6IHtcblx0XHRcdHZhbHVlOiBoZXggPT4gc3R5bGVzLnJnYlRvQW5zaTI1NiguLi5zdHlsZXMuaGV4VG9SZ2IoaGV4KSksXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9LFxuXHRcdGFuc2kyNTZUb0Fuc2k6IHtcblx0XHRcdHZhbHVlKGNvZGUpIHtcblx0XHRcdFx0aWYgKGNvZGUgPCA4KSB7XG5cdFx0XHRcdFx0cmV0dXJuIDMwICsgY29kZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjb2RlIDwgMTYpIHtcblx0XHRcdFx0XHRyZXR1cm4gOTAgKyAoY29kZSAtIDgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHJlZDtcblx0XHRcdFx0bGV0IGdyZWVuO1xuXHRcdFx0XHRsZXQgYmx1ZTtcblxuXHRcdFx0XHRpZiAoY29kZSA+PSAyMzIpIHtcblx0XHRcdFx0XHRyZWQgPSAoKChjb2RlIC0gMjMyKSAqIDEwKSArIDgpIC8gMjU1O1xuXHRcdFx0XHRcdGdyZWVuID0gcmVkO1xuXHRcdFx0XHRcdGJsdWUgPSByZWQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29kZSAtPSAxNjtcblxuXHRcdFx0XHRcdGNvbnN0IHJlbWFpbmRlciA9IGNvZGUgJSAzNjtcblxuXHRcdFx0XHRcdHJlZCA9IE1hdGguZmxvb3IoY29kZSAvIDM2KSAvIDU7XG5cdFx0XHRcdFx0Z3JlZW4gPSBNYXRoLmZsb29yKHJlbWFpbmRlciAvIDYpIC8gNTtcblx0XHRcdFx0XHRibHVlID0gKHJlbWFpbmRlciAlIDYpIC8gNTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gTWF0aC5tYXgocmVkLCBncmVlbiwgYmx1ZSkgKiAyO1xuXG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gMCkge1xuXHRcdFx0XHRcdHJldHVybiAzMDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1iaXR3aXNlXG5cdFx0XHRcdGxldCByZXN1bHQgPSAzMCArICgoTWF0aC5yb3VuZChibHVlKSA8PCAyKSB8IChNYXRoLnJvdW5kKGdyZWVuKSA8PCAxKSB8IE1hdGgucm91bmQocmVkKSk7XG5cblx0XHRcdFx0aWYgKHZhbHVlID09PSAyKSB7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IDYwO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9LFxuXHRcdHJnYlRvQW5zaToge1xuXHRcdFx0dmFsdWU6IChyZWQsIGdyZWVuLCBibHVlKSA9PiBzdHlsZXMuYW5zaTI1NlRvQW5zaShzdHlsZXMucmdiVG9BbnNpMjU2KHJlZCwgZ3JlZW4sIGJsdWUpKSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0sXG5cdFx0aGV4VG9BbnNpOiB7XG5cdFx0XHR2YWx1ZTogaGV4ID0+IHN0eWxlcy5hbnNpMjU2VG9BbnNpKHN0eWxlcy5oZXhUb0Fuc2kyNTYoaGV4KSksXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9LFxuXHR9KTtcblxuXHRyZXR1cm4gc3R5bGVzO1xufVxuXG5jb25zdCBhbnNpU3R5bGVzID0gYXNzZW1ibGVTdHlsZXMoKTtcblxuZXhwb3J0IGRlZmF1bHQgYW5zaVN0eWxlcztcbiIsImltcG9ydCBwcm9jZXNzIGZyb20gJ25vZGU6cHJvY2Vzcyc7XG5pbXBvcnQgb3MgZnJvbSAnbm9kZTpvcyc7XG5pbXBvcnQgdHR5IGZyb20gJ25vZGU6dHR5JztcblxuLy8gRnJvbTogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9oYXMtZmxhZy9ibG9iL21haW4vaW5kZXguanNcbi8vLyBmdW5jdGlvbiBoYXNGbGFnKGZsYWcsIGFyZ3YgPSBnbG9iYWxUaGlzLkRlbm8/LmFyZ3MgPz8gcHJvY2Vzcy5hcmd2KSB7XG5mdW5jdGlvbiBoYXNGbGFnKGZsYWcsIGFyZ3YgPSBnbG9iYWxUaGlzLkRlbm8gPyBnbG9iYWxUaGlzLkRlbm8uYXJncyA6IHByb2Nlc3MuYXJndikge1xuXHRjb25zdCBwcmVmaXggPSBmbGFnLnN0YXJ0c1dpdGgoJy0nKSA/ICcnIDogKGZsYWcubGVuZ3RoID09PSAxID8gJy0nIDogJy0tJyk7XG5cdGNvbnN0IHBvc2l0aW9uID0gYXJndi5pbmRleE9mKHByZWZpeCArIGZsYWcpO1xuXHRjb25zdCB0ZXJtaW5hdG9yUG9zaXRpb24gPSBhcmd2LmluZGV4T2YoJy0tJyk7XG5cdHJldHVybiBwb3NpdGlvbiAhPT0gLTEgJiYgKHRlcm1pbmF0b3JQb3NpdGlvbiA9PT0gLTEgfHwgcG9zaXRpb24gPCB0ZXJtaW5hdG9yUG9zaXRpb24pO1xufVxuXG5jb25zdCB7ZW52fSA9IHByb2Nlc3M7XG5cbmxldCBmbGFnRm9yY2VDb2xvcjtcbmlmIChcblx0aGFzRmxhZygnbm8tY29sb3InKVxuXHR8fCBoYXNGbGFnKCduby1jb2xvcnMnKVxuXHR8fCBoYXNGbGFnKCdjb2xvcj1mYWxzZScpXG5cdHx8IGhhc0ZsYWcoJ2NvbG9yPW5ldmVyJylcbikge1xuXHRmbGFnRm9yY2VDb2xvciA9IDA7XG59IGVsc2UgaWYgKFxuXHRoYXNGbGFnKCdjb2xvcicpXG5cdHx8IGhhc0ZsYWcoJ2NvbG9ycycpXG5cdHx8IGhhc0ZsYWcoJ2NvbG9yPXRydWUnKVxuXHR8fCBoYXNGbGFnKCdjb2xvcj1hbHdheXMnKVxuKSB7XG5cdGZsYWdGb3JjZUNvbG9yID0gMTtcbn1cblxuZnVuY3Rpb24gZW52Rm9yY2VDb2xvcigpIHtcblx0aWYgKCdGT1JDRV9DT0xPUicgaW4gZW52KSB7XG5cdFx0aWYgKGVudi5GT1JDRV9DT0xPUiA9PT0gJ3RydWUnKSB7XG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9XG5cblx0XHRpZiAoZW52LkZPUkNFX0NPTE9SID09PSAnZmFsc2UnKSB7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9XG5cblx0XHRyZXR1cm4gZW52LkZPUkNFX0NPTE9SLmxlbmd0aCA9PT0gMCA/IDEgOiBNYXRoLm1pbihOdW1iZXIucGFyc2VJbnQoZW52LkZPUkNFX0NPTE9SLCAxMCksIDMpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHRyYW5zbGF0ZUxldmVsKGxldmVsKSB7XG5cdGlmIChsZXZlbCA9PT0gMCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0bGV2ZWwsXG5cdFx0aGFzQmFzaWM6IHRydWUsXG5cdFx0aGFzMjU2OiBsZXZlbCA+PSAyLFxuXHRcdGhhczE2bTogbGV2ZWwgPj0gMyxcblx0fTtcbn1cblxuZnVuY3Rpb24gX3N1cHBvcnRzQ29sb3IoaGF2ZVN0cmVhbSwge3N0cmVhbUlzVFRZLCBzbmlmZkZsYWdzID0gdHJ1ZX0gPSB7fSkge1xuXHRjb25zdCBub0ZsYWdGb3JjZUNvbG9yID0gZW52Rm9yY2VDb2xvcigpO1xuXHRpZiAobm9GbGFnRm9yY2VDb2xvciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0ZmxhZ0ZvcmNlQ29sb3IgPSBub0ZsYWdGb3JjZUNvbG9yO1xuXHR9XG5cblx0Y29uc3QgZm9yY2VDb2xvciA9IHNuaWZmRmxhZ3MgPyBmbGFnRm9yY2VDb2xvciA6IG5vRmxhZ0ZvcmNlQ29sb3I7XG5cblx0aWYgKGZvcmNlQ29sb3IgPT09IDApIHtcblx0XHRyZXR1cm4gMDtcblx0fVxuXG5cdGlmIChzbmlmZkZsYWdzKSB7XG5cdFx0aWYgKGhhc0ZsYWcoJ2NvbG9yPTE2bScpXG5cdFx0XHR8fCBoYXNGbGFnKCdjb2xvcj1mdWxsJylcblx0XHRcdHx8IGhhc0ZsYWcoJ2NvbG9yPXRydWVjb2xvcicpKSB7XG5cdFx0XHRyZXR1cm4gMztcblx0XHR9XG5cblx0XHRpZiAoaGFzRmxhZygnY29sb3I9MjU2JykpIHtcblx0XHRcdHJldHVybiAyO1xuXHRcdH1cblx0fVxuXG5cdC8vIENoZWNrIGZvciBBenVyZSBEZXZPcHMgcGlwZWxpbmVzLlxuXHQvLyBIYXMgdG8gYmUgYWJvdmUgdGhlIGAhc3RyZWFtSXNUVFlgIGNoZWNrLlxuXHRpZiAoJ1RGX0JVSUxEJyBpbiBlbnYgJiYgJ0FHRU5UX05BTUUnIGluIGVudikge1xuXHRcdHJldHVybiAxO1xuXHR9XG5cblx0aWYgKGhhdmVTdHJlYW0gJiYgIXN0cmVhbUlzVFRZICYmIGZvcmNlQ29sb3IgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiAwO1xuXHR9XG5cblx0Y29uc3QgbWluID0gZm9yY2VDb2xvciB8fCAwO1xuXG5cdGlmIChlbnYuVEVSTSA9PT0gJ2R1bWInKSB7XG5cdFx0cmV0dXJuIG1pbjtcblx0fVxuXG5cdGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG5cdFx0Ly8gV2luZG93cyAxMCBidWlsZCAxMDU4NiBpcyB0aGUgZmlyc3QgV2luZG93cyByZWxlYXNlIHRoYXQgc3VwcG9ydHMgMjU2IGNvbG9ycy5cblx0XHQvLyBXaW5kb3dzIDEwIGJ1aWxkIDE0OTMxIGlzIHRoZSBmaXJzdCByZWxlYXNlIHRoYXQgc3VwcG9ydHMgMTZtL1RydWVDb2xvci5cblx0XHRjb25zdCBvc1JlbGVhc2UgPSBvcy5yZWxlYXNlKCkuc3BsaXQoJy4nKTtcblx0XHRpZiAoXG5cdFx0XHROdW1iZXIob3NSZWxlYXNlWzBdKSA+PSAxMFxuXHRcdFx0JiYgTnVtYmVyKG9zUmVsZWFzZVsyXSkgPj0gMTBfNTg2XG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gTnVtYmVyKG9zUmVsZWFzZVsyXSkgPj0gMTRfOTMxID8gMyA6IDI7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIDE7XG5cdH1cblxuXHRpZiAoJ0NJJyBpbiBlbnYpIHtcblx0XHRpZiAoJ0dJVEhVQl9BQ1RJT05TJyBpbiBlbnYgfHwgJ0dJVEVBX0FDVElPTlMnIGluIGVudikge1xuXHRcdFx0cmV0dXJuIDM7XG5cdFx0fVxuXG5cdFx0aWYgKFsnVFJBVklTJywgJ0NJUkNMRUNJJywgJ0FQUFZFWU9SJywgJ0dJVExBQl9DSScsICdCVUlMREtJVEUnLCAnRFJPTkUnXS5zb21lKHNpZ24gPT4gc2lnbiBpbiBlbnYpIHx8IGVudi5DSV9OQU1FID09PSAnY29kZXNoaXAnKSB7XG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbWluO1xuXHR9XG5cblx0aWYgKCdURUFNQ0lUWV9WRVJTSU9OJyBpbiBlbnYpIHtcblx0XHRyZXR1cm4gL14oOVxcLigwKlsxLTldXFxkKilcXC58XFxkezIsfVxcLikvLnRlc3QoZW52LlRFQU1DSVRZX1ZFUlNJT04pID8gMSA6IDA7XG5cdH1cblxuXHRpZiAoZW52LkNPTE9SVEVSTSA9PT0gJ3RydWVjb2xvcicpIHtcblx0XHRyZXR1cm4gMztcblx0fVxuXG5cdGlmIChlbnYuVEVSTSA9PT0gJ3h0ZXJtLWtpdHR5Jykge1xuXHRcdHJldHVybiAzO1xuXHR9XG5cblx0aWYgKCdURVJNX1BST0dSQU0nIGluIGVudikge1xuXHRcdGNvbnN0IHZlcnNpb24gPSBOdW1iZXIucGFyc2VJbnQoKGVudi5URVJNX1BST0dSQU1fVkVSU0lPTiB8fCAnJykuc3BsaXQoJy4nKVswXSwgMTApO1xuXG5cdFx0c3dpdGNoIChlbnYuVEVSTV9QUk9HUkFNKSB7XG5cdFx0XHRjYXNlICdpVGVybS5hcHAnOiB7XG5cdFx0XHRcdHJldHVybiB2ZXJzaW9uID49IDMgPyAzIDogMjtcblx0XHRcdH1cblxuXHRcdFx0Y2FzZSAnQXBwbGVfVGVybWluYWwnOiB7XG5cdFx0XHRcdHJldHVybiAyO1xuXHRcdFx0fVxuXHRcdFx0Ly8gTm8gZGVmYXVsdFxuXHRcdH1cblx0fVxuXG5cdGlmICgvLTI1Nihjb2xvcik/JC9pLnRlc3QoZW52LlRFUk0pKSB7XG5cdFx0cmV0dXJuIDI7XG5cdH1cblxuXHRpZiAoL15zY3JlZW58Xnh0ZXJtfF52dDEwMHxednQyMjB8XnJ4dnR8Y29sb3J8YW5zaXxjeWd3aW58bGludXgvaS50ZXN0KGVudi5URVJNKSkge1xuXHRcdHJldHVybiAxO1xuXHR9XG5cblx0aWYgKCdDT0xPUlRFUk0nIGluIGVudikge1xuXHRcdHJldHVybiAxO1xuXHR9XG5cblx0cmV0dXJuIG1pbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN1cHBvcnRzQ29sb3Ioc3RyZWFtLCBvcHRpb25zID0ge30pIHtcblx0Y29uc3QgbGV2ZWwgPSBfc3VwcG9ydHNDb2xvcihzdHJlYW0sIHtcblx0XHRzdHJlYW1Jc1RUWTogc3RyZWFtICYmIHN0cmVhbS5pc1RUWSxcblx0XHQuLi5vcHRpb25zLFxuXHR9KTtcblxuXHRyZXR1cm4gdHJhbnNsYXRlTGV2ZWwobGV2ZWwpO1xufVxuXG5jb25zdCBzdXBwb3J0c0NvbG9yID0ge1xuXHRzdGRvdXQ6IGNyZWF0ZVN1cHBvcnRzQ29sb3Ioe2lzVFRZOiB0dHkuaXNhdHR5KDEpfSksXG5cdHN0ZGVycjogY3JlYXRlU3VwcG9ydHNDb2xvcih7aXNUVFk6IHR0eS5pc2F0dHkoMil9KSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHN1cHBvcnRzQ29sb3I7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3NlcnZlcjIudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
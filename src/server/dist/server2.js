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
            // console.log(`Worker with ID ${workerId} created on port ${port}.`);
            this.oldWorkerId = this.currentWorkerId;
            return workerId;
        });
    }
    swapWorkers(lockMutex) {
        return __awaiter(this, void 0, void 0, function* () {
            if (lockMutex)
                lockMutex.unlock();
            if (this.currentWorkerId === undefined)
                return;
            if (this.oldWorkerId !== undefined) {
                yield mutex.lock();
                try {
                    // console.log(`Swapping from worker ID ${this.oldWorkerId} to ${this.currentWorkerId}`);
                    // Transfer state from old worker to new worker
                    const snapshot = yield this.manager.call(this.oldWorkerId, 'getSnapshot');
                    yield this.manager.call(this.currentWorkerId, 'setSnapshot', snapshot);
                    // Cancel all tasks related to the old worker and close WebSocket server
                    yield this.manager.call(this.oldWorkerId, 'closeWebSocketServerAndPage');
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
                        // console.log(`Calling worker with ID: ${this.currentWorkerId}, method: generateNextFrameGroup`);
                        let frameGroup = yield this.manager.call(this.currentWorkerId, 'generateNextFrameGroup');
                        if (frameGroup) {
                            for (let client of clients) {
                                client.send(JSON.stringify(frameGroup));
                            }
                        }
                        let nextTimeout = frameGroup.startTime - Date.now() - 500;
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
            let workerId = yield this.createWorker();
            yield new Promise(resolve1 => setTimeout(resolve1, 10000));
            yield mutex.lock();
            this.currentWorkerId = workerId;
            yield this.swapWorkers(mutex); // Swap after new worker is fully ready
        });
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const manager = new WorkerManager();
    manager.currentWorkerId = yield manager.createWorker();
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
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
    yield mutex.lock();
    const memoryData = process.memoryUsage();
    const memoryUsage = {
        rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
        heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
        heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
        external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
    };
    console.log(memoryUsage);
    mutex.unlock();
}), 60000);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyMi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQWE7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsdUhBQXVIO0FBQzVJO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQSwrQkFBK0Isa0JBQWtCO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFFQUFxRSw4QkFBOEI7QUFDbkcsdUVBQXVFLDhCQUE4QjtBQUNyRztBQUNBO0FBQ0EsYUFBYTtBQUNiLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1GQUFtRix5QkFBeUI7QUFDNUc7QUFDQSxhQUFhO0FBQ2IscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRkFBaUYsc0JBQXNCO0FBQ3ZHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRUFBcUU7QUFDckU7QUFDQTtBQUNBO0FBQ0EsK0VBQStFO0FBQy9FO0FBQ0E7QUFDQTtBQUNBLHlEQUF5RDtBQUN6RDtBQUNBLGFBQWE7QUFDYjtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLGdDQUFnQztBQUNoQyxjQUFjO0FBQ2QsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7Ozs7Ozs7Ozs7QUMxS1M7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsb0NBQW9DO0FBQ25EO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0Q7QUFDQSxhQUFhLG1CQUFPLENBQUMsMERBQVM7Ozs7Ozs7Ozs7Ozs7O0FDakI5QixNQUFhLFVBQVU7SUFTbkIsWUFBWSxTQUFpQixFQUFFLGFBQXFCLEVBQUUsVUFBa0IsRUFBRSxlQUF1QixFQUFFLGNBQXdCLEVBQUUsV0FBbUIsRUFBRSxLQUFhO1FBQzNKLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7Q0FDSjtBQWxCRCxnQ0FrQkM7Ozs7Ozs7Ozs7Ozs7O0FDakJELDRGQUF3QztBQUV4QyxNQUFhLE1BQU07SUFXZixZQUFZLEtBQWEsRUFBRSxNQUFjLEVBQUUsZUFBdUIsRUFBRSxjQUFzQixFQUFFLFNBQWlCO1FBSnJHLHFCQUFnQixHQUFXLENBQUMsQ0FBQztRQUM5QixhQUFRLEdBQW9CLEVBQUUsQ0FBQztRQUlsQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN2QyxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztJQUNqQyxDQUFDO0lBRUQsaUJBQWlCO1FBQ2IsT0FBTyxXQUFXLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUM7SUFDaEQsQ0FBQztJQUVELFlBQVksQ0FBQyxZQUFvQjtRQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztRQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUM7SUFDcEMsQ0FBQztJQUVELGlCQUFpQixDQUFDLFNBQXNCLEVBQUUsY0FBK0I7UUFDckUsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFrQixDQUFDO1FBQ3ZFLE1BQU0sYUFBYSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQ2xELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFFdkMsc0JBQXNCO1FBQ3RCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDbkMsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLFNBQVMsR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDLENBQUM7UUFDakcsSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLEdBQUcsYUFBYSxHQUFHLFVBQVUsQ0FBQztRQUUxRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbEMsSUFBSSxLQUFrQixDQUFDO1lBRXZCLElBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDNUIsa0NBQWtDO2dCQUNsQyxLQUFLLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLENBQUM7aUJBQU0sQ0FBQztnQkFDSiwwQ0FBMEM7Z0JBQzFDLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN0QyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7Z0JBQ2xDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDO2dCQUN0QyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQztnQkFDeEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO2dCQUNoQyxTQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUM7WUFFekMsOERBQThEO1lBQzlELEtBQUssQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBRXJCLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDaEQsMkRBQTJEO1lBQzNELEtBQUssTUFBTSxhQUFhLElBQUksY0FBYyxFQUFFLENBQUM7Z0JBQ3pDLGFBQWEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsQ0FBQztRQUNMLENBQUM7UUFFRCx5Q0FBeUM7UUFDekMsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLFVBQVUsRUFBRSxDQUFDO1lBQ3JDLEtBQUssSUFBSSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUMzRCxTQUFTLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdDLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7UUFDN0MsT0FBTyxJQUFJLHVCQUFVLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvSCxDQUFDO0lBRUQsVUFBVSxDQUFDLGFBQTRCO1FBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7SUFFTCxDQUFDO0lBRUQsYUFBYSxDQUFDLGFBQTRCO1FBQ3RDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssYUFBYSxDQUFDO0lBQ2xFLENBQUM7SUFFRCxhQUFhO1FBQ1QsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFO0lBQ3RCLENBQUM7Q0FDSjtBQTlGRCx3QkE4RkM7Ozs7Ozs7Ozs7Ozs7O0FDOUZELE1BQWEsYUFBYTtJQWV0QixZQUFZLE1BQWMsRUFBRSxPQUErQyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsS0FBYSxFQUFFLE1BQWM7UUFOaEksWUFBTyxHQUFZLElBQUksQ0FBQztRQUN4QixVQUFLLEdBQUcsQ0FBQyxDQUFDO1FBTU4sSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxDQUFFLDRCQUE0QjtRQUV6RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQy9DLENBQUM7SUFFRCxtRUFBbUU7SUFDbkUsa0JBQWtCO1FBQ2QsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFDcEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO1FBQ3BDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztRQUNwQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxZQUFZLENBQUM7UUFDekQsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBaUIsQ0FBQztRQUMzQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQ2xDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxPQUFPLENBQUMsT0FBZTtRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2Qiw4Q0FBOEM7SUFDbEQsQ0FBQztJQUVELGVBQWUsQ0FBQyxTQUF1QztRQUNuRCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0lBRUQsc0JBQXNCLENBQUMsU0FBdUM7UUFDMUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELHFCQUFxQixDQUFDLFFBQXVDO1FBQ3pELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxRQUFRLENBQUM7SUFDdkMsQ0FBQztJQUVELGNBQWMsQ0FBQyxTQUFpQjtRQUM1QixJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQzFCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNwQyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlCLENBQUM7SUFDTCxDQUFDO0lBRUQsV0FBVyxDQUFDLFFBQXlCO1FBQ2pDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxRQUFRLENBQUMsU0FBc0I7UUFDM0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1FBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFDMUIsK0NBQStDO1FBQy9DLElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQWdCLENBQUM7UUFFaEUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1Asd0NBQXdDO1lBQ3hDLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNqQixTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCw4QkFBOEI7UUFDOUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO1FBQ2hDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDcEQsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNuRCxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQztRQUNwQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQztRQUN0QyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFFOUIsa0RBQWtEO1FBQ2xELE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRWhFLElBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ25DLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNqQyxDQUFDO2FBQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxZQUFZLGdCQUFnQixJQUFJLElBQUksQ0FBQyxPQUFPLFlBQVksVUFBVSxFQUFFLENBQUM7WUFDeEYsR0FBRyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsQ0FBQyw0QkFBNEI7WUFDaEQsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEMsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQTFHRCxzQ0EwR0M7QUFFRCxNQUFhLGlCQUFrQixTQUFRLGFBQWE7SUFDaEQsWUFBWSxNQUFjLEVBQUUsT0FBK0MsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLEtBQWEsRUFBRSxNQUFjO1FBQzVILEtBQUssQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRUQsT0FBTztRQUNILElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQ3JDLE1BQU0sR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxpREFBaUQ7UUFDOUYsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFaRCw4Q0FZQzs7Ozs7Ozs7Ozs7Ozs7QUN6SEQsTUFBc0IsZUFBZTtJQUlqQyxZQUFZLE9BQXNCLEVBQUUsZUFBd0I7UUFDeEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlO1FBQ3RDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0lBQzdCLENBQUM7Q0FHSjtBQVhELDBDQVdDO0FBRUQsTUFBYSxnQkFBaUIsU0FBUSxlQUFlO0lBR2pELFlBQVksT0FBc0IsRUFBRSxLQUFhO1FBQzdDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBaUI7UUFDbkIsb0VBQW9FO1FBQ3BFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDakQsOEVBQThFO1FBQzlFLGlFQUFpRTtJQUNyRSxDQUFDO0NBQ0o7QUFkRCw0Q0FjQztBQUVELE1BQWEscUJBQXNCLFNBQVEsZUFBZTtJQUd0RCxZQUFZLE9BQXNCLEVBQUUsTUFBYztRQUM5QyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQWlCO1FBQ25CLE1BQU0sS0FBSyxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3RELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUMsS0FBSyxFQUFFLE9BQU8sR0FBRyxjQUFjLEVBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7Q0FDSjtBQWJELHNEQWFDO0FBR0QsTUFBYSxxQkFBc0IsU0FBUSxlQUFlO0lBS3RELFlBQVksT0FBc0IsRUFBRSxvQkFBNEIsRUFBRSxlQUF1QjtRQUNyRixLQUFLLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQztRQUNqRCxJQUFJLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQWlCO1FBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7WUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDcEMsT0FBTztRQUNYLENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNyRixJQUFJLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQztRQUU5QixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ3hDLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUF6QkQsc0RBeUJDO0FBRUQsTUFBYSxhQUFjLFNBQVEsZUFBZTtJQUM5QyxLQUFLLENBQUMsU0FBaUI7UUFDbkIsSUFBSSxDQUFDLEdBQUcsU0FBUyxHQUFHLElBQUk7UUFDeEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLEdBQUc7SUFDbEMsQ0FBQztDQUVKO0FBTkQsc0NBTUM7QUFFRCxNQUFhLGFBQWMsU0FBUSxlQUFlO0lBQzlDLEtBQUssQ0FBQyxTQUFpQjtRQUNuQixzQ0FBc0M7UUFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxHQUFHLEdBQUc7WUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDdEIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBRVQsdUNBQXVDO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUM7WUFDaEMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxHQUFHO1NBQzNCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQVpELHNDQVlDOzs7Ozs7Ozs7Ozs7Ozs7OztBQzlGRCw4R0FBMEI7QUFRMUIsTUFBYSxZQUFZO0lBS3JCO1FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQWlCLEVBQUUsV0FBMkI7UUFDaEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRS9CLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFFLENBQUM7UUFFckQsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQ3JDLE1BQU0sa0JBQWtCLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBRSxDQUFDO1lBQzdFLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVELGdCQUFnQixDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRW5DLElBQUksV0FBVyxFQUFFLENBQUM7WUFDZCxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLEVBQUU7Z0JBQ25DLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztvQkFDMUMsTUFBTSxTQUFTLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBRSxDQUFDO29CQUN6RSxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ2pFLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDMUQsTUFBTSxTQUFTLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUUsQ0FBQztZQUN6RSxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBRUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFFRCxNQUFNLENBQUMsU0FBdUIsRUFBRTtRQUM1QixNQUFNLFdBQVcsR0FBYSxFQUFFLENBQUM7UUFDakMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUM7UUFDMUMsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDM0MsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsbUJBQW1CLElBQUksS0FBSyxDQUFDO1FBRWhFLG1CQUFtQjtRQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUNoQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUU1QyxJQUFJLE9BQU8sSUFBSSxhQUFhLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxlQUFlLEVBQUUsQ0FBQztnQkFDbEUsdUJBQXVCO2dCQUN2QixNQUFNLG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO2dCQUU5RCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsRUFBRTtvQkFDbkQsSUFBSSxjQUFjLENBQUMsV0FBVyxFQUFFLElBQUksYUFBYSxFQUFFLENBQUM7d0JBQ2hELG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBQ3ZELENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsMEZBQTBGO2dCQUMxRixJQUFJLENBQUMsbUJBQW1CLElBQUksbUJBQW1CLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUN2RCxJQUFJLENBQUMsK0JBQStCLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztnQkFDeEYsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRU8sK0JBQStCLENBQ25DLFdBQXFCLEVBQ3JCLEtBQWEsRUFDYixJQUFlLEVBQ2YsbUJBQWdEO1FBRWhELFdBQVcsQ0FBQyxJQUFJLENBQ1osR0FBRyxlQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLGFBQWEsZUFBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUN0SCxDQUFDO1FBRUYsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxFQUFFO1lBQ3RELFdBQVcsQ0FBQyxJQUFJLENBQ1osS0FBSyxlQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLGVBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsY0FBYyxDQUFDLEtBQUssU0FBUyxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBVyxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBVyxlQUFLLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUM1TyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUEzRkQsb0NBMkZDO0FBRUQsTUFBTSxTQUFTO0lBS1g7UUFDSSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsZUFBZTtRQUNYLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxTQUFpQjtRQUNqQyxJQUFJLENBQUMsa0JBQWtCLElBQUksU0FBUyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxvQkFBb0I7UUFDaEIsT0FBTyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxTQUFpQixFQUFFLFNBQWlCO1FBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBRSxDQUFDO1FBQ3hELGNBQWMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckMsQ0FBQztDQUNKO0FBRUQsTUFBTSxjQUFjO0lBTWhCO1FBQ0ksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBRUQsTUFBTSxDQUFDLFNBQWlCO1FBQ3BCLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDO1FBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxXQUFXO1FBQ1AsT0FBTyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQztDQUNKOzs7Ozs7Ozs7Ozs7OztBQzdKRCxNQUFhLEtBQUs7SUFBbEI7UUFFWSxXQUFNLEdBQW1CLEVBQUUsQ0FBQztRQUM1QixVQUFLLEdBQUcsS0FBSyxDQUFDO0lBb0MxQixDQUFDO0lBbENHLElBQUksQ0FBQyxNQUFlO1FBQ2hCLElBQUksS0FBSyxDQUFDLFVBQVUsSUFBSSxNQUFNO1lBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNoRixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDZCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztnQkFDbEIsR0FBRyxFQUFFLENBQUM7WUFDVixDQUFDO2lCQUFNLENBQUM7Z0JBQ0osSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUIsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELE9BQU8sQ0FBQyxNQUFlO1FBQ25CLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2IsNkNBQTZDO1lBQzdDLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7YUFBTSxDQUFDO1lBQ0oscURBQXFEO1lBQ3JELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksS0FBSyxDQUFDLFVBQVUsSUFBSSxNQUFNO2dCQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEYsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztJQUNMLENBQUM7SUFHRCxNQUFNLENBQUMsTUFBZTtRQUNsQixJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksTUFBTTtZQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDO1FBQ3JFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDekIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQyxJQUFJLElBQUk7Z0JBQUUsSUFBSSxFQUFFLENBQUM7UUFDckIsQ0FBQzthQUFNLENBQUM7WUFDSixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUN2QixDQUFDO0lBQ0wsQ0FBQzs7QUF0Q0wsc0JBdUNDO0FBdENVLGdCQUFVLEdBQUcsSUFBSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRDVCLHdJQUFtRjtBQUVuRix1REFBNkI7QUFDN0IsaURBQXFDO0FBQ3JDLGdHQUFrRDtBQUNsRCwrRkFBK0M7QUFDL0Msb0dBQStCO0FBQy9CLG9IQUFnRjtBQUNoRix3R0FLb0M7QUFDcEMsMkVBQW9DO0FBQ3BDLHNGQUF3QztBQUV4QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDVixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFDdEIsSUFBSSxPQUFPLEdBQWdCLEVBQUUsQ0FBQztBQUM5QixJQUFJLE9BQU8sR0FBRyxJQUFJLDJCQUFZLEVBQUUsQ0FBQztBQUNqQyxJQUFJLEtBQUssR0FBRyxJQUFJLGFBQUssRUFBRSxDQUFDO0FBRXhCLE1BQU0sYUFBYTtJQVNmO1FBUEEsb0JBQWUsR0FBdUIsU0FBUyxDQUFDO1FBQ3hDLFVBQUssR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyQixxQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDckIsYUFBUSxHQUErQixTQUFTLENBQUM7UUFDakQsWUFBTyxHQUErQixTQUFTLENBQUM7UUFDaEQsZ0JBQVcsR0FBdUIsU0FBUyxDQUFDO1FBR2hELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxtQkFBaUIsRUFBWSxDQUFDO0lBQ3JELENBQUM7SUFFSyxZQUFZOztZQUNkLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUUsa0NBQWtDO1lBQ3RGLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFL0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLGtCQUFPLEVBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDOUYsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUQsc0VBQXNFO1lBQ3RFLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWU7WUFDdkMsT0FBTyxRQUFRLENBQUM7UUFDcEIsQ0FBQztLQUFBO0lBRUssV0FBVyxDQUFDLFNBQWlCOztZQUMvQixJQUFJLFNBQVM7Z0JBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUNqQyxJQUFJLElBQUksQ0FBQyxlQUFlLEtBQUssU0FBUztnQkFBRSxPQUFNO1lBRTlDLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDakMsTUFBTSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ25CLElBQUksQ0FBQztvQkFDRCx5RkFBeUY7b0JBRXpGLCtDQUErQztvQkFDL0MsTUFBTSxRQUFRLEdBQVcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUNsRixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUV2RSx3RUFBd0U7b0JBQ3hFLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO29CQUN6RSxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDekQsQ0FBQzt3QkFBUyxDQUFDO29CQUNQLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbkIsQ0FBQztZQUNMLENBQUM7WUFFRCxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxDQUFDLGVBQWUsNEJBQTRCLENBQUMsQ0FBQztRQUMvRSxDQUFDO0tBQUE7SUFFSyxZQUFZOztZQUNkLElBQUksSUFBSSxDQUFDLGVBQWUsS0FBSyxTQUFTO2dCQUFFLE9BQU87WUFDL0MsTUFBTSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDO2dCQUNELElBQUksTUFBTSxHQUFXLGdCQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUNyRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDN0MsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLGFBQWEsRUFBRSxnQkFBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzFGLENBQUM7b0JBQVMsQ0FBQztnQkFDUCxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkIsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUFBLENBQUM7SUFFSSxxQkFBcUI7O1lBRXZCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUTtnQkFDZCxJQUFJLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUM7WUFFbkUsTUFBTSxpQkFBaUIsR0FBRyxHQUFTLEVBQUU7Z0JBQ2pDLE1BQU0sS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNuQixJQUFJLENBQUM7b0JBQ0QsSUFBSSxJQUFJLENBQUMsZUFBZSxLQUFLLFNBQVMsRUFBRSxDQUFDLENBQUMsK0JBQStCO3dCQUNyRSxrR0FBa0c7d0JBQ2xHLElBQUksVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO3dCQUN6RixJQUFJLFVBQVUsRUFBRSxDQUFDOzRCQUNiLEtBQUssSUFBSSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7Z0NBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDOzRCQUM1QyxDQUFDO3dCQUNMLENBQUM7d0JBQ0QsSUFBSSxXQUFXLEdBQUcsVUFBVyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO3dCQUMzRCxJQUFJLElBQUksQ0FBQyxPQUFPOzRCQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO3dCQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzRSxDQUFDO3lCQUFNLENBQUM7d0JBQ0osT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLGVBQWUsK0NBQStDLENBQUMsQ0FBQztvQkFDekcsQ0FBQztnQkFDTCxDQUFDO3dCQUFTLENBQUM7b0JBQ1AsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNuQixDQUFDO1lBQ0wsQ0FBQyxFQUFDO1lBRUYsd0RBQXdEO1lBQ3hELE1BQU0saUJBQWlCLEVBQUUsQ0FBQztRQUM5QixDQUFDO0tBQUE7SUFFSyxxQkFBcUI7O1lBQ3ZCLElBQUksUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3pDLE1BQU0sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFELE1BQU0sS0FBSyxDQUFDLElBQUksRUFBRTtZQUNsQixJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVE7WUFDL0IsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUUsdUNBQXVDO1FBQzNFLENBQUM7S0FBQTtDQUNKO0FBRUQsQ0FBQyxHQUFTLEVBQUU7SUFDSixNQUFNLE9BQU8sR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO0lBQ3BDLE9BQU8sQ0FBQyxlQUFlLEdBQUcsTUFBTSxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDdkQsT0FBTyxDQUFDLHFCQUFxQixFQUFFO0lBQy9CLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDUCxNQUFNLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtJQUN6QyxDQUFDO0FBQ0wsQ0FBQyxFQUNKLEVBQUUsQ0FBQztBQUdKLENBQUMsR0FBUyxFQUFFO0lBQ1IsTUFBTSxHQUFHLEdBQUcsSUFBSSxXQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFFLDRDQUE0QztJQUNuRixHQUFHLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQWEsRUFBRSxFQUFFO1FBQ25DLE1BQU0sUUFBUSxHQUFHLEVBQUUsYUFBYSxDQUFDO1FBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM3QyxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFbEMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQ2xCLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNoRCxPQUFPLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDekMsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLFFBQVEsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pFLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgscURBQXFEO0lBQ3JELGdCQUFLLENBQUMsaUJBQWlCLENBQUM7UUFDcEIsZUFBTSxFQUFFLDZCQUFhLEVBQUUsaUNBQWlCLEVBQUUsaUNBQXFCLEVBQUUseUJBQWEsRUFBRSxpQ0FBcUI7S0FDeEcsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxFQUFDLEVBQUUsQ0FBQztBQUVMLFdBQVcsQ0FBQyxHQUFTLEVBQUU7SUFDbkIsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO0lBQzVGLE1BQU0sS0FBSyxDQUFDLElBQUksRUFBRTtJQUNsQixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7SUFFekMsTUFBTSxXQUFXLEdBQUc7UUFDaEIsR0FBRyxFQUFFLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQywwRUFBMEU7UUFDbkgsU0FBUyxFQUFFLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxzQ0FBc0M7UUFDM0YsUUFBUSxFQUFFLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyw2Q0FBNkM7UUFDaEcsUUFBUSxFQUFFLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0I7S0FDOUUsQ0FBQztJQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekIsS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUNsQixDQUFDLEdBQUUsS0FBSyxDQUFDOzs7Ozs7Ozs7OztBQy9LSTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCx3QkFBd0I7QUFDeEIseUJBQXlCLG1CQUFPLENBQUMsc0NBQWdCO0FBQ2pELG1CQUFtQixtQkFBTyxDQUFDLDJEQUFVO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RBQXNELGFBQWE7QUFDbkU7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLHFCQUFxQjtBQUNyQyxnQkFBZ0IsbUJBQW1CO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUM7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QyxZQUFZO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLG1CQUFtQjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRUFBa0UsY0FBYztBQUNoRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRCxZQUFZO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QjtBQUN4Qjs7Ozs7Ozs7OztBQ3RGYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxxQkFBcUI7QUFDckIseUJBQXlCLG1CQUFPLENBQUMsc0NBQWdCO0FBQ2pELG1CQUFtQixtQkFBTyxDQUFDLDJEQUFVO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EseUNBQXlDO0FBQ3pDO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0Isb0JBQW9CO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseURBQXlELGFBQWE7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QyxVQUFVO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrREFBa0Qsa0JBQWtCO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSx5Q0FBeUM7QUFDekM7QUFDQSxhQUFhO0FBQ2I7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsVUFBVTtBQUN4RDtBQUNBO0FBQ0E7QUFDQSx1QkFBdUI7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjs7Ozs7Ozs7OztBQ3hHYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxvQ0FBb0M7QUFDbkQ7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxhQUFhLG1CQUFPLENBQUMsNEZBQWlCO0FBQ3RDLGFBQWEsbUJBQU8sQ0FBQyxrR0FBb0I7QUFDekM7Ozs7Ozs7Ozs7QUNsQkE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0FzQztBQUNNO0FBSXBCOztBQUV4QixPQUFPLDBDQUEwQyxFQUFFLHVEQUFhOztBQUVoRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsMENBQTBDO0FBQzFDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBLGdEQUFnRCxvREFBVTtBQUMxRDtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsZUFBZTtBQUMxRDtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxlQUFlO0FBQ3pEO0FBQ0EsRUFBRTtBQUNGOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVUsb0RBQVU7QUFDcEI7O0FBRUE7QUFDQSxVQUFVLG9EQUFVLGVBQWUsb0RBQVU7QUFDN0M7O0FBRUEsU0FBUyxvREFBVSxZQUFZLG9EQUFVO0FBQ3pDOztBQUVBO0FBQ0EsNkNBQTZDLG9EQUFVO0FBQ3ZEOztBQUVBLFFBQVEsb0RBQVU7QUFDbEI7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVSxPQUFPO0FBQ2pCO0FBQ0Esa0dBQWtHLG9EQUFVO0FBQzVHO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVSxPQUFPO0FBQ2pCO0FBQ0Esb0dBQW9HLG9EQUFVO0FBQzlHO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQSw4Q0FBOEM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNILEVBQUU7QUFDRixDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLFFBQVEsbUJBQW1CO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLCtEQUFnQjs7QUFFNUI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLDZFQUE4QjtBQUN6Qzs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ08saUNBQWlDLDJDQUEyQzs7QUFhNUM7O0FBS3JDOztBQUVGLGlFQUFlLEtBQUssRUFBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ2hPckI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaENBOztBQUVBLHFEQUFxRCxjQUFjOztBQUVuRSxzREFBc0QsYUFBYSxFQUFFLEVBQUUsS0FBSzs7QUFFNUUsb0VBQW9FLGFBQWEsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSzs7QUFFMUc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGOztBQUVPO0FBQ0E7QUFDQTtBQUNBOztBQUVQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLFNBQVM7QUFDN0IscUJBQXFCLFNBQVM7QUFDOUI7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBRTs7QUFFRjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsNkJBQTZCLEVBQUUsU0FBUyxFQUFFO0FBQzFDO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxJQUFJO0FBQ0o7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxFQUFFOztBQUVGO0FBQ0E7O0FBRUE7O0FBRUEsaUVBQWUsVUFBVSxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDOU5TO0FBQ1Y7QUFDRTs7QUFFM0I7QUFDQTtBQUNBLHVFQUF1RSw4Q0FBWTtBQUNuRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU8sS0FBSyxFQUFFLHlDQUFPOztBQUVyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQ0FBcUMsZ0NBQWdDLElBQUk7QUFDekU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSyxrREFBZ0I7QUFDckI7QUFDQTtBQUNBLG9CQUFvQiw0Q0FBVTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLGlDQUFpQyxHQUFHO0FBQ3BDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFTyxpREFBaUQ7QUFDeEQ7QUFDQTtBQUNBO0FBQ0EsRUFBRTs7QUFFRjtBQUNBOztBQUVBO0FBQ0EsOEJBQThCLE9BQU8sNENBQVUsSUFBSTtBQUNuRCw4QkFBOEIsT0FBTyw0Q0FBVSxJQUFJO0FBQ25EOztBQUVBLGlFQUFlLGFBQWEsRUFBQzs7Ozs7OztVQ3JMN0I7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1VFTkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9zZXJkZS10cy9kaXN0L1NlckRlLmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL3NlcmRlLXRzL2Rpc3QvaW5kZXguanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9zcmMvTWF0cml4L3NyYy9GcmFtZUdyb3VwLnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL01hdHJpeC9zcmMvTWF0cml4LnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL01hdHJpeC9zcmMvTWF0cml4RWxlbWVudC50cyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L3NyYy9NYXRyaXgvc3JjL01vZGlmaWVycy50cyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L3NyYy9zZXJ2ZXIvc3JjL1BvaW50VHJhY2tlci50cyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L3NyYy9zZXJ2ZXIvc3JjL211dGV4LnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL3NlcnZlci9zcmMvc2VydmVyMi50cyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy93b3JrZXItdGhyZWFkcy1tYW5hZ2VyL2Rpc3Qvc3JjL1dvcmtlckNvbnRyb2xsZXIuanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvd29ya2VyLXRocmVhZHMtbWFuYWdlci9kaXN0L3NyYy9Xb3JrZXJNYW5hZ2VyLmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL3dvcmtlci10aHJlYWRzLW1hbmFnZXIvZGlzdC9zcmMvaW5kZXguanMiLCJmaWxlOi8vL2V4dGVybmFsIGNvbW1vbmpzIFwid3NcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcIm5vZGU6b3NcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcIm5vZGU6cHJvY2Vzc1wiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwibm9kZTp0dHlcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcInBhdGhcIiIsImZpbGU6Ly8vZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcIndvcmtlcl90aHJlYWRzXCIiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvY2hhbGsvc291cmNlL2luZGV4LmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL2NoYWxrL3NvdXJjZS91dGlsaXRpZXMuanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvY2hhbGsvc291cmNlL3ZlbmRvci9hbnNpLXN0eWxlcy9pbmRleC5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9jaGFsay9zb3VyY2UvdmVuZG9yL3N1cHBvcnRzLWNvbG9yL2luZGV4LmpzIiwiZmlsZTovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsImZpbGU6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwiZmlsZTovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwiZmlsZTovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0IiwiZmlsZTovLy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwiZmlsZTovLy93ZWJwYWNrL3N0YXJ0dXAiLCJmaWxlOi8vL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuU2VyRGUgPSB2b2lkIDA7XG4vLyBGdW5jdGlvbiB0byBjaGVjayBpZiBhIGdpdmVuIGZ1bmN0aW9uIGlzIGEgY2xhc3MgY29uc3RydWN0b3JcbmZ1bmN0aW9uIGlzQ2xhc3MoZnVuYykge1xuICAgIHJldHVybiB0eXBlb2YgZnVuYyA9PT0gJ2Z1bmN0aW9uJyAmJiAvXlxccypjbGFzc1xccysvLnRlc3QoZnVuYy50b1N0cmluZygpKTtcbn1cbmNsYXNzIFNlckRlIHtcbiAgICAvLyBNZXRob2QgdG8gaGFuZGxlIHNpbXBsZSB0eXBlcyBkaXJlY3RseVxuICAgIHN0YXRpYyBmcm9tU2ltcGxlKG9iaikge1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRGF0ZSB8fCB0eXBlb2Ygb2JqID09PSAnc3RyaW5nJyB8fCB0eXBlb2Ygb2JqID09PSAnbnVtYmVyJyB8fCB0eXBlb2Ygb2JqID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLy8gTWV0aG9kIHRvIHNldCBleGNsdXNpdmUgY2xhc3NlcyBmb3Igc2VyaWFsaXphdGlvblxuICAgIHN0YXRpYyBzZXRFeGNsdXNpdmVseShsaXN0KSB7XG4gICAgICAgIFNlckRlLm9ubHkgPSBuZXcgU2V0KFsuLi5saXN0LCBBcnJheSwgTWFwLCBTZXRdKTtcbiAgICB9XG4gICAgLy8gTWFpbiBzZXJpYWxpemF0aW9uIG1ldGhvZFxuICAgIHN0YXRpYyBzZXJpYWxpc2Uob2JqLCB2aXNpdGVkID0gbmV3IE1hcCgpLCBfbWFwID0gbmV3IE1hcCgpLCBkZXB0aCA9IDAsIHBhcmVudCkge1xuICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2QsIF9lO1xuICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcgfHwgb2JqID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgLy8gSWYgdGhlIG9iamVjdCBpcyBhIGNsYXNzIGFuZCBpcyBub3QgaW4gdGhlIGV4Y2x1c2l2ZSBsaXN0LCBza2lwIHNlcmlhbGl6YXRpb25cbiAgICAgICAgaWYgKCgoX2EgPSBTZXJEZS5vbmx5KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Euc2l6ZSkgJiYgaXNDbGFzcyhvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmouY29uc3RydWN0b3IpICYmICFTZXJEZS5vbmx5LmhhcyhvYmouY29uc3RydWN0b3IpKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIERhdGUpXG4gICAgICAgICAgICByZXR1cm4geyB0OiAnRGF0ZScsIHY6IG9iai52YWx1ZU9mKCkgfTtcbiAgICAgICAgbGV0IG1heWJlU2ltcGxlID0gU2VyRGUuZnJvbVNpbXBsZShvYmopO1xuICAgICAgICBpZiAobWF5YmVTaW1wbGUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHJldHVybiBtYXliZVNpbXBsZTtcbiAgICAgICAgaWYgKHZpc2l0ZWQuaGFzKG9iaikpIHtcbiAgICAgICAgICAgIHZpc2l0ZWQuZ2V0KG9iaikudGltZXMrKztcbiAgICAgICAgICAgIHJldHVybiB7IHQ6IChfYiA9IG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9iai5jb25zdHJ1Y3RvcikgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLm5hbWUsIHY6IHsgX21hcElkOiBTZXJEZS53ZWFrTWFwLmdldChvYmopIH0gfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRnVuY3Rpb24pXG4gICAgICAgICAgICByZXR1cm4geyB0OiAnZnVuY3Rpb24nLCB2OiBvYmoubmFtZSB9O1xuICAgICAgICBpZiAocGFyZW50KVxuICAgICAgICAgICAgdmlzaXRlZC5zZXQob2JqLCB7IHRpbWVzOiAxLCBwYXJlbnQgfSk7XG4gICAgICAgIGxldCBpZCA9IChfYyA9IFNlckRlLndlYWtNYXAuZ2V0KG9iaikpICE9PSBudWxsICYmIF9jICE9PSB2b2lkIDAgPyBfYyA6IFNlckRlLmlkKys7XG4gICAgICAgIFNlckRlLndlYWtNYXAuc2V0KG9iaiwgaWQpO1xuICAgICAgICAvLyBIYW5kbGUgTWFwIG9iamVjdHNcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgbGV0IHNlcmlhbGlzZWQgPSBuZXcgQXJyYXkob2JqLnNpemUpO1xuICAgICAgICAgICAgX21hcC5zZXQoaWQsIHNlcmlhbGlzZWQpO1xuICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgb2JqLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICBzZXJpYWxpc2VkW2ldID0gW1xuICAgICAgICAgICAgICAgICAgICBTZXJEZS5zZXJpYWxpc2Uoa2V5LCB2aXNpdGVkLCBfbWFwLCBkZXB0aCArIDEsIHsgb2JqOiBzZXJpYWxpc2VkLCBrZXk6IFtpLCAwXSB9KSxcbiAgICAgICAgICAgICAgICAgICAgU2VyRGUuc2VyaWFsaXNlKHZhbHVlLCB2aXNpdGVkLCBfbWFwLCBkZXB0aCArIDEsIHsgb2JqOiBzZXJpYWxpc2VkLCBrZXk6IFtpLCAxXSB9KSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgdDogb2JqLmNvbnN0cnVjdG9yLm5hbWUsIHY6IHNlcmlhbGlzZWQgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBIYW5kbGUgU2V0IGFuZCBBcnJheSBvYmplY3RzXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBTZXQgfHwgb2JqIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGxldCBzZXJpYWxpc2VkID0gQXJyYXkob2JqIGluc3RhbmNlb2YgU2V0ID8gb2JqLnNpemUgOiBvYmoubGVuZ3RoKTtcbiAgICAgICAgICAgIF9tYXAuc2V0KGlkLCBzZXJpYWxpc2VkKTtcbiAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgIG9iai5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHNlcmlhbGlzZWRbaV0gPSBTZXJEZS5zZXJpYWxpc2UodmFsdWUsIHZpc2l0ZWQsIF9tYXAsIGRlcHRoICsgMSwgeyBvYmo6IHNlcmlhbGlzZWQsIGtleTogaSB9KTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB7IHQ6IG9iai5jb25zdHJ1Y3Rvci5uYW1lLCB2OiBzZXJpYWxpc2VkIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gSGFuZGxlIGdlbmVyaWMgb2JqZWN0c1xuICAgICAgICBsZXQgc2VyaWFsaXNlZCA9IHt9O1xuICAgICAgICBfbWFwLnNldChpZCwgc2VyaWFsaXNlZCk7XG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgICAgICAgICBzZXJpYWxpc2VkW2tleV0gPSBTZXJEZS5zZXJpYWxpc2UodmFsdWUsIHZpc2l0ZWQsIF9tYXAsIGRlcHRoICsgMSwgeyBvYmo6IHNlcmlhbGlzZWQsIGtleSB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB3ZSBhcmUgYXQgdGhlIHRvcCBsZXZlbCwgaGFuZGxlIGNpcmN1bGFyIHJlZmVyZW5jZXMgYW5kIG11bHRpcGxlIGluc3RhbmNlc1xuICAgICAgICBpZiAoZGVwdGggPT09IDApIHtcbiAgICAgICAgICAgIGxldCByZWN1cnNpb25WaXNpdGVkID0gQXJyYXkuZnJvbSh2aXNpdGVkKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKFtfLCB2YWxdKSA9PiB2YWwudGltZXMgPiAxKVxuICAgICAgICAgICAgICAgIC5tYXAoKFtvYmosIHZhbF0pID0+IFtTZXJEZS53ZWFrTWFwLmdldChvYmopLCB2YWxdKTsgLy8gRXhwbGljaXRseSBjYXN0IGlkIHRvIG51bWJlclxuICAgICAgICAgICAgcmVjdXJzaW9uVmlzaXRlZC5mb3JFYWNoKChbaWQsIHZhbF0pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodmFsLnBhcmVudC5rZXkgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5wYXJlbnQub2JqW3ZhbC5wYXJlbnQua2V5WzBdXVt2YWwucGFyZW50LmtleVsxXV0udiA9IHsgX21hcElkOiBpZCB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgICAgICB2YWwucGFyZW50Lm9ialt2YWwucGFyZW50LmtleV0udiA9IHsgX21hcElkOiBpZCB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQXR0YWNoIHRoZSBfbWFwIGZvciBzZXJpYWxpemF0aW9uIHJlc3VsdFxuICAgICAgICAgICAgcmV0dXJuIHsgdDogKF9kID0gb2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLmNvbnN0cnVjdG9yKSA9PT0gbnVsbCB8fCBfZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2QubmFtZSwgdjogc2VyaWFsaXNlZCwgX21hcDogcmVjdXJzaW9uVmlzaXRlZC5tYXAoKHgpID0+IFt4WzBdLCBfbWFwLmdldCh4WzBdKV0pIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgdDogKF9lID0gb2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLmNvbnN0cnVjdG9yKSA9PT0gbnVsbCB8fCBfZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2UubmFtZSwgdjogc2VyaWFsaXNlZCB9O1xuICAgIH1cbiAgICAvLyBNYWluIGRlc2VyaWFsaXphdGlvbiBtZXRob2RcbiAgICBzdGF0aWMgZGVzZXJpYWxpemUob2JqKSB7XG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2UsIF9mLCBfZywgX2gsIF9qLCBfaywgX2w7XG4gICAgICAgIGlmIChvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICBpZiAoKG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9iai50KSA9PT0gJ0RhdGUnKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG9iai52KTtcbiAgICAgICAgLy8gSWYgb2JqIGlzIGEgcHJpbWl0aXZlLCByZXR1cm4gaXQgZGlyZWN0bHkgKHdpdGggRGF0ZSBoYW5kbGluZylcbiAgICAgICAgaWYgKFNlckRlLmlzUHJpbWl0aXZlKG9iaikpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBEYXRlID8gbmV3IERhdGUob2JqKSA6IG9iajtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2JqLnQgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICByZXR1cm4gKF9hID0gU2VyRGUuY2xhc3NSZWdpc3RyeS5nZXQob2JqLnYpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiB7fTtcbiAgICAgICAgLy8gSGFuZGxlcyB0aGUgcmVzdG9yYXRpb24gb2YgX21hcCBmb3Igb2JqZWN0IHJlZmVyZW5jZXMgaWYgaXQgZXhpc3RzXG4gICAgICAgIGlmIChvYmouX21hcCkge1xuICAgICAgICAgICAgU2VyRGUuX21hcCA9IG5ldyBNYXAob2JqLl9tYXApO1xuICAgICAgICAgICAgU2VyRGUuX3RlbXBNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmV0cmlldmUgdGhlIGNsYXNzIGNvbnN0cnVjdG9yIGlmIGF2YWlsYWJsZVxuICAgICAgICBjb25zdCBjbGFzc0NvbnN0cnVjdG9yID0gU2VyRGUuY2xhc3NSZWdpc3RyeS5nZXQob2JqLnQpO1xuICAgICAgICBsZXQgaW5zdGFuY2U7XG4gICAgICAgIGlmICgoKF9iID0gb2JqLnYpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5fbWFwSWQpICYmICgoX2MgPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLmhhcyhvYmoudi5fbWFwSWQpKSkge1xuICAgICAgICAgICAgcmV0dXJuIChfZCA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2QuZ2V0KG9iai52Ll9tYXBJZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpbnN0YW5jZSA9IGNsYXNzQ29uc3RydWN0b3IgPyBPYmplY3QuY3JlYXRlKGNsYXNzQ29uc3RydWN0b3IucHJvdG90eXBlKSA6IHt9O1xuICAgICAgICAgICAgKF9lID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZS5zZXQob2JqLnYuX21hcElkLCBpbnN0YW5jZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG5lc3RlZCA9IChfaCA9IChfZiA9IFNlckRlLl9tYXApID09PSBudWxsIHx8IF9mID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZi5nZXQoKF9nID0gb2JqLnYpID09PSBudWxsIHx8IF9nID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZy5fbWFwSWQpKSAhPT0gbnVsbCAmJiBfaCAhPT0gdm9pZCAwID8gX2ggOiBvYmoudjtcbiAgICAgICAgLy8gRGVzZXJpYWxpemUgYmFzZWQgb24gdGhlIHR5cGUgb2Ygb2JqZWN0XG4gICAgICAgIHN3aXRjaCAob2JqLnQpIHtcbiAgICAgICAgICAgIGNhc2UgJ0FycmF5JzogLy8gSGFuZGxlIGFycmF5c1xuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmVzdGVkLm1hcCgoaXRlbSkgPT4gU2VyRGUuZGVzZXJpYWxpemUoaXRlbSkpO1xuICAgICAgICAgICAgICAgIChfaiA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2ouc2V0KG9iai52Ll9tYXBJZCwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgICAgIGNhc2UgJ01hcCc6IC8vIEhhbmRsZSBtYXBzXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgTWFwKG5lc3RlZC5tYXAoKFtrZXksIHZhbHVlXSkgPT4gW1NlckRlLmRlc2VyaWFsaXplKGtleSksIFNlckRlLmRlc2VyaWFsaXplKHZhbHVlKV0pKTtcbiAgICAgICAgICAgICAgICAoX2sgPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2sgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9rLnNldChvYmoudi5fbWFwSWQsIGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgICAgICBjYXNlICdTZXQnOiAvLyBIYW5kbGUgc2V0c1xuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IFNldChuZXN0ZWQubWFwKChpdGVtKSA9PiBTZXJEZS5kZXNlcmlhbGl6ZShpdGVtKSkpO1xuICAgICAgICAgICAgICAgIChfbCA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2wuc2V0KG9iai52Ll9tYXBJZCwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6IC8vIEhhbmRsZSBvYmplY3RzXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMobmVzdGVkKSkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtrZXldID0gU2VyRGUuZGVzZXJpYWxpemUodmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2xhc3NDb25zdHJ1Y3RvciAmJiBTZXJEZS5pbml0RnVuY05hbWUgJiYgdHlwZW9mIGluc3RhbmNlW1NlckRlLmluaXRGdW5jTmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VbU2VyRGUuaW5pdEZ1bmNOYW1lXSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBDbGVhciB0aGUgX21hcCBhZnRlciBkZXNlcmlhbGl6YXRpb24gaXMgY29tcGxldGUgdG8gZnJlZSBtZW1vcnlcbiAgICAgICAgaWYgKG9iai5fbWFwKSB7XG4gICAgICAgICAgICBTZXJEZS5fbWFwID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgU2VyRGUuX3RlbXBNYXAgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlOyAvLyBSZXR1cm4gdGhlIGRlc2VyaWFsaXplZCBpbnN0YW5jZVxuICAgIH1cbiAgICAvLyBNZXRob2QgdG8gcmVnaXN0ZXIgY2xhc3NlcyBmb3IgZGVzZXJpYWxpemF0aW9uXG4gICAgc3RhdGljIGNsYXNzUmVnaXN0cmF0aW9uKGNsYXNzZXMpIHtcbiAgICAgICAgY2xhc3Nlcy5mb3JFYWNoKCh4KSA9PiBTZXJEZS5jbGFzc1JlZ2lzdHJ5LnNldCh4Lm5hbWUsIHgpKTtcbiAgICB9XG4gICAgLy8gSGVscGVyIG1ldGhvZCB0byBjaGVjayBpZiBhIHZhbHVlIGlzIHByaW1pdGl2ZVxuICAgIHN0YXRpYyBpc1ByaW1pdGl2ZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gKHZhbHVlID09PSBudWxsIHx8XG4gICAgICAgICAgICBbJ251bWJlcicsICdzdHJpbmcnLCAnYm9vbGVhbicsICd1bmRlZmluZWQnLCAnc3ltYm9sJywgJ2JpZ2ludCddLmluY2x1ZGVzKHR5cGVvZiB2YWx1ZSkgfHxcbiAgICAgICAgICAgIHZhbHVlIGluc3RhbmNlb2YgRGF0ZSk7XG4gICAgfVxufVxuZXhwb3J0cy5TZXJEZSA9IFNlckRlO1xuU2VyRGUuaW5pdEZ1bmNOYW1lID0gJ19pbml0Rm4nOyAvLyBOYW1lIG9mIHRoZSBpbml0aWFsaXphdGlvbiBmdW5jdGlvbiAoaWYgZXhpc3RzKVxuU2VyRGUuaWQgPSAwOyAvLyBVbmlxdWUgSUQgY291bnRlciBmb3Igb2JqZWN0c1xuU2VyRGUud2Vha01hcCA9IG5ldyBXZWFrTWFwKCk7IC8vIFdlYWtNYXAgdG8gdHJhY2sgb2JqZWN0cyBkdXJpbmcgc2VyaWFsaXphdGlvblxuU2VyRGUuY2xhc3NSZWdpc3RyeSA9IG5ldyBNYXAoW1xuICAgIFsnQXJyYXknLCBBcnJheV0sXG4gICAgWydTZXQnLCBTZXRdLFxuICAgIFsnTWFwJywgTWFwXSxcbl0pOyAvLyBSZWdpc3RyeSBvZiBjbGFzc2VzIGZvciBkZXNlcmlhbGl6YXRpb25cbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX2V4cG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9fZXhwb3J0U3RhcikgfHwgZnVuY3Rpb24obSwgZXhwb3J0cykge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZXhwb3J0cywgcCkpIF9fY3JlYXRlQmluZGluZyhleHBvcnRzLCBtLCBwKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vLyBzcmMvaW5kZXgudHNcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9TZXJEZVwiKSwgZXhwb3J0cyk7XG4iLCJleHBvcnQgY2xhc3MgRnJhbWVHcm91cCB7XG4gICAgc3RhcnRUaW1lOiBudW1iZXI7XG4gICAgZnJhbWVJbnRlcnZhbDogbnVtYmVyO1xuICAgIGZyYW1lQ291bnQ6IG51bWJlcjtcbiAgICBmcmFtZXNQZXJTZWNvbmQ6IG51bWJlcjtcbiAgICBmcmFtZVBvc2l0aW9uczogbnVtYmVyW107XG4gICAgdG90YWxIZWlnaHQ6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3Ioc3RhcnRUaW1lOiBudW1iZXIsIGZyYW1lSW50ZXJ2YWw6IG51bWJlciwgZnJhbWVDb3VudDogbnVtYmVyLCBmcmFtZXNQZXJTZWNvbmQ6IG51bWJlciwgZnJhbWVQb3NpdGlvbnM6IG51bWJlcltdLCB0b3RhbEhlaWdodDogbnVtYmVyLCB3aWR0aDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gc3RhcnRUaW1lO1xuICAgICAgICB0aGlzLmZyYW1lSW50ZXJ2YWwgPSBmcmFtZUludGVydmFsO1xuICAgICAgICB0aGlzLmZyYW1lQ291bnQgPSBmcmFtZUNvdW50O1xuICAgICAgICB0aGlzLmZyYW1lc1BlclNlY29uZCA9IGZyYW1lc1BlclNlY29uZDtcbiAgICAgICAgdGhpcy5mcmFtZVBvc2l0aW9ucyA9IGZyYW1lUG9zaXRpb25zO1xuICAgICAgICB0aGlzLnRvdGFsSGVpZ2h0ID0gdG90YWxIZWlnaHQ7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB9XG59XG4iLCJpbXBvcnQge01hdHJpeEVsZW1lbnR9IGZyb20gXCIuL01hdHJpeEVsZW1lbnRcIjtcbmltcG9ydCB7RnJhbWVHcm91cH0gZnJvbSBcIi4vRnJhbWVHcm91cFwiO1xuXG5leHBvcnQgY2xhc3MgTWF0cml4IHtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIGZyYW1lc1BlclNlY29uZDogbnVtYmVyO1xuICAgIGZyYW1lc1Blckdyb3VwOiBudW1iZXI7XG4gICAgc3RhcnRUaW1lOiBudW1iZXI7XG4gICAgbGFzdEVuZFRpbWU6IG51bWJlcjtcbiAgICBwcml2YXRlIGVsZW1lbnRJZENvdW50ZXI6IG51bWJlciA9IDA7XG4gICAgcHVibGljIGVsZW1lbnRzOiBNYXRyaXhFbGVtZW50W10gPSBbXTtcblxuXG4gICAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGZyYW1lc1BlclNlY29uZDogbnVtYmVyLCBmcmFtZXNQZXJHcm91cDogbnVtYmVyLCBzdGFydFRpbWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLmZyYW1lc1BlclNlY29uZCA9IGZyYW1lc1BlclNlY29uZDtcbiAgICAgICAgdGhpcy5mcmFtZXNQZXJHcm91cCA9IGZyYW1lc1Blckdyb3VwO1xuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IHN0YXJ0VGltZTtcbiAgICAgICAgdGhpcy5sYXN0RW5kVGltZSA9IHN0YXJ0VGltZTtcbiAgICB9XG5cbiAgICBnZW5lcmF0ZUVsZW1lbnRJZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYGVsZW1lbnQtJHt0aGlzLmVsZW1lbnRJZENvdW50ZXIrK31gO1xuICAgIH1cblxuICAgIHNldFN0YXJ0VGltZShuZXdTdGFydFRpbWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IG5ld1N0YXJ0VGltZTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5zdGFydFRpbWUpXG4gICAgICAgIHRoaXMubGFzdEVuZFRpbWUgPSBuZXdTdGFydFRpbWU7XG4gICAgfVxuXG4gICAgZ2VuZXJhdGVOZXh0R3JvdXAoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgbWF0cml4RWxlbWVudHM6IE1hdHJpeEVsZW1lbnRbXSk6IEZyYW1lR3JvdXAge1xuICAgICAgICBjb25zdCBleGlzdGluZ0ZyYW1lcyA9IEFycmF5LmZyb20oY29udGFpbmVyLmNoaWxkcmVuKSBhcyBIVE1MRWxlbWVudFtdO1xuICAgICAgICBjb25zdCBmcmFtZUludGVydmFsID0gMTAwMCAvIHRoaXMuZnJhbWVzUGVyU2Vjb25kO1xuICAgICAgICBjb25zdCBmcmFtZUNvdW50ID0gdGhpcy5mcmFtZXNQZXJHcm91cDtcblxuICAgICAgICAvLyDQndCw0YfQsNC70L4g0L3QvtCy0L7QuSDQs9GA0YPQv9C/0YtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gdGhpcy5sYXN0RW5kVGltZTtcbiAgICAgICAgY29uc3QgZnJhbWVQb3NpdGlvbnMgPSBBcnJheS5mcm9tKHtsZW5ndGg6IGZyYW1lQ291bnR9LCAoXywgaSkgPT4gc3RhcnRUaW1lICsgaSAqIGZyYW1lSW50ZXJ2YWwpO1xuICAgICAgICB0aGlzLmxhc3RFbmRUaW1lID0gc3RhcnRUaW1lICsgZnJhbWVJbnRlcnZhbCAqIGZyYW1lQ291bnQ7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmFtZUNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGxldCBmcmFtZTogSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIGlmIChpIDwgZXhpc3RpbmdGcmFtZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8g0JjRgdC/0L7Qu9GM0LfRg9C10Lwg0YHRg9GJ0LXRgdGC0LLRg9GO0YnQuNC5INGN0LvQtdC80LXQvdGCXG4gICAgICAgICAgICAgICAgZnJhbWUgPSBleGlzdGluZ0ZyYW1lc1tpXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g0KHQvtC30LTQsNC10Lwg0L3QvtCy0YvQuSDRjdC70LXQvNC10L3Rgiwg0LXRgdC70Lgg0LXQs9C+INC10YnQtSDQvdC10YJcbiAgICAgICAgICAgICAgICBmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIGZyYW1lLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICAgICAgICBmcmFtZS5zdHlsZS53aWR0aCA9IGAke3RoaXMud2lkdGh9cHhgO1xuICAgICAgICAgICAgICAgIGZyYW1lLnN0eWxlLmhlaWdodCA9IGAke3RoaXMuaGVpZ2h0fXB4YDtcbiAgICAgICAgICAgICAgICBmcmFtZS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmcmFtZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZyYW1lLnN0eWxlLnRvcCA9IGAke2kgKiB0aGlzLmhlaWdodH1weGA7XG5cbiAgICAgICAgICAgIC8vINCe0YfQuNGJ0LDQtdC8INGB0L7QtNC10YDQttC40LzQvtC1INGE0YDQtdC50LzQsCDQv9C10YDQtdC0INC00L7QsdCw0LLQu9C10L3QuNC10Lwg0L3QvtCy0YvRhSDRjdC70LXQvNC10L3RgtC+0LJcbiAgICAgICAgICAgIGZyYW1lLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgICAgICBtYXRyaXhFbGVtZW50cy5zb3J0KChhLCBiKSA9PiBiLmxheWVyIC0gYS5sYXllcilcbiAgICAgICAgICAgIC8vINCf0YDQuNC80LXQvdGP0LXQvCDQvNC+0LTQuNGE0LjQutCw0YLQvtGA0Ysg0Lgg0YDQtdC90LTQtdGA0LjQvCDQutCw0LbQtNGL0Lkg0Y3Qu9C10LzQtdC90YIg0LzQsNGC0YDQuNGG0YtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbWF0cml4RWxlbWVudCBvZiBtYXRyaXhFbGVtZW50cykge1xuICAgICAgICAgICAgICAgIG1hdHJpeEVsZW1lbnQuYXBwbHlNb2RpZmllcnMoZnJhbWVQb3NpdGlvbnNbaV0pO1xuICAgICAgICAgICAgICAgIG1hdHJpeEVsZW1lbnQucmVuZGVyVG8oZnJhbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g0KPQtNCw0LvRj9C10Lwg0LvQuNGI0L3QuNC1INGN0LvQtdC80LXQvdGC0YssINC10YHQu9C4INC+0L3QuCDQtdGB0YLRjFxuICAgICAgICBpZiAoZXhpc3RpbmdGcmFtZXMubGVuZ3RoID4gZnJhbWVDb3VudCkge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IGV4aXN0aW5nRnJhbWVzLmxlbmd0aCAtIDE7IGogPj0gZnJhbWVDb3VudDsgai0tKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGV4aXN0aW5nRnJhbWVzW2pdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRvdGFsSGVpZ2h0ID0gdGhpcy5oZWlnaHQgKiBmcmFtZUNvdW50O1xuICAgICAgICByZXR1cm4gbmV3IEZyYW1lR3JvdXAoc3RhcnRUaW1lLCBmcmFtZUludGVydmFsLCBmcmFtZUNvdW50LCB0aGlzLmZyYW1lc1BlclNlY29uZCwgZnJhbWVQb3NpdGlvbnMsIHRvdGFsSGVpZ2h0LCB0aGlzLndpZHRoKTtcbiAgICB9XG5cbiAgICBhZGRFbGVtZW50KG1hdHJpeEVsZW1lbnQ6IE1hdHJpeEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnRzLmluY2x1ZGVzKG1hdHJpeEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzLnB1c2gobWF0cml4RWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHJlbW92ZUVsZW1lbnQobWF0cml4RWxlbWVudDogTWF0cml4RWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnRzID0gdGhpcy5lbGVtZW50cy5maWx0ZXIoeCA9PiB4ICE9PSBtYXRyaXhFbGVtZW50KVxuICAgIH1cblxuICAgIGNsZWFyRWxlbWVudHMoKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSBbXVxuICAgIH1cbn1cbiIsImltcG9ydCB7IER5bmFtaWNNb2RpZmllciB9IGZyb20gXCIuL01vZGlmaWVyc1wiO1xuaW1wb3J0IHsgTWF0cml4IH0gZnJvbSBcIi4vTWF0cml4XCI7XG5cbmV4cG9ydCBjbGFzcyBNYXRyaXhFbGVtZW50IHtcbiAgICBpZDogc3RyaW5nO1xuICAgIGNvbnRlbnQ6IHN0cmluZyB8IEhUTUxJbWFnZUVsZW1lbnQgfCBTVkdFbGVtZW50O1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICBtb2RpZmllcnM6IER5bmFtaWNNb2RpZmllcltdO1xuICAgIHRleHRXaWR0aDogbnVtYmVyO1xuICAgIHZpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xuICAgIGxheWVyID0gMDtcbiAgICB0ZXh0VXBkYXRlQ2FsbGJhY2s/OiAodGltZXN0YW1wOiBudW1iZXIpID0+IHN0cmluZztcbiAgICB0ZXh0U3R5bGU6IFBhcnRpYWw8Q1NTU3R5bGVEZWNsYXJhdGlvbj47XG4gICAgYWRkaXRpb25hbFN0eWxlczogUGFydGlhbDxDU1NTdHlsZURlY2xhcmF0aW9uPjsgIC8vINCd0L7QstC+0LUg0L/QvtC70LUg0LTQu9GPINC00L7Qv9C+0LvQvdC40YLQtdC70YzQvdGL0YUg0YHRgtC40LvQtdC5XG5cbiAgICBjb25zdHJ1Y3RvcihtYXRyaXg6IE1hdHJpeCwgY29udGVudDogc3RyaW5nIHwgSFRNTEltYWdlRWxlbWVudCB8IFNWR0VsZW1lbnQsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLmlkID0gbWF0cml4LmdlbmVyYXRlRWxlbWVudElkKCk7XG4gICAgICAgIHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMubW9kaWZpZXJzID0gW107XG4gICAgICAgIHRoaXMudGV4dFN0eWxlID0ge307XG4gICAgICAgIHRoaXMuYWRkaXRpb25hbFN0eWxlcyA9IHt9OyAgLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0L3QvtCy0L7Qs9C+INC/0L7Qu9GPXG5cbiAgICAgICAgdGhpcy50ZXh0V2lkdGggPSB0aGlzLmNhbGN1bGF0ZVRleHRXaWR0aCgpO1xuICAgIH1cblxuICAgIC8vINCc0LXRgtC+0LQg0LTQu9GPINCy0YvRh9C40YHQu9C10L3QuNGPINGI0LjRgNC40L3RiyDRgtC10LrRgdGC0LAg0LHQtdC3INC00L7QsdCw0LLQu9C10L3QuNGPINGN0LvQtdC80LXQvdGC0LAg0LIgRE9NXG4gICAgY2FsY3VsYXRlVGV4dFdpZHRoKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHRlbXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGVtcERpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIHRlbXBEaXYuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgICB0ZW1wRGl2LnN0eWxlLndoaXRlU3BhY2UgPSAnbm93cmFwJztcbiAgICAgICAgdGVtcERpdi5zdHlsZS5mb250ID0gdGhpcy50ZXh0U3R5bGUuZm9udCB8fCAnMTZweCBBcmlhbCc7XG4gICAgICAgIHRlbXBEaXYuaW5uZXJUZXh0ID0gdGhpcy5jb250ZW50IGFzIHN0cmluZztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZW1wRGl2KTtcbiAgICAgICAgY29uc3Qgd2lkdGggPSB0ZW1wRGl2LmNsaWVudFdpZHRoO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRlbXBEaXYpO1xuICAgICAgICByZXR1cm4gd2lkdGg7XG4gICAgfVxuXG4gICAgc2V0VGV4dChuZXdUZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5jb250ZW50ID0gbmV3VGV4dDtcbiAgICAgICAgLy8gdGhpcy50ZXh0V2lkdGggPSB0aGlzLmNhbGN1bGF0ZVRleHRXaWR0aCgpO1xuICAgIH1cblxuICAgIHVwZGF0ZVRleHRTdHlsZShuZXdTdHlsZXM6IFBhcnRpYWw8Q1NTU3R5bGVEZWNsYXJhdGlvbj4pIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnRleHRTdHlsZSwgbmV3U3R5bGVzKTtcbiAgICAgICAgdGhpcy50ZXh0V2lkdGggPSB0aGlzLmNhbGN1bGF0ZVRleHRXaWR0aCgpO1xuICAgIH1cblxuICAgIHVwZGF0ZUFkZGl0aW9uYWxTdHlsZXMobmV3U3R5bGVzOiBQYXJ0aWFsPENTU1N0eWxlRGVjbGFyYXRpb24+KSB7ICAvLyDQndC+0LLRi9C5INC80LXRgtC+0LQg0LTQu9GPINC+0LHQvdC+0LLQu9C10L3QuNGPINC00L7Qv9C+0LvQvdC40YLQtdC70YzQvdGL0YUg0YHRgtC40LvQtdC5XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5hZGRpdGlvbmFsU3R5bGVzLCBuZXdTdHlsZXMpO1xuICAgIH1cblxuICAgIHNldFRleHRVcGRhdGVDYWxsYmFjayhjYWxsYmFjazogKHRpbWVzdGFtcDogbnVtYmVyKSA9PiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy50ZXh0VXBkYXRlQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG5cbiAgICBhcHBseU1vZGlmaWVycyh0aW1lc3RhbXA6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy50ZXh0VXBkYXRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1RleHQgPSB0aGlzLnRleHRVcGRhdGVDYWxsYmFjayh0aW1lc3RhbXApO1xuICAgICAgICAgICAgdGhpcy5zZXRUZXh0KG5ld1RleHQpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgbW9kaWZpZXIgb2YgdGhpcy5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIG1vZGlmaWVyLmFwcGx5KHRpbWVzdGFtcCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRNb2RpZmllcihtb2RpZmllcjogRHluYW1pY01vZGlmaWVyKSB7XG4gICAgICAgIHRoaXMubW9kaWZpZXJzLnB1c2gobW9kaWZpZXIpO1xuICAgIH1cblxuICAgIHJlbmRlclRvKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUZXh0V2lkdGgoKVxuICAgICAgICBpZiAoIXRoaXMudmlzaWJsZSkgcmV0dXJuO1xuICAgICAgICAvLyDQmNGJ0LXQvCDRgdGD0YnQtdGB0YLQstGD0Y7RidC40Lkg0Y3Qu9C10LzQtdC90YIg0LIg0LrQvtC90YLQtdC50L3QtdGA0LUg0L/QviBpZFxuICAgICAgICBsZXQgZGl2ID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYCMke3RoaXMuaWR9YCkgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgaWYgKCFkaXYpIHtcbiAgICAgICAgICAgIC8vINCV0YHQu9C4INGN0LvQtdC80LXQvdGCINC90LUg0L3QsNC50LTQtdC9LCDRgdC+0LfQtNCw0LXQvCDQvdC+0LLRi9C5XG4gICAgICAgICAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGRpdi5pZCA9IHRoaXMuaWQ7XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vINCe0LHQvdC+0LLQu9GP0LXQvCDRgdCy0L7QudGB0YLQstCwINGN0LvQtdC80LXQvdGC0LBcbiAgICAgICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSBgJHtNYXRoLmZsb29yKHRoaXMueCArIDAuMDAwMSl9cHhgO1xuICAgICAgICBkaXYuc3R5bGUudG9wID0gYCR7TWF0aC5mbG9vcih0aGlzLnkgKyAwLjAwMDEpfXB4YDtcbiAgICAgICAgZGl2LnN0eWxlLndpZHRoID0gYCR7dGhpcy53aWR0aH1weGA7XG4gICAgICAgIGRpdi5zdHlsZS5oZWlnaHQgPSBgJHt0aGlzLmhlaWdodH1weGA7XG4gICAgICAgIGRpdi5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuXG4gICAgICAgIC8vINCf0YDQuNC80LXQvdGP0LXQvCDQvtGB0L3QvtCy0L3Ri9C1INGB0YLQuNC70Lgg0Lgg0LTQvtC/0L7Qu9C90LjRgtC10LvRjNC90YvQtSDRgdGC0LjQu9C4XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZGl2LnN0eWxlLCB0aGlzLnRleHRTdHlsZSwgdGhpcy5hZGRpdGlvbmFsU3R5bGVzKTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29udGVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGRpdi5pbm5lclRleHQgPSB0aGlzLmNvbnRlbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jb250ZW50IGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCB8fCB0aGlzLmNvbnRlbnQgaW5zdGFuY2VvZiBTVkdFbGVtZW50KSB7XG4gICAgICAgICAgICBkaXYuaW5uZXJIVE1MID0gJyc7IC8vINCe0YfQuNGB0YLQutCwINC/0LXRgNC10LQg0LTQvtCx0LDQstC70LXQvdC40LXQvFxuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKHRoaXMuY29udGVudCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUaW1lTWF0cml4RWxlbWVudCBleHRlbmRzIE1hdHJpeEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKG1hdHJpeDogTWF0cml4LCBjb250ZW50OiBzdHJpbmcgfCBIVE1MSW1hZ2VFbGVtZW50IHwgU1ZHRWxlbWVudCwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKG1hdHJpeCwgY29udGVudCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHRoaXMuX2luaXRGbigpO1xuICAgIH1cblxuICAgIF9pbml0Rm4oKSB7XG4gICAgICAgIHRoaXMuc2V0VGV4dFVwZGF0ZUNhbGxiYWNrKCh0aW1lc3RhbXApID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG4gICAgICAgICAgICByZXR1cm4gbm93LnRvSVNPU3RyaW5nKCkuc3Vic3RyKDExLCAxMik7IC8vINCk0L7RgNC80LDRgiDQstGA0LXQvNC10L3QuCDRgSDQvNC40LvQu9C40YHQtdC60YPQvdC00LDQvNC4IChISDptbTpzcy5zc3MpXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7TWF0cml4RWxlbWVudH0gZnJvbSBcIi4vTWF0cml4RWxlbWVudFwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRHluYW1pY01vZGlmaWVyIHtcbiAgICBwcm90ZWN0ZWQgZWxlbWVudDogTWF0cml4RWxlbWVudDtcbiAgICBmcmFtZXNQZXJTZWNvbmQ6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IE1hdHJpeEVsZW1lbnQsIGZyYW1lc1BlclNlY29uZD86IG51bWJlcikge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLmZyYW1lc1BlclNlY29uZCA9IGZyYW1lc1BlclNlY29uZFxuICAgICAgICBlbGVtZW50LmFkZE1vZGlmaWVyKHRoaXMpXG4gICAgfVxuXG4gICAgYWJzdHJhY3QgYXBwbHkodGltZXN0YW1wOiBudW1iZXIpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgUm90YXRpb25Nb2RpZmllciBleHRlbmRzIER5bmFtaWNNb2RpZmllciB7XG4gICAgYW5nbGU6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IE1hdHJpeEVsZW1lbnQsIGFuZ2xlOiBudW1iZXIpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCk7XG4gICAgICAgIHRoaXMuYW5nbGUgPSBhbmdsZTtcbiAgICB9XG5cbiAgICBhcHBseSh0aW1lc3RhbXA6IG51bWJlcikge1xuICAgICAgICAvLyDQl9C00LXRgdGMINC80L7QttC90L4g0L/RgNC40LzQtdC90LjRgtGMINCy0YDQsNGJ0LXQvdC40LUg0LTQu9GPINGA0LDRgdGH0LXRgtC+0LIsINC10YHQu9C4INGN0YLQviDQuNC80LXQtdGCINGB0LzRi9GB0LtcbiAgICAgICAgY29uc3Qgcm90YXRpb24gPSB0aGlzLmFuZ2xlICogKHRpbWVzdGFtcCAvIDEwMDApO1xuICAgICAgICAvLyDQndCw0L/RgNC40LzQtdGALCDQvNGLINC80L7QttC10Lwg0YHQvtGF0YDQsNC90LjRgtGMINGD0LPQvtC7INCy0YDQsNGJ0LXQvdC40Y8g0LjQu9C4INC00YDRg9Cz0YPRjiDQuNC90YTQvtGA0LzQsNGG0LjRjiDQsiDRjdC70LXQvNC10L3RgtC1XG4gICAgICAgIC8vINCd0L4g0Y3RgtC+INCx0YPQtNC10YIg0YfQuNGB0YLQviDQtNC70Y8g0LvQvtCz0LjQutC4LCDQvdC1INC00LvRjyDQv9GA0Y/QvNC+0LPQviDRgNC10L3QtNC10YDQuNC90LPQsCDQsiBET01cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSYWluYm93RWZmZWN0TW9kaWZpZXIgZXh0ZW5kcyBEeW5hbWljTW9kaWZpZXIge1xuICAgIHBlcmlvZDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogTWF0cml4RWxlbWVudCwgcGVyaW9kOiBudW1iZXIpIHtcbiAgICAgICAgc3VwZXIoZWxlbWVudCk7XG4gICAgICAgIHRoaXMucGVyaW9kID0gcGVyaW9kO1xuICAgIH1cblxuICAgIGFwcGx5KHRpbWVzdGFtcDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHBoYXNlID0gKHRpbWVzdGFtcCAlIHRoaXMucGVyaW9kKSAvIHRoaXMucGVyaW9kO1xuICAgICAgICBjb25zdCBodWUgPSBNYXRoLmZsb29yKHBoYXNlICogMzYwKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnVwZGF0ZVRleHRTdHlsZSh7Y29sb3I6IGBoc2woJHtodWV9LCAxMDAlLCA1MCUpYH0pO1xuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgU2Nyb2xsaW5nVGV4dE1vZGlmaWVyIGV4dGVuZHMgRHluYW1pY01vZGlmaWVyIHtcbiAgICBzcGVlZFBpeGVsc1BlclNlY29uZDogbnVtYmVyO1xuICAgIHByZXZpb3VzVGltZTogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBNYXRyaXhFbGVtZW50LCBzcGVlZFBpeGVsc1BlclNlY29uZDogbnVtYmVyLCBmcmFtZXNQZXJTZWNvbmQ6IG51bWJlcikge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBmcmFtZXNQZXJTZWNvbmQpO1xuICAgICAgICB0aGlzLnNwZWVkUGl4ZWxzUGVyU2Vjb25kID0gc3BlZWRQaXhlbHNQZXJTZWNvbmQ7XG4gICAgICAgIHRoaXMucHJldmlvdXNUaW1lID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGFwcGx5KHRpbWVzdGFtcDogbnVtYmVyKSB7XG4gICAgICAgIGlmICghdGhpcy5wcmV2aW91c1RpbWUpIHtcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNUaW1lID0gdGltZXN0YW1wO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnggPSB0aGlzLmVsZW1lbnQud2lkdGg7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQueCAtPSB0aGlzLnNwZWVkUGl4ZWxzUGVyU2Vjb25kICogKHRpbWVzdGFtcCAtIHRoaXMucHJldmlvdXNUaW1lKSAvIDEwMDA7XG4gICAgICAgIHRoaXMucHJldmlvdXNUaW1lID0gdGltZXN0YW1wO1xuXG4gICAgICAgIGlmICh0aGlzLmVsZW1lbnQueCArIHRoaXMuZWxlbWVudC50ZXh0V2lkdGggPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQueCA9IHRoaXMuZWxlbWVudC53aWR0aDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJsaW5rTW9kaWZpZXIgZXh0ZW5kcyBEeW5hbWljTW9kaWZpZXIge1xuICAgIGFwcGx5KHRpbWVzdGFtcDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGxldCB0ID0gdGltZXN0YW1wICUgMTAwMFxuICAgICAgICB0aGlzLmVsZW1lbnQudmlzaWJsZSA9IHQgPCA1MDBcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFNjYWxlTW9kaWZpZXIgZXh0ZW5kcyBEeW5hbWljTW9kaWZpZXIge1xuICAgIGFwcGx5KHRpbWVzdGFtcDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIC8vINCS0YvRh9C40YHQu9GP0LXQvCDQvNCw0YHRiNGC0LDQsSDQvdCwINC+0YHQvdC+0LLQtSDQstGA0LXQvNC10L3QuFxuICAgICAgICBsZXQgdCA9ICh0aW1lc3RhbXAgJSAyMDAwKSAvIDIwMDA7XG4gICAgICAgIGlmICh0ID4gMC41KSB0ID0gMSAtIHRcbiAgICAgICAgdCA9IDEgKyB0XG5cbiAgICAgICAgLy8g0J/RgNC40LzQtdC90Y/QtdC8INC80LDRgdGI0YLQsNCx0LjRgNC+0LLQsNC90LjQtSDQuiDRjdC70LXQvNC10L3RgtGDXG4gICAgICAgIHRoaXMuZWxlbWVudC51cGRhdGVBZGRpdGlvbmFsU3R5bGVzKHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogYHNjYWxlKCR7dH0pYFxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuXG5pbnRlcmZhY2UgUmVwb3J0RmlsdGVyIHtcbiAgICBtaW5UaW1lPzogbnVtYmVyO1xuICAgIHZpc2l0cz86IG51bWJlcjtcbiAgICByZXF1aXJlRGVwZW5kZW5jaWVzPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFBvaW50VHJhY2tlciB7XG4gICAgcHJpdmF0ZSBwb2ludHM6IE1hcDxzdHJpbmcsIFBvaW50RGF0YT47XG4gICAgcHJpdmF0ZSBsYXN0VGltZXN0YW1wczogTWFwPHN0cmluZywgbnVtYmVyPjtcbiAgICBwcml2YXRlIGxhc3RQb2ludDogc3RyaW5nIHwgbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnBvaW50cyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5sYXN0VGltZXN0YW1wcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5sYXN0UG9pbnQgPSBudWxsO1xuICAgIH1cblxuICAgIHBvaW50KHBvaW50TmFtZTogc3RyaW5nLCBjaGVja1BvaW50cz86IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgIGlmICghdGhpcy5wb2ludHMuaGFzKHBvaW50TmFtZSkpIHtcbiAgICAgICAgICAgIHRoaXMucG9pbnRzLnNldChwb2ludE5hbWUsIG5ldyBQb2ludERhdGEoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjdXJyZW50UG9pbnREYXRhID0gdGhpcy5wb2ludHMuZ2V0KHBvaW50TmFtZSkhO1xuXG4gICAgICAgIGlmICh0aGlzLmxhc3RUaW1lc3RhbXBzLmhhcyhwb2ludE5hbWUpKSB7XG4gICAgICAgICAgICBjb25zdCB0aW1lU2luY2VMYXN0VmlzaXQgPSBjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWVzdGFtcHMuZ2V0KHBvaW50TmFtZSkhO1xuICAgICAgICAgICAgY3VycmVudFBvaW50RGF0YS51cGRhdGVJdGVyYXRpb25UaW1lKHRpbWVTaW5jZUxhc3RWaXNpdCk7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50UG9pbnREYXRhLmluY3JlbWVudFZpc2l0cygpO1xuXG4gICAgICAgIGlmIChjaGVja1BvaW50cykge1xuICAgICAgICAgICAgY2hlY2tQb2ludHMuZm9yRWFjaCgoY2hlY2tQb2ludE5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0VGltZXN0YW1wcy5oYXMoY2hlY2tQb2ludE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVTcGVudCA9IGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZXN0YW1wcy5nZXQoY2hlY2tQb2ludE5hbWUpITtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFBvaW50RGF0YS51cGRhdGVUcmFuc2l0aW9uKGNoZWNrUG9pbnROYW1lLCB0aW1lU3BlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubGFzdFBvaW50ICE9PSBudWxsICYmIHRoaXMubGFzdFBvaW50ICE9PSBwb2ludE5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVTcGVudCA9IGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZXN0YW1wcy5nZXQodGhpcy5sYXN0UG9pbnQpITtcbiAgICAgICAgICAgIGN1cnJlbnRQb2ludERhdGEudXBkYXRlVHJhbnNpdGlvbih0aGlzLmxhc3RQb2ludCArIFwiIChwcmV2aW91cylcIiwgdGltZVNwZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubGFzdFRpbWVzdGFtcHMuc2V0KHBvaW50TmFtZSwgY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmxhc3RQb2ludCA9IHBvaW50TmFtZTtcbiAgICB9XG5cbiAgICByZXBvcnQoZmlsdGVyOiBSZXBvcnRGaWx0ZXIgPSB7fSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHJlcG9ydExpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCBtaW5UaW1lRmlsdGVyID0gZmlsdGVyLm1pblRpbWUgfHwgMDtcbiAgICAgICAgY29uc3QgbWluVmlzaXRzRmlsdGVyID0gZmlsdGVyLnZpc2l0cyB8fCAwO1xuICAgICAgICBjb25zdCByZXF1aXJlRGVwZW5kZW5jaWVzID0gZmlsdGVyLnJlcXVpcmVEZXBlbmRlbmNpZXMgfHwgZmFsc2U7XG5cbiAgICAgICAgLy8g0KTQuNC70YzRgtGA0LDRhtC40Y8g0YLQvtGH0LXQulxuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKChkYXRhLCBwb2ludCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXZnVGltZSA9IGRhdGEuYXZlcmFnZUl0ZXJhdGlvblRpbWUoKTtcblxuICAgICAgICAgICAgaWYgKGF2Z1RpbWUgPj0gbWluVGltZUZpbHRlciAmJiBkYXRhLnRvdGFsVmlzaXRzID49IG1pblZpc2l0c0ZpbHRlcikge1xuICAgICAgICAgICAgICAgIC8vINCk0LjQu9GM0YLRgNCw0YbQuNGPINC/0LXRgNC10YXQvtC00L7QslxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkVHJhbnNpdGlvbnMgPSBuZXcgTWFwPHN0cmluZywgVHJhbnNpdGlvbkRhdGE+KCk7XG5cbiAgICAgICAgICAgICAgICBkYXRhLnRyYW5zaXRpb25zLmZvckVhY2goKHRyYW5zaXRpb25EYXRhLCBmcm9tUG9pbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25EYXRhLmF2ZXJhZ2VUaW1lKCkgPj0gbWluVGltZUZpbHRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRUcmFuc2l0aW9ucy5zZXQoZnJvbVBvaW50LCB0cmFuc2l0aW9uRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vINCU0L7QsdCw0LLQu9C10L3QuNC1INCyINC+0YLRh9C10YIg0YLQvtC70YzQutC+INC10YHQu9C4INC10YHRgtGMINC/0LXRgNC10YXQvtC00Ysg0LjQu9C4INC90LUg0YLRgNC10LHRg9C10YLRgdGPINC+0LHRj9C30LDRgtC10LvRjNC90YvRhSDQt9Cw0LLQuNGB0LjQvNC+0YHRgtC10LlcbiAgICAgICAgICAgICAgICBpZiAoIXJlcXVpcmVEZXBlbmRlbmNpZXMgfHwgZmlsdGVyZWRUcmFuc2l0aW9ucy5zaXplID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFBvaW50V2l0aEZpbHRlcmVkVHJhbnNpdGlvbnMocmVwb3J0TGluZXMsIHBvaW50LCBkYXRhLCBmaWx0ZXJlZFRyYW5zaXRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXBvcnRMaW5lcy5qb2luKFwiXFxuXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkUG9pbnRXaXRoRmlsdGVyZWRUcmFuc2l0aW9ucyhcbiAgICAgICAgcmVwb3J0TGluZXM6IHN0cmluZ1tdLFxuICAgICAgICBwb2ludDogc3RyaW5nLFxuICAgICAgICBkYXRhOiBQb2ludERhdGEsXG4gICAgICAgIGZpbHRlcmVkVHJhbnNpdGlvbnM6IE1hcDxzdHJpbmcsIFRyYW5zaXRpb25EYXRhPlxuICAgICkge1xuICAgICAgICByZXBvcnRMaW5lcy5wdXNoKFxuICAgICAgICAgICAgYCR7Y2hhbGsuZ3JlZW4ocG9pbnQpfTogVmlzaXRzPSR7ZGF0YS50b3RhbFZpc2l0c30sIEF2Z1RpbWU9JHtjaGFsay5yZWQoZGF0YS5hdmVyYWdlSXRlcmF0aW9uVGltZSgpLnRvRml4ZWQoMikpfW1zYFxuICAgICAgICApO1xuXG4gICAgICAgIGZpbHRlcmVkVHJhbnNpdGlvbnMuZm9yRWFjaCgodHJhbnNpdGlvbkRhdGEsIGZyb21Qb2ludCkgPT4ge1xuICAgICAgICAgICAgcmVwb3J0TGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBgICAke2NoYWxrLmN5YW4oZnJvbVBvaW50KX0gLT4gJHtjaGFsay5ncmVlbihwb2ludCl9OiBDb3VudD0ke3RyYW5zaXRpb25EYXRhLmNvdW50fSwgTWluPSR7dHJhbnNpdGlvbkRhdGEubWluVGltZS50b0ZpeGVkKDIpfW1zLCBNYXg9JHt0cmFuc2l0aW9uRGF0YS5tYXhUaW1lLnRvRml4ZWQoMil9bXMsIEF2Zz0ke2NoYWxrLnJlZCh0cmFuc2l0aW9uRGF0YS5hdmVyYWdlVGltZSgpLnRvRml4ZWQoMikpfW1zYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jbGFzcyBQb2ludERhdGEge1xuICAgIHRvdGFsVmlzaXRzOiBudW1iZXI7XG4gICAgdG90YWxJdGVyYXRpb25UaW1lOiBudW1iZXI7XG4gICAgdHJhbnNpdGlvbnM6IE1hcDxzdHJpbmcsIFRyYW5zaXRpb25EYXRhPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnRvdGFsVmlzaXRzID0gMDtcbiAgICAgICAgdGhpcy50b3RhbEl0ZXJhdGlvblRpbWUgPSAwO1xuICAgICAgICB0aGlzLnRyYW5zaXRpb25zID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIGluY3JlbWVudFZpc2l0cygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy50b3RhbFZpc2l0cyArPSAxO1xuICAgIH1cblxuICAgIHVwZGF0ZUl0ZXJhdGlvblRpbWUodGltZVNwZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy50b3RhbEl0ZXJhdGlvblRpbWUgKz0gdGltZVNwZW50O1xuICAgIH1cblxuICAgIGF2ZXJhZ2VJdGVyYXRpb25UaW1lKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvdGFsVmlzaXRzID4gMSA/IHRoaXMudG90YWxJdGVyYXRpb25UaW1lIC8gKHRoaXMudG90YWxWaXNpdHMgLSAxKSA6IDA7XG4gICAgfVxuXG4gICAgdXBkYXRlVHJhbnNpdGlvbihmcm9tUG9pbnQ6IHN0cmluZywgdGltZVNwZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLnRyYW5zaXRpb25zLmhhcyhmcm9tUG9pbnQpKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25zLnNldChmcm9tUG9pbnQsIG5ldyBUcmFuc2l0aW9uRGF0YSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRyYW5zaXRpb25EYXRhID0gdGhpcy50cmFuc2l0aW9ucy5nZXQoZnJvbVBvaW50KSE7XG4gICAgICAgIHRyYW5zaXRpb25EYXRhLnVwZGF0ZSh0aW1lU3BlbnQpO1xuICAgIH1cbn1cblxuY2xhc3MgVHJhbnNpdGlvbkRhdGEge1xuICAgIGNvdW50OiBudW1iZXI7XG4gICAgdG90YWxUaW1lOiBudW1iZXI7XG4gICAgbWluVGltZTogbnVtYmVyO1xuICAgIG1heFRpbWU6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvdW50ID0gMDtcbiAgICAgICAgdGhpcy50b3RhbFRpbWUgPSAwO1xuICAgICAgICB0aGlzLm1pblRpbWUgPSBJbmZpbml0eTtcbiAgICAgICAgdGhpcy5tYXhUaW1lID0gMDtcbiAgICB9XG5cbiAgICB1cGRhdGUodGltZVNwZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jb3VudCArPSAxO1xuICAgICAgICB0aGlzLnRvdGFsVGltZSArPSB0aW1lU3BlbnQ7XG4gICAgICAgIHRoaXMubWluVGltZSA9IE1hdGgubWluKHRoaXMubWluVGltZSwgdGltZVNwZW50KTtcbiAgICAgICAgdGhpcy5tYXhUaW1lID0gTWF0aC5tYXgodGhpcy5tYXhUaW1lLCB0aW1lU3BlbnQpO1xuICAgIH1cblxuICAgIGF2ZXJhZ2VUaW1lKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvdW50ID4gMCA/IHRoaXMudG90YWxUaW1lIC8gdGhpcy5jb3VudCA6IDA7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIE11dGV4IHtcbiAgICBzdGF0aWMgbG9nQWxsb3dlZCA9IHRydWVcbiAgICBwcml2YXRlIF9xdWV1ZTogKCgpID0+IHZvaWQpW10gPSBbXTtcbiAgICBwcml2YXRlIF9sb2NrID0gZmFsc2U7XG5cbiAgICBsb2NrKGxvZ01zZz86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoTXV0ZXgubG9nQWxsb3dlZCAmJiBsb2dNc2cpIGNvbnNvbGUubG9nKFwiTXV0ZXggbG9jazogXCIsIGxvZ01zZywgIXRoaXMuX2xvY2spXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2xvY2spIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcXVldWUucHVzaChyZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0cnlMb2NrKGxvZ01zZz86IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5fbG9jaykge1xuICAgICAgICAgICAgLy8g0JXRgdC70Lgg0LzRjNGO0YLQtdC60YEg0YPQttC1INC30LDQu9C+0YfQtdC9LCDQstC+0LfQstGA0LDRidCw0LXQvCBmYWxzZVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g0JXRgdC70Lgg0LzRjNGO0YLQtdC60YEg0YHQstC+0LHQvtC00LXQvSwg0LvQvtGH0LjQvCDQtdCz0L4g0Lgg0LLQvtC30LLRgNCw0YnQsNC10LwgdHJ1ZVxuICAgICAgICAgICAgdGhpcy5fbG9jayA9IHRydWU7XG4gICAgICAgICAgICBpZiAoTXV0ZXgubG9nQWxsb3dlZCAmJiBsb2dNc2cpIGNvbnNvbGUubG9nKFwiTXV0ZXggdHJ5TG9jayBzdWNjZXNzZnVsOiBcIiwgbG9nTXNnKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICB1bmxvY2sobG9nTXNnPzogc3RyaW5nKSB7XG4gICAgICAgIGlmIChNdXRleC5sb2dBbGxvd2VkICYmIGxvZ01zZykgY29uc29sZS5sb2coXCJNdXRleCB1bkxvY2s6IFwiLCBsb2dNc2cpXG4gICAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBmdW5jID0gdGhpcy5fcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgIGlmIChmdW5jKSBmdW5jKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2NrID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59IiwiaW1wb3J0IHtXb3JrZXJNYW5hZ2VyIGFzIEJhc2VXb3JrZXJNYW5hZ2VyfSBmcm9tIFwid29ya2VyLXRocmVhZHMtbWFuYWdlci9kaXN0L3NyY1wiO1xuaW1wb3J0IHtIYW5kbGVyc30gZnJvbSBcIi4vd29ya2VyXCI7XG5pbXBvcnQge3Jlc29sdmV9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgV2ViU29ja2V0LCB7U2VydmVyfSBmcm9tIFwid3NcIjtcbmltcG9ydCB7UG9pbnRUcmFja2VyfSBmcm9tIFwiQHNlcnZlci9Qb2ludFRyYWNrZXJcIjtcbmltcG9ydCB7TWF0cml4fSBmcm9tIFwiLi4vLi4vTWF0cml4L3NyYy9NYXRyaXhcIjtcbmltcG9ydCB7U2VyRGV9IGZyb20gXCJzZXJkZS10c1wiO1xuaW1wb3J0IHtNYXRyaXhFbGVtZW50LCBUaW1lTWF0cml4RWxlbWVudH0gZnJvbSBcIi4uLy4uL01hdHJpeC9zcmMvTWF0cml4RWxlbWVudFwiO1xuaW1wb3J0IHtcbiAgICBSYWluYm93RWZmZWN0TW9kaWZpZXIsXG4gICAgUm90YXRpb25Nb2RpZmllcixcbiAgICBTY2FsZU1vZGlmaWVyLFxuICAgIFNjcm9sbGluZ1RleHRNb2RpZmllclxufSBmcm9tIFwiLi4vLi4vTWF0cml4L3NyYy9Nb2RpZmllcnNcIjtcbmltcG9ydCB7TXV0ZXh9IGZyb20gXCJAc2VydmVyL211dGV4XCI7XG5pbXBvcnQgKiBhcyBwcm9jZXNzIGZyb20gXCJub2RlOnByb2Nlc3NcIjtcblxubGV0IGkgPSAwO1xubGV0IGNsaWVudENvdW50ZXIgPSAwO1xubGV0IGNsaWVudHM6IFdlYlNvY2tldFtdID0gW107XG5sZXQgdHJhY2tlciA9IG5ldyBQb2ludFRyYWNrZXIoKTtcbmxldCBtdXRleCA9IG5ldyBNdXRleCgpO1xuXG5jbGFzcyBXb3JrZXJNYW5hZ2VyIHtcbiAgICBwcml2YXRlIG1hbmFnZXI6IEJhc2VXb3JrZXJNYW5hZ2VyPEhhbmRsZXJzPjtcbiAgICBjdXJyZW50V29ya2VySWQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIHBvcnRzID0gWzgwODUsIDgwODZdO1xuICAgIHByaXZhdGUgY3VycmVudFBvcnRJbmRleCA9IDA7XG4gICAgcHJpdmF0ZSBpbnRlcnZhbDogTm9kZUpTLlRpbWVvdXQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSB0aW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIG9sZFdvcmtlcklkOiB1bmRlZmluZWQgfCBudW1iZXIgPSB1bmRlZmluZWQ7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5tYW5hZ2VyID0gbmV3IEJhc2VXb3JrZXJNYW5hZ2VyPEhhbmRsZXJzPigpO1xuICAgIH1cblxuICAgIGFzeW5jIGNyZWF0ZVdvcmtlcigpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICB0aGlzLmN1cnJlbnRQb3J0SW5kZXggPSAxIC0gdGhpcy5jdXJyZW50UG9ydEluZGV4OyAgLy8gQWx0ZXJuYXRlIGJldHdlZW4gODA4NSBhbmQgODA4NlxuICAgICAgICBjb25zdCBwb3J0ID0gdGhpcy5wb3J0c1t0aGlzLmN1cnJlbnRQb3J0SW5kZXhdO1xuXG4gICAgICAgIGNvbnN0IHdvcmtlcklkID0gYXdhaXQgdGhpcy5tYW5hZ2VyLmNyZWF0ZVdvcmtlcldpdGhIYW5kbGVycyhyZXNvbHZlKF9fZGlybmFtZSwgJ3dvcmtlci5qcycpKTtcbiAgICAgICAgYXdhaXQgdGhpcy5tYW5hZ2VyLmNhbGwod29ya2VySWQsIFwiaW5pdGlhbGl6ZVBhZ2VcIiwgcG9ydCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBXb3JrZXIgd2l0aCBJRCAke3dvcmtlcklkfSBjcmVhdGVkIG9uIHBvcnQgJHtwb3J0fS5gKTtcbiAgICAgICAgdGhpcy5vbGRXb3JrZXJJZCA9IHRoaXMuY3VycmVudFdvcmtlcklkXG4gICAgICAgIHJldHVybiB3b3JrZXJJZDtcbiAgICB9XG5cbiAgICBhc3luYyBzd2FwV29ya2Vycyhsb2NrTXV0ZXg/OiBNdXRleCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAobG9ja011dGV4KSBsb2NrTXV0ZXgudW5sb2NrKClcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdvcmtlcklkID09PSB1bmRlZmluZWQpIHJldHVyblxuXG4gICAgICAgIGlmICh0aGlzLm9sZFdvcmtlcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGF3YWl0IG11dGV4LmxvY2soKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYFN3YXBwaW5nIGZyb20gd29ya2VyIElEICR7dGhpcy5vbGRXb3JrZXJJZH0gdG8gJHt0aGlzLmN1cnJlbnRXb3JrZXJJZH1gKTtcblxuICAgICAgICAgICAgICAgIC8vIFRyYW5zZmVyIHN0YXRlIGZyb20gb2xkIHdvcmtlciB0byBuZXcgd29ya2VyXG4gICAgICAgICAgICAgICAgY29uc3Qgc25hcHNob3Q6IHN0cmluZyA9IGF3YWl0IHRoaXMubWFuYWdlci5jYWxsKHRoaXMub2xkV29ya2VySWQsICdnZXRTbmFwc2hvdCcpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMubWFuYWdlci5jYWxsKHRoaXMuY3VycmVudFdvcmtlcklkLCAnc2V0U25hcHNob3QnLCBzbmFwc2hvdCk7XG5cbiAgICAgICAgICAgICAgICAvLyBDYW5jZWwgYWxsIHRhc2tzIHJlbGF0ZWQgdG8gdGhlIG9sZCB3b3JrZXIgYW5kIGNsb3NlIFdlYlNvY2tldCBzZXJ2ZXJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1hbmFnZXIuY2FsbCh0aGlzLm9sZFdvcmtlcklkLCAnY2xvc2VXZWJTb2NrZXRTZXJ2ZXJBbmRQYWdlJyk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5tYW5hZ2VyLnRlcm1pbmF0ZVdvcmtlcih0aGlzLm9sZFdvcmtlcklkKTtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgbXV0ZXgudW5sb2NrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXJ0UmVuZGVyaW5nUHJvY2VzcygpO1xuICAgICAgICBjb25zb2xlLmxvZyhgV29ya2VyIElEICR7dGhpcy5jdXJyZW50V29ya2VySWR9IGlzIG5vdyB0aGUgYWN0aXZlIHdvcmtlci5gKTtcbiAgICB9XG5cbiAgICBhc3luYyB1cGRhdGVNYXRyaXgoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXb3JrZXJJZCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgIGF3YWl0IG11dGV4LmxvY2soKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBtYXRyaXg6IE1hdHJpeCA9IFNlckRlLmRlc2VyaWFsaXplKGF3YWl0IHRoaXMubWFuYWdlci5jYWxsKHRoaXMuY3VycmVudFdvcmtlcklkLCAnZ2V0U25hcHNob3QnKSk7XG4gICAgICAgICAgICBtYXRyaXguZWxlbWVudHNbMV0uc2V0VGV4dCgoaSsrKS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMubWFuYWdlci5jYWxsKHRoaXMuY3VycmVudFdvcmtlcklkLCAnc2V0U25hcHNob3QnLCBTZXJEZS5zZXJpYWxpc2UobWF0cml4KSk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBtdXRleC51bmxvY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYyBzdGFydFJlbmRlcmluZ1Byb2Nlc3MoKTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmludGVydmFsKVxuICAgICAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKHRoaXMudXBkYXRlTWF0cml4LmJpbmQodGhpcyksIDEwMDApXG5cbiAgICAgICAgY29uc3QgcHJvY2Vzc0ZyYW1lR3JvdXAgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCBtdXRleC5sb2NrKCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRXb3JrZXJJZCAhPT0gdW5kZWZpbmVkKSB7IC8vIEVuc3VyZSB3b3JrZXIgaXMgc3RpbGwgdmFsaWRcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYENhbGxpbmcgd29ya2VyIHdpdGggSUQ6ICR7dGhpcy5jdXJyZW50V29ya2VySWR9LCBtZXRob2Q6IGdlbmVyYXRlTmV4dEZyYW1lR3JvdXBgKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZyYW1lR3JvdXAgPSBhd2FpdCB0aGlzLm1hbmFnZXIuY2FsbCh0aGlzLmN1cnJlbnRXb3JrZXJJZCwgJ2dlbmVyYXRlTmV4dEZyYW1lR3JvdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZyYW1lR3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNsaWVudCBvZiBjbGllbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50LnNlbmQoSlNPTi5zdHJpbmdpZnkoZnJhbWVHcm91cCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXh0VGltZW91dCA9IGZyYW1lR3JvdXAhLnN0YXJ0VGltZSAtIERhdGUubm93KCkgLSA1MDA7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnRpbWVvdXQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQocHJvY2Vzc0ZyYW1lR3JvdXAsIE1hdGgubWF4KG5leHRUaW1lb3V0LCAwKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgV29ya2VyIHdpdGggSUQgJHt0aGlzLmN1cnJlbnRXb3JrZXJJZH0gaXMgbm8gbG9uZ2VyIHZhbGlkIGR1cmluZyBwcm9jZXNzRnJhbWVHcm91cC5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIG11dGV4LnVubG9jaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFN0YXJ0IGZyYW1lIHByb2Nlc3NpbmcgYW5kIG1hdHJpeCB1cGRhdGVzIGltbWVkaWF0ZWx5XG4gICAgICAgIGF3YWl0IHByb2Nlc3NGcmFtZUdyb3VwKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgc3RhcnROZXdXb3JrZXJBbmRTd2FwKCkge1xuICAgICAgICBsZXQgd29ya2VySWQgPSBhd2FpdCB0aGlzLmNyZWF0ZVdvcmtlcigpO1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlMSA9PiBzZXRUaW1lb3V0KHJlc29sdmUxLCAxMDAwMCkpXG4gICAgICAgIGF3YWl0IG11dGV4LmxvY2soKVxuICAgICAgICB0aGlzLmN1cnJlbnRXb3JrZXJJZCA9IHdvcmtlcklkXG4gICAgICAgIGF3YWl0IHRoaXMuc3dhcFdvcmtlcnMobXV0ZXgpOyAgLy8gU3dhcCBhZnRlciBuZXcgd29ya2VyIGlzIGZ1bGx5IHJlYWR5XG4gICAgfVxufVxuXG4oYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBtYW5hZ2VyID0gbmV3IFdvcmtlck1hbmFnZXIoKTtcbiAgICAgICAgbWFuYWdlci5jdXJyZW50V29ya2VySWQgPSBhd2FpdCBtYW5hZ2VyLmNyZWF0ZVdvcmtlcigpO1xuICAgICAgICBtYW5hZ2VyLnN0YXJ0UmVuZGVyaW5nUHJvY2VzcygpXG4gICAgICAgIHdoaWxlICgxKSB7XG4gICAgICAgICAgICBhd2FpdCBtYW5hZ2VyLnN0YXJ0TmV3V29ya2VyQW5kU3dhcCgpXG4gICAgICAgIH1cbiAgICB9XG4pKCk7XG5cblxuKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB3c3MgPSBuZXcgU2VydmVyKHtwb3J0OiA4MDgzfSk7ICAvLyBPbmx5IG9uZSBpbnN0YW5jZSBvZiB0aGUgV2ViU29ja2V0IHNlcnZlclxuICAgIHdzcy5vbignY29ubmVjdGlvbicsICh3czogV2ViU29ja2V0KSA9PiB7XG4gICAgICAgIGNvbnN0IGNsaWVudElkID0gKytjbGllbnRDb3VudGVyO1xuICAgICAgICBjbGllbnRzLnB1c2god3MpO1xuICAgICAgICBjb25zb2xlLmxvZyhgQ2xpZW50IGNvbm5lY3RlZDogJHtjbGllbnRJZH1gKTtcbiAgICAgICAgdHJhY2tlci5wb2ludCgnY2xpZW50LWNvbm5lY3RlZCcpO1xuXG4gICAgICAgIHdzLm9uY2UoJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICAgICAgY2xpZW50cyA9IGNsaWVudHMuZmlsdGVyKChjbGllbnQpID0+IGNsaWVudCAhPT0gd3MpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYENsaWVudCBkaXNjb25uZWN0ZWQ6ICR7Y2xpZW50SWR9YCk7XG4gICAgICAgICAgICB0cmFja2VyLnBvaW50KCdjbGllbnQtZGlzY29ubmVjdGVkJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdzLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgV2ViU29ja2V0IGVycm9yIHdpdGggY2xpZW50ICR7Y2xpZW50SWR9OmAsIGVycm9yKTtcbiAgICAgICAgICAgIHRyYWNrZXIucG9pbnQoJ2Vycm9yLW9jY3VycmVkJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gUmVnaXN0ZXIgY2xhc3NlcyBmb3Igc2VyaWFsaXphdGlvbi9kZXNlcmlhbGl6YXRpb25cbiAgICBTZXJEZS5jbGFzc1JlZ2lzdHJhdGlvbihbXG4gICAgICAgIE1hdHJpeCwgTWF0cml4RWxlbWVudCwgVGltZU1hdHJpeEVsZW1lbnQsIFNjcm9sbGluZ1RleHRNb2RpZmllciwgU2NhbGVNb2RpZmllciwgUmFpbmJvd0VmZmVjdE1vZGlmaWVyXG4gICAgXSk7XG59KSgpO1xuXG5zZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgZm9ybWF0TWVtb3J5VXNhZ2UgPSAoZGF0YTogYW55KSA9PiBgJHtNYXRoLnJvdW5kKGRhdGEgLyAxMDI0IC8gMTAyNCAqIDEwMCkgLyAxMDB9IE1CYDtcbiAgICBhd2FpdCBtdXRleC5sb2NrKClcbiAgICBjb25zdCBtZW1vcnlEYXRhID0gcHJvY2Vzcy5tZW1vcnlVc2FnZSgpO1xuXG4gICAgY29uc3QgbWVtb3J5VXNhZ2UgPSB7XG4gICAgICAgIHJzczogYCR7Zm9ybWF0TWVtb3J5VXNhZ2UobWVtb3J5RGF0YS5yc3MpfSAtPiBSZXNpZGVudCBTZXQgU2l6ZSAtIHRvdGFsIG1lbW9yeSBhbGxvY2F0ZWQgZm9yIHRoZSBwcm9jZXNzIGV4ZWN1dGlvbmAsXG4gICAgICAgIGhlYXBUb3RhbDogYCR7Zm9ybWF0TWVtb3J5VXNhZ2UobWVtb3J5RGF0YS5oZWFwVG90YWwpfSAtPiB0b3RhbCBzaXplIG9mIHRoZSBhbGxvY2F0ZWQgaGVhcGAsXG4gICAgICAgIGhlYXBVc2VkOiBgJHtmb3JtYXRNZW1vcnlVc2FnZShtZW1vcnlEYXRhLmhlYXBVc2VkKX0gLT4gYWN0dWFsIG1lbW9yeSB1c2VkIGR1cmluZyB0aGUgZXhlY3V0aW9uYCxcbiAgICAgICAgZXh0ZXJuYWw6IGAke2Zvcm1hdE1lbW9yeVVzYWdlKG1lbW9yeURhdGEuZXh0ZXJuYWwpfSAtPiBWOCBleHRlcm5hbCBtZW1vcnlgLFxuICAgIH07XG5cbiAgICBjb25zb2xlLmxvZyhtZW1vcnlVc2FnZSk7XG4gICAgbXV0ZXgudW5sb2NrKClcbn0sIDYwMDAwKVxuXG5cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLldvcmtlckNvbnRyb2xsZXIgPSB2b2lkIDA7XG5jb25zdCB3b3JrZXJfdGhyZWFkc18xID0gcmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpO1xuY29uc3Qgc2VyZGVfdHNfMSA9IHJlcXVpcmUoXCJzZXJkZS10c1wiKTtcbmNsYXNzIFdvcmtlckNvbnRyb2xsZXIge1xuICAgIHN0YXRpYyBpbml0aWFsaXplKGhhbmRsZXJzKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlcnMgPSBoYW5kbGVycztcbiAgICAgICAgLy8gU2VuZCBpbml0aWFsaXphdGlvbiBhY2tub3dsZWRnbWVudCB3aGVuIHRoZSB3b3JrZXIgaXMgZnVsbHkgcmVhZHlcbiAgICAgICAgY29uc3QgaW5pdEFjayA9IHsgdHlwZTogJ2luaXRpYWxpemF0aW9uJyB9O1xuICAgICAgICBpZiAod29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0KSB7XG4gICAgICAgICAgICB3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQucG9zdE1lc3NhZ2UoaW5pdEFjayk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydCkge1xuICAgICAgICAgICAgd29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0Lm9uKCdtZXNzYWdlJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVNZXNzYWdlKGV2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBoYW5kbGVNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3JlcXVlc3QnOlxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlUmVxdWVzdChtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ25vdGlmaWNhdGlvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVOb3RpZmljYXRpb24obWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgVW5rbm93biBtZXNzYWdlIHR5cGU6ICR7bWVzc2FnZS50eXBlfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBoYW5kbGVSZXF1ZXN0KG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgeyByZXF1ZXN0SWQsIHBheWxvYWQgfSA9IG1lc3NhZ2U7XG4gICAgICAgIGNvbnN0IHsgbWV0aG9kTmFtZSwgYXJncyB9ID0gc2VyZGVfdHNfMS5TZXJEZS5kZXNlcmlhbGl6ZShwYXlsb2FkKTtcbiAgICAgICAgaWYgKHRoaXMuaGFuZGxlcnMgJiYgdHlwZW9mIHRoaXMuaGFuZGxlcnNbbWV0aG9kTmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gc2VyZGVfdHNfMS5TZXJEZS5zZXJpYWxpc2UoYXdhaXQgdGhpcy5oYW5kbGVyc1ttZXRob2ROYW1lXSguLi5hcmdzKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geyB0eXBlOiAncmVzcG9uc2UnLCByZXF1ZXN0SWQsIHJlc3VsdCB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAod29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQucG9zdE1lc3NhZ2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHsgdHlwZTogJ3Jlc3BvbnNlJywgcmVxdWVzdElkLCBlcnJvciB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAod29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQucG9zdE1lc3NhZ2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdyZXNwb25zZScsXG4gICAgICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgICAgIHJlc3VsdDogbmV3IEVycm9yKGBNZXRob2QgJHttZXRob2ROYW1lfSBub3QgZm91bmQgb24gaGFuZGxlcnNgKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgICAgICB3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQucG9zdE1lc3NhZ2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBoYW5kbGVOb3RpZmljYXRpb24obWVzc2FnZSkge1xuICAgICAgICBjb25zdCB7IG1ldGhvZE5hbWUsIGFyZ3MgfSA9IG1lc3NhZ2UucGF5bG9hZDtcbiAgICAgICAgaWYgKHRoaXMuaGFuZGxlcnMgJiYgdHlwZW9mIHRoaXMuaGFuZGxlcnNbbWV0aG9kTmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVyc1ttZXRob2ROYW1lXSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGhhbmRsaW5nIG5vdGlmaWNhdGlvbjogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaGFuZGxpbmcgbm90aWZpY2F0aW9uOiB1bmtub3duIGVycm9yJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBOb3RpZmljYXRpb24gbWV0aG9kICR7bWV0aG9kTmFtZX0gbm90IGZvdW5kIG9uIGhhbmRsZXJzYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIHJlZ2lzdGVyQ2xhc3NlcyhjbGFzc2VzKSB7XG4gICAgICAgIHNlcmRlX3RzXzEuU2VyRGUuY2xhc3NSZWdpc3RyYXRpb24oY2xhc3Nlcyk7XG4gICAgfVxufVxuZXhwb3J0cy5Xb3JrZXJDb250cm9sbGVyID0gV29ya2VyQ29udHJvbGxlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVdvcmtlckNvbnRyb2xsZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLldvcmtlck1hbmFnZXIgPSB2b2lkIDA7XG5jb25zdCB3b3JrZXJfdGhyZWFkc18xID0gcmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpO1xuY29uc3Qgc2VyZGVfdHNfMSA9IHJlcXVpcmUoXCJzZXJkZS10c1wiKTtcbmNsYXNzIFdvcmtlck1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKHRpbWVvdXQgPSAyICoqIDMxIC0gMSkge1xuICAgICAgICB0aGlzLndvcmtlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMucmVxdWVzdElkQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMud29ya2VySWRDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5yZXNwb25zZUhhbmRsZXJzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMudGltZW91dCA9IHRpbWVvdXQ7XG4gICAgfVxuICAgIGFzeW5jIGNyZWF0ZVdvcmtlcldpdGhIYW5kbGVycyh3b3JrZXJGaWxlKSB7XG4gICAgICAgIGNvbnN0IHdvcmtlciA9IG5ldyB3b3JrZXJfdGhyZWFkc18xLldvcmtlcih3b3JrZXJGaWxlKTtcbiAgICAgICAgY29uc3Qgd29ya2VySWQgPSArK3RoaXMud29ya2VySWRDb3VudGVyO1xuICAgICAgICB0aGlzLndvcmtlcnMuc2V0KHdvcmtlcklkLCB3b3JrZXIpO1xuICAgICAgICB3b3JrZXIub24oJ21lc3NhZ2UnLCAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVNZXNzYWdlKG1lc3NhZ2UsIHdvcmtlcklkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuc2V0KHdvcmtlcklkLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7IC8vIENsZWFyIHRpbWVvdXQgb24gc3VjY2Vzc1xuICAgICAgICAgICAgICAgIHJlc29sdmUod29ya2VySWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzLmhhcyh3b3JrZXJJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzLmRlbGV0ZSh3b3JrZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1dvcmtlciBpbml0aWFsaXphdGlvbiB0aW1lZCBvdXQnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcy50aW1lb3V0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSwgd29ya2VySWQpIHtcbiAgICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2luaXRpYWxpemF0aW9uJzpcbiAgICAgICAgICAgICAgICBjb25zdCBpbml0SGFuZGxlciA9IHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5nZXQod29ya2VySWQpO1xuICAgICAgICAgICAgICAgIGlmIChpbml0SGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICBpbml0SGFuZGxlcigpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuZGVsZXRlKHdvcmtlcklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyZXNwb25zZSc6XG4gICAgICAgICAgICAgICAgY29uc3QgeyByZXF1ZXN0SWQsIHJlc3VsdCB9ID0gbWVzc2FnZTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZUhhbmRsZXIgPSB0aGlzLnJlc3BvbnNlSGFuZGxlcnMuZ2V0KHJlcXVlc3RJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlSGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZUhhbmRsZXIoc2VyZGVfdHNfMS5TZXJEZS5kZXNlcmlhbGl6ZShyZXN1bHQpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNwb25zZUhhbmRsZXJzLmRlbGV0ZShyZXF1ZXN0SWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ25vdGlmaWNhdGlvbic6XG4gICAgICAgICAgICAgICAgLy8gSGFuZGxlIG5vdGlmaWNhdGlvbnMgaWYgbmVjZXNzYXJ5XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBtZXNzYWdlIHR5cGU6ICR7bWVzc2FnZS50eXBlfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGNhbGwod29ya2VySWQsIG1ldGhvZE5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gdGhpcy53b3JrZXJzLmdldCh3b3JrZXJJZCk7XG4gICAgICAgIGlmICghd29ya2VyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdvcmtlciB3aXRoIElEICR7d29ya2VySWR9IG5vdCBmb3VuZGApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlcXVlc3RJZCA9ICsrdGhpcy5yZXF1ZXN0SWRDb3VudGVyO1xuICAgICAgICBjb25zdCByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ3JlcXVlc3QnLFxuICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgcGF5bG9hZDogc2VyZGVfdHNfMS5TZXJEZS5zZXJpYWxpc2UoeyBtZXRob2ROYW1lLCBhcmdzIH0pXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMuZGVsZXRlKHJlcXVlc3RJZCk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignUmVxdWVzdCB0aW1lZCBvdXQnKSk7XG4gICAgICAgICAgICB9LCB0aGlzLnRpbWVvdXQpO1xuICAgICAgICAgICAgdGhpcy5yZXNwb25zZUhhbmRsZXJzLnNldChyZXF1ZXN0SWQsIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTsgLy8gQ2xlYXIgdGltZW91dCBvbiBzdWNjZXNzXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2UocmVxdWVzdCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzZW5kTm90aWZpY2F0aW9uKHdvcmtlcklkLCBtZXRob2ROYW1lLCAuLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IHdvcmtlciA9IHRoaXMud29ya2Vycy5nZXQod29ya2VySWQpO1xuICAgICAgICBpZiAoIXdvcmtlcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXb3JrZXIgd2l0aCBJRCAke3dvcmtlcklkfSBub3QgZm91bmRgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBub3RpZmljYXRpb24gPSB7XG4gICAgICAgICAgICB0eXBlOiAnbm90aWZpY2F0aW9uJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHsgbWV0aG9kTmFtZSwgYXJncyB9XG4gICAgICAgIH07XG4gICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShub3RpZmljYXRpb24pO1xuICAgIH1cbiAgICBhc3luYyB0ZXJtaW5hdGVXb3JrZXIod29ya2VySWQpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gdGhpcy53b3JrZXJzLmdldCh3b3JrZXJJZCk7XG4gICAgICAgIGlmICh3b3JrZXIpIHtcbiAgICAgICAgICAgIGF3YWl0IHdvcmtlci50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgIHRoaXMud29ya2Vycy5kZWxldGUod29ya2VySWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlZ2lzdGVyQ2xhc3NlcyhjbGFzc2VzKSB7XG4gICAgICAgIHNlcmRlX3RzXzEuU2VyRGUuY2xhc3NSZWdpc3RyYXRpb24oY2xhc3Nlcyk7XG4gICAgfVxufVxuZXhwb3J0cy5Xb3JrZXJNYW5hZ2VyID0gV29ya2VyTWFuYWdlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVdvcmtlck1hbmFnZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHBvcnRzLCBwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9Xb3JrZXJNYW5hZ2VyXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9Xb3JrZXJDb250cm9sbGVyXCIpLCBleHBvcnRzKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIndzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5vZGU6b3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZTpwcm9jZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5vZGU6dHR5XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIik7IiwiaW1wb3J0IGFuc2lTdHlsZXMgZnJvbSAnI2Fuc2ktc3R5bGVzJztcbmltcG9ydCBzdXBwb3J0c0NvbG9yIGZyb20gJyNzdXBwb3J0cy1jb2xvcic7XG5pbXBvcnQgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGltcG9ydC9vcmRlclxuXHRzdHJpbmdSZXBsYWNlQWxsLFxuXHRzdHJpbmdFbmNhc2VDUkxGV2l0aEZpcnN0SW5kZXgsXG59IGZyb20gJy4vdXRpbGl0aWVzLmpzJztcblxuY29uc3Qge3N0ZG91dDogc3Rkb3V0Q29sb3IsIHN0ZGVycjogc3RkZXJyQ29sb3J9ID0gc3VwcG9ydHNDb2xvcjtcblxuY29uc3QgR0VORVJBVE9SID0gU3ltYm9sKCdHRU5FUkFUT1InKTtcbmNvbnN0IFNUWUxFUiA9IFN5bWJvbCgnU1RZTEVSJyk7XG5jb25zdCBJU19FTVBUWSA9IFN5bWJvbCgnSVNfRU1QVFknKTtcblxuLy8gYHN1cHBvcnRzQ29sb3IubGV2ZWxgIOKGkiBgYW5zaVN0eWxlcy5jb2xvcltuYW1lXWAgbWFwcGluZ1xuY29uc3QgbGV2ZWxNYXBwaW5nID0gW1xuXHQnYW5zaScsXG5cdCdhbnNpJyxcblx0J2Fuc2kyNTYnLFxuXHQnYW5zaTE2bScsXG5dO1xuXG5jb25zdCBzdHlsZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5jb25zdCBhcHBseU9wdGlvbnMgPSAob2JqZWN0LCBvcHRpb25zID0ge30pID0+IHtcblx0aWYgKG9wdGlvbnMubGV2ZWwgJiYgIShOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMubGV2ZWwpICYmIG9wdGlvbnMubGV2ZWwgPj0gMCAmJiBvcHRpb25zLmxldmVsIDw9IDMpKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdUaGUgYGxldmVsYCBvcHRpb24gc2hvdWxkIGJlIGFuIGludGVnZXIgZnJvbSAwIHRvIDMnKTtcblx0fVxuXG5cdC8vIERldGVjdCBsZXZlbCBpZiBub3Qgc2V0IG1hbnVhbGx5XG5cdGNvbnN0IGNvbG9yTGV2ZWwgPSBzdGRvdXRDb2xvciA/IHN0ZG91dENvbG9yLmxldmVsIDogMDtcblx0b2JqZWN0LmxldmVsID0gb3B0aW9ucy5sZXZlbCA9PT0gdW5kZWZpbmVkID8gY29sb3JMZXZlbCA6IG9wdGlvbnMubGV2ZWw7XG59O1xuXG5leHBvcnQgY2xhc3MgQ2hhbGsge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnN0cnVjdG9yLXJldHVyblxuXHRcdHJldHVybiBjaGFsa0ZhY3Rvcnkob3B0aW9ucyk7XG5cdH1cbn1cblxuY29uc3QgY2hhbGtGYWN0b3J5ID0gb3B0aW9ucyA9PiB7XG5cdGNvbnN0IGNoYWxrID0gKC4uLnN0cmluZ3MpID0+IHN0cmluZ3Muam9pbignICcpO1xuXHRhcHBseU9wdGlvbnMoY2hhbGssIG9wdGlvbnMpO1xuXG5cdE9iamVjdC5zZXRQcm90b3R5cGVPZihjaGFsaywgY3JlYXRlQ2hhbGsucHJvdG90eXBlKTtcblxuXHRyZXR1cm4gY2hhbGs7XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVDaGFsayhvcHRpb25zKSB7XG5cdHJldHVybiBjaGFsa0ZhY3Rvcnkob3B0aW9ucyk7XG59XG5cbk9iamVjdC5zZXRQcm90b3R5cGVPZihjcmVhdGVDaGFsay5wcm90b3R5cGUsIEZ1bmN0aW9uLnByb3RvdHlwZSk7XG5cbmZvciAoY29uc3QgW3N0eWxlTmFtZSwgc3R5bGVdIG9mIE9iamVjdC5lbnRyaWVzKGFuc2lTdHlsZXMpKSB7XG5cdHN0eWxlc1tzdHlsZU5hbWVdID0ge1xuXHRcdGdldCgpIHtcblx0XHRcdGNvbnN0IGJ1aWxkZXIgPSBjcmVhdGVCdWlsZGVyKHRoaXMsIGNyZWF0ZVN0eWxlcihzdHlsZS5vcGVuLCBzdHlsZS5jbG9zZSwgdGhpc1tTVFlMRVJdKSwgdGhpc1tJU19FTVBUWV0pO1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIHN0eWxlTmFtZSwge3ZhbHVlOiBidWlsZGVyfSk7XG5cdFx0XHRyZXR1cm4gYnVpbGRlcjtcblx0XHR9LFxuXHR9O1xufVxuXG5zdHlsZXMudmlzaWJsZSA9IHtcblx0Z2V0KCkge1xuXHRcdGNvbnN0IGJ1aWxkZXIgPSBjcmVhdGVCdWlsZGVyKHRoaXMsIHRoaXNbU1RZTEVSXSwgdHJ1ZSk7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2aXNpYmxlJywge3ZhbHVlOiBidWlsZGVyfSk7XG5cdFx0cmV0dXJuIGJ1aWxkZXI7XG5cdH0sXG59O1xuXG5jb25zdCBnZXRNb2RlbEFuc2kgPSAobW9kZWwsIGxldmVsLCB0eXBlLCAuLi5hcmd1bWVudHNfKSA9PiB7XG5cdGlmIChtb2RlbCA9PT0gJ3JnYicpIHtcblx0XHRpZiAobGV2ZWwgPT09ICdhbnNpMTZtJykge1xuXHRcdFx0cmV0dXJuIGFuc2lTdHlsZXNbdHlwZV0uYW5zaTE2bSguLi5hcmd1bWVudHNfKTtcblx0XHR9XG5cblx0XHRpZiAobGV2ZWwgPT09ICdhbnNpMjU2Jykge1xuXHRcdFx0cmV0dXJuIGFuc2lTdHlsZXNbdHlwZV0uYW5zaTI1NihhbnNpU3R5bGVzLnJnYlRvQW5zaTI1NiguLi5hcmd1bWVudHNfKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFuc2lTdHlsZXNbdHlwZV0uYW5zaShhbnNpU3R5bGVzLnJnYlRvQW5zaSguLi5hcmd1bWVudHNfKSk7XG5cdH1cblxuXHRpZiAobW9kZWwgPT09ICdoZXgnKSB7XG5cdFx0cmV0dXJuIGdldE1vZGVsQW5zaSgncmdiJywgbGV2ZWwsIHR5cGUsIC4uLmFuc2lTdHlsZXMuaGV4VG9SZ2IoLi4uYXJndW1lbnRzXykpO1xuXHR9XG5cblx0cmV0dXJuIGFuc2lTdHlsZXNbdHlwZV1bbW9kZWxdKC4uLmFyZ3VtZW50c18pO1xufTtcblxuY29uc3QgdXNlZE1vZGVscyA9IFsncmdiJywgJ2hleCcsICdhbnNpMjU2J107XG5cbmZvciAoY29uc3QgbW9kZWwgb2YgdXNlZE1vZGVscykge1xuXHRzdHlsZXNbbW9kZWxdID0ge1xuXHRcdGdldCgpIHtcblx0XHRcdGNvbnN0IHtsZXZlbH0gPSB0aGlzO1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uICguLi5hcmd1bWVudHNfKSB7XG5cdFx0XHRcdGNvbnN0IHN0eWxlciA9IGNyZWF0ZVN0eWxlcihnZXRNb2RlbEFuc2kobW9kZWwsIGxldmVsTWFwcGluZ1tsZXZlbF0sICdjb2xvcicsIC4uLmFyZ3VtZW50c18pLCBhbnNpU3R5bGVzLmNvbG9yLmNsb3NlLCB0aGlzW1NUWUxFUl0pO1xuXHRcdFx0XHRyZXR1cm4gY3JlYXRlQnVpbGRlcih0aGlzLCBzdHlsZXIsIHRoaXNbSVNfRU1QVFldKTtcblx0XHRcdH07XG5cdFx0fSxcblx0fTtcblxuXHRjb25zdCBiZ01vZGVsID0gJ2JnJyArIG1vZGVsWzBdLnRvVXBwZXJDYXNlKCkgKyBtb2RlbC5zbGljZSgxKTtcblx0c3R5bGVzW2JnTW9kZWxdID0ge1xuXHRcdGdldCgpIHtcblx0XHRcdGNvbnN0IHtsZXZlbH0gPSB0aGlzO1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uICguLi5hcmd1bWVudHNfKSB7XG5cdFx0XHRcdGNvbnN0IHN0eWxlciA9IGNyZWF0ZVN0eWxlcihnZXRNb2RlbEFuc2kobW9kZWwsIGxldmVsTWFwcGluZ1tsZXZlbF0sICdiZ0NvbG9yJywgLi4uYXJndW1lbnRzXyksIGFuc2lTdHlsZXMuYmdDb2xvci5jbG9zZSwgdGhpc1tTVFlMRVJdKTtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZUJ1aWxkZXIodGhpcywgc3R5bGVyLCB0aGlzW0lTX0VNUFRZXSk7XG5cdFx0XHR9O1xuXHRcdH0sXG5cdH07XG59XG5cbmNvbnN0IHByb3RvID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoKCkgPT4ge30sIHtcblx0Li4uc3R5bGVzLFxuXHRsZXZlbDoge1xuXHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0Z2V0KCkge1xuXHRcdFx0cmV0dXJuIHRoaXNbR0VORVJBVE9SXS5sZXZlbDtcblx0XHR9LFxuXHRcdHNldChsZXZlbCkge1xuXHRcdFx0dGhpc1tHRU5FUkFUT1JdLmxldmVsID0gbGV2ZWw7XG5cdFx0fSxcblx0fSxcbn0pO1xuXG5jb25zdCBjcmVhdGVTdHlsZXIgPSAob3BlbiwgY2xvc2UsIHBhcmVudCkgPT4ge1xuXHRsZXQgb3BlbkFsbDtcblx0bGV0IGNsb3NlQWxsO1xuXHRpZiAocGFyZW50ID09PSB1bmRlZmluZWQpIHtcblx0XHRvcGVuQWxsID0gb3Blbjtcblx0XHRjbG9zZUFsbCA9IGNsb3NlO1xuXHR9IGVsc2Uge1xuXHRcdG9wZW5BbGwgPSBwYXJlbnQub3BlbkFsbCArIG9wZW47XG5cdFx0Y2xvc2VBbGwgPSBjbG9zZSArIHBhcmVudC5jbG9zZUFsbDtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0b3Blbixcblx0XHRjbG9zZSxcblx0XHRvcGVuQWxsLFxuXHRcdGNsb3NlQWxsLFxuXHRcdHBhcmVudCxcblx0fTtcbn07XG5cbmNvbnN0IGNyZWF0ZUJ1aWxkZXIgPSAoc2VsZiwgX3N0eWxlciwgX2lzRW1wdHkpID0+IHtcblx0Ly8gU2luZ2xlIGFyZ3VtZW50IGlzIGhvdCBwYXRoLCBpbXBsaWNpdCBjb2VyY2lvbiBpcyBmYXN0ZXIgdGhhbiBhbnl0aGluZ1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8taW1wbGljaXQtY29lcmNpb25cblx0Y29uc3QgYnVpbGRlciA9ICguLi5hcmd1bWVudHNfKSA9PiBhcHBseVN0eWxlKGJ1aWxkZXIsIChhcmd1bWVudHNfLmxlbmd0aCA9PT0gMSkgPyAoJycgKyBhcmd1bWVudHNfWzBdKSA6IGFyZ3VtZW50c18uam9pbignICcpKTtcblxuXHQvLyBXZSBhbHRlciB0aGUgcHJvdG90eXBlIGJlY2F1c2Ugd2UgbXVzdCByZXR1cm4gYSBmdW5jdGlvbiwgYnV0IHRoZXJlIGlzXG5cdC8vIG5vIHdheSB0byBjcmVhdGUgYSBmdW5jdGlvbiB3aXRoIGEgZGlmZmVyZW50IHByb3RvdHlwZVxuXHRPYmplY3Quc2V0UHJvdG90eXBlT2YoYnVpbGRlciwgcHJvdG8pO1xuXG5cdGJ1aWxkZXJbR0VORVJBVE9SXSA9IHNlbGY7XG5cdGJ1aWxkZXJbU1RZTEVSXSA9IF9zdHlsZXI7XG5cdGJ1aWxkZXJbSVNfRU1QVFldID0gX2lzRW1wdHk7XG5cblx0cmV0dXJuIGJ1aWxkZXI7XG59O1xuXG5jb25zdCBhcHBseVN0eWxlID0gKHNlbGYsIHN0cmluZykgPT4ge1xuXHRpZiAoc2VsZi5sZXZlbCA8PSAwIHx8ICFzdHJpbmcpIHtcblx0XHRyZXR1cm4gc2VsZltJU19FTVBUWV0gPyAnJyA6IHN0cmluZztcblx0fVxuXG5cdGxldCBzdHlsZXIgPSBzZWxmW1NUWUxFUl07XG5cblx0aWYgKHN0eWxlciA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIHN0cmluZztcblx0fVxuXG5cdGNvbnN0IHtvcGVuQWxsLCBjbG9zZUFsbH0gPSBzdHlsZXI7XG5cdGlmIChzdHJpbmcuaW5jbHVkZXMoJ1xcdTAwMUInKSkge1xuXHRcdHdoaWxlIChzdHlsZXIgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gUmVwbGFjZSBhbnkgaW5zdGFuY2VzIGFscmVhZHkgcHJlc2VudCB3aXRoIGEgcmUtb3BlbmluZyBjb2RlXG5cdFx0XHQvLyBvdGhlcndpc2Ugb25seSB0aGUgcGFydCBvZiB0aGUgc3RyaW5nIHVudGlsIHNhaWQgY2xvc2luZyBjb2RlXG5cdFx0XHQvLyB3aWxsIGJlIGNvbG9yZWQsIGFuZCB0aGUgcmVzdCB3aWxsIHNpbXBseSBiZSAncGxhaW4nLlxuXHRcdFx0c3RyaW5nID0gc3RyaW5nUmVwbGFjZUFsbChzdHJpbmcsIHN0eWxlci5jbG9zZSwgc3R5bGVyLm9wZW4pO1xuXG5cdFx0XHRzdHlsZXIgPSBzdHlsZXIucGFyZW50O1xuXHRcdH1cblx0fVxuXG5cdC8vIFdlIGNhbiBtb3ZlIGJvdGggbmV4dCBhY3Rpb25zIG91dCBvZiBsb29wLCBiZWNhdXNlIHJlbWFpbmluZyBhY3Rpb25zIGluIGxvb3Agd29uJ3QgaGF2ZVxuXHQvLyBhbnkvdmlzaWJsZSBlZmZlY3Qgb24gcGFydHMgd2UgYWRkIGhlcmUuIENsb3NlIHRoZSBzdHlsaW5nIGJlZm9yZSBhIGxpbmVicmVhayBhbmQgcmVvcGVuXG5cdC8vIGFmdGVyIG5leHQgbGluZSB0byBmaXggYSBibGVlZCBpc3N1ZSBvbiBtYWNPUzogaHR0cHM6Ly9naXRodWIuY29tL2NoYWxrL2NoYWxrL3B1bGwvOTJcblx0Y29uc3QgbGZJbmRleCA9IHN0cmluZy5pbmRleE9mKCdcXG4nKTtcblx0aWYgKGxmSW5kZXggIT09IC0xKSB7XG5cdFx0c3RyaW5nID0gc3RyaW5nRW5jYXNlQ1JMRldpdGhGaXJzdEluZGV4KHN0cmluZywgY2xvc2VBbGwsIG9wZW5BbGwsIGxmSW5kZXgpO1xuXHR9XG5cblx0cmV0dXJuIG9wZW5BbGwgKyBzdHJpbmcgKyBjbG9zZUFsbDtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGNyZWF0ZUNoYWxrLnByb3RvdHlwZSwgc3R5bGVzKTtcblxuY29uc3QgY2hhbGsgPSBjcmVhdGVDaGFsaygpO1xuZXhwb3J0IGNvbnN0IGNoYWxrU3RkZXJyID0gY3JlYXRlQ2hhbGsoe2xldmVsOiBzdGRlcnJDb2xvciA/IHN0ZGVyckNvbG9yLmxldmVsIDogMH0pO1xuXG5leHBvcnQge1xuXHRtb2RpZmllck5hbWVzLFxuXHRmb3JlZ3JvdW5kQ29sb3JOYW1lcyxcblx0YmFja2dyb3VuZENvbG9yTmFtZXMsXG5cdGNvbG9yTmFtZXMsXG5cblx0Ly8gVE9ETzogUmVtb3ZlIHRoZXNlIGFsaWFzZXMgaW4gdGhlIG5leHQgbWFqb3IgdmVyc2lvblxuXHRtb2RpZmllck5hbWVzIGFzIG1vZGlmaWVycyxcblx0Zm9yZWdyb3VuZENvbG9yTmFtZXMgYXMgZm9yZWdyb3VuZENvbG9ycyxcblx0YmFja2dyb3VuZENvbG9yTmFtZXMgYXMgYmFja2dyb3VuZENvbG9ycyxcblx0Y29sb3JOYW1lcyBhcyBjb2xvcnMsXG59IGZyb20gJy4vdmVuZG9yL2Fuc2ktc3R5bGVzL2luZGV4LmpzJztcblxuZXhwb3J0IHtcblx0c3Rkb3V0Q29sb3IgYXMgc3VwcG9ydHNDb2xvcixcblx0c3RkZXJyQ29sb3IgYXMgc3VwcG9ydHNDb2xvclN0ZGVycixcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNoYWxrO1xuIiwiLy8gVE9ETzogV2hlbiB0YXJnZXRpbmcgTm9kZS5qcyAxNiwgdXNlIGBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2VBbGxgLlxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1JlcGxhY2VBbGwoc3RyaW5nLCBzdWJzdHJpbmcsIHJlcGxhY2VyKSB7XG5cdGxldCBpbmRleCA9IHN0cmluZy5pbmRleE9mKHN1YnN0cmluZyk7XG5cdGlmIChpbmRleCA9PT0gLTEpIHtcblx0XHRyZXR1cm4gc3RyaW5nO1xuXHR9XG5cblx0Y29uc3Qgc3Vic3RyaW5nTGVuZ3RoID0gc3Vic3RyaW5nLmxlbmd0aDtcblx0bGV0IGVuZEluZGV4ID0gMDtcblx0bGV0IHJldHVyblZhbHVlID0gJyc7XG5cdGRvIHtcblx0XHRyZXR1cm5WYWx1ZSArPSBzdHJpbmcuc2xpY2UoZW5kSW5kZXgsIGluZGV4KSArIHN1YnN0cmluZyArIHJlcGxhY2VyO1xuXHRcdGVuZEluZGV4ID0gaW5kZXggKyBzdWJzdHJpbmdMZW5ndGg7XG5cdFx0aW5kZXggPSBzdHJpbmcuaW5kZXhPZihzdWJzdHJpbmcsIGVuZEluZGV4KTtcblx0fSB3aGlsZSAoaW5kZXggIT09IC0xKTtcblxuXHRyZXR1cm5WYWx1ZSArPSBzdHJpbmcuc2xpY2UoZW5kSW5kZXgpO1xuXHRyZXR1cm4gcmV0dXJuVmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdFbmNhc2VDUkxGV2l0aEZpcnN0SW5kZXgoc3RyaW5nLCBwcmVmaXgsIHBvc3RmaXgsIGluZGV4KSB7XG5cdGxldCBlbmRJbmRleCA9IDA7XG5cdGxldCByZXR1cm5WYWx1ZSA9ICcnO1xuXHRkbyB7XG5cdFx0Y29uc3QgZ290Q1IgPSBzdHJpbmdbaW5kZXggLSAxXSA9PT0gJ1xccic7XG5cdFx0cmV0dXJuVmFsdWUgKz0gc3RyaW5nLnNsaWNlKGVuZEluZGV4LCAoZ290Q1IgPyBpbmRleCAtIDEgOiBpbmRleCkpICsgcHJlZml4ICsgKGdvdENSID8gJ1xcclxcbicgOiAnXFxuJykgKyBwb3N0Zml4O1xuXHRcdGVuZEluZGV4ID0gaW5kZXggKyAxO1xuXHRcdGluZGV4ID0gc3RyaW5nLmluZGV4T2YoJ1xcbicsIGVuZEluZGV4KTtcblx0fSB3aGlsZSAoaW5kZXggIT09IC0xKTtcblxuXHRyZXR1cm5WYWx1ZSArPSBzdHJpbmcuc2xpY2UoZW5kSW5kZXgpO1xuXHRyZXR1cm4gcmV0dXJuVmFsdWU7XG59XG4iLCJjb25zdCBBTlNJX0JBQ0tHUk9VTkRfT0ZGU0VUID0gMTA7XG5cbmNvbnN0IHdyYXBBbnNpMTYgPSAob2Zmc2V0ID0gMCkgPT4gY29kZSA9PiBgXFx1MDAxQlske2NvZGUgKyBvZmZzZXR9bWA7XG5cbmNvbnN0IHdyYXBBbnNpMjU2ID0gKG9mZnNldCA9IDApID0+IGNvZGUgPT4gYFxcdTAwMUJbJHszOCArIG9mZnNldH07NTske2NvZGV9bWA7XG5cbmNvbnN0IHdyYXBBbnNpMTZtID0gKG9mZnNldCA9IDApID0+IChyZWQsIGdyZWVuLCBibHVlKSA9PiBgXFx1MDAxQlskezM4ICsgb2Zmc2V0fTsyOyR7cmVkfTske2dyZWVufTske2JsdWV9bWA7XG5cbmNvbnN0IHN0eWxlcyA9IHtcblx0bW9kaWZpZXI6IHtcblx0XHRyZXNldDogWzAsIDBdLFxuXHRcdC8vIDIxIGlzbid0IHdpZGVseSBzdXBwb3J0ZWQgYW5kIDIyIGRvZXMgdGhlIHNhbWUgdGhpbmdcblx0XHRib2xkOiBbMSwgMjJdLFxuXHRcdGRpbTogWzIsIDIyXSxcblx0XHRpdGFsaWM6IFszLCAyM10sXG5cdFx0dW5kZXJsaW5lOiBbNCwgMjRdLFxuXHRcdG92ZXJsaW5lOiBbNTMsIDU1XSxcblx0XHRpbnZlcnNlOiBbNywgMjddLFxuXHRcdGhpZGRlbjogWzgsIDI4XSxcblx0XHRzdHJpa2V0aHJvdWdoOiBbOSwgMjldLFxuXHR9LFxuXHRjb2xvcjoge1xuXHRcdGJsYWNrOiBbMzAsIDM5XSxcblx0XHRyZWQ6IFszMSwgMzldLFxuXHRcdGdyZWVuOiBbMzIsIDM5XSxcblx0XHR5ZWxsb3c6IFszMywgMzldLFxuXHRcdGJsdWU6IFszNCwgMzldLFxuXHRcdG1hZ2VudGE6IFszNSwgMzldLFxuXHRcdGN5YW46IFszNiwgMzldLFxuXHRcdHdoaXRlOiBbMzcsIDM5XSxcblxuXHRcdC8vIEJyaWdodCBjb2xvclxuXHRcdGJsYWNrQnJpZ2h0OiBbOTAsIDM5XSxcblx0XHRncmF5OiBbOTAsIDM5XSwgLy8gQWxpYXMgb2YgYGJsYWNrQnJpZ2h0YFxuXHRcdGdyZXk6IFs5MCwgMzldLCAvLyBBbGlhcyBvZiBgYmxhY2tCcmlnaHRgXG5cdFx0cmVkQnJpZ2h0OiBbOTEsIDM5XSxcblx0XHRncmVlbkJyaWdodDogWzkyLCAzOV0sXG5cdFx0eWVsbG93QnJpZ2h0OiBbOTMsIDM5XSxcblx0XHRibHVlQnJpZ2h0OiBbOTQsIDM5XSxcblx0XHRtYWdlbnRhQnJpZ2h0OiBbOTUsIDM5XSxcblx0XHRjeWFuQnJpZ2h0OiBbOTYsIDM5XSxcblx0XHR3aGl0ZUJyaWdodDogWzk3LCAzOV0sXG5cdH0sXG5cdGJnQ29sb3I6IHtcblx0XHRiZ0JsYWNrOiBbNDAsIDQ5XSxcblx0XHRiZ1JlZDogWzQxLCA0OV0sXG5cdFx0YmdHcmVlbjogWzQyLCA0OV0sXG5cdFx0YmdZZWxsb3c6IFs0MywgNDldLFxuXHRcdGJnQmx1ZTogWzQ0LCA0OV0sXG5cdFx0YmdNYWdlbnRhOiBbNDUsIDQ5XSxcblx0XHRiZ0N5YW46IFs0NiwgNDldLFxuXHRcdGJnV2hpdGU6IFs0NywgNDldLFxuXG5cdFx0Ly8gQnJpZ2h0IGNvbG9yXG5cdFx0YmdCbGFja0JyaWdodDogWzEwMCwgNDldLFxuXHRcdGJnR3JheTogWzEwMCwgNDldLCAvLyBBbGlhcyBvZiBgYmdCbGFja0JyaWdodGBcblx0XHRiZ0dyZXk6IFsxMDAsIDQ5XSwgLy8gQWxpYXMgb2YgYGJnQmxhY2tCcmlnaHRgXG5cdFx0YmdSZWRCcmlnaHQ6IFsxMDEsIDQ5XSxcblx0XHRiZ0dyZWVuQnJpZ2h0OiBbMTAyLCA0OV0sXG5cdFx0YmdZZWxsb3dCcmlnaHQ6IFsxMDMsIDQ5XSxcblx0XHRiZ0JsdWVCcmlnaHQ6IFsxMDQsIDQ5XSxcblx0XHRiZ01hZ2VudGFCcmlnaHQ6IFsxMDUsIDQ5XSxcblx0XHRiZ0N5YW5CcmlnaHQ6IFsxMDYsIDQ5XSxcblx0XHRiZ1doaXRlQnJpZ2h0OiBbMTA3LCA0OV0sXG5cdH0sXG59O1xuXG5leHBvcnQgY29uc3QgbW9kaWZpZXJOYW1lcyA9IE9iamVjdC5rZXlzKHN0eWxlcy5tb2RpZmllcik7XG5leHBvcnQgY29uc3QgZm9yZWdyb3VuZENvbG9yTmFtZXMgPSBPYmplY3Qua2V5cyhzdHlsZXMuY29sb3IpO1xuZXhwb3J0IGNvbnN0IGJhY2tncm91bmRDb2xvck5hbWVzID0gT2JqZWN0LmtleXMoc3R5bGVzLmJnQ29sb3IpO1xuZXhwb3J0IGNvbnN0IGNvbG9yTmFtZXMgPSBbLi4uZm9yZWdyb3VuZENvbG9yTmFtZXMsIC4uLmJhY2tncm91bmRDb2xvck5hbWVzXTtcblxuZnVuY3Rpb24gYXNzZW1ibGVTdHlsZXMoKSB7XG5cdGNvbnN0IGNvZGVzID0gbmV3IE1hcCgpO1xuXG5cdGZvciAoY29uc3QgW2dyb3VwTmFtZSwgZ3JvdXBdIG9mIE9iamVjdC5lbnRyaWVzKHN0eWxlcykpIHtcblx0XHRmb3IgKGNvbnN0IFtzdHlsZU5hbWUsIHN0eWxlXSBvZiBPYmplY3QuZW50cmllcyhncm91cCkpIHtcblx0XHRcdHN0eWxlc1tzdHlsZU5hbWVdID0ge1xuXHRcdFx0XHRvcGVuOiBgXFx1MDAxQlske3N0eWxlWzBdfW1gLFxuXHRcdFx0XHRjbG9zZTogYFxcdTAwMUJbJHtzdHlsZVsxXX1tYCxcblx0XHRcdH07XG5cblx0XHRcdGdyb3VwW3N0eWxlTmFtZV0gPSBzdHlsZXNbc3R5bGVOYW1lXTtcblxuXHRcdFx0Y29kZXMuc2V0KHN0eWxlWzBdLCBzdHlsZVsxXSk7XG5cdFx0fVxuXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHN0eWxlcywgZ3JvdXBOYW1lLCB7XG5cdFx0XHR2YWx1ZTogZ3JvdXAsXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9KTtcblx0fVxuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdHlsZXMsICdjb2RlcycsIHtcblx0XHR2YWx1ZTogY29kZXMsXG5cdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdH0pO1xuXG5cdHN0eWxlcy5jb2xvci5jbG9zZSA9ICdcXHUwMDFCWzM5bSc7XG5cdHN0eWxlcy5iZ0NvbG9yLmNsb3NlID0gJ1xcdTAwMUJbNDltJztcblxuXHRzdHlsZXMuY29sb3IuYW5zaSA9IHdyYXBBbnNpMTYoKTtcblx0c3R5bGVzLmNvbG9yLmFuc2kyNTYgPSB3cmFwQW5zaTI1NigpO1xuXHRzdHlsZXMuY29sb3IuYW5zaTE2bSA9IHdyYXBBbnNpMTZtKCk7XG5cdHN0eWxlcy5iZ0NvbG9yLmFuc2kgPSB3cmFwQW5zaTE2KEFOU0lfQkFDS0dST1VORF9PRkZTRVQpO1xuXHRzdHlsZXMuYmdDb2xvci5hbnNpMjU2ID0gd3JhcEFuc2kyNTYoQU5TSV9CQUNLR1JPVU5EX09GRlNFVCk7XG5cdHN0eWxlcy5iZ0NvbG9yLmFuc2kxNm0gPSB3cmFwQW5zaTE2bShBTlNJX0JBQ0tHUk9VTkRfT0ZGU0VUKTtcblxuXHQvLyBGcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9RaXgtL2NvbG9yLWNvbnZlcnQvYmxvYi8zZjBlMGQ0ZTkyZTIzNTc5NmNjYjE3ZjZlODVjNzIwOTRhNjUxZjQ5L2NvbnZlcnNpb25zLmpzXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHN0eWxlcywge1xuXHRcdHJnYlRvQW5zaTI1Njoge1xuXHRcdFx0dmFsdWUocmVkLCBncmVlbiwgYmx1ZSkge1xuXHRcdFx0XHQvLyBXZSB1c2UgdGhlIGV4dGVuZGVkIGdyZXlzY2FsZSBwYWxldHRlIGhlcmUsIHdpdGggdGhlIGV4Y2VwdGlvbiBvZlxuXHRcdFx0XHQvLyBibGFjayBhbmQgd2hpdGUuIG5vcm1hbCBwYWxldHRlIG9ubHkgaGFzIDQgZ3JleXNjYWxlIHNoYWRlcy5cblx0XHRcdFx0aWYgKHJlZCA9PT0gZ3JlZW4gJiYgZ3JlZW4gPT09IGJsdWUpIHtcblx0XHRcdFx0XHRpZiAocmVkIDwgOCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDE2O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChyZWQgPiAyNDgpIHtcblx0XHRcdFx0XHRcdHJldHVybiAyMzE7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIE1hdGgucm91bmQoKChyZWQgLSA4KSAvIDI0NykgKiAyNCkgKyAyMzI7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gMTZcblx0XHRcdFx0XHQrICgzNiAqIE1hdGgucm91bmQocmVkIC8gMjU1ICogNSkpXG5cdFx0XHRcdFx0KyAoNiAqIE1hdGgucm91bmQoZ3JlZW4gLyAyNTUgKiA1KSlcblx0XHRcdFx0XHQrIE1hdGgucm91bmQoYmx1ZSAvIDI1NSAqIDUpO1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0sXG5cdFx0aGV4VG9SZ2I6IHtcblx0XHRcdHZhbHVlKGhleCkge1xuXHRcdFx0XHRjb25zdCBtYXRjaGVzID0gL1thLWZcXGRdezZ9fFthLWZcXGRdezN9L2kuZXhlYyhoZXgudG9TdHJpbmcoMTYpKTtcblx0XHRcdFx0aWYgKCFtYXRjaGVzKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFswLCAwLCAwXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBbY29sb3JTdHJpbmddID0gbWF0Y2hlcztcblxuXHRcdFx0XHRpZiAoY29sb3JTdHJpbmcubGVuZ3RoID09PSAzKSB7XG5cdFx0XHRcdFx0Y29sb3JTdHJpbmcgPSBbLi4uY29sb3JTdHJpbmddLm1hcChjaGFyYWN0ZXIgPT4gY2hhcmFjdGVyICsgY2hhcmFjdGVyKS5qb2luKCcnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGludGVnZXIgPSBOdW1iZXIucGFyc2VJbnQoY29sb3JTdHJpbmcsIDE2KTtcblxuXHRcdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHRcdC8qIGVzbGludC1kaXNhYmxlIG5vLWJpdHdpc2UgKi9cblx0XHRcdFx0XHQoaW50ZWdlciA+PiAxNikgJiAweEZGLFxuXHRcdFx0XHRcdChpbnRlZ2VyID4+IDgpICYgMHhGRixcblx0XHRcdFx0XHRpbnRlZ2VyICYgMHhGRixcblx0XHRcdFx0XHQvKiBlc2xpbnQtZW5hYmxlIG5vLWJpdHdpc2UgKi9cblx0XHRcdFx0XTtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9LFxuXHRcdGhleFRvQW5zaTI1Njoge1xuXHRcdFx0dmFsdWU6IGhleCA9PiBzdHlsZXMucmdiVG9BbnNpMjU2KC4uLnN0eWxlcy5oZXhUb1JnYihoZXgpKSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0sXG5cdFx0YW5zaTI1NlRvQW5zaToge1xuXHRcdFx0dmFsdWUoY29kZSkge1xuXHRcdFx0XHRpZiAoY29kZSA8IDgpIHtcblx0XHRcdFx0XHRyZXR1cm4gMzAgKyBjb2RlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGNvZGUgPCAxNikge1xuXHRcdFx0XHRcdHJldHVybiA5MCArIChjb2RlIC0gOCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgcmVkO1xuXHRcdFx0XHRsZXQgZ3JlZW47XG5cdFx0XHRcdGxldCBibHVlO1xuXG5cdFx0XHRcdGlmIChjb2RlID49IDIzMikge1xuXHRcdFx0XHRcdHJlZCA9ICgoKGNvZGUgLSAyMzIpICogMTApICsgOCkgLyAyNTU7XG5cdFx0XHRcdFx0Z3JlZW4gPSByZWQ7XG5cdFx0XHRcdFx0Ymx1ZSA9IHJlZDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb2RlIC09IDE2O1xuXG5cdFx0XHRcdFx0Y29uc3QgcmVtYWluZGVyID0gY29kZSAlIDM2O1xuXG5cdFx0XHRcdFx0cmVkID0gTWF0aC5mbG9vcihjb2RlIC8gMzYpIC8gNTtcblx0XHRcdFx0XHRncmVlbiA9IE1hdGguZmxvb3IocmVtYWluZGVyIC8gNikgLyA1O1xuXHRcdFx0XHRcdGJsdWUgPSAocmVtYWluZGVyICUgNikgLyA1O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgdmFsdWUgPSBNYXRoLm1heChyZWQsIGdyZWVuLCBibHVlKSAqIDI7XG5cblx0XHRcdFx0aWYgKHZhbHVlID09PSAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIDMwO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWJpdHdpc2Vcblx0XHRcdFx0bGV0IHJlc3VsdCA9IDMwICsgKChNYXRoLnJvdW5kKGJsdWUpIDw8IDIpIHwgKE1hdGgucm91bmQoZ3JlZW4pIDw8IDEpIHwgTWF0aC5yb3VuZChyZWQpKTtcblxuXHRcdFx0XHRpZiAodmFsdWUgPT09IDIpIHtcblx0XHRcdFx0XHRyZXN1bHQgKz0gNjA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0sXG5cdFx0cmdiVG9BbnNpOiB7XG5cdFx0XHR2YWx1ZTogKHJlZCwgZ3JlZW4sIGJsdWUpID0+IHN0eWxlcy5hbnNpMjU2VG9BbnNpKHN0eWxlcy5yZ2JUb0Fuc2kyNTYocmVkLCBncmVlbiwgYmx1ZSkpLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0XHRoZXhUb0Fuc2k6IHtcblx0XHRcdHZhbHVlOiBoZXggPT4gc3R5bGVzLmFuc2kyNTZUb0Fuc2koc3R5bGVzLmhleFRvQW5zaTI1NihoZXgpKSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0sXG5cdH0pO1xuXG5cdHJldHVybiBzdHlsZXM7XG59XG5cbmNvbnN0IGFuc2lTdHlsZXMgPSBhc3NlbWJsZVN0eWxlcygpO1xuXG5leHBvcnQgZGVmYXVsdCBhbnNpU3R5bGVzO1xuIiwiaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJztcbmltcG9ydCBvcyBmcm9tICdub2RlOm9zJztcbmltcG9ydCB0dHkgZnJvbSAnbm9kZTp0dHknO1xuXG4vLyBGcm9tOiBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL2hhcy1mbGFnL2Jsb2IvbWFpbi9pbmRleC5qc1xuLy8vIGZ1bmN0aW9uIGhhc0ZsYWcoZmxhZywgYXJndiA9IGdsb2JhbFRoaXMuRGVubz8uYXJncyA/PyBwcm9jZXNzLmFyZ3YpIHtcbmZ1bmN0aW9uIGhhc0ZsYWcoZmxhZywgYXJndiA9IGdsb2JhbFRoaXMuRGVubyA/IGdsb2JhbFRoaXMuRGVuby5hcmdzIDogcHJvY2Vzcy5hcmd2KSB7XG5cdGNvbnN0IHByZWZpeCA9IGZsYWcuc3RhcnRzV2l0aCgnLScpID8gJycgOiAoZmxhZy5sZW5ndGggPT09IDEgPyAnLScgOiAnLS0nKTtcblx0Y29uc3QgcG9zaXRpb24gPSBhcmd2LmluZGV4T2YocHJlZml4ICsgZmxhZyk7XG5cdGNvbnN0IHRlcm1pbmF0b3JQb3NpdGlvbiA9IGFyZ3YuaW5kZXhPZignLS0nKTtcblx0cmV0dXJuIHBvc2l0aW9uICE9PSAtMSAmJiAodGVybWluYXRvclBvc2l0aW9uID09PSAtMSB8fCBwb3NpdGlvbiA8IHRlcm1pbmF0b3JQb3NpdGlvbik7XG59XG5cbmNvbnN0IHtlbnZ9ID0gcHJvY2VzcztcblxubGV0IGZsYWdGb3JjZUNvbG9yO1xuaWYgKFxuXHRoYXNGbGFnKCduby1jb2xvcicpXG5cdHx8IGhhc0ZsYWcoJ25vLWNvbG9ycycpXG5cdHx8IGhhc0ZsYWcoJ2NvbG9yPWZhbHNlJylcblx0fHwgaGFzRmxhZygnY29sb3I9bmV2ZXInKVxuKSB7XG5cdGZsYWdGb3JjZUNvbG9yID0gMDtcbn0gZWxzZSBpZiAoXG5cdGhhc0ZsYWcoJ2NvbG9yJylcblx0fHwgaGFzRmxhZygnY29sb3JzJylcblx0fHwgaGFzRmxhZygnY29sb3I9dHJ1ZScpXG5cdHx8IGhhc0ZsYWcoJ2NvbG9yPWFsd2F5cycpXG4pIHtcblx0ZmxhZ0ZvcmNlQ29sb3IgPSAxO1xufVxuXG5mdW5jdGlvbiBlbnZGb3JjZUNvbG9yKCkge1xuXHRpZiAoJ0ZPUkNFX0NPTE9SJyBpbiBlbnYpIHtcblx0XHRpZiAoZW52LkZPUkNFX0NPTE9SID09PSAndHJ1ZScpIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH1cblxuXHRcdGlmIChlbnYuRk9SQ0VfQ09MT1IgPT09ICdmYWxzZScpIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblxuXHRcdHJldHVybiBlbnYuRk9SQ0VfQ09MT1IubGVuZ3RoID09PSAwID8gMSA6IE1hdGgubWluKE51bWJlci5wYXJzZUludChlbnYuRk9SQ0VfQ09MT1IsIDEwKSwgMyk7XG5cdH1cbn1cblxuZnVuY3Rpb24gdHJhbnNsYXRlTGV2ZWwobGV2ZWwpIHtcblx0aWYgKGxldmVsID09PSAwKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRsZXZlbCxcblx0XHRoYXNCYXNpYzogdHJ1ZSxcblx0XHRoYXMyNTY6IGxldmVsID49IDIsXG5cdFx0aGFzMTZtOiBsZXZlbCA+PSAzLFxuXHR9O1xufVxuXG5mdW5jdGlvbiBfc3VwcG9ydHNDb2xvcihoYXZlU3RyZWFtLCB7c3RyZWFtSXNUVFksIHNuaWZmRmxhZ3MgPSB0cnVlfSA9IHt9KSB7XG5cdGNvbnN0IG5vRmxhZ0ZvcmNlQ29sb3IgPSBlbnZGb3JjZUNvbG9yKCk7XG5cdGlmIChub0ZsYWdGb3JjZUNvbG9yICE9PSB1bmRlZmluZWQpIHtcblx0XHRmbGFnRm9yY2VDb2xvciA9IG5vRmxhZ0ZvcmNlQ29sb3I7XG5cdH1cblxuXHRjb25zdCBmb3JjZUNvbG9yID0gc25pZmZGbGFncyA/IGZsYWdGb3JjZUNvbG9yIDogbm9GbGFnRm9yY2VDb2xvcjtcblxuXHRpZiAoZm9yY2VDb2xvciA9PT0gMCkge1xuXHRcdHJldHVybiAwO1xuXHR9XG5cblx0aWYgKHNuaWZmRmxhZ3MpIHtcblx0XHRpZiAoaGFzRmxhZygnY29sb3I9MTZtJylcblx0XHRcdHx8IGhhc0ZsYWcoJ2NvbG9yPWZ1bGwnKVxuXHRcdFx0fHwgaGFzRmxhZygnY29sb3I9dHJ1ZWNvbG9yJykpIHtcblx0XHRcdHJldHVybiAzO1xuXHRcdH1cblxuXHRcdGlmIChoYXNGbGFnKCdjb2xvcj0yNTYnKSkge1xuXHRcdFx0cmV0dXJuIDI7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2hlY2sgZm9yIEF6dXJlIERldk9wcyBwaXBlbGluZXMuXG5cdC8vIEhhcyB0byBiZSBhYm92ZSB0aGUgYCFzdHJlYW1Jc1RUWWAgY2hlY2suXG5cdGlmICgnVEZfQlVJTEQnIGluIGVudiAmJiAnQUdFTlRfTkFNRScgaW4gZW52KSB7XG5cdFx0cmV0dXJuIDE7XG5cdH1cblxuXHRpZiAoaGF2ZVN0cmVhbSAmJiAhc3RyZWFtSXNUVFkgJiYgZm9yY2VDb2xvciA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIDA7XG5cdH1cblxuXHRjb25zdCBtaW4gPSBmb3JjZUNvbG9yIHx8IDA7XG5cblx0aWYgKGVudi5URVJNID09PSAnZHVtYicpIHtcblx0XHRyZXR1cm4gbWluO1xuXHR9XG5cblx0aWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcblx0XHQvLyBXaW5kb3dzIDEwIGJ1aWxkIDEwNTg2IGlzIHRoZSBmaXJzdCBXaW5kb3dzIHJlbGVhc2UgdGhhdCBzdXBwb3J0cyAyNTYgY29sb3JzLlxuXHRcdC8vIFdpbmRvd3MgMTAgYnVpbGQgMTQ5MzEgaXMgdGhlIGZpcnN0IHJlbGVhc2UgdGhhdCBzdXBwb3J0cyAxNm0vVHJ1ZUNvbG9yLlxuXHRcdGNvbnN0IG9zUmVsZWFzZSA9IG9zLnJlbGVhc2UoKS5zcGxpdCgnLicpO1xuXHRcdGlmIChcblx0XHRcdE51bWJlcihvc1JlbGVhc2VbMF0pID49IDEwXG5cdFx0XHQmJiBOdW1iZXIob3NSZWxlYXNlWzJdKSA+PSAxMF81ODZcblx0XHQpIHtcblx0XHRcdHJldHVybiBOdW1iZXIob3NSZWxlYXNlWzJdKSA+PSAxNF85MzEgPyAzIDogMjtcblx0XHR9XG5cblx0XHRyZXR1cm4gMTtcblx0fVxuXG5cdGlmICgnQ0knIGluIGVudikge1xuXHRcdGlmICgnR0lUSFVCX0FDVElPTlMnIGluIGVudiB8fCAnR0lURUFfQUNUSU9OUycgaW4gZW52KSB7XG5cdFx0XHRyZXR1cm4gMztcblx0XHR9XG5cblx0XHRpZiAoWydUUkFWSVMnLCAnQ0lSQ0xFQ0knLCAnQVBQVkVZT1InLCAnR0lUTEFCX0NJJywgJ0JVSUxES0lURScsICdEUk9ORSddLnNvbWUoc2lnbiA9PiBzaWduIGluIGVudikgfHwgZW52LkNJX05BTUUgPT09ICdjb2Rlc2hpcCcpIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH1cblxuXHRcdHJldHVybiBtaW47XG5cdH1cblxuXHRpZiAoJ1RFQU1DSVRZX1ZFUlNJT04nIGluIGVudikge1xuXHRcdHJldHVybiAvXig5XFwuKDAqWzEtOV1cXGQqKVxcLnxcXGR7Mix9XFwuKS8udGVzdChlbnYuVEVBTUNJVFlfVkVSU0lPTikgPyAxIDogMDtcblx0fVxuXG5cdGlmIChlbnYuQ09MT1JURVJNID09PSAndHJ1ZWNvbG9yJykge1xuXHRcdHJldHVybiAzO1xuXHR9XG5cblx0aWYgKGVudi5URVJNID09PSAneHRlcm0ta2l0dHknKSB7XG5cdFx0cmV0dXJuIDM7XG5cdH1cblxuXHRpZiAoJ1RFUk1fUFJPR1JBTScgaW4gZW52KSB7XG5cdFx0Y29uc3QgdmVyc2lvbiA9IE51bWJlci5wYXJzZUludCgoZW52LlRFUk1fUFJPR1JBTV9WRVJTSU9OIHx8ICcnKS5zcGxpdCgnLicpWzBdLCAxMCk7XG5cblx0XHRzd2l0Y2ggKGVudi5URVJNX1BST0dSQU0pIHtcblx0XHRcdGNhc2UgJ2lUZXJtLmFwcCc6IHtcblx0XHRcdFx0cmV0dXJuIHZlcnNpb24gPj0gMyA/IDMgOiAyO1xuXHRcdFx0fVxuXG5cdFx0XHRjYXNlICdBcHBsZV9UZXJtaW5hbCc6IHtcblx0XHRcdFx0cmV0dXJuIDI7XG5cdFx0XHR9XG5cdFx0XHQvLyBObyBkZWZhdWx0XG5cdFx0fVxuXHR9XG5cblx0aWYgKC8tMjU2KGNvbG9yKT8kL2kudGVzdChlbnYuVEVSTSkpIHtcblx0XHRyZXR1cm4gMjtcblx0fVxuXG5cdGlmICgvXnNjcmVlbnxeeHRlcm18XnZ0MTAwfF52dDIyMHxecnh2dHxjb2xvcnxhbnNpfGN5Z3dpbnxsaW51eC9pLnRlc3QoZW52LlRFUk0pKSB7XG5cdFx0cmV0dXJuIDE7XG5cdH1cblxuXHRpZiAoJ0NPTE9SVEVSTScgaW4gZW52KSB7XG5cdFx0cmV0dXJuIDE7XG5cdH1cblxuXHRyZXR1cm4gbWluO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3VwcG9ydHNDb2xvcihzdHJlYW0sIG9wdGlvbnMgPSB7fSkge1xuXHRjb25zdCBsZXZlbCA9IF9zdXBwb3J0c0NvbG9yKHN0cmVhbSwge1xuXHRcdHN0cmVhbUlzVFRZOiBzdHJlYW0gJiYgc3RyZWFtLmlzVFRZLFxuXHRcdC4uLm9wdGlvbnMsXG5cdH0pO1xuXG5cdHJldHVybiB0cmFuc2xhdGVMZXZlbChsZXZlbCk7XG59XG5cbmNvbnN0IHN1cHBvcnRzQ29sb3IgPSB7XG5cdHN0ZG91dDogY3JlYXRlU3VwcG9ydHNDb2xvcih7aXNUVFk6IHR0eS5pc2F0dHkoMSl9KSxcblx0c3RkZXJyOiBjcmVhdGVTdXBwb3J0c0NvbG9yKHtpc1RUWTogdHR5LmlzYXR0eSgyKX0pLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgc3VwcG9ydHNDb2xvcjtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvc2VydmVyMi50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
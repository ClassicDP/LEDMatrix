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
    constructor(width, height, framesPerSecond, framesPerGroup, startTime, matrixStyles = {}) {
        this.elementIdCounter = 0;
        this.elements = [];
        this.width = width;
        this.height = height;
        this.framesPerSecond = framesPerSecond;
        this.framesPerGroup = framesPerGroup;
        this.startTime = startTime;
        this.lastEndTime = startTime;
        this.matrixStyles = matrixStyles; // Сохраняем переданные стили
    }
    generateElementId() {
        return `element-${this.elementIdCounter++}`;
    }
    setStartTime(newStartTime) {
        this.startTime = newStartTime;
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
        // Применяем стили к контейнеру матрицы
        Object.assign(container.style, this.matrixStyles);
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
                Object.assign(frame.style, this.matrixStyles);
                container.appendChild(frame);
            }
            frame.style.top = `${i * this.height}px`;
            // Применяем стили к каждому фрейму
            Object.assign(frame.style, this.matrixStyles);
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
        this.textWidth = width;
        this.height = height;
        this.modifiers = [];
        this.textStyle = {};
        this.additionalStyles = {}; // Инициализация нового поля
    }
    calculateTextWidth1() {
        const tempDiv = document.createElement('div');
        // Применяем стили через Object.assign
        Object.assign(tempDiv.style, this.textStyle, this.additionalStyles);
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.whiteSpace = 'nowrap';
        tempDiv.style.overflow = 'visible';
        tempDiv.innerText = this.content; // Добавляем текст для которого нужно вычислить ширину
        document.body.appendChild(tempDiv); // Добавляем элемент в DOM для вычисления его ширины
        const width = tempDiv.scrollWidth; // Получаем реальную ширину текста
        document.body.removeChild(tempDiv); // Удаляем временный элемент
        console.log(width);
        return width; // Возвращаем ширину текста
    }
    setText(newText) {
        this.content = newText;
    }
    updateTextStyle(newStyles) {
        Object.assign(this.textStyle, newStyles);
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
        div.style.height = `${this.height}px`;
        div.style.overflow = 'visible';
        div.style.whiteSpace = 'nowrap';
        // div.style.overflow = 'hidden';
        // Применяем основные стили и дополнительные стили
        Object.assign(div.style, this.textStyle, this.additionalStyles);
        if (typeof this.content === 'string') {
            div.innerText = this.content;
        }
        else if (this.content instanceof HTMLImageElement || this.content instanceof SVGElement) {
            div.innerHTML = ''; // Очистка перед добавлением
            div.appendChild(this.content);
        }
        console.log(div.scrollWidth, this.x);
        div.style.width = `${div.scrollWidth}px`;
        this.textWidth = div.scrollWidth;
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
exports.ShadowEffectModifier = exports.ScaleModifier = exports.BlinkModifier = exports.ScrollingTextModifier = exports.RainbowEffectModifier = exports.RotationModifier = exports.DynamicModifier = void 0;
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
class ShadowEffectModifier extends DynamicModifier {
    constructor(element, blur = 0, shadowCount = 1) {
        super(element);
        this.blur = blur;
        this.shadowCount = shadowCount;
    }
    apply(timestamp) {
        const shadows = [];
        // Получаем текущий цвет текста на момент анимации
        const currentColor = this.getTextColor(this.element);
        // Применяем прозрачность через rgba без лишних преобразований
        const shadowColorWithOpacity = this.convertToRgba(currentColor, 0.3); // Добавляем прозрачность
        // Создаём несколько теней с использованием текущего цвета
        for (let i = 1; i <= this.shadowCount; i++) {
            const xOffset = i; // Смещение по X
            const yOffset = i; // Смещение по Y
            shadows.push(`${xOffset}px ${yOffset}px ${this.blur}px ${shadowColorWithOpacity}`);
        }
        // Применяем тени к элементу
        this.element.updateAdditionalStyles({
            textShadow: shadows.join(', ')
        });
    }
    // Функция для преобразования текущего цвета в формат rgba
    convertToRgba(color, opacity) {
        if (color.startsWith('rgb')) {
            return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
        }
        else if (color.startsWith('hsl')) {
            return this.hslStringToRgba(color, opacity);
        }
        return color; // Если это не rgb или hsl, возвращаем как есть
    }
    // Преобразование HSL в RGBA
    hslStringToRgba(hsl, opacity) {
        const hslValues = hsl.match(/\d+/g).map(Number);
        const h = hslValues[0];
        const s = hslValues[1] / 100;
        const l = hslValues[2] / 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) {
            r = c;
            g = x;
            b = 0;
        }
        else if (60 <= h && h < 120) {
            r = x;
            g = c;
            b = 0;
        }
        else if (120 <= h && h < 180) {
            r = 0;
            g = c;
            b = x;
        }
        else if (180 <= h && h < 240) {
            r = 0;
            g = x;
            b = c;
        }
        else if (240 <= h && h < 300) {
            r = x;
            g = 0;
            b = c;
        }
        else if (300 <= h && h < 360) {
            r = c;
            g = 0;
            b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    getTextColor(element) {
        return element.textStyle.color || '#ffffff'; // Если цвет не задан, используется белый
    }
}
exports.ShadowEffectModifier = ShadowEffectModifier;


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
        Matrix_1.Matrix, MatrixElement_1.MatrixElement, MatrixElement_1.TimeMatrixElement, Modifiers_1.ScrollingTextModifier, Modifiers_1.ScaleModifier, Modifiers_1.RainbowEffectModifier, Modifiers_1.ShadowEffectModifier
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUcsRUFBRSxDQUFDO1lBQzVCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDO2FBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUM3QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEIsQ0FBQzthQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDN0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLENBQUM7YUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQzdCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDO2FBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUM3QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUVELENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcs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O0FBRUE7QUFDQSw4QkFBOEIsT0FBTyw0Q0FBVSxJQUFJO0FBQ25ELDhCQUE4QixPQUFPLDRDQUFVLElBQUk7QUFDbkQ7O0FBRUEsaUVBQWUsYUFBYSxFQUFDOzs7Ozs7O1VDckw3QjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7VUVOQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL3NlcmRlLXRzL2Rpc3QvU2VyRGUuanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvc2VyZGUtdHMvZGlzdC9pbmRleC5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L3NyYy9NYXRyaXgvc3JjL0ZyYW1lR3JvdXAudHMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9zcmMvTWF0cml4L3NyYy9NYXRyaXgudHMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9zcmMvTWF0cml4L3NyYy9NYXRyaXhFbGVtZW50LnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL01hdHJpeC9zcmMvTW9kaWZpZXJzLnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL3NlcnZlci9zcmMvUG9pbnRUcmFja2VyLnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvc3JjL3NlcnZlci9zcmMvbXV0ZXgudHMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9zcmMvc2VydmVyL3NyYy9zZXJ2ZXIyLnRzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL3dvcmtlci10aHJlYWRzLW1hbmFnZXIvZGlzdC9zcmMvV29ya2VyQ29udHJvbGxlci5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy93b3JrZXItdGhyZWFkcy1tYW5hZ2VyL2Rpc3Qvc3JjL1dvcmtlck1hbmFnZXIuanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvd29ya2VyLXRocmVhZHMtbWFuYWdlci9kaXN0L3NyYy9pbmRleC5qcyIsImZpbGU6Ly8vZXh0ZXJuYWwgY29tbW9uanMgXCJ3c1wiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwibm9kZTpvc1wiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwibm9kZTpwcm9jZXNzXCIiLCJmaWxlOi8vL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJub2RlOnR0eVwiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwicGF0aFwiIiwiZmlsZTovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwid29ya2VyX3RocmVhZHNcIiIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9jaGFsay9zb3VyY2UvaW5kZXguanMiLCJmaWxlOi8vLy9Vc2Vycy9kcC9XZWJzdG9ybVByb2plY3RzL0xlZE1hdHJpeC9ub2RlX21vZHVsZXMvY2hhbGsvc291cmNlL3V0aWxpdGllcy5qcyIsImZpbGU6Ly8vL1VzZXJzL2RwL1dlYnN0b3JtUHJvamVjdHMvTGVkTWF0cml4L25vZGVfbW9kdWxlcy9jaGFsay9zb3VyY2UvdmVuZG9yL2Fuc2ktc3R5bGVzL2luZGV4LmpzIiwiZmlsZTovLy8vVXNlcnMvZHAvV2Vic3Rvcm1Qcm9qZWN0cy9MZWRNYXRyaXgvbm9kZV9tb2R1bGVzL2NoYWxrL3NvdXJjZS92ZW5kb3Ivc3VwcG9ydHMtY29sb3IvaW5kZXguanMiLCJmaWxlOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwiZmlsZTovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJmaWxlOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJmaWxlOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJmaWxlOi8vL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJmaWxlOi8vL3dlYnBhY2svc3RhcnR1cCIsImZpbGU6Ly8vd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TZXJEZSA9IHZvaWQgMDtcbi8vIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIGEgZ2l2ZW4gZnVuY3Rpb24gaXMgYSBjbGFzcyBjb25zdHJ1Y3RvclxuZnVuY3Rpb24gaXNDbGFzcyhmdW5jKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBmdW5jID09PSAnZnVuY3Rpb24nICYmIC9eXFxzKmNsYXNzXFxzKy8udGVzdChmdW5jLnRvU3RyaW5nKCkpO1xufVxuY2xhc3MgU2VyRGUge1xuICAgIC8vIE1ldGhvZCB0byBoYW5kbGUgc2ltcGxlIHR5cGVzIGRpcmVjdGx5XG4gICAgc3RhdGljIGZyb21TaW1wbGUob2JqKSB7XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBEYXRlIHx8IHR5cGVvZiBvYmogPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBvYmogPT09ICdudW1iZXInIHx8IHR5cGVvZiBvYmogPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvLyBNZXRob2QgdG8gc2V0IGV4Y2x1c2l2ZSBjbGFzc2VzIGZvciBzZXJpYWxpemF0aW9uXG4gICAgc3RhdGljIHNldEV4Y2x1c2l2ZWx5KGxpc3QpIHtcbiAgICAgICAgU2VyRGUub25seSA9IG5ldyBTZXQoWy4uLmxpc3QsIEFycmF5LCBNYXAsIFNldF0pO1xuICAgIH1cbiAgICAvLyBNYWluIHNlcmlhbGl6YXRpb24gbWV0aG9kXG4gICAgc3RhdGljIHNlcmlhbGlzZShvYmosIHZpc2l0ZWQgPSBuZXcgTWFwKCksIF9tYXAgPSBuZXcgTWFwKCksIGRlcHRoID0gMCwgcGFyZW50KSB7XG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2U7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJyB8fCBvYmogPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAvLyBJZiB0aGUgb2JqZWN0IGlzIGEgY2xhc3MgYW5kIGlzIG5vdCBpbiB0aGUgZXhjbHVzaXZlIGxpc3QsIHNraXAgc2VyaWFsaXphdGlvblxuICAgICAgICBpZiAoKChfYSA9IFNlckRlLm9ubHkpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5zaXplKSAmJiBpc0NsYXNzKG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9iai5jb25zdHJ1Y3RvcikgJiYgIVNlckRlLm9ubHkuaGFzKG9iai5jb25zdHJ1Y3RvcikpXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRGF0ZSlcbiAgICAgICAgICAgIHJldHVybiB7IHQ6ICdEYXRlJywgdjogb2JqLnZhbHVlT2YoKSB9O1xuICAgICAgICBsZXQgbWF5YmVTaW1wbGUgPSBTZXJEZS5mcm9tU2ltcGxlKG9iaik7XG4gICAgICAgIGlmIChtYXliZVNpbXBsZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgcmV0dXJuIG1heWJlU2ltcGxlO1xuICAgICAgICBpZiAodmlzaXRlZC5oYXMob2JqKSkge1xuICAgICAgICAgICAgdmlzaXRlZC5nZXQob2JqKS50aW1lcysrO1xuICAgICAgICAgICAgcmV0dXJuIHsgdDogKF9iID0gb2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLmNvbnN0cnVjdG9yKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IubmFtZSwgdjogeyBfbWFwSWQ6IFNlckRlLndlYWtNYXAuZ2V0KG9iaikgfSB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgICAgICAgIHJldHVybiB7IHQ6ICdmdW5jdGlvbicsIHY6IG9iai5uYW1lIH07XG4gICAgICAgIGlmIChwYXJlbnQpXG4gICAgICAgICAgICB2aXNpdGVkLnNldChvYmosIHsgdGltZXM6IDEsIHBhcmVudCB9KTtcbiAgICAgICAgbGV0IGlkID0gKF9jID0gU2VyRGUud2Vha01hcC5nZXQob2JqKSkgIT09IG51bGwgJiYgX2MgIT09IHZvaWQgMCA/IF9jIDogU2VyRGUuaWQrKztcbiAgICAgICAgU2VyRGUud2Vha01hcC5zZXQob2JqLCBpZCk7XG4gICAgICAgIC8vIEhhbmRsZSBNYXAgb2JqZWN0c1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBsZXQgc2VyaWFsaXNlZCA9IG5ldyBBcnJheShvYmouc2l6ZSk7XG4gICAgICAgICAgICBfbWFwLnNldChpZCwgc2VyaWFsaXNlZCk7XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICBvYmouZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHNlcmlhbGlzZWRbaV0gPSBbXG4gICAgICAgICAgICAgICAgICAgIFNlckRlLnNlcmlhbGlzZShrZXksIHZpc2l0ZWQsIF9tYXAsIGRlcHRoICsgMSwgeyBvYmo6IHNlcmlhbGlzZWQsIGtleTogW2ksIDBdIH0pLFxuICAgICAgICAgICAgICAgICAgICBTZXJEZS5zZXJpYWxpc2UodmFsdWUsIHZpc2l0ZWQsIF9tYXAsIGRlcHRoICsgMSwgeyBvYmo6IHNlcmlhbGlzZWQsIGtleTogW2ksIDFdIH0pLFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4geyB0OiBvYmouY29uc3RydWN0b3IubmFtZSwgdjogc2VyaWFsaXNlZCB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEhhbmRsZSBTZXQgYW5kIEFycmF5IG9iamVjdHNcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFNldCB8fCBvYmogaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgbGV0IHNlcmlhbGlzZWQgPSBBcnJheShvYmogaW5zdGFuY2VvZiBTZXQgPyBvYmouc2l6ZSA6IG9iai5sZW5ndGgpO1xuICAgICAgICAgICAgX21hcC5zZXQoaWQsIHNlcmlhbGlzZWQpO1xuICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgb2JqLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VyaWFsaXNlZFtpXSA9IFNlckRlLnNlcmlhbGlzZSh2YWx1ZSwgdmlzaXRlZCwgX21hcCwgZGVwdGggKyAxLCB7IG9iajogc2VyaWFsaXNlZCwga2V5OiBpIH0pO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgdDogb2JqLmNvbnN0cnVjdG9yLm5hbWUsIHY6IHNlcmlhbGlzZWQgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBIYW5kbGUgZ2VuZXJpYyBvYmplY3RzXG4gICAgICAgIGxldCBzZXJpYWxpc2VkID0ge307XG4gICAgICAgIF9tYXAuc2V0KGlkLCBzZXJpYWxpc2VkKTtcbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9iaikpIHtcbiAgICAgICAgICAgIHNlcmlhbGlzZWRba2V5XSA9IFNlckRlLnNlcmlhbGlzZSh2YWx1ZSwgdmlzaXRlZCwgX21hcCwgZGVwdGggKyAxLCB7IG9iajogc2VyaWFsaXNlZCwga2V5IH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHdlIGFyZSBhdCB0aGUgdG9wIGxldmVsLCBoYW5kbGUgY2lyY3VsYXIgcmVmZXJlbmNlcyBhbmQgbXVsdGlwbGUgaW5zdGFuY2VzXG4gICAgICAgIGlmIChkZXB0aCA9PT0gMCkge1xuICAgICAgICAgICAgbGV0IHJlY3Vyc2lvblZpc2l0ZWQgPSBBcnJheS5mcm9tKHZpc2l0ZWQpXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoW18sIHZhbF0pID0+IHZhbC50aW1lcyA+IDEpXG4gICAgICAgICAgICAgICAgLm1hcCgoW29iaiwgdmFsXSkgPT4gW1NlckRlLndlYWtNYXAuZ2V0KG9iaiksIHZhbF0pOyAvLyBFeHBsaWNpdGx5IGNhc3QgaWQgdG8gbnVtYmVyXG4gICAgICAgICAgICByZWN1cnNpb25WaXNpdGVkLmZvckVhY2goKFtpZCwgdmFsXSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh2YWwucGFyZW50LmtleSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAgICAgdmFsLnBhcmVudC5vYmpbdmFsLnBhcmVudC5rZXlbMF1dW3ZhbC5wYXJlbnQua2V5WzFdXS52ID0geyBfbWFwSWQ6IGlkIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5wYXJlbnQub2JqW3ZhbC5wYXJlbnQua2V5XS52ID0geyBfbWFwSWQ6IGlkIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBBdHRhY2ggdGhlIF9tYXAgZm9yIHNlcmlhbGl6YXRpb24gcmVzdWx0XG4gICAgICAgICAgICByZXR1cm4geyB0OiAoX2QgPSBvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmouY29uc3RydWN0b3IpID09PSBudWxsIHx8IF9kID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZC5uYW1lLCB2OiBzZXJpYWxpc2VkLCBfbWFwOiByZWN1cnNpb25WaXNpdGVkLm1hcCgoeCkgPT4gW3hbMF0sIF9tYXAuZ2V0KHhbMF0pXSkgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB0OiAoX2UgPSBvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmouY29uc3RydWN0b3IpID09PSBudWxsIHx8IF9lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZS5uYW1lLCB2OiBzZXJpYWxpc2VkIH07XG4gICAgfVxuICAgIC8vIE1haW4gZGVzZXJpYWxpemF0aW9uIG1ldGhvZFxuICAgIHN0YXRpYyBkZXNlcmlhbGl6ZShvYmopIHtcbiAgICAgICAgdmFyIF9hLCBfYiwgX2MsIF9kLCBfZSwgX2YsIF9nLCBfaCwgX2osIF9rLCBfbDtcbiAgICAgICAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIGlmICgob2JqID09PSBudWxsIHx8IG9iaiA9PT0gdm9pZCAwID8gdm9pZCAwIDogb2JqLnQpID09PSAnRGF0ZScpXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUob2JqLnYpO1xuICAgICAgICAvLyBJZiBvYmogaXMgYSBwcmltaXRpdmUsIHJldHVybiBpdCBkaXJlY3RseSAod2l0aCBEYXRlIGhhbmRsaW5nKVxuICAgICAgICBpZiAoU2VyRGUuaXNQcmltaXRpdmUob2JqKSkge1xuICAgICAgICAgICAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIERhdGUgPyBuZXcgRGF0ZShvYmopIDogb2JqO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvYmoudCA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIHJldHVybiAoX2EgPSBTZXJEZS5jbGFzc1JlZ2lzdHJ5LmdldChvYmoudikpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IHt9O1xuICAgICAgICAvLyBIYW5kbGVzIHRoZSByZXN0b3JhdGlvbiBvZiBfbWFwIGZvciBvYmplY3QgcmVmZXJlbmNlcyBpZiBpdCBleGlzdHNcbiAgICAgICAgaWYgKG9iai5fbWFwKSB7XG4gICAgICAgICAgICBTZXJEZS5fbWFwID0gbmV3IE1hcChvYmouX21hcCk7XG4gICAgICAgICAgICBTZXJEZS5fdGVtcE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXRyaWV2ZSB0aGUgY2xhc3MgY29uc3RydWN0b3IgaWYgYXZhaWxhYmxlXG4gICAgICAgIGNvbnN0IGNsYXNzQ29uc3RydWN0b3IgPSBTZXJEZS5jbGFzc1JlZ2lzdHJ5LmdldChvYmoudCk7XG4gICAgICAgIGxldCBpbnN0YW5jZTtcbiAgICAgICAgaWYgKCgoX2IgPSBvYmoudikgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLl9tYXBJZCkgJiYgKChfYyA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2MuaGFzKG9iai52Ll9tYXBJZCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gKF9kID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9kID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZC5nZXQob2JqLnYuX21hcElkKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGluc3RhbmNlID0gY2xhc3NDb25zdHJ1Y3RvciA/IE9iamVjdC5jcmVhdGUoY2xhc3NDb25zdHJ1Y3Rvci5wcm90b3R5cGUpIDoge307XG4gICAgICAgICAgICAoX2UgPSBTZXJEZS5fdGVtcE1hcCkgPT09IG51bGwgfHwgX2UgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9lLnNldChvYmoudi5fbWFwSWQsIGluc3RhbmNlKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbmVzdGVkID0gKF9oID0gKF9mID0gU2VyRGUuX21hcCkgPT09IG51bGwgfHwgX2YgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9mLmdldCgoX2cgPSBvYmoudikgPT09IG51bGwgfHwgX2cgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9nLl9tYXBJZCkpICE9PSBudWxsICYmIF9oICE9PSB2b2lkIDAgPyBfaCA6IG9iai52O1xuICAgICAgICAvLyBEZXNlcmlhbGl6ZSBiYXNlZCBvbiB0aGUgdHlwZSBvZiBvYmplY3RcbiAgICAgICAgc3dpdGNoIChvYmoudCkge1xuICAgICAgICAgICAgY2FzZSAnQXJyYXknOiAvLyBIYW5kbGUgYXJyYXlzXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXN0ZWQubWFwKChpdGVtKSA9PiBTZXJEZS5kZXNlcmlhbGl6ZShpdGVtKSk7XG4gICAgICAgICAgICAgICAgKF9qID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9qID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfai5zZXQob2JqLnYuX21hcElkLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICAgICAgY2FzZSAnTWFwJzogLy8gSGFuZGxlIG1hcHNcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBNYXAobmVzdGVkLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBbU2VyRGUuZGVzZXJpYWxpemUoa2V5KSwgU2VyRGUuZGVzZXJpYWxpemUodmFsdWUpXSkpO1xuICAgICAgICAgICAgICAgIChfayA9IFNlckRlLl90ZW1wTWFwKSA9PT0gbnVsbCB8fCBfayA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2suc2V0KG9iai52Ll9tYXBJZCwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgICAgIGNhc2UgJ1NldCc6IC8vIEhhbmRsZSBzZXRzXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgU2V0KG5lc3RlZC5tYXAoKGl0ZW0pID0+IFNlckRlLmRlc2VyaWFsaXplKGl0ZW0pKSk7XG4gICAgICAgICAgICAgICAgKF9sID0gU2VyRGUuX3RlbXBNYXApID09PSBudWxsIHx8IF9sID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfbC5zZXQob2JqLnYuX21hcElkLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICAgICAgZGVmYXVsdDogLy8gSGFuZGxlIG9iamVjdHNcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhuZXN0ZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW2tleV0gPSBTZXJEZS5kZXNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjbGFzc0NvbnN0cnVjdG9yICYmIFNlckRlLmluaXRGdW5jTmFtZSAmJiB0eXBlb2YgaW5zdGFuY2VbU2VyRGUuaW5pdEZ1bmNOYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtTZXJEZS5pbml0RnVuY05hbWVdKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIENsZWFyIHRoZSBfbWFwIGFmdGVyIGRlc2VyaWFsaXphdGlvbiBpcyBjb21wbGV0ZSB0byBmcmVlIG1lbW9yeVxuICAgICAgICBpZiAob2JqLl9tYXApIHtcbiAgICAgICAgICAgIFNlckRlLl9tYXAgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBTZXJEZS5fdGVtcE1hcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7IC8vIFJldHVybiB0aGUgZGVzZXJpYWxpemVkIGluc3RhbmNlXG4gICAgfVxuICAgIC8vIE1ldGhvZCB0byByZWdpc3RlciBjbGFzc2VzIGZvciBkZXNlcmlhbGl6YXRpb25cbiAgICBzdGF0aWMgY2xhc3NSZWdpc3RyYXRpb24oY2xhc3Nlcykge1xuICAgICAgICBjbGFzc2VzLmZvckVhY2goKHgpID0+IFNlckRlLmNsYXNzUmVnaXN0cnkuc2V0KHgubmFtZSwgeCkpO1xuICAgIH1cbiAgICAvLyBIZWxwZXIgbWV0aG9kIHRvIGNoZWNrIGlmIGEgdmFsdWUgaXMgcHJpbWl0aXZlXG4gICAgc3RhdGljIGlzUHJpbWl0aXZlKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiAodmFsdWUgPT09IG51bGwgfHxcbiAgICAgICAgICAgIFsnbnVtYmVyJywgJ3N0cmluZycsICdib29sZWFuJywgJ3VuZGVmaW5lZCcsICdzeW1ib2wnLCAnYmlnaW50J10uaW5jbHVkZXModHlwZW9mIHZhbHVlKSB8fFxuICAgICAgICAgICAgdmFsdWUgaW5zdGFuY2VvZiBEYXRlKTtcbiAgICB9XG59XG5leHBvcnRzLlNlckRlID0gU2VyRGU7XG5TZXJEZS5pbml0RnVuY05hbWUgPSAnX2luaXRGbic7IC8vIE5hbWUgb2YgdGhlIGluaXRpYWxpemF0aW9uIGZ1bmN0aW9uIChpZiBleGlzdHMpXG5TZXJEZS5pZCA9IDA7IC8vIFVuaXF1ZSBJRCBjb3VudGVyIGZvciBvYmplY3RzXG5TZXJEZS53ZWFrTWFwID0gbmV3IFdlYWtNYXAoKTsgLy8gV2Vha01hcCB0byB0cmFjayBvYmplY3RzIGR1cmluZyBzZXJpYWxpemF0aW9uXG5TZXJEZS5jbGFzc1JlZ2lzdHJ5ID0gbmV3IE1hcChbXG4gICAgWydBcnJheScsIEFycmF5XSxcbiAgICBbJ1NldCcsIFNldF0sXG4gICAgWydNYXAnLCBNYXBdLFxuXSk7IC8vIFJlZ2lzdHJ5IG9mIGNsYXNzZXMgZm9yIGRlc2VyaWFsaXphdGlvblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHBvcnRzLCBwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIHNyYy9pbmRleC50c1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL1NlckRlXCIpLCBleHBvcnRzKTtcbiIsImV4cG9ydCBjbGFzcyBGcmFtZUdyb3VwIHtcbiAgICBzdGFydFRpbWU6IG51bWJlcjtcbiAgICBmcmFtZUludGVydmFsOiBudW1iZXI7XG4gICAgZnJhbWVDb3VudDogbnVtYmVyO1xuICAgIGZyYW1lc1BlclNlY29uZDogbnVtYmVyO1xuICAgIGZyYW1lUG9zaXRpb25zOiBudW1iZXJbXTtcbiAgICB0b3RhbEhlaWdodDogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihzdGFydFRpbWU6IG51bWJlciwgZnJhbWVJbnRlcnZhbDogbnVtYmVyLCBmcmFtZUNvdW50OiBudW1iZXIsIGZyYW1lc1BlclNlY29uZDogbnVtYmVyLCBmcmFtZVBvc2l0aW9uczogbnVtYmVyW10sIHRvdGFsSGVpZ2h0OiBudW1iZXIsIHdpZHRoOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBzdGFydFRpbWU7XG4gICAgICAgIHRoaXMuZnJhbWVJbnRlcnZhbCA9IGZyYW1lSW50ZXJ2YWw7XG4gICAgICAgIHRoaXMuZnJhbWVDb3VudCA9IGZyYW1lQ291bnQ7XG4gICAgICAgIHRoaXMuZnJhbWVzUGVyU2Vjb25kID0gZnJhbWVzUGVyU2Vjb25kO1xuICAgICAgICB0aGlzLmZyYW1lUG9zaXRpb25zID0gZnJhbWVQb3NpdGlvbnM7XG4gICAgICAgIHRoaXMudG90YWxIZWlnaHQgPSB0b3RhbEhlaWdodDtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIH1cbn1cbiIsImltcG9ydCB7TWF0cml4RWxlbWVudH0gZnJvbSBcIi4vTWF0cml4RWxlbWVudFwiO1xuaW1wb3J0IHtGcmFtZUdyb3VwfSBmcm9tIFwiLi9GcmFtZUdyb3VwXCI7XG5cbmV4cG9ydCBjbGFzcyBNYXRyaXgge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgZnJhbWVzUGVyU2Vjb25kOiBudW1iZXI7XG4gICAgZnJhbWVzUGVyR3JvdXA6IG51bWJlcjtcbiAgICBzdGFydFRpbWU6IG51bWJlcjtcbiAgICBsYXN0RW5kVGltZTogbnVtYmVyO1xuICAgIHByaXZhdGUgZWxlbWVudElkQ291bnRlcjogbnVtYmVyID0gMDtcbiAgICBwdWJsaWMgZWxlbWVudHM6IE1hdHJpeEVsZW1lbnRbXSA9IFtdO1xuICAgIHByaXZhdGUgbWF0cml4U3R5bGVzOiBQYXJ0aWFsPENTU1N0eWxlRGVjbGFyYXRpb24+OyAvLyDQlNC+0LHQsNCy0LvRj9C10Lwg0YHQstC+0LnRgdGC0LLQviDQtNC70Y8g0YXRgNCw0L3QtdC90LjRjyDRgdGC0LjQu9C10LlcblxuICAgIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBmcmFtZXNQZXJTZWNvbmQ6IG51bWJlciwgZnJhbWVzUGVyR3JvdXA6IG51bWJlciwgc3RhcnRUaW1lOiBudW1iZXIsIG1hdHJpeFN0eWxlczogUGFydGlhbDxDU1NTdHlsZURlY2xhcmF0aW9uPiA9IHt9KSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuZnJhbWVzUGVyU2Vjb25kID0gZnJhbWVzUGVyU2Vjb25kO1xuICAgICAgICB0aGlzLmZyYW1lc1Blckdyb3VwID0gZnJhbWVzUGVyR3JvdXA7XG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gc3RhcnRUaW1lO1xuICAgICAgICB0aGlzLmxhc3RFbmRUaW1lID0gc3RhcnRUaW1lO1xuICAgICAgICB0aGlzLm1hdHJpeFN0eWxlcyA9IG1hdHJpeFN0eWxlczsgLy8g0KHQvtGF0YDQsNC90Y/QtdC8INC/0LXRgNC10LTQsNC90L3Ri9C1INGB0YLQuNC70LhcbiAgICB9XG5cbiAgICBnZW5lcmF0ZUVsZW1lbnRJZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYGVsZW1lbnQtJHt0aGlzLmVsZW1lbnRJZENvdW50ZXIrK31gO1xuICAgIH1cblxuICAgIHNldFN0YXJ0VGltZShuZXdTdGFydFRpbWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IG5ld1N0YXJ0VGltZTtcbiAgICAgICAgdGhpcy5sYXN0RW5kVGltZSA9IG5ld1N0YXJ0VGltZTtcbiAgICB9XG5cbiAgICBnZW5lcmF0ZU5leHRHcm91cChjb250YWluZXI6IEhUTUxFbGVtZW50LCBtYXRyaXhFbGVtZW50czogTWF0cml4RWxlbWVudFtdKTogRnJhbWVHcm91cCB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nRnJhbWVzID0gQXJyYXkuZnJvbShjb250YWluZXIuY2hpbGRyZW4pIGFzIEhUTUxFbGVtZW50W107XG4gICAgICAgIGNvbnN0IGZyYW1lSW50ZXJ2YWwgPSAxMDAwIC8gdGhpcy5mcmFtZXNQZXJTZWNvbmQ7XG4gICAgICAgIGNvbnN0IGZyYW1lQ291bnQgPSB0aGlzLmZyYW1lc1Blckdyb3VwO1xuXG4gICAgICAgIC8vINCd0LDRh9Cw0LvQviDQvdC+0LLQvtC5INCz0YDRg9C/0L/Ri1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSB0aGlzLmxhc3RFbmRUaW1lO1xuICAgICAgICBjb25zdCBmcmFtZVBvc2l0aW9ucyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IGZyYW1lQ291bnQgfSwgKF8sIGkpID0+IHN0YXJ0VGltZSArIGkgKiBmcmFtZUludGVydmFsKTtcbiAgICAgICAgdGhpcy5sYXN0RW5kVGltZSA9IHN0YXJ0VGltZSArIGZyYW1lSW50ZXJ2YWwgKiBmcmFtZUNvdW50O1xuXG4gICAgICAgIC8vINCf0YDQuNC80LXQvdGP0LXQvCDRgdGC0LjQu9C4INC6INC60L7QvdGC0LXQudC90LXRgNGDINC80LDRgtGA0LjRhtGLXG4gICAgICAgIE9iamVjdC5hc3NpZ24oY29udGFpbmVyLnN0eWxlLCB0aGlzLm1hdHJpeFN0eWxlcyk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmFtZUNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGxldCBmcmFtZTogSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgICAgIGlmIChpIDwgZXhpc3RpbmdGcmFtZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8g0JjRgdC/0L7Qu9GM0LfRg9C10Lwg0YHRg9GJ0LXRgdGC0LLRg9GO0YnQuNC5INGN0LvQtdC80LXQvdGCXG4gICAgICAgICAgICAgICAgZnJhbWUgPSBleGlzdGluZ0ZyYW1lc1tpXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g0KHQvtC30LTQsNC10Lwg0L3QvtCy0YvQuSDRjdC70LXQvNC10L3Rgiwg0LXRgdC70Lgg0LXQs9C+INC10YnQtSDQvdC10YJcbiAgICAgICAgICAgICAgICBmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIGZyYW1lLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICAgICAgICBmcmFtZS5zdHlsZS53aWR0aCA9IGAke3RoaXMud2lkdGh9cHhgO1xuICAgICAgICAgICAgICAgIGZyYW1lLnN0eWxlLmhlaWdodCA9IGAke3RoaXMuaGVpZ2h0fXB4YDtcbiAgICAgICAgICAgICAgICBmcmFtZS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZnJhbWUuc3R5bGUsIHRoaXMubWF0cml4U3R5bGVzKVxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmcmFtZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZyYW1lLnN0eWxlLnRvcCA9IGAke2kgKiB0aGlzLmhlaWdodH1weGA7XG5cbiAgICAgICAgICAgIC8vINCf0YDQuNC80LXQvdGP0LXQvCDRgdGC0LjQu9C4INC6INC60LDQttC00L7QvNGDINGE0YDQtdC50LzRg1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihmcmFtZS5zdHlsZSwgdGhpcy5tYXRyaXhTdHlsZXMpO1xuXG4gICAgICAgICAgICAvLyDQntGH0LjRidCw0LXQvCDRgdC+0LTQtdGA0LbQuNC80L7QtSDRhNGA0LXQudC80LAg0L/QtdGA0LXQtCDQtNC+0LHQsNCy0LvQtdC90LjQtdC8INC90L7QstGL0YUg0Y3Qu9C10LzQtdC90YLQvtCyXG4gICAgICAgICAgICBmcmFtZS5pbm5lckhUTUwgPSAnJztcblxuICAgICAgICAgICAgbWF0cml4RWxlbWVudHMuc29ydCgoYSwgYikgPT4gYi5sYXllciAtIGEubGF5ZXIpO1xuXG4gICAgICAgICAgICAvLyDQn9GA0LjQvNC10L3Rj9C10Lwg0LzQvtC00LjRhNC40LrQsNGC0L7RgNGLINC4INGA0LXQvdC00LXRgNC40Lwg0LrQsNC20LTRi9C5INGN0LvQtdC80LXQvdGCINC80LDRgtGA0LjRhtGLXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1hdHJpeEVsZW1lbnQgb2YgbWF0cml4RWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICBtYXRyaXhFbGVtZW50LmFwcGx5TW9kaWZpZXJzKGZyYW1lUG9zaXRpb25zW2ldKTtcbiAgICAgICAgICAgICAgICBtYXRyaXhFbGVtZW50LnJlbmRlclRvKGZyYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vINCj0LTQsNC70Y/QtdC8INC70LjRiNC90LjQtSDRjdC70LXQvNC10L3RgtGLLCDQtdGB0LvQuCDQvtC90Lgg0LXRgdGC0YxcbiAgICAgICAgaWYgKGV4aXN0aW5nRnJhbWVzLmxlbmd0aCA+IGZyYW1lQ291bnQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBleGlzdGluZ0ZyYW1lcy5sZW5ndGggLSAxOyBqID49IGZyYW1lQ291bnQ7IGotLSkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChleGlzdGluZ0ZyYW1lc1tqXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b3RhbEhlaWdodCA9IHRoaXMuaGVpZ2h0ICogZnJhbWVDb3VudDtcbiAgICAgICAgcmV0dXJuIG5ldyBGcmFtZUdyb3VwKHN0YXJ0VGltZSwgZnJhbWVJbnRlcnZhbCwgZnJhbWVDb3VudCwgdGhpcy5mcmFtZXNQZXJTZWNvbmQsIGZyYW1lUG9zaXRpb25zLCB0b3RhbEhlaWdodCwgdGhpcy53aWR0aCk7XG4gICAgfVxuXG4gICAgYWRkRWxlbWVudChtYXRyaXhFbGVtZW50OiBNYXRyaXhFbGVtZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5lbGVtZW50cy5pbmNsdWRlcyhtYXRyaXhFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50cy5wdXNoKG1hdHJpeEVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlRWxlbWVudChtYXRyaXhFbGVtZW50OiBNYXRyaXhFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSB0aGlzLmVsZW1lbnRzLmZpbHRlcih4ID0+IHggIT09IG1hdHJpeEVsZW1lbnQpO1xuICAgIH1cblxuICAgIGNsZWFyRWxlbWVudHMoKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBEeW5hbWljTW9kaWZpZXIgfSBmcm9tIFwiLi9Nb2RpZmllcnNcIjtcbmltcG9ydCB7IE1hdHJpeCB9IGZyb20gXCIuL01hdHJpeFwiO1xuXG5leHBvcnQgY2xhc3MgTWF0cml4RWxlbWVudCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBjb250ZW50OiBzdHJpbmcgfCBIVE1MSW1hZ2VFbGVtZW50IHwgU1ZHRWxlbWVudDtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgdGV4dFdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgbW9kaWZpZXJzOiBEeW5hbWljTW9kaWZpZXJbXTtcbiAgICB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAgICBsYXllciA9IDA7XG4gICAgdGV4dFVwZGF0ZUNhbGxiYWNrPzogKHRpbWVzdGFtcDogbnVtYmVyKSA9PiBzdHJpbmc7XG4gICAgdGV4dFN0eWxlOiBQYXJ0aWFsPENTU1N0eWxlRGVjbGFyYXRpb24+O1xuICAgIGFkZGl0aW9uYWxTdHlsZXM6IFBhcnRpYWw8Q1NTU3R5bGVEZWNsYXJhdGlvbj47ICAvLyDQndC+0LLQvtC1INC/0L7Qu9C1INC00LvRjyDQtNC+0L/QvtC70L3QuNGC0LXQu9GM0L3Ri9GFINGB0YLQuNC70LXQuVxuXG4gICAgY29uc3RydWN0b3IobWF0cml4OiBNYXRyaXgsIGNvbnRlbnQ6IHN0cmluZyB8IEhUTUxJbWFnZUVsZW1lbnQgfCBTVkdFbGVtZW50LCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5pZCA9IG1hdHJpeC5nZW5lcmF0ZUVsZW1lbnRJZCgpO1xuICAgICAgICB0aGlzLmNvbnRlbnQgPSBjb250ZW50O1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMudGV4dFdpZHRoID0gd2lkdGhcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMubW9kaWZpZXJzID0gW107XG4gICAgICAgIHRoaXMudGV4dFN0eWxlID0ge307XG4gICAgICAgIHRoaXMuYWRkaXRpb25hbFN0eWxlcyA9IHt9OyAgLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0L3QvtCy0L7Qs9C+INC/0L7Qu9GPXG5cbiAgICB9XG5cbiAgICBjYWxjdWxhdGVUZXh0V2lkdGgxKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHRlbXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgICAgICAvLyDQn9GA0LjQvNC10L3Rj9C10Lwg0YHRgtC40LvQuCDRh9C10YDQtdC3IE9iamVjdC5hc3NpZ25cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0ZW1wRGl2LnN0eWxlLCB0aGlzLnRleHRTdHlsZSwgdGhpcy5hZGRpdGlvbmFsU3R5bGVzKTtcblxuICAgICAgICB0ZW1wRGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgdGVtcERpdi5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAgIHRlbXBEaXYuc3R5bGUud2hpdGVTcGFjZSA9ICdub3dyYXAnO1xuICAgICAgICB0ZW1wRGl2LnN0eWxlLm92ZXJmbG93ID0gJ3Zpc2libGUnXG5cblxuICAgICAgICB0ZW1wRGl2LmlubmVyVGV4dCA9IHRoaXMuY29udGVudCBhcyBzdHJpbmc7IC8vINCU0L7QsdCw0LLQu9GP0LXQvCDRgtC10LrRgdGCINC00LvRjyDQutC+0YLQvtGA0L7Qs9C+INC90YPQttC90L4g0LLRi9GH0LjRgdC70LjRgtGMINGI0LjRgNC40L3Rg1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGVtcERpdik7IC8vINCU0L7QsdCw0LLQu9GP0LXQvCDRjdC70LXQvNC10L3RgiDQsiBET00g0LTQu9GPINCy0YvRh9C40YHQu9C10L3QuNGPINC10LPQviDRiNC40YDQuNC90YtcblxuICAgICAgICBjb25zdCB3aWR0aCA9IHRlbXBEaXYuc2Nyb2xsV2lkdGg7ICAvLyDQn9C+0LvRg9GH0LDQtdC8INGA0LXQsNC70YzQvdGD0Y4g0YjQuNGA0LjQvdGDINGC0LXQutGB0YLQsFxuXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGVtcERpdik7ICAvLyDQo9C00LDQu9GP0LXQvCDQstGA0LXQvNC10L3QvdGL0Lkg0Y3Qu9C10LzQtdC90YJcbiAgICAgICAgY29uc29sZS5sb2cod2lkdGgpXG5cbiAgICAgICAgcmV0dXJuIHdpZHRoOyAgLy8g0JLQvtC30LLRgNCw0YnQsNC10Lwg0YjQuNGA0LjQvdGDINGC0LXQutGB0YLQsFxuICAgIH1cblxuICAgIHNldFRleHQobmV3VGV4dDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuY29udGVudCA9IG5ld1RleHQ7XG4gICAgfVxuXG4gICAgdXBkYXRlVGV4dFN0eWxlKG5ld1N0eWxlczogUGFydGlhbDxDU1NTdHlsZURlY2xhcmF0aW9uPikge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMudGV4dFN0eWxlLCBuZXdTdHlsZXMpO1xuICAgIH1cblxuICAgIHVwZGF0ZUFkZGl0aW9uYWxTdHlsZXMobmV3U3R5bGVzOiBQYXJ0aWFsPENTU1N0eWxlRGVjbGFyYXRpb24+KSB7ICAvLyDQndC+0LLRi9C5INC80LXRgtC+0LQg0LTQu9GPINC+0LHQvdC+0LLQu9C10L3QuNGPINC00L7Qv9C+0LvQvdC40YLQtdC70YzQvdGL0YUg0YHRgtC40LvQtdC5XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5hZGRpdGlvbmFsU3R5bGVzLCBuZXdTdHlsZXMpO1xuICAgIH1cblxuICAgIHNldFRleHRVcGRhdGVDYWxsYmFjayhjYWxsYmFjazogKHRpbWVzdGFtcDogbnVtYmVyKSA9PiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy50ZXh0VXBkYXRlQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG5cbiAgICBhcHBseU1vZGlmaWVycyh0aW1lc3RhbXA6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy50ZXh0VXBkYXRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1RleHQgPSB0aGlzLnRleHRVcGRhdGVDYWxsYmFjayh0aW1lc3RhbXApO1xuICAgICAgICAgICAgdGhpcy5zZXRUZXh0KG5ld1RleHQpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgbW9kaWZpZXIgb2YgdGhpcy5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIG1vZGlmaWVyLmFwcGx5KHRpbWVzdGFtcCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRNb2RpZmllcihtb2RpZmllcjogRHluYW1pY01vZGlmaWVyKSB7XG4gICAgICAgIHRoaXMubW9kaWZpZXJzLnB1c2gobW9kaWZpZXIpO1xuICAgIH1cblxuICAgIHJlbmRlclRvKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnZpc2libGUpIHJldHVybjtcbiAgICAgICAgLy8g0JjRidC10Lwg0YHRg9GJ0LXRgdGC0LLRg9GO0YnQuNC5INGN0LvQtdC80LXQvdGCINCyINC60L7QvdGC0LXQudC90LXRgNC1INC/0L4gaWRcbiAgICAgICAgbGV0IGRpdiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGAjJHt0aGlzLmlkfWApIGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAgIGlmICghZGl2KSB7XG4gICAgICAgICAgICAvLyDQldGB0LvQuCDRjdC70LXQvNC10L3RgiDQvdC1INC90LDQudC00LXQvSwg0YHQvtC30LTQsNC10Lwg0L3QvtCy0YvQuVxuICAgICAgICAgICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBkaXYuaWQgPSB0aGlzLmlkO1xuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDQntCx0L3QvtCy0LvRj9C10Lwg0YHQstC+0LnRgdGC0LLQsCDRjdC70LXQvNC10L3RgtCwXG4gICAgICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIGRpdi5zdHlsZS5sZWZ0ID0gYCR7TWF0aC5mbG9vcih0aGlzLnggKyAwLjAwMDEpfXB4YDtcbiAgICAgICAgZGl2LnN0eWxlLnRvcCA9IGAke01hdGguZmxvb3IodGhpcy55ICsgMC4wMDAxKX1weGA7XG4gICAgICAgIGRpdi5zdHlsZS5oZWlnaHQgPSBgJHt0aGlzLmhlaWdodH1weGA7XG4gICAgICAgIGRpdi5zdHlsZS5vdmVyZmxvdyA9ICd2aXNpYmxlJ1xuICAgICAgICBkaXYuc3R5bGUud2hpdGVTcGFjZSA9ICdub3dyYXAnO1xuICAgICAgICAvLyBkaXYuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcblxuICAgICAgICAvLyDQn9GA0LjQvNC10L3Rj9C10Lwg0L7RgdC90L7QstC90YvQtSDRgdGC0LjQu9C4INC4INC00L7Qv9C+0LvQvdC40YLQtdC70YzQvdGL0LUg0YHRgtC40LvQuFxuICAgICAgICBPYmplY3QuYXNzaWduKGRpdi5zdHlsZSwgdGhpcy50ZXh0U3R5bGUsIHRoaXMuYWRkaXRpb25hbFN0eWxlcyk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNvbnRlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBkaXYuaW5uZXJUZXh0ID0gdGhpcy5jb250ZW50O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY29udGVudCBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQgfHwgdGhpcy5jb250ZW50IGluc3RhbmNlb2YgU1ZHRWxlbWVudCkge1xuICAgICAgICAgICAgZGl2LmlubmVySFRNTCA9ICcnOyAvLyDQntGH0LjRgdGC0LrQsCDQv9C10YDQtdC0INC00L7QsdCw0LLQu9C10L3QuNC10LxcbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZCh0aGlzLmNvbnRlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGRpdi5zY3JvbGxXaWR0aCwgdGhpcy54KVxuICAgICAgICBkaXYuc3R5bGUud2lkdGggPSBgJHtkaXYuc2Nyb2xsV2lkdGh9cHhgO1xuICAgICAgICB0aGlzLnRleHRXaWR0aCA9IGRpdi5zY3JvbGxXaWR0aFxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRpbWVNYXRyaXhFbGVtZW50IGV4dGVuZHMgTWF0cml4RWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IobWF0cml4OiBNYXRyaXgsIGNvbnRlbnQ6IHN0cmluZyB8IEhUTUxJbWFnZUVsZW1lbnQgfCBTVkdFbGVtZW50LCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgc3VwZXIobWF0cml4LCBjb250ZW50LCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5faW5pdEZuKCk7XG4gICAgfVxuXG4gICAgX2luaXRGbigpIHtcbiAgICAgICAgdGhpcy5zZXRUZXh0VXBkYXRlQ2FsbGJhY2soKHRpbWVzdGFtcCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUodGltZXN0YW1wKTtcbiAgICAgICAgICAgIHJldHVybiBub3cudG9JU09TdHJpbmcoKS5zdWJzdHIoMTEsIDEyKTsgLy8g0KTQvtGA0LzQsNGCINCy0YDQtdC80LXQvdC4INGBINC80LjQu9C70LjRgdC10LrRg9C90LTQsNC80LggKEhIOm1tOnNzLnNzcylcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtNYXRyaXhFbGVtZW50fSBmcm9tIFwiLi9NYXRyaXhFbGVtZW50XCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEeW5hbWljTW9kaWZpZXIge1xuICAgIHByb3RlY3RlZCBlbGVtZW50OiBNYXRyaXhFbGVtZW50O1xuICAgIGZyYW1lc1BlclNlY29uZDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogTWF0cml4RWxlbWVudCwgZnJhbWVzUGVyU2Vjb25kPzogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuZnJhbWVzUGVyU2Vjb25kID0gZnJhbWVzUGVyU2Vjb25kXG4gICAgICAgIGVsZW1lbnQuYWRkTW9kaWZpZXIodGhpcylcbiAgICB9XG5cbiAgICBhYnN0cmFjdCBhcHBseSh0aW1lc3RhbXA6IG51bWJlcik6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBSb3RhdGlvbk1vZGlmaWVyIGV4dGVuZHMgRHluYW1pY01vZGlmaWVyIHtcbiAgICBhbmdsZTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogTWF0cml4RWxlbWVudCwgYW5nbGU6IG51bWJlcikge1xuICAgICAgICBzdXBlcihlbGVtZW50KTtcbiAgICAgICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xuICAgIH1cblxuICAgIGFwcGx5KHRpbWVzdGFtcDogbnVtYmVyKSB7XG4gICAgICAgIC8vINCX0LTQtdGB0Ywg0LzQvtC20L3QviDQv9GA0LjQvNC10L3QuNGC0Ywg0LLRgNCw0YnQtdC90LjQtSDQtNC70Y8g0YDQsNGB0YfQtdGC0L7Qsiwg0LXRgdC70Lgg0Y3RgtC+INC40LzQtdC10YIg0YHQvNGL0YHQu1xuICAgICAgICBjb25zdCByb3RhdGlvbiA9IHRoaXMuYW5nbGUgKiAodGltZXN0YW1wIC8gMTAwMCk7XG4gICAgICAgIC8vINCd0LDQv9GA0LjQvNC10YAsINC80Ysg0LzQvtC20LXQvCDRgdC+0YXRgNCw0L3QuNGC0Ywg0YPQs9C+0Lsg0LLRgNCw0YnQtdC90LjRjyDQuNC70Lgg0LTRgNGD0LPRg9GOINC40L3RhNC+0YDQvNCw0YbQuNGOINCyINGN0LvQtdC80LXQvdGC0LVcbiAgICAgICAgLy8g0J3QviDRjdGC0L4g0LHRg9C00LXRgiDRh9C40YHRgtC+INC00LvRjyDQu9C+0LPQuNC60LgsINC90LUg0LTQu9GPINC/0YDRj9C80L7Qs9C+INGA0LXQvdC00LXRgNC40L3Qs9CwINCyIERPTVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJhaW5ib3dFZmZlY3RNb2RpZmllciBleHRlbmRzIER5bmFtaWNNb2RpZmllciB7XG4gICAgcGVyaW9kOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50OiBNYXRyaXhFbGVtZW50LCBwZXJpb2Q6IG51bWJlcikge1xuICAgICAgICBzdXBlcihlbGVtZW50KTtcbiAgICAgICAgdGhpcy5wZXJpb2QgPSBwZXJpb2Q7XG4gICAgfVxuXG4gICAgYXBwbHkodGltZXN0YW1wOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgcGhhc2UgPSAodGltZXN0YW1wICUgdGhpcy5wZXJpb2QpIC8gdGhpcy5wZXJpb2Q7XG4gICAgICAgIGNvbnN0IGh1ZSA9IE1hdGguZmxvb3IocGhhc2UgKiAzNjApO1xuICAgICAgICB0aGlzLmVsZW1lbnQudXBkYXRlVGV4dFN0eWxlKHtjb2xvcjogYGhzbCgke2h1ZX0sIDEwMCUsIDUwJSlgfSk7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBTY3JvbGxpbmdUZXh0TW9kaWZpZXIgZXh0ZW5kcyBEeW5hbWljTW9kaWZpZXIge1xuICAgIHNwZWVkUGl4ZWxzUGVyU2Vjb25kOiBudW1iZXI7XG4gICAgcHJldmlvdXNUaW1lOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IE1hdHJpeEVsZW1lbnQsIHNwZWVkUGl4ZWxzUGVyU2Vjb25kOiBudW1iZXIsIGZyYW1lc1BlclNlY29uZDogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIGZyYW1lc1BlclNlY29uZCk7XG4gICAgICAgIHRoaXMuc3BlZWRQaXhlbHNQZXJTZWNvbmQgPSBzcGVlZFBpeGVsc1BlclNlY29uZDtcbiAgICAgICAgdGhpcy5wcmV2aW91c1RpbWUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgYXBwbHkodGltZXN0YW1wOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLnByZXZpb3VzVGltZSkge1xuICAgICAgICAgICAgdGhpcy5wcmV2aW91c1RpbWUgPSB0aW1lc3RhbXA7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQueCA9IHRoaXMuZWxlbWVudC53aWR0aDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWxlbWVudC54IC09IHRoaXMuc3BlZWRQaXhlbHNQZXJTZWNvbmQgKiAodGltZXN0YW1wIC0gdGhpcy5wcmV2aW91c1RpbWUpIC8gMTAwMDtcbiAgICAgICAgdGhpcy5wcmV2aW91c1RpbWUgPSB0aW1lc3RhbXA7XG5cbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudC54ICsgdGhpcy5lbGVtZW50LnRleHRXaWR0aCA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC54ID0gdGhpcy5lbGVtZW50LndpZHRoO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQmxpbmtNb2RpZmllciBleHRlbmRzIER5bmFtaWNNb2RpZmllciB7XG4gICAgYXBwbHkodGltZXN0YW1wOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgbGV0IHQgPSB0aW1lc3RhbXAgJSAxMDAwXG4gICAgICAgIHRoaXMuZWxlbWVudC52aXNpYmxlID0gdCA8IDUwMFxuICAgIH1cblxufVxuXG5leHBvcnQgY2xhc3MgU2NhbGVNb2RpZmllciBleHRlbmRzIER5bmFtaWNNb2RpZmllciB7XG4gICAgYXBwbHkodGltZXN0YW1wOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgLy8g0JLRi9GH0LjRgdC70Y/QtdC8INC80LDRgdGI0YLQsNCxINC90LAg0L7RgdC90L7QstC1INCy0YDQtdC80LXQvdC4XG4gICAgICAgIGxldCB0ID0gKHRpbWVzdGFtcCAlIDIwMDApIC8gMjAwMDtcbiAgICAgICAgaWYgKHQgPiAwLjUpIHQgPSAxIC0gdFxuICAgICAgICB0ID0gMSArIHRcblxuICAgICAgICAvLyDQn9GA0LjQvNC10L3Rj9C10Lwg0LzQsNGB0YjRgtCw0LHQuNGA0L7QstCw0L3QuNC1INC6INGN0LvQtdC80LXQvdGC0YNcbiAgICAgICAgdGhpcy5lbGVtZW50LnVwZGF0ZUFkZGl0aW9uYWxTdHlsZXMoe1xuICAgICAgICAgICAgdHJhbnNmb3JtOiBgc2NhbGUoJHt0fSlgXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNoYWRvd0VmZmVjdE1vZGlmaWVyIGV4dGVuZHMgRHluYW1pY01vZGlmaWVyIHtcbiAgICBibHVyOiBudW1iZXI7XG4gICAgc2hhZG93Q291bnQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IE1hdHJpeEVsZW1lbnQsIGJsdXI6IG51bWJlciA9IDAsIHNoYWRvd0NvdW50OiBudW1iZXIgPSAxKSB7XG4gICAgICAgIHN1cGVyKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLmJsdXIgPSBibHVyO1xuICAgICAgICB0aGlzLnNoYWRvd0NvdW50ID0gc2hhZG93Q291bnQ7XG4gICAgfVxuXG4gICAgYXBwbHkodGltZXN0YW1wOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2hhZG93czogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAvLyDQn9C+0LvRg9GH0LDQtdC8INGC0LXQutGD0YnQuNC5INGG0LLQtdGCINGC0LXQutGB0YLQsCDQvdCwINC80L7QvNC10L3RgiDQsNC90LjQvNCw0YbQuNC4XG4gICAgICAgIGNvbnN0IGN1cnJlbnRDb2xvciA9IHRoaXMuZ2V0VGV4dENvbG9yKHRoaXMuZWxlbWVudCk7XG5cbiAgICAgICAgLy8g0J/RgNC40LzQtdC90Y/QtdC8INC/0YDQvtC30YDQsNGH0L3QvtGB0YLRjCDRh9C10YDQtdC3IHJnYmEg0LHQtdC3INC70LjRiNC90LjRhSDQv9GA0LXQvtCx0YDQsNC30L7QstCw0L3QuNC5XG4gICAgICAgIGNvbnN0IHNoYWRvd0NvbG9yV2l0aE9wYWNpdHkgPSB0aGlzLmNvbnZlcnRUb1JnYmEoY3VycmVudENvbG9yLCAwLjMpOyAvLyDQlNC+0LHQsNCy0LvRj9C10Lwg0L/RgNC+0LfRgNCw0YfQvdC+0YHRgtGMXG5cbiAgICAgICAgLy8g0KHQvtC30LTQsNGR0Lwg0L3QtdGB0LrQvtC70YzQutC+INGC0LXQvdC10Lkg0YEg0LjRgdC/0L7Qu9GM0LfQvtCy0LDQvdC40LXQvCDRgtC10LrRg9GJ0LXQs9C+INGG0LLQtdGC0LBcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gdGhpcy5zaGFkb3dDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB4T2Zmc2V0ID0gaTsgIC8vINCh0LzQtdGJ0LXQvdC40LUg0L/QviBYXG4gICAgICAgICAgICBjb25zdCB5T2Zmc2V0ID0gaTsgIC8vINCh0LzQtdGJ0LXQvdC40LUg0L/QviBZXG4gICAgICAgICAgICBzaGFkb3dzLnB1c2goYCR7eE9mZnNldH1weCAke3lPZmZzZXR9cHggJHt0aGlzLmJsdXJ9cHggJHtzaGFkb3dDb2xvcldpdGhPcGFjaXR5fWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g0J/RgNC40LzQtdC90Y/QtdC8INGC0LXQvdC4INC6INGN0LvQtdC80LXQvdGC0YNcbiAgICAgICAgdGhpcy5lbGVtZW50LnVwZGF0ZUFkZGl0aW9uYWxTdHlsZXMoe1xuICAgICAgICAgICAgdGV4dFNoYWRvdzogc2hhZG93cy5qb2luKCcsICcpXG4gICAgICAgIH0pO1xuICAgIH1cblxuLy8g0KTRg9C90LrRhtC40Y8g0LTQu9GPINC/0YDQtdC+0LHRgNCw0LfQvtCy0LDQvdC40Y8g0YLQtdC60YPRidC10LPQviDRhtCy0LXRgtCwINCyINGE0L7RgNC80LDRgiByZ2JhXG4gICAgY29udmVydFRvUmdiYShjb2xvcjogc3RyaW5nLCBvcGFjaXR5OiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICBpZiAoY29sb3Iuc3RhcnRzV2l0aCgncmdiJykpIHtcbiAgICAgICAgICAgIHJldHVybiBjb2xvci5yZXBsYWNlKCdyZ2InLCAncmdiYScpLnJlcGxhY2UoJyknLCBgLCAke29wYWNpdHl9KWApO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbG9yLnN0YXJ0c1dpdGgoJ2hzbCcpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oc2xTdHJpbmdUb1JnYmEoY29sb3IsIG9wYWNpdHkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2xvcjsgLy8g0JXRgdC70Lgg0Y3RgtC+INC90LUgcmdiINC40LvQuCBoc2wsINCy0L7Qt9Cy0YDQsNGJ0LDQtdC8INC60LDQuiDQtdGB0YLRjFxuICAgIH1cblxuLy8g0J/RgNC10L7QsdGA0LDQt9C+0LLQsNC90LjQtSBIU0wg0LIgUkdCQVxuICAgIGhzbFN0cmluZ1RvUmdiYShoc2w6IHN0cmluZywgb3BhY2l0eTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgaHNsVmFsdWVzID0gaHNsLm1hdGNoKC9cXGQrL2cpIS5tYXAoTnVtYmVyKTtcbiAgICAgICAgY29uc3QgaCA9IGhzbFZhbHVlc1swXTtcbiAgICAgICAgY29uc3QgcyA9IGhzbFZhbHVlc1sxXSAvIDEwMDtcbiAgICAgICAgY29uc3QgbCA9IGhzbFZhbHVlc1syXSAvIDEwMDtcblxuICAgICAgICBjb25zdCBjID0gKDEgLSBNYXRoLmFicygyICogbCAtIDEpKSAqIHM7XG4gICAgICAgIGNvbnN0IHggPSBjICogKDEgLSBNYXRoLmFicygoaCAvIDYwKSAlIDIgLSAxKSk7XG4gICAgICAgIGNvbnN0IG0gPSBsIC0gYyAvIDI7XG5cbiAgICAgICAgbGV0IHIgPSAwLCBnID0gMCwgYiA9IDA7XG5cbiAgICAgICAgaWYgKDAgPD0gaCAmJiBoIDwgNjApIHtcbiAgICAgICAgICAgIHIgPSBjOyBnID0geDsgYiA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoNjAgPD0gaCAmJiBoIDwgMTIwKSB7XG4gICAgICAgICAgICByID0geDsgZyA9IGM7IGIgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKDEyMCA8PSBoICYmIGggPCAxODApIHtcbiAgICAgICAgICAgIHIgPSAwOyBnID0gYzsgYiA9IHg7XG4gICAgICAgIH0gZWxzZSBpZiAoMTgwIDw9IGggJiYgaCA8IDI0MCkge1xuICAgICAgICAgICAgciA9IDA7IGcgPSB4OyBiID0gYztcbiAgICAgICAgfSBlbHNlIGlmICgyNDAgPD0gaCAmJiBoIDwgMzAwKSB7XG4gICAgICAgICAgICByID0geDsgZyA9IDA7IGIgPSBjO1xuICAgICAgICB9IGVsc2UgaWYgKDMwMCA8PSBoICYmIGggPCAzNjApIHtcbiAgICAgICAgICAgIHIgPSBjOyBnID0gMDsgYiA9IHg7XG4gICAgICAgIH1cblxuICAgICAgICByID0gTWF0aC5yb3VuZCgociArIG0pICogMjU1KTtcbiAgICAgICAgZyA9IE1hdGgucm91bmQoKGcgKyBtKSAqIDI1NSk7XG4gICAgICAgIGIgPSBNYXRoLnJvdW5kKChiICsgbSkgKiAyNTUpO1xuXG4gICAgICAgIHJldHVybiBgcmdiYSgke3J9LCAke2d9LCAke2J9LCAke29wYWNpdHl9KWA7XG4gICAgfVxuXG4gICAgZ2V0VGV4dENvbG9yKGVsZW1lbnQ6IE1hdHJpeEVsZW1lbnQpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gZWxlbWVudC50ZXh0U3R5bGUuY29sb3IgfHwgJyNmZmZmZmYnOyAvLyDQldGB0LvQuCDRhtCy0LXRgiDQvdC1INC30LDQtNCw0L0sINC40YHQv9C+0LvRjNC30YPQtdGC0YHRjyDQsdC10LvRi9C5XG4gICAgfVxuXG5cbn0iLCJpbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuXG5pbnRlcmZhY2UgUmVwb3J0RmlsdGVyIHtcbiAgICBtaW5UaW1lPzogbnVtYmVyO1xuICAgIHZpc2l0cz86IG51bWJlcjtcbiAgICByZXF1aXJlRGVwZW5kZW5jaWVzPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFBvaW50VHJhY2tlciB7XG4gICAgcHJpdmF0ZSBwb2ludHM6IE1hcDxzdHJpbmcsIFBvaW50RGF0YT47XG4gICAgcHJpdmF0ZSBsYXN0VGltZXN0YW1wczogTWFwPHN0cmluZywgbnVtYmVyPjtcbiAgICBwcml2YXRlIGxhc3RQb2ludDogc3RyaW5nIHwgbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnBvaW50cyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5sYXN0VGltZXN0YW1wcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5sYXN0UG9pbnQgPSBudWxsO1xuICAgIH1cblxuICAgIHBvaW50KHBvaW50TmFtZTogc3RyaW5nLCBjaGVja1BvaW50cz86IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgIGlmICghdGhpcy5wb2ludHMuaGFzKHBvaW50TmFtZSkpIHtcbiAgICAgICAgICAgIHRoaXMucG9pbnRzLnNldChwb2ludE5hbWUsIG5ldyBQb2ludERhdGEoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjdXJyZW50UG9pbnREYXRhID0gdGhpcy5wb2ludHMuZ2V0KHBvaW50TmFtZSkhO1xuXG4gICAgICAgIGlmICh0aGlzLmxhc3RUaW1lc3RhbXBzLmhhcyhwb2ludE5hbWUpKSB7XG4gICAgICAgICAgICBjb25zdCB0aW1lU2luY2VMYXN0VmlzaXQgPSBjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWVzdGFtcHMuZ2V0KHBvaW50TmFtZSkhO1xuICAgICAgICAgICAgY3VycmVudFBvaW50RGF0YS51cGRhdGVJdGVyYXRpb25UaW1lKHRpbWVTaW5jZUxhc3RWaXNpdCk7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50UG9pbnREYXRhLmluY3JlbWVudFZpc2l0cygpO1xuXG4gICAgICAgIGlmIChjaGVja1BvaW50cykge1xuICAgICAgICAgICAgY2hlY2tQb2ludHMuZm9yRWFjaCgoY2hlY2tQb2ludE5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0VGltZXN0YW1wcy5oYXMoY2hlY2tQb2ludE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVTcGVudCA9IGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZXN0YW1wcy5nZXQoY2hlY2tQb2ludE5hbWUpITtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFBvaW50RGF0YS51cGRhdGVUcmFuc2l0aW9uKGNoZWNrUG9pbnROYW1lLCB0aW1lU3BlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubGFzdFBvaW50ICE9PSBudWxsICYmIHRoaXMubGFzdFBvaW50ICE9PSBwb2ludE5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVTcGVudCA9IGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZXN0YW1wcy5nZXQodGhpcy5sYXN0UG9pbnQpITtcbiAgICAgICAgICAgIGN1cnJlbnRQb2ludERhdGEudXBkYXRlVHJhbnNpdGlvbih0aGlzLmxhc3RQb2ludCArIFwiIChwcmV2aW91cylcIiwgdGltZVNwZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubGFzdFRpbWVzdGFtcHMuc2V0KHBvaW50TmFtZSwgY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmxhc3RQb2ludCA9IHBvaW50TmFtZTtcbiAgICB9XG5cbiAgICByZXBvcnQoZmlsdGVyOiBSZXBvcnRGaWx0ZXIgPSB7fSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHJlcG9ydExpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCBtaW5UaW1lRmlsdGVyID0gZmlsdGVyLm1pblRpbWUgfHwgMDtcbiAgICAgICAgY29uc3QgbWluVmlzaXRzRmlsdGVyID0gZmlsdGVyLnZpc2l0cyB8fCAwO1xuICAgICAgICBjb25zdCByZXF1aXJlRGVwZW5kZW5jaWVzID0gZmlsdGVyLnJlcXVpcmVEZXBlbmRlbmNpZXMgfHwgZmFsc2U7XG5cbiAgICAgICAgLy8g0KTQuNC70YzRgtGA0LDRhtC40Y8g0YLQvtGH0LXQulxuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKChkYXRhLCBwb2ludCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXZnVGltZSA9IGRhdGEuYXZlcmFnZUl0ZXJhdGlvblRpbWUoKTtcblxuICAgICAgICAgICAgaWYgKGF2Z1RpbWUgPj0gbWluVGltZUZpbHRlciAmJiBkYXRhLnRvdGFsVmlzaXRzID49IG1pblZpc2l0c0ZpbHRlcikge1xuICAgICAgICAgICAgICAgIC8vINCk0LjQu9GM0YLRgNCw0YbQuNGPINC/0LXRgNC10YXQvtC00L7QslxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkVHJhbnNpdGlvbnMgPSBuZXcgTWFwPHN0cmluZywgVHJhbnNpdGlvbkRhdGE+KCk7XG5cbiAgICAgICAgICAgICAgICBkYXRhLnRyYW5zaXRpb25zLmZvckVhY2goKHRyYW5zaXRpb25EYXRhLCBmcm9tUG9pbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25EYXRhLmF2ZXJhZ2VUaW1lKCkgPj0gbWluVGltZUZpbHRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRUcmFuc2l0aW9ucy5zZXQoZnJvbVBvaW50LCB0cmFuc2l0aW9uRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vINCU0L7QsdCw0LLQu9C10L3QuNC1INCyINC+0YLRh9C10YIg0YLQvtC70YzQutC+INC10YHQu9C4INC10YHRgtGMINC/0LXRgNC10YXQvtC00Ysg0LjQu9C4INC90LUg0YLRgNC10LHRg9C10YLRgdGPINC+0LHRj9C30LDRgtC10LvRjNC90YvRhSDQt9Cw0LLQuNGB0LjQvNC+0YHRgtC10LlcbiAgICAgICAgICAgICAgICBpZiAoIXJlcXVpcmVEZXBlbmRlbmNpZXMgfHwgZmlsdGVyZWRUcmFuc2l0aW9ucy5zaXplID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFBvaW50V2l0aEZpbHRlcmVkVHJhbnNpdGlvbnMocmVwb3J0TGluZXMsIHBvaW50LCBkYXRhLCBmaWx0ZXJlZFRyYW5zaXRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXBvcnRMaW5lcy5qb2luKFwiXFxuXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkUG9pbnRXaXRoRmlsdGVyZWRUcmFuc2l0aW9ucyhcbiAgICAgICAgcmVwb3J0TGluZXM6IHN0cmluZ1tdLFxuICAgICAgICBwb2ludDogc3RyaW5nLFxuICAgICAgICBkYXRhOiBQb2ludERhdGEsXG4gICAgICAgIGZpbHRlcmVkVHJhbnNpdGlvbnM6IE1hcDxzdHJpbmcsIFRyYW5zaXRpb25EYXRhPlxuICAgICkge1xuICAgICAgICByZXBvcnRMaW5lcy5wdXNoKFxuICAgICAgICAgICAgYCR7Y2hhbGsuZ3JlZW4ocG9pbnQpfTogVmlzaXRzPSR7ZGF0YS50b3RhbFZpc2l0c30sIEF2Z1RpbWU9JHtjaGFsay5yZWQoZGF0YS5hdmVyYWdlSXRlcmF0aW9uVGltZSgpLnRvRml4ZWQoMikpfW1zYFxuICAgICAgICApO1xuXG4gICAgICAgIGZpbHRlcmVkVHJhbnNpdGlvbnMuZm9yRWFjaCgodHJhbnNpdGlvbkRhdGEsIGZyb21Qb2ludCkgPT4ge1xuICAgICAgICAgICAgcmVwb3J0TGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBgICAke2NoYWxrLmN5YW4oZnJvbVBvaW50KX0gLT4gJHtjaGFsay5ncmVlbihwb2ludCl9OiBDb3VudD0ke3RyYW5zaXRpb25EYXRhLmNvdW50fSwgTWluPSR7dHJhbnNpdGlvbkRhdGEubWluVGltZS50b0ZpeGVkKDIpfW1zLCBNYXg9JHt0cmFuc2l0aW9uRGF0YS5tYXhUaW1lLnRvRml4ZWQoMil9bXMsIEF2Zz0ke2NoYWxrLnJlZCh0cmFuc2l0aW9uRGF0YS5hdmVyYWdlVGltZSgpLnRvRml4ZWQoMikpfW1zYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jbGFzcyBQb2ludERhdGEge1xuICAgIHRvdGFsVmlzaXRzOiBudW1iZXI7XG4gICAgdG90YWxJdGVyYXRpb25UaW1lOiBudW1iZXI7XG4gICAgdHJhbnNpdGlvbnM6IE1hcDxzdHJpbmcsIFRyYW5zaXRpb25EYXRhPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnRvdGFsVmlzaXRzID0gMDtcbiAgICAgICAgdGhpcy50b3RhbEl0ZXJhdGlvblRpbWUgPSAwO1xuICAgICAgICB0aGlzLnRyYW5zaXRpb25zID0gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIGluY3JlbWVudFZpc2l0cygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy50b3RhbFZpc2l0cyArPSAxO1xuICAgIH1cblxuICAgIHVwZGF0ZUl0ZXJhdGlvblRpbWUodGltZVNwZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy50b3RhbEl0ZXJhdGlvblRpbWUgKz0gdGltZVNwZW50O1xuICAgIH1cblxuICAgIGF2ZXJhZ2VJdGVyYXRpb25UaW1lKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvdGFsVmlzaXRzID4gMSA/IHRoaXMudG90YWxJdGVyYXRpb25UaW1lIC8gKHRoaXMudG90YWxWaXNpdHMgLSAxKSA6IDA7XG4gICAgfVxuXG4gICAgdXBkYXRlVHJhbnNpdGlvbihmcm9tUG9pbnQ6IHN0cmluZywgdGltZVNwZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLnRyYW5zaXRpb25zLmhhcyhmcm9tUG9pbnQpKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25zLnNldChmcm9tUG9pbnQsIG5ldyBUcmFuc2l0aW9uRGF0YSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRyYW5zaXRpb25EYXRhID0gdGhpcy50cmFuc2l0aW9ucy5nZXQoZnJvbVBvaW50KSE7XG4gICAgICAgIHRyYW5zaXRpb25EYXRhLnVwZGF0ZSh0aW1lU3BlbnQpO1xuICAgIH1cbn1cblxuY2xhc3MgVHJhbnNpdGlvbkRhdGEge1xuICAgIGNvdW50OiBudW1iZXI7XG4gICAgdG90YWxUaW1lOiBudW1iZXI7XG4gICAgbWluVGltZTogbnVtYmVyO1xuICAgIG1heFRpbWU6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvdW50ID0gMDtcbiAgICAgICAgdGhpcy50b3RhbFRpbWUgPSAwO1xuICAgICAgICB0aGlzLm1pblRpbWUgPSBJbmZpbml0eTtcbiAgICAgICAgdGhpcy5tYXhUaW1lID0gMDtcbiAgICB9XG5cbiAgICB1cGRhdGUodGltZVNwZW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jb3VudCArPSAxO1xuICAgICAgICB0aGlzLnRvdGFsVGltZSArPSB0aW1lU3BlbnQ7XG4gICAgICAgIHRoaXMubWluVGltZSA9IE1hdGgubWluKHRoaXMubWluVGltZSwgdGltZVNwZW50KTtcbiAgICAgICAgdGhpcy5tYXhUaW1lID0gTWF0aC5tYXgodGhpcy5tYXhUaW1lLCB0aW1lU3BlbnQpO1xuICAgIH1cblxuICAgIGF2ZXJhZ2VUaW1lKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvdW50ID4gMCA/IHRoaXMudG90YWxUaW1lIC8gdGhpcy5jb3VudCA6IDA7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIE11dGV4IHtcbiAgICBzdGF0aWMgbG9nQWxsb3dlZCA9IHRydWVcbiAgICBwcml2YXRlIF9xdWV1ZTogKCgpID0+IHZvaWQpW10gPSBbXTtcbiAgICBwcml2YXRlIF9sb2NrID0gZmFsc2U7XG5cbiAgICBsb2NrKGxvZ01zZz86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoTXV0ZXgubG9nQWxsb3dlZCAmJiBsb2dNc2cpIGNvbnNvbGUubG9nKFwiTXV0ZXggbG9jazogXCIsIGxvZ01zZywgIXRoaXMuX2xvY2spXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2xvY2spIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcXVldWUucHVzaChyZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0cnlMb2NrKGxvZ01zZz86IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5fbG9jaykge1xuICAgICAgICAgICAgLy8g0JXRgdC70Lgg0LzRjNGO0YLQtdC60YEg0YPQttC1INC30LDQu9C+0YfQtdC9LCDQstC+0LfQstGA0LDRidCw0LXQvCBmYWxzZVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g0JXRgdC70Lgg0LzRjNGO0YLQtdC60YEg0YHQstC+0LHQvtC00LXQvSwg0LvQvtGH0LjQvCDQtdCz0L4g0Lgg0LLQvtC30LLRgNCw0YnQsNC10LwgdHJ1ZVxuICAgICAgICAgICAgdGhpcy5fbG9jayA9IHRydWU7XG4gICAgICAgICAgICBpZiAoTXV0ZXgubG9nQWxsb3dlZCAmJiBsb2dNc2cpIGNvbnNvbGUubG9nKFwiTXV0ZXggdHJ5TG9jayBzdWNjZXNzZnVsOiBcIiwgbG9nTXNnKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICB1bmxvY2sobG9nTXNnPzogc3RyaW5nKSB7XG4gICAgICAgIGlmIChNdXRleC5sb2dBbGxvd2VkICYmIGxvZ01zZykgY29uc29sZS5sb2coXCJNdXRleCB1bkxvY2s6IFwiLCBsb2dNc2cpXG4gICAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBmdW5jID0gdGhpcy5fcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgIGlmIChmdW5jKSBmdW5jKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2NrID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59IiwiaW1wb3J0IHtXb3JrZXJNYW5hZ2VyIGFzIEJhc2VXb3JrZXJNYW5hZ2VyfSBmcm9tIFwid29ya2VyLXRocmVhZHMtbWFuYWdlci9kaXN0L3NyY1wiO1xuaW1wb3J0IHtIYW5kbGVyc30gZnJvbSBcIi4vd29ya2VyXCI7XG5pbXBvcnQge3Jlc29sdmV9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgV2ViU29ja2V0LCB7U2VydmVyfSBmcm9tIFwid3NcIjtcbmltcG9ydCB7UG9pbnRUcmFja2VyfSBmcm9tIFwiQHNlcnZlci9Qb2ludFRyYWNrZXJcIjtcbmltcG9ydCB7TWF0cml4fSBmcm9tIFwiLi4vLi4vTWF0cml4L3NyYy9NYXRyaXhcIjtcbmltcG9ydCB7U2VyRGV9IGZyb20gXCJzZXJkZS10c1wiO1xuaW1wb3J0IHtNYXRyaXhFbGVtZW50LCBUaW1lTWF0cml4RWxlbWVudH0gZnJvbSBcIi4uLy4uL01hdHJpeC9zcmMvTWF0cml4RWxlbWVudFwiO1xuaW1wb3J0IHtcbiAgICBSYWluYm93RWZmZWN0TW9kaWZpZXIsXG4gICAgUm90YXRpb25Nb2RpZmllcixcbiAgICBTY2FsZU1vZGlmaWVyLFxuICAgIFNjcm9sbGluZ1RleHRNb2RpZmllciwgU2hhZG93RWZmZWN0TW9kaWZpZXJcbn0gZnJvbSBcIi4uLy4uL01hdHJpeC9zcmMvTW9kaWZpZXJzXCI7XG5pbXBvcnQge011dGV4fSBmcm9tIFwiQHNlcnZlci9tdXRleFwiO1xuaW1wb3J0ICogYXMgcHJvY2VzcyBmcm9tIFwibm9kZTpwcm9jZXNzXCI7XG5cbmxldCBpID0gMDtcbmxldCBjbGllbnRDb3VudGVyID0gMDtcbmxldCBjbGllbnRzOiBXZWJTb2NrZXRbXSA9IFtdO1xubGV0IHRyYWNrZXIgPSBuZXcgUG9pbnRUcmFja2VyKCk7XG5sZXQgbXV0ZXggPSBuZXcgTXV0ZXgoKTtcblxuY2xhc3MgV29ya2VyTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBtYW5hZ2VyOiBCYXNlV29ya2VyTWFuYWdlcjxIYW5kbGVycz47XG4gICAgY3VycmVudFdvcmtlcklkOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBwb3J0cyA9IFs4MDg1LCA4MDg2XTtcbiAgICBwcml2YXRlIGN1cnJlbnRQb3J0SW5kZXggPSAwO1xuICAgIHByaXZhdGUgaW50ZXJ2YWw6IE5vZGVKUy5UaW1lb3V0IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgdGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBvbGRXb3JrZXJJZDogdW5kZWZpbmVkIHwgbnVtYmVyID0gdW5kZWZpbmVkO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMubWFuYWdlciA9IG5ldyBCYXNlV29ya2VyTWFuYWdlcjxIYW5kbGVycz4oKTtcbiAgICB9XG5cbiAgICBhc3luYyBjcmVhdGVXb3JrZXIoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgdGhpcy5jdXJyZW50UG9ydEluZGV4ID0gMSAtIHRoaXMuY3VycmVudFBvcnRJbmRleDsgIC8vIEFsdGVybmF0ZSBiZXR3ZWVuIDgwODUgYW5kIDgwODZcbiAgICAgICAgY29uc3QgcG9ydCA9IHRoaXMucG9ydHNbdGhpcy5jdXJyZW50UG9ydEluZGV4XTtcblxuICAgICAgICBjb25zdCB3b3JrZXJJZCA9IGF3YWl0IHRoaXMubWFuYWdlci5jcmVhdGVXb3JrZXJXaXRoSGFuZGxlcnMocmVzb2x2ZShfX2Rpcm5hbWUsICd3b3JrZXIuanMnKSk7XG4gICAgICAgIGF3YWl0IHRoaXMubWFuYWdlci5jYWxsKHdvcmtlcklkLCBcImluaXRpYWxpemVQYWdlXCIsIHBvcnQpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgV29ya2VyIHdpdGggSUQgJHt3b3JrZXJJZH0gY3JlYXRlZCBvbiBwb3J0ICR7cG9ydH0uYCk7XG4gICAgICAgIHRoaXMub2xkV29ya2VySWQgPSB0aGlzLmN1cnJlbnRXb3JrZXJJZFxuICAgICAgICByZXR1cm4gd29ya2VySWQ7XG4gICAgfVxuXG4gICAgYXN5bmMgc3dhcFdvcmtlcnMobG9ja011dGV4PzogTXV0ZXgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKGxvY2tNdXRleCkgbG9ja011dGV4LnVubG9jaygpXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXb3JrZXJJZCA9PT0gdW5kZWZpbmVkKSByZXR1cm5cblxuICAgICAgICBpZiAodGhpcy5vbGRXb3JrZXJJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBhd2FpdCBtdXRleC5sb2NrKCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBTd2FwcGluZyBmcm9tIHdvcmtlciBJRCAke3RoaXMub2xkV29ya2VySWR9IHRvICR7dGhpcy5jdXJyZW50V29ya2VySWR9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyBUcmFuc2ZlciBzdGF0ZSBmcm9tIG9sZCB3b3JrZXIgdG8gbmV3IHdvcmtlclxuICAgICAgICAgICAgICAgIGNvbnN0IHNuYXBzaG90OiBzdHJpbmcgPSBhd2FpdCB0aGlzLm1hbmFnZXIuY2FsbCh0aGlzLm9sZFdvcmtlcklkLCAnZ2V0U25hcHNob3QnKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1hbmFnZXIuY2FsbCh0aGlzLmN1cnJlbnRXb3JrZXJJZCwgJ3NldFNuYXBzaG90Jywgc25hcHNob3QpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FuY2VsIGFsbCB0YXNrcyByZWxhdGVkIHRvIHRoZSBvbGQgd29ya2VyIGFuZCBjbG9zZSBXZWJTb2NrZXQgc2VydmVyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5tYW5hZ2VyLmNhbGwodGhpcy5vbGRXb3JrZXJJZCwgJ2Nsb3NlV2ViU29ja2V0U2VydmVyQW5kUGFnZScpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMubWFuYWdlci50ZXJtaW5hdGVXb3JrZXIodGhpcy5vbGRXb3JrZXJJZCk7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIG11dGV4LnVubG9jaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGFydFJlbmRlcmluZ1Byb2Nlc3MoKTtcbiAgICAgICAgY29uc29sZS5sb2coYFdvcmtlciBJRCAke3RoaXMuY3VycmVudFdvcmtlcklkfSBpcyBub3cgdGhlIGFjdGl2ZSB3b3JrZXIuYCk7XG4gICAgfVxuXG4gICAgYXN5bmMgdXBkYXRlTWF0cml4KCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50V29ya2VySWQgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICBhd2FpdCBtdXRleC5sb2NrKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgbWF0cml4OiBNYXRyaXggPSBTZXJEZS5kZXNlcmlhbGl6ZShhd2FpdCB0aGlzLm1hbmFnZXIuY2FsbCh0aGlzLmN1cnJlbnRXb3JrZXJJZCwgJ2dldFNuYXBzaG90JykpO1xuICAgICAgICAgICAgbWF0cml4LmVsZW1lbnRzWzFdLnNldFRleHQoKGkrKykudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLm1hbmFnZXIuY2FsbCh0aGlzLmN1cnJlbnRXb3JrZXJJZCwgJ3NldFNuYXBzaG90JywgU2VyRGUuc2VyaWFsaXNlKG1hdHJpeCkpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgbXV0ZXgudW5sb2NrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMgc3RhcnRSZW5kZXJpbmdQcm9jZXNzKCk6IFByb21pc2U8dm9pZD4ge1xuXG4gICAgICAgIGlmICghdGhpcy5pbnRlcnZhbClcbiAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCh0aGlzLnVwZGF0ZU1hdHJpeC5iaW5kKHRoaXMpLCAxMDAwKVxuXG4gICAgICAgIGNvbnN0IHByb2Nlc3NGcmFtZUdyb3VwID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgbXV0ZXgubG9jaygpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50V29ya2VySWQgIT09IHVuZGVmaW5lZCkgeyAvLyBFbnN1cmUgd29ya2VyIGlzIHN0aWxsIHZhbGlkXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBDYWxsaW5nIHdvcmtlciB3aXRoIElEOiAke3RoaXMuY3VycmVudFdvcmtlcklkfSwgbWV0aG9kOiBnZW5lcmF0ZU5leHRGcmFtZUdyb3VwYCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmcmFtZUdyb3VwID0gYXdhaXQgdGhpcy5tYW5hZ2VyLmNhbGwodGhpcy5jdXJyZW50V29ya2VySWQsICdnZW5lcmF0ZU5leHRGcmFtZUdyb3VwJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmcmFtZUdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjbGllbnQgb2YgY2xpZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudC5zZW5kKEpTT04uc3RyaW5naWZ5KGZyYW1lR3JvdXApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV4dFRpbWVvdXQgPSBmcmFtZUdyb3VwIS5zdGFydFRpbWUgLSBEYXRlLm5vdygpIC0gNTAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KHByb2Nlc3NGcmFtZUdyb3VwLCBNYXRoLm1heChuZXh0VGltZW91dCwgMCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFdvcmtlciB3aXRoIElEICR7dGhpcy5jdXJyZW50V29ya2VySWR9IGlzIG5vIGxvbmdlciB2YWxpZCBkdXJpbmcgcHJvY2Vzc0ZyYW1lR3JvdXAuYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBtdXRleC51bmxvY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTdGFydCBmcmFtZSBwcm9jZXNzaW5nIGFuZCBtYXRyaXggdXBkYXRlcyBpbW1lZGlhdGVseVxuICAgICAgICBhd2FpdCBwcm9jZXNzRnJhbWVHcm91cCgpO1xuICAgIH1cblxuICAgIGFzeW5jIHN0YXJ0TmV3V29ya2VyQW5kU3dhcCgpIHtcbiAgICAgICAgbGV0IHdvcmtlcklkID0gYXdhaXQgdGhpcy5jcmVhdGVXb3JrZXIoKTtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZTEgPT4gc2V0VGltZW91dChyZXNvbHZlMSwgMTAwMDApKVxuICAgICAgICBhd2FpdCBtdXRleC5sb2NrKClcbiAgICAgICAgdGhpcy5jdXJyZW50V29ya2VySWQgPSB3b3JrZXJJZFxuICAgICAgICBhd2FpdCB0aGlzLnN3YXBXb3JrZXJzKG11dGV4KTsgIC8vIFN3YXAgYWZ0ZXIgbmV3IHdvcmtlciBpcyBmdWxseSByZWFkeVxuICAgIH1cbn1cblxuKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgbWFuYWdlciA9IG5ldyBXb3JrZXJNYW5hZ2VyKCk7XG4gICAgICAgIG1hbmFnZXIuY3VycmVudFdvcmtlcklkID0gYXdhaXQgbWFuYWdlci5jcmVhdGVXb3JrZXIoKTtcbiAgICAgICAgbWFuYWdlci5zdGFydFJlbmRlcmluZ1Byb2Nlc3MoKVxuICAgICAgICB3aGlsZSAoMSkge1xuICAgICAgICAgICAgYXdhaXQgbWFuYWdlci5zdGFydE5ld1dvcmtlckFuZFN3YXAoKVxuICAgICAgICB9XG4gICAgfVxuKSgpO1xuXG5cbihhc3luYyAoKSA9PiB7XG4gICAgY29uc3Qgd3NzID0gbmV3IFNlcnZlcih7cG9ydDogODA4M30pOyAgLy8gT25seSBvbmUgaW5zdGFuY2Ugb2YgdGhlIFdlYlNvY2tldCBzZXJ2ZXJcbiAgICB3c3Mub24oJ2Nvbm5lY3Rpb24nLCAod3M6IFdlYlNvY2tldCkgPT4ge1xuICAgICAgICBjb25zdCBjbGllbnRJZCA9ICsrY2xpZW50Q291bnRlcjtcbiAgICAgICAgY2xpZW50cy5wdXNoKHdzKTtcbiAgICAgICAgY29uc29sZS5sb2coYENsaWVudCBjb25uZWN0ZWQ6ICR7Y2xpZW50SWR9YCk7XG4gICAgICAgIHRyYWNrZXIucG9pbnQoJ2NsaWVudC1jb25uZWN0ZWQnKTtcblxuICAgICAgICB3cy5vbmNlKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgICAgIGNsaWVudHMgPSBjbGllbnRzLmZpbHRlcigoY2xpZW50KSA9PiBjbGllbnQgIT09IHdzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDbGllbnQgZGlzY29ubmVjdGVkOiAke2NsaWVudElkfWApO1xuICAgICAgICAgICAgdHJhY2tlci5wb2ludCgnY2xpZW50LWRpc2Nvbm5lY3RlZCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICB3cy5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFdlYlNvY2tldCBlcnJvciB3aXRoIGNsaWVudCAke2NsaWVudElkfTpgLCBlcnJvcik7XG4gICAgICAgICAgICB0cmFja2VyLnBvaW50KCdlcnJvci1vY2N1cnJlZCcpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIFJlZ2lzdGVyIGNsYXNzZXMgZm9yIHNlcmlhbGl6YXRpb24vZGVzZXJpYWxpemF0aW9uXG4gICAgU2VyRGUuY2xhc3NSZWdpc3RyYXRpb24oW1xuICAgICAgICBNYXRyaXgsIE1hdHJpeEVsZW1lbnQsIFRpbWVNYXRyaXhFbGVtZW50LCBTY3JvbGxpbmdUZXh0TW9kaWZpZXIsIFNjYWxlTW9kaWZpZXIsIFJhaW5ib3dFZmZlY3RNb2RpZmllciwgU2hhZG93RWZmZWN0TW9kaWZpZXJcbiAgICBdKTtcbn0pKCk7XG5cbnNldEludGVydmFsKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBmb3JtYXRNZW1vcnlVc2FnZSA9IChkYXRhOiBhbnkpID0+IGAke01hdGgucm91bmQoZGF0YSAvIDEwMjQgLyAxMDI0ICogMTAwKSAvIDEwMH0gTUJgO1xuICAgIGF3YWl0IG11dGV4LmxvY2soKVxuICAgIGNvbnN0IG1lbW9yeURhdGEgPSBwcm9jZXNzLm1lbW9yeVVzYWdlKCk7XG5cbiAgICBjb25zdCBtZW1vcnlVc2FnZSA9IHtcbiAgICAgICAgcnNzOiBgJHtmb3JtYXRNZW1vcnlVc2FnZShtZW1vcnlEYXRhLnJzcyl9IC0+IFJlc2lkZW50IFNldCBTaXplIC0gdG90YWwgbWVtb3J5IGFsbG9jYXRlZCBmb3IgdGhlIHByb2Nlc3MgZXhlY3V0aW9uYCxcbiAgICAgICAgaGVhcFRvdGFsOiBgJHtmb3JtYXRNZW1vcnlVc2FnZShtZW1vcnlEYXRhLmhlYXBUb3RhbCl9IC0+IHRvdGFsIHNpemUgb2YgdGhlIGFsbG9jYXRlZCBoZWFwYCxcbiAgICAgICAgaGVhcFVzZWQ6IGAke2Zvcm1hdE1lbW9yeVVzYWdlKG1lbW9yeURhdGEuaGVhcFVzZWQpfSAtPiBhY3R1YWwgbWVtb3J5IHVzZWQgZHVyaW5nIHRoZSBleGVjdXRpb25gLFxuICAgICAgICBleHRlcm5hbDogYCR7Zm9ybWF0TWVtb3J5VXNhZ2UobWVtb3J5RGF0YS5leHRlcm5hbCl9IC0+IFY4IGV4dGVybmFsIG1lbW9yeWAsXG4gICAgfTtcblxuICAgIGNvbnNvbGUubG9nKG1lbW9yeVVzYWdlKTtcbiAgICBtdXRleC51bmxvY2soKVxufSwgNjAwMDApXG5cblxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuV29ya2VyQ29udHJvbGxlciA9IHZvaWQgMDtcbmNvbnN0IHdvcmtlcl90aHJlYWRzXzEgPSByZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIik7XG5jb25zdCBzZXJkZV90c18xID0gcmVxdWlyZShcInNlcmRlLXRzXCIpO1xuY2xhc3MgV29ya2VyQ29udHJvbGxlciB7XG4gICAgc3RhdGljIGluaXRpYWxpemUoaGFuZGxlcnMpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVycyA9IGhhbmRsZXJzO1xuICAgICAgICAvLyBTZW5kIGluaXRpYWxpemF0aW9uIGFja25vd2xlZGdtZW50IHdoZW4gdGhlIHdvcmtlciBpcyBmdWxseSByZWFkeVxuICAgICAgICBjb25zdCBpbml0QWNrID0geyB0eXBlOiAnaW5pdGlhbGl6YXRpb24nIH07XG4gICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShpbml0QWNrKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAod29ya2VyX3RocmVhZHNfMS5wYXJlbnRQb3J0KSB7XG4gICAgICAgICAgICB3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQub24oJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZU1lc3NhZ2UoZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAncmVxdWVzdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0KG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbm90aWZpY2F0aW9uJzpcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZU5vdGlmaWNhdGlvbihtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBVbmtub3duIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGhhbmRsZVJlcXVlc3QobWVzc2FnZSkge1xuICAgICAgICBjb25zdCB7IHJlcXVlc3RJZCwgcGF5bG9hZCB9ID0gbWVzc2FnZTtcbiAgICAgICAgY29uc3QgeyBtZXRob2ROYW1lLCBhcmdzIH0gPSBzZXJkZV90c18xLlNlckRlLmRlc2VyaWFsaXplKHBheWxvYWQpO1xuICAgICAgICBpZiAodGhpcy5oYW5kbGVycyAmJiB0eXBlb2YgdGhpcy5oYW5kbGVyc1ttZXRob2ROYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBzZXJkZV90c18xLlNlckRlLnNlcmlhbGlzZShhd2FpdCB0aGlzLmhhbmRsZXJzW21ldGhvZE5hbWVdKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB7IHR5cGU6ICdyZXNwb25zZScsIHJlcXVlc3RJZCwgcmVzdWx0IH07XG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geyB0eXBlOiAncmVzcG9uc2UnLCByZXF1ZXN0SWQsIGVycm9yIH07XG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3JrZXJfdGhyZWFkc18xLnBhcmVudFBvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3Jlc3BvbnNlJyxcbiAgICAgICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICAgICAgcmVzdWx0OiBuZXcgRXJyb3IoYE1ldGhvZCAke21ldGhvZE5hbWV9IG5vdCBmb3VuZCBvbiBoYW5kbGVyc2ApXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydCkge1xuICAgICAgICAgICAgICAgIHdvcmtlcl90aHJlYWRzXzEucGFyZW50UG9ydC5wb3N0TWVzc2FnZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGhhbmRsZU5vdGlmaWNhdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IHsgbWV0aG9kTmFtZSwgYXJncyB9ID0gbWVzc2FnZS5wYXlsb2FkO1xuICAgICAgICBpZiAodGhpcy5oYW5kbGVycyAmJiB0eXBlb2YgdGhpcy5oYW5kbGVyc1ttZXRob2ROYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZXJzW21ldGhvZE5hbWVdKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaGFuZGxpbmcgbm90aWZpY2F0aW9uOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBoYW5kbGluZyBub3RpZmljYXRpb246IHVua25vd24gZXJyb3InKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYE5vdGlmaWNhdGlvbiBtZXRob2QgJHttZXRob2ROYW1lfSBub3QgZm91bmQgb24gaGFuZGxlcnNgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgcmVnaXN0ZXJDbGFzc2VzKGNsYXNzZXMpIHtcbiAgICAgICAgc2VyZGVfdHNfMS5TZXJEZS5jbGFzc1JlZ2lzdHJhdGlvbihjbGFzc2VzKTtcbiAgICB9XG59XG5leHBvcnRzLldvcmtlckNvbnRyb2xsZXIgPSBXb3JrZXJDb250cm9sbGVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9V29ya2VyQ29udHJvbGxlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuV29ya2VyTWFuYWdlciA9IHZvaWQgMDtcbmNvbnN0IHdvcmtlcl90aHJlYWRzXzEgPSByZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIik7XG5jb25zdCBzZXJkZV90c18xID0gcmVxdWlyZShcInNlcmRlLXRzXCIpO1xuY2xhc3MgV29ya2VyTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IodGltZW91dCA9IDIgKiogMzEgLSAxKSB7XG4gICAgICAgIHRoaXMud29ya2VycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5yZXF1ZXN0SWRDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy53b3JrZXJJZENvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gdGltZW91dDtcbiAgICB9XG4gICAgYXN5bmMgY3JlYXRlV29ya2VyV2l0aEhhbmRsZXJzKHdvcmtlckZpbGUpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gbmV3IHdvcmtlcl90aHJlYWRzXzEuV29ya2VyKHdvcmtlckZpbGUpO1xuICAgICAgICBjb25zdCB3b3JrZXJJZCA9ICsrdGhpcy53b3JrZXJJZENvdW50ZXI7XG4gICAgICAgIHRoaXMud29ya2Vycy5zZXQod29ya2VySWQsIHdvcmtlcik7XG4gICAgICAgIHdvcmtlci5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1lc3NhZ2UobWVzc2FnZSwgd29ya2VySWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5zZXQod29ya2VySWQsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTsgLy8gQ2xlYXIgdGltZW91dCBvbiBzdWNjZXNzXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh3b3JrZXJJZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuaGFzKHdvcmtlcklkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemF0aW9uSGFuZGxlcnMuZGVsZXRlKHdvcmtlcklkKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignV29ya2VyIGluaXRpYWxpemF0aW9uIHRpbWVkIG91dCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzLnRpbWVvdXQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaGFuZGxlTWVzc2FnZShtZXNzYWdlLCB3b3JrZXJJZCkge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnaW5pdGlhbGl6YXRpb24nOlxuICAgICAgICAgICAgICAgIGNvbnN0IGluaXRIYW5kbGVyID0gdGhpcy5pbml0aWFsaXphdGlvbkhhbmRsZXJzLmdldCh3b3JrZXJJZCk7XG4gICAgICAgICAgICAgICAgaWYgKGluaXRIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRIYW5kbGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6YXRpb25IYW5kbGVycy5kZWxldGUod29ya2VySWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Jlc3BvbnNlJzpcbiAgICAgICAgICAgICAgICBjb25zdCB7IHJlcXVlc3RJZCwgcmVzdWx0IH0gPSBtZXNzYWdlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlSGFuZGxlciA9IHRoaXMucmVzcG9uc2VIYW5kbGVycy5nZXQocmVxdWVzdElkKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlSGFuZGxlcihzZXJkZV90c18xLlNlckRlLmRlc2VyaWFsaXplKHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMuZGVsZXRlKHJlcXVlc3RJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbm90aWZpY2F0aW9uJzpcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgbm90aWZpY2F0aW9ucyBpZiBuZWNlc3NhcnlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgY2FsbCh3b3JrZXJJZCwgbWV0aG9kTmFtZSwgLi4uYXJncykge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSB0aGlzLndvcmtlcnMuZ2V0KHdvcmtlcklkKTtcbiAgICAgICAgaWYgKCF3b3JrZXIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV29ya2VyIHdpdGggSUQgJHt3b3JrZXJJZH0gbm90IGZvdW5kYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVxdWVzdElkID0gKyt0aGlzLnJlcXVlc3RJZENvdW50ZXI7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICB0eXBlOiAncmVxdWVzdCcsXG4gICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICBwYXlsb2FkOiBzZXJkZV90c18xLlNlckRlLnNlcmlhbGlzZSh7IG1ldGhvZE5hbWUsIGFyZ3MgfSlcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzcG9uc2VIYW5kbGVycy5kZWxldGUocmVxdWVzdElkKTtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdSZXF1ZXN0IHRpbWVkIG91dCcpKTtcbiAgICAgICAgICAgIH0sIHRoaXMudGltZW91dCk7XG4gICAgICAgICAgICB0aGlzLnJlc3BvbnNlSGFuZGxlcnMuc2V0KHJlcXVlc3RJZCwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpOyAvLyBDbGVhciB0aW1lb3V0IG9uIHN1Y2Nlc3NcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShyZXF1ZXN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNlbmROb3RpZmljYXRpb24od29ya2VySWQsIG1ldGhvZE5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gdGhpcy53b3JrZXJzLmdldCh3b3JrZXJJZCk7XG4gICAgICAgIGlmICghd29ya2VyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdvcmtlciB3aXRoIElEICR7d29ya2VySWR9IG5vdCBmb3VuZGApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdub3RpZmljYXRpb24nLFxuICAgICAgICAgICAgcGF5bG9hZDogeyBtZXRob2ROYW1lLCBhcmdzIH1cbiAgICAgICAgfTtcbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKG5vdGlmaWNhdGlvbik7XG4gICAgfVxuICAgIGFzeW5jIHRlcm1pbmF0ZVdvcmtlcih3b3JrZXJJZCkge1xuICAgICAgICBjb25zdCB3b3JrZXIgPSB0aGlzLndvcmtlcnMuZ2V0KHdvcmtlcklkKTtcbiAgICAgICAgaWYgKHdvcmtlcikge1xuICAgICAgICAgICAgYXdhaXQgd29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgICAgICAgdGhpcy53b3JrZXJzLmRlbGV0ZSh3b3JrZXJJZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVnaXN0ZXJDbGFzc2VzKGNsYXNzZXMpIHtcbiAgICAgICAgc2VyZGVfdHNfMS5TZXJEZS5jbGFzc1JlZ2lzdHJhdGlvbihjbGFzc2VzKTtcbiAgICB9XG59XG5leHBvcnRzLldvcmtlck1hbmFnZXIgPSBXb3JrZXJNYW5hZ2VyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9V29ya2VyTWFuYWdlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19leHBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2V4cG9ydFN0YXIpIHx8IGZ1bmN0aW9uKG0sIGV4cG9ydHMpIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4cG9ydHMsIHApKSBfX2NyZWF0ZUJpbmRpbmcoZXhwb3J0cywgbSwgcCk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL1dvcmtlck1hbmFnZXJcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL1dvcmtlckNvbnRyb2xsZXJcIiksIGV4cG9ydHMpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwid3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZTpvc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJub2RlOnByb2Nlc3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZTp0dHlcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGF0aFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKTsiLCJpbXBvcnQgYW5zaVN0eWxlcyBmcm9tICcjYW5zaS1zdHlsZXMnO1xuaW1wb3J0IHN1cHBvcnRzQ29sb3IgZnJvbSAnI3N1cHBvcnRzLWNvbG9yJztcbmltcG9ydCB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L29yZGVyXG5cdHN0cmluZ1JlcGxhY2VBbGwsXG5cdHN0cmluZ0VuY2FzZUNSTEZXaXRoRmlyc3RJbmRleCxcbn0gZnJvbSAnLi91dGlsaXRpZXMuanMnO1xuXG5jb25zdCB7c3Rkb3V0OiBzdGRvdXRDb2xvciwgc3RkZXJyOiBzdGRlcnJDb2xvcn0gPSBzdXBwb3J0c0NvbG9yO1xuXG5jb25zdCBHRU5FUkFUT1IgPSBTeW1ib2woJ0dFTkVSQVRPUicpO1xuY29uc3QgU1RZTEVSID0gU3ltYm9sKCdTVFlMRVInKTtcbmNvbnN0IElTX0VNUFRZID0gU3ltYm9sKCdJU19FTVBUWScpO1xuXG4vLyBgc3VwcG9ydHNDb2xvci5sZXZlbGAg4oaSIGBhbnNpU3R5bGVzLmNvbG9yW25hbWVdYCBtYXBwaW5nXG5jb25zdCBsZXZlbE1hcHBpbmcgPSBbXG5cdCdhbnNpJyxcblx0J2Fuc2knLFxuXHQnYW5zaTI1NicsXG5cdCdhbnNpMTZtJyxcbl07XG5cbmNvbnN0IHN0eWxlcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbmNvbnN0IGFwcGx5T3B0aW9ucyA9IChvYmplY3QsIG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRpZiAob3B0aW9ucy5sZXZlbCAmJiAhKE51bWJlci5pc0ludGVnZXIob3B0aW9ucy5sZXZlbCkgJiYgb3B0aW9ucy5sZXZlbCA+PSAwICYmIG9wdGlvbnMubGV2ZWwgPD0gMykpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1RoZSBgbGV2ZWxgIG9wdGlvbiBzaG91bGQgYmUgYW4gaW50ZWdlciBmcm9tIDAgdG8gMycpO1xuXHR9XG5cblx0Ly8gRGV0ZWN0IGxldmVsIGlmIG5vdCBzZXQgbWFudWFsbHlcblx0Y29uc3QgY29sb3JMZXZlbCA9IHN0ZG91dENvbG9yID8gc3Rkb3V0Q29sb3IubGV2ZWwgOiAwO1xuXHRvYmplY3QubGV2ZWwgPSBvcHRpb25zLmxldmVsID09PSB1bmRlZmluZWQgPyBjb2xvckxldmVsIDogb3B0aW9ucy5sZXZlbDtcbn07XG5cbmV4cG9ydCBjbGFzcyBDaGFsayB7XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc3RydWN0b3ItcmV0dXJuXG5cdFx0cmV0dXJuIGNoYWxrRmFjdG9yeShvcHRpb25zKTtcblx0fVxufVxuXG5jb25zdCBjaGFsa0ZhY3RvcnkgPSBvcHRpb25zID0+IHtcblx0Y29uc3QgY2hhbGsgPSAoLi4uc3RyaW5ncykgPT4gc3RyaW5ncy5qb2luKCcgJyk7XG5cdGFwcGx5T3B0aW9ucyhjaGFsaywgb3B0aW9ucyk7XG5cblx0T2JqZWN0LnNldFByb3RvdHlwZU9mKGNoYWxrLCBjcmVhdGVDaGFsay5wcm90b3R5cGUpO1xuXG5cdHJldHVybiBjaGFsaztcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUNoYWxrKG9wdGlvbnMpIHtcblx0cmV0dXJuIGNoYWxrRmFjdG9yeShvcHRpb25zKTtcbn1cblxuT2JqZWN0LnNldFByb3RvdHlwZU9mKGNyZWF0ZUNoYWxrLnByb3RvdHlwZSwgRnVuY3Rpb24ucHJvdG90eXBlKTtcblxuZm9yIChjb25zdCBbc3R5bGVOYW1lLCBzdHlsZV0gb2YgT2JqZWN0LmVudHJpZXMoYW5zaVN0eWxlcykpIHtcblx0c3R5bGVzW3N0eWxlTmFtZV0gPSB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0Y29uc3QgYnVpbGRlciA9IGNyZWF0ZUJ1aWxkZXIodGhpcywgY3JlYXRlU3R5bGVyKHN0eWxlLm9wZW4sIHN0eWxlLmNsb3NlLCB0aGlzW1NUWUxFUl0pLCB0aGlzW0lTX0VNUFRZXSk7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgc3R5bGVOYW1lLCB7dmFsdWU6IGJ1aWxkZXJ9KTtcblx0XHRcdHJldHVybiBidWlsZGVyO1xuXHRcdH0sXG5cdH07XG59XG5cbnN0eWxlcy52aXNpYmxlID0ge1xuXHRnZXQoKSB7XG5cdFx0Y29uc3QgYnVpbGRlciA9IGNyZWF0ZUJ1aWxkZXIodGhpcywgdGhpc1tTVFlMRVJdLCB0cnVlKTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Zpc2libGUnLCB7dmFsdWU6IGJ1aWxkZXJ9KTtcblx0XHRyZXR1cm4gYnVpbGRlcjtcblx0fSxcbn07XG5cbmNvbnN0IGdldE1vZGVsQW5zaSA9IChtb2RlbCwgbGV2ZWwsIHR5cGUsIC4uLmFyZ3VtZW50c18pID0+IHtcblx0aWYgKG1vZGVsID09PSAncmdiJykge1xuXHRcdGlmIChsZXZlbCA9PT0gJ2Fuc2kxNm0nKSB7XG5cdFx0XHRyZXR1cm4gYW5zaVN0eWxlc1t0eXBlXS5hbnNpMTZtKC4uLmFyZ3VtZW50c18pO1xuXHRcdH1cblxuXHRcdGlmIChsZXZlbCA9PT0gJ2Fuc2kyNTYnKSB7XG5cdFx0XHRyZXR1cm4gYW5zaVN0eWxlc1t0eXBlXS5hbnNpMjU2KGFuc2lTdHlsZXMucmdiVG9BbnNpMjU2KC4uLmFyZ3VtZW50c18pKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYW5zaVN0eWxlc1t0eXBlXS5hbnNpKGFuc2lTdHlsZXMucmdiVG9BbnNpKC4uLmFyZ3VtZW50c18pKTtcblx0fVxuXG5cdGlmIChtb2RlbCA9PT0gJ2hleCcpIHtcblx0XHRyZXR1cm4gZ2V0TW9kZWxBbnNpKCdyZ2InLCBsZXZlbCwgdHlwZSwgLi4uYW5zaVN0eWxlcy5oZXhUb1JnYiguLi5hcmd1bWVudHNfKSk7XG5cdH1cblxuXHRyZXR1cm4gYW5zaVN0eWxlc1t0eXBlXVttb2RlbF0oLi4uYXJndW1lbnRzXyk7XG59O1xuXG5jb25zdCB1c2VkTW9kZWxzID0gWydyZ2InLCAnaGV4JywgJ2Fuc2kyNTYnXTtcblxuZm9yIChjb25zdCBtb2RlbCBvZiB1c2VkTW9kZWxzKSB7XG5cdHN0eWxlc1ttb2RlbF0gPSB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0Y29uc3Qge2xldmVsfSA9IHRoaXM7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3VtZW50c18pIHtcblx0XHRcdFx0Y29uc3Qgc3R5bGVyID0gY3JlYXRlU3R5bGVyKGdldE1vZGVsQW5zaShtb2RlbCwgbGV2ZWxNYXBwaW5nW2xldmVsXSwgJ2NvbG9yJywgLi4uYXJndW1lbnRzXyksIGFuc2lTdHlsZXMuY29sb3IuY2xvc2UsIHRoaXNbU1RZTEVSXSk7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVCdWlsZGVyKHRoaXMsIHN0eWxlciwgdGhpc1tJU19FTVBUWV0pO1xuXHRcdFx0fTtcblx0XHR9LFxuXHR9O1xuXG5cdGNvbnN0IGJnTW9kZWwgPSAnYmcnICsgbW9kZWxbMF0udG9VcHBlckNhc2UoKSArIG1vZGVsLnNsaWNlKDEpO1xuXHRzdHlsZXNbYmdNb2RlbF0gPSB7XG5cdFx0Z2V0KCkge1xuXHRcdFx0Y29uc3Qge2xldmVsfSA9IHRoaXM7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3VtZW50c18pIHtcblx0XHRcdFx0Y29uc3Qgc3R5bGVyID0gY3JlYXRlU3R5bGVyKGdldE1vZGVsQW5zaShtb2RlbCwgbGV2ZWxNYXBwaW5nW2xldmVsXSwgJ2JnQ29sb3InLCAuLi5hcmd1bWVudHNfKSwgYW5zaVN0eWxlcy5iZ0NvbG9yLmNsb3NlLCB0aGlzW1NUWUxFUl0pO1xuXHRcdFx0XHRyZXR1cm4gY3JlYXRlQnVpbGRlcih0aGlzLCBzdHlsZXIsIHRoaXNbSVNfRU1QVFldKTtcblx0XHRcdH07XG5cdFx0fSxcblx0fTtcbn1cblxuY29uc3QgcHJvdG8gPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcygoKSA9PiB7fSwge1xuXHQuLi5zdHlsZXMsXG5cdGxldmVsOiB7XG5cdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gdGhpc1tHRU5FUkFUT1JdLmxldmVsO1xuXHRcdH0sXG5cdFx0c2V0KGxldmVsKSB7XG5cdFx0XHR0aGlzW0dFTkVSQVRPUl0ubGV2ZWwgPSBsZXZlbDtcblx0XHR9LFxuXHR9LFxufSk7XG5cbmNvbnN0IGNyZWF0ZVN0eWxlciA9IChvcGVuLCBjbG9zZSwgcGFyZW50KSA9PiB7XG5cdGxldCBvcGVuQWxsO1xuXHRsZXQgY2xvc2VBbGw7XG5cdGlmIChwYXJlbnQgPT09IHVuZGVmaW5lZCkge1xuXHRcdG9wZW5BbGwgPSBvcGVuO1xuXHRcdGNsb3NlQWxsID0gY2xvc2U7XG5cdH0gZWxzZSB7XG5cdFx0b3BlbkFsbCA9IHBhcmVudC5vcGVuQWxsICsgb3Blbjtcblx0XHRjbG9zZUFsbCA9IGNsb3NlICsgcGFyZW50LmNsb3NlQWxsO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRvcGVuLFxuXHRcdGNsb3NlLFxuXHRcdG9wZW5BbGwsXG5cdFx0Y2xvc2VBbGwsXG5cdFx0cGFyZW50LFxuXHR9O1xufTtcblxuY29uc3QgY3JlYXRlQnVpbGRlciA9IChzZWxmLCBfc3R5bGVyLCBfaXNFbXB0eSkgPT4ge1xuXHQvLyBTaW5nbGUgYXJndW1lbnQgaXMgaG90IHBhdGgsIGltcGxpY2l0IGNvZXJjaW9uIGlzIGZhc3RlciB0aGFuIGFueXRoaW5nXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1pbXBsaWNpdC1jb2VyY2lvblxuXHRjb25zdCBidWlsZGVyID0gKC4uLmFyZ3VtZW50c18pID0+IGFwcGx5U3R5bGUoYnVpbGRlciwgKGFyZ3VtZW50c18ubGVuZ3RoID09PSAxKSA/ICgnJyArIGFyZ3VtZW50c19bMF0pIDogYXJndW1lbnRzXy5qb2luKCcgJykpO1xuXG5cdC8vIFdlIGFsdGVyIHRoZSBwcm90b3R5cGUgYmVjYXVzZSB3ZSBtdXN0IHJldHVybiBhIGZ1bmN0aW9uLCBidXQgdGhlcmUgaXNcblx0Ly8gbm8gd2F5IHRvIGNyZWF0ZSBhIGZ1bmN0aW9uIHdpdGggYSBkaWZmZXJlbnQgcHJvdG90eXBlXG5cdE9iamVjdC5zZXRQcm90b3R5cGVPZihidWlsZGVyLCBwcm90byk7XG5cblx0YnVpbGRlcltHRU5FUkFUT1JdID0gc2VsZjtcblx0YnVpbGRlcltTVFlMRVJdID0gX3N0eWxlcjtcblx0YnVpbGRlcltJU19FTVBUWV0gPSBfaXNFbXB0eTtcblxuXHRyZXR1cm4gYnVpbGRlcjtcbn07XG5cbmNvbnN0IGFwcGx5U3R5bGUgPSAoc2VsZiwgc3RyaW5nKSA9PiB7XG5cdGlmIChzZWxmLmxldmVsIDw9IDAgfHwgIXN0cmluZykge1xuXHRcdHJldHVybiBzZWxmW0lTX0VNUFRZXSA/ICcnIDogc3RyaW5nO1xuXHR9XG5cblx0bGV0IHN0eWxlciA9IHNlbGZbU1RZTEVSXTtcblxuXHRpZiAoc3R5bGVyID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gc3RyaW5nO1xuXHR9XG5cblx0Y29uc3Qge29wZW5BbGwsIGNsb3NlQWxsfSA9IHN0eWxlcjtcblx0aWYgKHN0cmluZy5pbmNsdWRlcygnXFx1MDAxQicpKSB7XG5cdFx0d2hpbGUgKHN0eWxlciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBSZXBsYWNlIGFueSBpbnN0YW5jZXMgYWxyZWFkeSBwcmVzZW50IHdpdGggYSByZS1vcGVuaW5nIGNvZGVcblx0XHRcdC8vIG90aGVyd2lzZSBvbmx5IHRoZSBwYXJ0IG9mIHRoZSBzdHJpbmcgdW50aWwgc2FpZCBjbG9zaW5nIGNvZGVcblx0XHRcdC8vIHdpbGwgYmUgY29sb3JlZCwgYW5kIHRoZSByZXN0IHdpbGwgc2ltcGx5IGJlICdwbGFpbicuXG5cdFx0XHRzdHJpbmcgPSBzdHJpbmdSZXBsYWNlQWxsKHN0cmluZywgc3R5bGVyLmNsb3NlLCBzdHlsZXIub3Blbik7XG5cblx0XHRcdHN0eWxlciA9IHN0eWxlci5wYXJlbnQ7XG5cdFx0fVxuXHR9XG5cblx0Ly8gV2UgY2FuIG1vdmUgYm90aCBuZXh0IGFjdGlvbnMgb3V0IG9mIGxvb3AsIGJlY2F1c2UgcmVtYWluaW5nIGFjdGlvbnMgaW4gbG9vcCB3b24ndCBoYXZlXG5cdC8vIGFueS92aXNpYmxlIGVmZmVjdCBvbiBwYXJ0cyB3ZSBhZGQgaGVyZS4gQ2xvc2UgdGhlIHN0eWxpbmcgYmVmb3JlIGEgbGluZWJyZWFrIGFuZCByZW9wZW5cblx0Ly8gYWZ0ZXIgbmV4dCBsaW5lIHRvIGZpeCBhIGJsZWVkIGlzc3VlIG9uIG1hY09TOiBodHRwczovL2dpdGh1Yi5jb20vY2hhbGsvY2hhbGsvcHVsbC85MlxuXHRjb25zdCBsZkluZGV4ID0gc3RyaW5nLmluZGV4T2YoJ1xcbicpO1xuXHRpZiAobGZJbmRleCAhPT0gLTEpIHtcblx0XHRzdHJpbmcgPSBzdHJpbmdFbmNhc2VDUkxGV2l0aEZpcnN0SW5kZXgoc3RyaW5nLCBjbG9zZUFsbCwgb3BlbkFsbCwgbGZJbmRleCk7XG5cdH1cblxuXHRyZXR1cm4gb3BlbkFsbCArIHN0cmluZyArIGNsb3NlQWxsO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoY3JlYXRlQ2hhbGsucHJvdG90eXBlLCBzdHlsZXMpO1xuXG5jb25zdCBjaGFsayA9IGNyZWF0ZUNoYWxrKCk7XG5leHBvcnQgY29uc3QgY2hhbGtTdGRlcnIgPSBjcmVhdGVDaGFsayh7bGV2ZWw6IHN0ZGVyckNvbG9yID8gc3RkZXJyQ29sb3IubGV2ZWwgOiAwfSk7XG5cbmV4cG9ydCB7XG5cdG1vZGlmaWVyTmFtZXMsXG5cdGZvcmVncm91bmRDb2xvck5hbWVzLFxuXHRiYWNrZ3JvdW5kQ29sb3JOYW1lcyxcblx0Y29sb3JOYW1lcyxcblxuXHQvLyBUT0RPOiBSZW1vdmUgdGhlc2UgYWxpYXNlcyBpbiB0aGUgbmV4dCBtYWpvciB2ZXJzaW9uXG5cdG1vZGlmaWVyTmFtZXMgYXMgbW9kaWZpZXJzLFxuXHRmb3JlZ3JvdW5kQ29sb3JOYW1lcyBhcyBmb3JlZ3JvdW5kQ29sb3JzLFxuXHRiYWNrZ3JvdW5kQ29sb3JOYW1lcyBhcyBiYWNrZ3JvdW5kQ29sb3JzLFxuXHRjb2xvck5hbWVzIGFzIGNvbG9ycyxcbn0gZnJvbSAnLi92ZW5kb3IvYW5zaS1zdHlsZXMvaW5kZXguanMnO1xuXG5leHBvcnQge1xuXHRzdGRvdXRDb2xvciBhcyBzdXBwb3J0c0NvbG9yLFxuXHRzdGRlcnJDb2xvciBhcyBzdXBwb3J0c0NvbG9yU3RkZXJyLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2hhbGs7XG4iLCIvLyBUT0RPOiBXaGVuIHRhcmdldGluZyBOb2RlLmpzIDE2LCB1c2UgYFN0cmluZy5wcm90b3R5cGUucmVwbGFjZUFsbGAuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nUmVwbGFjZUFsbChzdHJpbmcsIHN1YnN0cmluZywgcmVwbGFjZXIpIHtcblx0bGV0IGluZGV4ID0gc3RyaW5nLmluZGV4T2Yoc3Vic3RyaW5nKTtcblx0aWYgKGluZGV4ID09PSAtMSkge1xuXHRcdHJldHVybiBzdHJpbmc7XG5cdH1cblxuXHRjb25zdCBzdWJzdHJpbmdMZW5ndGggPSBzdWJzdHJpbmcubGVuZ3RoO1xuXHRsZXQgZW5kSW5kZXggPSAwO1xuXHRsZXQgcmV0dXJuVmFsdWUgPSAnJztcblx0ZG8ge1xuXHRcdHJldHVyblZhbHVlICs9IHN0cmluZy5zbGljZShlbmRJbmRleCwgaW5kZXgpICsgc3Vic3RyaW5nICsgcmVwbGFjZXI7XG5cdFx0ZW5kSW5kZXggPSBpbmRleCArIHN1YnN0cmluZ0xlbmd0aDtcblx0XHRpbmRleCA9IHN0cmluZy5pbmRleE9mKHN1YnN0cmluZywgZW5kSW5kZXgpO1xuXHR9IHdoaWxlIChpbmRleCAhPT0gLTEpO1xuXG5cdHJldHVyblZhbHVlICs9IHN0cmluZy5zbGljZShlbmRJbmRleCk7XG5cdHJldHVybiByZXR1cm5WYWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ0VuY2FzZUNSTEZXaXRoRmlyc3RJbmRleChzdHJpbmcsIHByZWZpeCwgcG9zdGZpeCwgaW5kZXgpIHtcblx0bGV0IGVuZEluZGV4ID0gMDtcblx0bGV0IHJldHVyblZhbHVlID0gJyc7XG5cdGRvIHtcblx0XHRjb25zdCBnb3RDUiA9IHN0cmluZ1tpbmRleCAtIDFdID09PSAnXFxyJztcblx0XHRyZXR1cm5WYWx1ZSArPSBzdHJpbmcuc2xpY2UoZW5kSW5kZXgsIChnb3RDUiA/IGluZGV4IC0gMSA6IGluZGV4KSkgKyBwcmVmaXggKyAoZ290Q1IgPyAnXFxyXFxuJyA6ICdcXG4nKSArIHBvc3RmaXg7XG5cdFx0ZW5kSW5kZXggPSBpbmRleCArIDE7XG5cdFx0aW5kZXggPSBzdHJpbmcuaW5kZXhPZignXFxuJywgZW5kSW5kZXgpO1xuXHR9IHdoaWxlIChpbmRleCAhPT0gLTEpO1xuXG5cdHJldHVyblZhbHVlICs9IHN0cmluZy5zbGljZShlbmRJbmRleCk7XG5cdHJldHVybiByZXR1cm5WYWx1ZTtcbn1cbiIsImNvbnN0IEFOU0lfQkFDS0dST1VORF9PRkZTRVQgPSAxMDtcblxuY29uc3Qgd3JhcEFuc2kxNiA9IChvZmZzZXQgPSAwKSA9PiBjb2RlID0+IGBcXHUwMDFCWyR7Y29kZSArIG9mZnNldH1tYDtcblxuY29uc3Qgd3JhcEFuc2kyNTYgPSAob2Zmc2V0ID0gMCkgPT4gY29kZSA9PiBgXFx1MDAxQlskezM4ICsgb2Zmc2V0fTs1OyR7Y29kZX1tYDtcblxuY29uc3Qgd3JhcEFuc2kxNm0gPSAob2Zmc2V0ID0gMCkgPT4gKHJlZCwgZ3JlZW4sIGJsdWUpID0+IGBcXHUwMDFCWyR7MzggKyBvZmZzZXR9OzI7JHtyZWR9OyR7Z3JlZW59OyR7Ymx1ZX1tYDtcblxuY29uc3Qgc3R5bGVzID0ge1xuXHRtb2RpZmllcjoge1xuXHRcdHJlc2V0OiBbMCwgMF0sXG5cdFx0Ly8gMjEgaXNuJ3Qgd2lkZWx5IHN1cHBvcnRlZCBhbmQgMjIgZG9lcyB0aGUgc2FtZSB0aGluZ1xuXHRcdGJvbGQ6IFsxLCAyMl0sXG5cdFx0ZGltOiBbMiwgMjJdLFxuXHRcdGl0YWxpYzogWzMsIDIzXSxcblx0XHR1bmRlcmxpbmU6IFs0LCAyNF0sXG5cdFx0b3ZlcmxpbmU6IFs1MywgNTVdLFxuXHRcdGludmVyc2U6IFs3LCAyN10sXG5cdFx0aGlkZGVuOiBbOCwgMjhdLFxuXHRcdHN0cmlrZXRocm91Z2g6IFs5LCAyOV0sXG5cdH0sXG5cdGNvbG9yOiB7XG5cdFx0YmxhY2s6IFszMCwgMzldLFxuXHRcdHJlZDogWzMxLCAzOV0sXG5cdFx0Z3JlZW46IFszMiwgMzldLFxuXHRcdHllbGxvdzogWzMzLCAzOV0sXG5cdFx0Ymx1ZTogWzM0LCAzOV0sXG5cdFx0bWFnZW50YTogWzM1LCAzOV0sXG5cdFx0Y3lhbjogWzM2LCAzOV0sXG5cdFx0d2hpdGU6IFszNywgMzldLFxuXG5cdFx0Ly8gQnJpZ2h0IGNvbG9yXG5cdFx0YmxhY2tCcmlnaHQ6IFs5MCwgMzldLFxuXHRcdGdyYXk6IFs5MCwgMzldLCAvLyBBbGlhcyBvZiBgYmxhY2tCcmlnaHRgXG5cdFx0Z3JleTogWzkwLCAzOV0sIC8vIEFsaWFzIG9mIGBibGFja0JyaWdodGBcblx0XHRyZWRCcmlnaHQ6IFs5MSwgMzldLFxuXHRcdGdyZWVuQnJpZ2h0OiBbOTIsIDM5XSxcblx0XHR5ZWxsb3dCcmlnaHQ6IFs5MywgMzldLFxuXHRcdGJsdWVCcmlnaHQ6IFs5NCwgMzldLFxuXHRcdG1hZ2VudGFCcmlnaHQ6IFs5NSwgMzldLFxuXHRcdGN5YW5CcmlnaHQ6IFs5NiwgMzldLFxuXHRcdHdoaXRlQnJpZ2h0OiBbOTcsIDM5XSxcblx0fSxcblx0YmdDb2xvcjoge1xuXHRcdGJnQmxhY2s6IFs0MCwgNDldLFxuXHRcdGJnUmVkOiBbNDEsIDQ5XSxcblx0XHRiZ0dyZWVuOiBbNDIsIDQ5XSxcblx0XHRiZ1llbGxvdzogWzQzLCA0OV0sXG5cdFx0YmdCbHVlOiBbNDQsIDQ5XSxcblx0XHRiZ01hZ2VudGE6IFs0NSwgNDldLFxuXHRcdGJnQ3lhbjogWzQ2LCA0OV0sXG5cdFx0YmdXaGl0ZTogWzQ3LCA0OV0sXG5cblx0XHQvLyBCcmlnaHQgY29sb3Jcblx0XHRiZ0JsYWNrQnJpZ2h0OiBbMTAwLCA0OV0sXG5cdFx0YmdHcmF5OiBbMTAwLCA0OV0sIC8vIEFsaWFzIG9mIGBiZ0JsYWNrQnJpZ2h0YFxuXHRcdGJnR3JleTogWzEwMCwgNDldLCAvLyBBbGlhcyBvZiBgYmdCbGFja0JyaWdodGBcblx0XHRiZ1JlZEJyaWdodDogWzEwMSwgNDldLFxuXHRcdGJnR3JlZW5CcmlnaHQ6IFsxMDIsIDQ5XSxcblx0XHRiZ1llbGxvd0JyaWdodDogWzEwMywgNDldLFxuXHRcdGJnQmx1ZUJyaWdodDogWzEwNCwgNDldLFxuXHRcdGJnTWFnZW50YUJyaWdodDogWzEwNSwgNDldLFxuXHRcdGJnQ3lhbkJyaWdodDogWzEwNiwgNDldLFxuXHRcdGJnV2hpdGVCcmlnaHQ6IFsxMDcsIDQ5XSxcblx0fSxcbn07XG5cbmV4cG9ydCBjb25zdCBtb2RpZmllck5hbWVzID0gT2JqZWN0LmtleXMoc3R5bGVzLm1vZGlmaWVyKTtcbmV4cG9ydCBjb25zdCBmb3JlZ3JvdW5kQ29sb3JOYW1lcyA9IE9iamVjdC5rZXlzKHN0eWxlcy5jb2xvcik7XG5leHBvcnQgY29uc3QgYmFja2dyb3VuZENvbG9yTmFtZXMgPSBPYmplY3Qua2V5cyhzdHlsZXMuYmdDb2xvcik7XG5leHBvcnQgY29uc3QgY29sb3JOYW1lcyA9IFsuLi5mb3JlZ3JvdW5kQ29sb3JOYW1lcywgLi4uYmFja2dyb3VuZENvbG9yTmFtZXNdO1xuXG5mdW5jdGlvbiBhc3NlbWJsZVN0eWxlcygpIHtcblx0Y29uc3QgY29kZXMgPSBuZXcgTWFwKCk7XG5cblx0Zm9yIChjb25zdCBbZ3JvdXBOYW1lLCBncm91cF0gb2YgT2JqZWN0LmVudHJpZXMoc3R5bGVzKSkge1xuXHRcdGZvciAoY29uc3QgW3N0eWxlTmFtZSwgc3R5bGVdIG9mIE9iamVjdC5lbnRyaWVzKGdyb3VwKSkge1xuXHRcdFx0c3R5bGVzW3N0eWxlTmFtZV0gPSB7XG5cdFx0XHRcdG9wZW46IGBcXHUwMDFCWyR7c3R5bGVbMF19bWAsXG5cdFx0XHRcdGNsb3NlOiBgXFx1MDAxQlske3N0eWxlWzFdfW1gLFxuXHRcdFx0fTtcblxuXHRcdFx0Z3JvdXBbc3R5bGVOYW1lXSA9IHN0eWxlc1tzdHlsZU5hbWVdO1xuXG5cdFx0XHRjb2Rlcy5zZXQoc3R5bGVbMF0sIHN0eWxlWzFdKTtcblx0XHR9XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc3R5bGVzLCBncm91cE5hbWUsIHtcblx0XHRcdHZhbHVlOiBncm91cCxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0pO1xuXHR9XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHN0eWxlcywgJ2NvZGVzJywge1xuXHRcdHZhbHVlOiBjb2Rlcyxcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0fSk7XG5cblx0c3R5bGVzLmNvbG9yLmNsb3NlID0gJ1xcdTAwMUJbMzltJztcblx0c3R5bGVzLmJnQ29sb3IuY2xvc2UgPSAnXFx1MDAxQls0OW0nO1xuXG5cdHN0eWxlcy5jb2xvci5hbnNpID0gd3JhcEFuc2kxNigpO1xuXHRzdHlsZXMuY29sb3IuYW5zaTI1NiA9IHdyYXBBbnNpMjU2KCk7XG5cdHN0eWxlcy5jb2xvci5hbnNpMTZtID0gd3JhcEFuc2kxNm0oKTtcblx0c3R5bGVzLmJnQ29sb3IuYW5zaSA9IHdyYXBBbnNpMTYoQU5TSV9CQUNLR1JPVU5EX09GRlNFVCk7XG5cdHN0eWxlcy5iZ0NvbG9yLmFuc2kyNTYgPSB3cmFwQW5zaTI1NihBTlNJX0JBQ0tHUk9VTkRfT0ZGU0VUKTtcblx0c3R5bGVzLmJnQ29sb3IuYW5zaTE2bSA9IHdyYXBBbnNpMTZtKEFOU0lfQkFDS0dST1VORF9PRkZTRVQpO1xuXG5cdC8vIEZyb20gaHR0cHM6Ly9naXRodWIuY29tL1FpeC0vY29sb3ItY29udmVydC9ibG9iLzNmMGUwZDRlOTJlMjM1Nzk2Y2NiMTdmNmU4NWM3MjA5NGE2NTFmNDkvY29udmVyc2lvbnMuanNcblx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoc3R5bGVzLCB7XG5cdFx0cmdiVG9BbnNpMjU2OiB7XG5cdFx0XHR2YWx1ZShyZWQsIGdyZWVuLCBibHVlKSB7XG5cdFx0XHRcdC8vIFdlIHVzZSB0aGUgZXh0ZW5kZWQgZ3JleXNjYWxlIHBhbGV0dGUgaGVyZSwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mXG5cdFx0XHRcdC8vIGJsYWNrIGFuZCB3aGl0ZS4gbm9ybWFsIHBhbGV0dGUgb25seSBoYXMgNCBncmV5c2NhbGUgc2hhZGVzLlxuXHRcdFx0XHRpZiAocmVkID09PSBncmVlbiAmJiBncmVlbiA9PT0gYmx1ZSkge1xuXHRcdFx0XHRcdGlmIChyZWQgPCA4KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMTY7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKHJlZCA+IDI0OCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDIzMTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCgoKHJlZCAtIDgpIC8gMjQ3KSAqIDI0KSArIDIzMjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiAxNlxuXHRcdFx0XHRcdCsgKDM2ICogTWF0aC5yb3VuZChyZWQgLyAyNTUgKiA1KSlcblx0XHRcdFx0XHQrICg2ICogTWF0aC5yb3VuZChncmVlbiAvIDI1NSAqIDUpKVxuXHRcdFx0XHRcdCsgTWF0aC5yb3VuZChibHVlIC8gMjU1ICogNSk7XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0XHRoZXhUb1JnYjoge1xuXHRcdFx0dmFsdWUoaGV4KSB7XG5cdFx0XHRcdGNvbnN0IG1hdGNoZXMgPSAvW2EtZlxcZF17Nn18W2EtZlxcZF17M30vaS5leGVjKGhleC50b1N0cmluZygxNikpO1xuXHRcdFx0XHRpZiAoIW1hdGNoZXMpIHtcblx0XHRcdFx0XHRyZXR1cm4gWzAsIDAsIDBdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IFtjb2xvclN0cmluZ10gPSBtYXRjaGVzO1xuXG5cdFx0XHRcdGlmIChjb2xvclN0cmluZy5sZW5ndGggPT09IDMpIHtcblx0XHRcdFx0XHRjb2xvclN0cmluZyA9IFsuLi5jb2xvclN0cmluZ10ubWFwKGNoYXJhY3RlciA9PiBjaGFyYWN0ZXIgKyBjaGFyYWN0ZXIpLmpvaW4oJycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgaW50ZWdlciA9IE51bWJlci5wYXJzZUludChjb2xvclN0cmluZywgMTYpO1xuXG5cdFx0XHRcdHJldHVybiBbXG5cdFx0XHRcdFx0LyogZXNsaW50LWRpc2FibGUgbm8tYml0d2lzZSAqL1xuXHRcdFx0XHRcdChpbnRlZ2VyID4+IDE2KSAmIDB4RkYsXG5cdFx0XHRcdFx0KGludGVnZXIgPj4gOCkgJiAweEZGLFxuXHRcdFx0XHRcdGludGVnZXIgJiAweEZGLFxuXHRcdFx0XHRcdC8qIGVzbGludC1lbmFibGUgbm8tYml0d2lzZSAqL1xuXHRcdFx0XHRdO1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdH0sXG5cdFx0aGV4VG9BbnNpMjU2OiB7XG5cdFx0XHR2YWx1ZTogaGV4ID0+IHN0eWxlcy5yZ2JUb0Fuc2kyNTYoLi4uc3R5bGVzLmhleFRvUmdiKGhleCkpLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0XHRhbnNpMjU2VG9BbnNpOiB7XG5cdFx0XHR2YWx1ZShjb2RlKSB7XG5cdFx0XHRcdGlmIChjb2RlIDwgOCkge1xuXHRcdFx0XHRcdHJldHVybiAzMCArIGNvZGU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY29kZSA8IDE2KSB7XG5cdFx0XHRcdFx0cmV0dXJuIDkwICsgKGNvZGUgLSA4KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCByZWQ7XG5cdFx0XHRcdGxldCBncmVlbjtcblx0XHRcdFx0bGV0IGJsdWU7XG5cblx0XHRcdFx0aWYgKGNvZGUgPj0gMjMyKSB7XG5cdFx0XHRcdFx0cmVkID0gKCgoY29kZSAtIDIzMikgKiAxMCkgKyA4KSAvIDI1NTtcblx0XHRcdFx0XHRncmVlbiA9IHJlZDtcblx0XHRcdFx0XHRibHVlID0gcmVkO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvZGUgLT0gMTY7XG5cblx0XHRcdFx0XHRjb25zdCByZW1haW5kZXIgPSBjb2RlICUgMzY7XG5cblx0XHRcdFx0XHRyZWQgPSBNYXRoLmZsb29yKGNvZGUgLyAzNikgLyA1O1xuXHRcdFx0XHRcdGdyZWVuID0gTWF0aC5mbG9vcihyZW1haW5kZXIgLyA2KSAvIDU7XG5cdFx0XHRcdFx0Ymx1ZSA9IChyZW1haW5kZXIgJSA2KSAvIDU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IE1hdGgubWF4KHJlZCwgZ3JlZW4sIGJsdWUpICogMjtcblxuXHRcdFx0XHRpZiAodmFsdWUgPT09IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gMzA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYml0d2lzZVxuXHRcdFx0XHRsZXQgcmVzdWx0ID0gMzAgKyAoKE1hdGgucm91bmQoYmx1ZSkgPDwgMikgfCAoTWF0aC5yb3VuZChncmVlbikgPDwgMSkgfCBNYXRoLnJvdW5kKHJlZCkpO1xuXG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gMikge1xuXHRcdFx0XHRcdHJlc3VsdCArPSA2MDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0XHRyZ2JUb0Fuc2k6IHtcblx0XHRcdHZhbHVlOiAocmVkLCBncmVlbiwgYmx1ZSkgPT4gc3R5bGVzLmFuc2kyNTZUb0Fuc2koc3R5bGVzLnJnYlRvQW5zaTI1NihyZWQsIGdyZWVuLCBibHVlKSksXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR9LFxuXHRcdGhleFRvQW5zaToge1xuXHRcdFx0dmFsdWU6IGhleCA9PiBzdHlsZXMuYW5zaTI1NlRvQW5zaShzdHlsZXMuaGV4VG9BbnNpMjU2KGhleCkpLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0fSxcblx0fSk7XG5cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuY29uc3QgYW5zaVN0eWxlcyA9IGFzc2VtYmxlU3R5bGVzKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGFuc2lTdHlsZXM7XG4iLCJpbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IG9zIGZyb20gJ25vZGU6b3MnO1xuaW1wb3J0IHR0eSBmcm9tICdub2RlOnR0eSc7XG5cbi8vIEZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvaGFzLWZsYWcvYmxvYi9tYWluL2luZGV4LmpzXG4vLy8gZnVuY3Rpb24gaGFzRmxhZyhmbGFnLCBhcmd2ID0gZ2xvYmFsVGhpcy5EZW5vPy5hcmdzID8/IHByb2Nlc3MuYXJndikge1xuZnVuY3Rpb24gaGFzRmxhZyhmbGFnLCBhcmd2ID0gZ2xvYmFsVGhpcy5EZW5vID8gZ2xvYmFsVGhpcy5EZW5vLmFyZ3MgOiBwcm9jZXNzLmFyZ3YpIHtcblx0Y29uc3QgcHJlZml4ID0gZmxhZy5zdGFydHNXaXRoKCctJykgPyAnJyA6IChmbGFnLmxlbmd0aCA9PT0gMSA/ICctJyA6ICctLScpO1xuXHRjb25zdCBwb3NpdGlvbiA9IGFyZ3YuaW5kZXhPZihwcmVmaXggKyBmbGFnKTtcblx0Y29uc3QgdGVybWluYXRvclBvc2l0aW9uID0gYXJndi5pbmRleE9mKCctLScpO1xuXHRyZXR1cm4gcG9zaXRpb24gIT09IC0xICYmICh0ZXJtaW5hdG9yUG9zaXRpb24gPT09IC0xIHx8IHBvc2l0aW9uIDwgdGVybWluYXRvclBvc2l0aW9uKTtcbn1cblxuY29uc3Qge2Vudn0gPSBwcm9jZXNzO1xuXG5sZXQgZmxhZ0ZvcmNlQ29sb3I7XG5pZiAoXG5cdGhhc0ZsYWcoJ25vLWNvbG9yJylcblx0fHwgaGFzRmxhZygnbm8tY29sb3JzJylcblx0fHwgaGFzRmxhZygnY29sb3I9ZmFsc2UnKVxuXHR8fCBoYXNGbGFnKCdjb2xvcj1uZXZlcicpXG4pIHtcblx0ZmxhZ0ZvcmNlQ29sb3IgPSAwO1xufSBlbHNlIGlmIChcblx0aGFzRmxhZygnY29sb3InKVxuXHR8fCBoYXNGbGFnKCdjb2xvcnMnKVxuXHR8fCBoYXNGbGFnKCdjb2xvcj10cnVlJylcblx0fHwgaGFzRmxhZygnY29sb3I9YWx3YXlzJylcbikge1xuXHRmbGFnRm9yY2VDb2xvciA9IDE7XG59XG5cbmZ1bmN0aW9uIGVudkZvcmNlQ29sb3IoKSB7XG5cdGlmICgnRk9SQ0VfQ09MT1InIGluIGVudikge1xuXHRcdGlmIChlbnYuRk9SQ0VfQ09MT1IgPT09ICd0cnVlJykge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fVxuXG5cdFx0aWYgKGVudi5GT1JDRV9DT0xPUiA9PT0gJ2ZhbHNlJykge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVudi5GT1JDRV9DT0xPUi5sZW5ndGggPT09IDAgPyAxIDogTWF0aC5taW4oTnVtYmVyLnBhcnNlSW50KGVudi5GT1JDRV9DT0xPUiwgMTApLCAzKTtcblx0fVxufVxuXG5mdW5jdGlvbiB0cmFuc2xhdGVMZXZlbChsZXZlbCkge1xuXHRpZiAobGV2ZWwgPT09IDApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGxldmVsLFxuXHRcdGhhc0Jhc2ljOiB0cnVlLFxuXHRcdGhhczI1NjogbGV2ZWwgPj0gMixcblx0XHRoYXMxNm06IGxldmVsID49IDMsXG5cdH07XG59XG5cbmZ1bmN0aW9uIF9zdXBwb3J0c0NvbG9yKGhhdmVTdHJlYW0sIHtzdHJlYW1Jc1RUWSwgc25pZmZGbGFncyA9IHRydWV9ID0ge30pIHtcblx0Y29uc3Qgbm9GbGFnRm9yY2VDb2xvciA9IGVudkZvcmNlQ29sb3IoKTtcblx0aWYgKG5vRmxhZ0ZvcmNlQ29sb3IgIT09IHVuZGVmaW5lZCkge1xuXHRcdGZsYWdGb3JjZUNvbG9yID0gbm9GbGFnRm9yY2VDb2xvcjtcblx0fVxuXG5cdGNvbnN0IGZvcmNlQ29sb3IgPSBzbmlmZkZsYWdzID8gZmxhZ0ZvcmNlQ29sb3IgOiBub0ZsYWdGb3JjZUNvbG9yO1xuXG5cdGlmIChmb3JjZUNvbG9yID09PSAwKSB7XG5cdFx0cmV0dXJuIDA7XG5cdH1cblxuXHRpZiAoc25pZmZGbGFncykge1xuXHRcdGlmIChoYXNGbGFnKCdjb2xvcj0xNm0nKVxuXHRcdFx0fHwgaGFzRmxhZygnY29sb3I9ZnVsbCcpXG5cdFx0XHR8fCBoYXNGbGFnKCdjb2xvcj10cnVlY29sb3InKSkge1xuXHRcdFx0cmV0dXJuIDM7XG5cdFx0fVxuXG5cdFx0aWYgKGhhc0ZsYWcoJ2NvbG9yPTI1NicpKSB7XG5cdFx0XHRyZXR1cm4gMjtcblx0XHR9XG5cdH1cblxuXHQvLyBDaGVjayBmb3IgQXp1cmUgRGV2T3BzIHBpcGVsaW5lcy5cblx0Ly8gSGFzIHRvIGJlIGFib3ZlIHRoZSBgIXN0cmVhbUlzVFRZYCBjaGVjay5cblx0aWYgKCdURl9CVUlMRCcgaW4gZW52ICYmICdBR0VOVF9OQU1FJyBpbiBlbnYpIHtcblx0XHRyZXR1cm4gMTtcblx0fVxuXG5cdGlmIChoYXZlU3RyZWFtICYmICFzdHJlYW1Jc1RUWSAmJiBmb3JjZUNvbG9yID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gMDtcblx0fVxuXG5cdGNvbnN0IG1pbiA9IGZvcmNlQ29sb3IgfHwgMDtcblxuXHRpZiAoZW52LlRFUk0gPT09ICdkdW1iJykge1xuXHRcdHJldHVybiBtaW47XG5cdH1cblxuXHRpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xuXHRcdC8vIFdpbmRvd3MgMTAgYnVpbGQgMTA1ODYgaXMgdGhlIGZpcnN0IFdpbmRvd3MgcmVsZWFzZSB0aGF0IHN1cHBvcnRzIDI1NiBjb2xvcnMuXG5cdFx0Ly8gV2luZG93cyAxMCBidWlsZCAxNDkzMSBpcyB0aGUgZmlyc3QgcmVsZWFzZSB0aGF0IHN1cHBvcnRzIDE2bS9UcnVlQ29sb3IuXG5cdFx0Y29uc3Qgb3NSZWxlYXNlID0gb3MucmVsZWFzZSgpLnNwbGl0KCcuJyk7XG5cdFx0aWYgKFxuXHRcdFx0TnVtYmVyKG9zUmVsZWFzZVswXSkgPj0gMTBcblx0XHRcdCYmIE51bWJlcihvc1JlbGVhc2VbMl0pID49IDEwXzU4NlxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIE51bWJlcihvc1JlbGVhc2VbMl0pID49IDE0XzkzMSA/IDMgOiAyO1xuXHRcdH1cblxuXHRcdHJldHVybiAxO1xuXHR9XG5cblx0aWYgKCdDSScgaW4gZW52KSB7XG5cdFx0aWYgKCdHSVRIVUJfQUNUSU9OUycgaW4gZW52IHx8ICdHSVRFQV9BQ1RJT05TJyBpbiBlbnYpIHtcblx0XHRcdHJldHVybiAzO1xuXHRcdH1cblxuXHRcdGlmIChbJ1RSQVZJUycsICdDSVJDTEVDSScsICdBUFBWRVlPUicsICdHSVRMQUJfQ0knLCAnQlVJTERLSVRFJywgJ0RST05FJ10uc29tZShzaWduID0+IHNpZ24gaW4gZW52KSB8fCBlbnYuQ0lfTkFNRSA9PT0gJ2NvZGVzaGlwJykge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1pbjtcblx0fVxuXG5cdGlmICgnVEVBTUNJVFlfVkVSU0lPTicgaW4gZW52KSB7XG5cdFx0cmV0dXJuIC9eKDlcXC4oMCpbMS05XVxcZCopXFwufFxcZHsyLH1cXC4pLy50ZXN0KGVudi5URUFNQ0lUWV9WRVJTSU9OKSA/IDEgOiAwO1xuXHR9XG5cblx0aWYgKGVudi5DT0xPUlRFUk0gPT09ICd0cnVlY29sb3InKSB7XG5cdFx0cmV0dXJuIDM7XG5cdH1cblxuXHRpZiAoZW52LlRFUk0gPT09ICd4dGVybS1raXR0eScpIHtcblx0XHRyZXR1cm4gMztcblx0fVxuXG5cdGlmICgnVEVSTV9QUk9HUkFNJyBpbiBlbnYpIHtcblx0XHRjb25zdCB2ZXJzaW9uID0gTnVtYmVyLnBhcnNlSW50KChlbnYuVEVSTV9QUk9HUkFNX1ZFUlNJT04gfHwgJycpLnNwbGl0KCcuJylbMF0sIDEwKTtcblxuXHRcdHN3aXRjaCAoZW52LlRFUk1fUFJPR1JBTSkge1xuXHRcdFx0Y2FzZSAnaVRlcm0uYXBwJzoge1xuXHRcdFx0XHRyZXR1cm4gdmVyc2lvbiA+PSAzID8gMyA6IDI7XG5cdFx0XHR9XG5cblx0XHRcdGNhc2UgJ0FwcGxlX1Rlcm1pbmFsJzoge1xuXHRcdFx0XHRyZXR1cm4gMjtcblx0XHRcdH1cblx0XHRcdC8vIE5vIGRlZmF1bHRcblx0XHR9XG5cdH1cblxuXHRpZiAoLy0yNTYoY29sb3IpPyQvaS50ZXN0KGVudi5URVJNKSkge1xuXHRcdHJldHVybiAyO1xuXHR9XG5cblx0aWYgKC9ec2NyZWVufF54dGVybXxednQxMDB8XnZ0MjIwfF5yeHZ0fGNvbG9yfGFuc2l8Y3lnd2lufGxpbnV4L2kudGVzdChlbnYuVEVSTSkpIHtcblx0XHRyZXR1cm4gMTtcblx0fVxuXG5cdGlmICgnQ09MT1JURVJNJyBpbiBlbnYpIHtcblx0XHRyZXR1cm4gMTtcblx0fVxuXG5cdHJldHVybiBtaW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdXBwb3J0c0NvbG9yKHN0cmVhbSwgb3B0aW9ucyA9IHt9KSB7XG5cdGNvbnN0IGxldmVsID0gX3N1cHBvcnRzQ29sb3Ioc3RyZWFtLCB7XG5cdFx0c3RyZWFtSXNUVFk6IHN0cmVhbSAmJiBzdHJlYW0uaXNUVFksXG5cdFx0Li4ub3B0aW9ucyxcblx0fSk7XG5cblx0cmV0dXJuIHRyYW5zbGF0ZUxldmVsKGxldmVsKTtcbn1cblxuY29uc3Qgc3VwcG9ydHNDb2xvciA9IHtcblx0c3Rkb3V0OiBjcmVhdGVTdXBwb3J0c0NvbG9yKHtpc1RUWTogdHR5LmlzYXR0eSgxKX0pLFxuXHRzdGRlcnI6IGNyZWF0ZVN1cHBvcnRzQ29sb3Ioe2lzVFRZOiB0dHkuaXNhdHR5KDIpfSksXG59O1xuXG5leHBvcnQgZGVmYXVsdCBzdXBwb3J0c0NvbG9yO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9zZXJ2ZXIyLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
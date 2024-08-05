/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/FrameGroup.ts":
/*!***************************!*\
  !*** ./src/FrameGroup.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FrameGroup: () => (/* binding */ FrameGroup)
/* harmony export */ });
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


/***/ }),

/***/ "./src/Matrix.ts":
/*!***********************!*\
  !*** ./src/Matrix.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Matrix: () => (/* binding */ Matrix)
/* harmony export */ });
/* harmony import */ var _FrameGroup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./FrameGroup */ "./src/FrameGroup.ts");

class Matrix {
    constructor(width, height, framesPerSecond, framesPerGroup, startTime) {
        this.width = width;
        this.height = height;
        this.framesPerSecond = framesPerSecond;
        this.framesPerGroup = framesPerGroup;
        this.startTime = startTime;
        this.lastEndTime = startTime;
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
        return new _FrameGroup__WEBPACK_IMPORTED_MODULE_0__.FrameGroup(startTime, frameInterval, frameCount, this.framesPerSecond, framePositions, totalHeight, this.width);
    }
}


/***/ }),

/***/ "./src/MatrixElement.ts":
/*!******************************!*\
  !*** ./src/MatrixElement.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MatrixElement: () => (/* binding */ MatrixElement)
/* harmony export */ });
class MatrixElement {
    constructor(content, x, y, width, height) {
        this.content = content;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.modifiers = [];
        this.textStyle = {};
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
        this.textWidth = this.calculateTextWidth();
    }
    updateTextStyle(newStyles) {
        Object.assign(this.textStyle, newStyles);
        this.textWidth = this.calculateTextWidth();
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
    // Метод для рендеринга элемента в указанный контейнер
    renderTo(container) {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = `${Math.floor(this.x + 0.0001)}px`;
        div.style.top = `${Math.floor(this.y + 0.0001)}px`;
        div.style.width = `${this.width}px`;
        div.style.height = `${this.height}px`;
        div.style.overflow = 'hidden';
        Object.assign(div.style, this.textStyle); // Применяем стили
        if (typeof this.content === 'string') {
            div.innerText = this.content;
        }
        else if (this.content instanceof HTMLImageElement || this.content instanceof SVGElement) {
            div.appendChild(this.content);
        }
        container.appendChild(div);
    }
}


/***/ }),

/***/ "./src/Modifiers.ts":
/*!**************************!*\
  !*** ./src/Modifiers.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DynamicModifier: () => (/* binding */ DynamicModifier),
/* harmony export */   RainbowEffectModifier: () => (/* binding */ RainbowEffectModifier),
/* harmony export */   RotationModifier: () => (/* binding */ RotationModifier),
/* harmony export */   ScrollingTextModifier: () => (/* binding */ ScrollingTextModifier)
/* harmony export */ });
class DynamicModifier {
    constructor(element) {
        this.element = element;
    }
}
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
class ScrollingTextModifier extends DynamicModifier {
    constructor(element, speedPixelsPerSecond) {
        super(element);
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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
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
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Matrix__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Matrix */ "./src/Matrix.ts");
/* harmony import */ var _MatrixElement__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./MatrixElement */ "./src/MatrixElement.ts");
/* harmony import */ var _Modifiers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Modifiers */ "./src/Modifiers.ts");



let ws = null;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    const container = document.getElementById('matrix-container');
    if (!container) {
        console.error('Container not found!');
        return;
    }
    // Создание элементов матрицы
    const textElement1 = new _MatrixElement__WEBPACK_IMPORTED_MODULE_1__.MatrixElement("Running text 1", 0, 0, 128, 20);
    textElement1.updateTextStyle({
        fontSize: '12px',
        color: 'lime',
        fontWeight: 'bold'
    });
    const textElement2 = new _MatrixElement__WEBPACK_IMPORTED_MODULE_1__.MatrixElement("Running text 2", 0, 30, 128, 20);
    textElement2.updateTextStyle({
        fontSize: '12px',
        color: 'red',
        fontWeight: 'bold'
    });
    // Создание элемента для отображения текущего времени
    const timeElement = new _MatrixElement__WEBPACK_IMPORTED_MODULE_1__.MatrixElement("", 0, 15, 128, 20); // Центрируем элемент по вертикали
    timeElement.updateTextStyle({
        fontSize: '12px',
        color: 'yellow',
        fontWeight: 'bold',
        textAlign: 'center' // Выравнивание текста по центру
    });
    // Добавление коллбэка для обновления времени
    timeElement.setTextUpdateCallback((timestamp) => {
        const now = new Date(timestamp);
        return now.toISOString().substr(11, 12); // Формат времени с миллисекундами (HH:mm:ss.sss)
    });
    // Добавление модификаторов к элементам
    const scrollingModifier1 = new _Modifiers__WEBPACK_IMPORTED_MODULE_2__.ScrollingTextModifier(textElement1, 20);
    textElement1.addModifier(scrollingModifier1);
    const rainbowModifier1 = new _Modifiers__WEBPACK_IMPORTED_MODULE_2__.RainbowEffectModifier(textElement1, 2000);
    textElement1.addModifier(rainbowModifier1);
    const scrollingModifier2 = new _Modifiers__WEBPACK_IMPORTED_MODULE_2__.ScrollingTextModifier(textElement2, 30);
    textElement2.addModifier(scrollingModifier2);
    const rainbowModifier2 = new _Modifiers__WEBPACK_IMPORTED_MODULE_2__.RainbowEffectModifier(textElement2, 2500);
    textElement2.addModifier(rainbowModifier2);
    // Создание и отображение группы кадров с несколькими элементами
    const matrix = new _Matrix__WEBPACK_IMPORTED_MODULE_0__.Matrix(128, 64, 30, 15, Date.now());
    if (!ws) {
        ws = new WebSocket('ws://localhost:8081');
        ws.onopen = () => {
            console.log('WebSocket connection opened');
        };
        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.command === 'generateNextGroup') {
                    let frameGroup = matrix.generateNextGroup(container, [textElement1, textElement2, timeElement]);
                    ws.send(JSON.stringify({ frameGroup }));
                }
                if (message.command === 'setStartTime') {
                    matrix.setStartTime(message.value);
                }
            }
            catch (e) {
                console.error('Error processing message:', e);
            }
        };
        ws.onclose = () => {
            console.log('WebSocket connection closed');
            ws = null; // Reset the WebSocket instance to allow reconnection
        };
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
});

/******/ })()
;
//# sourceMappingURL=index.bundle.js.map
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ledMatrixRenderer.ts":
/*!**********************************!*\
  !*** ./src/ledMatrixRenderer.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LEDMatrix: () => (/* binding */ LEDMatrix)
/* harmony export */ });
class LEDMatrix {
    constructor(containerId, width, height, frameCount) {
        this.container = document.getElementById(containerId);
        this.width = width;
        this.height = height;
        this.frameCount = frameCount;
        this.container.style.width = `${this.width}px`;
        this.container.style.height = `${this.height}px`;
        this.container.style.overflow = 'hidden';
        this.container.style.position = 'relative';
    }
    renderFrame(text, positionX, positionY) {
        const frame = document.createElement('div');
        frame.className = 'frame';
        frame.style.position = 'absolute';
        // frame.style.width = `${this.width}px`;
        frame.style.height = `${this.height / this.frameCount}px`; // высота фрейма должна быть меньше общей высоты, если количество кадров больше 1
        // frame.style.overflow = 'hidden';
        frame.style.top = `${positionY}px`;
        const rainbowText = document.createElement('div');
        rainbowText.className = 'rainbow-text';
        rainbowText.innerHTML = text;
        rainbowText.style.position = 'absolute';
        rainbowText.style.whiteSpace = 'nowrap';
        rainbowText.style.left = `${Math.floor(positionX)}px`;
        frame.appendChild(rainbowText);
        this.container.appendChild(frame);
    }
}


/***/ }),

/***/ "./src/rainbow.ts":
/*!************************!*\
  !*** ./src/rainbow.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createRainbowGradient: () => (/* binding */ createRainbowGradient)
/* harmony export */ });
function createRainbowGradient(text, progress) {
    // Генерация градиента, применяемого ко всему тексту
    const gradientText = `<span style="background: linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet);
                            background-clip: text; -webkit-background-clip: text; color: transparent;
                            background-size: 200%; background-position: ${progress * 100}%;">
                            ${text}
                          </span>`;
    return gradientText;
}


/***/ }),

/***/ "./src/scrollingText.ts":
/*!******************************!*\
  !*** ./src/scrollingText.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ScrollingText: () => (/* binding */ ScrollingText)
/* harmony export */ });
class ScrollingText {
    constructor(text, resolutionX, speed, startTime) {
        this.text = text;
        this.startTime = startTime;
        this.resolutionX = resolutionX;
        this.speed = speed;
        this.position = resolutionX; // Начальная позиция текста
    }
    // Обновление позиции с учётом времени
    updatePosition(currentTime) {
        // Получаем реальную ширину текста из DOM-элемента
        const textElement = document.createElement('span');
        textElement.style.visibility = 'hidden'; // Скрываем элемент от отображения
        textElement.style.whiteSpace = 'nowrap'; // Избегаем переноса строки
        textElement.textContent = this.text;
        document.body.appendChild(textElement);
        const textWidth = textElement.offsetWidth;
        this.position = this.resolutionX - (this.speed * (currentTime - this.startTime));
        document.body.removeChild(textElement);
        if (this.position < -textWidth) {
            this.position = this.resolutionX;
            this.startTime = currentTime;
        }
    }
    // Установка нового текста
    setText(newText) {
        this.text = newText;
    }
    // Получение текущей позиции
    getPosition() {
        return this.position;
    }
    // Получение текущего текста
    getText() {
        return this.text;
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
/* harmony import */ var _ledMatrixRenderer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ledMatrixRenderer */ "./src/ledMatrixRenderer.ts");
/* harmony import */ var _scrollingText__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scrollingText */ "./src/scrollingText.ts");
/* harmony import */ var _rainbow__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./rainbow */ "./src/rainbow.ts");



class AnimationFrameGenerator {
    constructor(containerId, width, height, framesPerSecond, frameCount, speed, startTime, wsUrl) {
        this.container = document.getElementById(containerId);
        this.width = width;
        this.height = height;
        this.startTime = startTime;
        this.framesPerSecond = framesPerSecond;
        this.frameCount = frameCount;
        this.speed = speed / 1000;
        this.generatedGroups = 0;
        this.scrollingText = new _scrollingText__WEBPACK_IMPORTED_MODULE_1__.ScrollingText("", width, this.speed, startTime);
        this.matrix = new _ledMatrixRenderer__WEBPACK_IMPORTED_MODULE_0__.LEDMatrix(containerId, width, height * frameCount, frameCount);
        this.ws = new WebSocket(wsUrl);
        this.ws.onopen = () => {
            console.log('WebSocket connected');
        };
        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.command === 'generateNextGroup') {
                    this.generateAndSendNextGroup();
                }
            }
            catch (e) {
            }
        };
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
        };
    }
    clearDOM() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }
    generateTimeStrings() {
        const timeStrings = [];
        const frameInterval = 1000 / this.framesPerSecond;
        let time = this.startTime + this.generatedGroups * this.frameCount * frameInterval;
        for (let i = 0; i < this.frameCount; i++) {
            const date = new Date(time + i * frameInterval);
            const timeString = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`;
            timeStrings.push(timeString);
        }
        return timeStrings;
    }
    generateNextGroup() {
        this.clearDOM();
        const textArray = this.generateTimeStrings();
        const frameInterval = 1000 / this.framesPerSecond;
        let groupStartTime = this.startTime + this.generatedGroups * this.frameCount * frameInterval;
        const framePositions = [];
        for (let i = 0; i < this.frameCount; i++) {
            const currentTime = groupStartTime + i * frameInterval;
            this.scrollingText.setText(textArray[i]);
            this.scrollingText.updatePosition(currentTime);
            const rainbowPeriod = 2000;
            const progress = ((currentTime - this.startTime) % rainbowPeriod) / rainbowPeriod;
            const gradientText = (0,_rainbow__WEBPACK_IMPORTED_MODULE_2__.createRainbowGradient)(this.scrollingText.getText(), progress);
            this.matrix.renderFrame(gradientText, this.scrollingText.getPosition(), i * this.height);
            framePositions.push(this.scrollingText.getPosition());
        }
        this.generatedGroups += 1;
        return {
            startTime: groupStartTime,
            frameInterval: frameInterval,
            frameCount: this.frameCount,
            speed: this.speed,
            framePositions: framePositions,
            totalHeight: this.height * this.frameCount
        };
    }
    generateAndSendNextGroup() {
        const frameGroup = this.generateNextGroup();
        this.ws.send(JSON.stringify({ frameGroup }));
    }
}
// Пример использования
const animationGenerator = new AnimationFrameGenerator('animation-container', 96, 32, 60, 15, 15, Date.now(), 'ws://localhost:8081');

/******/ })()
;
//# sourceMappingURL=index.bundle.js.map
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/player.ts":
/*!***********************!*\
  !*** ./src/player.ts ***!
  \***********************/
/***/ (function() {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const timestampSpan = document.getElementById('timestamp');
const deltaSpan = document.getElementById('delta');
const fpsSpan = document.getElementById('fps');
let width;
let height;
const frameBuffer = [];
const bufferLimit = 500;
let frameCount = 0;
let lastFTime = 0;
const wait = (ms) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(res => setTimeout(res, ms));
});
// Создаем Web Worker
const worker = new Worker('imageWorker.js');
worker.onmessage = (event) => {
    const frames = event.data;
    frames.forEach((frame) => {
        frameBuffer.push(frame);
        if (frameBuffer.length > bufferLimit) {
            frameBuffer.shift();
        }
        frameCount++;
    });
};
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (Array.isArray(data)) {
        // Если пришел массив кадров, обрабатываем его
        data.forEach((frame) => {
            frameBuffer.push(frame);
            if (frameBuffer.length > bufferLimit) {
                frameBuffer.shift();
            }
            frameCount++;
        });
    }
    else if (data.imageBuffer) {
        // Если пришла FrameGroup, передаем данные на нарезку в Worker
        worker.postMessage(data);
    }
};
let fps = 0;
function displayFrame() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (frameBuffer.length > 0) {
            const frame = frameBuffer.shift();
            const frameTime = frame.timeStamp;
            const currentTime = Date.now();
            const timeToWait = frameTime - currentTime;
            if (timeToWait > 0) {
                yield wait(timeToWait);
            }
            fps++;
            const image = new Image();
            image.src = `data:image/png;base64,${frame.imageBuffer}`;
            image.onload = () => {
                // Получаем фактические размеры изображения
                width = image.naturalWidth;
                height = image.naturalHeight;
                // Рассчитываем scale для текущего размера окна
                const maxWidth = window.innerWidth;
                const maxHeight = window.innerHeight;
                const scaleX = maxWidth / width;
                const scaleY = maxHeight / height;
                const scale = Math.min(scaleX, scaleY); // Округляем масштаб до меньшего целого
                // Настраиваем canvas
                canvas.width = width * scale;
                canvas.height = height * scale;
                canvas.style.width = `${canvas.width >> 0}px`;
                canvas.style.height = `${canvas.height >> 0}px`;
                // Отключаем сглаживание изображений
                ctx.imageSmoothingEnabled = false;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Рисуем изображение с учетом масштаба
                ctx.drawImage(image, 0, 0, width * scale, height * scale);
                // Теперь рисуем сетку поверх изображения
                drawPixelGrid(scale);
                deltaSpan.textContent = `${(Date.now() - frameTime) >> 0} ms` + " buff: " + frameBuffer.length + " delta frame: " + ((frameTime - lastFTime) >> 0).toString();
                lastFTime = frameTime;
                timestampSpan.textContent = `${new Date(frame.timeStamp).toISOString().substr(14, 9)}`;
            };
        }
        if (Number.parseInt((_a = deltaSpan.textContent) !== null && _a !== void 0 ? _a : '0') < 10) {
            requestAnimationFrame(displayFrame);
        }
        else {
            setTimeout(() => displayFrame(), 0);
        }
    });
}
setInterval(() => {
    fpsSpan.textContent = fps.toString();
    fps = 0;
}, 1000);
ws.onopen = () => __awaiter(void 0, void 0, void 0, function* () {
    yield displayFrame();
});
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};
function drawPixelGrid(scale) {
    ctx.strokeStyle = 'white'; // Можно вернуть на white после тестирования
    ctx.lineWidth = 0.1;
    for (let x = 0; x < canvas.width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/player.ts"]();
/******/ 	
/******/ })()
;
//# sourceMappingURL=player.bundle.js.map
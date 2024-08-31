"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Matrix = void 0;
const FrameGroup_1 = require("./FrameGroup");
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
//# sourceMappingURL=Matrix.js.map
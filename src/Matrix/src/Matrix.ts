import {MatrixElement} from "./MatrixElement";
import {FrameGroup} from "./FrameGroup";

export class Matrix {
    width: number;
    height: number;
    framesPerSecond: number;
    framesPerGroup: number;
    startTime: number;
    lastEndTime: number;
    private elementIdCounter: number = 0;
    public elements: MatrixElement[] = [];
    private matrixStyles: Partial<CSSStyleDeclaration>; // Добавляем свойство для хранения стилей

    constructor(width: number, height: number, framesPerSecond: number, framesPerGroup: number, startTime: number, matrixStyles: Partial<CSSStyleDeclaration> = {}) {
        this.width = width;
        this.height = height;
        this.framesPerSecond = framesPerSecond;
        this.framesPerGroup = framesPerGroup;
        this.startTime = startTime;
        this.lastEndTime = startTime;
        this.matrixStyles = matrixStyles; // Сохраняем переданные стили
    }

    generateElementId(): string {
        return `element-${this.elementIdCounter++}`;
    }

    setStartTime(newStartTime: number) {
        this.startTime = newStartTime;
        this.lastEndTime = newStartTime;
    }

    generateNextGroup(container: HTMLElement, matrixElements: MatrixElement[]): FrameGroup {
        const existingFrames = Array.from(container.children) as HTMLElement[];
        const frameInterval = 1000 / this.framesPerSecond;
        const frameCount = this.framesPerGroup;

        // Начало новой группы
        const startTime = this.lastEndTime;
        const framePositions = Array.from({ length: frameCount }, (_, i) => startTime + i * frameInterval);
        this.lastEndTime = startTime + frameInterval * frameCount;

        // Применяем стили к контейнеру матрицы
        Object.assign(container.style, this.matrixStyles);

        for (let i = 0; i < frameCount; i++) {
            let frame: HTMLElement;

            if (i < existingFrames.length) {
                // Используем существующий элемент
                frame = existingFrames[i];
            } else {
                // Создаем новый элемент, если его еще нет
                frame = document.createElement('div');
                frame.style.position = 'absolute';
                frame.style.width = `${this.width}px`;
                frame.style.height = `${this.height}px`;
                frame.style.overflow = 'hidden';
                Object.assign(frame.style, this.matrixStyles)
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
        return new FrameGroup(startTime, frameInterval, frameCount, this.framesPerSecond, framePositions, totalHeight, this.width);
    }

    addElement(matrixElement: MatrixElement) {
        if (!this.elements.includes(matrixElement)) {
            this.elements.push(matrixElement);
        }
    }

    removeElement(matrixElement: MatrixElement) {
        this.elements = this.elements.filter(x => x !== matrixElement);
    }

    clearElements() {
        this.elements = [];
    }
}

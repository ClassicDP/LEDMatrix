import { FrameGroup } from "./FrameGroup";
export class Matrix {
    constructor(width, height, framesPerSecond, framesPerGroup, startTime) {
        this.width = width;
        this.height = height;
        this.framesPerSecond = framesPerSecond;
        this.framesPerGroup = framesPerGroup;
        this.startTime = startTime;
        this.lastEndTime = startTime;
    }
    generateNextGroup(container, matrixElements) {
        // Очищаем контейнер от всех элементов, чтобы избежать артефактов
        container.innerHTML = '';
        const frameInterval = 1000 / this.framesPerSecond;
        const frameCount = this.framesPerGroup;
        // Начало новой группы
        const startTime = this.lastEndTime;
        // Рассчитываем позиции каждого кадра
        const framePositions = Array.from({ length: frameCount }, (_, i) => startTime + i * frameInterval);
        this.lastEndTime = startTime + frameInterval * frameCount;
        // Создаем кадры и размещаем их вертикально один под другим
        for (let i = 0; i < framePositions.length; i++) {
            const frame = document.createElement('div');
            frame.style.position = 'absolute';
            frame.style.width = `${this.width}px`;
            frame.style.height = `${this.height}px`;
            frame.style.overflow = 'hidden'; // Скрываем текст за пределами блока
            frame.style.top = `${i * this.height}px`; // Располагаем один блок под другим
            // Применяем модификаторы и рендерим каждый элемент матрицы
            for (const matrixElement of matrixElements) {
                matrixElement.applyModifiers(framePositions[i]);
                matrixElement.renderTo(frame);
            }
            // Вставляем содержимое в контейнер кадра
            container.appendChild(frame);
        }
        // Удаляем лишние элементы, если они остались
        const extraElements = document.querySelectorAll('#matrix-container > div');
        extraElements.forEach(el => {
            if (!el.querySelector('div')) {
                el.remove();
            }
        });
        const totalHeight = this.height * frameCount;
        return new FrameGroup(startTime, frameInterval, frameCount, this.framesPerSecond, framePositions, totalHeight, this.width);
    }
}
//# sourceMappingURL=Matrix.js.map
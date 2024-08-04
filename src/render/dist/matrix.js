export class Matrix {
    constructor(width, height, framesPerSecond, framesPerGroup, startTime) {
        this.width = width;
        this.height = height;
        this.framesPerSecond = framesPerSecond;
        this.framesPerGroup = framesPerGroup;
        this.startTime = startTime;
        this.lastEndTime = startTime;
    }
    generateNextGroup(container, matrixElement) {
        // Очищаем контейнер от всех элементов, чтобы избежать артефактов
        container.innerHTML = '';
        const frameInterval = 1000 / this.framesPerSecond;
        const frameCount = this.framesPerGroup;
        const startTime = this.lastEndTime;
        const endTime = startTime + frameInterval * frameCount;
        this.lastEndTime = endTime;
        const framePositions = Array.from({ length: frameCount }, (_, i) => startTime + i * frameInterval);
        // Создаем кадры и размещаем их вертикально один под другим
        for (let i = 0; i < framePositions.length; i++) {
            const frame = document.createElement('div');
            frame.style.position = 'absolute';
            frame.style.width = `${this.width}px`;
            frame.style.height = `${matrixElement.height}px`;
            frame.style.overflow = 'hidden'; // Скрываем текст за пределами блока
            frame.style.top = `${i * matrixElement.height}px`; // Располагаем один блок под другим
            // Применяем модификаторы к элементу на основе текущего таймштампа кадра
            matrixElement.applyModifiers(framePositions[i]);
            // Рендерим элемент в текущий фрейм
            matrixElement.renderTo(frame);
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
    }
}
//# sourceMappingURL=Matrix.js.map
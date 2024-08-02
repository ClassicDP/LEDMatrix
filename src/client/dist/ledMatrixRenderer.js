export class LEDMatrix {
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
        frame.style.width = `${this.width}px`;
        frame.style.height = `${this.height / this.frameCount}px`; // высота фрейма должна быть меньше общей высоты, если количество кадров больше 1
        frame.style.overflow = 'hidden';
        frame.style.left = `${Math.floor(positionX)}px`;
        frame.style.top = `${positionY}px`;
        const rainbowText = document.createElement('div');
        rainbowText.className = 'rainbow-text';
        rainbowText.innerHTML = text;
        rainbowText.style.position = 'absolute';
        rainbowText.style.whiteSpace = 'nowrap';
        frame.appendChild(rainbowText);
        this.container.appendChild(frame);
    }
}
//# sourceMappingURL=ledMatrixRenderer.js.map
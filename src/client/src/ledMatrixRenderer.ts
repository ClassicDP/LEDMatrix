export class LEDMatrix {
    private container: HTMLElement;
    private width: number;
    private height: number;

    constructor(containerId: string, width: number, height: number) {
        this.container = document.getElementById(containerId)!;
        this.width = width;
        this.height = height;
        this.container.style.width = `${this.width}px`;
        this.container.style.height = `${this.height}px`;
        this.container.style.overflow = 'hidden';
        this.container.style.position = 'relative';
    }

    renderFrame(text: string, positionX: number, positionY: number): void {
        const frame = document.createElement('div');
        frame.className = 'frame';
        frame.style.position = 'absolute';
        frame.style.width = `${this.width}px`;
        frame.style.height = `${this.height / 10}px`; // высота фрейма должна быть меньше общей высоты, если количество кадров больше 1
        frame.style.overflow = 'hidden';
        frame.style.left = `${positionX}px`;
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

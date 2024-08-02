export class ScrollingText {
    private text: string;
    private resolutionX: number;
    private speed: number;
    private position: number;

    constructor(text: string, resolutionX: number, speed: number) {
        this.text = text;
        this.resolutionX = resolutionX;
        this.speed = speed;
        this.position = resolutionX; // Начальная позиция текста
    }

    // Обновление позиции с учётом времени
    updatePosition(deltaTime: number): void {
        this.position -= this.speed * deltaTime;
        console.log("+-----",this.speed, deltaTime, this.position)

        // Получаем реальную ширину текста из DOM-элемента
        const textElement = document.createElement('span');
        textElement.style.visibility = 'hidden'; // Скрываем элемент от отображения
        textElement.style.whiteSpace = 'nowrap'; // Избегаем переноса строки
        textElement.textContent = this.text;
        document.body.appendChild(textElement);
        const textWidth = textElement.offsetWidth;
        document.body.removeChild(textElement);

        if (this.position < -textWidth) {
            this.position = this.resolutionX;
        }
    }

    // Установка нового текста
    setText(newText: string): void {
        this.text = newText;
    }

    // Получение текущей позиции
    getPosition(): number {
        return this.position;
    }

    // Получение текущего текста
    getText(): string {
        return this.text;
    }
}

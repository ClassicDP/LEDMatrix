export class ScrollingText {
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
//# sourceMappingURL=scrollingText.js.map
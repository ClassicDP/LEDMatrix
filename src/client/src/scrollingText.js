"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollingText = void 0;
var ScrollingText = /** @class */ (function () {
    function ScrollingText(text, resolutionX, speed) {
        this.text = text;
        this.resolutionX = resolutionX;
        this.speed = speed;
        this.position = resolutionX; // Начальная позиция текста
    }
    // Обновление позиции с учётом времени
    ScrollingText.prototype.updatePosition = function (deltaTime) {
        this.position -= this.speed * deltaTime;
        console.log("-----", this.speed, deltaTime, this.position);
        // Получаем реальную ширину текста из DOM-элемента
        var textElement = document.createElement('span');
        textElement.style.visibility = 'hidden'; // Скрываем элемент от отображения
        textElement.style.whiteSpace = 'nowrap'; // Избегаем переноса строки
        textElement.textContent = this.text;
        document.body.appendChild(textElement);
        var textWidth = textElement.offsetWidth;
        document.body.removeChild(textElement);
        if (this.position < -textWidth) {
            this.position = this.resolutionX;
        }
    };
    // Установка нового текста
    ScrollingText.prototype.setText = function (newText) {
        this.text = newText;
    };
    // Получение текущей позиции
    ScrollingText.prototype.getPosition = function () {
        return this.position;
    };
    // Получение текущего текста
    ScrollingText.prototype.getText = function () {
        return this.text;
    };
    return ScrollingText;
}());
exports.ScrollingText = ScrollingText;

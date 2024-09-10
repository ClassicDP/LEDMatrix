"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeMatrixElement = exports.MatrixElement = void 0;
class MatrixElement {
    constructor(matrix, content, x, y, width, height) {
        this.visible = true;
        this.layer = 0;
        this.id = matrix.generateElementId();
        this.content = content;
        this.x = x;
        this.y = y;
        this.width = width;
        this.textWidth = width;
        this.height = height;
        this.modifiers = [];
        this.textStyle = {};
        this.additionalStyles = {}; // Инициализация нового поля
    }
    calculateTextWidth1() {
        const tempDiv = document.createElement('div');
        // Применяем стили через Object.assign
        Object.assign(tempDiv.style, this.textStyle, this.additionalStyles);
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.whiteSpace = 'nowrap';
        tempDiv.style.overflow = 'visible';
        tempDiv.innerText = this.content; // Добавляем текст для которого нужно вычислить ширину
        document.body.appendChild(tempDiv); // Добавляем элемент в DOM для вычисления его ширины
        const width = tempDiv.scrollWidth; // Получаем реальную ширину текста
        document.body.removeChild(tempDiv); // Удаляем временный элемент
        console.log(width);
        return width; // Возвращаем ширину текста
    }
    setText(newText) {
        this.content = newText;
    }
    updateTextStyle(newStyles) {
        Object.assign(this.textStyle, newStyles);
    }
    updateAdditionalStyles(newStyles) {
        Object.assign(this.additionalStyles, newStyles);
    }
    setTextUpdateCallback(callback) {
        this.textUpdateCallback = callback;
    }
    applyModifiers(timestamp) {
        if (this.textUpdateCallback) {
            const newText = this.textUpdateCallback(timestamp);
            this.setText(newText);
        }
        for (const modifier of this.modifiers) {
            modifier.apply(timestamp);
        }
    }
    addModifier(modifier) {
        this.modifiers.push(modifier);
    }
    renderTo(container) {
        if (!this.visible)
            return;
        // Ищем существующий элемент в контейнере по id
        let div = container.querySelector(`#${this.id}`);
        if (!div) {
            // Если элемент не найден, создаем новый
            div = document.createElement('div');
            div.id = this.id;
            container.appendChild(div);
        }
        // Обновляем свойства элемента
        div.style.position = 'absolute';
        div.style.left = `${Math.floor(this.x + 0.0001)}px`;
        div.style.top = `${Math.floor(this.y + 0.0001)}px`;
        div.style.height = `${this.height}px`;
        div.style.overflow = 'visible';
        div.style.whiteSpace = 'nowrap';
        // div.style.overflow = 'hidden';
        // Применяем основные стили и дополнительные стили
        Object.assign(div.style, this.textStyle, this.additionalStyles);
        if (typeof this.content === 'string') {
            div.innerText = this.content;
        }
        else if (this.content instanceof HTMLImageElement || this.content instanceof SVGElement) {
            div.innerHTML = ''; // Очистка перед добавлением
            div.appendChild(this.content);
        }
        console.log(div.scrollWidth, this.x);
        div.style.width = `${div.scrollWidth}px`;
        this.textWidth = div.scrollWidth;
    }
}
exports.MatrixElement = MatrixElement;
class TimeMatrixElement extends MatrixElement {
    constructor(matrix, content, x, y, width, height) {
        super(matrix, content, x, y, width, height);
        this._initFn();
    }
    _initFn() {
        this.setTextUpdateCallback((timestamp) => {
            const now = new Date(timestamp);
            return now.toISOString().substr(11, 12); // Формат времени с миллисекундами (HH:mm:ss.sss)
        });
    }
}
exports.TimeMatrixElement = TimeMatrixElement;
//# sourceMappingURL=MatrixElement.js.map
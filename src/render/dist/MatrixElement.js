export class MatrixElement {
    constructor(content, x, y, width, height) {
        this.content = content;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.modifiers = [];
        this.textStyle = {};
        this.textWidth = this.calculateTextWidth();
    }
    // Метод для вычисления ширины текста без добавления элемента в DOM
    calculateTextWidth() {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.whiteSpace = 'nowrap';
        tempDiv.style.font = this.textStyle.font || '16px Arial';
        tempDiv.innerText = this.content;
        document.body.appendChild(tempDiv);
        const width = tempDiv.clientWidth;
        document.body.removeChild(tempDiv);
        return width;
    }
    setText(newText) {
        this.content = newText;
        this.textWidth = this.calculateTextWidth();
    }
    updateTextStyle(newStyles) {
        Object.assign(this.textStyle, newStyles);
        this.textWidth = this.calculateTextWidth();
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
    // Метод для рендеринга элемента в указанный контейнер
    renderTo(container) {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = `${this.x}px`;
        div.style.top = `${this.y}px`;
        div.style.width = `${this.width}px`;
        div.style.height = `${this.height}px`;
        div.style.overflow = 'hidden';
        Object.assign(div.style, this.textStyle); // Применяем стили
        if (typeof this.content === 'string') {
            div.innerText = this.content;
        }
        else if (this.content instanceof HTMLImageElement || this.content instanceof SVGElement) {
            div.appendChild(this.content);
        }
        container.appendChild(div);
    }
}
//# sourceMappingURL=MatrixElement.js.map
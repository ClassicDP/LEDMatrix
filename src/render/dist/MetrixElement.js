export class MatrixElement {
    constructor(content, x, y, width, height) {
        this.content = content;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.modifiers = [];
        this.element = this.createElement();
    }
    createElement() {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = `${this.x}px`;
        div.style.top = `${this.y}px`;
        div.style.width = `${this.width}px`;
        div.style.height = `${this.height}px`;
        div.style.overflow = 'hidden';
        if (typeof this.content === 'string') {
            div.innerText = this.content;
        }
        else if (this.content instanceof HTMLImageElement || this.content instanceof SVGElement) {
            div.appendChild(this.content);
        }
        document.body.appendChild(div);
        return div;
    }
    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    applyModifiers(timestamp) {
        for (const modifier of this.modifiers) {
            modifier.apply(this, timestamp);
        }
        this.updatePosition();
    }
    addModifier(modifier) {
        this.modifiers.push(modifier);
    }
}
//# sourceMappingURL=MetrixElement.js.map
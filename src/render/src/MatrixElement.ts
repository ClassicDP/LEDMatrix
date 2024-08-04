import { DynamicModifier } from "./Modifiers";

export class MatrixElement {
    content: string | HTMLImageElement | SVGElement;
    x: number;
    y: number;
    width: number;
    height: number;
    modifiers: DynamicModifier[];
    textWidth: number;
    textUpdateCallback?: (timestamp: number) => string;
    textStyle: Partial<CSSStyleDeclaration>;

    constructor(content: string | HTMLImageElement | SVGElement, x: number, y: number, width: number, height: number) {
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
    calculateTextWidth(): number {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.whiteSpace = 'nowrap';
        tempDiv.style.font = this.textStyle.font || '16px Arial';
        tempDiv.innerText = this.content as string;
        document.body.appendChild(tempDiv);
        const width = tempDiv.clientWidth;
        document.body.removeChild(tempDiv);
        return width;
    }

    setText(newText: string) {
        this.content = newText;
        this.textWidth = this.calculateTextWidth();
    }

    updateTextStyle(newStyles: Partial<CSSStyleDeclaration>) {
        Object.assign(this.textStyle, newStyles);
        this.textWidth = this.calculateTextWidth();
    }

    setTextUpdateCallback(callback: (timestamp: number) => string) {
        this.textUpdateCallback = callback;
    }

    applyModifiers(timestamp: number) {
        if (this.textUpdateCallback) {
            const newText = this.textUpdateCallback(timestamp);
            this.setText(newText);
        }
        for (const modifier of this.modifiers) {
            modifier.apply(timestamp);
        }
    }

    addModifier(modifier: DynamicModifier) {
        this.modifiers.push(modifier);
    }

    // Метод для рендеринга элемента в указанный контейнер
    renderTo(container: HTMLElement) {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = `${Math.floor(this.x)}px`;
        div.style.top = `${Math.floor(this.y)}px`;
        div.style.width = `${this.width}px`;
        div.style.height = `${this.height}px`;
        div.style.overflow = 'hidden';

        Object.assign(div.style, this.textStyle); // Применяем стили

        if (typeof this.content === 'string') {
            div.innerText = this.content;
        } else if (this.content instanceof HTMLImageElement || this.content instanceof SVGElement) {
            div.appendChild(this.content);
        }

        container.appendChild(div);
    }
}

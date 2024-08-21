import {DynamicModifier} from "./Modifiers";
import {Matrix} from "./Matrix";

export class MatrixElement {
    id: string;
    content: string | HTMLImageElement | SVGElement;
    x: number;
    y: number;
    width: number;
    height: number;
    modifiers: DynamicModifier[];
    textWidth: number;
    textUpdateCallback?: (timestamp: number) => string;
    textStyle: Partial<CSSStyleDeclaration>;

    constructor(matrix: Matrix, content: string | HTMLImageElement | SVGElement, x: number, y: number, width: number, height: number) {
        this.id = matrix.generateElementId();
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

    renderTo(container: HTMLElement) {
        // Ищем существующий элемент в контейнере по id
        let div = container.querySelector(`#${this.id}`) as HTMLElement;

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
        div.style.width = `${this.width}px`;
        div.style.height = `${this.height}px`;
        div.style.overflow = 'hidden';

        Object.assign(div.style, this.textStyle);

        if (typeof this.content === 'string') {
            div.innerText = this.content;
        } else if (this.content instanceof HTMLImageElement || this.content instanceof SVGElement) {
            div.innerHTML = ''; // Очистка перед добавлением
            div.appendChild(this.content);
        }
    }
}

export class TimeMatrixElement extends MatrixElement {
    constructor(matrix: Matrix, content: string | HTMLImageElement | SVGElement, x: number, y: number, width: number, height: number) {
        super(matrix, content, x, y, width, height);
        this._initFn()
    }

    _initFn() {
        this.setTextUpdateCallback((timestamp) => {
            const now = new Date(timestamp);
            return now.toISOString().substr(11, 12); // Формат времени с миллисекундами (HH:mm:ss.sss)
        });
    }

}
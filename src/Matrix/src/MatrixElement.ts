import { DynamicModifier } from "./Modifiers";
import { Matrix } from "./Matrix";

export class MatrixElement {
    id: string;
    content: string | HTMLImageElement | SVGElement;
    x: number;
    y: number;
    width: number;
    textWidth: number;
    height: number;
    modifiers: DynamicModifier[];
    visible: boolean = true;
    layer = 0;
    textUpdateCallback?: (timestamp: number) => string;
    textStyle: Partial<CSSStyleDeclaration>;
    additionalStyles: Partial<CSSStyleDeclaration>;  // Новое поле для дополнительных стилей

    constructor(matrix: Matrix, content: string | HTMLImageElement | SVGElement, x: number, y: number, width: number, height: number) {
        this.id = matrix.generateElementId();
        this.content = content;
        this.x = x;
        this.y = y;
        this.width = width;
        this.textWidth = width
        this.height = height;
        this.modifiers = [];
        this.textStyle = {};
        this.additionalStyles = {};  // Инициализация нового поля

    }

    calculateTextWidth1(): number {
        const tempDiv = document.createElement('div');

        // Применяем стили через Object.assign
        Object.assign(tempDiv.style, this.textStyle, this.additionalStyles);

        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.whiteSpace = 'nowrap';
        tempDiv.style.overflow = 'visible'


        tempDiv.innerText = this.content as string; // Добавляем текст для которого нужно вычислить ширину

        document.body.appendChild(tempDiv); // Добавляем элемент в DOM для вычисления его ширины

        const width = tempDiv.scrollWidth;  // Получаем реальную ширину текста

        document.body.removeChild(tempDiv);  // Удаляем временный элемент
        console.log(width)

        return width;  // Возвращаем ширину текста
    }

    setText(newText: string) {
        this.content = newText;
    }

    updateTextStyle(newStyles: Partial<CSSStyleDeclaration>) {
        Object.assign(this.textStyle, newStyles);
    }

    updateAdditionalStyles(newStyles: Partial<CSSStyleDeclaration>) {  // Новый метод для обновления дополнительных стилей
        Object.assign(this.additionalStyles, newStyles);
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
        if (!this.visible) return;
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
        div.style.height = `${this.height}px`;
        div.style.overflow = 'visible'
        div.style.whiteSpace = 'nowrap';
        // div.style.overflow = 'hidden';

        // Применяем основные стили и дополнительные стили
        Object.assign(div.style, this.textStyle, this.additionalStyles);

        if (typeof this.content === 'string') {
            div.innerText = this.content;
        } else if (this.content instanceof HTMLImageElement || this.content instanceof SVGElement) {
            div.innerHTML = ''; // Очистка перед добавлением
            div.appendChild(this.content);
        }
        console.log(div.scrollWidth, this.x)
        div.style.width = `${div.scrollWidth}px`;
        this.textWidth = div.scrollWidth
    }
}

export class TimeMatrixElement extends MatrixElement {
    constructor(matrix: Matrix, content: string | HTMLImageElement | SVGElement, x: number, y: number, width: number, height: number) {
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

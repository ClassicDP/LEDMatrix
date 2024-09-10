import {MatrixElement} from "./MatrixElement";

export abstract class DynamicModifier {
    protected element: MatrixElement;
    framesPerSecond: number | undefined;

    constructor(element: MatrixElement, framesPerSecond?: number) {
        this.element = element;
        this.framesPerSecond = framesPerSecond
        element.addModifier(this)
    }

    abstract apply(timestamp: number): void;
}

export class RotationModifier extends DynamicModifier {
    angle: number;

    constructor(element: MatrixElement, angle: number) {
        super(element);
        this.angle = angle;
    }

    apply(timestamp: number) {
        // Здесь можно применить вращение для расчетов, если это имеет смысл
        const rotation = this.angle * (timestamp / 1000);
        // Например, мы можем сохранить угол вращения или другую информацию в элементе
        // Но это будет чисто для логики, не для прямого рендеринга в DOM
    }
}

export class RainbowEffectModifier extends DynamicModifier {
    period: number;

    constructor(element: MatrixElement, period: number) {
        super(element);
        this.period = period;
    }

    apply(timestamp: number) {
        const phase = (timestamp % this.period) / this.period;
        const hue = Math.floor(phase * 360);
        this.element.updateTextStyle({color: `hsl(${hue}, 100%, 50%)`});
    }
}


export class ScrollingTextModifier extends DynamicModifier {
    speedPixelsPerSecond: number;
    previousTime: number | undefined;


    constructor(element: MatrixElement, speedPixelsPerSecond: number, framesPerSecond: number) {
        super(element, framesPerSecond);
        this.speedPixelsPerSecond = speedPixelsPerSecond;
        this.previousTime = undefined;
    }

    apply(timestamp: number) {
        if (!this.previousTime) {
            this.previousTime = timestamp;
            this.element.x = this.element.width;
            return;
        }

        this.element.x -= this.speedPixelsPerSecond * (timestamp - this.previousTime) / 1000;
        this.previousTime = timestamp;

        if (this.element.x + this.element.textWidth < 0) {
            this.element.x = this.element.width;
        }
    }
}

export class BlinkModifier extends DynamicModifier {
    apply(timestamp: number): void {
        let t = timestamp % 1000
        this.element.visible = t < 500
    }

}

export class ScaleModifier extends DynamicModifier {
    apply(timestamp: number): void {
        // Вычисляем масштаб на основе времени
        let t = (timestamp % 2000) / 2000;
        if (t > 0.5) t = 1 - t
        t = 1 + t

        // Применяем масштабирование к элементу
        this.element.updateAdditionalStyles({
            transform: `scale(${t})`
        });
    }
}

export class ShadowEffectModifier extends DynamicModifier {
    blur: number;
    shadowCount: number;

    constructor(element: MatrixElement, blur: number = 0, shadowCount: number = 1) {
        super(element);
        this.blur = blur;
        this.shadowCount = shadowCount;
    }

    apply(timestamp: number): void {
        const shadows: string[] = [];

        // Получаем текущий цвет текста на момент анимации
        const currentColor = this.getTextColor(this.element);

        // Применяем прозрачность через rgba без лишних преобразований
        const shadowColorWithOpacity = this.convertToRgba(currentColor, 0.3); // Добавляем прозрачность

        // Создаём несколько теней с использованием текущего цвета
        for (let i = 1; i <= this.shadowCount; i++) {
            const xOffset = i;  // Смещение по X
            const yOffset = i;  // Смещение по Y
            shadows.push(`${xOffset}px ${yOffset}px ${this.blur}px ${shadowColorWithOpacity}`);
        }

        // Применяем тени к элементу
        this.element.updateAdditionalStyles({
            textShadow: shadows.join(', ')
        });
    }

// Функция для преобразования текущего цвета в формат rgba
    convertToRgba(color: string, opacity: number): string {
        if (color.startsWith('rgb')) {
            return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
        } else if (color.startsWith('hsl')) {
            return this.hslStringToRgba(color, opacity);
        }
        return color; // Если это не rgb или hsl, возвращаем как есть
    }

// Преобразование HSL в RGBA
    hslStringToRgba(hsl: string, opacity: number): string {
        const hslValues = hsl.match(/\d+/g)!.map(Number);
        const h = hslValues[0];
        const s = hslValues[1] / 100;
        const l = hslValues[2] / 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;

        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    getTextColor(element: MatrixElement): string {
        return element.textStyle.color || '#ffffff'; // Если цвет не задан, используется белый
    }


}
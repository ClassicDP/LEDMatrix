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

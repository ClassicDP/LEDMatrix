import { Matrix } from './Matrix';
import { MatrixElement } from './MatrixElement';
import { ScrollingTextModifier, RainbowEffectModifier } from './Modifiers';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('matrix-container');

    if (!container) {
        console.error('Container not found!');
        return;
    }

    // Создание виртуального элемента
    const matrixElement = new MatrixElement("Running text", 0, 0, 128, 20);
    matrixElement.updateTextStyle({
        fontSize: '16px',
        color: 'lime',
        fontWeight: 'bold'
    });

    // Добавление модификатора бегущей строки
    const scrollingModifier = new ScrollingTextModifier(matrixElement, 50);
    matrixElement.addModifier(scrollingModifier);

    // Добавление модификатора радуги
    const rainbowModifier = new RainbowEffectModifier(matrixElement, 2000); // 2000 мс = 2 секунды для полного цикла радуги
    matrixElement.addModifier(rainbowModifier);

    // Создание и отображение группы кадров
    const matrix = new Matrix(128, 64, 60, 20, Date.now());
    matrix.generateNextGroup(container, matrixElement);
});

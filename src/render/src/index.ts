import { Matrix } from './Matrix';
import { MatrixElement } from './MatrixElement';
import { ScrollingTextModifier, RainbowEffectModifier } from './Modifiers';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('matrix-container');

    if (!container) {
        console.error('Container not found!');
        return;
    }

    // Создание элементов матрицы
    const textElement1 = new MatrixElement("Running text 1", 0, 0, 128, 20);
    textElement1.updateTextStyle({
        fontSize: '12px',
        color: 'lime',
        fontWeight: 'bold'
    });

    const textElement2 = new MatrixElement("Running text 2", 0, 30, 128, 20);
    textElement2.updateTextStyle({
        fontSize: '12px',
        color: 'red',
        fontWeight: 'bold'
    });

    // Добавление модификаторов к элементам
    const scrollingModifier1 = new ScrollingTextModifier(textElement1, 50);
    textElement1.addModifier(scrollingModifier1);

    const rainbowModifier1 = new RainbowEffectModifier(textElement1, 2000);
    textElement1.addModifier(rainbowModifier1);

    const scrollingModifier2 = new ScrollingTextModifier(textElement2, 40);
    textElement2.addModifier(scrollingModifier2);

    const rainbowModifier2 = new RainbowEffectModifier(textElement2, 2500);
    textElement2.addModifier(rainbowModifier2);

    // Создание и отображение группы кадров с несколькими элементами
    const matrix = new Matrix(128, 64, 60, 20, Date.now());
    // setInterval(()=>matrix.generateNextGroup(container, [textElement1, textElement2]), 1000);
    let ws = new WebSocket('ws://localhost:8081');
    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            if (message.command === 'generateNextGroup') {
                let frameGroup = matrix.generateNextGroup(container, [textElement1, textElement2]);
                ws.send(JSON.stringify({frameGroup}));
            }
        } catch (e) {
        }
    };

});


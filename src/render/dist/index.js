import { Matrix } from './Matrix';
import { MatrixElement } from './MatrixElement';
import { ScrollingTextModifier, RainbowEffectModifier } from './Modifiers';
let ws = null;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
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
    // Создание элемента для отображения текущего времени
    const timeElement = new MatrixElement("", 0, 15, 128, 20); // Центрируем элемент по вертикали
    timeElement.updateTextStyle({
        fontSize: '12px',
        color: 'yellow',
        fontWeight: 'bold',
        textAlign: 'center' // Выравнивание текста по центру
    });
    // Добавление коллбэка для обновления времени
    timeElement.setTextUpdateCallback((timestamp) => {
        const now = new Date(timestamp);
        return now.toISOString().substr(11, 12); // Формат времени с миллисекундами (HH:mm:ss.sss)
    });
    // Добавление модификаторов к элементам
    const scrollingModifier1 = new ScrollingTextModifier(textElement1, 20);
    textElement1.addModifier(scrollingModifier1);
    const rainbowModifier1 = new RainbowEffectModifier(textElement1, 2000);
    textElement1.addModifier(rainbowModifier1);
    const scrollingModifier2 = new ScrollingTextModifier(textElement2, 30);
    textElement2.addModifier(scrollingModifier2);
    const rainbowModifier2 = new RainbowEffectModifier(textElement2, 2500);
    textElement2.addModifier(rainbowModifier2);
    // Создание и отображение группы кадров с несколькими элементами
    const matrix = new Matrix(128, 64, 30, 15, Date.now());
    if (!ws) {
        ws = new WebSocket('ws://localhost:8081');
        ws.onopen = () => {
            console.log('WebSocket connection opened');
        };
        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.command === 'generateNextGroup') {
                    let frameGroup = matrix.generateNextGroup(container, [textElement1, textElement2, timeElement]);
                    ws.send(JSON.stringify({ frameGroup }));
                }
            }
            catch (e) {
                console.error('Error processing message:', e);
            }
        };
        ws.onclose = () => {
            console.log('WebSocket connection closed');
            ws = null; // Reset the WebSocket instance to allow reconnection
        };
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
});
//# sourceMappingURL=index.js.map
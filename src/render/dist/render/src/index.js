import { Matrix } from './Matrix';
import { MatrixElement } from './MatrixElement';
import { ScrollingTextModifier, RainbowEffectModifier } from './Modifiers';
import { SerDe } from "@serde/*";
let ws = null;
let textElement1;
let textElement2;
let timeElement;
let matrix;
function getSnapshot() {
    return JSON.stringify({ snapshot: SerDe.serialise([ws, textElement1, textElement2, timeElement, matrix]) });
}
function fromSnapshot(snapshot) {
    [ws, textElement1, textElement2, timeElement, matrix] = SerDe.deserialize(snapshot);
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    const container = document.getElementById('matrix-container');
    if (!container) {
        console.error('Container not found!');
        return;
    }
    if (!ws) {
        ws = new WebSocket('ws://localhost:8081');
        ws.onopen = () => {
            console.log('WebSocket connection opened');
        };
        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                switch (message.command) {
                    case 'generateNextGroup':
                        if (matrix) {
                            const frameGroup = matrix.generateNextGroup(container, [textElement1, textElement2, timeElement]);
                            ws.send(JSON.stringify({ frameGroup }));
                        }
                        break;
                    case 'setStartTime':
                        if (matrix) {
                            matrix.setStartTime(message.value);
                        }
                        break;
                    case 'initializeElements':
                        initializeElements();
                        break;
                    case 'getSnapshot':
                        const snapshot = getSnapshot();
                        ws.send(JSON.stringify({ command: 'loadSnapshot', value: snapshot }));
                        break;
                    case 'loadSnapshot':
                        fromSnapshot(message.value);
                        break;
                    default:
                        console.error('Unknown command:', message.command);
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
function initializeElements() {
    matrix = new Matrix(128, 64, 60, 20, Date.now());
    textElement1 = new MatrixElement(matrix, "Running text 1", 0, 0, 128, 20);
    textElement1.updateTextStyle({
        fontSize: '12px',
        color: 'lime',
        fontWeight: 'bold'
    });
    textElement2 = new MatrixElement(matrix, "Running text 2", 0, 30, 128, 20);
    textElement2.updateTextStyle({
        fontSize: '12px',
        color: 'red',
        fontWeight: 'bold'
    });
    timeElement = new MatrixElement(matrix, "", 0, 15, 128, 20);
    timeElement.updateTextStyle({
        fontSize: '12px',
        color: 'yellow',
        fontWeight: 'bold',
        textAlign: 'center'
    });
    timeElement.setTextUpdateCallback((timestamp) => {
        const now = new Date(timestamp);
        return now.toISOString().substr(11, 12); // Формат времени с миллисекундами (HH:mm:ss.sss)
    });
    const scrollingModifier1 = new ScrollingTextModifier(textElement1, 20, 30);
    textElement1.addModifier(scrollingModifier1);
    const rainbowModifier1 = new RainbowEffectModifier(textElement1, 2000);
    textElement1.addModifier(rainbowModifier1);
    const scrollingModifier2 = new ScrollingTextModifier(textElement2, 30, 30);
    textElement2.addModifier(scrollingModifier2);
    const rainbowModifier2 = new RainbowEffectModifier(textElement2, 2500);
    textElement2.addModifier(rainbowModifier2);
}
//# sourceMappingURL=index.js.map
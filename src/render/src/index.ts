import { Matrix } from './Matrix';
import { MatrixElement, TimeMatrixElement } from './MatrixElement';
import { RainbowEffectModifier, RotationModifier, ScrollingTextModifier } from './Modifiers';
import { SerDe } from "./SerDe";

// Регистрируем классы для серилизации и десериализации
SerDe.classRegistration([
    Matrix,
    MatrixElement,
    TimeMatrixElement,
    RainbowEffectModifier,
    ScrollingTextModifier,
    RotationModifier
]);

interface WebSocketCommand {
    command: 'generateNextGroup' | 'setStartTime' | 'getSnapshot' | 'loadSnapshot' | 'initializeElements';
    value?: any;
    imageBuffer?: string;
}

let ws: WebSocket | null = null;
let matrix: Matrix | undefined;

function getSnapshot(): string {
    console.log('get snapshot', matrix?.lastEndTime);
    return SerDe.serialise(matrix!);
}

function fromSnapshot(snapshot: string): void {
    matrix = SerDe.deserialize(snapshot) as Matrix;
    console.log('fromSnapshot', new Date(matrix?.lastEndTime).toString());
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
                const message: WebSocketCommand = JSON.parse(event.data);
                switch (message.command) {
                    case 'generateNextGroup':
                        if (matrix) {
                            const frameGroup = matrix.generateNextGroup(container, matrix.elements);
                            console.log("generation done sending frameGroup");
                            ws!.send(JSON.stringify({ frameGroup }));
                        }
                        break;

                    case 'setStartTime':
                        if (matrix) {
                            matrix.setStartTime(message.value);
                        }
                        break;

                    case 'initializeElements':
                        initializeElements();
                        ws?.send(JSON.stringify({client: "renderer"}));
                        break;

                    case 'getSnapshot':
                        const snapshot = getSnapshot();
                        ws!.send(JSON.stringify({ command: 'loadSnapshot', value: snapshot }));
                        break;

                    case 'loadSnapshot':
                        fromSnapshot(message.value);
                        ws?.send(JSON.stringify({client: "renderer"}));
                        break;
                }
            } catch (e) {
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

    const textElement1 = new MatrixElement(matrix, "Running text 1", 0, 0, 128, 20);
    textElement1.updateTextStyle({
        fontSize: '12px',
        color: 'lime',
        fontWeight: 'bold'
    });
    matrix.addElement(textElement1);

    const textElement2 = new MatrixElement(matrix, "Running text 2", 0, 30, 128, 20);
    textElement2.updateTextStyle({
        fontSize: '12px',
        color: 'red',
        fontWeight: 'bold'
    });
    matrix.addElement(textElement2);

    const timeElement = new TimeMatrixElement(matrix, "", 0, 15, 128, 20);
    timeElement.updateTextStyle({
        fontSize: '12px',
        color: 'yellow',
        fontWeight: 'bold',
        textAlign: 'center'
    });
    matrix.addElement(timeElement);

    const scrollingModifier1 = new ScrollingTextModifier(textElement1, 20, 30);
    textElement1.addModifier(scrollingModifier1);

    const rainbowModifier1 = new RainbowEffectModifier(textElement1, 2000);
    textElement1.addModifier(rainbowModifier1);

    const scrollingModifier2 = new ScrollingTextModifier(textElement2, 30, 30);
    textElement2.addModifier(scrollingModifier2);

    const rainbowModifier2 = new RainbowEffectModifier(textElement2, 2500);
    textElement2.addModifier(rainbowModifier2);
}

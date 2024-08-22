import {Matrix} from './Matrix';
import {MatrixElement, TimeMatrixElement} from './MatrixElement';
import {RainbowEffectModifier, RotationModifier, ScrollingTextModifier} from './Modifiers';
import {SerDe} from "./SerDe";

SerDe.classRegistration([Matrix, MatrixElement, TimeMatrixElement, RainbowEffectModifier, ScrollingTextModifier, RotationModifier])

interface WebSocketCommand {
    command: 'generateNextGroup' | 'setStartTime' | 'getSnapshot' | 'loadSnapshot' | 'initializeElements';
    value?: any;
    imageBuffer?: string
}

let ws: WebSocket | null = null;
let textElement1: MatrixElement | undefined;
let textElement2: MatrixElement | undefined;
let timeElement: TimeMatrixElement | undefined;
let matrix: Matrix | undefined;
let scrollingModifier1: ScrollingTextModifier
let scrollingModifier2: ScrollingTextModifier
let rainbowModifier1: RainbowEffectModifier

class Environment {
    matrix: Matrix
    textElement1: MatrixElement
    textElement2: MatrixElement
    timeElement: TimeMatrixElement
    scrollingModifier1: ScrollingTextModifier
    scrollingModifier2: ScrollingTextModifier
    rainbowModifier1: RainbowEffectModifier
    constructor(matrix: Matrix, textElement1: MatrixElement, textElement2: MatrixElement, timeElement: TimeMatrixElement, scrollingModifier1: ScrollingTextModifier, scrollingModifier2: ScrollingTextModifier, rainbowModifier1: RainbowEffectModifier) {
        this.matrix = matrix;
        this.textElement1 = textElement1;
        this.textElement2 = textElement2;
        this.timeElement = timeElement;
        this.scrollingModifier1 = scrollingModifier1;
        this.scrollingModifier2 = scrollingModifier2;
        this.rainbowModifier1 = rainbowModifier1;
    }
}

function getSnapshot(): string {
    let environment: Environment;
    environment = new Environment(matrix!, textElement1!, textElement2!, timeElement!, scrollingModifier1!, scrollingModifier2!, rainbowModifier1!);
    console.log('get snapshot', matrix?.lastEndTime)
    return SerDe.serialise(environment);
}

function fromSnapshot(snapshot: string): void {
    let environment: Environment = SerDe.deserialize(snapshot);
    matrix = environment.matrix
    textElement1 = environment.textElement1
    textElement2 = environment.textElement2
    timeElement = environment.timeElement
    scrollingModifier1 = environment.scrollingModifier1
    scrollingModifier2 = environment.scrollingModifier2
    rainbowModifier1 = environment.rainbowModifier1
    console.log('fromSnapshot', new Date(matrix?.lastEndTime).toString())

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
                            const frameGroup = matrix.generateNextGroup(container, [textElement1!, textElement2!, timeElement!]);
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
                        break;

                    case 'getSnapshot':
                        const snapshot = getSnapshot();
                        ws!.send(JSON.stringify({ command: 'loadSnapshot', value: snapshot }));
                        break;

                    case 'loadSnapshot':
                        fromSnapshot(message.value);
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


    timeElement = new TimeMatrixElement(matrix, "", 0, 15, 128, 20);
    timeElement.updateTextStyle({
        fontSize: '12px',
        color: 'yellow',
        fontWeight: 'bold',
        textAlign: 'center'
    });


    scrollingModifier1 = new ScrollingTextModifier(textElement1, 20, 30);
    textElement1.addModifier(scrollingModifier1);

    rainbowModifier1 = new RainbowEffectModifier(textElement1, 2000);
    textElement1.addModifier(rainbowModifier1);

    scrollingModifier2 = new ScrollingTextModifier(textElement2, 30, 30);
    textElement2.addModifier(scrollingModifier2);

    const rainbowModifier2 = new RainbowEffectModifier(textElement2, 2500);
    textElement2.addModifier(rainbowModifier2);
}

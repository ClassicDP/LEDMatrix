import { Matrix } from './Matrix';
import { MatrixElement } from './MatrixElement';
import { ScrollingTextModifier } from './Modifiers';
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('matrix-container');
    if (!container) {
        console.error('Container not found!');
        return;
    }
    const matrix = new Matrix(128, 64, 60, 20, Date.now());
    const textElement = new MatrixElement("Running text", 0, 0, 128, 20);
    textElement.updateTextStyle({
        fontSize: '16px',
        color: 'lime',
        fontWeight: 'bold'
    });
    const scrollingModifier = new ScrollingTextModifier(textElement, 50);
    textElement.addModifier(scrollingModifier);
    container.appendChild(textElement.element);
    function render(timestamp) {
        const frameGroup = matrix.generateNextGroup(container);
        textElement.applyModifiers(timestamp);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
});
//# sourceMappingURL=main.js.map
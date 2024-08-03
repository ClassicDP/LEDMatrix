import { LEDMatrix } from './ledMatrixRenderer';
import { ScrollingText } from './scrollingText';
import { createRainbowGradient } from './rainbow';
class AnimationFrameGenerator {
    constructor(containerId, width, height, framesPerSecond, frameCount, speed, startTime, wsUrl) {
        this.container = document.getElementById(containerId);
        this.width = width;
        this.height = height;
        this.startTime = startTime;
        this.framesPerSecond = framesPerSecond;
        this.frameCount = frameCount;
        this.speed = speed / 1000;
        this.generatedGroups = 0;
        this.scrollingText = new ScrollingText("", width, this.speed, startTime);
        this.matrix = new LEDMatrix(containerId, width, height * frameCount, frameCount);
        this.ws = new WebSocket(wsUrl);
        this.ws.onopen = () => {
            console.log('WebSocket connected');
        };
        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.command === 'generateNextGroup') {
                    this.generateAndSendNextGroup();
                }
            }
            catch (e) {
            }
        };
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
        };
    }
    clearDOM() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }
    generateTimeStrings() {
        const timeStrings = [];
        const frameInterval = 1000 / this.framesPerSecond;
        let time = this.startTime + this.generatedGroups * this.frameCount * frameInterval;
        for (let i = 0; i < this.frameCount; i++) {
            const date = new Date(time + i * frameInterval);
            const timeString = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`;
            timeStrings.push(timeString);
        }
        return timeStrings;
    }
    generateNextGroup() {
        this.clearDOM();
        const textArray = this.generateTimeStrings();
        const frameInterval = 1000 / this.framesPerSecond;
        let groupStartTime = this.startTime + this.generatedGroups * this.frameCount * frameInterval;
        const framePositions = [];
        for (let i = 0; i < this.frameCount; i++) {
            const currentTime = groupStartTime + i * frameInterval;
            this.scrollingText.setText(textArray[i]);
            this.scrollingText.updatePosition(currentTime);
            const rainbowPeriod = 2000;
            const progress = ((currentTime - this.startTime) % rainbowPeriod) / rainbowPeriod;
            const gradientText = createRainbowGradient(this.scrollingText.getText(), progress);
            this.matrix.renderFrame(gradientText, this.scrollingText.getPosition(), i * this.height);
            framePositions.push(this.scrollingText.getPosition());
        }
        this.generatedGroups += 1;
        return {
            startTime: groupStartTime,
            frameInterval: frameInterval,
            frameCount: this.frameCount,
            speed: this.speed,
            framePositions: framePositions,
            totalHeight: this.height * this.frameCount
        };
    }
    generateAndSendNextGroup() {
        const frameGroup = this.generateNextGroup();
        this.ws.send(JSON.stringify({ frameGroup }));
    }
}
// Пример использования
const animationGenerator = new AnimationFrameGenerator('animation-container', 96, 32, 50, 20, 25, Date.now(), 'ws://localhost:8081');
//# sourceMappingURL=index.js.map
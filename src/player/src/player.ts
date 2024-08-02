const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const timestampSpan = document.getElementById('timestamp') as HTMLSpanElement;
const deltaSpan = document.getElementById('delta') as HTMLSpanElement;
const fpsSpan = document.getElementById('fps') as HTMLSpanElement;

const scale = 8;

const width = 96;
const height = 32;
canvas.width = width * scale;
canvas.height = height * scale;
canvas.style.width = `${width * scale}px`;
canvas.style.height = `${height * scale}px`;

function drawPixelGrid() {
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

const ws = new WebSocket('ws://localhost:8081');
const frameBuffer: any[] = [];
const bufferLimit = 100;

let frameCount = 0;
let referenceFrameTime = 0;
let referenceWallTime = 0;

ws.onmessage = (event) => {
    const frame = JSON.parse(event.data);
    if (!frame.timeStamp) return;
    const frameTime = new Date(frame.timeStamp).getTime();
    frameBuffer.push(frame);

    if (frameBuffer.length === bufferLimit || frameCount % 50 === 0) {
        referenceFrameTime = frameTime;
        referenceWallTime = Date.now();
    }

    if (frameBuffer.length > bufferLimit) {
        frameBuffer.shift();
    }

    frameCount++;
};

let fps = 0;
function displayFrame() {
    if (frameBuffer.length > 10) {
        const frame = frameBuffer.shift();
        const frameTime = new Date(frame.timeStamp).getTime();
        const currentTime = Date.now();
        const expectedDisplayTime = referenceWallTime + (frameTime - referenceFrameTime);

        if (currentTime >= expectedDisplayTime || expectedDisplayTime - currentTime > 250) {
            fps++;
            const image = new Image();
            image.src = `data:image/png;base64,${frame.imageBuffer}`;

            image.onload = () => {
                ctx.imageSmoothingEnabled = false;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                drawPixelGrid();
                deltaSpan.textContent = `${Date.now() - frameTime} ms`;
                timestampSpan.textContent = `${new Date(frame.timeStamp).toISOString().substr(14, 9)}`;
            };
        } else {
            frameBuffer.unshift(frame);
            const delay = expectedDisplayTime - currentTime;
            setTimeout(displayFrame, delay);
            return;
        }
    }
    requestAnimationFrame(displayFrame);
}

setInterval(() => { fpsSpan.textContent = fps.toString(); fps = 0; }, 1000);

ws.onopen = async () => {
    displayFrame();
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

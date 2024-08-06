interface Frame {
    timeStamp: number;
    imageBuffer: string;
}

interface FrameGroup {
    startTime: number;
    frameInterval: number;
    frameCount: number;
    totalHeight: number;
    width: number;
    imageBuffer: string;
}

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const timestampSpan = document.getElementById('timestamp') as HTMLSpanElement;
const deltaSpan = document.getElementById('delta') as HTMLSpanElement;
const fpsSpan = document.getElementById('fps') as HTMLSpanElement;

let width: number;
let height: number;

const frameBuffer: Frame[] = [];
const bufferLimit = 500;

let frameCount = 0;
let lastFTime = 0;

const wait = async (ms: number) => {
    return new Promise(res => setTimeout(res, ms));
}

// Создаем Web Worker
const worker = new Worker('imageWorker.js');

worker.onmessage = (event) => {
    const frames: Frame[] = event.data;
    frames.forEach((frame) => {
        frameBuffer.push(frame);
        if (frameBuffer.length > bufferLimit) {
            frameBuffer.shift();
        }
        frameCount++;
    });
};

// const ws = new WebSocket('ws://localhost:8081');
const ws = new WebSocket('ws://192.168.1.85:8081');
ws.onmessage = (event) => {
    const frameGroup: FrameGroup = JSON.parse(event.data);

    if (frameGroup.imageBuffer) {
        // Передаем данные на нарезку в Worker
        worker.postMessage(frameGroup);
    }
};

let fps = 0;

async function displayFrame() {
    if (frameBuffer.length > 0) {
        const frame = frameBuffer.shift()!;
        const frameTime = frame.timeStamp;
        const currentTime = Date.now();
        const timeToWait = frameTime - currentTime;

        if (timeToWait > 0) {
            await wait(timeToWait);
        }

        fps++;
        const image = new Image();
        image.src = `data:image/png;base64,${frame.imageBuffer}`;

        image.onload = () => {
            // Получаем фактические размеры изображения
            width = image.naturalWidth;
            height = image.naturalHeight;

            // Рассчитываем scale для текущего размера окна
            const maxWidth = window.innerWidth;
            const maxHeight = window.innerHeight;

            const scaleX = Math.floor(maxWidth / width);
            const scaleY = Math.floor(maxHeight / height);

            const scale = Math.min(scaleX, scaleY); // Округляем масштаб до меньшего целого

            // Настраиваем canvas
            canvas.width = width * scale;
            canvas.height = height * scale;
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;

            // Отключаем сглаживание изображений
            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Рисуем изображение с учетом масштаба
            ctx.drawImage(image, 0, 0, width * scale, height * scale);

            // Теперь рисуем сетку поверх изображения
            drawPixelGrid(scale);

            deltaSpan.textContent = `${(Date.now() - frameTime) >> 0} ms` + " buff: " + frameBuffer.length + " delta frame: " + ((lastFTime - frameTime) >> 0).toString();
            lastFTime = frameTime;
            timestampSpan.textContent = `${new Date(frame.timeStamp).toISOString().substr(14, 9)}`;
        };
    }
    if (Number.parseInt(deltaSpan.textContent ?? '0') < 10) {
        requestAnimationFrame(displayFrame);
    } else {
        setTimeout(()=>displayFrame(), 0)
    }
}

setInterval(() => {
    fpsSpan.textContent = fps.toString();
    fps = 0;
}, 1000);

ws.onopen = async () => {
    await displayFrame();
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

function drawPixelGrid(scale: number) {
    ctx.strokeStyle = 'white'; // Можно вернуть на white после тестирования
    ctx.lineWidth = 0.1;
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

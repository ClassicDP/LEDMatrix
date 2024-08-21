import { WebSocketServer } from 'ws';
import { createCanvas } from 'canvas';

const width = 96;
const height = 32;
const text = 'This is a scrolling text example. ';
const fontSize = 32;
const scrollSpeed = 10; // Скорость в пикселях в секунду
const fps = 30; // Кадров в секунду
const frameInterval = 1000 / fps;
const framesPerBatch = fps * 2; // Количество кадров в группе (2 секунды запаса)

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Включаем сглаживание
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

let textWidth;
let xPos = width;
let lastTime = Date.now();

function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    // Установка параметров текста
    ctx.font = `${fontSize}px "Courier New"`;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.16, 'orange');
    gradient.addColorStop(0.32, 'yellow');
    gradient.addColorStop(0.48, 'green');
    gradient.addColorStop(0.64, 'blue');
    gradient.addColorStop(0.8, 'indigo');
    gradient.addColorStop(1, 'violet');
    ctx.fillStyle = gradient;

    // Измерение ширины текста
    textWidth = ctx.measureText(text).width;

    // Рассчет времени с момента последнего кадра
    const now = Date.now();
    const deltaTime = (now - lastTime) / 1000; // в секундах
    lastTime = now;

    // Обновление позиции текста с учетом времени между кадрами
    xPos -= scrollSpeed * deltaTime;

    // Если текст вышел за пределы экрана, сбросить позицию
    if (xPos < -textWidth) {
        xPos = width;
    }

    // Возврат кадра в виде чистого Base64
    const dataUrl = canvas.toDataURL();
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

    // Логируем первый символ данных кадра для отладки
    console.log('Generated frame:', base64Data.substring(0, 50));

    return base64Data;
}

function generateFramesBatch() {
    const frames = [];
    let currentTime = Date.now();

    for (let i = 0; i < framesPerBatch; i++) {
        const frame = drawFrame();
        frames.push({
            timeStamp: currentTime + i * frameInterval,
            imageBuffer: frame
        });

        // Логирование таймштампов для отладки
        console.log(`Frame ${i + 1} timestamp: ${new Date(currentTime + i * frameInterval).toISOString()}`);
    }

    console.log('Generated batch with', frames.length, 'frames');
    return frames;
}

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', ws => {
    console.log('Client connected');

    // Постоянное пополнение буфера клиента
    const sendFrames = () => {
        const framesBatch = generateFramesBatch();
        ws.send(JSON.stringify(framesBatch));
        console.log('Sent frame batch to client');
    };

    // Запускаем начальное пополнение буфера
    sendFrames();

    // Отправляем группы кадров с интервалом
    const interval = setInterval(sendFrames, framesPerBatch * frameInterval / 2); // Отправляем заранее, чтобы был запас

    ws.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});

console.log('WebSocket server started on ws://localhost:8080');

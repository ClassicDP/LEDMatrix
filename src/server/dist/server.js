var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from 'path';
import { webkit } from 'playwright';
import { fileURLToPath } from 'url';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import sharp from 'sharp';
const server = http.createServer();
const wss = new WebSocketServer({ server });
let clients = [];
let page;
let browser;
let context;
// __dirname equivalent setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let clientCounter = 0;
wss.on('connection', (ws) => {
    const clientId = ++clientCounter;
    clients.push(ws);
    console.log(`Client connected: ${clientId}`);
    ws.send(JSON.stringify({ command: 'generateNextGroup' }));
    ws.on('close', () => {
        clients = clients.filter((client) => client !== ws);
        console.log(`Client disconnected: ${clientId}`);
    });
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        const request = JSON.parse(message);
        if (request.frameGroup) {
            const frameGroup = request.frameGroup;
            // Устанавливаем размер окна просмотра
            yield page.setViewportSize({ width: frameGroup.width, height: frameGroup.totalHeight });
            yield captureAndSendScreenshot(frameGroup);
            let deltaT = frameGroup.startTime - Date.now();
            const delay = Math.max(0, deltaT);
            setTimeout(() => {
                ws.send(JSON.stringify({ command: 'generateNextGroup' }));
            }, delay / 2);
        }
        else {
            console.log('Unknown message received:', message);
        }
    }));
    ws.on('error', (error) => {
        console.error(`WebSocket error with client ${clientId}:`, error);
    });
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield launchBrowser();
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Restarting browser to avoid memory leaks...');
        yield browser.close();
        yield launchBrowser();
    }), 30000); // Перезапуск браузера каждые 30 секунд
}))();
function launchBrowser() {
    return __awaiter(this, void 0, void 0, function* () {
        browser = yield webkit.launch();
        context = yield browser.newContext();
        // Очистка кэша и куки при старте
        yield context.clearCookies();
        console.log('Browser cache and cookies cleared');
        page = yield context.newPage();
        const filePath = path.join(__dirname, '../../../src/render/dist/index.html');
        yield page.goto(`file://${filePath}`, { waitUntil: 'load' });
        console.log('Browser and page loaded');
        page.on('console', (msg) => __awaiter(this, void 0, void 0, function* () {
            const msgArgs = msg.args();
            const logValues = yield Promise.all(msgArgs.map((arg) => __awaiter(this, void 0, void 0, function* () { return yield arg.jsonValue(); })));
            console.log("::", ...logValues);
        }));
        process.on('exit', () => __awaiter(this, void 0, void 0, function* () {
            yield browser.close();
            console.log('Browser closed');
        }));
    });
}
function captureAndSendScreenshot(frameGroup) {
    return __awaiter(this, void 0, void 0, function* () {
        const maxRetries = 5; // Максимальное количество попыток
        const delayBetweenRetries = 10; // Задержка между попытками в мс
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const { totalHeight, frameCount } = frameGroup;
                yield page.evaluate((totalHeight) => {
                    const container = document.getElementById('matrix-container');
                    if (container) {
                        container.style.height = `${totalHeight}px`;
                    }
                }, totalHeight);
                const elementHandle = yield page.waitForSelector('#matrix-container', { state: 'visible' });
                const boundingBox = yield elementHandle.boundingBox();
                const screenshotBuffer = yield page.screenshot({
                    clip: boundingBox,
                    timeout: 100,
                });
                const imageBuffer = Buffer.from(screenshotBuffer);
                const frameHeight = Math.floor(totalHeight / frameCount);
                const frames = [];
                for (let i = 0; i < frameCount; i++) {
                    const yPosition = i * frameHeight;
                    const croppedBuffer = yield sharp(imageBuffer)
                        .extract({ width: boundingBox.width, height: frameHeight, left: 0, top: yPosition })
                        .toBuffer();
                    frames.push({
                        timeStamp: frameGroup.startTime + i * frameGroup.frameInterval,
                        imageBuffer: croppedBuffer.toString('base64'),
                    });
                }
                frames.forEach((frame) => {
                    clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(frame));
                        }
                    });
                });
                console.log('Screenshot captured successfully');
                return; // Если скриншот успешно создан, выходим из функции
            }
            catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt < maxRetries) {
                    console.log(`Retrying in ${delayBetweenRetries}ms...`);
                    yield new Promise(resolve => setTimeout(resolve, delayBetweenRetries));
                }
                else {
                    const now = new Date();
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');
                    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
                    const timeWithMilliseconds = `${hours}:${minutes}:${seconds}.${milliseconds}`;
                    console.error(timeWithMilliseconds, `Failed to capture screenshot after ${maxRetries} attempts.`);
                }
            }
        }
    });
}
server.listen(8081, () => {
    console.log('WebSocket server running on port 8081');
});
// Логирование использования памяти каждые 10 секунд
setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);
}, 10000);
//# sourceMappingURL=server.js.map
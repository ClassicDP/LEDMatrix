import path from 'path';
import { Page, webkit, Browser, BrowserContext } from 'playwright';
import { fileURLToPath } from 'url';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import sharp from 'sharp';

interface Frame {
    timeStamp: number;
    imageBuffer: string;
}

interface FrameGroup {
    startTime: number;
    frameInterval: number;
    frameCount: number;
    speed: number;
    framePositions: number[];
    totalHeight: number;
    width: number;
}

const server = http.createServer();
const wss = new WebSocketServer({ server });
let clients: WebSocket[] = [];
let page: Page;
let browser: Browser;
let context: BrowserContext;

// __dirname equivalent setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let clientCounter = 0;

wss.on('connection', (ws: WebSocket) => {
    const clientId = ++clientCounter;
    clients.push(ws);
    console.log(`Client connected: ${clientId}`);

    ws.send(JSON.stringify({ command: 'generateNextGroup' }));

    ws.on('close', () => {
        clients = clients.filter((client) => client !== ws);
        console.log(`Client disconnected: ${clientId}`);
    });

    ws.on('message', async (message: string) => {
        const request = JSON.parse(message);

        if (request.frameGroup) {
            const frameGroup: FrameGroup = request.frameGroup;

            // Устанавливаем размер окна просмотра
            await page.setViewportSize({ width: frameGroup.width, height: frameGroup.totalHeight });

            await captureAndSendScreenshot(frameGroup);

            let deltaT = frameGroup.startTime - Date.now();
            const delay = Math.max(0, deltaT);

            setTimeout(() => {
                ws.send(JSON.stringify({ command: 'generateNextGroup' }));
            }, delay / 2);
        } else {
            console.log('Unknown message received:', message);
        }
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error with client ${clientId}:`, error);
    });
});

(async () => {
    await launchBrowser();

    setInterval(async () => {
        console.log('Restarting browser to avoid memory leaks...');
        await browser.close();
        await launchBrowser();
    }, 30000); // Перезапуск браузера каждые 30 секунд
})();

async function launchBrowser() {
    browser = await webkit.launch();
    context = await browser.newContext();

    // Очистка кэша и куки при старте
    await context.clearCookies();
    console.log('Browser cache and cookies cleared');

    page = await context.newPage();

    const filePath = path.join(__dirname, '../../../src/render/dist/index.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'load' });

    console.log('Browser and page loaded');

    page.on('console', async (msg: { args: () => any; }) => {
        const msgArgs = msg.args();
        const logValues = await Promise.all(msgArgs.map(async (arg: { jsonValue: () => any; }) => await arg.jsonValue()));
        console.log("::", ...logValues);
    });

    process.on('exit', async () => {
        await browser.close();
        console.log('Browser closed');
    });
}

async function captureAndSendScreenshot(frameGroup: FrameGroup) {
    const maxRetries = 5; // Максимальное количество попыток
    const delayBetweenRetries = 10; // Задержка между попытками в мс

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const { totalHeight, frameCount } = frameGroup;

            await page.evaluate((totalHeight: any) => {
                const container = document.getElementById('matrix-container');
                if (container) {
                    container.style.height = `${totalHeight}px`;
                }
            }, totalHeight);

            const elementHandle = await page.waitForSelector('#matrix-container', { state: 'visible' });
            const boundingBox = await elementHandle.boundingBox();

            const screenshotBuffer = await page.screenshot({
                clip: boundingBox!,
                timeout: 100,
            });

            const imageBuffer = Buffer.from(screenshotBuffer);

            const frameHeight = Math.floor(totalHeight / frameCount);
            const frames: Frame[] = [];

            for (let i = 0; i < frameCount; i++) {
                const yPosition = i * frameHeight;

                const croppedBuffer = await sharp(imageBuffer)
                    .extract({ width: boundingBox!.width, height: frameHeight, left: 0, top: yPosition })
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

        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt < maxRetries) {
                console.log(`Retrying in ${delayBetweenRetries}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayBetweenRetries));
            } else {
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

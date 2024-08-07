import path from 'path';
import { Page, webkit, Browser, BrowserContext } from 'playwright';
import { fileURLToPath } from 'url';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

class Mutex {
    private _queue: (() => void)[] = [];
    private _lock = false;

    lock(): Promise<void> {
        return new Promise((res) => {
            if (!this._lock) {
                this._lock = true;
                res();
            } else {
                this._queue.push(res);
            }
        });
    }

    unlock() {
        if (this._queue.length > 0) {
            const func = this._queue.shift();
            if (func) func();
        } else {
            this._lock = false;
        }
    }
}

interface FrameGroup {
    startTime: number;
    frameInterval: number;
    frameCount: number;
    totalHeight: number;
    width: number;
    imageBuffer: string;
}

const server = http.createServer();
const wss = new WebSocketServer({ server });
let clients: WebSocket[] = [];
let page: Page | null = null;
let browser: Browser;
let context: BrowserContext;
let lastTime: number | undefined;
const mutex = new Mutex();

// __dirname equivalent setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let clientCounter = 0;
let startScreenshotTime=0;
let endScreenshotTime = 0;
let generateNextGroupStart = 0;
let generateNextGroupEnd = 0;

let positiveNextGroupTime = 0

let wsRender: WebSocket;
let initOnce: boolean = false

let resolveFunc: ((value: string) => void) | undefined;
let snapshot: string | undefined

async function waitingForSnapshot(): Promise<string> {
    return new Promise<string>((resolve) => {
        resolveFunc = resolve;
    });
}

wss.on('connection', async (ws: WebSocket) => {
    const clientId = ++clientCounter;
    clients.push(ws);
    console.log(`Client connected: ${clientId}`);
    if (!initOnce) {
        initOnce = true
        ws.send(JSON.stringify({ command: 'initializeElements' }));
    }
    if (snapshot) {
        ws.send(JSON.stringify({command: 'loadSnapshot', value: snapshot}));
        snapshot = undefined
        console.log('snapshot sent')
    } else if (lastTime)
        ws.send(JSON.stringify({ command: 'setStartTime', value: lastTime }));

    ws.send(JSON.stringify({ command: 'generateNextGroup' }));

    ws.once('close', () => {
        clients = clients.filter((client) => client !== ws);
        console.log(`Client disconnected: ${clientId}`);
    });

    ws.on('message', async (message: string) => {
        const request = JSON.parse(message);



        if (request.command == 'loadSnapshot' && resolveFunc) {
            resolveFunc(request.value)
        }
        if (request.frameGroup) {
            wsRender = ws
            await mutex.lock();
            generateNextGroupEnd = Date.now()
            positiveNextGroupTime = generateNextGroupEnd - generateNextGroupStart
            const frameGroup = request.frameGroup;

            // Устанавливаем размер окна просмотра
            if (page) {
                await page.setViewportSize({width: frameGroup.width, height: frameGroup.totalHeight});
                lastTime = frameGroup.startTime + frameGroup.frameInterval * frameGroup.frameCount;

                startScreenshotTime = Date.now();
                await captureAndSendScreenshot(frameGroup);
                endScreenshotTime = Date.now();

                mutex.unlock();

                let deltaT = frameGroup.startTime - Date.now() - 1000;
                const delay = Math.max(0, deltaT);
                setTimeout(async () => {
                    await mutex.lock()
                    ws.send(JSON.stringify({command: 'generateNextGroup'}));
                    generateNextGroupStart = Date.now()
                    mutex.unlock()
                }, delay / 2);
            } else {
                console.log('Page is not available');
            }
        }
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error with client ${clientId}:`, error);
    });
});

(async () => {
    await mutex.lock();
    browser = await webkit.launch();
    context = await browser.newContext();
    await createNewPage();
    mutex.unlock();
})();

async function createNewPage() {
    try {
        console.log('Creating new page...');
        page = await context.newPage();

        const filePath = path.join(__dirname, '../../../src/render/dist/index.html');
        await page.goto(`file://${filePath}`, { waitUntil: 'load' });
        page.on('console', async (msg: { args: () => any; }) => {
            await mutex.lock()
            const msgArgs = msg.args();
            try {
                const logValues = await Promise.all(msgArgs.map(async (arg: { jsonValue: () => any; }) => await arg.jsonValue()));
                console.log("::", ...logValues);
            } catch (e) {}
            mutex.unlock()
        });

        console.log('New page loaded');
    } catch (error) {
        console.error('Error creating or loading new page:', error);
    }
}

async function captureAndSendScreenshot(frameGroup: FrameGroup) {
    const maxRetries = 5; // Максимальное количество попыток
    const delayBetweenRetries = 10; // Задержка между попытками в мс

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const { totalHeight, frameCount, width } = frameGroup;

            if (page) {
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

                // Отправляем изображение и параметры для нарезки на клиенте
                const frameData: FrameGroup = {
                    startTime: frameGroup.startTime,
                    frameInterval: frameGroup.frameInterval,
                    frameCount: frameGroup.frameCount,
                    totalHeight: frameGroup.totalHeight,
                    width: frameGroup.width,
                    imageBuffer: screenshotBuffer.toString('base64')
                };

                clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(frameData));
                    }
                });

                return; // Если скриншот успешно создан, выходим из функции
            } else {
                console.error('Page is not available');
            }
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
setInterval(async () => {
    await mutex.lock()
    const memoryUsage = process.memoryUsage();
    console.log(new Date().toLocaleString());
    console.log(`RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);
    console.log(`GenerateNextGroup: ${positiveNextGroupTime}`);
    console.log(`Screenshot time: ${endScreenshotTime - startScreenshotTime}`);
    if (page && wsRender) {
        wsRender.send(JSON.stringify({command: 'getSnapshot'}));
        snapshot = await waitingForSnapshot();
        console.log('___',snapshot)
        await page.close();
        await createNewPage();
    }
    mutex.unlock()
}, 10000);

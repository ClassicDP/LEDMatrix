import path from 'path';
import {Browser, BrowserContext, Page, webkit} from 'playwright';
import http from 'http';
import WebSocket, {WebSocketServer} from 'ws';
import {Mutex} from "./mutex";
import {PointTracker} from "./PointTracker";

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
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
const wss = new WebSocketServer({server});
let clients: WebSocket[] = [];
let page: Page | null = null;
let browser: Browser;
let context: BrowserContext;
let lastTime: number | undefined;
const frameRequestMutex = new Mutex();

let clientCounter = 0;
let generateNextGroupStart = 0;

let wsRender: WebSocket;
let initOnce: boolean = false;

let resolveFunc: ((value: string) => void) | undefined;
let snapshot: string | undefined;

let generateNextGroupTimeout: NodeJS.Timeout | null = null;  // Переменная для хранения таймаута

// Инициализация PointTracker
const tracker = new PointTracker();

async function waitingForSnapshot(): Promise<string> {
    return new Promise<string>((resolve) => {
        resolveFunc = resolve;
    });
}

wss.on('connection', async (ws: WebSocket) => {
    const clientId = ++clientCounter;
    clients.push(ws);
    console.log(`Client connected: ${clientId}`);
    tracker.point('client-connected');

    if (!initOnce) {
        initOnce = true;
        ws.send(JSON.stringify({command: 'initializeElements'}));
    }
    if (snapshot) {
        ws.send(JSON.stringify({command: 'loadSnapshot', value: snapshot}));
        snapshot = undefined;
        console.log('snapshot sent');
    } else if (lastTime) {
        ws.send(JSON.stringify({command: 'setStartTime', value: lastTime}));
    }

    ws.once('close', () => {
        clients = clients.filter((client) => client !== ws);
        console.log(`Client disconnected: ${clientId}`);
        tracker.point('client-disconnected');

        // Очищаем таймаут при закрытии WebSocket
        if (generateNextGroupTimeout) {
            clearTimeout(generateNextGroupTimeout);
            generateNextGroupTimeout = null;
        }
    });

    ws.on('message', async (message: string) => {
        tracker.point('message-received');
        const request = JSON.parse(message);

        if (request.client == 'renderer') {
            frameRequestMutex.unlock('page reloaded');
            await frameRequestMutex.lock('generateNextGroup after new page init');
            ws.send(JSON.stringify({command: 'generateNextGroup'}));
        }

        if (request.command == 'loadSnapshot' && resolveFunc) {
            resolveFunc(request.value);
        }
        if (request.frameGroup) {
            tracker.point('generate-next-group-end', ['generate-next-group-start']);
            wsRender = ws;
            const frameGroup = request.frameGroup;

            if (page) {
                tracker.point('resize-start');
                await page.setViewportSize({width: frameGroup.width, height: frameGroup.totalHeight});
                tracker.point('resize-end', ['resize-start']);

                lastTime = frameGroup.startTime + frameGroup.frameInterval * frameGroup.frameCount;

                tracker.point('render-start');
                await captureAndSendScreenshot(frameGroup);
                tracker.point('render-end', ['render-start']);
                frameRequestMutex.unlock('render-end');

                let deltaT = frameGroup.startTime - Date.now() - 300;
                const delay = Math.max(0, deltaT);

                // Очищаем предыдущий таймаут, если он существует
                if (generateNextGroupTimeout) {
                    clearTimeout(generateNextGroupTimeout);
                }

                // Устанавливаем новый таймаут и сохраняем его идентификатор
                generateNextGroupTimeout = setTimeout(async () => {
                    tracker.point('generate-next-group-start');
                    if (frameRequestMutex.tryLock('generateNextGroup')) {
                        ws.send(JSON.stringify({command: 'generateNextGroup'}));
                        generateNextGroupStart = Date.now();
                    }
                }, delay);
            } else {
                console.log('Page is not available');
            }
        }
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error with client ${clientId}:`, error);
        tracker.point('error-occurred');
    });
});

(async () => {
    tracker.point('initialization-start');
    browser = await webkit.launch();
    context = await browser.newContext();
    await createNewPage();
    tracker.point('initialization-end', ['initialization-start']);
})();

async function createNewPage() {
    try {
        tracker.point('page-creation-start');
        page = await context.newPage();

        const filePath = path.join(__dirname, '../../../src/render/dist/index.html');
        tracker.point('page-loading-start');
        await page.goto(`file://${filePath}`, {waitUntil: 'load'});
        tracker.point('page-loading-end', ['page-loading-start']);

        page.on('console', async (msg: { args: () => any; }) => {
            const msgArgs = msg.args();
            try {
                const logValues = await Promise.all(msgArgs.map(async (arg: {
                    jsonValue: () => any;
                }) => await arg.jsonValue()));
                console.log("::", ...logValues);
            } catch (e) {
            }
        });

        // console.log('New page loaded');
        tracker.point('page-creation-end', ['page-creation-start']);
    } catch (error) {
        console.error('Error creating or loading new page:', error);
        tracker.point('page-creation-error');
    }
}

async function captureAndSendScreenshot(frameGroup: FrameGroup) {
    const maxRetries = 5; // Максимальное количество попыток
    const delayBetweenRetries = 10; // Задержка между попытками в мс

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            tracker.point('screenshot-attempt-start');
            const {totalHeight, width} = frameGroup;

            if (page) {
                tracker.point('evaluate-start');
                await page.evaluate((totalHeight: any) => {
                    const container = document.getElementById('matrix-container');
                    if (container) {
                        container.style.height = `${totalHeight}px`;
                    }
                }, totalHeight);
                tracker.point('evaluate-end', ['evaluate-start']);

                tracker.point('selector-wait-start');
                const elementHandle = await page.waitForSelector('#matrix-container', {state: 'visible'});
                tracker.point('selector-wait-end', ['selector-wait-start']);

                const boundingBox = await elementHandle.boundingBox();

                tracker.point('screenshot-start');
                const screenshotBuffer = await page.screenshot({
                    clip: boundingBox!,
                    timeout: 100,
                });
                tracker.point('screenshot-end', ['screenshot-start']);

                // Отправляем изображение и параметры для нарезки на клиенте
                const frameData: FrameGroup = {
                    startTime: frameGroup.startTime,
                    frameInterval: frameGroup.frameInterval,
                    frameCount: frameGroup.frameCount,
                    totalHeight: frameGroup.totalHeight,
                    width: frameGroup.width,
                    imageBuffer: screenshotBuffer.toString('base64')
                };

                tracker.point('data-sending-start');
                clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        tracker.point('sending-data');
                        client.send(JSON.stringify(frameData));
                    }
                });
                tracker.point('data-sending-end', ['data-sending-start']);

                tracker.point('screenshot-attempt-end');
                return; // Если скриншот успешно создан, выходим из функции
            } else {
                console.error('Page is not available');
                tracker.point('page-not-available');
            }
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            tracker.point('screenshot-attempt-failed');
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
                tracker.point('screenshot-failed-final');
            }
        }
    }
}

server.listen(8081, () => {
    console.log('WebSocket server running on port 8081');
    tracker.point('server-started');
});

// Логирование использования памяти каждые 30 секунд
setInterval(async () => {
    console.log(tracker.report({minTime: 10, requireDependencies: true}))
    await frameRequestMutex.lock('awaiting for close page');
    const memoryUsage = process.memoryUsage();

    if (page && wsRender) {
        wsRender.send(JSON.stringify({command: 'getSnapshot'}));
        snapshot = await waitingForSnapshot();
        await page.close();
        tracker.point('page-close');
        await createNewPage();
    }
}, 2000);


import path from 'path';
import {Browser, BrowserContext, Page, webkit} from 'playwright';
import WebSocket, {WebSocketServer} from 'ws';
import {Server} from 'ws';
import {Mutex} from "./mutex";
import {PointTracker} from "./PointTracker";
import {WorkerController} from "worker-threads-manager/dist/src";

interface FrameGroup {
    startTime: number;
    frameInterval: number;
    frameCount: number;
    totalHeight: number;
    width: number;
    imageBuffer: string;
}

interface WebSocketCommand {
    command: 'generateNextGroup' | 'setStartTime' | 'getSnapshot' | 'loadSnapshot' | 'initializeElements';
    value?: any;
    imageBuffer?: string;
    frameGroup?: FrameGroup;
}

export class Handlers {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private page: Page | null = null;
    private wss: WebSocketServer | null = null;
    private frameRequestMutex = new Mutex();
    private tracker = new PointTracker();
    private lastTime: number | undefined;
    private snapshot: string | undefined;
    private resolveFunc: ((value: string) => void) | null = null;

    private clients: WebSocket[] = []; // Массив для хранения активных соединений

    async initializePage(): Promise<void> {
        this.tracker.point('initialization-start');

        try {
            this.browser = await webkit.launch();
            this.context = await this.browser.newContext();
            await this.createNewPage();
            this.tracker.point('initialization-end', ['initialization-start']);
        } catch (e) {
            console.log(e);
        }
    }

    private async createNewPage(): Promise<void> {
        try {
            this.tracker.point('page-creation-start');
            this.page = await this.context!.newPage();

            const filePath = path.join(__dirname, '../../../src/render/dist/index.html');
            this.tracker.point('page-loading-start');
            await this.page.goto(`file://${filePath}`, {waitUntil: 'load'});
            this.tracker.point('page-loading-end', ['page-loading-start']);

            this.page.on('console', async (msg) => {
                const msgArgs = msg.args();
                try {
                    const logValues = await Promise.all(msgArgs.map(async (arg) => await arg.jsonValue()));
                    console.log("::", ...logValues);
                } catch (e) {
                    console.error("Error logging console output:", e);
                }
            });

            console.log('New page loaded');
            this.tracker.point('page-creation-end', ['page-creation-start']);
            await this.initializeWebSocketAndWaitForOpen();
        } catch (error) {
            console.error('Error creating or loading new page:', error);
            this.tracker.point('page-creation-error');
        }
    }

    private async initializeWebSocketAndWaitForOpen(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const wss = new Server({port: 8081});
                this.wss = wss;

                // Флаг, чтобы отследить, разрешён ли уже промис
                let isResolved = false;

                wss.on('connection', (ws) => {
                    console.log('WebSocket connection opened');

                    // Добавляем новое соединение в массив клиентов
                    this.clients.push(ws);

                    // Отправляем команду для инициализации элементов
                    ws.send(JSON.stringify({command: 'initializeElements'}));

                    // Обрабатываем сообщения
                    ws.on('message', async (message: WebSocket.Data) => {
                        await this.handleWebSocketMessage({data: message} as WebSocket.MessageEvent);
                    });

                    // Удаляем закрытое соединение из массива клиентов
                    ws.on('close', () => {
                        console.log('WebSocket connection closed');
                        this.clients = this.clients.filter(client => client !== ws);
                    });

                    // Обрабатываем ошибки
                    ws.on('error', (error) => {
                        console.error('WebSocket error:', error.message);
                        this.tracker.point('error-occurred');
                    });

                    // Разрешаем промис после первого успешного подключения
                    if (!isResolved) {
                        isResolved = true;
                        resolve();
                    }
                });

                console.log('WebSocket server is running on ws://localhost:8081');

            } catch (error) {
                console.error('Failed to start WebSocket server:', error);
                reject(error);  // Reject the promise if there's an error
            }
        });
    }
    private async handleWebSocketMessage(event: WebSocket.MessageEvent): Promise<void> {
        const message: WebSocketCommand = JSON.parse(event.data.toString());
        if (message.command === 'loadSnapshot' && this.resolveFunc) {
            this.resolveFunc(message.value);
            this.resolveFunc = null;
        }
        if (message.frameGroup) {
            this.tracker.point('generate-next-group-end', ['generate-next-group-start']);
            const frameGroup = message.frameGroup;

            if (this.page) {
                this.tracker.point('resize-start');
                await this.page.setViewportSize({width: frameGroup.width, height: frameGroup.totalHeight});
                this.tracker.point('resize-end', ['resize-start']);

                this.lastTime = frameGroup.startTime + frameGroup.frameInterval * frameGroup.frameCount;

                this.tracker.point('render-start');
                await this.captureScreenshot(frameGroup);
                this.tracker.point('render-end', ['render-start']);
                this.frameRequestMutex.unlock('render-end');
            } else {
                console.log('Page is not available');
            }
        }
    }

    private async captureScreenshot(frameGroup: FrameGroup) {
        const maxRetries = 5;
        const delayBetweenRetries = 10;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.tracker.point('screenshot-attempt-start');
                const {totalHeight, width} = frameGroup;

                if (this.page) {
                    this.tracker.point('evaluate-start');
                    await this.page.evaluate((totalHeight: any) => {
                        const container = document.getElementById('matrix-container');
                        if (container) {
                            container.style.height = `${totalHeight}px`;
                        }
                    }, totalHeight);
                    this.tracker.point('evaluate-end', ['evaluate-start']);

                    this.tracker.point('selector-wait-start');
                    const elementHandle = await this.page.waitForSelector('#matrix-container', {state: 'visible'});
                    this.tracker.point('selector-wait-end', ['selector-wait-start']);

                    const boundingBox = await elementHandle!.boundingBox();

                    this.tracker.point('screenshot-start');
                    const screenshotBuffer = await this.page.screenshot({
                        clip: boundingBox!,
                        timeout: 100,
                    });
                    this.tracker.point('screenshot-end', ['screenshot-start']);

                    // Фрейм сохраняется, но не отправляется в WebSocket
                    const frameData: FrameGroup = {
                        startTime: frameGroup.startTime,
                        frameInterval: frameGroup.frameInterval,
                        frameCount: frameGroup.frameCount,
                        totalHeight: frameGroup.totalHeight,
                        width: frameGroup.width,
                        imageBuffer: screenshotBuffer.toString('base64'),
                    };

                    this.tracker.point('screenshot-attempt-end');
                    return;
                } else {
                    console.error('Page is not available');
                    this.tracker.point('page-not-available');
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                this.tracker.point('screenshot-attempt-failed');
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
                    this.tracker.point('screenshot-failed-final');
                }
            }
        }
    }

    public async generateNextFrameGroup(): Promise<FrameGroup | undefined> {
        await this.frameRequestMutex.lock('generateNextGroup');
        try {
            const command: WebSocketCommand = {command: 'generateNextGroup'};
            const responsePromise = new Promise<FrameGroup>((resolve) => {
                this.clients.forEach(ws => {
                    ws.on('message', (event) => {
                        const message: WebSocketCommand = JSON.parse(event.toString());
                        if (message.frameGroup) {
                            resolve(message.frameGroup);
                        }
                    });
                });
            });

            await this.sendWebSocketCommand(command);

            // Ждем ответ от клиента, который пришлет frameGroup
            return await responsePromise;
        } finally {
            this.frameRequestMutex.unlock('generateNextGroup');
        }
    }

    public async getSnapshot(): Promise<string> {
        return new Promise<string>(async (resolve) => {
            this.resolveFunc = resolve;
            const command: WebSocketCommand = {command: 'getSnapshot'};
            await this.sendWebSocketCommand(command);
        });
    }

    public async setSnapshot(snapshot: string): Promise<void> {
        const command: WebSocketCommand = {command: 'loadSnapshot', value: snapshot};
        await this.sendWebSocketCommand(command);
    }

    private async sendWebSocketCommand(command: WebSocketCommand): Promise<void> {
        // Проходим по всем активным клиентам и отправляем команду
        this.clients.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(command));
            } else {
                console.error("WebSocket is not open. Unable to send command:", command);
            }
        });
    }
}

WorkerController.initialize(new Handlers());
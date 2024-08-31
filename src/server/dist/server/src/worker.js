"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handlers = void 0;
const path_1 = __importDefault(require("path"));
const playwright_1 = require("playwright");
const ws_1 = __importDefault(require("ws"));
const ws_2 = require("ws");
const mutex_1 = require("./mutex");
const PointTracker_1 = require("./PointTracker");
const src_1 = require("worker-threads-manager/dist/src");
class Handlers {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.wss = null;
        this.frameRequestMutex = new mutex_1.Mutex();
        this.tracker = new PointTracker_1.PointTracker();
        this.resolveFunc = null;
        this.clients = []; // Массив для хранения активных соединений
    }
    initializePage() {
        return __awaiter(this, void 0, void 0, function* () {
            this.tracker.point('initialization-start');
            try {
                this.browser = yield playwright_1.webkit.launch();
                this.context = yield this.browser.newContext();
                yield this.createNewPage();
                this.tracker.point('initialization-end', ['initialization-start']);
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    createNewPage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.tracker.point('page-creation-start');
                this.page = yield this.context.newPage();
                const filePath = path_1.default.join(__dirname, '../../../src/render/dist/index.html');
                this.tracker.point('page-loading-start');
                yield this.page.goto(`file://${filePath}`, { waitUntil: 'load' });
                this.tracker.point('page-loading-end', ['page-loading-start']);
                this.page.on('console', (msg) => __awaiter(this, void 0, void 0, function* () {
                    const msgArgs = msg.args();
                    try {
                        const logValues = yield Promise.all(msgArgs.map((arg) => __awaiter(this, void 0, void 0, function* () { return yield arg.jsonValue(); })));
                        console.log("::", ...logValues);
                    }
                    catch (e) {
                        console.error("Error logging console output:", e);
                    }
                }));
                console.log('New page loaded');
                this.tracker.point('page-creation-end', ['page-creation-start']);
                yield this.initializeWebSocketAndWaitForOpen();
            }
            catch (error) {
                console.error('Error creating or loading new page:', error);
                this.tracker.point('page-creation-error');
            }
        });
    }
    initializeWebSocketAndWaitForOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const wss = new ws_2.Server({ port: 8081 });
                    this.wss = wss;
                    // Флаг, чтобы отследить, разрешён ли уже промис
                    let isResolved = false;
                    wss.on('connection', (ws) => {
                        console.log('WebSocket connection opened');
                        // Добавляем новое соединение в массив клиентов
                        this.clients.push(ws);
                        // Отправляем команду для инициализации элементов
                        ws.send(JSON.stringify({ command: 'initializeElements' }));
                        // Обрабатываем сообщения
                        ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                            yield this.handleWebSocketMessage({ data: message });
                        }));
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
                }
                catch (error) {
                    console.error('Failed to start WebSocket server:', error);
                    reject(error); // Reject the promise if there's an error
                }
            });
        });
    }
    handleWebSocketMessage(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = JSON.parse(event.data.toString());
            if (message.command === 'loadSnapshot' && this.resolveFunc) {
                this.resolveFunc(message.value);
                this.resolveFunc = null;
            }
            if (message.frameGroup) {
                this.tracker.point('generate-next-group-end', ['generate-next-group-start']);
                const frameGroup = message.frameGroup;
                if (this.page) {
                    this.tracker.point('resize-start');
                    yield this.page.setViewportSize({ width: frameGroup.width, height: frameGroup.totalHeight });
                    this.tracker.point('resize-end', ['resize-start']);
                    this.lastTime = frameGroup.startTime + frameGroup.frameInterval * frameGroup.frameCount;
                    this.tracker.point('render-start');
                    yield this.captureScreenshot(frameGroup);
                    this.tracker.point('render-end', ['render-start']);
                    this.frameRequestMutex.unlock('render-end');
                }
                else {
                    console.log('Page is not available');
                }
            }
        });
    }
    captureScreenshot(frameGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const maxRetries = 5;
            const delayBetweenRetries = 10;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    this.tracker.point('screenshot-attempt-start');
                    const { totalHeight, width } = frameGroup;
                    if (this.page) {
                        this.tracker.point('evaluate-start');
                        yield this.page.evaluate((totalHeight) => {
                            const container = document.getElementById('matrix-container');
                            if (container) {
                                container.style.height = `${totalHeight}px`;
                            }
                        }, totalHeight);
                        this.tracker.point('evaluate-end', ['evaluate-start']);
                        this.tracker.point('selector-wait-start');
                        const elementHandle = yield this.page.waitForSelector('#matrix-container', { state: 'visible' });
                        this.tracker.point('selector-wait-end', ['selector-wait-start']);
                        const boundingBox = yield elementHandle.boundingBox();
                        this.tracker.point('screenshot-start');
                        const screenshotBuffer = yield this.page.screenshot({
                            clip: boundingBox,
                            timeout: 100,
                        });
                        this.tracker.point('screenshot-end', ['screenshot-start']);
                        // Фрейм сохраняется, но не отправляется в WebSocket
                        const frameData = {
                            startTime: frameGroup.startTime,
                            frameInterval: frameGroup.frameInterval,
                            frameCount: frameGroup.frameCount,
                            totalHeight: frameGroup.totalHeight,
                            width: frameGroup.width,
                            imageBuffer: screenshotBuffer.toString('base64'),
                        };
                        this.tracker.point('screenshot-attempt-end');
                        return;
                    }
                    else {
                        console.error('Page is not available');
                        this.tracker.point('page-not-available');
                    }
                }
                catch (error) {
                    console.error(`Attempt ${attempt} failed:`, error);
                    this.tracker.point('screenshot-attempt-failed');
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
                        this.tracker.point('screenshot-failed-final');
                    }
                }
            }
        });
    }
    generateNextFrameGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.frameRequestMutex.lock('generateNextGroup');
            try {
                const command = { command: 'generateNextGroup' };
                const responsePromise = new Promise((resolve) => {
                    this.clients.forEach(ws => {
                        ws.on('message', (event) => {
                            const message = JSON.parse(event.toString());
                            if (message.frameGroup) {
                                resolve(message.frameGroup);
                            }
                        });
                    });
                });
                yield this.sendWebSocketCommand(command);
                // Ждем ответ от клиента, который пришлет frameGroup
                return yield responsePromise;
            }
            finally {
                this.frameRequestMutex.unlock('generateNextGroup');
            }
        });
    }
    getSnapshot() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.resolveFunc = resolve;
                const command = { command: 'getSnapshot' };
                yield this.sendWebSocketCommand(command);
            }));
        });
    }
    setSnapshot(snapshot) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = { command: 'loadSnapshot', value: snapshot };
            yield this.sendWebSocketCommand(command);
        });
    }
    sendWebSocketCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            // Проходим по всем активным клиентам и отправляем команду
            this.clients.forEach(ws => {
                if (ws.readyState === ws_1.default.OPEN) {
                    ws.send(JSON.stringify(command));
                }
                else {
                    console.error("WebSocket is not open. Unable to send command:", command);
                }
            });
        });
    }
}
exports.Handlers = Handlers;
src_1.WorkerController.initialize(new Handlers());
//# sourceMappingURL=worker.js.map
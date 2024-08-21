"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const path_1 = __importDefault(require("path"));
const playwright_1 = require("playwright");
const http_1 = __importDefault(require("http"));
const ws_1 = __importStar(require("ws"));
const PointTracker_1 = require("./PointTracker"); // Подключаем класс PointTracker
class Mutex {
    constructor() {
        this._queue = [];
        this._lock = false;
    }
    lock() {
        return new Promise((res) => {
            if (!this._lock) {
                this._lock = true;
                res();
            }
            else {
                this._queue.push(res);
            }
        });
    }
    unlock() {
        if (this._queue.length > 0) {
            const func = this._queue.shift();
            if (func)
                func();
        }
        else {
            this._lock = false;
        }
    }
}
const server = http_1.default.createServer();
const wss = new ws_1.WebSocketServer({ server });
let clients = [];
let page = null;
let browser;
let context;
let lastTime;
const mutex = new Mutex();
// __dirname equivalent setup for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
let clientCounter = 0;
let startScreenshotTime = 0;
let endScreenshotTime = 0;
let generateNextGroupStart = 0;
let generateNextGroupEnd = 0;
let positiveNextGroupTime = 0;
let wsRender;
let initOnce = false;
let resolveFunc;
let snapshot;
// Инициализация PointTracker
const tracker = new PointTracker_1.PointTracker();
function waitingForSnapshot() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            resolveFunc = resolve;
        });
    });
}
wss.on('connection', (ws) => __awaiter(void 0, void 0, void 0, function* () {
    const clientId = ++clientCounter;
    clients.push(ws);
    console.log(`Client connected: ${clientId}`);
    tracker.point('client-connected');
    if (!initOnce) {
        initOnce = true;
        ws.send(JSON.stringify({ command: 'initializeElements' }));
    }
    if (snapshot) {
        ws.send(JSON.stringify({ command: 'loadSnapshot', value: snapshot }));
        snapshot = undefined;
        console.log('snapshot sent');
    }
    else if (lastTime) {
        ws.send(JSON.stringify({ command: 'setStartTime', value: lastTime }));
    }
    ws.send(JSON.stringify({ command: 'generateNextGroup' }));
    ws.once('close', () => {
        clients = clients.filter((client) => client !== ws);
        console.log(`Client disconnected: ${clientId}`);
        tracker.point('client-disconnected');
    });
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        tracker.point('message-received');
        const request = JSON.parse(message);
        if (request.command == 'loadSnapshot' && resolveFunc) {
            resolveFunc(request.value);
        }
        if (request.frameGroup) {
            wsRender = ws;
            yield mutex.lock();
            generateNextGroupEnd = Date.now();
            positiveNextGroupTime = generateNextGroupEnd - generateNextGroupStart;
            const frameGroup = request.frameGroup;
            if (page) {
                yield page.setViewportSize({ width: frameGroup.width, height: frameGroup.totalHeight });
                lastTime = frameGroup.startTime + frameGroup.frameInterval * frameGroup.frameCount;
                startScreenshotTime = Date.now();
                tracker.point('render-start');
                yield captureAndSendScreenshot(frameGroup);
                endScreenshotTime = Date.now();
                tracker.point('render-end', ['render-start']);
                mutex.unlock();
                let deltaT = frameGroup.startTime - Date.now() - 1000;
                const delay = Math.max(0, deltaT);
                setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                    yield mutex.lock();
                    ws.send(JSON.stringify({ command: 'generateNextGroup' }));
                    generateNextGroupStart = Date.now();
                    tracker.point('generate-next-group');
                    mutex.unlock();
                }), delay / 2);
            }
            else {
                console.log('Page is not available');
            }
        }
    }));
    ws.on('error', (error) => {
        console.error(`WebSocket error with client ${clientId}:`, error);
        tracker.point('error-occurred');
    });
}));
(() => __awaiter(void 0, void 0, void 0, function* () {
    tracker.point('initialization-start');
    yield mutex.lock();
    browser = yield playwright_1.webkit.launch();
    context = yield browser.newContext();
    yield createNewPage();
    mutex.unlock();
    tracker.point('initialization-end');
}))();
function createNewPage() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tracker.point('page-creation-start');
            console.log('Creating new page...');
            page = yield context.newPage();
            const filePath = path_1.default.join(__dirname, '../../../src/render/dist/index.html');
            yield page.goto(`file://${filePath}`, { waitUntil: 'load' });
            page.on('console', (msg) => __awaiter(this, void 0, void 0, function* () {
                yield mutex.lock();
                const msgArgs = msg.args();
                try {
                    const logValues = yield Promise.all(msgArgs.map((arg) => __awaiter(this, void 0, void 0, function* () { return yield arg.jsonValue(); })));
                    console.log("::", ...logValues);
                }
                catch (e) { }
                mutex.unlock();
            }));
            console.log('New page loaded');
            tracker.point('page-creation-end');
        }
        catch (error) {
            console.error('Error creating or loading new page:', error);
            tracker.point('page-creation-error');
        }
    });
}
function captureAndSendScreenshot(frameGroup) {
    return __awaiter(this, void 0, void 0, function* () {
        const maxRetries = 5; // Максимальное количество попыток
        const delayBetweenRetries = 10; // Задержка между попытками в мс
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                tracker.point('screenshot-attempt-start');
                const { totalHeight, frameCount, width } = frameGroup;
                if (page) {
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
                    // Отправляем изображение и параметры для нарезки на клиенте
                    const frameData = {
                        startTime: frameGroup.startTime,
                        frameInterval: frameGroup.frameInterval,
                        frameCount: frameGroup.frameCount,
                        totalHeight: frameGroup.totalHeight,
                        width: frameGroup.width,
                        imageBuffer: screenshotBuffer.toString('base64')
                    };
                    clients.forEach((client) => {
                        if (client.readyState === ws_1.default.OPEN) {
                            tracker.point('sending-data');
                            client.send(JSON.stringify(frameData));
                        }
                    });
                    tracker.point('screenshot-attempt-end');
                    return; // Если скриншот успешно создан, выходим из функции
                }
                else {
                    console.error('Page is not available');
                    tracker.point('page-not-available');
                }
            }
            catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                tracker.point('screenshot-attempt-failed');
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
                    tracker.point('screenshot-failed-final');
                }
            }
        }
    });
}
server.listen(8081, () => {
    console.log('WebSocket server running on port 8081');
    tracker.point('server-started');
});
// Логирование использования памяти каждые 30 секунд
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mutex.lock();
    const memoryUsage = process.memoryUsage();
    console.log(new Date().toLocaleString());
    console.log(`RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);
    console.log(`GenerateNextGroup: ${positiveNextGroupTime}`);
    console.log(`Screenshot time: ${endScreenshotTime - startScreenshotTime}`);
    if (page && wsRender) {
        wsRender.send(JSON.stringify({ command: 'getSnapshot' }));
        snapshot = yield waitingForSnapshot();
        yield page.close();
        yield createNewPage();
    }
    console.log(tracker.report()); // Выводим отчет о времени выполнения
    mutex.unlock();
}), 30000);
//# sourceMappingURL=server.js.map
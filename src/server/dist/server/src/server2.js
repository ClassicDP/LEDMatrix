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
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("worker-threads-manager/dist/src");
const path_1 = require("path");
const ws_1 = require("ws");
const PointTracker_1 = require("@server/PointTracker");
const Matrix_1 = require("../../Matrix/src/Matrix");
const serde_ts_1 = require("serde-ts");
const MatrixElement_1 = require("../../Matrix/src/MatrixElement");
const Modifiers_1 = require("../../Matrix/src/Modifiers");
const mutex_1 = require("@server/mutex");
let clientCounter = 0;
let clients = [];
let tracker = new PointTracker_1.PointTracker();
const manager = new src_1.WorkerManager();
let mutex = new mutex_1.Mutex();
let i = 0;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const wss = new ws_1.Server({ port: 8083 });
    wss.on('connection', (ws) => __awaiter(void 0, void 0, void 0, function* () {
        const clientId = ++clientCounter;
        clients.push(ws);
        console.log(`Client connected: ${clientId}`);
        tracker.point('client-connected');
        ws.once('close', () => {
            clients = clients.filter((client) => client !== ws);
            console.log(`Client disconnected: ${clientId}`);
            tracker.point('client-disconnected');
        });
        ws.on('error', (error) => {
            console.error(`WebSocket error with client ${clientId}:`, error);
            tracker.point('error-occurred');
        });
    }));
    let w1 = yield manager.createWorkerWithHandlers((0, path_1.resolve)(__dirname, 'worker.js'));
    yield manager.call(w1, "initializePage");
    yield manager.call(w1, "setStartTime", new Date());
    serde_ts_1.SerDe.classRegistration([
        Matrix_1.Matrix, MatrixElement_1.MatrixElement, MatrixElement_1.MatrixElement, MatrixElement_1.TimeMatrixElement, Modifiers_1.ScrollingTextModifier, Modifiers_1.ScaleModifier, Modifiers_1.RainbowEffectModifier
    ]);
    let i = 0;
    function updateMatrix() {
        return __awaiter(this, void 0, void 0, function* () {
            yield mutex.lock();
            try {
                let matrix = serde_ts_1.SerDe.deserialize(yield manager.call(w1, 'getSnapshot'));
                matrix.elements[1].setText((i++).toString());
                yield manager.call(w1, 'setSnapshot', serde_ts_1.SerDe.serialise(matrix));
            }
            finally {
                mutex.unlock();
            }
        });
    }
    function processFrameGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield mutex.lock();
            try {
                let frameGroup = yield manager.call(w1, 'generateNextFrameGroup');
                for (let client of clients) {
                    client.send(JSON.stringify(frameGroup));
                }
                let nextTimeout = frameGroup.startTime - Date.now() - 300;
                // Запланируем следующий вызов
                setTimeout(processFrameGroup, Math.max(nextTimeout, 0));
            }
            finally {
                mutex.unlock();
            }
        });
    }
    // Запускаем оба процесса
    setInterval(updateMatrix, 1000);
    processFrameGroup(); // Начальный запуск
}))();
//# sourceMappingURL=server2.js.map
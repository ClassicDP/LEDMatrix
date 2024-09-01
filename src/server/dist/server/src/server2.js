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
let mutex = new mutex_1.Mutex();
class WorkerManager {
    constructor() {
        this.workers = {};
        this.currentWorkerId = null;
        this.ports = [8085, 8086];
        this.currentPortIndex = 0;
        this.manager = new src_1.WorkerManager();
    }
    createWorker() {
        return __awaiter(this, void 0, void 0, function* () {
            const port = this.ports[this.currentPortIndex];
            this.currentPortIndex = 1 - this.currentPortIndex; // Alternate between 8085 and 8086
            const workerId = yield this.manager.createWorkerWithHandlers((0, path_1.resolve)(__dirname, 'worker.js'));
            this.workers[workerId] = workerId;
            yield this.manager.call(workerId, "initializePage", port);
            console.log(`Worker with ID ${workerId} created on port ${port}.`);
            return workerId;
        });
    }
    swapWorkers(newWorkerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldWorkerId = this.currentWorkerId;
            if (oldWorkerId !== null) {
                yield mutex.lock();
                try {
                    console.log(`Swapping from worker ID ${oldWorkerId} to ${newWorkerId}`);
                    // Transfer state from old worker to new worker
                    const snapshot = yield this.manager.call(oldWorkerId, 'getSnapshot');
                    yield this.manager.call(newWorkerId, 'setSnapshot', snapshot);
                    // Cancel all tasks related to the old worker and close WebSocket server
                    yield this.manager.call(oldWorkerId, 'closeWebSocketServer');
                    yield this.manager.terminateWorker(oldWorkerId);
                    delete this.workers[oldWorkerId];
                }
                finally {
                    mutex.unlock();
                }
            }
            this.currentWorkerId = newWorkerId;
            this.startRenderingProcess(newWorkerId);
            console.log(`Worker ID ${newWorkerId} is now the active worker.`);
        });
    }
    startRenderingProcess(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            let i = 0;
            const updateMatrix = () => __awaiter(this, void 0, void 0, function* () {
                yield mutex.lock();
                try {
                    if (this.workers[workerId] === workerId) { // Ensure worker is still valid
                        let matrix = serde_ts_1.SerDe.deserialize(yield this.manager.call(workerId, 'getSnapshot'));
                        matrix.elements[1].setText((i++).toString());
                        yield this.manager.call(workerId, 'setSnapshot', serde_ts_1.SerDe.serialise(matrix));
                    }
                    else {
                        console.error(`Worker with ID ${workerId} is no longer valid during updateMatrix.`);
                    }
                }
                finally {
                    mutex.unlock();
                }
            });
            const processFrameGroup = () => __awaiter(this, void 0, void 0, function* () {
                yield mutex.lock();
                try {
                    if (this.workers[workerId] === workerId) { // Ensure worker is still valid
                        console.log(`Calling worker with ID: ${workerId}, method: generateNextFrameGroup`);
                        let frameGroup = yield this.manager.call(workerId, 'generateNextFrameGroup');
                        if (frameGroup) {
                            for (let client of clients) {
                                client.send(JSON.stringify(frameGroup));
                            }
                        }
                        let nextTimeout = frameGroup.startTime - Date.now() - 300;
                        setTimeout(processFrameGroup, Math.max(nextTimeout, 0));
                    }
                    else {
                        console.error(`Worker with ID ${workerId} is no longer valid during processFrameGroup.`);
                    }
                }
                finally {
                    mutex.unlock();
                }
            });
            // Start frame processing and matrix updates immediately
            processFrameGroup();
            setInterval(updateMatrix, 1000);
        });
    }
    startNewWorkerAndSwap() {
        return __awaiter(this, void 0, void 0, function* () {
            const newWorkerId = yield this.createWorker();
            yield this.swapWorkers(newWorkerId);
        });
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const workerManager = new WorkerManager();
    // Create and start the first worker
    const w1Id = yield workerManager.createWorker();
    workerManager.currentWorkerId = w1Id;
    yield workerManager.startRenderingProcess(w1Id);
    // Immediately start the process to swap to a new worker
    workerManager.startNewWorkerAndSwap();
}))();
(() => __awaiter(void 0, void 0, void 0, function* () {
    const wss = new ws_1.Server({ port: 8083 }); // Only one instance of the WebSocket server
    wss.on('connection', (ws) => {
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
    });
    // Register classes for serialization/deserialization
    serde_ts_1.SerDe.classRegistration([
        Matrix_1.Matrix, MatrixElement_1.MatrixElement, MatrixElement_1.TimeMatrixElement, Modifiers_1.ScrollingTextModifier, Modifiers_1.ScaleModifier, Modifiers_1.RainbowEffectModifier
    ]);
}))();
//# sourceMappingURL=server2.js.map
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
const process = __importStar(require("node:process"));
let i = 0;
let clientCounter = 0;
let clients = [];
let tracker = new PointTracker_1.PointTracker();
let mutex = new mutex_1.Mutex();
class WorkerManager {
    constructor() {
        this.currentWorkerId = undefined;
        this.ports = [8085, 8086];
        this.currentPortIndex = 0;
        this.interval = undefined;
        this.timeout = undefined;
        this.oldWorkerId = undefined;
        this.manager = new src_1.WorkerManager();
    }
    createWorker() {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentPortIndex = 1 - this.currentPortIndex; // Alternate between 8085 and 8086
            const port = this.ports[this.currentPortIndex];
            const workerId = yield this.manager.createWorkerWithHandlers((0, path_1.resolve)(__dirname, 'worker.js'));
            yield this.manager.call(workerId, "initializePage", port);
            // console.log(`Worker with ID ${workerId} created on port ${port}.`);
            this.oldWorkerId = this.currentWorkerId;
            return workerId;
        });
    }
    swapWorkers(lockMutex) {
        return __awaiter(this, void 0, void 0, function* () {
            if (lockMutex)
                lockMutex.unlock();
            if (this.currentWorkerId === undefined)
                return;
            if (this.oldWorkerId !== undefined) {
                yield mutex.lock();
                try {
                    // console.log(`Swapping from worker ID ${this.oldWorkerId} to ${this.currentWorkerId}`);
                    // Transfer state from old worker to new worker
                    const snapshot = yield this.manager.call(this.oldWorkerId, 'getSnapshot');
                    yield this.manager.call(this.currentWorkerId, 'setSnapshot', snapshot);
                    // Cancel all tasks related to the old worker and close WebSocket server
                    yield this.manager.call(this.oldWorkerId, 'closeWebSocketServerAndPage');
                    yield this.manager.terminateWorker(this.oldWorkerId);
                }
                finally {
                    mutex.unlock();
                }
            }
            this.startRenderingProcess();
            console.log(`Worker ID ${this.currentWorkerId} is now the active worker.`);
        });
    }
    updateMatrix() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentWorkerId === undefined)
                return;
            yield mutex.lock();
            try {
                let matrix = serde_ts_1.SerDe.deserialize(yield this.manager.call(this.currentWorkerId, 'getSnapshot'));
                matrix.elements[1].setText((i++).toString());
                yield this.manager.call(this.currentWorkerId, 'setSnapshot', serde_ts_1.SerDe.serialise(matrix));
            }
            finally {
                mutex.unlock();
            }
        });
    }
    ;
    startRenderingProcess() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.interval)
                this.interval = setInterval(this.updateMatrix.bind(this), 1000);
            const processFrameGroup = () => __awaiter(this, void 0, void 0, function* () {
                yield mutex.lock();
                try {
                    if (this.currentWorkerId !== undefined) { // Ensure worker is still valid
                        // console.log(`Calling worker with ID: ${this.currentWorkerId}, method: generateNextFrameGroup`);
                        let frameGroup = yield this.manager.call(this.currentWorkerId, 'generateNextFrameGroup');
                        if (frameGroup) {
                            for (let client of clients) {
                                client.send(JSON.stringify(frameGroup));
                            }
                        }
                        let nextTimeout = frameGroup.startTime - Date.now() - 500;
                        if (this.timeout)
                            clearTimeout(this.timeout);
                        this.timeout = setTimeout(processFrameGroup, Math.max(nextTimeout, 0));
                    }
                    else {
                        console.error(`Worker with ID ${this.currentWorkerId} is no longer valid during processFrameGroup.`);
                    }
                }
                finally {
                    mutex.unlock();
                }
            });
            // Start frame processing and matrix updates immediately
            yield processFrameGroup();
        });
    }
    startNewWorkerAndSwap() {
        return __awaiter(this, void 0, void 0, function* () {
            let workerId = yield this.createWorker();
            yield new Promise(resolve1 => setTimeout(resolve1, 10000));
            yield mutex.lock();
            this.currentWorkerId = workerId;
            yield this.swapWorkers(mutex); // Swap after new worker is fully ready
        });
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const manager = new WorkerManager();
    manager.currentWorkerId = yield manager.createWorker();
    manager.startRenderingProcess();
    while (1) {
        yield manager.startNewWorkerAndSwap();
    }
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
        Matrix_1.Matrix, MatrixElement_1.MatrixElement, MatrixElement_1.TimeMatrixElement, Modifiers_1.ScrollingTextModifier, Modifiers_1.ScaleModifier, Modifiers_1.RainbowEffectModifier, Modifiers_1.ShadowEffectModifier
    ]);
}))();
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
    yield mutex.lock();
    const memoryData = process.memoryUsage();
    const memoryUsage = {
        rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
        heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
        heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
        external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
    };
    console.log(memoryUsage);
    mutex.unlock();
}), 60000);
//# sourceMappingURL=server2.js.map
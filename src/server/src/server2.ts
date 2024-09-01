import { WorkerManager as BaseWorkerManager } from "worker-threads-manager/dist/src";
import { Handlers } from "./worker";
import { resolve } from "path";
import WebSocket, { Server } from "ws";
import { PointTracker } from "@server/PointTracker";
import { Matrix } from "../../Matrix/src/Matrix";
import { SerDe } from "serde-ts";
import { MatrixElement, TimeMatrixElement } from "../../Matrix/src/MatrixElement";
import {
    RainbowEffectModifier,
    RotationModifier,
    ScaleModifier,
    ScrollingTextModifier
} from "../../Matrix/src/Modifiers";
import { Mutex } from "@server/mutex";

let clientCounter = 0;
let clients: WebSocket[] = [];
let tracker = new PointTracker();
let mutex = new Mutex();

class WorkerManager {
    private workers: { [key: number]: number } = {};
    private manager: BaseWorkerManager<Handlers>;
    currentWorkerId: number | null = null;
    private ports = [8085, 8086];
    private currentPortIndex = 0;

    constructor() {
        this.manager = new BaseWorkerManager<Handlers>();
    }

    async createWorker(): Promise<number> {
        const port = this.ports[this.currentPortIndex];
        this.currentPortIndex = 1 - this.currentPortIndex;  // Alternate between 8085 and 8086

        const workerId = await this.manager.createWorkerWithHandlers(resolve(__dirname, 'worker.js'));
        this.workers[workerId] = workerId;
        await this.manager.call(workerId, "initializePage", port);
        console.log(`Worker with ID ${workerId} created on port ${port}.`);

        return workerId;
    }

    async swapWorkers(newWorkerId: number): Promise<void> {
        const oldWorkerId = this.currentWorkerId;

        if (oldWorkerId !== null) {
            await mutex.lock();
            try {
                console.log(`Swapping from worker ID ${oldWorkerId} to ${newWorkerId}`);

                // Transfer state from old worker to new worker
                const snapshot: string = await this.manager.call(oldWorkerId, 'getSnapshot');
                await this.manager.call(newWorkerId, 'setSnapshot', snapshot);

                // Cancel all tasks related to the old worker and close WebSocket server
                await this.manager.call(oldWorkerId, 'closeWebSocketServer');
                await this.manager.terminateWorker(oldWorkerId);
                delete this.workers[oldWorkerId];
            } finally {
                mutex.unlock();
            }
        }

        this.currentWorkerId = newWorkerId;
        this.startRenderingProcess(newWorkerId);
        console.log(`Worker ID ${newWorkerId} is now the active worker.`);
    }

    async startRenderingProcess(workerId: number) {
        let i = 0;

        const updateMatrix = async () => {
            await mutex.lock();
            try {
                if (this.workers[workerId] === workerId) { // Ensure worker is still valid
                    let matrix: Matrix = SerDe.deserialize(await this.manager.call(workerId, 'getSnapshot'));
                    matrix.elements[1].setText((i++).toString());
                    await this.manager.call(workerId, 'setSnapshot', SerDe.serialise(matrix));
                } else {
                    console.error(`Worker with ID ${workerId} is no longer valid during updateMatrix.`);
                }
            } finally {
                mutex.unlock();
            }
        };

        const processFrameGroup = async () => {
            await mutex.lock();
            try {
                if (this.workers[workerId] === workerId) { // Ensure worker is still valid
                    console.log(`Calling worker with ID: ${workerId}, method: generateNextFrameGroup`);
                    let frameGroup = await this.manager.call(workerId, 'generateNextFrameGroup');
                    if (frameGroup) {
                        for (let client of clients) {
                            client.send(JSON.stringify(frameGroup));
                        }
                    }
                    let nextTimeout = frameGroup!.startTime - Date.now() - 300;
                    setTimeout(processFrameGroup, Math.max(nextTimeout, 0));
                } else {
                    console.error(`Worker with ID ${workerId} is no longer valid during processFrameGroup.`);
                }
            } finally {
                mutex.unlock();
            }
        };

        // Start frame processing and matrix updates immediately
        processFrameGroup();
        setInterval(updateMatrix, 1000);
    }

    async startNewWorkerAndSwap() {
        const newWorkerId = await this.createWorker();
        await this.swapWorkers(newWorkerId);
    }
}

(async () => {
    const workerManager = new WorkerManager();

    // Create and start the first worker
    const w1Id = await workerManager.createWorker();
    workerManager.currentWorkerId = w1Id;
    await workerManager.startRenderingProcess(w1Id);

    // Immediately start the process to swap to a new worker
    workerManager.startNewWorkerAndSwap();
})();

(async () => {
    const wss = new Server({ port: 8083 });  // Only one instance of the WebSocket server
    wss.on('connection', (ws: WebSocket) => {
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
    SerDe.classRegistration([
        Matrix, MatrixElement, TimeMatrixElement, ScrollingTextModifier, ScaleModifier, RainbowEffectModifier
    ]);
})();
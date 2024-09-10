import {WorkerManager as BaseWorkerManager} from "worker-threads-manager/dist/src";
import {Handlers} from "./worker";
import {resolve} from "path";
import WebSocket, {Server} from "ws";
import {PointTracker} from "@server/PointTracker";
import {Matrix} from "../../Matrix/src/Matrix";
import {SerDe} from "serde-ts";
import {MatrixElement, TimeMatrixElement} from "../../Matrix/src/MatrixElement";
import {
    RainbowEffectModifier,
    RotationModifier,
    ScaleModifier,
    ScrollingTextModifier, ShadowEffectModifier
} from "../../Matrix/src/Modifiers";
import {Mutex} from "@server/mutex";
import * as process from "node:process";

let i = 0;
let clientCounter = 0;
let clients: WebSocket[] = [];
let tracker = new PointTracker();
let mutex = new Mutex();

class WorkerManager {
    private manager: BaseWorkerManager<Handlers>;
    currentWorkerId: number | undefined = undefined;
    private ports = [8085, 8086];
    private currentPortIndex = 0;
    private interval: NodeJS.Timeout | undefined = undefined;
    private timeout: NodeJS.Timeout | undefined = undefined;
    private oldWorkerId: undefined | number = undefined;

    constructor() {
        this.manager = new BaseWorkerManager<Handlers>();
    }

    async createWorker(): Promise<number> {
        this.currentPortIndex = 1 - this.currentPortIndex;  // Alternate between 8085 and 8086
        const port = this.ports[this.currentPortIndex];

        const workerId = await this.manager.createWorkerWithHandlers(resolve(__dirname, 'worker.js'));
        await this.manager.call(workerId, "initializePage", port);
        // console.log(`Worker with ID ${workerId} created on port ${port}.`);
        this.oldWorkerId = this.currentWorkerId
        return workerId;
    }

    async swapWorkers(lockMutex?: Mutex): Promise<void> {
        if (lockMutex) lockMutex.unlock()
        if (this.currentWorkerId === undefined) return

        if (this.oldWorkerId !== undefined) {
            await mutex.lock();
            try {
                // console.log(`Swapping from worker ID ${this.oldWorkerId} to ${this.currentWorkerId}`);

                // Transfer state from old worker to new worker
                const snapshot: string = await this.manager.call(this.oldWorkerId, 'getSnapshot');
                await this.manager.call(this.currentWorkerId, 'setSnapshot', snapshot);

                // Cancel all tasks related to the old worker and close WebSocket server
                await this.manager.call(this.oldWorkerId, 'closeWebSocketServerAndPage');
                await this.manager.terminateWorker(this.oldWorkerId);
            } finally {
                mutex.unlock();
            }
        }

        this.startRenderingProcess();
        console.log(`Worker ID ${this.currentWorkerId} is now the active worker.`);
    }

    async updateMatrix() {
        if (this.currentWorkerId === undefined) return;
        await mutex.lock();
        try {
            let matrix: Matrix = SerDe.deserialize(await this.manager.call(this.currentWorkerId, 'getSnapshot'));
            matrix.elements[1].setText((i++).toString());
            await this.manager.call(this.currentWorkerId, 'setSnapshot', SerDe.serialise(matrix));
        } finally {
            mutex.unlock();
        }
    };

    async startRenderingProcess(): Promise<void> {

        if (!this.interval)
            this.interval = setInterval(this.updateMatrix.bind(this), 1000)

        const processFrameGroup = async () => {
            await mutex.lock();
            try {
                if (this.currentWorkerId !== undefined) { // Ensure worker is still valid
                    // console.log(`Calling worker with ID: ${this.currentWorkerId}, method: generateNextFrameGroup`);
                    let frameGroup = await this.manager.call(this.currentWorkerId, 'generateNextFrameGroup');
                    if (frameGroup) {
                        for (let client of clients) {
                            client.send(JSON.stringify(frameGroup));
                        }
                    }
                    let nextTimeout = frameGroup!.startTime - Date.now() - 500;
                    if (this.timeout) clearTimeout(this.timeout)
                    this.timeout = setTimeout(processFrameGroup, Math.max(nextTimeout, 0));
                } else {
                    console.error(`Worker with ID ${this.currentWorkerId} is no longer valid during processFrameGroup.`);
                }
            } finally {
                mutex.unlock();
            }
        };

        // Start frame processing and matrix updates immediately
        await processFrameGroup();
    }

    async startNewWorkerAndSwap() {
        let workerId = await this.createWorker();
        await new Promise(resolve1 => setTimeout(resolve1, 10000))
        await mutex.lock()
        this.currentWorkerId = workerId
        await this.swapWorkers(mutex);  // Swap after new worker is fully ready
    }
}

(async () => {
        const manager = new WorkerManager();
        manager.currentWorkerId = await manager.createWorker();
        manager.startRenderingProcess()
        while (1) {
            await manager.startNewWorkerAndSwap()
        }
    }
)();


(async () => {
    const wss = new Server({port: 8083});  // Only one instance of the WebSocket server
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
        Matrix, MatrixElement, TimeMatrixElement, ScrollingTextModifier, ScaleModifier, RainbowEffectModifier, ShadowEffectModifier
    ]);
})();

setInterval(async () => {
    const formatMemoryUsage = (data: any) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
    await mutex.lock()
    const memoryData = process.memoryUsage();

    const memoryUsage = {
        rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
        heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
        heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
        external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
    };

    console.log(memoryUsage);
    mutex.unlock()
}, 60000)




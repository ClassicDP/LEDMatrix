import {WorkerManager} from "worker-threads-manager/dist/src";
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
    ScrollingTextModifier
} from "../../Matrix/src/Modifiers";
import {Mutex} from "@server/mutex";
let clientCounter = 0
let clients: WebSocket[] = []
let tracker = new PointTracker()
const manager = new WorkerManager<Handlers>();
let mutex = new Mutex();
let i = 0;
(async ()=>{
    const wss = new Server({port: 8083});
    wss.on('connection', async (ws: WebSocket) => {
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

    let w1 = await manager.createWorkerWithHandlers(resolve(__dirname, 'worker.js'))
    await manager.call(w1, "initializePage")
    await manager.call(w1, "setStartTime", new Date())
    SerDe.classRegistration([
        Matrix, MatrixElement, MatrixElement, TimeMatrixElement, ScrollingTextModifier, ScaleModifier, RainbowEffectModifier])
    let i = 0;

    async function updateMatrix() {
        await mutex.lock();
        try {
            let matrix: Matrix = SerDe.deserialize(await manager.call(w1, 'getSnapshot'));
            matrix.elements[1].setText((i++).toString());
            await manager.call(w1, 'setSnapshot', SerDe.serialise(matrix));
        } finally {
            mutex.unlock();
        }
    }

    async function processFrameGroup() {
        await mutex.lock();
        try {
            let frameGroup = await manager.call(w1, 'generateNextFrameGroup');
            for (let client of clients) {
                client.send(JSON.stringify(frameGroup));
            }
            let nextTimeout = frameGroup!.startTime - Date.now() - 300;

            // Запланируем следующий вызов
            setTimeout(processFrameGroup, Math.max(nextTimeout, 0));
        } finally {
            mutex.unlock();
        }
    }

// Запускаем оба процесса
    setInterval(updateMatrix, 1000);
    processFrameGroup(); // Начальный запуск


})()


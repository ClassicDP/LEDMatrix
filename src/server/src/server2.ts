import {WorkerManager} from "worker-threads-manager/dist/src";
import {Handlers} from "./worker";
import {resolve} from "path";
import WebSocket, {Server} from "ws";
import {PointTracker} from "@server/PointTracker";
let clientCounter = 0
let clients: WebSocket[] = []
let tracker = new PointTracker()
const manager = new WorkerManager<Handlers>();
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
    while (1) {
        let frameGroup = await manager.call(w1, 'generateNextFrameGroup')
        for (let client of clients) {
            client.send(JSON.stringify(frameGroup))
        }
        let timeOut = frameGroup!.startTime - Date.now() - 300
        await new Promise(resolve=>setTimeout(resolve, Math.max(0, timeOut)))
    }


})()


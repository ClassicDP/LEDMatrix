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
let clientCounter = 0;
let clients = [];
let tracker = new PointTracker_1.PointTracker();
const manager = new src_1.WorkerManager();
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
    while (1) {
        let frameGroup = yield manager.call(w1, 'generateNextFrameGroup');
        for (let client of clients) {
            client.send(JSON.stringify(frameGroup));
        }
        let timeOut = frameGroup.startTime - Date.now() - 300;
        yield new Promise(resolve => setTimeout(resolve, Math.max(0, timeOut)));
    }
}))();
//# sourceMappingURL=server2.js.map
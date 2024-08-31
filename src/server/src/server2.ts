import {WorkerManager} from "worker-threads-manager/dist/src";
import {Handlers} from "./worker";
import {resolve} from "path";

const manager = new WorkerManager<Handlers>();
(async ()=>{
    let w1 = await manager.createWorkerWithHandlers(resolve(__dirname, 'worker.js'))
    console.log(1)
    await manager.call(w1, "initializePage")
    console.log(2)
    let frameGroup = await manager.call(w1, 'generateNextFrameGroup')
    console.log(frameGroup)

})()


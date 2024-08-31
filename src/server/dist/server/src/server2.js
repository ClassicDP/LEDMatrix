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
const manager = new src_1.WorkerManager();
(() => __awaiter(void 0, void 0, void 0, function* () {
    let w1 = yield manager.createWorkerWithHandlers((0, path_1.resolve)(__dirname, 'worker.js'));
    console.log(1);
    yield manager.call(w1, "initializePage");
    console.log(2);
    let frameGroup = yield manager.call(w1, 'generateNextFrameGroup');
    console.log(frameGroup);
}))();
//# sourceMappingURL=server2.js.map
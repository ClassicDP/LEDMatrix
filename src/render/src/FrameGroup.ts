export class FrameGroup {
    startTime: number;
    frameInterval: number;
    frameCount: number;
    speed: number;
    framePositions: number[];
    totalHeight: number;
    width: number;

    constructor(startTime: number, frameInterval: number, frameCount: number, speed: number, framePositions: number[], totalHeight: number, width: number) {
        this.startTime = startTime;
        this.frameInterval = frameInterval;
        this.frameCount = frameCount;
        this.speed = speed;
        this.framePositions = framePositions;
        this.totalHeight = totalHeight;
        this.width = width;
    }
}

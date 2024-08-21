"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointTracker = void 0;
class PointTracker {
    constructor() {
        this.points = new Map();
        this.lastTimestamps = new Map();
        this.lastPoint = null;
    }
    point(pointName, checkPoints) {
        const currentTime = Date.now();
        if (!this.points.has(pointName)) {
            this.points.set(pointName, new PointData());
        }
        const currentPointData = this.points.get(pointName);
        if (this.lastTimestamps.has(pointName)) { // Исправленная строка
            const timeSinceLastVisit = currentTime - this.lastTimestamps.get(pointName); // Исправленная строка
            currentPointData.updateIterationTime(timeSinceLastVisit);
        }
        currentPointData.incrementVisits();
        // Обработка точек из checkPoints
        if (checkPoints) {
            checkPoints.forEach((checkPointName) => {
                if (this.lastTimestamps.has(checkPointName)) {
                    const timeSpent = currentTime - this.lastTimestamps.get(checkPointName);
                    const checkPointData = this.points.get(pointName);
                    checkPointData.updateTransition(checkPointName, timeSpent);
                }
            });
        }
        // Обработка предшествующей точки
        if (this.lastPoint !== null && this.lastPoint !== pointName) {
            const timeSpent = currentTime - this.lastTimestamps.get(this.lastPoint);
            currentPointData.updateTransition(this.lastPoint + " (previous)", timeSpent);
        }
        // Обновление последнего времени посещения точки
        this.lastTimestamps.set(pointName, currentTime);
        this.lastPoint = pointName;
    }
    report() {
        const reportLines = [];
        this.points.forEach((data, point) => {
            reportLines.push(`Point: ${point}, Total Visits: ${data.totalVisits}, Average Iteration Time: ${data.averageIterationTime().toFixed(2)}ms`);
            data.transitions.forEach((transitionData, fromPoint) => {
                reportLines.push(`  Transition from ${fromPoint} to ${point}, Count: ${transitionData.count}, Min Time: ${transitionData.minTime.toFixed(2)}ms, Max Time: ${transitionData.maxTime.toFixed(2)}ms, Avg Time: ${transitionData.averageTime().toFixed(2)}ms`);
            });
        });
        return reportLines.join("\n");
    }
}
exports.PointTracker = PointTracker;
class PointData {
    constructor() {
        this.totalVisits = 0;
        this.totalIterationTime = 0;
        this.transitions = new Map();
    }
    incrementVisits() {
        this.totalVisits += 1;
    }
    updateIterationTime(timeSpent) {
        this.totalIterationTime += timeSpent;
    }
    averageIterationTime() {
        return this.totalVisits > 1 ? this.totalIterationTime / (this.totalVisits - 1) : 0;
    }
    updateTransition(fromPoint, timeSpent) {
        if (!this.transitions.has(fromPoint)) {
            this.transitions.set(fromPoint, new TransitionData());
        }
        const transitionData = this.transitions.get(fromPoint);
        transitionData.update(timeSpent);
    }
}
class TransitionData {
    constructor() {
        this.count = 0;
        this.totalTime = 0;
        this.minTime = Infinity;
        this.maxTime = 0;
    }
    update(timeSpent) {
        this.count += 1;
        this.totalTime += timeSpent;
        this.minTime = Math.min(this.minTime, timeSpent);
        this.maxTime = Math.max(this.maxTime, timeSpent);
    }
    averageTime() {
        return this.count > 0 ? this.totalTime / this.count : 0;
    }
}
//# sourceMappingURL=PointTracker.js.map
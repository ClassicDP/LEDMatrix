import chalk from 'chalk';

interface ReportFilter {
    minTime?: number;
    visits?: number;
}

export class PointTracker {
    private points: Map<string, PointData>;
    private lastTimestamps: Map<string, number>;
    private lastPoint: string | null;

    constructor() {
        this.points = new Map();
        this.lastTimestamps = new Map();
        this.lastPoint = null;
    }

    point(pointName: string, checkPoints?: Array<string>): void {
        const currentTime = Date.now();

        if (!this.points.has(pointName)) {
            this.points.set(pointName, new PointData());
        }

        const currentPointData = this.points.get(pointName)!;

        if (this.lastTimestamps.has(pointName)) {
            const timeSinceLastVisit = currentTime - this.lastTimestamps.get(pointName)!;
            currentPointData.updateIterationTime(timeSinceLastVisit);
        }

        currentPointData.incrementVisits();

        if (checkPoints) {
            checkPoints.forEach((checkPointName) => {
                if (this.lastTimestamps.has(checkPointName)) {
                    const timeSpent = currentTime - this.lastTimestamps.get(checkPointName)!;
                    const checkPointData = this.points.get(pointName)!;
                    checkPointData.updateTransition(checkPointName, timeSpent);
                }
            });
        }

        if (this.lastPoint !== null && this.lastPoint !== pointName) {
            const timeSpent = currentTime - this.lastTimestamps.get(this.lastPoint)!;
            currentPointData.updateTransition(this.lastPoint + " (previous)", timeSpent);
        }

        this.lastTimestamps.set(pointName, currentTime);
        this.lastPoint = pointName;
    }

    report(filter: ReportFilter = {}): string {
        const reportLines: string[] = [];
        const minTimeFilter = filter.minTime || 0;
        const minVisitsFilter = filter.visits || 0;

        this.points.forEach((data, point) => {
            const avgTime = data.averageIterationTime();

            if (avgTime >= minTimeFilter && data.totalVisits >= minVisitsFilter) {
                reportLines.push(
                    `${chalk.green(point)}: Visits=${data.totalVisits}, AvgTime=${chalk.red(avgTime.toFixed(2))}ms`
                );

                data.transitions.forEach((transitionData, fromPoint) => {
                    if (transitionData.averageTime() >= minTimeFilter) {
                        reportLines.push(
                            `  ${chalk.cyan(fromPoint)} -> ${chalk.green(point)}: Count=${transitionData.count}, Min=${transitionData.minTime.toFixed(2)}ms, Max=${transitionData.maxTime.toFixed(2)}ms, Avg=${chalk.red(transitionData.averageTime().toFixed(2))}ms`
                        );
                    }
                });
            }
        });

        return reportLines.join("\n");
    }
}

class PointData {
    totalVisits: number;
    totalIterationTime: number;
    transitions: Map<string, TransitionData>;

    constructor() {
        this.totalVisits = 0;
        this.totalIterationTime = 0;
        this.transitions = new Map();
    }

    incrementVisits(): void {
        this.totalVisits += 1;
    }

    updateIterationTime(timeSpent: number): void {
        this.totalIterationTime += timeSpent;
    }

    averageIterationTime(): number {
        return this.totalVisits > 1 ? this.totalIterationTime / (this.totalVisits - 1) : 0;
    }

    updateTransition(fromPoint: string, timeSpent: number): void {
        if (!this.transitions.has(fromPoint)) {
            this.transitions.set(fromPoint, new TransitionData());
        }

        const transitionData = this.transitions.get(fromPoint)!;
        transitionData.update(timeSpent);
    }
}

class TransitionData {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;

    constructor() {
        this.count = 0;
        this.totalTime = 0;
        this.minTime = Infinity;
        this.maxTime = 0;
    }

    update(timeSpent: number): void {
        this.count += 1;
        this.totalTime += timeSpent;
        this.minTime = Math.min(this.minTime, timeSpent);
        this.maxTime = Math.max(this.maxTime, timeSpent);
    }

    averageTime(): number {
        return this.count > 0 ? this.totalTime / this.count : 0;
    }
}

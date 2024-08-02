"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ledMatrixRenderer_1 = require("./ledMatrixRenderer.js");
var scrollingText_1 = require("./scrollingText.js");
var rainbow_1 = require("./rainbow.js");
var AnimationFrameGenerator = /** @class */ (function () {
    function AnimationFrameGenerator(containerId, width, height, framesPerSecond, frameCount, speed, startTime, wsUrl) {
        var _this = this;
        this.container = document.getElementById(containerId);
        this.width = width;
        this.height = height;
        this.framesPerSecond = framesPerSecond;
        this.frameCount = frameCount;
        this.speed = speed / 1000;
        this.currentTime = startTime;
        this.generatedGroups = 0;
        this.scrollingText = new scrollingText_1.ScrollingText("", width, speed);
        this.matrix = new ledMatrixRenderer_1.LEDMatrix(containerId, width, height * frameCount);
        this.ws = new WebSocket(wsUrl);
        this.ws.onopen = function () {
            console.log('WebSocket connected');
        };
        this.ws.onmessage = function (event) {
            try {
                var message = JSON.parse(event.data);
                console.log('+++Received message from server:', message);
                if (message.command === 'generateNextGroup') {
                    _this.generateAndSendNextGroup();
                }
            }
            catch (e) {
            }
        };
        this.ws.onerror = function (error) {
            console.error('WebSocket error:', error);
        };
        this.ws.onclose = function () {
            console.log('WebSocket disconnected');
        };
    }
    AnimationFrameGenerator.prototype.clearDOM = function () {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    };
    AnimationFrameGenerator.prototype.generateTimeStrings = function () {
        var timeStrings = [];
        var frameInterval = 1000 / this.framesPerSecond;
        var time = this.currentTime + this.generatedGroups * this.frameCount * frameInterval;
        for (var i = 0; i < this.frameCount; i++) {
            var date = new Date(time + i * frameInterval);
            var timeString = "".concat(String(date.getHours()).padStart(2, '0'), ":").concat(String(date.getMinutes()).padStart(2, '0'), ":").concat(String(date.getSeconds()).padStart(2, '0'), ".").concat(String(date.getMilliseconds()).padStart(3, '0'));
            timeStrings.push(timeString);
        }
        return timeStrings;
    };
    AnimationFrameGenerator.prototype.generateNextGroup = function () {
        this.clearDOM();
        console.log(this.framesPerSecond);
        var textArray = this.generateTimeStrings();
        var frameInterval = 1000 / this.framesPerSecond;
        var startTime = this.currentTime;
        var framePositions = [];
        for (var i = 0; i < this.frameCount; i++) {
            var currentTime = startTime + i * frameInterval;
            var deltaTime = currentTime - startTime;
            this.scrollingText.setText(textArray[i]);
            this.scrollingText.updatePosition(deltaTime);
            var progress = i / this.frameCount;
            var gradientText = (0, rainbow_1.createRainbowGradient)(this.scrollingText.getText(), progress);
            this.matrix.renderFrame(gradientText, this.scrollingText.getPosition(), i * this.height);
            framePositions.push(this.scrollingText.getPosition());
        }
        this.currentTime += frameInterval * this.frameCount;
        this.generatedGroups += 1;
        return {
            startTime: startTime,
            frameInterval: frameInterval,
            frameCount: this.frameCount,
            speed: this.speed,
            framePositions: framePositions,
            totalHeight: this.height * this.frameCount
        };
    };
    AnimationFrameGenerator.prototype.generateAndSendNextGroup = function () {
        var frameGroup = this.generateNextGroup();
        this.ws.send(JSON.stringify({ frameGroup: frameGroup }));
    };
    return AnimationFrameGenerator;
}());
// Пример использования
var animationGenerator = new AnimationFrameGenerator('animation-container', 96, 32, 30, 10, 20, Date.now(), 'ws://localhost:8081');

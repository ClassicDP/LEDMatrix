"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEDMatrix = void 0;
var LEDMatrix = /** @class */ (function () {
    function LEDMatrix(containerId, width, height) {
        this.container = document.getElementById(containerId);
        this.width = width;
        this.height = height;
        this.container.style.width = "".concat(this.width, "px");
        this.container.style.height = "".concat(this.height, "px");
        this.container.style.overflow = 'hidden';
        this.container.style.position = 'relative';
    }
    LEDMatrix.prototype.renderFrame = function (text, positionX, positionY) {
        var frame = document.createElement('div');
        frame.className = 'frame';
        frame.style.position = 'absolute';
        frame.style.width = "".concat(this.width, "px");
        frame.style.height = "".concat(this.height / 10, "px"); // высота фрейма должна быть меньше общей высоты, если количество кадров больше 1
        frame.style.overflow = 'hidden';
        frame.style.left = "".concat(positionX, "px");
        frame.style.top = "".concat(positionY, "px");
        var rainbowText = document.createElement('div');
        rainbowText.className = 'rainbow-text';
        rainbowText.innerHTML = text;
        rainbowText.style.position = 'absolute';
        rainbowText.style.whiteSpace = 'nowrap';
        frame.appendChild(rainbowText);
        this.container.appendChild(frame);
    };
    return LEDMatrix;
}());
exports.LEDMatrix = LEDMatrix;

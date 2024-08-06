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
self.onmessage = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const frameGroup = event.data;
    const imageBuffer = Uint8Array.from(atob(frameGroup.imageBuffer), c => c.charCodeAt(0));
    // Создаем OffscreenCanvas для работы с изображением
    const offscreenCanvas = new OffscreenCanvas(frameGroup.width, frameGroup.totalHeight);
    const ctx = offscreenCanvas.getContext('2d');
    const imageBitmap = yield createImageBitmap(new Blob([imageBuffer.buffer], { type: 'image/png' }));
    ctx.drawImage(imageBitmap, 0, 0);
    const frameHeight = Math.floor(imageBitmap.height / frameGroup.frameCount);
    const frames = [];
    for (let i = 0; i < frameGroup.frameCount; i++) {
        const yPosition = i * frameHeight;
        // Создаем новый OffscreenCanvas для нарезки кадров
        const tempCanvas = new OffscreenCanvas(imageBitmap.width, frameHeight);
        const tempCtx = tempCanvas.getContext('2d');
        // Рисуем соответствующую часть изображения
        tempCtx.drawImage(offscreenCanvas, 0, -yPosition);
        // Конвертируем canvas в Blob и затем в Base64 строку
        const blob = yield tempCanvas.convertToBlob();
        const base64String = yield new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        // Убираем префикс "data:image/png;base64," из строки base64
        const base64Data = base64String.split(',')[1];
        // Добавляем фрейм в массив
        frames.push({
            timeStamp: frameGroup.startTime + i * frameGroup.frameInterval,
            imageBuffer: base64Data,
        });
    }
    // Отправляем нарезанные кадры обратно в основной поток
    self.postMessage(frames);
});
//# sourceMappingURL=imageWorker.js.map
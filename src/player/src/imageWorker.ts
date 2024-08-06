interface Frame {
    timeStamp: number;
    imageBuffer: string;
}

interface FrameGroup {
    startTime: number;
    frameInterval: number;
    frameCount: number;
    totalHeight: number;
    width: number;
    imageBuffer: string;
}

self.onmessage = async (event) => {
    const frameGroup: FrameGroup = event.data;

    const imageBuffer = Uint8Array.from(atob(frameGroup.imageBuffer), c => c.charCodeAt(0));

    // Создаем OffscreenCanvas для работы с изображением
    const offscreenCanvas = new OffscreenCanvas(frameGroup.width, frameGroup.totalHeight);
    const ctx = offscreenCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

    const imageBitmap = await createImageBitmap(new Blob([imageBuffer.buffer], { type: 'image/png' }));
    ctx.drawImage(imageBitmap, 0, 0);

    const frameHeight = Math.floor(imageBitmap.height / frameGroup.frameCount);
    const frames: Frame[] = [];

    for (let i = 0; i < frameGroup.frameCount; i++) {
        const yPosition = i * frameHeight;

        // Создаем новый OffscreenCanvas для нарезки кадров
        const tempCanvas = new OffscreenCanvas(imageBitmap.width, frameHeight);
        const tempCtx = tempCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

        // Рисуем соответствующую часть изображения
        tempCtx.drawImage(offscreenCanvas, 0, -yPosition);

        // Конвертируем canvas в Blob и затем в Base64 строку
        const blob = await tempCanvas.convertToBlob();
        const base64String = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
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
};

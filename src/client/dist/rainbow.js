export function createRainbowGradient(text, progress) {
    // Генерация градиента, применяемого ко всему тексту
    const gradientText = `<span style="background: linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet);
                            background-clip: text; -webkit-background-clip: text; color: transparent;
                            background-size: 200%; background-position: ${progress * 100}%;">
                            ${text}
                          </span>`;
    return gradientText;
}
//# sourceMappingURL=rainbow.js.map
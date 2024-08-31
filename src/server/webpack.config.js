const path = require('path');

module.exports = {
    mode: 'development', // Используйте 'development' для отладки или 'production' для финальной сборки

    entry: {
        server2: './src/server2.ts',  // Точка входа для сервера
        worker: './src/worker.ts'    // Точка входа для воркера
    },
    target: 'node', // Важно для серверных приложений и воркеров

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true, // Ускоряет сборку, отключая проверку типов
                            experimentalWatchApi: true, // Улучшает производительность в режиме наблюдения
                        },
                    }
                ],
                exclude: /node_modules/,
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif)$/,  // Для обработки изображений
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                        },
                    },
                ],
            },
        ],
    },

    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@matrix': path.resolve(__dirname, 'Matrix/src/'),
            '@server': path.resolve(__dirname, 'src/'),
        },
    },

    externals: {
        'playwright': 'commonjs playwright', // Исключаем playwright из сборки
        'ws': 'commonjs ws'
    },

    output: {
        filename: '[name].js',  // [name] будет заменен на имя точки входа (server или worker)
        path: path.resolve(__dirname, 'dist'),
        sourceMapFilename: '[file].map', // Генерация файлов карт исходников
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]', // Обеспечивает правильное сопоставление путей для карт исходников
    },

    devtool: 'inline-source-map', // 'inline-source-map' может помочь с более точной отладкой
};
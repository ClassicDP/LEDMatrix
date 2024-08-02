import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: {
        index: './src/index.ts',
    },
    devtool: 'source-map',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'), // Путь до dist
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html', // Убедитесь, что путь правильный
            chunks: ['index'],
            filename: 'index.html',
            inject: true,
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8080,
        hot: true,
        watchFiles: [
            'dist/*.js',     // Наблюдаем за всеми JS-файлами в папке dist
            'dist/*.html',   // Наблюдаем за всеми HTML-файлами в папке dist
            'src/**/*.html', // Также наблюдаем за исходными HTML-файлами
            'src/**/*.ts',   // Наблюдаем за изменениями файлов TypeScript
        ],
    },
    mode: 'development',
};

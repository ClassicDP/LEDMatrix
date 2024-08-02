import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: {
        player: './src/player.ts',
    },
    devtool: 'source-map',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
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
            template: './src/player.html', // Путь к вашему шаблону HTML
            chunks: ['player'],
            filename: 'index.html', // Как будет называться файл в dist
            inject: true,
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8082, // Убедитесь, что порт свободен
        hot: true,
        open: true,
        watchFiles: [
            'dist/*.js',
            'dist/*.html',
            'src/**/*.html',
            'src/**/*.ts',
        ],
    },
    mode: 'development',
};

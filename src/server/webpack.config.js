import path from 'path';

export default {
    entry: './src/server.ts',
    output: {
        filename: 'server.js',
        path: path.resolve(process.cwd(), 'dist'),
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    target: 'node',
    mode: 'production',
};

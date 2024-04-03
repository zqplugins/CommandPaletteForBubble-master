const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ProvidePlugin, optimize: { LimitChunkCountPlugin } } = require('webpack');

const config = {
    entry: './update.js',
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ]
                    }
                }
            },
        ],
    },
    plugins: [
        new ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            //   process: 'process/browser',
        }),
        new HtmlWebpackPlugin({
            title: 'cristinuta',
        }),
        new LimitChunkCountPlugin({
            maxChunks: 1,
        }),
    ],
    resolve: {
        fallback: {
            //     "assert": require.resolve("assert"),
            //     "https": require.resolve("https-browserify"),
            //     "http": require.resolve("stream-http"),
            "stream": require.resolve("stream-browserify"),
            //     "crypto": require.resolve("crypto-browserify"),
            //     "path": require.resolve("path-browserify"),
            //     // "os": require.resolve("os-browserify/browser"),
            "buffer": require.resolve("buffer"),
            //     "url": require.resolve("url")
        },
        //   extensions: ['.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'zQ_CommandPaletteForBubble',
        libraryTarget: 'window',
        libraryExport: 'default'
    },
};

module.exports = (env, argv) => {
    if (argv.mode === 'production') {
        Object.assign(config, {
            devtool: 'source-map',
            devServer: {
                port: 9000,
                static: './dist',
            },

        });
    }

    return config;
}

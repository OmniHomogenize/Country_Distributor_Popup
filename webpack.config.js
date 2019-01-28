var path = require('path');
var webpack = require('webpack');

module.exports = {
    mode: "development",
    entry: {
        app: ['babel-polyfill', './js/app2.js']
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'app.bundle.js'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                },

            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};


var path = require('path');
var webpack = require('webpack');
var glob = require('globby');

module.exports = {
    //devtool: 'eval-cheap-module-source-map',
    entry: {
        app: glob.sync(['./src/**/*.ts', '!./src/main/main.ts']).concat(['./src/main/main.ts']),
        vendor: ['vue', 'axios', 'cerialize', 'needles']
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
        publicPath: '/build/'
    },

    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.js', '.ts']
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' },
            { test: /.haml$/, loader: "haml" },
            { test: /.json$/, loader: "json" }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js")
    ]
};
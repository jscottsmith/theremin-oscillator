// Change this root to point to the desired example when
const PROJECT_ROOT = './src/';
const PROJECT_DIST = './';

const createBabelConfig = require('./babelrc');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const webpack = require('webpack');

const baseConfig = {
    resolve: {
        alias: {
            'components': path.resolve(PROJECT_ROOT + 'components'),
        },
    },
};

const clientConfig = merge(baseConfig, {
    entry: path.resolve(PROJECT_ROOT + 'client.js'),

    output: {
        path: path.resolve(
            PROJECT_DIST + 'dist'
        ),
        filename: 'bundle.js',
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(PROJECT_ROOT),
                    path.resolve('./src'),
                ],
                loader: 'babel-loader',
                query: createBabelConfig(),
            },
            {
                test: /\.scss$/,
                include: [
                    path.resolve(PROJECT_ROOT),
                ],
                loaders: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        query: {
                            localIdentName: '[name]_[local]_[hash:base64:3]',
                            importLoaders: 1,
                        },
                    },
                    'postcss-loader',
                    {
                        loader: 'sass-loader',
                        query: {
                            outputStyle: 'expanded',
                        },
                    },
                ],
            },
        ],
    },
});

const serverConfig = merge(baseConfig, {
    target: 'node',

    watch: true,

    externals: [nodeExternals()],

    node: {
        __dirname: true,
    },

    entry: path.resolve(PROJECT_ROOT + 'server.js'),

    output: {
        path: path.resolve(
            PROJECT_DIST + 'dist'
        ),
        filename: 'server.js',
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(PROJECT_ROOT),
                    path.resolve('./src'),
                ],
                loader: 'babel-loader',
                query: createBabelConfig({ server: true }),
            },
            {
                test: /\.scss$/,
                include: [
                    path.resolve(PROJECT_ROOT),
                ],
                loaders: [
                    {
                        loader: 'css-loader/locals',
                        query: {
                            localIdentName: '[name]_[local]_[hash:base64:3]',
                            sourceMap: false,
                        },
                    },
                    'postcss-loader', {
                        loader: 'sass-loader',
                        query: {
                            outputStyle: 'expanded',
                        },
                    },
                ],
            },
        ],
    },
});

module.exports = [clientConfig, serverConfig];

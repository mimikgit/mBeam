const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, 'build');
const SRC_DIR = path.resolve(__dirname, 'src');

module.exports = {
  mode: 'production',
  entry: [`${SRC_DIR}/index.js`],
  output: {
    path: BUILD_DIR,
    filename: 'index.js',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        }
      }),
    ],
    concatenateModules: true,
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.js$/,
        exclude: [
          /node_modules\/(?!@mimik\/edge-ms-helper)/,
        ],
        query: {
          presets: ['@babel/preset-env'],
        },
        loader: 'babel-loader',
      },
    ],
  },
};

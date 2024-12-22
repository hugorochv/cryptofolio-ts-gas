const GasPlugin = require('gas-webpack-plugin');

const entry = './dist/index.js';

module.exports = {
  mode: 'development',
  context: __dirname,
  entry,
  output: {
    path: __dirname,
    filename: 'Code.js',
  },
  plugins: [
    new GasPlugin({
      autoGlobalExportsFiles: [entry],
    }),
  ],
  devtool: false,
};

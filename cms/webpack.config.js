const path = require('path');

module.exports = {
  entry: './login-main.mjs',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
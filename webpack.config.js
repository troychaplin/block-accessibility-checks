const defaultConfig = require('@wordpress/scripts/config/webpack.config')
const path = require('path')

module.exports = {
  ...defaultConfig,
  entry: {
    'block-check-script': [path.resolve(__dirname, 'src/script.js')],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  }
}

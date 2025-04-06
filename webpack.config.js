const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry,
		'block-checks': [path.resolve(__dirname, 'src/script.js')],
		'block-admin': [path.resolve(__dirname, 'src/admin.js')],
	},
	output: {
		...defaultConfig.output,
		path: path.resolve(__dirname, 'build'),
		filename: '[name].js',
	},
};

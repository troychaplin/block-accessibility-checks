const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
	...defaultConfig,
	entry: {
		'block-checks': path.resolve(__dirname, 'src/editor/index.js'),
		settings: path.resolve(__dirname, 'src/settings/index.js'),
	},
	output: {
		...defaultConfig.output,
		path: path.resolve(__dirname, 'build'),
		filename: '[name].js',
	},
	resolve: {
		...defaultConfig.resolve,
		alias: {
			...defaultConfig.resolve.alias,
			'@': path.resolve(__dirname, 'src/'),
			'@editor': path.resolve(__dirname, 'src/editor/'),
			'@settings': path.resolve(__dirname, 'src/settings/'),
		},
	},
};

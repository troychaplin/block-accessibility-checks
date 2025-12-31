const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry,
		'block-checks': [path.resolve(__dirname, 'src/script.js')],
		'block-admin': [path.resolve(__dirname, 'src/admin.js')],
		'settings-core-blocks': [
			path.resolve(__dirname, 'src/settings-core-blocks.js'),
			path.resolve(__dirname, 'src/settings.scss'),
		],
		'settings-editor-validation': [
			path.resolve(__dirname, 'src/settings-editor-validation.js'),
			path.resolve(__dirname, 'src/settings.scss'),
		],
	},
	output: {
		...defaultConfig.output,
		path: path.resolve(__dirname, 'build'),
		filename: '[name].js',
	},
};

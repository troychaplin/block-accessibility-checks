const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry,
		'block-checks': [path.resolve(__dirname, 'src/script.js')],
		'block-admin': [path.resolve(__dirname, 'src/admin.js')],
		'settings-core-blocks': [
			path.resolve(__dirname, 'src/admin/pages/CoreBlocks/index.js'),
			path.resolve(__dirname, 'src/settings.scss'),
		],
		'settings-editor-validation': [
			path.resolve(__dirname, 'src/admin/pages/EditorValidation/index.js'),
			path.resolve(__dirname, 'src/settings.scss'),
		],
		'settings-external-plugins': [
			path.resolve(__dirname, 'src/admin/pages/ExternalPlugins/index.js'),
			path.resolve(__dirname, 'src/settings.scss'),
		],
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
			'@admin': path.resolve(__dirname, 'src/admin/'),
			'@shared': path.resolve(__dirname, 'src/shared/'),
		},
	},
};

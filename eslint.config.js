const defaultConfig = require( '@wordpress/scripts/config/eslint.config.cjs' );
const prettierConfig = require( 'eslint-config-prettier' );

module.exports = [
	...defaultConfig,
	// Disable all ESLint rules that conflict with Prettier.
	prettierConfig,
	// Project-specific rule overrides.
	{
		rules: {
			'@wordpress/no-global-active-element': 'warn',
			'@wordpress/no-unsafe-wp-apis': 'off',
			// @wordpress/* packages are WordPress externals — available at runtime but not all
			// installed on disk. Suppress the unresolved-import error for this namespace.
			'import/no-unresolved': [ 'error', { ignore: [ '^@wordpress/' ] } ],
		},
	},
];

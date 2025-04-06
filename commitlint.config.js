module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			[
				'add',
				'change',
				'deprecate',
				'doc',
				'fix',
				'finish',
				'refactor',
				'release',
				'revert',
				'test',
				'upgrade',
			],
		],
	},
};

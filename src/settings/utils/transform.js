const { blockTitles = {}, postTypeLabels = {}, pluginNames = {} } = window.ba11ycSettings || {};

/**
 * Convert a plugin namespace slug to a human-readable display name.
 *
 * Falls back to title-casing the slug when no explicit mapping is provided.
 *
 * @param {string} namespace The registered namespace slug (e.g. 'block-accessibility-checks').
 * @return {string} Display name (e.g. 'Block Accessibility Checks').
 */
function namespaceToPluginName(namespace) {
	if (!namespace) return '—';
	if (pluginNames[namespace]) return pluginNames[namespace];
	return namespace
		.split('-')
		.map(w => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

/**
 * Read a per-check site-editor flag from the settings tree.
 *
 * Defaults to true (enabled) when no explicit flag is stored.
 *
 * @param {Object} settings The saved settings object.
 * @param {Array}  path     The keys into settings.siteEditor (e.g. ['block', blockType, checkName]).
 * @return {boolean} Whether the check runs in the site editor.
 */
function readSiteEditorFlag(settings, path) {
	let node = settings?.siteEditor;
	for (const key of path) {
		if (!node || typeof node !== 'object' || !(key in node)) {
			return false; // No explicit flag: default disabled.
		}
		node = node[key];
	}
	return node === true; // Only true means explicitly enabled.
}

/**
 * Flatten the nested checks REST response into a row-per-check array.
 *
 * @param {Object} checks   The response from GET .../v1/checks.
 * @param {Object} settings The response from GET .../v1/settings.
 * @return {Array} Flat array of row objects.
 */
export function transformChecksToRows(checks, settings) {
	const rows = [];
	const categoryLabel = cat => (cat === 'validation' ? 'Validation' : 'Accessibility');

	// Block checks: checks.block[blockType][checkName]
	if (checks.block) {
		for (const [blockType, blockChecks] of Object.entries(checks.block)) {
			for (const [checkName, check] of Object.entries(blockChecks)) {
				if (check.configurable === false) {
					continue;
				}

				const override = settings?.block?.[blockType]?.[checkName] ?? null;
				const siteEditor = readSiteEditorFlag(settings, ['block', blockType, checkName]);

				rows.push({
					id: `block__${blockType}__${checkName}`,
					scope: 'block',
					block_type: blockType,
					check_name: checkName,
					description: check.description || '',
					check_type: 'Block',
					category: categoryLabel(check.category),
					target: blockTitles[blockType] || blockType,
					plugin_name: namespaceToPluginName(check._namespace),
					level: override ?? check.level,
					default_level: check.level,
					has_override: override !== null,
					site_editor: siteEditor,
				});
			}
		}
	}

	// Meta checks: checks.meta[postType][metaKey][checkName]
	if (checks.meta) {
		for (const [postType, metaKeys] of Object.entries(checks.meta)) {
			for (const [metaKey, metaChecks] of Object.entries(metaKeys)) {
				for (const [checkName, check] of Object.entries(metaChecks)) {
					if (check.configurable === false) {
						continue;
					}

					const override = settings?.meta?.[postType]?.[metaKey]?.[checkName] ?? null;
					const siteEditor = readSiteEditorFlag(settings, [
						'meta',
						postType,
						metaKey,
						checkName,
					]);

					rows.push({
						id: `meta__${postType}__${metaKey}__${checkName}`,
						scope: 'meta',
						post_type: postType,
						meta_key: metaKey,
						check_name: checkName,
						description: check.description || '',
						check_type: 'Meta',
						category: categoryLabel(check.category),
						target: `${metaKey} (${postTypeLabels[postType] || postType})`,
						plugin_name: namespaceToPluginName(check._namespace),
						level: override ?? check.level,
						default_level: check.level,
						has_override: override !== null,
						site_editor: siteEditor,
					});
				}
			}
		}
	}

	// Editor checks: checks.editor[postType][checkName]
	if (checks.editor) {
		for (const [postType, editorChecks] of Object.entries(checks.editor)) {
			for (const [checkName, check] of Object.entries(editorChecks)) {
				if (check.configurable === false) {
					continue;
				}

				const override = settings?.editor?.[postType]?.[checkName] ?? null;
				const siteEditor = readSiteEditorFlag(settings, ['editor', postType, checkName]);

				rows.push({
					id: `editor__${postType}__${checkName}`,
					scope: 'editor',
					post_type: postType,
					check_name: checkName,
					description: check.description || '',
					check_type: 'Editor',
					category: categoryLabel(check.category),
					target: postTypeLabels[postType] || postType,
					plugin_name: namespaceToPluginName(check._namespace),
					level: override ?? check.level,
					default_level: check.level,
					has_override: override !== null,
					site_editor: siteEditor,
				});
			}
		}
	}

	return rows;
}

/**
 * Set a deeply-nested value, creating intermediate objects as needed.
 *
 * @param {Object} obj   The target object.
 * @param {Array}  path  The key path.
 * @param {*}      value The value to set.
 */
function setDeep(obj, path, value) {
	let node = obj;
	for (let i = 0; i < path.length - 1; i++) {
		if (!node[path[i]]) {
			node[path[i]] = {};
		}
		node = node[path[i]];
	}
	node[path[path.length - 1]] = value;
}

/**
 * Convert flat rows + general settings back into the nested settings structure.
 *
 * Only overridden levels and disabled site-editor flags are persisted.
 *
 * @param {Array}  rows    The flat array of row objects.
 * @param {Object} general The general settings ({ headingLevels, siteEditorEnabled }).
 * @return {Object} Nested settings object for POST .../v1/settings.
 */
export function rowsToSettings(rows, general) {
	const settings = {};

	for (const row of rows) {
		let levelPath;
		if (row.scope === 'meta') {
			levelPath = ['meta', row.post_type, row.meta_key, row.check_name];
		} else if (row.scope === 'editor') {
			levelPath = ['editor', row.post_type, row.check_name];
		} else {
			levelPath = ['block', row.block_type, row.check_name];
		}

		if (row.has_override) {
			setDeep(settings, levelPath, row.level);
		}

		// Persist site-editor flag only when enabled (default is disabled).
		if (row.site_editor === true) {
			setDeep(settings, ['siteEditor', ...levelPath], true);
		}
	}

	settings.general = {
		headingLevels: general?.headingLevels || [],
	};

	return settings;
}

/**
 * External Plugins Settings App
 *
 * Main React component for external plugin settings pages.
 * This is a dynamic component that works for any external plugin.
 */

import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Spinner, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { SettingsHeader, SettingsTable } from '../../components';

export default function ExternalPluginsPage() {
	const initialData = window.ba11yExternalPluginSettings || {};
	const [settings, setSettings] = useState(() => {
		// Convert blocks array to settings object
		const settingsObj = {};
		if (initialData.settings?.blocks) {
			initialData.settings.blocks.forEach(block => {
				block.checks.forEach(check => {
					settingsObj[check.fieldName] = check.value;
				});
			});
		}
		return settingsObj;
	});
	const [isSaving, setIsSaving] = useState(false);
	const [notice, setNotice] = useState(null);
	const [hasChanges, setHasChanges] = useState(false);

	const blocks = initialData.settings?.blocks || [];
	const pluginName =
		initialData.pluginName || __('External Plugin', 'block-accessibility-checks');
	const pluginSlug = initialData.pluginSlug || '';

	/**
	 * Handle setting change
	 *
	 * @param {string} fieldName - The field name to update.
	 * @param {string} value     - The new value for the field.
	 */
	const handleSettingChange = (fieldName, value) => {
		setSettings(prev => ({
			...prev,
			[fieldName]: value,
		}));
		setHasChanges(true);
	};

	/**
	 * Save settings
	 */
	const handleSave = async () => {
		setIsSaving(true);
		setNotice(null);

		try {
			const response = await apiFetch({
				path: `/block-accessibility/v1/external-plugin-settings/${pluginSlug}`,
				method: 'POST',
				data: {
					settings,
				},
			});

			if (response.success) {
				setNotice({
					status: 'success',
					message: response.message,
				});
				setHasChanges(false);
			} else {
				setNotice({
					status: 'error',
					message: response.message,
				});
			}
		} catch (error) {
			setNotice({
				status: 'error',
				message: __('Failed to save settings.', 'block-accessibility-checks'),
			});
		} finally {
			setIsSaving(false);
		}
	};

	// Auto-dismiss success notices after 5 seconds
	useEffect(() => {
		if (notice?.status === 'success') {
			const timer = setTimeout(() => {
				setNotice(null);
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [notice]);

	if (!blocks.length) {
		return (
			<div className="ba11y-settings-wrapper">
				<Spinner />
			</div>
		);
	}

	// Group blocks by type (block checks, meta checks, editor checks)
	const blockChecks = blocks.filter(
		block => !block.blockType.startsWith('meta_') && !block.blockType.startsWith('editor_')
	);
	const metaChecks = blocks.filter(block => block.blockType.startsWith('meta_'));
	const editorChecks = blocks.filter(block => block.blockType.startsWith('editor_'));

	return (
		<div className="ba11y-settings-wrapper">
			<SettingsHeader
				title={pluginName}
				description={__(
					'Configure accessibility checks and validations for this plugin',
					'block-accessibility-checks'
				)}
			/>

			<div className="ba11y-settings-content">
				{notice && (
					<Notice
						status={notice.status}
						isDismissible={true}
						onRemove={() => setNotice(null)}
					>
						{notice.message}
					</Notice>
				)}

				{blockChecks.length > 0 && (
					<SettingsTable
						blocks={blockChecks}
						settings={settings}
						onSettingChange={handleSettingChange}
						checkHeaderLabel={__('Block Validation', 'block-accessibility-checks')}
					/>
				)}

				{metaChecks.length > 0 && (
					<SettingsTable
						blocks={metaChecks}
						settings={settings}
						onSettingChange={handleSettingChange}
						checkHeaderLabel={__('Post Meta Validation', 'block-accessibility-checks')}
						blockHeaderLabel={__('Meta Field', 'block-accessibility-checks')}
						categoryHeaderLabel={__('Post Type', 'block-accessibility-checks')}
					/>
				)}

				{editorChecks.length > 0 && (
					<SettingsTable
						blocks={editorChecks}
						settings={settings}
						onSettingChange={handleSettingChange}
						checkHeaderLabel={__('Editor Validation', 'block-accessibility-checks')}
						blockHeaderLabel={__('Post Type', 'block-accessibility-checks')}
					/>
				)}

				<div className="ba11y-settings-actions">
					<Button
						variant="primary"
						onClick={handleSave}
						isBusy={isSaving}
						disabled={!hasChanges || isSaving}
					>
						{isSaving
							? __('Saving…', 'block-accessibility-checks')
							: __('Save Settings', 'block-accessibility-checks')}
					</Button>
					{hasChanges && !isSaving && (
						<span className="ba11y-unsaved-notice">
							{__('You have unsaved changes', 'block-accessibility-checks')}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

/**
 * Core Block Checks Settings App
 *
 * Main React component for the Core Block Checks settings page.
 * Replaces the PHP-rendered settings page with a modern React interface.
 */

import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Spinner, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { SettingsHeader, SettingsTable } from '../../components';

export default function CoreBlocksPage() {
	const initialData = window.ba11yCoreBlockSettings || {};
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
	const [siteEditorSettings, setSiteEditorSettings] = useState(() => {
		// Convert blocks array to site editor settings object
		const siteEditorObj = {};
		if (initialData.settings?.blocks) {
			initialData.settings.blocks.forEach(block => {
				block.checks.forEach(check => {
					const siteEditorFieldName = check.fieldName + '_site_editor';
					siteEditorObj[siteEditorFieldName] = check.siteEditorEnabled ?? true;
				});
			});
		}
		return siteEditorObj;
	});
	const [headingLevels, setHeadingLevels] = useState(() => {
		return initialData.settings?.headingLevels || [];
	});
	const [isSaving, setIsSaving] = useState(false);
	const [notice, setNotice] = useState(null);
	const [hasChanges, setHasChanges] = useState(false);

	const blocks = initialData.settings?.blocks || [];

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
	 * Handle site editor toggle change
	 *
	 * @param {string}  fieldName - The field name to update.
	 * @param {boolean} enabled   - Whether site editor is enabled.
	 */
	const handleSiteEditorChange = (fieldName, enabled) => {
		const siteEditorFieldName = fieldName + '_site_editor';
		setSiteEditorSettings(prev => ({
			...prev,
			[siteEditorFieldName]: enabled,
		}));
		setHasChanges(true);
	};

	/**
	 * Handle heading level checkbox change
	 *
	 * @param {string}  level   - The heading level (h1, h5, h6).
	 * @param {boolean} checked - Whether the checkbox is checked.
	 */
	const handleHeadingLevelChange = (level, checked) => {
		setHeadingLevels(prev => {
			if (checked) {
				// Add level if not already present
				return prev.includes(level) ? prev : [...prev, level];
			}
			// Remove level
			return prev.filter(l => l !== level);
		});
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
				path: '/block-accessibility/v1/core-block-settings',
				method: 'POST',
				data: {
					settings,
					headingLevels,
					siteEditorSettings,
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

	return (
		<div className="ba11y-settings-wrapper">
			<SettingsHeader
				title={__('Core Block Validations', 'block-accessibility-checks')}
				description={__(
					'Configure accessibility checks and validations for core WordPress blocks',
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

				<SettingsTable
					blocks={blocks}
					settings={settings}
					headingLevels={headingLevels}
					siteEditorSettings={siteEditorSettings}
					onSettingChange={handleSettingChange}
					onHeadingLevelChange={handleHeadingLevelChange}
					onSiteEditorChange={handleSiteEditorChange}
				/>

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

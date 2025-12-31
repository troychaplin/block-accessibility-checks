/**
 * Editor Validation Settings App
 *
 * Main React component for the Editor Validation (Post & Page) settings page.
 */

import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Spinner, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import SettingsHeader from './components/SettingsHeader';
import SettingsTable from './components/SettingsTable';

export default function EditorValidationApp() {
	const initialData = window.ba11yEditorValidationSettings || {};
	const [settings, setSettings] = useState(() => {
		// Convert post types array to settings object
		// Include postType in the key to differentiate between post and page settings
		const settingsObj = {};
		if (initialData.settings?.postTypes) {
			initialData.settings.postTypes.forEach(postType => {
				postType.checks.forEach(check => {
					const key = `${check.postType}:${check.fieldName}`;
					settingsObj[key] = check.value;
				});
			});
		}
		return settingsObj;
	});
	const [isSaving, setIsSaving] = useState(false);
	const [notice, setNotice] = useState(null);
	const [hasChanges, setHasChanges] = useState(false);

	const postTypes = initialData.settings?.postTypes || [];

	/**
	 * Handle setting change
	 *
	 * @param {string} fieldName - The field name to update (format: "postType:fieldName").
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
				path: '/block-accessibility/v1/editor-validation-settings',
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

	if (!postTypes.length) {
		return (
			<div className="ba11y-settings-wrapper">
				<Spinner />
			</div>
		);
	}

	// Flatten all post types into a single blocks array for the table
	const allBlocks = [];
	postTypes.forEach(postType => {
		postType.checks.forEach(check => {
			// Create a unique key that includes the post type
			const checkWithKey = {
				...check,
				fieldName: `${check.postType}:${check.fieldName}`,
			};
			allBlocks.push({
				blockType: postType.postType,
				label: postType.label,
				checks: [checkWithKey],
			});
		});
	});

	return (
		<div className="ba11y-settings-wrapper">
			<SettingsHeader
				title={__('Editor Validation', 'block-accessibility-checks')}
				description={__(
					'Configure validation checks for the post and page editor',
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
					blocks={allBlocks}
					settings={settings}
					onSettingChange={handleSettingChange}
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

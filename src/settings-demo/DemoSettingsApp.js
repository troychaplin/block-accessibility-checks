/**
 * Demo Settings App
 *
 * Main React component for the demo settings page.
 * Uses ToggleGroupControl for a clean, table-like interface.
 */

import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Spinner, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import SettingsHeader from './components/SettingsHeader';
import SettingsTable from './components/SettingsTable';

export default function DemoSettingsApp() {
	const initialData = window.ba11yDemoSettings || {};
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
				path: '/block-accessibility/v1/demo-settings',
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

	if (!blocks.length) {
		return (
			<div className="ba11y-demo-wrapper">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="ba11y-demo-wrapper">
			<SettingsHeader
				title={__('Demo Settings (React POC)', 'block-accessibility-checks')}
				description={__(
					'This is a proof-of-concept demo using ToggleGroupControl for a clean, table-like interface.',
					'block-accessibility-checks'
				)}
			/>

			<div className="ba11y-demo-content">
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
					onSettingChange={handleSettingChange}
				/>

				<div className="ba11y-demo-actions">
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

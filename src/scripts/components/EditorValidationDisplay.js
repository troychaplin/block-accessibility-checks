/**
 * WordPress dependencies
 */
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { GetInvalidEditorChecks } from '../validation/getInvalidEditorChecks';

/**
 * Component to display editor validation errors in the document settings panel.
 */
export function EditorValidationDisplay() {
	const invalidChecks = GetInvalidEditorChecks();

	if (!invalidChecks || invalidChecks.length === 0) {
		return null;
	}

	return (
		<PluginDocumentSettingPanel
			name="editor-validation-display"
			title={__('Editor Validation', 'block-accessibility-checks')}
			className="ba11y-editor-validation-panel"
		>
			<div className="ba11y-validation-list">
				{invalidChecks.map((check, index) => (
					<div
						key={index}
						className={`ba11y-validation-item ba11y-validation-item--${check.type}`}
					>
						<div className="ba11y-validation-message">
							<strong>
								{check.type === 'error'
									? __('Error:', 'block-accessibility-checks')
									: __('Warning:', 'block-accessibility-checks')}
							</strong>{' '}
							{check.type === 'error' ? check.error_msg : check.warning_msg}
						</div>
						{check.description && (
							<div className="ba11y-validation-description">{check.description}</div>
						)}
					</div>
				))}
			</div>
		</PluginDocumentSettingPanel>
	);
}

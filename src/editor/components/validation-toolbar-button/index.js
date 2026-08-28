/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { ToolbarButton, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ValidationIcon } from '../validation-icon';
import { hasErrors, getErrors, getWarnings } from '../../utils/issue-helpers';

/**
 * Validation Toolbar Button
 *
 * Renders a button in the block toolbar that opens a modal displaying
 * all validation issues grouped by severity.
 *
 * @param {Object}        props        - The component props.
 * @param {Array<Object>} props.issues - Array of validation issues to display.
 */
export function ValidationToolbarButton({ issues }) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	if (!issues || issues.length === 0) {
		return null;
	}

	const hasBlockErrors = hasErrors(issues);
	const errors = getErrors(issues);
	const warnings = getWarnings(issues);

	const icon = hasBlockErrors ? (
		<ValidationIcon fill="#d82000" />
	) : (
		<ValidationIcon fill="#dbc900" />
	);

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	return (
		<>
			<ToolbarButton
				icon={icon}
				onClick={openModal}
				label={__('View block issues or concerns', 'block-accessibility-checks')}
				className="ba11yc-toolbar-button"
				isCompact
			/>
			{isModalOpen && (
				<Modal
					title={__('Issues or Concerns', 'block-accessibility-checks')}
					onRequestClose={closeModal}
					className="ba11yc-block-indicator-modal"
				>
					<div className="ba11yc-indicator-modal-content">
						{errors.length > 0 && (
							<div className="ba11yc-indicator-section ba11yc-indicator-errors">
								<h2 className="ba11yc-indicator-section-title">
									<span className="ba11yc-indicator-section-title-circle"></span>
									{__('Errors', 'block-accessibility-checks')}
								</h2>
								<ul>
									{errors.map((issue, index) => (
										<li key={`error-${index}`}>{issue.errorMsg}</li>
									))}
								</ul>
							</div>
						)}

						{warnings.length > 0 && (
							<div className="ba11yc-indicator-section ba11yc-indicator-warnings">
								<h2 className="ba11yc-indicator-section-title">
									<span className="ba11yc-indicator-section-title-circle"></span>
									{__('Warnings', 'block-accessibility-checks')}
								</h2>
								<ul>
									{warnings.map((warning, index) => (
										<li key={`warning-${index}`}>
											{warning.warningMsg || warning.errorMsg}
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</Modal>
			)}
		</>
	);
}

export default ValidationToolbarButton;

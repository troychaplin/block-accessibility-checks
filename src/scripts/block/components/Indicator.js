/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { Modal, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { error, caution } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	hasErrors,
	getErrors,
	getWarnings,
	filterIssuesByCategory,
} from '../../core/utils/issueHelpers';

/**
 * Block Indicator Component
 *
 * Displays a visual indicator icon in the upper-left corner of blocks with
 * validation issues. The indicator shows an error or warning icon based on
 * issue severity. Clicking the indicator opens a modal displaying all
 * validation issues grouped by type and category.
 *
 * @param {Object}        props        - The component props.
 * @param {Array<Object>} props.issues - Array of validation issues to display.
 */
export function BlockIndicator({ issues }) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Don't render indicator if there are no issues
	if (!issues || issues.length === 0) {
		return null;
	}

	// Check issue severity to determine which icon to display
	const hasBlockErrors = hasErrors(issues);

	// Separate issues by severity type
	const errors = getErrors(issues);
	const warnings = getWarnings(issues);

	// Further organize issues by category for grouped display
	const accessibilityErrors = filterIssuesByCategory(errors, 'accessibility');
	const validationErrors = filterIssuesByCategory(errors, 'validation');
	const accessibilityWarnings = filterIssuesByCategory(warnings, 'accessibility');
	const validationWarnings = filterIssuesByCategory(warnings, 'validation');

	// Determine if divider is needed
	const showDivider =
		(accessibilityErrors.length > 0 || validationErrors.length > 0) &&
		(accessibilityWarnings.length > 0 || validationWarnings.length > 0);

	// Set icon and CSS classes based on severity (errors take precedence)
	const icon = hasBlockErrors ? error : caution;
	const className = hasBlockErrors
		? 'ba11y-block-indicator ba11y-block-indicator--error'
		: 'ba11y-block-indicator ba11y-block-indicator--warning';

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	return (
		<>
			<div className={className}>
				<Button
					icon={icon}
					onClick={openModal}
					className="ba11y-block-indicator-button"
					aria-label={__('View validation issues', 'block-accessibility-checks')}
				/>
			</div>
			{isModalOpen && (
				<Modal
					title={__('Validation Issues', 'block-accessibility-checks')}
					onRequestClose={closeModal}
					className="ba11y-block-indicator-modal"
				>
					<div className="ba11y-indicator-modal-content">
						{/* Accessibility Errors */}
						{accessibilityErrors.length > 0 && (
							<div className="ba11y-indicator-section ba11y-indicator-errors">
								<strong className="ba11y-indicator-section-title">
									{__('Accessibility Errors', 'block-accessibility-checks')}
								</strong>
								<ul>
									{accessibilityErrors.map((issue, index) => (
										<li key={`a11y-error-${index}`}>{issue.error_msg}</li>
									))}
								</ul>
							</div>
						)}

						{/* Validation Errors */}
						{validationErrors.length > 0 && (
							<div className="ba11y-indicator-section ba11y-indicator-errors">
								<strong className="ba11y-indicator-section-title">
									{__('Validation Errors', 'block-accessibility-checks')}
								</strong>
								<ul>
									{validationErrors.map((issue, index) => (
										<li key={`validation-error-${index}`}>{issue.error_msg}</li>
									))}
								</ul>
							</div>
						)}

						{/* Divider between errors and warnings */}
						{showDivider && <div className="ba11y-indicator-divider"></div>}

						{/* Accessibility Warnings */}
						{accessibilityWarnings.length > 0 && (
							<div className="ba11y-indicator-section ba11y-indicator-warnings">
								<strong className="ba11y-indicator-section-title">
									{__('Accessibility Warnings', 'block-accessibility-checks')}
								</strong>
								<ul>
									{accessibilityWarnings.map((warning, index) => (
										<li key={`a11y-warning-${index}`}>
											{warning.warning_msg || warning.error_msg}
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Validation Warnings */}
						{validationWarnings.length > 0 && (
							<div className="ba11y-indicator-section ba11y-indicator-warnings">
								<strong className="ba11y-indicator-section-title">
									{__('Validation Warnings', 'block-accessibility-checks')}
								</strong>
								<ul>
									{validationWarnings.map((warning, index) => (
										<li key={`validation-warning-${index}`}>
											{warning.warning_msg || warning.error_msg}
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

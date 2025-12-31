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
import { hasErrors, getErrors, getWarnings } from '../../shared/utils/validation';

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

	// Set icon and CSS classes based on severity (errors take precedence)
	const icon = hasBlockErrors ? error : caution;
	const className = hasBlockErrors
		? 'ba11y-block-indicator ba11y-block-indicator--error'
		: 'ba11y-block-indicator ba11y-block-indicator--warning';

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	// Helper to format message with category
	const getMessageWithCategory = (text, category) => {
		const categoryLabel =
			category === 'validation'
				? __('(Validation)', 'block-accessibility-checks')
				: __('(Accessibility)', 'block-accessibility-checks');

		return (
			<>
				{text} <span className="ba11y-indicator-category-label">{categoryLabel}</span>
			</>
		);
	};

	return (
		<>
			<div className={className}>
				<Button
					icon={icon}
					onClick={openModal}
					className="ba11y-block-indicator-button"
					aria-label={__('View block issues or concerns', 'block-accessibility-checks')}
				/>
			</div>
			{isModalOpen && (
				<Modal
					title={__('Issues or Concerns', 'block-accessibility-checks')}
					onRequestClose={closeModal}
					className="ba11y-block-indicator-modal"
				>
					<div className="ba11y-indicator-modal-content">
						{/* Errors Section */}
						{errors.length > 0 && (
							<div className="ba11y-indicator-section ba11y-indicator-errors">
								<p>
									<strong className="ba11y-indicator-section-title">
										<span className="ba11y-indicator-section-title-circle"></span>
										{__('Errors', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul>
									{errors.map((issue, index) => (
										<li key={`error-${index}`}>
											{getMessageWithCategory(
												issue.error_msg,
												issue.category
											)}
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Warnings Section */}
						{warnings.length > 0 && (
							<div className="ba11y-indicator-section ba11y-indicator-warnings">
								<p>
									<strong className="ba11y-indicator-section-title">
										<span className="ba11y-indicator-section-title-circle"></span>
										{__('Warnings', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul>
									{warnings.map((warning, index) => (
										<li key={`warning-${index}`}>
											{getMessageWithCategory(
												warning.warning_msg || warning.error_msg,
												warning.category
											)}
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

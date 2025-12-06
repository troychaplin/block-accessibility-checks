/**
 * WordPress dependencies
 */
import { useState, useEffect, useRef } from '@wordpress/element';
import { Popover, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { error, caution, close } from '@wordpress/icons';

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
 * issue severity. Clicking the indicator opens a popover displaying all
 * validation issues grouped by type and category.
 *
 * @param {Object}        props          - The component props.
 * @param {Array<Object>} props.issues   - Array of validation issues to display.
 * @param {string}        props.clientId - The unique client ID of the block.
 */
export function BlockIndicator({ issues, clientId }) {
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);
	const buttonRef = useRef(null);

	/**
	 * Handle tooltip open/close behavior and click-outside detection
	 *
	 * Manages closing the popover when user clicks outside of it and ensures
	 * only one tooltip is open at a time across all block indicators.
	 */
	useEffect(() => {
		if (!isTooltipOpen) {
			return;
		}

		const handleClickOutside = event => {
			// Detect if click occurred inside the button or popover
			const popover = document.querySelector('.ba11y-block-indicator-popover');
			const isClickInsideButton = buttonRef.current?.contains(event.target);
			const isClickInsidePopover = popover?.contains(event.target);

			if (!isClickInsideButton && !isClickInsidePopover) {
				setIsTooltipOpen(false);
			}
		};

		// Broadcast event to close all other open tooltips
		const closeOtherTooltips = () => {
			window.dispatchEvent(
				new CustomEvent('ba11y-close-other-tooltips', {
					detail: { clientId },
				})
			);
		};

		// Defer event listener attachment to ensure popover DOM is ready
		setTimeout(() => {
			document.addEventListener('mousedown', handleClickOutside);
			closeOtherTooltips();
		}, 0);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isTooltipOpen, clientId]);

	/**
	 * Listen for close events broadcast by other indicators
	 *
	 * When another indicator opens its tooltip, this effect ensures this
	 * tooltip closes, maintaining a single-open-tooltip behavior.
	 */
	useEffect(() => {
		const handleCloseEvent = event => {
			if (event.detail.clientId !== clientId) {
				setIsTooltipOpen(false);
			}
		};

		window.addEventListener('ba11y-close-other-tooltips', handleCloseEvent);
		return () => {
			window.removeEventListener('ba11y-close-other-tooltips', handleCloseEvent);
		};
	}, [clientId]);

	// Don't render indicator if there are no issues
	if (!issues || issues.length === 0) {
		return null;
	}

	// Check issue severity to determine which icon to display
	const hasBlockErrors = hasErrors(issues);
	// const hasWarnings = issues.some(issue => issue.type === 'warning');

	// Separate issues by severity type
	const errors = getErrors(issues);
	const warnings = getWarnings(issues);

	// Further organize issues by category for grouped display in popover
	const accessibilityErrors = filterIssuesByCategory(errors, 'accessibility');
	const validationErrors = filterIssuesByCategory(errors, 'validation');
	const accessibilityWarnings = filterIssuesByCategory(warnings, 'accessibility');
	const validationWarnings = filterIssuesByCategory(warnings, 'validation');

	// Set icon and CSS classes based on severity (errors take precedence)
	const icon = hasBlockErrors ? error : caution;
	const className = hasBlockErrors
		? 'ba11y-block-indicator ba11y-block-indicator--error'
		: 'ba11y-block-indicator ba11y-block-indicator--warning';

	const handleToggle = () => {
		setIsTooltipOpen(!isTooltipOpen);
	};

	return (
		<div className={className} ref={buttonRef}>
			<Button
				icon={icon}
				onClick={handleToggle}
				className="ba11y-block-indicator-button"
				aria-label={__('View validation issues', 'block-accessibility-checks')}
			/>
			{isTooltipOpen && (
				<Popover
					position="top right"
					onClose={() => setIsTooltipOpen(false)}
					className="ba11y-block-indicator-popover"
					focusOnMount={false}
				>
					<div className="ba11y-indicator-tooltip">
						<div className="ba11y-indicator-tooltip-header">
							<strong>{__('Validation Issues', 'block-accessibility-checks')}</strong>
							<Button
								icon={close}
								onClick={() => setIsTooltipOpen(false)}
								className="ba11y-indicator-close-button"
								aria-label={__('Close', 'block-accessibility-checks')}
								isSmall
							/>
						</div>
						<div className="ba11y-indicator-tooltip-content">
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
											<li key={`validation-error-${index}`}>
												{issue.error_msg}
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Divider between errors and warnings */}
							{(accessibilityErrors.length > 0 || validationErrors.length > 0) &&
								(accessibilityWarnings.length > 0 ||
									validationWarnings.length > 0) && (
									<div className="ba11y-indicator-divider"></div>
								)}

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
					</div>
				</Popover>
			)}
		</div>
	);
}

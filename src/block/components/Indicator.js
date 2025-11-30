/**
 * WordPress dependencies
 */
import { useState, useEffect, useRef } from '@wordpress/element';
import { Popover, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { error, caution, close } from '@wordpress/icons';

/**
 * Block Indicator Component
 *
 * Displays a small icon badge in the upper-left corner of a block
 * when it has validation issues. Clicking shows a tooltip with issue details.
 *
 * @param {Object}        props          - The component props.
 * @param {Array<Object>} props.issues   - The issues to display.
 * @param {string}        props.clientId - The client ID of the block.
 */
export function BlockIndicator({ issues, clientId }) {
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);
	const buttonRef = useRef(null);

	// Close tooltip when clicking outside
	useEffect(() => {
		if (!isTooltipOpen) {
			return;
		}

		const handleClickOutside = event => {
			// Check if click is inside the button or popover
			const popover = document.querySelector('.ba11y-block-indicator-popover');
			const isClickInsideButton = buttonRef.current?.contains(event.target);
			const isClickInsidePopover = popover?.contains(event.target);

			if (!isClickInsideButton && !isClickInsidePopover) {
				setIsTooltipOpen(false);
			}
		};

		// Close other tooltips when this one opens
		const closeOtherTooltips = () => {
			// Dispatch event to close other indicators
			window.dispatchEvent(
				new CustomEvent('ba11y-close-other-tooltips', {
					detail: { clientId },
				})
			);
		};

		// Use setTimeout to ensure popover is rendered
		setTimeout(() => {
			document.addEventListener('mousedown', handleClickOutside);
			closeOtherTooltips();
		}, 0);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isTooltipOpen, clientId]);

	// Listen for close events from other indicators
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

	if (!issues || issues.length === 0) {
		return null;
	}

	// Determine if we have errors or warnings
	const hasErrors = issues.some(issue => issue.type === 'error');
	// const hasWarnings = issues.some(issue => issue.type === 'warning');

	// Group issues by type and category
	const errors = issues.filter(issue => issue.type === 'error');
	const warnings = issues.filter(issue => issue.type === 'warning');

	// Group by category for better organization
	const accessibilityErrors = errors.filter(issue => issue.category === 'accessibility');
	const validationErrors = errors.filter(issue => issue.category === 'validation');
	const accessibilityWarnings = warnings.filter(issue => issue.category === 'accessibility');
	const validationWarnings = warnings.filter(issue => issue.category === 'validation');

	// Determine icon and class
	const icon = hasErrors ? error : caution;
	const className = hasErrors
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

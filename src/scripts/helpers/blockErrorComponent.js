import { createHigherOrderComponent } from '@wordpress/compose';
import { VALIDATION_MODES, DEFAULT_VALIDATION_MODE } from './validationModes'; // Ensure correct path
import { __ } from '@wordpress/i18n';

// Import your specific block check functions
import { checkHeadingLevel } from '../blockChecks/checkHeading';
import { checkImageAlt } from '../blockChecks/checkImage';

const withErrorHandling = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { name, attributes, clientId } = props;

		let validationResult = {
			isValid: true,
			mode: DEFAULT_VALIDATION_MODE,
			message: '',
		};

		// Apply validation using the appropriate check function
		switch (name) {
			case 'core/heading':
				validationResult = checkHeadingLevel({
					name,
					attributes,
					clientId,
				});
				break;
			case 'core/image':
				validationResult = checkImageAlt({
					name,
					attributes,
					clientId,
				});
				break;
			// Add more cases for other blocks as needed
			default:
				validationResult = {
					isValid: true,
					mode: DEFAULT_VALIDATION_MODE,
					message: '',
				};
		}

		// If validation mode is NONE or the block is valid, return the block as is
		if (
			validationResult.mode === VALIDATION_MODES.NONE ||
			validationResult.isValid
		) {
			return <BlockEdit {...props} />;
		}

		// Wrap the block with error/warning messages based on validation mode
		const wrapperClass =
			validationResult.mode === VALIDATION_MODES.ERROR
				? 'a11y-block-error'
				: 'a11y-block-warning';

		// Use the message from the validation result or fall back to a generic message
		const message =
			validationResult.message ||
			(validationResult.mode === VALIDATION_MODES.ERROR
				? __(
						'Accessibility Error: This block does not meet accessibility standards.',
						'block-accessibility-checks'
					)
				: __(
						'Accessibility Warning: This block may have accessibility issues.',
						'block-accessibility-checks'
					));

		return (
			<div className={wrapperClass}>
				<p
					className={
						validationResult.mode === VALIDATION_MODES.ERROR
							? 'a11y-error-msg'
							: 'a11y-warning-msg'
					}
				>
					{message}
				</p>
				<BlockEdit {...props} />
			</div>
		);
	};
}, 'withErrorHandling');

wp.hooks.addFilter(
	'editor.BlockEdit',
	'block-accessibility-checks/with-error-handling',
	withErrorHandling
);

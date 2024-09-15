import { createHigherOrderComponent } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

// Import your specific block check functions
import { checkHeadingLevel } from '../blockChecks/checkHeading';
import { checkTableHeaderRow } from '../blockChecks/checkTable';

const withErrorHandling = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { name, attributes, clientId } = props;

		// Default validation result
		let validationResult = {
			isValid: true,
			mode: 'none', // Default to 'none'
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
			case 'core/table':
				validationResult = checkTableHeaderRow({
					name,
					attributes,
					clientId,
				});
				break;
			// Add more cases for other blocks as needed
			default:
				validationResult = {
					isValid: true,
					mode: 'none', // Default to 'none'
					message: '',
				};
		}

		// If validation mode is 'none' or the block is valid, return the block as is
		if (
			validationResult.mode === 'none' ||
			validationResult.isValid
		) {
			return <BlockEdit {...props} />;
		}

		// Wrap the block with error/warning messages based on validation mode
		const wrapperClass =
			validationResult.mode === 'error'
				? 'a11y-block-error'
				: 'a11y-block-warning';

		// Use the message from the validation result or fall back to a generic message
		const message =
			validationResult.message ||
			(validationResult.mode === 'error'
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
						validationResult.mode === 'error'
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

import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

import { checkHeadingLevel } from '../blockChecks/checkHeading';
import { checkImageAlt } from '../blockChecks/checkImage';
import { checkTableHeaderRow } from '../blockChecks/checkTable';

/**
 * A higher-order component that adds error handling and accessibility checks to a block component.
 *
 * @param {Function} BlockEdit - The block component to wrap with error handling.
 * @return {Function} - The wrapped block component with error handling.
 */
const withErrorHandling = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { name, attributes, clientId } = props;

		let validationResult = {
			isValid: true,
			mode: 'none',
			message: '',
		};

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
			case 'core/table':
				validationResult = checkTableHeaderRow({
					name,
					attributes,
					clientId,
				});
				break;
			default:
				validationResult = {
					isValid: true,
					mode: 'none',
					message: '',
				};
		}

		// If validation mode is 'none' or the block is valid, return the block as is
		if (validationResult.mode === 'none' || validationResult.isValid) {
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

addFilter(
	'editor.BlockEdit',
	'block-accessibility-checks/with-error-handling',
	withErrorHandling
);

import { createHigherOrderComponent } from '@wordpress/compose';
import { VALIDATION_MODES } from './validationModes'; // Assuming you have this in the same file
import { __ } from '@wordpress/i18n';

// Your HOC that wraps the block
const withErrorHandling = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { name, attributes } = props;
		let validationMode = VALIDATION_MODES.NONE; // Default mode

		// Apply validation to the core/heading block
		if (name === 'core/heading' && attributes.level === 1) {
			validationMode = VALIDATION_MODES.ERROR; // Set to WARNING or ERROR as needed
		}

		// If validation mode is NONE, return the block as is
		if (validationMode === VALIDATION_MODES.NONE) {
			return <BlockEdit {...props} />;
		}

		// Wrap the block with error/warning messages based on validation mode
		const wrapperClass =
			validationMode === VALIDATION_MODES.ERROR
				? 'a11y-block-error'
				: 'a11y-block-warning';

		const message =
			validationMode === VALIDATION_MODES.ERROR
				? __(
						'Accessibility Error: This heading level is not allowed.',
						'block-accessibility-checks'
					)
				: __(
						'Warning: This heading level is discouraged.',
						'block-accessibility-checks'
					);

		return (
			<div className={wrapperClass}>
				<p
					className={
						validationMode === VALIDATION_MODES.ERROR
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

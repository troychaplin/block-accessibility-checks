import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, PanelRow } from '@wordpress/components';

import { checkButtonAttributes } from '../blockChecks/checkButton';
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
			case 'core/button':
				validationResult = checkButtonAttributes({
					name,
					attributes,
					clientId,
				});
				break;
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

		// Determine the message based on the validation result
		let message = '';
		if (validationResult.message) {
			message = validationResult.message;
		} else if (validationResult.mode === 'error') {
			message = __(
				'Accessibility Error: This block does not meet accessibility standards.',
				'block-accessibility-checks'
			);
		} else if (validationResult.mode === 'warning') {
			message = __(
				'Accessibility Warning: This block may have accessibility issues.',
				'block-accessibility-checks'
			);
		}

		return (
			<>
				{validationResult.mode !== 'none' && (
					<div
						className={
							validationResult.mode === 'error'
								? 'a11y-block-error'
								: 'a11y-block-warning'
						}
					>
						<BlockEdit {...props} />
					</div>
				)}
				{validationResult.mode === 'none' && <BlockEdit {...props} />}
				{validationResult.mode !== 'none' && (
					<InspectorControls>
						<PanelBody
							title={__(
								'Accessibility Check',
								'block-accessibility-checks'
							)}
							initialOpen={true}
						>
							<PanelRow>
								<p
									className={
										validationResult.mode === 'error'
											? 'a11y-error-msg'
											: 'a11y-warning-msg'
									}
								>
									{message}
								</p>
							</PanelRow>
						</PanelBody>
					</InspectorControls>
				)}
			</>
		);
	};
}, 'withErrorHandling');

addFilter(
	'editor.BlockEdit',
	'block-accessibility-checks/with-error-handling',
	withErrorHandling
);

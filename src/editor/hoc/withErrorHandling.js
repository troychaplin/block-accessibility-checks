/**
 * WordPress dependencies
 */
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { validateBlock } from '../validation/blocks';
import { BlockIndicator as Indicator } from '../components/BlockIndicator';

/**
 * Higher-order component that adds validation indicators to blocks.
 *
 * Wraps the block editor component to display validation errors and warnings
 * based on registered block validation rules. Invalid blocks are wrapped in
 * a container with visual indicators showing the validation issues.
 */
const withErrorHandling = createHigherOrderComponent(BlockEdit => {
	return props => {
		const { clientId, attributes } = props;

		// Get the block data from the store
		// The block object is needed for validation, including name, innerBlocks, etc.
		const block = useSelect(
			select => {
				return select('core/block-editor').getBlock(clientId);
			},
			[clientId] // Dependencies: only clientId needed as attributes from props trigger re-render
		);

		// Store validation state for this block instance
		const [validationResult, setValidationResult] = useState({
			isValid: true,
			issues: [],
			mode: 'none',
		});

		// Run validation whenever the block or its attributes change
		useEffect(() => {
			if (block) {
				// Use attributes from props for immediate validation responsiveness
				// Props attributes update before the store, ensuring real-time feedback
				const blockToValidate = {
					...block,
					attributes: attributes || block.attributes,
				};
				const result = validateBlock(blockToValidate);
				setValidationResult(result);
			}
		}, [block, attributes]);

		// Render block normally without wrapper if validation passes
		if (validationResult.isValid) {
			return <BlockEdit {...props} />;
		}

		// Build wrapper classes based on validation severity
		let wrapperClass = 'ba11y-block-wrapper';
		if (validationResult.mode === 'error') {
			wrapperClass += ' ba11y-block-error';
		} else if (validationResult.mode === 'warning') {
			wrapperClass += ' ba11y-block-warning';
		}

		// Wrap invalid blocks with validation indicator
		return (
			<div className={wrapperClass}>
				<BlockEdit {...props} />
				<Indicator mode={validationResult.mode} issues={validationResult.issues} />
			</div>
		);
	};
}, 'withErrorHandling');

/**
 * Register the HOC with WordPress block editor
 *
 * This filter intercepts all block editor components and wraps them
 * with our validation and error handling functionality.
 */
wp.hooks.addFilter(
	'editor.BlockEdit',
	'block-accessibility-checks/with-error-handling',
	withErrorHandling
);

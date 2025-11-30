/**
 * WordPress dependencies
 */
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { validateBlock } from '../validation';
import { BlockIndicator as Indicator } from './Indicator';

/**
 * Higher-order component that adds validation indicators to blocks
 */
const withErrorHandling = createHigherOrderComponent(BlockEdit => {
	return props => {
		const { clientId, attributes } = props;

		// Subscribe to block changes to trigger validation
		// We need to watch attributes for validation, but use select for block data
		const block = useSelect(
			select => {
				return select('core/block-editor').getBlock(clientId);
			},
			[clientId] // Only clientId is needed here, attributes change will trigger re-render anyway
		);

		const [validationResult, setValidationResult] = useState({
			isValid: true,
			issues: [],
			mode: 'none',
		});

		useEffect(() => {
			if (block) {
				// If block attributes from props are different from what we got from select,
				// we might want to use the props ones for immediate validation responsiveness
				// creating a synthetic block object if needed
				const blockToValidate = {
					...block,
					attributes: attributes || block.attributes,
				};
				const result = validateBlock(blockToValidate);
				setValidationResult(result);
			}
		}, [block, attributes]);

		// If block is valid, just render it normally
		if (validationResult.isValid) {
			return <BlockEdit {...props} />;
		}

		// Determine wrapper classes
		let wrapperClass = 'ba11y-block-wrapper';
		if (validationResult.mode === 'error') {
			wrapperClass += ' ba11y-block-error';
		} else if (validationResult.mode === 'warning') {
			wrapperClass += ' ba11y-block-warning';
		}

		return (
			<div className={wrapperClass}>
				<BlockEdit {...props} />
				<Indicator mode={validationResult.mode} issues={validationResult.issues} />
			</div>
		);
	};
}, 'withErrorHandling');

// Register the HOC
wp.hooks.addFilter(
	'editor.BlockEdit',
	'block-accessibility-checks/with-error-handling',
	withErrorHandling
);

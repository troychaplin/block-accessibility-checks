/**
 * WordPress dependencies
 */
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateBlock } from '../validation/blocks';
import { BlockIndicator as Indicator } from '../components/BlockIndicator';
import { useDebouncedValidation } from '../../shared/hooks';

/**
 * Higher-order component that adds validation indicators to blocks.
 *
 * Wraps the block editor component to display validation errors and warnings
 * based on registered block validation rules. Uses debounced validation to
 * prevent focus loss during typing. Always renders the same DOM structure
 * to avoid React unmount/remount cycles.
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

		// Debounced validation prevents rapid re-renders during typing.
		// Runs immediately on mount, then debounces subsequent changes.
		const validationResult = useDebouncedValidation(
			() => {
				if (!block) {
					return { isValid: true, issues: [], mode: 'none' };
				}
				// Use attributes from props for validation responsiveness.
				// Props attributes update before the store.
				const blockToValidate = {
					...block,
					attributes: attributes || block.attributes,
				};
				return validateBlock(blockToValidate);
			},
			[block, attributes],
			{ delay: 300 }
		);

		// Always render the same DOM structure to prevent focus loss.
		// Toggling between <BlockEdit /> and <div><BlockEdit /></div> causes
		// React to unmount and remount BlockEdit, stealing keyboard focus.
		let wrapperClass = 'ba11y-block-wrapper';
		if (!validationResult.isValid) {
			if (validationResult.mode === 'error') {
				wrapperClass += ' ba11y-block-error';
			} else if (validationResult.mode === 'warning') {
				wrapperClass += ' ba11y-block-warning';
			}
		}

		return (
			<div className={wrapperClass}>
				<BlockEdit {...props} />
				{!validationResult.isValid && (
					<Indicator mode={validationResult.mode} issues={validationResult.issues} />
				)}
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

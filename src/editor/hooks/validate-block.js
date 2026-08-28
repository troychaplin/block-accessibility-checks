/**
 * Side-effect module. Adds the `editor.BlockEdit` filter that runs per-block
 * validation, syncs the result to the data store, and renders a toolbar button
 * (via BlockControls) when issues exist.
 */

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { BlockControls } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { STORE_NAME } from '../store/constants';
import { validateBlock } from '../utils/validate-block';
import { useDebouncedValidation } from '../utils/use-debounced-validation';
import { ValidationToolbarButton } from '../components/validation-toolbar-button';

const withErrorHandling = createHigherOrderComponent(BlockEdit => {
	return props => {
		const { clientId, attributes } = props;

		const block = useSelect(
			select => {
				return select('core/block-editor').getBlock(clientId);
			},
			[clientId]
		);

		// Heading order depends on the whole document, so editing one block can
		// change another block's verdict. This signature changes whenever the
		// outline does, which brings every block back through validation.
		const headingSignature = useSelect(select => select(STORE_NAME).getHeadingSignature(), []);

		const { setBlockValidation, clearBlockValidation } = useDispatch(STORE_NAME);

		const validationResult = useDebouncedValidation(
			() => {
				if (!block) {
					return { isValid: true, issues: [], mode: 'none' };
				}
				const blockToValidate = {
					...block,
					attributes: attributes || block.attributes,
				};
				return validateBlock(blockToValidate);
			},
			[block, attributes, headingSignature],
			{ delay: 300 }
		);

		useEffect(() => {
			setBlockValidation(clientId, validationResult);
			return () => clearBlockValidation(clientId);
		}, [clientId, validationResult, setBlockValidation, clearBlockValidation]);

		return (
			<>
				<BlockEdit {...props} />
				{!validationResult.isValid && (
					<BlockControls group="block">
						<ValidationToolbarButton issues={validationResult.issues} />
					</BlockControls>
				)}
			</>
		);
	};
}, 'withErrorHandling');

addFilter('editor.BlockEdit', 'block-accessibility-checks/with-error-handling', withErrorHandling);

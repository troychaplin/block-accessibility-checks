/**
 * Side-effect module. Adds the `editor.BlockListBlock` filter that injects
 * CSS classes onto each block's wrapper based on its validation state.
 */

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_NAME } from '../store/constants';

/**
 * Adds validation CSS classes to the block's own wrapper element.
 *
 * @param {Function} BlockListBlock The original BlockListBlock component.
 * @return {Function} Wrapped component with validation classes.
 */
function withBlockValidationClasses(BlockListBlock) {
	return props => {
		const validation = useSelect(
			select => select(STORE_NAME).getBlockValidation(props.clientId),
			[props.clientId]
		);

		if (validation.mode === 'none') {
			return <BlockListBlock {...props} />;
		}

		const validationClass =
			validation.mode === 'error' ? 'ba11yc-block-error' : 'ba11yc-block-warning';

		const existingWrapperProps = props.wrapperProps || {};
		const newWrapperProps = {
			...existingWrapperProps,
			className: [existingWrapperProps.className, validationClass].filter(Boolean).join(' '),
		};

		return <BlockListBlock {...props} wrapperProps={newWrapperProps} />;
	};
}

addFilter(
	'editor.BlockListBlock',
	'block-accessibility-checks/with-block-validation-classes',
	withBlockValidationClasses
);

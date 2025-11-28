import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data'; // Import useSelect
import { addFilter, addAction } from '@wordpress/hooks';
import { useRef, useEffect, useState } from '@wordpress/element';
import { validateBlock } from './validateBlocks';
import { BlockIndicator } from '../components/BlockIndicator';

/**
 * A higher-order component that adds error handling and accessibility checks to a block component.
 *
 * @param {Function} BlockEdit - The block component to wrap with error handling.
 * @return {Function} - The wrapped block component with error handling.
 */
const withErrorHandling = createHigherOrderComponent(BlockEdit => {
	return props => {
		const { name, attributes, clientId } = props;

		// Subscribe to innerBlocks changes so validation runs when children are added/removed
		const innerBlocks = useSelect(
			select => select('core/block-editor').getBlock(clientId)?.innerBlocks,
			[clientId]
		);

		const [validationResult, setValidationResult] = useState({
			isValid: true,
			mode: 'none',
			issues: [],
		});
		const timeoutRef = useRef(null);
		const prevAltRef = useRef(attributes.alt);
		const prevHeadingLevelRef = useRef(attributes.level);

		// Listen for global heading structure changes
		useEffect(() => {
			if (name === 'core/heading') {
				const handleHeadingStructureChange = () => {
					// Re-validate this heading block when the document structure changes
					const result = validateBlock({ name, attributes, clientId });
					setValidationResult(
						result.isValid ? { isValid: true, mode: 'none', issues: [] } : result
					);
				};

				// Subscribe to heading structure changes
				addAction(
					'ba11yc.headingStructureChanged',
					`ba11yc/heading-validation-${clientId}`,
					handleHeadingStructureChange
				);

				// Cleanup function
				return () => {
					wp.hooks.removeAction(
						'ba11yc.headingStructureChanged',
						`ba11yc/heading-validation-${clientId}`
					);
				};
			}
		}, [name, attributes, clientId]);

		useEffect(() => {
			// Clear any existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// For image blocks with alt text changes, add a delay
			if (name === 'core/image' && prevAltRef.current !== attributes.alt) {
				timeoutRef.current = setTimeout(() => {
					// Use unified validation system
					const result = validateBlock({ name, attributes, clientId });
					setValidationResult(
						result.isValid ? { isValid: true, mode: 'none', message: '' } : result
					);
				}, 1500);

				prevAltRef.current = attributes.alt;
			} else if (
				name === 'core/heading' &&
				prevHeadingLevelRef.current !== attributes.level
			) {
				// For heading blocks with level changes, add a small delay
				timeoutRef.current = setTimeout(() => {
					// Use unified validation system
					const result = validateBlock({ name, attributes, clientId });
					setValidationResult(
						result.isValid ? { isValid: true, mode: 'none', issues: [] } : result
					);
				}, 200); // Short delay for headings

				prevHeadingLevelRef.current = attributes.level;
			} else {
				// Immediate validation for other cases using unified system
				// Pass innerBlocks to validateBlock if it accepts it, or rely on the clientId lookup we added in validation.js
				const result = validateBlock({ name, attributes, clientId });
				setValidationResult(
					result.isValid ? { isValid: true, mode: 'none', issues: [] } : result
				);
			}

			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
			};
		}, [name, attributes, clientId, innerBlocks]); // Add innerBlocks to dependency array

		// Generate messages for all issues
		const issues = validationResult.issues || [];

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
						<div className="a11y-block-content-wrapper">
							<BlockIndicator issues={issues} clientId={clientId} />
							<BlockEdit {...props} />
						</div>
					</div>
				)}
				{validationResult.mode === 'none' && <BlockEdit {...props} />}
			</>
		);
	};
}, 'withErrorHandling');

addFilter('editor.BlockEdit', 'block-accessibility-checks/with-error-handling', withErrorHandling);

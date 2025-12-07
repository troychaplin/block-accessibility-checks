/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { ToggleControl, PanelBody } from '@wordpress/components';

/**
 * Extends the core image block with a custom isDecorative attribute.
 *
 * This attribute allows users to explicitly mark images as decorative,
 * which helps with accessibility validation by indicating that an empty
 * alt text is intentional rather than an oversight.
 *
 * @param {Object} settings - The block type settings object containing name and attributes.
 * @return {Object} The modified settings object with the new attribute.
 */
const addImageAttribute = settings => {
	// Only modify the core image block
	if (settings.name !== 'core/image') {
		return settings;
	}

	// Add the isDecorative boolean attribute to track decorative image status
	settings.attributes = Object.assign(settings.attributes, {
		isDecorative: {
			type: 'boolean',
			default: false,
		},
	});

	return settings;
};

/**
 * Register the attribute modification with WordPress
 *
 * This filter runs when block types are registered, allowing us to
 * extend the core image block with our custom attribute.
 */
addFilter(
	'blocks.registerBlockType',
	'block-accessibility-checks/add-image-attribute',
	addImageAttribute
);

/**
 * Higher-order component that adds accessibility settings to the image block editor.
 *
 * Injects an "Accessibility Settings" panel into the image block's inspector
 * controls (sidebar), providing a toggle for users to mark images as decorative.
 * This UI control allows users to explicitly indicate when an image is purely
 * decorative and doesn't require descriptive alt text.
 *
 * @param {Function} BlockEdit - The original block editor component.
 * @return {Function} The wrapped component with added inspector controls.
 */
const addImageInspectorControls = createHigherOrderComponent(BlockEdit => {
	return props => {
		// Only add controls to the core image block
		if (props.name !== 'core/image') {
			return <BlockEdit {...props} />;
		}

		const { attributes, setAttributes } = props;
		const { isDecorative } = attributes;

		return (
			<>
				{/* Add accessibility panel to block inspector sidebar */}
				<InspectorControls>
					<PanelBody
						title={__('Accessibility Settings', 'block-accessibility-checks')}
						initialOpen={true}
					>
						<ToggleControl
							label={__(
								'Please confirm this image is decorative',
								'block-accessibility-checks'
							)}
							checked={isDecorative}
							onChange={value => setAttributes({ isDecorative: value })}
						/>
					</PanelBody>
				</InspectorControls>
				{/* Render the original block editor */}
				<BlockEdit {...props} />
			</>
		);
	};
}, 'addImageInspectorControls');

/**
 * Register the HOC with WordPress block editor
 *
 * This filter intercepts the image block editor component and wraps it
 * with our custom inspector controls for accessibility settings.
 */
addFilter(
	'editor.BlockEdit',
	'block-accessibility-checks/add-inspector-control',
	addImageInspectorControls
);

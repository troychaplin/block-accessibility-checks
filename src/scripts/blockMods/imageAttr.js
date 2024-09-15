import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { ToggleControl, PanelBody } from '@wordpress/components';

/**
 * Adds an image attribute to the settings object.
 *
 * @param {Object} settings - The settings object.
 * @return {Object} - The modified settings object.
 */
const addImageAttribute = (settings) => {
	if (settings.name !== 'core/image') {
		return settings;
	}

	settings.attributes = Object.assign(settings.attributes, {
		isDecorative: {
			type: 'boolean',
			default: false,
		},
	});

	return settings;
};

addFilter(
	'blocks.registerBlockType',
	'block-accessibility-checks/add-image-attribute',
	addImageAttribute
);

/**
 * Higher-order component that adds accessibility settings to the image block editor.
 *
 * @param {Function} BlockEdit - The original block editor component.
 * @return {Function} - The modified block editor component.
 */
const addImageInspectorControls = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		if (props.name !== 'core/image') {
			return <BlockEdit {...props} />;
		}

		const { attributes, setAttributes } = props;
		const { isDecorative } = attributes;

		return (
			<>
				<InspectorControls>
					<PanelBody
						title={__(
							'Accessibility Settings',
							'block-accessibility-checks'
						)}
						initialOpen={true}
					>
						<ToggleControl
							label={__(
								'Please confirm this image is decorative',
								'block-accessibility-checks'
							)}
							checked={isDecorative}
							onChange={(value) =>
								setAttributes({ isDecorative: value })
							}
						/>
					</PanelBody>
				</InspectorControls>
				<BlockEdit {...props} />
			</>
		);
	};
}, 'addImageInspectorControls');

addFilter(
	'editor.BlockEdit',
	'block-accessibility-checks/add-inspector-control',
	addImageInspectorControls
);

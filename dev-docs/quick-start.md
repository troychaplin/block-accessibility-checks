# Quick Start Guide

This guide will help you get up and running with Block Accessibility Checks in minutes. You'll learn how to register basic accessibility checks and implement validation logic.

## Prerequisites

- WordPress 5.0+ with Gutenberg block editor
- Block Accessibility Checks plugin installed and activated
- Basic knowledge of WordPress plugin development
- Familiarity with JavaScript and PHP

## Basic Setup

### 1. Register Your Checks (PHP)

First, register your accessibility checks using the `ba11yc_register_checks` action hook:

```php
<?php
/**
 * Register accessibility checks for your custom block
 */
add_action( 'ba11yc_register_checks', 'my_plugin_register_checks' );

function my_plugin_register_checks( $registry ) {
	// Register a check for your block
	$registry->register_check(
		'my-plugin/custom-block',  // Your block type
		'required_field',          // Check name
		array(
			'error_msg'   => __( 'This field is required for accessibility.', 'my-plugin' ),
			'warning_msg' => __( 'This field is recommended for better accessibility.', 'my-plugin' ),
			'description' => __( 'Ensures required content is present.', 'my-plugin' ),
			'type'        => 'settings', // Uses admin settings
			'priority'    => 10,
		)
	);
}
```

### 2. Implement Validation Logic (JavaScript)

Next, implement the validation logic using the `ba11yc.validateBlock` filter:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
	'ba11yc.validateBlock',
	'my-plugin/validation',
	(isValid, blockType, attributes, checkName, rule) => {
		// Only handle your block type
		if (blockType !== 'my-plugin/custom-block') {
			return isValid;
		}

		// Implement validation logic
		switch (checkName) {
			case 'required_field':
				// Return true if valid, false if invalid
				return !!(attributes.content && attributes.content.trim());

			default:
				return isValid;
		}
	}
);
```

### 3. Enqueue Your Script

Make sure your JavaScript runs in the block editor:

```php
function my_plugin_enqueue_editor_assets() {
	wp_enqueue_script(
		'my-plugin-accessibility',
		plugins_url( 'build/accessibility-checks.js', __FILE__ ),
		array( 'wp-hooks', 'block-accessibility-checks-script' ),
		'1.0.0',
		true
	);
}
add_action( 'enqueue_block_editor_assets', 'my_plugin_enqueue_editor_assets' );
```

## Common Patterns

### Multiple Checks for One Block

```php
function my_plugin_register_checks( $registry ) {
	// Content validation
	$registry->register_check( 'my-plugin/card-block', 'content_required', [
		'error_msg'   => __( 'Card content is required.', 'my-plugin' ),
		'description' => __( 'Empty cards provide no value to users.', 'my-plugin' ),
		'type'        => 'error', // Always an error
	] );

	// Link validation
	$registry->register_check( 'my-plugin/card-block', 'link_required', [
		'error_msg'   => __( 'Card link is required.', 'my-plugin' ),
		'warning_msg' => __( 'Card link is recommended.', 'my-plugin' ),
		'description' => __( 'Links improve card functionality.', 'my-plugin' ),
		'type'        => 'settings', // Configurable in admin
	] );
}
```

```javascript
addFilter(
	'ba11yc.validateBlock',
	'my-plugin/validation',
	(isValid, blockType, attributes, checkName, rule) => {
		if (blockType !== 'my-plugin/card-block') {
			return isValid;
		}

		switch (checkName) {
			case 'content_required':
				return !!(attributes.content && attributes.content.trim());
			
			case 'link_required':
				return !!(attributes.link && attributes.link.trim());
			
			default:
				return isValid;
		}
	}
);
```

### Check Types

- **`'settings'`** (default): Uses admin settings page to determine level
- **`'error'`**: Forces as error, blocks publishing, shows red styling
- **`'warning'`**: Forces as warning, allows publishing, shows yellow styling
- **`'none'`**: Forces check to be disabled

### Validation Function Patterns

```javascript
// Simple attribute validation
function validateRequiredField(attributes) {
	return !!(attributes.requiredField && attributes.requiredField.trim());
}

// Content-based validation
function validateContentLength(attributes) {
	const content = attributes.content || '';
	return content.length <= 500;
}

// Complex validation
function validateImageAlt(attributes) {
	// Skip if image is decorative
	if (attributes.isDecorative) {
		return true;
	}

	// Check if alt text exists and is meaningful
	const alt = attributes.alt || '';
	if (!alt.trim()) {
		return false;
	}

	// Avoid filename-like alt text
	const filenamePatterns = ['.jpg', '.png', '.gif', 'img_', 'image'];
	return !filenamePatterns.some(pattern => alt.toLowerCase().includes(pattern));
}
```

## What Happens Next?

Once your checks are registered and validation logic is implemented:

1. **Settings Integration**: Your checks appear in the Block Accessibility Checks admin settings
2. **Real-time Feedback**: Validation runs as users edit blocks in the editor
3. **Visual Indicators**: Invalid blocks show colored borders (red for errors, yellow for warnings)
4. **Inspector Panel**: All issues are listed in the block inspector sidebar
5. **Publishing Control**: Errors prevent publishing, warnings allow publishing with notifications

## Next Steps

- **Complete Examples**: See [Integration Examples](integration-examples.md) for full working plugins
- **API Reference**: Check [API Reference](api-reference.md) for all available methods and hooks
- **Advanced Patterns**: Learn about performance optimization and advanced validation in [JavaScript Validation Guide](javascript-validation.md)
- **Troubleshooting**: If you run into issues, see [Troubleshooting Guide](troubleshooting.md)

## Working Example

For a complete working example, see the [Block Check Integration Example](https://github.com/troychaplin/block-check-integration-example) plugin, which demonstrates:

- Complete PHP and JavaScript integration
- Multiple validation checks with different severity levels
- Real-time visual feedback
- Settings page integration
- Proper asset management 
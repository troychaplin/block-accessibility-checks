# Block Accessibility Checks - Developer API

The Block Accessibility Checks plugin provides a comprehensive API for developers to extend and customize accessibility checking functionality. **All validation logic is now handled in JavaScript** for real-time feedback in the block editor. This document outlines the available hooks, filters, methods, and integration patterns for extending the plugin.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Action Hooks](#action-hooks)
3. [Filter Hooks](#filter-hooks)
4. [Registry API Methods](#registry-api-methods)
5. [JavaScript Validation Integration](#javascript-validation-integration)
6. [Accessing the Registry](#accessing-the-registry)
7. [PHP-JavaScript Integration](#php-javascript-integration)
8. [Complete Integration Example](#complete-integration-example)
9. [Advanced Patterns](#advanced-patterns)
10. [Troubleshooting](#troubleshooting)

## Quick Start

The easiest way to add custom accessibility checks is to register them in PHP (for settings integration) and implement validation logic in JavaScript:

### PHP Registration (for settings and metadata)

```php
add_action( 'ba11yc_register_checks', 'my_plugin_register_checks' );

function my_plugin_register_checks( $registry ) {
	$registry->register_check(
		'my-plugin/custom-block',
		'content_length',
		array(
			'error_msg'   => __( 'Content is too long for optimal readability', 'my-plugin' ),
			'warning_msg' => __( 'Content is long but still allowed (warning)', 'my-plugin' ), // Optional, falls back to error_msg
			'description' => __( 'Long content can be difficult to read', 'my-plugin' ),
			'type'        => 'warning', // 'error', 'warning', 'settings', or 'none'
			'priority'    => 10,
		)
	);
}
```

### JavaScript Validation Implementation

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
	'ba11yc.validateBlock',
	'my-plugin/validation',
	(isValid, blockType, attributes, checkName, rule) => {
		// Only handle our block type
		if (blockType !== 'my-plugin/custom-block') {
			return isValid;
		}

		// Implement validation logic
		switch (checkName) {
			case 'content_length':
				const content = attributes.content || '';
				return content.length <= 500; // Return true if valid

			default:
				return isValid;
		}
	}
);
```

> **Note:** For a complete working example including both PHP and JavaScript integration, see the [Complete Integration Example](#complete-integration-example) section.

## Action Hooks

### `ba11yc_plugin_initialized`

Fired when the plugin is fully initialized.

**Parameters:**

- `$plugin_initializer` (PluginInitializer) - The plugin initializer instance

### `ba11yc_ready`

Fired when the plugin is ready for developer interaction.

**Parameters:**

- `$registry` (BlockChecksRegistry) - The checks registry instance
- `$plugin_initializer` (PluginInitializer) - The plugin initializer instance

### `ba11yc_register_checks`

Fired during check registration phase. Use this to register custom checks.

**Parameters:**

- `$registry` (BlockChecksRegistry) - The checks registry instance

### `ba11yc_check_registered`

Fired when a check is successfully registered.

**Parameters:**

- `$block_type` (string) - The block type
- `$check_name` (string) - The check name
- `$check_args` (array) - The check configuration

### `ba11yc_check_unregistered`

Fired when a check is unregistered.

**Parameters:**

- `$block_type` (string) - The block type
- `$check_name` (string) - The check name

### `ba11yc_check_toggled`

Fired when a check is enabled or disabled.

**Parameters:**

- `$block_type` (string) - The block type
- `$check_name` (string) - The check name
- `$enabled` (bool) - Whether the check is now enabled

## Filter Hooks

### `ba11yc_register_default_checks`

Controls whether default checks should be registered.

**Parameters:**

- `$register` (bool) - Whether to register default checks (default: true)

**Returns:** (bool) Whether to register default checks

### `ba11yc_should_register_check`

Controls whether a specific check should be registered.

**Parameters:**

- `$should_register` (bool) - Whether to register the check (default: true)
- `$block_type` (string) - The block type
- `$check_name` (string) - The check name
- `$check_args` (array) - The check configuration

**Returns:** (bool) Whether to register the check

### `ba11yc_check_args`

Filters check arguments before registration.

**Parameters:**

- `$check_args` (array) - The check configuration
- `$block_type` (string) - The block type
- `$check_name` (string) - The check name

**Returns:** (array) Modified check configuration

### `ba11yc_block_checks`

Filters which checks run for a specific block.

**Parameters:**

- `$checks` (array) - Array of checks for the block type
- `$block_type` (string) - The block type
- `$attributes` (array) - Block attributes
- `$content` (string) - Block content

**Returns:** (array) Modified checks array

### `ba11yc_block_attributes`

Filters block attributes before checks run.

**Parameters:**

- `$attributes` (array) - Block attributes
- `$block_type` (string) - The block type
- `$content` (string) - Block content

**Returns:** (array) Modified attributes

### `ba11yc_before_check`

Filters check configuration before it runs.

**Parameters:**

- `$check_config` (array) - The check configuration
- `$check_name` (string) - The check name
- `$block_type` (string) - The block type
- `$attributes` (array) - Block attributes
- `$content` (string) - Block content

**Returns:** (array) Modified check configuration

### `ba11yc_check_result`

Filters the result of a single check.

**Parameters:**

- `$check_result` (mixed) - The check result
- `$check_name` (string) - The check name
- `$block_type` (string) - The block type
- `$attributes` (array) - Block attributes
- `$content` (string) - Block content
- `$check_config` (array) - The check configuration

**Returns:** (mixed) Modified check result

### `ba11yc_final_check_result`

Filters the final result object for a check.

**Parameters:**

- `$result` (array) - The result object
- `$check_name` (string) - The check name
- `$block_type` (string) - The block type
- `$attributes` (array) - Block attributes
- `$content` (string) - Block content
- `$check_config` (array) - The check configuration

**Returns:** (array) Modified result object

### `ba11yc_block_check_results`

Filters all results for a block.

**Parameters:**

- `$results` (array) - Array of all check results for the block
- `$block_type` (string) - The block type
- `$attributes` (array) - Block attributes
- `$content` (string) - Block content

**Returns:** (array) Modified results array

## Registry API Methods

### `register_check( $block_type, $check_name, $check_args )`

Register a new accessibility check.

**Parameters:**

- `$block_type` (string) - Block type (e.g., 'core/image', 'create-block/my-custom-block')
- `$check_name` (string) - Unique check name (within the block type)
- `$check_args` (array) - Check configuration

**Returns:** (bool) True on success, false on failure


**Check Configuration:**

```php
$check_args = array(
	'error_msg'   => 'Error message shown in the block editor when check fails', // Required
	'warning_msg' => 'Warning message shown in the block editor (optional, falls back to error_msg)', // Optional
	'description' => 'Explanation shown in the settings/admin UI', // Optional
	'type'        => 'settings',           // Optional: Check behavior type (default: 'settings')
	'priority'    => 10,                   // Optional: Execution priority (lower = earlier, default: 10)
	'enabled'     => true,                 // Optional: Whether check is enabled (default: true)
);
```

**Field Usage:**

* `error_msg`: Displayed in the block editor when a check fails as an error.
* `warning_msg`: Displayed in the block editor when a check fails as a warning (falls back to `error_msg` if not set).
* `description`: Displayed in the settings/admin UI to explain the check.
**Fallback Logic:**

If `warning_msg` is not specified, the plugin will automatically use `error_msg` for warnings.
Legacy `message` is supported as a fallback for `error_msg` for backward compatibility.

**Check Types:**

- `'settings'` - Uses admin settings page to determine level (default behavior)
- `'error'` - Forces as error, blocks publishing, shows red error styling
- `'warning'` - Forces as warning, allows publishing, shows yellow warning styling
- `'none'` - Forces check to be disabled, never runs

**Settings Integration:**

When using `'type' => 'settings'` (the default), your external blocks will automatically:

1. **Appear in Block A11Y Checks menu** - A submenu page is created using your plugin name
2. **Have configurable check levels** - Site admins can set each check to Error, Warning, or None
3. **Use admin preferences** - The effective check level respects user settings

For external plugins, the submenu is named after your block's namespace. For example:

- Block type `create-block/my-testimonial-block` creates "Create Block Checks" submenu
- Block type `my-plugin/hero-block` creates "My Plugin Checks" submenu

**Forcing Check Levels:**

To bypass settings and force a specific level, use any type other than `'settings'`:

```php
// This check will always be a warning, regardless of settings
$registry->register_check('my-plugin/block', 'forced_warning', [
	'message'    => 'This is always a warning',
	'description'=> 'Warns if something is not right.',
	'type'       => 'warning'  // Bypasses settings
]);

// This check appears in settings and can be configured
$registry->register_check('my-plugin/block', 'configurable', [
	'message'    => 'This can be configured in settings',
	'description'=> 'Explains what this check does.',
	'type'       => 'settings' // Uses admin settings (default)
]);
```

### `unregister_check( $block_type, $check_name )`

Unregister an accessibility check.

**Parameters:**

- `$block_type` (string) - Block type
- `$check_name` (string) - Check name

**Returns:** (bool) True on success, false if check wasn't registered

### `set_check_enabled( $block_type, $check_name, $enabled )`

Enable or disable a specific check.

**Parameters:**

- `$block_type` (string) - Block type
- `$check_name` (string) - Check name
- `$enabled` (bool) - Whether to enable the check

**Returns:** (bool) True on success, false if check doesn't exist

### `is_check_registered( $block_type, $check_name )`

Check if a specific check is registered.

**Parameters:**

- `$block_type` (string) - Block type
- `$check_name` (string) - Check name

**Returns:** (bool) True if registered, false otherwise

### `get_check_config( $block_type, $check_name )`

Get configuration for a specific check.

**Parameters:**

- `$block_type` (string) - Block type
- `$check_name` (string) - Check name

**Returns:** (array|null) Check configuration array or null if not found

### `get_checks( $block_type )`

Get all checks for a block type.

**Parameters:**

- `$block_type` (string) - Block type

**Returns:** (array) Array of checks for the block type

### `get_all_checks()`

Get all registered checks.

**Returns:** (array) Complete checks registry organized by block type

### `get_registered_block_types()`

Get all block types that have checks registered.

**Returns:** (array) Array of block type names

### `run_checks( $block_type, $attributes, $content )` _(Deprecated)_

**Note: This method is deprecated.** PHP validation has been removed in favor of JavaScript-only validation. This method now returns empty results.

Run all checks for a block and return results.

**Parameters:**

- `$block_type` (string) - Block type
- `$attributes` (array) - Block attributes
- `$content` (string) - Block content/innerHTML

**Returns:** (array) Empty array - all validation now handled in JavaScript

## JavaScript Validation Integration

All validation logic is now implemented in JavaScript for real-time feedback in the block editor. Use the `ba11yc.validateBlock` filter hook to implement your validation logic.

### JavaScript Validation Signature

Your validation function should follow this pattern:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
	'ba11yc.validateBlock',
	'my-plugin/validation',
	(isValid, blockType, attributes, checkName, rule) => {
		// Only handle your block types
		if (blockType !== 'my-plugin/my-block') {
			return isValid; // Pass through for other blocks
		}

		// Implement validation logic for your checks
		switch (checkName) {
			case 'my_check_name':
				// Return true if valid, false if invalid
				return validateMyCheck(attributes);

			default:
				return isValid; // Unknown check, pass through
		}
	}
);
```

**Parameters:**

- `isValid` (boolean) - Current validation state (default: true)
- `blockType` (string) - Block type (e.g., 'core/image', 'my-plugin/custom-block')
- `attributes` (object) - Block attributes from the block editor
- `checkName` (string) - Name of the specific check being run
- `rule` (object) - Check configuration (includes 'message', 'type', 'enabled', etc.)

**Return Values:**

- `true` - Check passed (block is valid)
- `false` - Check failed (accessibility issue found)

**Example Validation Functions:**

```javascript
// Simple attribute validation
function validateMyCheck(attributes) {
	return !!(attributes.requiredField && attributes.requiredField.trim());
}

// Content-based validation
function validateImageAlt(attributes) {
	// Check if image is decorative
	if (attributes.isDecorative) {
		return true; // Valid - decorative images don't need alt text
	}

	// Check if alt text exists
	if (!attributes.alt || !attributes.alt.trim()) {
		return false; // Invalid - missing alt text
	}

	// Check if alt text is meaningful (not just filename)
	const alt = attributes.alt.toLowerCase();
	const filenamePatterns = ['.jpg', '.png', '.gif', '.webp', 'img_', 'image'];

	for (const pattern of filenamePatterns) {
		if (alt.includes(pattern)) {
			return false; // Invalid - looks like filename
		}
	}

	return true; // Valid
}

// Advanced check with custom result
function check_heading_hierarchy( $attributes, $content, $config ) {
	$level = $attributes['level'] ?? 2;

	// Custom logic here...
	$is_valid = validate_heading_hierarchy( $level );

	if ( $is_valid ) {
		return false;
	}

	// Return custom result with additional context
	return array(
		'is_valid' => false,
		'message'  => sprintf( 'Heading level H%d may skip hierarchy levels', $level ),
		'data'     => array( 'current_level' => $level )
	);
}
```

## Accessing the Registry

You can access the registry through multiple methods depending on your needs:

### Via Action Hooks (Recommended)

```php
// Most common: Register checks when the system is ready
add_action( 'ba11yc_register_checks', 'my_plugin_register_checks' );

function my_plugin_register_checks( $registry ) {
	$registry->register_check( 'core/image', 'my_custom_check', [...] );
}

// Alternative: Access registry when plugin is fully ready
add_action( 'ba11yc_ready', 'my_plugin_init' );

function my_plugin_init( $registry, $plugin_initializer ) {
	// Direct registry access
	$registry->register_check( 'core/paragraph', 'custom_check', [...] );

	// Or through the initializer convenience methods
	$plugin_initializer->register_check( 'core/heading', 'heading_check', [...] );
	$plugin_initializer->unregister_check( 'core/button', 'unwanted_check' );
}
```

### Direct Registry Access

```php
// Get registry instance (only use after 'ba11yc_ready' action)
$registry = \BlockAccessibility\BlockChecksRegistry::get_instance();

// Check if plugin is available first
if ( function_exists( 'BlockAccessibility\\BlockChecksRegistry::get_instance' ) ) {
	$registry = \BlockAccessibility\BlockChecksRegistry::get_instance();
	$registry->register_check( 'my/block', 'my_check', [...] );
}
```

### Checking Plugin Availability

```php
// Check if Block Accessibility Checks is active
function is_block_accessibility_checks_active() {
	return function_exists( 'BlockAccessibility\\BlockChecksRegistry::get_instance' );
}

// Safe registration pattern
function safely_register_accessibility_checks() {
	if ( ! is_block_accessibility_checks_active() ) {
		return; // Plugin not available
	}

	add_action( 'ba11yc_register_checks', 'my_register_checks_callback' );
}
add_action( 'plugins_loaded', 'safely_register_accessibility_checks' );
```

## PHP-JavaScript Integration

The Block Accessibility Checks plugin uses a **JavaScript-only validation architecture** where PHP serves as the configuration and settings layer. This provides the best of both worlds: centralized configuration with real-time client-side validation.

### How It Works

1. **PHP Registry**: The `BlockChecksRegistry` class manages check registration, settings, and metadata
2. **Data Bridge**: Check configurations and settings are exposed to JavaScript via `wp_localize_script()`
3. **JavaScript Validation**: All validation logic runs in JavaScript using the `ba11yc.validateBlock` filter hook
4. **Visual Feedback**: Real-time visual indicators and messages appear instantly in the block editor
5. **Publishing Control**: Failed checks can prevent publishing based on severity level
6. **Settings Integration**: Admin settings control which checks are enabled and their severity levels

### Accessing Rules in JavaScript

The PHP registry data is available in JavaScript through the global `BlockAccessibilityChecks` object:

```javascript
// Access validation rules
const validationRules = window.BlockAccessibilityChecks?.validationRules || {};

// Get rules for a specific block type
const imageRules = validationRules['core/image'] || {};
const myBlockRules = validationRules['create-block/my-custom-block'] || {};

// Iterate through all checks for a block type
Object.entries(imageRules).forEach(([checkName, config]) => {
	if (config.enabled) {
		console.log(`Check: ${checkName}`);
		console.log(`Message: ${config.message}`);
		console.log(`Type: ${config.type}`);
		console.log(`Priority: ${config.priority}`);
	}
});

// Check if specific validation exists
if (myBlockRules.required_field) {
	// Handle specific check...
}
```

### JavaScript Check Integration

For external plugins, integrate your JavaScript validation checks using the unified `ba11yc.validateBlock` filter:

```javascript
import { addFilter } from '@wordpress/hooks';

/**
 * Register validation logic for your custom block
 */
addFilter(
	'ba11yc.validateBlock',
	'my-plugin/validation',
	(isValid, blockType, attributes, checkName, rule) => {
		// Only handle your block type
		if (blockType !== 'create-block/my-custom-block') {
			return isValid;
		}

		// Implement validation logic based on check name
		switch (checkName) {
			case 'required_field':
				// Return true if valid, false if invalid
				return !!(attributes.requiredField && attributes.requiredField.trim());

			case 'content_length':
				const content = attributes.content || '';
				return content.length <= 500;

			default:
				return isValid;
		}
	}
);
```

		return { isValid: true };
	}

	const attributes = block.attributes;
	const validationRules = window.BlockAccessibilityChecks?.validationRules || {};
	const blockRules = validationRules[block.name] || {};

	// Check each registered rule
	for (const [checkId, rule] of Object.entries(blockRules)) {
		if (!rule.enabled) continue;

		let isValid = true;

		// Implement your validation logic
		switch (checkId) {
			case 'required_field':
				isValid = !!(attributes.requiredField && attributes.requiredField.trim());
				break;
			case 'content_length':
				isValid = (attributes.content?.length || 0) <= 500;
				break;
			// Add more checks as needed...
		}

		// If any check fails, return invalid result
		if (!isValid) {
			return {
				isValid: false,
				mode: rule.type, // 'error', 'warning', or 'info'
				clientId: block.clientId,
				name: block.name,
				message: rule.message,
			};
		}
	}

	return { isValid: true };

}

// Register the validation function
addFilter(
'ba11yc.validateBlock',
'my-plugin/validation',
(isValid, blockType, attributes, checkName, rule) => {
if (blockType !== 'my-plugin/custom-block') {
return isValid;
}

		if (checkName === 'content_validation') {
			// Implement your validation logic here
			return attributes.content && attributes.content.trim().length > 0;
		}

		return isValid;
	}

);
}

````

### Ensuring Proper Load Order

Make sure your JavaScript runs after the Block Accessibility Checks script by setting proper dependencies in your block's asset file or when enqueueing:

```php
// In your plugin's script enqueuing
wp_enqueue_script(
	'my-block-accessibility',
	plugins_url('build/accessibility-checks.js', __FILE__),
	array('block-accessibility-checks-script'), // Dependency on core plugin
	'1.0.0',
	true
);
````

### Visual Feedback Integration

Once your JavaScript check is properly integrated, the Block Accessibility Checks system will automatically:

1. **Show error indicators** - Red borders around invalid blocks (for errors) or yellow borders (for warnings)
2. **Display all issues simultaneously** - Multiple validation messages appear in the block inspector sidebar panel, with errors shown first, then warnings
3. **Control publishing** - Prevent publishing when errors are present (warnings allow publishing but show notifications)
4. **Provide real-time feedback** - As users edit block content, all validation issues update instantly
5. **Prioritize issue display** - Block border color reflects the highest severity issue (error overrides warning)

### Multiple Issues Support

The validation system displays all accessibility issues at once, eliminating the frustrating "fix one, see another" cycle:

- **Error Priority**: Blocks with both errors and warnings show red borders until all errors are resolved
- **Comprehensive Feedback**: All failing checks are listed in the inspector panel simultaneously
- **Organized Display**: Issues are grouped by severity (errors first, then warnings) in the sidebar
- **Individual Messages**: Each validation issue shows its specific error message and type

### Benefits of This Architecture

- **Consistency**: Same validation logic and messages everywhere
- **Comprehensive Feedback**: Users see all issues at once, not one at a time
- **Extensibility**: Developers can add checks that work in both PHP and JavaScript
- **Maintainability**: Single source of truth reduces duplication
- **Performance**: Client-side validation provides immediate feedback
- **Flexibility**: Supports different severity levels (error, warning, info)
- **Integration**: Works seamlessly with WordPress block editor UI

## Complete Integration Example

Here's a complete example showing how to integrate a custom testimonial block with the Block Accessibility Checks plugin using the new JavaScript-only validation approach:

### File Structure

```
my-testimonial-block/
├── my-testimonial-block.php (main plugin file)
├── includes/
│   └── accessibility-integration.php
├── src/
│   ├── accessibility-checks.js
│   └── my-testimonial-block/
│       ├── edit.js
│       └── block.json
└── build/ (generated by build process)
```

### PHP Registration (includes/accessibility-integration.php)

```php
<?php
/**
 * Block Accessibility Checks Integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Register accessibility checks for testimonial block
 * Only metadata - all validation logic is in JavaScript
 */
function my_testimonial_register_accessibility_checks($registry) {
	// Required author name
	$registry->register_check('external-block/my-testimonial-block', 'author_required', [
		'message' => __('Author name is required for testimonials.', 'my-testimonial-block'),
		'type' => 'settings', // Uses admin settings by default
		'description' => __('Author attribution is important for testimonial credibility.', 'my-testimonial-block'),
	]);

	// Required content
	$registry->register_check('external-block/my-testimonial-block', 'content_required', [
		'message' => __('Testimonial content cannot be empty.', 'my-testimonial-block'),
		'type' => 'error', // Forced as error, bypasses settings
		'description' => __('Empty testimonials provide no value to users.', 'my-testimonial-block'),
	]);

	// Heading structure
	$registry->register_check('external-block/my-testimonial-block', 'heading_structure', [
		'message' => __('If using a heading, ensure it follows proper heading hierarchy.', 'my-testimonial-block'),
		'type' => 'warning', // Forced as warning, bypasses settings
		'description' => __('Proper heading structure improves accessibility for screen reader users.', 'my-testimonial-block'),
	]);
}

/**
 * Enqueue accessibility checks JavaScript
 */
function my_testimonial_enqueue_accessibility_assets() {
	wp_enqueue_script(
		'my-testimonial-accessibility-checks',
		plugins_url('build/accessibility-checks.js', dirname(__FILE__)),
		['wp-hooks', 'wp-i18n', 'block-accessibility-script'],
		'1.0.0',
		true
	);
}

// Hook into Block Accessibility Checks when it's ready
add_action('ba11yc_register_checks', 'my_testimonial_register_accessibility_checks');

// Enqueue our accessibility checks script in the block editor
add_action('enqueue_block_editor_assets', 'my_testimonial_enqueue_accessibility_assets');
```

````

### Main Plugin File Integration

```php
<?php
/**
 * Plugin Name: My Testimonial Block
 */

// Plugin initialization code here...

/**
 * Load accessibility integration when Block Accessibility Checks is ready
 */
function my_testimonial_load_accessibility_integration() {
	if (function_exists('BlockAccessibility\\BlockChecksRegistry::get_instance')) {
		require_once plugin_dir_path(__FILE__) . 'includes/accessibility-integration.php';
	}
}
add_action('ba11yc_ready', 'my_testimonial_load_accessibility_integration');
````

### JavaScript Validation Implementation (src/accessibility-checks.js)

```javascript
/**
 * Testimonial Block Accessibility Checks
 *
 * Integrates with the Block Accessibility Checks plugin validation system.
 * All validation logic is handled in JavaScript for real-time feedback.
 */

import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

/**
 * Register validation logic for testimonial block using the unified hook system
 */
addFilter(
	'ba11yc.validateBlock',
	'my-testimonial-block/validation',
	(isValid, blockType, attributes, checkName, rule) => {
		// Only handle our block type
		if (blockType !== 'external-block/my-testimonial-block') {
			return isValid;
		}

		// Run validation based on check name
		switch (checkName) {
			case 'author_required':
				// Return true if valid, false if invalid
				return !!(attributes.author && attributes.author.trim());

			case 'content_required':
				// Return true if valid, false if invalid
				return !!(attributes.content && attributes.content.trim());

			case 'heading_structure':
				// If headingText exists, it should have content
				if (attributes.headingText !== undefined && attributes.headingText !== null) {
					return !!(attributes.headingText && attributes.headingText.trim());
				}
				// No heading is fine (valid)
				return true;

			default:
				// Unknown check, let other filters handle it
				return isValid;
		}
	}
);
```

		if (!isValid) {
			return {
				isValid: false,
				mode: rule.type,
				clientId: block.clientId,
				name: block.name,
				message: rule.message,
			};
		}
	}

	return { isValid: true };

}

/\*\*

- Register with Block Accessibility Checks system
  \*/
  addFilter(
  'ba11yc.validateBlock',
  'my-testimonial-block/validation',
  (isValid, blockType, attributes, checkName, rule) => {
  if (blockType !== 'external-block/my-testimonial-block') {
  return isValid;
  }

			  if (checkName === 'required_content') {
				  return attributes.content && attributes.content.trim().length > 0;
			  }

			  if (checkName === 'author_name') {
				  return attributes.authorName && attributes.authorName.trim().length > 0;
			  }

			  return isValid;
		  }

	);

````

### Build Configuration

Ensure your JavaScript dependencies are correct in `webpack.config.js` or similar:

```javascript
// Make sure Block Accessibility Checks script is loaded first
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
	...defaultConfig,
	entry: {
		'my-testimonial-block/index': './src/my-testimonial-block/index.js',
		'accessibility-checks': './src/accessibility-checks.js', // Separate entry
	},
};
````

### Script Enqueuing

```php
function my_testimonial_enqueue_accessibility_scripts() {
	$asset_file = include plugin_dir_path(__FILE__) . 'build/accessibility-checks.asset.php';

	wp_enqueue_script(
		'my-testimonial-accessibility',
		plugins_url('build/accessibility-checks.js', __FILE__),
		array_merge($asset_file['dependencies'], ['block-accessibility-checks-script']),
		$asset_file['version'],
		true
	);
}
add_action('enqueue_block_editor_assets', 'my_testimonial_enqueue_accessibility_scripts');
```

## Advanced Patterns

### Conditional Check Registration

```php
function conditionally_register_checks($registry) {
	// Only register for certain post types
	if (get_post_type() === 'product') {
		$registry->register_check('core/image', 'product_image_requirements', [
			'message' => __('Product images must have descriptive alt text.', 'my-plugin'),
			'type' => 'error'
		]);
	}
}
add_action('ba11yc_register_checks', 'conditionally_register_checks');
```

### Dynamic Check Configuration

```php
function modify_check_configuration($check_args, $block_type, $check_name) {
	// Make certain checks warnings instead of errors for specific roles
	if (!current_user_can('manage_options') && $check_args['type'] === 'error') {
		if (in_array($check_name, ['optional_accessibility_check'])) {
			$check_args['type'] = 'warning';
		}
	}

	return $check_args;
}
add_filter('ba11yc_check_args', 'modify_check_configuration', 10, 3);
```

### Custom Result Processing

```php
function process_custom_check_results($results, $block_type, $attributes, $content) {
	// Add contextual information to results
	foreach ($results as &$result) {
		if ($result['check_name'] === 'heading_hierarchy') {
			$result['context'] = [
				'post_type' => get_post_type(),
				'current_user_role' => wp_get_current_user()->roles[0] ?? 'subscriber'
			];
		}
	}

	return $results;
}
add_filter('ba11yc_block_check_results', 'process_custom_check_results', 10, 4);
```

### Block Attribute Preprocessing

```php
function preprocess_block_attributes($attributes, $block_type, $content) {
	// Normalize attributes before validation
	if ($block_type === 'core/image') {
		// Ensure alt attribute exists
		if (!isset($attributes['alt'])) {
			$attributes['alt'] = '';
		}

		// Clean up alt text
		$attributes['alt'] = trim($attributes['alt']);
	}

	return $attributes;
}
add_filter('ba11yc_block_attributes', 'preprocess_block_attributes', 10, 3);
```

### JavaScript Advanced Integration

```javascript
// Advanced JavaScript validation with multiple rules
function advancedBlockValidation(block) {
	const { name, attributes } = block;
	const validationRules = window.BlockAccessibilityChecks?.validationRules || {};
	const blockRules = validationRules[name] || {};

	const errors = [];
	const warnings = [];

	// Process all rules and collect results by severity
	Object.entries(blockRules).forEach(([checkId, rule]) => {
		if (!rule.enabled) return;

		const isValid = performValidation(checkId, attributes, rule);

		if (!isValid) {
			const result = {
				checkId,
				message: rule.message,
				type: rule.type,
				priority: rule.priority || 10,
			};

			if (rule.type === 'error') {
				errors.push(result);
			} else {
				warnings.push(result);
			}
		}
	});

	// Return highest severity issue first
	if (errors.length > 0) {
		const highestPriorityError = errors.sort((a, b) => a.priority - b.priority)[0];
		return {
			isValid: false,
			mode: 'error',
			clientId: block.clientId,
			name: block.name,
			message: highestPriorityError.message,
			allIssues: [...errors, ...warnings],
		};
	}

	if (warnings.length > 0) {
		const highestPriorityWarning = warnings.sort((a, b) => a.priority - b.priority)[0];
		return {
			isValid: false,
			mode: 'warning',
			clientId: block.clientId,
			name: block.name,
			message: highestPriorityWarning.message,
			allIssues: warnings,
		};
	}

	return { isValid: true };
}

function performValidation(checkId, attributes, rule) {
	// Custom validation logic here
	switch (checkId) {
		case 'complex_validation':
			return validateComplexRule(attributes, rule);
		default:
			return true;
	}
}
```

## Troubleshooting

### Common Issues and Solutions

#### Visual Indicators Not Showing

**Problem:** Your custom block checks are working for publish blocking, but visual error indicators aren't appearing in the block editor.

**Solution:** Ensure your JavaScript validation function is properly integrated with the filter system:

```javascript
// ✅ Correct: Return proper result object
function checkMyBlock(block) {
	if (block.name !== 'my/block') {
		return { isValid: true };
	}

	const isValid = performValidation(block.attributes);

	if (!isValid) {
		return {
			isValid: false,
			mode: 'error', // Important: must be 'error', 'warning', or 'info'
			clientId: block.clientId,
			name: block.name,
			message: 'Specific error message',
		};
	}

	return { isValid: true };
}

// ❌ Wrong: Returning just true/false
function checkMyBlock(block) {
	return block.attributes.requiredField ? false : true; // This won't show visual indicators
}
```

#### JavaScript Checks Not Running

**Problem:** Your JavaScript validation doesn't seem to be running at all.

**Solution:** Check load order and filter registration:

```javascript
// ✅ Ensure proper load order
wp_enqueue_script(
	'my-block-validation',
	plugins_url('build/validation.js', __FILE__),
	array('block-accessibility-checks-script'), // Key dependency
	'1.0.0',
	true
);

// ✅ Check if filter is being added correctly
if (window.wp && window.wp.hooks) {
	wp.hooks.addFilter(
		'ba11yc.validateBlock',
		'my-plugin/validation',
		function (isValid, blockType, attributes, checkName, rule) {
			console.log('Validation called for:', blockType, checkName);

			if (blockType === 'my-plugin/custom-block' && checkName === 'my_check') {
				return attributes.content && attributes.content.trim().length > 0;
			}

			return isValid;
		}
	);
}
```

#### PHP Checks Not Registering

**Problem:** Your PHP checks aren't being registered.

**Solution:** Verify hook timing and function availability:

```php
// ✅ Check if plugin is available
function my_plugin_init() {
	if (!function_exists('BlockAccessibility\\BlockChecksRegistry::get_instance')) {
		error_log('Block Accessibility Checks plugin not available');
		return;
	}

	add_action('ba11yc_register_checks', 'my_register_checks');
}
add_action('plugins_loaded', 'my_plugin_init');

function my_register_checks($registry) {
	error_log('Registering checks...'); // Debug output

	$success = $registry->register_check('my/block', 'my_check', [
		'message' => 'Error message',
		'type' => 'error'
	]);

	if (!$success) {
		error_log('Failed to register check');
	}
}
```

#### JavaScript Validation Not Working

**Problem:** Your `ba11yc.validateBlock` filter is not being called.

**Solution:** Ensure your block is registered with the plugin and scripts are loaded in the right context:

```php
// Check that your script is enqueued in the block editor
function enqueue_validation_script() {
	// Only in block editor
	if (!is_admin() || !function_exists('get_current_screen')) {
		return;
	}

	$screen = get_current_screen();
	if (!$screen || !$screen->is_block_editor()) {
		return;
	}

	wp_enqueue_script('my-validation-script', /* ... */);
}
add_action('admin_enqueue_scripts', 'enqueue_validation_script');
```

### Debugging Tools

#### Enable Debug Logging

```php
// Add to wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);

// Add debug info to your checks
function my_debug_check($attributes, $content, $config) {
	error_log(sprintf(
		'Checking block: %s, attributes: %s',
		$config['block_type'] ?? 'unknown',
		json_encode($attributes)
	));

	$result = perform_actual_check($attributes, $content, $config);

	error_log(sprintf('Check result: %s', $result ? 'FAIL' : 'PASS'));

	return $result;
}
```

#### JavaScript Console Debugging

```javascript
// Add debugging to your validation function
function checkMyBlock(block) {
	console.group(`Validating block: ${block.name}`);
	console.log('Attributes:', block.attributes);
	console.log('Validation rules:', window.BlockAccessibilityChecks?.validationRules);

	const result = performValidation(block);

	console.log('Validation result:', result);
	console.groupEnd();

	return result;
}
```

#### Registry Inspection

```php
// Add this to a plugin or theme functions.php for debugging
function inspect_accessibility_registry() {
	if (!function_exists('BlockAccessibility\\BlockChecksRegistry::get_instance')) {
		return;
	}

	$registry = \BlockAccessibility\BlockChecksRegistry::get_instance();

	echo '<h3>Registered Block Types:</h3>';
	echo '<pre>' . print_r($registry->get_registered_block_types(), true) . '</pre>';

	echo '<h3>All Checks:</h3>';
	echo '<pre>' . print_r($registry->get_all_checks(), true) . '</pre>';
}

// Add to admin page or use in wp-admin/admin.php?page=debug
```

### Performance Considerations

#### Optimize Check Functions

```php
// ✅ Efficient check function
function optimized_check($attributes, $content, $config) {
	// Early returns for better performance
	if (empty($attributes)) {
		return false;
	}

	// Cache expensive operations
	static $cache = array();
	$cache_key = md5(serialize($attributes));

	if (isset($cache[$cache_key])) {
		return $cache[$cache_key];
	}

	// Perform expensive validation...
	$result = expensive_validation($attributes);

	$cache[$cache_key] = $result;
	return $result;
}
```

#### Minimize JavaScript Bundle Size

```javascript
// ✅ Import only what you need
import { addFilter } from '@wordpress/hooks';

// ❌ Avoid importing entire libraries
// import * as wp from '@wordpress/element';

// ✅ Use tree shaking
import { useEffect, useState } from '@wordpress/element';
```

---

For more examples and implementation details, see the [example-block.md](example-block.md) documentation.

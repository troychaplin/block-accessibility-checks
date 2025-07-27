# API Reference

Complete technical reference for all Block Accessibility Checks APIs, methods, hooks, and filters.

## Table of Contents

1. [Registry Methods](#registry-methods)
2. [Action Hooks](#action-hooks)
3. [Filter Hooks](#filter-hooks)
4. [JavaScript Validation API](#javascript-validation-api)

## Registry Methods

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

## JavaScript Validation API

### `ba11yc.validateBlock` Filter

The primary JavaScript validation hook for implementing custom validation logic.

**Signature:**

```javascript
addFilter(
	'ba11yc.validateBlock',
	'your-namespace/validation',
	(isValid, blockType, attributes, checkName, rule) => {
		// Your validation logic here
		return isValid; // true if valid, false if invalid
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

### Global Configuration Object

Access validation rules and configuration in JavaScript:

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
```

### Validation Function Patterns

**Simple Attribute Validation:**

```javascript
function validateRequiredField(attributes) {
	return !!(attributes.requiredField && attributes.requiredField.trim());
}
```

**Content-based Validation:**

```javascript
function validateContentLength(attributes) {
	const content = attributes.content || '';
	return content.length <= 500;
}
```

**Complex Validation with Multiple Conditions:**

```javascript
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
```

### Ensuring Proper Load Order

Make sure your JavaScript runs after the Block Accessibility Checks script:

```php
wp_enqueue_script(
	'my-block-accessibility',
	plugins_url('build/accessibility-checks.js', __FILE__),
	array('block-accessibility-checks-script'), // Key dependency
	'1.0.0',
	true
);
```

### Visual Feedback Integration

Once your JavaScript check is properly integrated, the Block Accessibility Checks system will automatically:

1. **Show error indicators** - Red borders around invalid blocks (for errors) or yellow borders (for warnings)
2. **Display all issues simultaneously** - Multiple validation messages appear in the block inspector sidebar panel
3. **Control publishing** - Prevent publishing when errors are present (warnings allow publishing but show notifications)
4. **Provide real-time feedback** - As users edit block content, all validation issues update instantly
5. **Prioritize issue display** - Block border color reflects the highest severity issue (error overrides warning) 
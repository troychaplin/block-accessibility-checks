# Block Accessibility Checks - Developer API

The Block Accessibility Checks plugin provides a comprehensive API for developers to extend and customize accessibility checking functionality. This document outlines the available hooks, filters, and methods for integrating with the plugin.

## Quick Start

The easiest way to add custom accessibility checks is to hook into the `ba11yc_register_checks` action:

```php
add_action( 'ba11yc_register_checks', 'my_plugin_register_checks' );

function my_plugin_register_checks( $registry ) {
    $registry->register_check(
        'core/paragraph',
        'paragraph_length',
        array(
            'callback'    => 'my_plugin_check_paragraph_length',
            'message'     => __( 'Paragraph is too long for optimal readability', 'my-plugin' ),
            'type'        => 'warning',
            'priority'    => 10,
            'description' => __( 'Long paragraphs can be difficult to read', 'my-plugin' ),
        )
    );
}

function my_plugin_check_paragraph_length( $attributes, $content, $config ) {
    $text = wp_strip_all_tags( $content );
    return strlen( $text ) > 500; // Return true if check fails
}
```

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

- `$block_type` (string) - Block type (e.g., 'core/image')
- `$check_name` (string) - Unique check name
- `$check_args` (array) - Check configuration

**Returns:** (bool) True on success, false on failure

**Check Configuration:**

```php
$check_args = array(
    'callback'    => 'callable_function',  // Required: Check function
    'message'     => 'Error message',      // Required: User-facing message
    'type'        => 'warning',            // Optional: 'error', 'warning', 'info'
    'priority'    => 10,                   // Optional: Execution priority (lower = earlier)
    'enabled'     => true,                 // Optional: Whether check is enabled
    'description' => 'Detailed info',      // Optional: Detailed description
);
```

### `unregister_check( $block_type, $check_name )`

Unregister an accessibility check.

### `set_check_enabled( $block_type, $check_name, $enabled )`

Enable or disable a specific check.

### `is_check_registered( $block_type, $check_name )`

Check if a specific check is registered.

### `get_check_config( $block_type, $check_name )`

Get configuration for a specific check.

### `get_checks( $block_type )`

Get all checks for a block type.

### `get_all_checks()`

Get all registered checks.

### `get_registered_block_types()`

Get all block types that have checks registered.

### `run_checks( $block_type, $attributes, $content )`

Run all checks for a block.

## Check Function Signature

Check functions should follow this signature:

```php
function my_check_function( $attributes, $content, $config ) {
    // Perform the accessibility check
    // Return true if the check fails (accessibility issue found)
    // Return false if the check passes
    // Return any other value to provide custom result data
}
```

## Accessing the Registry

You can access the registry through the plugin initializer:

```php
add_action( 'ba11yc_ready', 'my_plugin_init' );

function my_plugin_init( $registry, $plugin_initializer ) {
    // Direct registry access
    $registry->register_check( ... );

    // Or through the initializer convenience methods
    $plugin_initializer->register_check( ... );
    $plugin_initializer->unregister_check( ... );
}
```

## PHP-JavaScript Integration

The plugin uses a unified architecture where PHP serves as the single source of truth for all validation rules and messages. This ensures consistency between server-side and client-side validation while maintaining extensibility.

### How It Works

1. **PHP Registry**: The `BlockChecksRegistry` class manages all accessibility checks, including built-in and custom ones
2. **Data Bridge**: The `ScriptsStyles` class exposes registry data to JavaScript via `wp_localize_script()`
3. **JavaScript Validation**: Client-side validation functions mirror PHP logic using the exposed rules and messages

### Accessing Rules in JavaScript

The PHP registry data is available in JavaScript as:

```javascript
// Access validation rules
const validationRules = BlockAccessibilityChecks.validationRules;

// Get rules for a specific block type
const imageRules = validationRules['core/image'] || {};

// Iterate through all checks for a block type
Object.entries(imageRules).forEach(([checkName, config]) => {
	if (config.enabled) {
		console.log(`Check: ${checkName}, Message: ${config.message}`);
	}
});
```

### Custom Check Implementation

When registering custom checks, you need to:

1. **Register the PHP check** with the registry (as shown in Quick Start)
2. **Add JavaScript logic** if you want real-time editor validation

```javascript
// Example: Add JavaScript validation for custom check
function runCustomChecks(block, rules) {
	const failures = [];

	Object.entries(rules).forEach(([checkName, config]) => {
		if (!config.enabled) return;

		let checkFailed = false;

		switch (checkName) {
			case 'my_custom_check':
				checkFailed = myCustomValidationLogic(block.attributes);
				break;
		}

		if (checkFailed) {
			failures.push({
				checkName,
				message: config.message,
				type: config.type,
				priority: config.priority,
			});
		}
	});

	return failures;
}
```

### Benefits

- **Consistency**: Same validation logic and messages everywhere
- **Extensibility**: Developers can add checks that work in both PHP and JavaScript
- **Maintainability**: Single source of truth reduces duplication
- **Performance**: Client-side validation provides immediate feedback

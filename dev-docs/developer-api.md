# Block Accessibility Checks: Developer Documentation

The Block Accessibility Checks plugin provides a comprehensive API for developers to extend and customize accessibility checking functionality. **All validation logic is now handled in JavaScript** for real-time feedback in the block editor. This document provides an overview of the available hooks, filters, methods, and integration patterns for extending the plugin.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Key Features](#key-features)
3. [Architecture Overview](#architecture-overview)
4. [Documentation Sections](#documentation-sections)

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
			'warning_msg' => __( 'Content is long but still allowed (warning)', 'my-plugin' ),
			'description' => __( 'Long content can be difficult to read', 'my-plugin' ),
			'type'        => 'settings', // 'error', 'warning', or 'settings'
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

> **For complete examples and detailed integration patterns, see [Integration Examples](integration-examples.md).**

## Key Features

The plugin provides comprehensive accessibility validation with the following key capabilities:

- **Individual Check Control**: Configure validation levels (Error/Warning/Disabled) for each accessibility check per block type
- **Grouped Message Display**: Error and warning messages are organized by severity in the inspector panel
- **Priority-based Visual Feedback**: Block borders reflect the highest severity issue (red for errors, yellow for warnings)
- **Real-time Configuration**: Changes to accessibility settings take effect immediately in the block editor
- **External Plugin Integration**: External plugins automatically get their own dedicated settings page
- **Multiple Issues Support**: All accessibility problems are displayed simultaneously, eliminating the "fix one, see another" cycle

## Architecture Overview

The Block Accessibility Checks plugin uses a **JavaScript-only validation architecture** where PHP serves as the configuration and settings layer:

1. **PHP Registry**: The `BlockChecksRegistry` class manages check registration, settings, and metadata
2. **Data Bridge**: Check configurations and settings are exposed to JavaScript via `wp_localize_script()`
3. **JavaScript Validation**: All validation logic runs in JavaScript using the `ba11yc.validateBlock` filter hook
4. **Visual Feedback**: Real-time visual indicators and messages appear instantly in the block editor
5. **Publishing Control**: Failed checks can prevent publishing based on severity level
6. **Settings Integration**: Admin settings control which checks are enabled and their severity levels

This architecture provides the best of both worlds: centralized configuration with real-time client-side validation.

## Documentation Sections

For detailed information on specific topics, see the following documentation files:

### [Quick Start Guide](quick-start.md)
Get up and running with basic accessibility checks in minutes. Includes minimal examples and common patterns.

### [Integration Examples](integration-examples.md)
Real-world examples showing different integration patterns, complete working plugins, and advanced validation scenarios.

### [API Reference](api-reference.md)
Complete technical reference for all available methods, hooks, filters, and JavaScript validation APIs.

### [JavaScript Validation Guide](javascript-validation.md)
Deep dive into the JavaScript validation system, including real-time feedback, visual indicators, and performance optimization.

### [Troubleshooting Guide](troubleshooting.md)
Common issues, debugging tools, performance considerations, and solutions to typical integration problems.

---

**Need help?** Check the [Troubleshooting Guide](troubleshooting.md) for common issues and solutions, or see the [Working Example Plugin](https://github.com/troychaplin/block-check-integration-example) for a complete implementation.
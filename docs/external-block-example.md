# Block Accessibility Checks - External Plugin Integration Example

This example demonstrates how to integrate your existing block plugin with the Block Accessibility Checks plugin to add custom accessibility validation.

## Overview

We'll show how to add accessibility checks to a "testimonial" block for:

- Required author name
- Required testimonial content
- Proper heading structure if a heading is included

## Getting Started

If you're creating a new block plugin, start with [@wordpress/create-block](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-create-block/) to scaffold your basic block structure:

```bash
npx @wordpress/create-block my-testimonial-block
```

This will create the basic plugin structure with all the necessary files for a WordPress block.

## Required Block Attributes

The following integration instructions assume your testimonial block has these attributes defined in your `block.json`. If your block doesn't have these yet, add them to your existing attributes:

```json
"attributes": {
    "content": {
        "type": "string",
        "default": ""
    },
    "author": {
        "type": "string",
        "default": ""
    },
    "headingText": {
        "type": "string",
        "default": ""
    },
    "headingLevel": {
        "type": "number",
        "default": 3
    }
}
```

## Integration Points

The following sections show only the **additional code** you need to add to integrate with Block Accessibility Checks:

### 1. PHP Integration

#### Step 1: Create accessibility-integration.php

Create a new file `includes/accessibility-integration.php` to contain all the accessibility validation logic:

```php
<?php
/**
 * Block Accessibility Checks Integration
 *
 * This file contains all the accessibility validation logic for the testimonial block.
 *
 * @package MyTestimonialBlock
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Initialize accessibility checks integration
 *
 * This function is called when Block Accessibility Checks is ready
 *
 * @param object $registry The Block Accessibility Checks registry instance
 */
function my_testimonial_register_accessibility_checks($registry) {
    // Register check for required author name
    $registry->register_check('create-block/my-testimonial-block', 'author_required', [
        'message' => __('Author name is required for testimonials.', 'my-testimonial-block'),
        'type' => 'error',
        'callback' => 'my_testimonial_check_author_required'
    ]);

    // Register check for required content
    $registry->register_check('create-block/my-testimonial-block', 'content_required', [
        'message' => __('Testimonial content cannot be empty.', 'my-testimonial-block'),
        'type' => 'error',
        'callback' => 'my_testimonial_check_content_required'
    ]);

    // Register check for heading structure
    $registry->register_check('create-block/my-testimonial-block', 'heading_structure', [
        'message' => __('If using a heading, ensure it follows proper heading hierarchy.', 'my-testimonial-block'),
        'type' => 'warning',
        'callback' => 'my_testimonial_check_heading_structure'
    ]);
}

/**
 * Validation callback: Check if author name is provided
 *
 * @param array $attributes Block attributes
 * @return bool True if valid, false if invalid
 */
function my_testimonial_check_author_required($attributes) {
    return !empty($attributes['author']);
}

/**
 * Validation callback: Check if testimonial content is provided
 *
 * @param array $attributes Block attributes
 * @return bool True if valid, false if invalid
 */
function my_testimonial_check_content_required($attributes) {
    return !empty($attributes['content']);
}

/**
 * Validation callback: Check heading structure if heading is used
 *
 * @param array $attributes Block attributes
 * @return bool True if valid, false if invalid
 */
function my_testimonial_check_heading_structure($attributes) {
    // Simple check - if heading exists, it should have content
    if (isset($attributes['headingText'])) {
        return !empty($attributes['headingText']);
    }
    return true; // No heading is fine
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
add_action('ba11yc_ready', 'my_testimonial_register_accessibility_checks');

// Enqueue our accessibility checks script in the block editor
add_action('enqueue_block_editor_assets', 'my_testimonial_enqueue_accessibility_assets');
```

#### Step 2: Include in Main Plugin File

Add this single line to your main plugin file (e.g., `my-testimonial-block.php`) after your existing block registration:

```php
// Include accessibility integration
require_once plugin_dir_path(__FILE__) . 'includes/accessibility-integration.php';
```

### 2. JavaScript Integration - Create accessibility-checks.js

Create a new file `src/accessibility-checks.js` for real-time validation in the editor:

```javascript
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

// Get validation rules from PHP (exposed via wp_localize_script)
const validationRules = window.BlockAccessibilityChecks?.validationRules || {};

// Flag to prevent multiple registrations
let isRegistered = false;

/**
 * Validate testimonial block function that follows the same pattern as core checks
 */
function checkTestimonialBlock(block) {
	// Only validate our block type (use your actual block name from block.json)
	if (block.name !== 'create-block/my-testimonial-block') {
		return { isValid: true };
	}

	const attributes = block.attributes;
	const blockRules = validationRules['create-block/my-testimonial-block'] || {};

	// Check each registered rule
	for (const [checkId, rule] of Object.entries(blockRules)) {
		let isValid = true;

		// Run the validation logic (mirrors PHP logic)
		switch (checkId) {
			case 'author_required':
				isValid = !!(attributes.author && attributes.author.trim());
				break;
			case 'content_required':
				isValid = !!(attributes.content && attributes.content.trim());
				break;
			case 'heading_structure':
				if (attributes.headingText) {
					isValid = !!attributes.headingText.trim();
				}
				break;
		}

		// If any check fails, return invalid
		if (!isValid) {
			return {
				isValid: false,
				mode: rule.type, // 'error' or 'warning'
				clientId: block.clientId,
				name: block.name,
				message: rule.message,
			};
		}
	}

	return { isValid: true };
}

/**
 * Add our validation check to the Block Accessibility Checks system
 */
addFilter(
	'ba11yc.validateBlock',
	'my-testimonial-block/validation',
	(isValid, blockType, attributes, checkName, rule) => {
		if (blockType !== 'create-block/my-testimonial-block') {
			return isValid;
		}

		// Handle our specific checks
		switch (checkName) {
			case 'required_content':
				return attributes.content && attributes.content.trim().length > 0;

			case 'author_name':
				return attributes.authorName && attributes.authorName.trim().length > 0;

			default:
				return isValid;
		}
	}
);
}
```

### 3. Build Configuration - Update webpack.config.js

Add the accessibility checks to your build process by creating a `webpack.config.js` file:

```javascript
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry(),
		'accessibility-checks': path.resolve(__dirname, 'src/accessibility-checks.js'),
	},
};
```

## File Structure

After completing the integration, your plugin structure should look like this:

```
my-testimonial-block/
├── my-testimonial-block.php          # Main plugin file
├── includes/
│   └── accessibility-integration.php # Accessibility validation logic
├── src/
│   ├── accessibility-checks.js       # Client-side validation
│   └── my-testimonial-block/
│       ├── block.json
│       ├── edit.js
│       └── ...
├── build/
│   ├── accessibility-checks.js       # Built validation script
│   └── ...
├── webpack.config.js                 # Build configuration
└── package.json
```

## How It Works

1. **PHP Registration**: Your `accessibility-integration.php` file registers accessibility checks with the Block Accessibility Checks registry when the `ba11yc_ready` action fires.

2. **JavaScript Validation**: Your JavaScript code implements the validation logic using the `ba11yc.validateBlock` filter to provide immediate feedback in the editor and prevent publishing when there are errors.

3. **Real-time Feedback**: The validation system provides immediate visual feedback (red borders, inspector panel messages) as users edit content.

4. **Unified System**: PHP registration provides metadata and settings integration, while JavaScript handles all validation logic for consistency.

5. **Publish Prevention**: When validation errors are found, the system automatically disables the publish button and prevents saving until the issues are resolved.

## Benefits of This Approach

### **Organized Code Structure**

- **Separation of Concerns**: Accessibility logic is isolated in its own file
- **Easy Maintenance**: All validation rules and callbacks are in one place
- **Clean Main Plugin**: Your main plugin file stays focused on core functionality

### **Scalability**

- **Easy to Extend**: Add new validation rules by simply adding them to the `accessibility-integration.php` file
- **Reusable**: The same pattern can be used for multiple blocks
- **Maintainable**: Changes to accessibility logic don't affect your main plugin code

### **Professional Standards**

- **WordPress Best Practices**: Follows WordPress coding standards and file organization patterns
- **Security**: Proper file access prevention and sanitization
- **Documentation**: Well-documented functions with clear purposes

### **Development Workflow**

- **Version Control**: Easy to track changes to accessibility features
- **Team Collaboration**: Team members can work on accessibility features independently
- **Testing**: Accessibility features can be tested and debugged separately

## Advanced Features

### Custom Rule Types

You can register different types of checks:

```php
$registry->register_check('my-block/name', 'check_id', [
    'message' => 'Error message',
    'type' => 'error',        // 'error', 'warning', or 'info'
    'priority' => 10,         // Lower runs first
    'callback' => 'callback_function',
    'description' => 'Detailed explanation for developers'
]);
```

### Conditional Checks

Make checks conditional based on other attributes:

```php
function check_conditional_rule($attributes) {
    // Only validate if certain conditions are met
    if (!isset($attributes['enableFeature']) || !$attributes['enableFeature']) {
        return true; // Skip validation
    }

    return !empty($attributes['requiredWhenEnabled']);
}
```

## Testing Your Integration

1. Install both plugins
2. Create a new testimonial block
3. Leave required fields empty - you should see validation errors
4. Fill in the fields - errors should disappear
5. Check that editor validation provides real-time feedback

For more details on the validation system architecture, see [developer-api.md](developer-api.md).

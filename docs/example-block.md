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
    "heading": {
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

Add these accessibility checks to your main plugin file (after your existing block registration):

```php
// Hook into Block Accessibility Checks after it initializes
add_action('init', 'register_testimonial_accessibility_checks', 20);

function register_testimonial_accessibility_checks() {
    // Only proceed if Block Accessibility Checks is active
    if (!class_exists('BlockAccessibilityChecks\BlockChecksRegistry')) {
        return;
    }

    $registry = \BlockAccessibilityChecks\BlockChecksRegistry::get_instance();

    // Register check for required author name
    $registry->register_check('my-testimonial-block/testimonial', 'author_required', [
        'message' => __('Author name is required for testimonials.', 'my-testimonial-block'),
        'type' => 'error',
        'callback' => 'check_testimonial_author_required'
    ]);

    // Register check for required content
    $registry->register_check('my-testimonial-block/testimonial', 'content_required', [
        'message' => __('Testimonial content cannot be empty.', 'my-testimonial-block'),
        'type' => 'error',
        'callback' => 'check_testimonial_content_required'
    ]);

    // Register check for heading structure
    $registry->register_check('my-testimonial-block/testimonial', 'heading_structure', [
        'message' => __('If using a heading, ensure it follows proper heading hierarchy.', 'my-testimonial-block'),
        'type' => 'warning',
        'callback' => 'check_testimonial_heading_structure'
    ]);
}

// Validation callback functions
function check_testimonial_author_required($attributes) {
    return !empty($attributes['author']);
}

function check_testimonial_content_required($attributes) {
    return !empty($attributes['content']);
}

function check_testimonial_heading_structure($attributes) {
    // Simple check - if heading exists, it should have content
    if (isset($attributes['heading'])) {
        return !empty($attributes['heading']);
    }
    return true; // No heading is fine
}
```

### 2. JavaScript Integration - Create accessibility-checks.js

Create a new file `src/accessibility-checks.js` for real-time validation in the editor:

```javascript
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

// Get validation rules from PHP (exposed via wp_localize_script)
const validationRules = window.blockAccessibilityChecks?.validationRules || {};

/**
 * Validate testimonial block attributes
 */
function validateTestimonial(attributes) {
	const errors = [];
	const warnings = [];

	// Get rules for our block
	const blockRules = validationRules['my-testimonial-block/testimonial'] || {};

	// Check each registered rule
	Object.entries(blockRules).forEach(([checkId, rule]) => {
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
				if (attributes.heading) {
					isValid = !!attributes.heading.trim();
				}
				break;
		}

		// Add to appropriate array if validation fails
		if (!isValid) {
			const issue = {
				id: checkId,
				message: rule.message,
				type: rule.type,
			};

			if (rule.type === 'error') {
				errors.push(issue);
			} else {
				warnings.push(issue);
			}
		}
	});

	return { errors, warnings };
}

/**
 * Add validation to block validation filter
 */
addFilter(
	'blocks.validation.validateBlock',
	'my-testimonial-block/accessibility-validation',
	(result, blockType, attributes) => {
		if (blockType.name === 'my-testimonial-block/testimonial') {
			const validation = validateTestimonial(attributes);
			return {
				...result,
				accessibilityErrors: validation.errors,
				accessibilityWarnings: validation.warnings,
			};
		}
		return result;
	}
);
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

### 4. Script Enqueuing - Add to Main Plugin File

Add this to your existing enqueue function:

```php
// Add to your existing enqueue_block_editor_assets function
function enqueue_testimonial_editor_assets() {
    // ...your existing editor scripts...

    // Add accessibility checks script
    wp_enqueue_script(
        'my-testimonial-accessibility-checks',
        plugins_url('build/accessibility-checks.js', __FILE__),
        ['wp-hooks', 'wp-i18n', 'block-accessibility-checks-script'],
        '1.0.0',
        true
    );
}
```

## How It Works

1. **PHP Registration**: Your plugin registers accessibility checks with the Block Accessibility Checks registry during WordPress initialization.

2. **PHP-to-JS Bridge**: The Block Accessibility Checks plugin automatically exposes your registered validation rules to JavaScript via `wp_localize_script`.

3. **Real-time Validation**: Your JavaScript code hooks into the validation system to provide immediate feedback in the editor.

4. **Unified System**: Both PHP and JavaScript use the same validation rules and messages, ensuring consistency.

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
5. Check that both editor and PHP validation work consistently

For more details on the validation system architecture, see [developer-api.md](developer-api.md).

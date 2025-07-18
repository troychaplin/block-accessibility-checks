# Block Accessibility Checks - External Plugin Integration Example

This example demonstrates how to integrate your existing block plugin with the Block Accessibility Checks plugin to add custom accessibility validation using the current **JavaScript-only validation architecture**.

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

The following integration instructions assume your testimonial block has these attributes defined in your `block.json`. For this example lets add them to your existing attributes:

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

The following sections show only the **additional code** you need to add to integrate with Block Accessibility Checks using the current Javascript validation approach:

### 1. PHP Integration

#### Step 1: Create accessibility-integration.php

Create a new file `includes/accessibility-integration.php` to register checks (metadata only - no validation logic):

```php
<?php
/**
 * Block Accessibility Checks Integration
 *
 * This file contains accessibility check registration for the testimonial block.
 * All validation logic is handled in JavaScript for real-time feedback.
 *
 * @package MyTestimonialBlock
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register accessibility checks for testimonial block
 * Only metadata - all validation logic is in JavaScript
 *
 * @param object $registry The Block Accessibility Checks registry instance
 */
function my_testimonial_register_accessibility_checks($registry) {
    // Register check for required author name
    $registry->register_check('create-block/my-testimonial-block', 'author_required', [
        'message' => __('Author name is required for testimonials.', 'my-testimonial-block'),
        'type' => 'settings', // Uses admin settings by default
        'description' => __('Author attribution is important for testimonial credibility.', 'my-testimonial-block'),
    ]);

    // Register check for required content
    $registry->register_check('create-block/my-testimonial-block', 'content_required', [
        'message' => __('Testimonial content cannot be empty.', 'my-testimonial-block'),
        'type' => 'error', // Forced as error, bypasses settings
        'description' => __('Empty testimonials provide no value to users.', 'my-testimonial-block'),
    ]);

    // Register check for heading structure
    $registry->register_check('create-block/my-testimonial-block', 'heading_structure', [
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
        ['wp-hooks', 'wp-i18n', 'block-accessibility-checks-script'],
        '1.0.0',
        true
    );
}

// Hook into Block Accessibility Checks when ready for registration
add_action('ba11yc_register_checks', 'my_testimonial_register_accessibility_checks');

// Enqueue our accessibility checks script in the block editor
add_action('enqueue_block_editor_assets', 'my_testimonial_enqueue_accessibility_assets');
```

#### Step 2: Include in Main Plugin File

Add this to your main plugin file (e.g., `my-testimonial-block.php`) to load the integration when Block Accessibility Checks is ready:

```php
/**
 * Load accessibility integration when Block Accessibility Checks is ready
 */
function my_testimonial_load_accessibility_integration() {
    if (function_exists('BlockAccessibility\\BlockChecksRegistry::get_instance')) {
        require_once plugin_dir_path(__FILE__) . 'includes/accessibility-integration.php';
    }
}
add_action('ba11yc_ready', 'my_testimonial_load_accessibility_integration');
```

### 2. JavaScript Integration - Create accessibility-checks.js

Create a new file `src/accessibility-checks.js` that implements all validation logic in JavaScript for real-time feedback:

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
		if (blockType !== 'create-block/my-testimonial-block') {
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

### 3. Build Configuration - Update webpack.config.js

Add the accessibility checks to your build process by updating your `webpack.config.js` file:

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

### 4. Script Enqueuing

Make sure your accessibility checks script is properly enqueued with the correct dependencies. The `accessibility-integration.php` file already handles this, but ensure your build process generates the necessary asset files.

## File Structure

After completing the integration, your plugin structure should look like this:

```
my-testimonial-block/
├── my-testimonial-block.php          # Main plugin file
├── includes/
│   └── accessibility-integration.php # Check registration (metadata only)
├── src/
│   ├── accessibility-checks.js       # JavaScript validation logic
│   └── my-testimonial-block/
│       ├── block.json
│       ├── edit.js
│       └── ...
├── build/
│   ├── accessibility-checks.js       # Built validation script
│   ├── accessibility-checks.asset.php # Generated dependencies
│   └── ...
├── webpack.config.js                 # Build configuration
└── package.json
```

## How It Works

1. **PHP Registration**: Your `accessibility-integration.php` file registers accessibility check metadata with the Block Accessibility Checks registry using the `ba11yc_register_checks` action.

2. **JavaScript Validation**: Your JavaScript code implements all validation logic using the `ba11yc.validateBlock` filter to provide immediate feedback in the editor.

3. **Real-time Feedback**: The validation system provides immediate visual feedback (colored icons, inspector panel messages) as users edit content.

4. **Settings Integration**: Checks with `type: 'settings'` automatically appear in the Block Accessibility Checks admin settings page for your plugin.

5. **Publishing Control**: When validation errors are found, the system automatically prevents publishing until issues are resolved.

## Benefits of This Approach

### **Modern Architecture**

- **JavaScript-only Validation**: All validation runs in JavaScript for consistent real-time feedback
- **PHP for Configuration**: PHP handles registration, settings, and metadata only
- **Real-time Performance**: No server round-trips needed for validation
- **Consistent Experience**: Same validation logic everywhere

### **Organized Code Structure**

- **Separation of Concerns**: Accessibility logic is isolated in dedicated files
- **Easy Maintenance**: All validation rules are centralized
- **Clean Integration**: Minimal impact on your main plugin code
- **Scalable**: Easy to add new checks without refactoring

### **Professional Standards**

- **WordPress Best Practices**: Follows current WordPress development patterns
- **Security**: Proper file access prevention and sanitization
- **Documentation**: Well-documented functions with clear purposes
- **Performance**: Optimized for real-time editor usage

### **Development Workflow**

- **Version Control**: Easy to track changes to accessibility features
- **Team Collaboration**: Team members can work on accessibility features independently
- **Testing**: Accessibility features can be tested and debugged separately
- **Build Integration**: Works with standard WordPress build tools

## Advanced Features

### Custom Rule Types

You can register different types of checks:

```php
$registry->register_check('my-block/name', 'check_id', [
    'message' => 'Error message',
    'type' => 'settings',      // 'error', 'warning', 'settings', or 'none'
    'priority' => 10,          // Lower runs first
    'description' => 'Detailed explanation for settings page'
]);
```

### Settings Integration

Checks with `type: 'settings'` automatically:

- Create a submenu page in Block Accessibility Checks
- Allow site admins to configure check levels (Error/Warning/None)
- Use admin preferences for validation behavior

### Conditional Checks

Make checks conditional based on other attributes:

```javascript
addFilter(
	'ba11yc.validateBlock',
	'my-plugin/conditional-validation',
	(isValid, blockType, attributes, checkName, rule) => {
		if (blockType !== 'my-plugin/conditional-block') {
			return isValid;
		}

		if (checkName === 'conditional_check') {
			// Only validate if certain conditions are met
			if (!attributes.enableFeature) {
				return true; // Skip validation
			}

			return !!(attributes.requiredWhenEnabled && attributes.requiredWhenEnabled.trim());
		}

		return isValid;
	}
);
```

## Testing Your Integration

1. Install both plugins
2. Create a new testimonial block
3. Leave required fields empty - you should see validation errors (red/yellow icons)
4. Fill in the fields - errors should disappear
5. Check that editor validation provides real-time feedback
6. Verify that error-level checks prevent publishing
7. Check admin settings page shows your plugin's checks (for 'settings' type checks)

For more details on the validation system architecture and available hooks, see [developer-api.md](developer-api.md).

# Block Accessibility Checks - External Plugin Integration Example

This example demonstrates how to create a standalone block plugin that integrates with the Block Accessibility Checks plugin to add custom accessibility validation.

## Overview

We'll create a "testimonial" block plugin that includes accessibility checks for:

- Required author name
- Required testimonial content
- Proper heading structure if a heading is included

## Complete Integration Example

### 1. Plugin Structure

```
my-testimonial-block/
├── my-testimonial-block.php          # Main plugin file
├── src/
│   ├── block.json                    # Block registration
│   ├── edit.js                       # Block editor component
│   ├── save.js                       # Block save function
│   ├── style.scss                    # Block styles
│   └── accessibility-checks.js       # Custom accessibility validation
├── build/                            # Compiled assets
└── package.json                      # Build configuration
```

### 2. Main Plugin File (my-testimonial-block.php)

```php
<?php
/**
 * Plugin Name: My Testimonial Block
 * Description: A testimonial block with accessibility checks
 * Version: 1.0.0
 * Text Domain: my-testimonial-block
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class MyTestimonialBlock {

    public function __construct() {
        add_action('init', array($this, 'register_block'));
        add_action('ba11yc_register_checks', array($this, 'register_accessibility_checks'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_block_assets'));
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_editor_assets'));
    }

    /**
     * Register the testimonial block
     */
    public function register_block() {
        register_block_type(__DIR__ . '/src');
    }

    /**
     * Register custom accessibility checks with Block Accessibility Checks plugin
     */
    public function register_accessibility_checks($registry) {
        // Only register if the registry exists (plugin is active)
        if (!$registry) {
            return;
        }

        // Check for required author name
        $registry->register_check(
            'my-testimonial-block/testimonial',
            'author_required',
            array(
                'callback'    => array($this, 'check_author_required'),
                'message'     => __('Testimonials must include an author name for credibility and accessibility', 'my-testimonial-block'),
                'type'        => 'error',
                'priority'    => 5,
                'description' => __('Author attribution is essential for testimonial credibility and screen reader context', 'my-testimonial-block'),
            )
        );

        // Check for testimonial content
        $registry->register_check(
            'my-testimonial-block/testimonial',
            'content_required',
            array(
                'callback'    => array($this, 'check_content_required'),
                'message'     => __('Testimonials must include content text', 'my-testimonial-block'),
                'type'        => 'error',
                'priority'    => 5,
                'description' => __('Empty testimonials provide no value to users', 'my-testimonial-block'),
            )
        );

        // Check heading level structure
        $registry->register_check(
            'my-testimonial-block/testimonial',
            'heading_structure',
            array(
                'callback'    => array($this, 'check_heading_structure'),
                'message'     => __('Testimonial headings should follow proper heading hierarchy', 'my-testimonial-block'),
                'type'        => 'warning',
                'priority'    => 10,
                'description' => __('Proper heading structure helps screen readers navigate content', 'my-testimonial-block'),
            )
        );
    }

    /**
     * Check if testimonial has required author name
     */
    public function check_author_required($attributes, $content, $config) {
        if (!isset($attributes['author']) || empty(trim($attributes['author']))) {
            return true; // Check fails
        }
        return false; // Check passes
    }

    /**
     * Check if testimonial has required content
     */
    public function check_content_required($attributes, $content, $config) {
        if (!isset($attributes['content']) || empty(trim(wp_strip_all_tags($attributes['content'])))) {
            return true; // Check fails
        }
        return false; // Check passes
    }

    /**
     * Check testimonial heading structure
     */
    public function check_heading_structure($attributes, $content, $config) {
        // If no heading is used, check passes
        if (!isset($attributes['headingLevel']) || !isset($attributes['heading'])) {
            return false;
        }

        $heading_level = (int) $attributes['headingLevel'];
        $heading_text = trim(wp_strip_all_tags($attributes['heading']));

        // Check if heading is too low level (beyond H4 for testimonials)
        if ($heading_level > 4) {
            return true; // Check fails
        }

        // Check if heading text is too short
        if (!empty($heading_text) && strlen($heading_text) < 3) {
            return true; // Check fails
        }

        return false; // Check passes
    }

    /**
     * Enqueue block assets for frontend
     */
    public function enqueue_block_assets() {
        wp_enqueue_style(
            'my-testimonial-block-style',
            plugins_url('build/style.css', __FILE__),
            array(),
            '1.0.0'
        );
    }

    /**
     * Enqueue assets for block editor
     */
    public function enqueue_editor_assets() {
        wp_enqueue_script(
            'my-testimonial-block-editor',
            plugins_url('build/index.js', __FILE__),
            array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-block-editor'),
            '1.0.0',
            true
        );

        // Enqueue our accessibility checks for real-time validation
        wp_enqueue_script(
            'my-testimonial-accessibility-checks',
            plugins_url('build/accessibility-checks.js', __FILE__),
            array('wp-hooks', 'wp-i18n'),
            '1.0.0',
            true
        );
    }
}

// Initialize the plugin
new MyTestimonialBlock();
```

### 3. Block Definition (src/block.json)

```json
{
	"$schema": "https://schemas.wp.org/trunk/block.json",
	"apiVersion": 3,
	"name": "my-testimonial-block/testimonial",
	"version": "1.0.0",
	"title": "Testimonial",
	"category": "text",
	"icon": "format-quote",
	"description": "Display customer testimonials with accessibility checks.",
	"example": {},
	"supports": {
		"html": false,
		"anchor": true
	},
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
		},
		"company": {
			"type": "string",
			"default": ""
		}
	},
	"textdomain": "my-testimonial-block",
	"editorScript": "file:./index.js",
	"editorStyle": "file:./index.css",
	"style": "file:./style-index.css"
}
```

### 4. JavaScript Accessibility Checks (src/accessibility-checks.js)

```javascript
/**
 * Accessibility checks for testimonial block that integrate with Block Accessibility Checks plugin
 */

import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

// Check if Block Accessibility Checks plugin is available
const isA11yChecksAvailable =
	window.BlockAccessibilityChecks && window.BlockAccessibilityChecks.validationRules;

if (isA11yChecksAvailable) {
	/**
	 * Add our custom block to the validation system
	 */
	addFilter(
		'blockAccessibilityChecks.getBlockChecks',
		'my-testimonial-block/add-testimonial-checks',
		function (checks) {
			// Add our testimonial check function to the existing checks array
			checks.push(checkTestimonialAccessibility);
			return checks;
		}
	);

	/**
	 * Main testimonial accessibility check function
	 * This mirrors the structure used by the core plugin
	 */
	function checkTestimonialAccessibility(block) {
		// Only process our testimonial blocks
		if (block.name !== 'my-testimonial-block/testimonial') {
			return { isValid: true, mode: 'none' };
		}

		// Get validation rules for our block from PHP registry
		const validationRules = window.BlockAccessibilityChecks.validationRules || {};
		const testimonialRules = validationRules['my-testimonial-block/testimonial'] || {};

		// Run all registered checks for our block
		const failures = runTestimonialChecks(block, testimonialRules);

		// Determine validation mode based on plugin settings
		// You might want to add your own setting for this, or use a default
		const validationMode = getValidationMode(failures);

		// Create response object
		const response = {
			isValid: failures.length === 0,
			message: '',
			clientId: block.clientId,
			mode: failures.length === 0 ? 'none' : validationMode,
		};

		// If validation fails, set appropriate error message using highest priority failure
		if (failures.length > 0) {
			const highestPriorityFailure = failures.sort((a, b) => a.priority - b.priority)[0];
			response.message = formatValidationMessage(
				highestPriorityFailure.message,
				validationMode
			);
		}

		return response;
	}

	/**
	 * Run all enabled accessibility checks for testimonial block using PHP registry rules
	 */
	function runTestimonialChecks(block, rules) {
		const failures = [];

		// Check each registered rule
		Object.entries(rules).forEach(([checkName, config]) => {
			if (!config.enabled) {
				return;
			}

			let checkFailed = false;

			// Run the appropriate check based on the check name
			// These mirror the PHP check logic
			switch (checkName) {
				case 'author_required':
					checkFailed = checkAuthorRequired(block.attributes);
					break;
				case 'content_required':
					checkFailed = checkContentRequired(block.attributes);
					break;
				case 'heading_structure':
					checkFailed = checkHeadingStructure(block.attributes);
					break;
				default:
					// Unknown check, skip
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

	/**
	 * Check if testimonial has required author (mirrors PHP logic)
	 */
	function checkAuthorRequired(attributes) {
		if (!attributes.author || attributes.author.trim() === '') {
			return true; // Check fails
		}
		return false; // Check passes
	}

	/**
	 * Check if testimonial has required content (mirrors PHP logic)
	 */
	function checkContentRequired(attributes) {
		if (!attributes.content) {
			return true; // Check fails
		}

		// Strip HTML tags and check if content exists
		const textContent = attributes.content.replace(/<[^>]*>/g, '').trim();
		if (textContent === '') {
			return true; // Check fails
		}

		return false; // Check passes
	}

	/**
	 * Check testimonial heading structure (mirrors PHP logic)
	 */
	function checkHeadingStructure(attributes) {
		// If no heading is used, check passes
		if (!attributes.headingLevel || !attributes.heading) {
			return false;
		}

		const headingLevel = parseInt(attributes.headingLevel);
		const headingText = attributes.heading.replace(/<[^>]*>/g, '').trim();

		// Check if heading is too low level (beyond H4 for testimonials)
		if (headingLevel > 4) {
			return true; // Check fails
		}

		// Check if heading text is too short
		if (headingText !== '' && headingText.length < 3) {
			return true; // Check fails
		}

		return false; // Check passes
	}

	/**
	 * Determine validation mode - you can customize this based on your needs
	 */
	function getValidationMode(failures) {
		// Check if any failures are errors
		const hasErrors = failures.some(failure => failure.type === 'error');
		return hasErrors ? 'error' : 'warning';
	}

	/**
	 * Format validation message with appropriate prefix
	 */
	function formatValidationMessage(baseMessage, mode) {
		switch (mode) {
			case 'error':
				return __('Error:', 'my-testimonial-block') + ' ' + baseMessage;
			case 'warning':
				return __('Warning:', 'my-testimonial-block') + ' ' + baseMessage;
			case 'none':
			default:
				return baseMessage;
		}
	}
}
```

### 5. Block Editor Component (src/edit.js)

```javascript
import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
	const { content, author, heading, headingLevel, company } = attributes;

	const blockProps = useBlockProps();

	const HeadingTag = `h${headingLevel}`;

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Heading Settings', 'my-testimonial-block')}>
					<SelectControl
						label={__('Heading Level', 'my-testimonial-block')}
						value={headingLevel}
						options={[
							{ label: 'H2', value: 2 },
							{ label: 'H3', value: 3 },
							{ label: 'H4', value: 4 },
							{ label: 'H5', value: 5 },
							{ label: 'H6', value: 6 },
						]}
						onChange={value => setAttributes({ headingLevel: parseInt(value) })}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<blockquote className="testimonial">
					{heading && (
						<HeadingTag className="testimonial__heading">
							<RichText
								tagName="span"
								value={heading}
								onChange={value => setAttributes({ heading: value })}
								placeholder={__(
									'Optional testimonial heading...',
									'my-testimonial-block'
								)}
							/>
						</HeadingTag>
					)}

					<RichText
						tagName="p"
						className="testimonial__content"
						value={content}
						onChange={value => setAttributes({ content: value })}
						placeholder={__('Enter testimonial content...', 'my-testimonial-block')}
					/>

					<footer className="testimonial__attribution">
						<RichText
							tagName="cite"
							className="testimonial__author"
							value={author}
							onChange={value => setAttributes({ author: value })}
							placeholder={__('Author name...', 'my-testimonial-block')}
						/>
						{company && (
							<RichText
								tagName="span"
								className="testimonial__company"
								value={company}
								onChange={value => setAttributes({ company: value })}
								placeholder={__('Company name...', 'my-testimonial-block')}
							/>
						)}
					</footer>
				</blockquote>
			</div>
		</>
	);
}
```

## Key Integration Points

### 1. PHP Integration

- **Hook into `ba11yc_register_checks`**: This is the main entry point for registering your custom checks
- **Mirror PHP logic in JavaScript**: The validation logic should be identical in both PHP and JavaScript
- **Use the registry pattern**: Follow the same structure as the core plugin for consistency

### 2. JavaScript Integration

- **Check for plugin availability**: Always verify that Block Accessibility Checks is active before registering JS checks
- **Access validation rules**: Use `window.BlockAccessibilityChecks.validationRules` to get your PHP-registered rules
- **Follow the validation pattern**: Use the same structure as core blocks for consistency
- **Add to the checks system**: Use WordPress hooks to integrate with the existing validation system

### 3. Benefits of This Approach

- **Automatic integration**: Your checks appear in the Block Accessibility Checks settings page
- **Consistent messaging**: Same validation messages in editor and on save
- **Extensible**: Other developers can modify your checks using the same filter system
- **Performance**: Real-time validation in the editor with server-side verification
- **Maintainable**: Single source of truth for validation logic

### 4. Testing Your Integration

1. Activate both plugins
2. Create a testimonial block in the editor
3. Try leaving required fields empty - you should see validation errors
4. Check the Block Accessibility Checks settings page - your checks should appear there
5. Disable your checks in settings - they should stop validating

This example demonstrates the complete integration pattern that allows external block plugins to seamlessly work with the Block Accessibility Checks plugin's unified validation system.

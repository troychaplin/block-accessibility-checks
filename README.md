<img src="assets/banner-772x250.png" alt="Block Finder Plugin Banner" style="width: 100%; height: auto;">

# Block Accessibility Checks

Block Accessibility Checks is a WordPress plugin that helps ensure your content meets WCAG (Web Content Accessibility Guidelines) requirements. This plugin integrates seamlessly with the Gutenberg editor to provide real-time accessibility validation for WordPress blocks, post meta fields, and editor-level content structure, preventing users from publishing content that doesn't comply with WCAG standards.

**[Download it from WordPress.org today!](https://wordpress.org/plugins/block-accessibility-checks/)**

## Features

- **Real-time Accessibility Checks:** Automatically validates block configurations, post meta fields, and document structure as you edit content in the Gutenberg editor
- **Three-Tier Validation System:** Validates blocks, post meta fields, and editor-level concerns (like heading hierarchy) with unified error handling
- **Comprehensive Issue Display:** Shows all accessibility problems at once, eliminating the frustrating "fix one, see another" cycle
- **Visual Error Indicators:** Shows clear visual feedback with red borders (errors) or yellow borders (warnings) for blocks with accessibility issues
- **Publishing Prevention:** Blocks the publishing of content that fails critical accessibility requirements in blocks, meta fields, or editor-level checks
- **User-Friendly Notifications:** Provides clear and actionable feedback in the block inspector panel to help users fix issues
- **Extensible Architecture:** Comprehensive developer API with hooks and filters for adding custom accessibility checks for blocks, meta fields, and editor-level validation
- **External Plugin Support:** Works seamlessly with custom blocks from third-party plugins and themes, with automatic settings page generation
- **Unified Validation:** JavaScript-only validation system ensures consistent real-time feedback across all contexts (post editor and site editor)
- **Individual Check Control:** Configure validation levels (error/warning/disabled) for each accessibility check per block type
- **Grouped Message Display:** Organized error and warning messages in the inspector panel for better user experience
- **Issue Categorization:** Separate display groups for accessibility and validation issues in the block editor
- **Custom Error Messages:** Support for custom error and warning messages for each accessibility check
- **Smart Heading Management:** Document-wide heading hierarchy validation prevents skipped levels and ensures proper structure
- **Intelligent URL Validation:** Real TLD validation using the Public Suffix List ensures only legitimate domains are accepted in button links
- **Meta Field Validation:** Validate required post meta fields with real-time feedback and automatic post locking for errors

## Core Block Checks

The plugin includes built-in accessibility checks for WordPress core blocks:

| Block        | Accessibility Checks                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| core/button  | Ensures buttons have descriptive text content                                      |
| core/button  | Validates button links using real TLD validation (Public Suffix List)              |
| core/heading | Document-wide heading hierarchy validation (prevents skipped levels)               |
| core/heading | Ensures appropriate first heading level (H2 recommended, H1 with warnings)         |
| core/heading | Configurable heading level restrictions to maintain proper hierarchy               |
| core/gallery | Applies all core/image accessibility checks to gallery images                      |
| core/image   | Requires alternative text (unless marked as decorative)                            |
| core/image   | Validates alt text length (warns if exceeding 125 characters)                      |
| core/image   | Prevents alt text from duplicating caption text                                    |
| core/image   | Detects non-descriptive alt text patterns (e.g., "image of", "photo123", etc.)    |
| core/table   | Requires either table headers or caption for screen reader navigation              |

### Additional Validation Systems

**Post Meta Field Validation:**
- Validate required custom fields with real-time feedback
- Automatic post locking when meta validation fails
- Seamless integration with block validation
- Extensible API for custom post meta validation

**Editor-Level Validation:**
- Document-wide concerns (heading hierarchy, content structure)
- Global validation that spans across multiple blocks
- Prevents publishing when editor-level issues are detected

## Developer API & External Plugin Integration

The plugin provides a powerful three-tier API for developers to extend functionality with custom accessibility checks. The system supports block validation, post meta field validation, and editor-level validation for both core WordPress blocks and custom blocks from external plugins.

### Quick Start Example - Block Validation

**PHP Registration (for settings and metadata):**

```php
add_action( 'ba11yc_register_checks', 'my_custom_checks' );

function my_custom_checks( $registry ) {
    $registry->register_check(
        'my-plugin/custom-block',
        'required_content',
        array(
            'error_msg'   => __( 'This field is required for accessibility compliance', 'my-plugin' ),
            'warning_msg' => __( 'This field is recommended for accessibility compliance', 'my-plugin' ),
            'description' => __( 'Content validation for accessibility compliance', 'my-plugin' ),
            'type'        => 'settings',
            'category'    => 'accessibility', // 'accessibility' or 'validation'
            'priority'    => 10,
        )
    );
}
```

**JavaScript Validation Implementation:**

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
	'ba11yc_validate_block',
	'my-plugin/validation',
	(isValid, blockType, attributes, checkName, rule) => {
		if (blockType !== 'my-plugin/custom-block') {
			return isValid;
		}

		if (checkName === 'required_content') {
			return attributes.content && attributes.content.trim().length > 0;
		}

		return isValid;
	}
);
```

### Quick Start Example - Meta Field Validation

**PHP Registration:**

```php
add_action( 'ba11yc_register_meta_checks', 'my_custom_meta_checks' );

function my_custom_meta_checks( $registry ) {
    $registry->register_check(
        'my_featured_subtitle',
        array(
            'error_msg'   => __( 'Featured subtitle is required', 'my-plugin' ),
            'post_types'  => array( 'post', 'page' ),
            'type'        => 'settings', // or 'error', 'warning', 'none'
            'category'    => 'validation',
        )
    );
}
```

**JavaScript Validation:**

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
	'ba11yc_validate_meta',
	'my-plugin/meta-validation',
	(isValid, metaKey, metaValue, rule) => {
		if (metaKey === 'my_featured_subtitle') {
			return metaValue && metaValue.trim().length > 0;
		}
		return isValid;
	}
);
```

### Key Features for Developers

- **Three-Tier Validation System:** Register checks for blocks, post meta fields, and editor-level concerns
- **JavaScript-only Validation:** All validation logic runs in JavaScript for real-time editor feedback
- **Automatic Settings Pages:** External plugins automatically get their own settings pages under the Block Checks menu
- **Visual Integration:** Custom checks automatically show error indicators and messages in the block editor
- **Publishing Control:** Error-level checks prevent publishing, warnings allow with notification
- **Flexible Registration:** Support for multiple check types with priority control
- **Extensive Hooks:** 20+ action and filter hooks for complete customization
- **Individual Message Support:** Custom error and warning messages for each check
- **Settings Integration:** Checks can be configured through the admin interface
- **Multi-Context Support:** Works in both post editor and site editor

### Documentation

- **[Complete Developer API Documentation](docs/README.md)** - Comprehensive guide with examples for block, meta, and editor validation
- **[Block Validation Quick Start](docs/block-validation/quick-start.md)** - Fast-track guide for adding block checks
- **[Meta Validation Quick Start](docs/meta-validation/quick-start.md)** - Fast-track guide for adding meta field validation
- **[Editor Validation Quick Start](docs/editor-validation/quick-start.md)** - Fast-track guide for editor-level validation
- **[External Plugin Integration](docs/integration/external-plugins.md)** - Guide for integrating with external plugins
- **[API Reference](docs/reference/api.md)** - Complete API reference with all available functions and hooks
- **[Working Example Plugin](https://github.com/troychaplin/block-check-integration-example)** - Complete working example demonstrating integration with custom blocks

## Installation

1. Upload the plugin files to `/wp-content/plugins/block-accessibility-checks/`
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Navigate to **Block Checks → Core Block Checks** to configure options
4. Start editing content in the Gutenberg editor - accessibility checks will run automatically

## Configuration

### Core Block Settings

The plugin provides granular control over accessibility checks for each core block type. Navigate to **Block Checks → Core Block Checks** in your WordPress admin to configure:

- **Button Block:** Configure text and link validation requirements (error/warning/disabled)
- **Image Block:** Set alt text requirements and validation rules (length, patterns, caption duplication)
- **Table Block:** Control header and caption requirements
- **Heading Block:** Select which heading levels to restrict in the editor (H1, H5, H6 can be disabled)

### Post Meta Settings

Configure validation for required post meta fields at **Block Checks → Meta Field Checks**:

- Enable or disable validation for each registered meta field
- Set validation level (error/warning/disabled) per field
- Configure per post type if meta field supports multiple post types

### External Plugin Integration

External plugins with custom blocks automatically get their own settings page under **Block Checks** menu:

- Automatically detected when blocks are registered
- Individual settings page per external plugin
- Configure validation levels (error/warning/disabled) for each check
- Settings stored separately from core block settings

### Site Editor Settings

Site editor has separate settings accessible at **Block Checks → Site Editor Checks**:

- Configure checks specifically for template and template part editing
- Independent from post editor settings
- Allows different validation rules for site-level vs post-level content

## How It Works

### Visual Feedback System

When the plugin detects accessibility issues, it provides immediate visual feedback:

- **Error Icons:** Blocks with critical errors display a red accessibility icon indicator
- **Warning Icons:** Blocks with warnings display a yellow accessibility icon indicator
- **Inspector Panel Messages:** Detailed error messages appear in the block settings sidebar, grouped by severity
- **Publishing Prevention:** Posts cannot be published until all critical errors are resolved
- **Warning Indicators:** Non-critical issues show warnings but allow publishing

### Real-time Validation

The plugin validates blocks as you type and edit:

- **Immediate Feedback:** See validation results instantly as you modify block content
- **Context-aware Checks:** Different validation rules apply based on block type and attributes
- **Smart Caching:** Optimized performance prevents validation from slowing down the editor
- **Grouped Messages:** Error and warning messages are organized for better readability

## Requirements

- WordPress 6.7 or higher
- PHP 7.0 or higher
- Gutenberg block editor (classic editor not supported)

## Getting Involved

If you would like to get involved and help make this plugin better that would be awesome! We all win with more accessible content.

### Get Started

To get started do the following:

- Fork this repo
- Create a branch off of `main`
- Open a terminal window and clone your fork
- Using a terminal run the following inside the forked repo
    - `npm -g i @wordpress/env` -- installs wp-env if you don't already have it
    - `npm install` -- installs dependencies for this project

### Start Developing

This repo uses [@wordpress/env](https://github.com/WordPress/gutenberg/tree/HEAD/packages/env#readme) that setups up a local WordPress environment using Docker.

- Make sure `Docker Desktop` is running
- Start WordPress: `wp-env start`

#### Other Commands

- Stop WordPress: `wp-env stop`
- Start watch task: `npm run start`
- Build assets: `npm run build`

## Finishing a Branch

When you are done developing a feature or a fix:

- Create a PR from your branch into the primary repo
- Fill out relevant info in as much detail as possible in the PR template

### Local Site Details

- http://localhost:8888
- User: `admin`
- Password: `password`

**Important:** when you're done working don't forget to stop the WordPress docker environment by running `wp-env stop`

## Contributing Guidelines

When you are done developing a feature or fix:

1. Ensure your code follows WordPress coding standards
2. Run `npm run build` to build production assets
3. Test with both core WordPress blocks and custom blocks
4. Create a PR from your branch into the primary repo
5. Fill out relevant info in as much detail as possible in the PR template

## Support & Issues

For bug reports, feature requests, or questions:

1. Check the [Developer API Documentation](docs/developer-api.md) for integration help
2. Search existing GitHub issues before creating new ones
3. Provide detailed reproduction steps for bugs
4. Include WordPress version, PHP version, and block details

## License

This project is licensed under the GPL v2 or later - see the [LICENSE](LICENSE) file for details.

## Credits

Developed by the Block Accessibility Checks team with contributions from the WordPress accessibility community.

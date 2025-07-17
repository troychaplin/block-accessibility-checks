# Block Accessibility Checks

Block Accessibility Checks is a WordPress plugin that helps ensure your content meets WCAG (Web Content Accessibility Guidelines) requirements. This plugin integrates seamlessly with the Gutenberg editor to provide real-time accessibility validation for WordPress blocks, preventing users from publishing content that doesn't comply with WCAG standards.

## Features

- **Real-time Accessibility Checks:** Automatically validates block configurations as you edit content in the Gutenberg editor
- **Visual Error Indicators:** Shows clear visual feedback with red borders and error messages for blocks with accessibility issues
- **Publishing Prevention:** Blocks the publishing of content that fails critical accessibility requirements
- **User-Friendly Notifications:** Provides clear and actionable feedback in the block inspector panel to help users fix issues
- **Extensible Architecture:** Comprehensive developer API with hooks and filters for adding custom accessibility checks
- **External Plugin Support:** Works seamlessly with custom blocks from third-party plugins and themes
- **Unified Validation:** PHP-JavaScript integrated system ensures consistent validation across all contexts

## Core Block Checks

The plugin includes built-in accessibility checks for WordPress core blocks:

| Block        | Accessibility Checks                                                  |
| ------------ | --------------------------------------------------------------------- |
| core/button  | Ensures buttons have both text content and proper link destinations   |
| core/heading | Configurable heading level restrictions to maintain proper hierarchy  |
| core/gallery | Applies all core/image accessibility checks to gallery images         |
| core/image   | Requires alternative text (unless marked as decorative)               |
| core/image   | Validates alt text length (warns if exceeding 125 characters)         |
| core/image   | Prevents alt text from duplicating caption text                       |
| core/table   | Requires either table headers or caption for screen reader navigation |

## Developer API & External Plugin Integration

The plugin provides a powerful API for developers to extend functionality with custom accessibility checks. The system supports both core WordPress blocks and custom blocks from external plugins.

### Quick Start Example

**PHP Registration (for settings and metadata):**

```php
add_action( 'ba11yc_register_checks', 'my_custom_checks' );

function my_custom_checks( $registry ) {
    $registry->register_check(
        'my-plugin/custom-block',
        'required_content',
        array(
            'message'     => 'This field is required for accessibility compliance',
            'type'        => 'error', // 'error', 'warning', 'settings', or 'none'
            'priority'    => 10,
            'description' => 'Content validation for accessibility compliance',
        )
    );
}
```

**JavaScript Validation Implementation:**

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
	'ba11yc.validateBlock',
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

### Key Features for Developers

- **JavaScript-only Validation:** All validation logic runs in JavaScript for real-time editor feedback
- **Visual Integration:** Custom checks automatically show error indicators and messages in the block editor
- **Publishing Control:** Error-level checks prevent publishing, warnings allow with notification
- **Flexible Registration:** Support for multiple check types with priority control
- **Extensive Hooks:** 12+ action and filter hooks for complete customization

### Documentation

- **[Complete Developer API Documentation](docs/developer-api.md)** - Comprehensive guide with examples, troubleshooting, and advanced patterns
- **[External Plugin Integration Example](docs/example-block.md)** - Step-by-step guide for integrating custom blocks

## Installation

1. Upload the plugin files to `/wp-content/plugins/block-accessibility-checks/`
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Navigate to **Settings → Block Accessibility Checks** to configure options
4. Start editing content in the Gutenberg editor - accessibility checks will run automatically

## How It Works

### Visual Feedback System

When the plugin detects accessibility issues, it provides immediate visual feedback:

- **Red Border:** Blocks with critical errors are highlighted with a red border
- **Inspector Panel Messages:** Detailed error messages appear in the block settings sidebar
- **Publishing Prevention:** Posts cannot be published until all critical errors are resolved
- **Warning Indicators:** Non-critical issues show warnings but allow publishing

### Real-time Validation

The plugin validates blocks as you type and edit:

- **Immediate Feedback:** See validation results instantly as you modify block content
- **Context-aware Checks:** Different validation rules apply based on block type and attributes
- **Smart Caching:** Optimized performance prevents validation from slowing down the editor

## Requirements

- WordPress 6.7 or higher
- PHP 7.4 or higher
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

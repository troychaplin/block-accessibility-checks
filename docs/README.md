# Block Accessibility Checks – Validation API

The Block Accessibility Checks plugin provides a comprehensive API for developers to extend and customize validation in the WordPress block editor. All validation logic is handled in JavaScript for real-time feedback, while PHP is used for configuration and registration.

## Overview

The plugin provides three main validation systems:

- **Block Attributes Validation** - Validate individual block attributes (e.g., image alt text, heading levels, button text)
- **Post Meta Validation** - Validate WordPress post meta fields with automatic UI components
- **Editor Validation** - Validate the entire editor state (block order, relationships, post type requirements)

Each system follows the same pattern: register checks in PHP, implement validation logic in JavaScript.

## Quick Start

Choose the validation type you need:

- **[Block Attributes Validation →](./block-validation/quick-start.md)** - Validate individual block attributes
- **[Post Meta Validation →](./meta-validation/quick-start.md)** - Validate post meta fields
- **[Editor Validation →](./editor-validation/quick-start.md)** - Validate editor-wide state

## Documentation Structure

### Core Documentation

- **[Architecture](./architecture.md)** - How the plugin works, system integration, and data flow
- **[Block Attributes Validation](./block-validation/quick-start.md)** - Validate individual block attributes
  - [Quick Start](./block-validation/quick-start.md)
  - [PHP Integration](./block-validation/php.md)
  - [JavaScript Integration](./block-validation/javascript.md)
- **[Post Meta Validation](./meta-validation/quick-start.md)** - Validate post meta fields
  - [Quick Start](./meta-validation/quick-start.md)
  - [PHP Integration](./meta-validation/php.md)
  - [JavaScript Integration](./meta-validation/javascript.md)
- **[Editor Validation](./editor-validation/quick-start.md)** - Validate editor-wide state
  - [Quick Start](./editor-validation/quick-start.md)
  - [PHP Integration](./editor-validation/php.md)
  - [JavaScript Integration](./editor-validation/javascript.md)

### Reference

- **[API Reference](./reference/api.md)** - Complete API documentation for all registries
- **[Hooks Reference](./reference/hooks.md)** - All PHP and JavaScript hooks

### Additional Resources

- **[External Plugin Integration](./integration/external-plugins.md)** - Integrating your plugin with Block Accessibility Checks
- **[Advanced Usage](./advanced.md)** - Advanced patterns and techniques
- **[Examples](./examples.md)** - Real-world code examples
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

## Key Features

- **Extensible Check Registration** - Register custom checks for any block type or post meta field
- **Real-Time JavaScript Validation** - Instant feedback in the block editor
- **Configurable Severity Levels** - Error, Warning, or Settings-driven (admin configurable)
- **Automatic UI Components** - Drop-in components for displaying validation feedback
- **Settings Integration** - Checks automatically appear in admin settings UI
- **Post Locking** - Prevent saving when required fields are missing
- **Multiple Issue Reporting** - Report all issues at once with prioritized feedback

## Architecture

The plugin follows a clear separation of concerns:

- **PHP** - Handles check registration, configuration, and settings integration
- **JavaScript** - Handles all validation logic and real-time feedback

See the [Architecture](./architecture.md) page for detailed information about how the systems work together.

## Getting Started

To add custom validation:

1. Choose your validation type (Block Attributes, Post Meta, or Editor)
2. Register your check in PHP (see the Quick Start guide for your chosen type)
3. Implement validation logic in JavaScript
4. Enqueue your JavaScript validation script in the block editor

## Contributing & Support

- Contributions, issues, and feature requests are welcome!
- For help, see [Troubleshooting](./troubleshooting.md) or open an issue.

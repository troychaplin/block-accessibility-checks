# Block Accessibility Checks – Validation API

The Block Accessibility Checks plugin provides a comprehensive API for developers to extend and customize accessibility validation in the WordPress block editor. All validation logic is handled in JavaScript for real-time feedback, while PHP is used for configuration and registration.

## Overview

- **Purpose:** Help developers add, configure, and validate accessibility checks for custom and core blocks.
- **Architecture:** PHP handles check registration and configuration; JavaScript handles validation logic and real-time feedback.
- **Audience:** WordPress plugin and block developers, site administrators.

## Key Features

- Extensible check registration (PHP + JS)
- Real-time JavaScript validation
- Configurable severity levels (Error, Warning, Disabled)
- Dedicated settings pages for external plugins
- Comprehensive API and hooks for advanced integration
- Multiple issue reporting and visual feedback

## Documentation Table of Contents

- [Validation API Features](./features.md)
- [Quick Start Guide](./quick-start.md)
- [API Reference](./api-reference.md)
- [Hooks Reference](./hooks.md)
- [JavaScript Integration](./js-integration.md)
- [PHP Integration](./php-integration.md)
- [External Plugin Integration](./external-integration.md)
- [Advanced Usage](./advanced.md)
- [Troubleshooting](./troubleshooting.md)
- [Examples](./examples.md)

## Getting Started

To add custom accessibility checks:
1. Register your check in PHP (see [Quick Start Guide](./quick-start.md)).
2. Implement validation logic in JavaScript.
3. Enqueue your validation script in the block editor.

## Contributing & Support

- Contributions, issues, and feature requests are welcome!
- For help, see [Troubleshooting](./troubleshooting.md) or open an issue.

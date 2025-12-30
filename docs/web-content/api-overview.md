# Validation API Overview

Welcome to the **Block Accessibility Checks Validation API** — your toolkit for building accessibility checks and validation directly into your WordPress blocks. This API enables you to register custom checks, provide real-time feedback to editors, and enforce consistent accessibility standards across your content.

## How It Works

The Block Accessibility Checks plugin uses a hybrid architecture that combines PHP and JavaScript:

- **PHP** handles registration and configuration, defining check metadata and exposing options to the block editor
- **JavaScript** executes validation logic in real-time, providing instant feedback as users edit content

When users edit blocks, registered checks run automatically in the editor. The system displays contextual messages or prevents publication when critical issues exist, helping maintain accessibility standards without requiring deep technical knowledge from content creators.

## Three Validation Types

The Validation API provides three distinct approaches for validating WordPress content:

### 1. Block Attributes Validation

Validate data stored directly in block attributes, such as titles, image URLs, text content, or custom settings. This is the most common validation type.

**Use this when:**
- Validating content entered in block fields
- Checking required attributes
- Ensuring attribute values meet specific criteria
- Validating relationships between multiple attributes

**Learn more:** [Block Attributes Quick Start Guide](block-attributes.md)

### 2. Post Meta Validation

Validate data stored in WordPress post meta fields. This approach integrates with WordPress's `register_meta()` function to provide real-time validation for custom fields.

**Use this when:**
- Validating custom post meta fields
- Ensuring required metadata is present for specific post types
- Validating custom field values as editors type
- Providing accessibility checks for post-level data

**Learn more:** [Post Meta Quick Start Guide](post-meta.md)

### 3. General Editor Validation

Validate the overall state of the editor, including all blocks in a post, block patterns, or global content structure. This approach is ideal for document-level requirements.

**Use this when:**
- Validating entire content structure
- Checking relationships between multiple blocks
- Ensuring required blocks are present
- Validating block order or hierarchy
- Enforcing document-level accessibility requirements

**Learn more:** [General Editor Quick Start Guide](general-editor.md)

## Getting Started

Choose the validation type that matches your needs and follow the corresponding quick start guide:

1. **[Block Attributes Validation](block-attributes.md)** - Validate block attribute values
2. **[Post Meta Validation](post-meta.md)** - Validate custom post meta fields
3. **[General Editor Validation](general-editor.md)** - Validate overall editor state

Each guide provides complete implementation examples with working code you can adapt for your use case.

## Learn More

- **[Core Concepts](core-concepts.md)** - Understand checks, registries, severity levels, and categories
- **[Best Practices](best-practices.md)** - Common patterns, troubleshooting, and optimization tips

## API Features

### Real-Time Validation

All validation runs in real-time as users edit content. Feedback appears immediately in the editor, helping content creators fix issues as they work.

### Configurable Severity

Checks can be configured to show errors, warnings, or be disabled entirely. When using `type => 'settings'`, administrators can adjust severity levels through the WordPress admin.

### Automatic Settings Integration

External plugins automatically receive dedicated sections in the Block Accessibility Checks settings panel. Plugin names, versions, and all registered checks appear without additional configuration.

### Multiple Check Types

Combine different validation types in a single plugin. For example, validate block attributes, post meta, and editor structure all from one integration.

### i18n Support

All messages support WordPress internationalization, allowing you to translate error messages, warnings, and descriptions for multilingual sites.

## Summary

The Block Accessibility Checks Validation API provides three powerful approaches for enforcing accessibility and quality standards in WordPress content. By combining PHP registration with JavaScript validation, you can create real-time checks that guide content creators toward better, more accessible content.

Choose the validation type that fits your needs, follow the quick start guides, and start building accessible WordPress experiences today.

# JavaScript Integration: Block Accessibility Checks

This guide explains how to implement accessibility validation logic in JavaScript using the Block Accessibility Checks Validation API.

## Overview

All validation logic is handled in JavaScript for real-time feedback in the block editor. PHP is used for configuration and registration, while JavaScript determines if a block passes or fails accessibility checks.

## Implementing Validation Logic

Use the `ba11yc.validateBlock` filter to add your validation logic:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc.validateBlock',
    'my-plugin/validation',
    (isValid, blockType, attributes, checkName, rule) => {
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }
        switch (checkName) {
            case 'content_length':
                const content = attributes.content || '';
                return content.length <= 500;
            default:
                return isValid;
        }
    }
);
```

- **blockType**: The block being validated
- **attributes**: Block attributes from the editor
- **checkName**: The check being run
- **rule**: The check configuration from PHP

## Accessing Validation Rules

The PHP registry exposes check configurations to JavaScript via a global object:

```javascript
const validationRules = window.BlockAccessibilityChecks?.validationRules || {};
const myBlockRules = validationRules['my-plugin/custom-block'] || {};
```

## Advanced Patterns

- Handle multiple checks in one filter
- Use custom result objects for advanced feedback
- Integrate with other block editor hooks


## Example: Multiple Checks

This example demonstrates how to handle multiple accessibility checks for a single block type within one filter function. Each check is identified by its `checkName`, allowing you to centralize validation logic and easily add or modify checks for your block. This pattern is useful for blocks with several fields that require different validation rules.

```javascript
addFilter(
    'ba11yc.validateBlock',
    'my-plugin/validation',
    (isValid, blockType, attributes, checkName) => {
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }
        switch (checkName) {
            case 'required_field':
                return !!(attributes.requiredField && attributes.requiredField.trim());
            case 'content_length':
                return (attributes.content || '').length <= 500;
            default:
                return isValid;
        }
    }
);
```

## See Also
- [Quick Start Guide](./quick-start.md)
- [API Reference](./api-reference.md)
- [PHP Integration](./php-integration.md)

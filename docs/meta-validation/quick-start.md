# Post Meta Validation - Quick Start

This guide provides a fast path for developers to add validation to WordPress post meta fields.

## Overview

Post meta validation allows you to validate WordPress post meta fields with the same error/warning system used for block validation. The system provides automatic UI components and integrates with WordPress's built-in validation system.

## Quick Start

Here's the simplest way to add validation to a post meta field:

```php
add_action( 'init', function() {
    // Check if Validator class is available (plugin may be deactivated)
    $validator_class = '\BlockAccessibility\Meta\Validator';
    $validator_available = class_exists( $validator_class );

    register_post_meta( 'band', 'band_origin', [
        'single'            => true,
        'type'              => 'string',
        'show_in_rest'      => true,
        'sanitize_callback' => 'sanitize_text_field',
        'validate_callback' => $validator_available
            ? call_user_func(
                array( $validator_class, 'required' ),
                'band',
                'band_origin',
                [
                    'error_msg' => __( 'City of Origin is required.', 'my-plugin' ),
                    'type'      => 'settings',
                ]
            )
            : null,
    ]);
});
```

**Note:** The conditional check ensures your plugin continues to work even if the Block Accessibility Checks plugin is deactivated.

That's it! The `Validator::required()` method handles:
- ✅ Registering the validation check
- ✅ Integrating with settings UI
- ✅ Server-side validation
- ✅ Client-side validation sync

## Using UI Components

The plugin provides wrapper components to automatically display validation errors and warnings:

### MetaField Component

Wrap any WordPress component with `MetaField`:

```javascript
import { TextControl } from '@wordpress/components';
const { MetaField } = window.BlockAccessibilityChecks || {};

<MetaField metaKey="band_origin">
    <TextControl
        label="City of Origin"
        value={meta.band_origin || ''}
        onChange={value => editPost({ meta: { band_origin: value } })}
    />
</MetaField>
```

### ValidatedToolsPanelItem Component

Replace `ToolsPanelItem` with `ValidatedToolsPanelItem`:

```javascript
const { ValidatedToolsPanelItem } = window.BlockAccessibilityChecks || {};

<ValidatedToolsPanelItem
    metaKey="band_origin"
    hasValue={() => meta.band_origin !== ''}
    label="City of Origin"
    onDeselect={() => updateMeta('band_origin', '')}
>
    <TextControl
        label="City of Origin"
        value={meta.band_origin || ''}
        onChange={value => updateMeta('band_origin', value)}
    />
</ValidatedToolsPanelItem>
```

## Next Steps

- **[PHP Integration →](./php.md)** - Detailed PHP registration guide
- **[JavaScript Integration →](./javascript.md)** - Detailed JavaScript validation and UI components
- **[API Reference →](../reference/api.md)** - Complete API documentation
- **[Hooks Reference →](../reference/hooks.md)** - All available hooks


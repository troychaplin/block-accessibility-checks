# Post Meta Validation - Quick Start

This guide provides a fast path for developers to add validation to WordPress post meta fields.

## Overview

Post meta validation allows you to validate WordPress post meta fields with the same error/warning system used for block validation. The system integrates with WordPress's built-in validation system and provides real-time feedback in the block editor.

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
                    'namespace' => 'my-plugin',
                    'error_msg' => __( 'City of Origin is required.', 'my-plugin' ),
                    'level'     => 'error',
                ]
            )
            : null,
    ]);
});
```

**Note:** The conditional check ensures your plugin continues to work even if the Block Accessibility Checks plugin is deactivated.

That's it! The `Validator::required()` method handles:
- Registering the validation check
- Integrating with the DataViews settings table
- Server-side validation
- Client-side validation sync

## Using the `useMetaField` Hook

The plugin exports a `useMetaField` hook for integrating validation state into your meta fields. Import it from the plugin's entry point:

```javascript
import { useMetaField } from '@block-accessibility-checks/editor';

const BandOriginField = () => {
    const { meta, updateMeta, helpText, hasError } = useMetaField('band_origin');

    return (
        <TextControl
            label="City of Origin"
            value={meta.band_origin || ''}
            onChange={value => updateMeta('band_origin', value)}
            help={helpText}
            className={hasError ? 'has-error' : ''}
        />
    );
};
```

**Note:** If the Block Accessibility Checks plugin is not active, the hook falls back gracefully and validation state is not applied.

## Next Steps

- **[PHP Integration →](./php.md)** - Detailed PHP registration guide
- **[JavaScript Integration →](./javascript.md)** - Detailed JavaScript validation guide
- **[API Reference →](../reference/api.md)** - Complete API documentation
- **[Hooks Reference →](../reference/hooks.md)** - All available hooks

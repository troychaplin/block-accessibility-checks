# Core Concepts

Understanding these key concepts will help you work effectively with the Validation API.

## Checks

Individual validation rules that test block content, post meta, or editor state. Each check consists of:

- **Unique identifier** - A name that identifies the check (e.g., `'title_required'`)
- **Configuration** - Error messages, warnings, descriptions, and behavior settings
- **Validation logic** - JavaScript function that performs the actual validation

## Registry Types

The central system that stores all registered checks. Different registries exist for different validation types:

### Block Checks Registry

For block attribute validation. Accessed via the `ba11yc_ready` action hook.

```php
add_action( 'ba11yc_ready', 'my_plugin_register_checks' );

function my_plugin_register_checks( $registry ) {
    $registry->register_block_check( 'block-type', 'check-name', $config );
}
```

### Meta Validator

For post meta validation. Integrated directly with WordPress's `register_meta()` function.

```php
register_meta(
    'post',
    'meta_key',
    array(
        'validate_callback' => call_user_func(
            array( '\BlockAccessibility\Meta\Validator', 'required' ),
            'post_type',
            'meta_key',
            $config
        ),
    )
);
```

### Editor Checks Registry

For general editor validation. Accessed via the `ba11yc_editor_checks_ready` action hook.

```php
add_action( 'ba11yc_editor_checks_ready', 'my_plugin_register_editor_checks' );

function my_plugin_register_editor_checks( $registry ) {
    $registry->register_editor_check( 'post-type', 'check-name', $config );
}
```

## Severity Levels

Control how validation failures are handled:

### Error
Blocks publication when validation fails. Use for critical accessibility issues.

```php
'type' => 'error'
```

### Warning
Shows a warning but allows publication. Use for recommendations.

```php
'type' => 'warning'
```

### Settings (Recommended)
Allows administrators to choose the severity level through WordPress admin.

```php
'type' => 'settings'
```

Administrators can choose between Error, Warning, or Disabled.

### Disabled
Check is registered but not active.

```php
'type' => 'none'
```

## Categories

Block checks are organized into two categories. Categories help administrators understand a check's purpose.

**Note:** Only block checks use categories. Meta and editor checks don't have categories.

### Accessibility
WCAG compliance and accessibility requirements.

```php
'category' => 'accessibility'
```

Examples: Alt text on images, heading hierarchy, link text requirements, color contrast.

### Validation
Content quality and consistency rules.

```php
'category' => 'validation'
```

Examples: Required fields, content length limits, format requirements, business rules.

## Plugin Integration

External plugins that register checks automatically appear in **Settings > Block Accessibility Checks**. No additional configuration needed.

The settings panel automatically displays:
- Plugin name and version
- All registered checks grouped by validation type
- Severity controls for checks using `type => 'settings'`
- Check descriptions

Plugin information is detected from your plugin's header and file path.

## Configuration Options

All check registrations accept a configuration array with these options:

### Required Options

```php
array(
    'error_msg'   => __( 'Error message shown on failure', 'my-plugin' ),
    'warning_msg' => __( 'Warning message for warning severity', 'my-plugin' ),
    'description' => __( 'Help text explaining the check', 'my-plugin' ),
    'type'        => 'settings', // 'error', 'warning', 'settings', or 'none'
)
```

### Optional: Priority

Controls execution order (lower = earlier). Available for block and editor checks.

```php
'priority' => 10 // Default
```

Use lower priorities (5) for critical checks that should fail fast. Use higher priorities (20) for expensive operations.

### Optional: Category

Only for block checks. Organizes checks in the settings panel.

```php
'category' => 'accessibility' // or 'validation'
```

## JavaScript Filters

Each validation type has a corresponding JavaScript filter:

| Validation Type | Filter Hook | Parameters |
|----------------|-------------|------------|
| Block Attributes | `ba11yc_validate_block` | `(isValid, blockType, attributes, checkName, block)` |
| Post Meta | `ba11yc_validate_meta` | `(isValid, value, postType, metaKey, checkName)` |
| General Editor | `ba11yc_validate_editor` | `(isValid, blocks, postType, checkName)` |

See the quick start guides for detailed implementation examples.

## Next Steps

Now that you understand the core concepts, explore:

- **[Block Attributes Validation](block-attributes.md)** - Validate block attribute values
- **[Post Meta Validation](post-meta.md)** - Validate custom post meta fields
- **[General Editor Validation](general-editor.md)** - Validate overall editor state
- **[Best Practices](best-practices.md)** - Common patterns and troubleshooting

# Example Plugins & Code Snippets: Block Accessibility Checks

This guide provides example plugin structures and code snippets to help developers integrate with the Block Accessibility Checks developer API.

## Example Plugin Structure

```
my-custom-block-plugin/
├── my-custom-block-plugin.php
├── includes/
│   └── accessibility-integration.php
├── src/
│   └── accessibility-checks.js
└── build/
    └── accessibility-checks.js
```

## Example: PHP Registration

```php
add_action('ba11yc_ready', function($registry) {
    $registry->register_check('my-plugin/card-block', 'card_title_required', [
        'error_msg'   => __('Card title is required.', 'my-plugin'),
        'type'        => 'error',
    ]);
});
```

## Example: JavaScript Validation

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc.validateBlock',
    'my-plugin/card-block-validation',
    (isValid, blockType, attributes, checkName) => {
        if (blockType !== 'my-plugin/card-block') {
            return isValid;
        }
        if (checkName === 'card_title_required') {
            return !!(attributes.title && attributes.title.trim());
        }
        return isValid;
    }
);
```

## Example: Asset Enqueuing

```php
function my_plugin_enqueue_accessibility_assets() {
    wp_enqueue_script(
        'my-plugin-accessibility-checks',
        plugins_url('build/accessibility-checks.js', __FILE__),
        array('wp-hooks', 'wp-i18n', 'block-accessibility-script'),
        '1.0.0',
        true
    );
}
add_action('enqueue_block_editor_assets', 'my_plugin_enqueue_accessibility_assets');
```

## Example: Conditional Registration

```php
add_action('ba11yc_register_checks', function($registry) {
    if (get_post_type() === 'product') {
        $registry->register_check('core/image', 'product_image_requirements', [
            'error_msg' => __('Product images must have descriptive alt text.', 'my-plugin'),
            'type'      => 'error',
        ]);
    }
});
```

## Example: Advanced JavaScript Validation

```javascript
addFilter(
    'ba11yc.validateBlock',
    'my-plugin/advanced-validation',
    (isValid, blockType, attributes, checkName, rule) => {
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }
        if (checkName === 'complex_validation') {
            const valid = validateComplexRule(attributes, rule);
            if (!valid) {
                return {
                    isValid: false,
                    mode: 'error',
                    message: rule.message,
                    data: { details: 'Additional context here' }
                };
            }
        }
        return isValid;
    }
);
```

## Working Example Plugin
- [Block Check Integration Example](https://github.com/troychaplin/block-check-integration-example)

## See Also
- [Quick Start Guide](./quick-start.md)
- [API Reference](./api-reference.md)
- [External Integration](./external-integration.md)

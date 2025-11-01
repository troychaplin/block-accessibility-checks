# Post Meta Validation Integration Plan

## Overview

Extend the Block Accessibility Checks plugin to support post meta validation with the same error/warning severity levels and settings integration currently available for block attributes.

## Current Architecture Summary

### Block Attribute Validation (Existing)
- **PHP:** `BlockChecksRegistry` registers checks with configuration (error_msg, warning_msg, type, category)
- **PHP → JS Bridge:** Validation rules exposed via `window.BlockAccessibilityChecks.validationRules`
- **JavaScript:** `validateBlock()` runs checks using `ba11yc.validateBlock` filter
- **JavaScript:** `BlockInvalidation` component locks posts when errors exist
- **Settings:** Checks with `type='settings'` configurable in admin UI (Error/Warning/Disabled)

### Design Goals for Post Meta
1. Reuse existing registry pattern and settings UI
2. Provide both server-side (security) and client-side (UX) validation
3. Integrate with existing post locking mechanism
4. Support error/warning severity levels
5. Allow admin configuration via settings

---

## Architecture Design

### 1. PHP: Post Meta Check Registration

**Separate Registry Class with Composition:**

Created `MetaChecksRegistry` class to handle all meta validation:

```php
// New class: Functions/MetaChecksRegistry.php
namespace BlockAccessibility;

class MetaChecksRegistry {
    private $meta_checks = array();
    
    public function register_meta_check(...) { ... }
    public function get_meta_checks(...) { ... }
    public function get_effective_meta_check_level(...) { ... }
    // ... all meta-specific methods
}
```

**Clean Separation:**

`BlockChecksRegistry` handles block validation only. `MetaChecksRegistry` handles meta validation only. No delegation, no mixing of concerns.

**Storage Structure:**
```php
$this->meta_checks = [
    'band' => [                    // post type
        'band_origin' => [         // meta key
            'required' => [        // check name
                'error_msg'   => 'City of Origin is required',
                'warning_msg' => 'City of Origin is recommended',
                'type'        => 'settings',  // or 'error', 'warning', 'none'
                'category'    => 'validation',
                'enabled'     => true,
                'priority'    => 10,
            ]
        ]
    ]
];
```

### 2. PHP: Clean Validation Callback Function

Create a clean, standalone function that handles everything:

```php
/**
 * Create a required field validator for post meta
 * 
 * This function returns a validation callback that:
 * 1. Auto-detects the post type from context
 * 2. Lazy-registers the check with the validation system
 * 3. Respects admin settings (error/warning/disabled)
 * 4. Integrates with JavaScript validation
 * 
 * Usage:
 * register_post_meta('band', 'band_origin', [
 *     'validate_callback' => ba11yc_required([
 *         'error_msg' => 'Field is required',
 *         'type' => 'settings',
 *     ]),
 * ]);
 * 
 * @param array $args Configuration arguments
 * @return callable The validation callback
 */
function ba11yc_required( array $args = [] ): callable {
    $defaults = [
        'error_msg'   => 'This field is required.',
        'warning_msg' => 'This field is recommended.',
        'type'        => 'settings',
        'category'    => 'validation',
        'check_name'  => 'required',
        'description' => '',
    ];
    
    $config = wp_parse_args( $args, $defaults );
    
    // Return the validation callback
    return function( $value, $meta_key, $object_type ) use ( $config ) {
        static $registered = [];
        
        // Auto-detect post type from current context
        $post_type = ba11yc_detect_post_type_from_context();
        
        if ( ! $post_type ) {
            return true; // Can't determine context, allow save
        }
        
        // Lazy register the check once
        $registry_key = "{$post_type}_{$meta_key}_{$config['check_name']}";
        if ( ! isset( $registered[$registry_key] ) ) {
            $registry = \BlockAccessibility\BlockChecksRegistry::get_instance();
            $registry->register_meta_check(
                $post_type,
                $meta_key,
                $config['check_name'],
                $config
            );
            $registered[$registry_key] = true;
        }
        
        // Get the effective validation level (respects admin settings)
        $registry = \BlockAccessibility\BlockChecksRegistry::get_instance();
        $level = $registry->get_effective_meta_check_level(
            $post_type,
            $meta_key,
            $config['check_name']
        );
        
        if ( $level === 'none' ) {
            return true; // Check disabled in settings
        }
        
        // Run validation through filter system
        $is_valid = apply_filters(
            'ba11yc.validateMeta',
            true,
            $value,
            $post_type,
            $meta_key,
            $config['check_name'],
            $config
        );
        
        // Default validation logic for 'required' check
        if ( $is_valid && $config['check_name'] === 'required' ) {
            $is_valid = ! empty( $value ) && trim( (string) $value ) !== '';
        }
        
        // Return error only if validation fails and level is "error"
        if ( ! $is_valid && $level === 'error' ) {
            return new \WP_Error(
                'ba11yc_validation_failed',
                $config['error_msg'],
                [ 'status' => 400 ]
            );
        }
        
        // For warnings, allow save (client-side will show warning)
        return true;
    };
}
```

### 3. PHP: Context Detection Helper

Add a helper function to detect post type from the current context:

```php
/**
 * Detect post type from current context
 * 
 * Attempts to determine the post type being edited from various sources:
 * - REST API request
 * - Admin screen
 * - Global $post
 * - Request parameters
 * 
 * @return string|false Post type or false if not detected
 */
function ba11yc_detect_post_type_from_context() {
    // Method 1: Check REST request
    if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
        $route = $_SERVER['REQUEST_URI'] ?? '';
        // Match patterns like /wp/v2/{post_type}/{id}
        if ( preg_match( '#/wp/v2/([^/]+)/(\d+)#', $route, $matches ) ) {
            $post_type = $matches[1];
            // Handle plural to singular (posts -> post, pages -> page)
            $post_type = rtrim( $post_type, 's' );
            return $post_type;
        }
    }
    
    // Method 2: Check current admin screen
    if ( function_exists( 'get_current_screen' ) ) {
        $screen = get_current_screen();
        if ( $screen && ! empty( $screen->post_type ) ) {
            return $screen->post_type;
        }
    }
    
    // Method 3: Check global $post
    global $post;
    if ( $post && ! empty( $post->post_type ) ) {
        return $post->post_type;
    }
    
    // Method 4: Check $_REQUEST parameters
    if ( ! empty( $_REQUEST['post_type'] ) ) {
        return sanitize_key( $_REQUEST['post_type'] );
    }
    
    if ( ! empty( $_REQUEST['post'] ) ) {
        $post_id = absint( $_REQUEST['post'] );
        $post_type = get_post_type( $post_id );
        if ( $post_type ) {
            return $post_type;
        }
    }
    
    return false;
}
```

### 4. PHP: Additional Validator Functions (Future)

Additional validators can follow the same pattern:

```php
/**
 * Custom validation function
 */
function ba11yc_custom( array $args ): callable {
    // Requires 'validator' callback in $args
    // Same lazy registration pattern
}

/**
 * Pattern/regex validation
 */
function ba11yc_pattern( array $args ): callable {
    // Requires 'pattern' in $args
    // Same lazy registration pattern
}

/**
 * Numeric range validation
 */
function ba11yc_range( array $args ): callable {
    // Requires 'min' and 'max' in $args
    // Same lazy registration pattern
}
```

### 5. PHP: Expose Meta Checks to JavaScript

Modify `ScriptsStyles.php` to expose meta checks:

```php
wp_localize_script(
    'block-accessibility-script',
    'BlockAccessibilityChecks',
    array(
        'validationRules' => $this->format_checks_for_js(),
        'metaValidationRules' => $this->format_meta_checks_for_js(), // NEW
        'ajaxurl' => admin_url( 'admin-ajax.php' ),
        // ... existing data
    )
);
```

### 6. JavaScript: Meta Validation Hook System

Create a new validation system for post meta parallel to block validation:

```javascript
// src/scripts/meta-validation/validateMeta.js

/**
 * Get meta check configuration from PHP
 */
const metaValidationRules = window.BlockAccessibilityChecks?.metaValidationRules || {};

/**
 * Validate post meta value
 *
 * @param {string} postType    - Current post type
 * @param {string} metaKey     - Meta key being validated
 * @param {*}      value       - Meta value
 * @param {string} checkName   - Check name
 * @return {boolean} True if valid
 */
export function validateMetaField( postType, metaKey, value, checkName ) {
    const postTypeRules = metaValidationRules[postType];
    if ( ! postTypeRules ) {
        return true;
    }
    
    const metaRules = postTypeRules[metaKey];
    if ( ! metaRules ) {
        return true;
    }
    
    const rule = metaRules[checkName];
    if ( ! rule || ! rule.enabled ) {
        return true;
    }
    
    // Allow plugins to implement validation logic
    const isValid = wp.hooks.applyFilters(
        'ba11yc.validateMeta',
        true,
        value,
        postType,
        metaKey,
        checkName,
        rule
    );
    
    return isValid;
}

/**
 * Validate all checks for a meta field
 *
 * @param {string} postType - Current post type
 * @param {string} metaKey  - Meta key
 * @param {*}      value    - Meta value
 * @return {Object} Validation result with issues
 */
export function validateAllMetaChecks( postType, metaKey, value ) {
    const postTypeRules = metaValidationRules[postType] || {};
    const metaRules = postTypeRules[metaKey] || {};
    const issues = [];
    
    for ( const [checkName, rule] of Object.entries( metaRules ) ) {
        if ( ! rule.enabled ) {
            continue;
        }
        
        const isValid = validateMetaField( postType, metaKey, value, checkName );
        
        if ( ! isValid ) {
            issues.push({
                metaKey,
                checkName,
                type: rule.type,
                category: rule.category || 'validation',
                error_msg: rule.error_msg,
                warning_msg: rule.warning_msg,
                priority: rule.type === 'error' ? 1 : 2,
            });
        }
    }
    
    return {
        isValid: issues.length === 0,
        issues,
        hasErrors: issues.some( issue => issue.type === 'error' ),
        hasWarnings: issues.some( issue => issue.type === 'warning' ),
    };
}
```

### 7. JavaScript: Meta Validation Component

Create a component to track all post meta validation:

```javascript
// src/scripts/meta-validation/getInvalidMeta.js

import { useSelect } from '@wordpress/data';
import { validateAllMetaChecks } from './validateMeta';

/**
 * Get all invalid meta fields for current post
 *
 * @return {Array} Array of invalid meta validation results
 */
export function GetInvalidMeta() {
    const { postType, meta } = useSelect( ( select ) => {
        const editor = select( 'core/editor' );
        return {
            postType: editor.getCurrentPostType(),
            meta: editor.getEditedPostAttribute( 'meta' ),
        };
    }, [] );
    
    const metaValidationRules = window.BlockAccessibilityChecks?.metaValidationRules || {};
    const postTypeRules = metaValidationRules[postType] || {};
    
    const invalidMeta = [];
    
    // Validate each meta field that has checks registered
    for ( const metaKey of Object.keys( postTypeRules ) ) {
        const value = meta?.[metaKey];
        const result = validateAllMetaChecks( postType, metaKey, value );
        
        if ( ! result.isValid ) {
            invalidMeta.push({
                ...result,
                metaKey,
            });
        }
    }
    
    return invalidMeta;
}
```

### 8. JavaScript: Integrate with Post Locking

Modify `blockInvalidation.js` to include meta validation:

```javascript
import { GetInvalidBlocks } from './getInvalidBlocks';
import { GetInvalidMeta } from '../meta-validation/getInvalidMeta';

export function BlockInvalidation() {
    const isPostEditor = wp.data && wp.data.select && wp.data.select('core/editor');
    
    const invalidBlocks = GetInvalidBlocks();
    const invalidMeta = GetInvalidMeta(); // NEW
    
    const {
        lockPostSaving,
        unlockPostSaving,
        // ... other dispatchers
    } = useDispatch('core/editor');
    
    useEffect(() => {
        if (!isPostEditor) {
            return;
        }
        
        const hasBlockErrors = invalidBlocks.some(block => block.mode === 'error');
        const hasMetaErrors = invalidMeta.some(meta => meta.hasErrors); // NEW
        
        if (hasBlockErrors || hasMetaErrors) {
            lockPostSaving();
            lockPostAutosaving();
            disablePublishSidebar();
        } else {
            unlockPostSaving();
            unlockPostAutosaving();
            enablePublishSidebar();
        }
    }, [
        invalidBlocks,
        invalidMeta, // NEW
        // ... existing dependencies
    ]);
    
    return null;
}
```

### 9. Settings Page Integration

The meta checks should appear in settings alongside block checks:

```php
// In SettingsPage.php - add new section for Post Meta Checks

public function render_meta_checks_section( $post_type ) {
    $meta_checks = $this->registry->get_meta_checks( $post_type );
    
    if ( empty( $meta_checks ) ) {
        return;
    }
    
    echo '<h3>' . esc_html__( 'Post Meta Validation', 'block-accessibility-checks' ) . '</h3>';
    
    foreach ( $meta_checks as $meta_key => $checks ) {
        $meta_label = $this->format_meta_key_label( $meta_key );
        
        echo '<h4>' . esc_html( $meta_label ) . '</h4>';
        
        foreach ( $checks as $check_name => $check ) {
            if ( $check['type'] !== 'settings' ) {
                continue; // Skip non-configurable checks
            }
            
            $field_name = "{$post_type}_{$meta_key}_{$check_name}";
            
            $this->render_check_setting(
                $field_name,
                $check['description'] ?? $check['error_msg'],
                $check
            );
        }
    }
}
```

---

## Usage Example

### Clean API - Recommended Approach

**Key Advantage:** Pass a single function to `validate_callback` - no separate registration step needed!

The `ba11yc_required()` function handles everything:
- ✅ Auto-detects post type from context
- ✅ Registers the validation check
- ✅ Integrates with settings UI
- ✅ Validates data server-side
- ✅ Syncs with JavaScript validation

```php
// In external plugin (e.g., band custom post type)

add_action( 'init', function() {
    // Register post meta with integrated validation
    // The ba11yc_required() function handles check registration automatically
    
    register_post_meta(
        'band',
        'band_origin',
        [
            'single'            => true,
            'type'              => 'string',
            'show_in_rest'      => true,
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => ba11yc_required([
                'error_msg'   => __( 'City of Origin is required.', 'my-plugin' ),
                'warning_msg' => __( 'City of Origin is recommended.', 'my-plugin' ),
                'description' => __( 'The city where the band originated', 'my-plugin' ),
                'type'        => 'settings',  // Configurable in admin (error/warning/disabled)
                'category'    => 'validation',
            ]),
        ]
    );
    
    register_post_meta(
        'band',
        'band_start_date',
        [
            'single'            => true,
            'type'              => 'string',
            'show_in_rest'      => true,
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => ba11yc_required([
                'error_msg'   => __( 'Band Start Date is required.', 'my-plugin' ),
                'warning_msg' => __( 'Band Start Date is recommended.', 'my-plugin' ),
                'type'        => 'settings',
            ]),
        ]
    );
    
    register_post_meta(
        'band',
        'band_website',
        [
            'single'            => true,
            'type'              => 'string',
            'show_in_rest'      => true,
            'sanitize_callback' => 'esc_url_raw',
            'validate_callback' => ba11yc_required([
                'error_msg' => __( 'Band website is required.', 'my-plugin' ),
                'type'      => 'warning',  // Always a warning (not configurable)
            ]),
        ]
    );
});
```

### How It Works

1. **Call `ba11yc_required()`** with post type, meta key, and config
2. **Immediate registration**: Check is registered with `MetaChecksRegistry` when function is called
3. **Returns callback**: Function returns a validation callback for WordPress
4. **Settings integration**: If `type='settings'`, appears in admin settings UI
5. **Validation**: Respects admin configuration and returns `WP_Error` for errors
6. **Client-side sync**: JavaScript validation mirrors server-side validation
7. **No duplication**: Configuration is defined once, used everywhere

### Advanced Usage

For custom validation beyond "required", use filters:

```php
// Custom validation logic
add_filter( 'ba11yc.validateMeta', function( $is_valid, $value, $post_type, $meta_key, $check_name, $config ) {
    if ( $post_type === 'band' && $meta_key === 'band_origin' && $check_name === 'required' ) {
        // Custom logic: require at least city and country
        $parts = explode( ',', $value );
        return count( $parts ) >= 2;
    }
    return $is_valid;
}, 10, 6 );
```

### JavaScript Validation Implementation

```javascript
// In external plugin's JavaScript file

import { addFilter } from '@wordpress/hooks';

// Implement validation logic
addFilter(
    'ba11yc.validateMeta',
    'my-plugin/meta-validation',
    ( isValid, value, postType, metaKey, checkName, rule ) => {
        if ( postType !== 'band' ) {
            return isValid;
        }
        
        switch ( metaKey ) {
            case 'band_origin':
                if ( checkName === 'required' ) {
                    return !! ( value && value.trim() );
                }
                break;
                
            case 'band_start_date':
                if ( checkName === 'required' ) {
                    return !! value;
                }
                break;
        }
        
        return isValid;
    }
);
```

---

## Implementation Phases

### Phase 1: Core Infrastructure ✅
1. Created `MetaChecksRegistry` class with separate concerns
2. Implemented `register_meta_check()` method
3. Implemented `get_meta_checks()` and related query methods
4. Implemented `get_effective_meta_check_level()` for settings integration
5. Added delegation methods in `BlockChecksRegistry` for backward compatibility

### Phase 2: Validation Callbacks
1. Implement `ba11yc_required()` function with lazy registration
2. Implement `ba11yc_detect_post_type_from_context()` helper
3. Add `ba11yc.validateMeta` PHP filter support

### Phase 3: JavaScript Integration
1. Create `meta-validation/` directory in `src/scripts/`
2. Implement `validateMeta.js` with validation logic
3. Implement `getInvalidMeta.js` component
4. Expose meta checks to JavaScript via localize_script

### Phase 4: Post Locking Integration
1. Modify `blockInvalidation.js` to include meta validation
2. Test post locking with meta errors/warnings
3. Ensure proper lock/unlock behavior

### Phase 5: Settings UI
1. Add meta checks section to settings page
2. Group by post type and meta key
3. Add save/update functionality
4. Test settings persistence

### Phase 6: Documentation
1. Update API reference with meta validation methods
2. Add usage examples to external integration guide
3. Create troubleshooting section for meta validation
4. Update features list

---

## Benefits

1. **Clean API:** Single function call in `validate_callback` - no repetitive code
2. **Auto-Registration:** Checks register themselves automatically on first use
3. **Context-Aware:** Auto-detects post type from REST API context
4. **Unified System:** Meta validation uses same patterns as block validation
5. **Flexible Severity:** Support for errors, warnings, and settings-driven levels
6. **Admin Control:** Settings UI allows site admins to configure validation
7. **Developer Friendly:** Simple, intuitive API for external plugins
8. **Real-time Feedback:** JavaScript validation provides immediate UX feedback
9. **Security:** PHP validation ensures data integrity at REST API level
10. **DRY Principle:** No duplication between registration and validation code

---

## Backward Compatibility

- Existing block validation system remains unchanged
- New meta validation is opt-in (must be explicitly registered)
- No breaking changes to existing API
- Falls back gracefully if meta checks not registered

---

## Future Enhancements

1. **Conditional Validation:** Validate meta only for certain post statuses
2. **Meta Dependencies:** Validate based on other meta field values
3. **Bulk Validation:** Validate multiple meta fields together
4. **Custom Validation UI:** Add visual indicators to meta fields in editor
5. **Pre-Publish Panel:** Show meta validation summary before publishing
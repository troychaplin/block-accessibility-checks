# Proposal: A Block Editor Validation API for WordPress

## Summary

This proposal introduces the concept of a **Validation API** for the WordPress block editor -- a standardized, declarative framework for registering, executing, and displaying content validation checks in real time. The API would enable theme and plugin developers to define validation rules for block attributes, post meta fields, and editor-wide document structure, providing immediate feedback to content creators and optionally preventing publication when critical issues are unresolved.

The [Block Accessibility Checks](https://github.com/troychaplin/block-accessibility-checks) plugin serves as a working reference implementation of this concept. It has been available on [WordPress.org](https://wordpress.org/plugins/block-accessibility-checks/) since 2023 and demonstrates the full lifecycle of a validation system built entirely on existing WordPress and Gutenberg APIs. The plugin's [Validation API documentation](https://blockaccessibilitychecks.com/validation-api/) provides detailed examples and patterns.

**This proposal advocates for the Validation API framework only** -- not the specific accessibility checks, settings UI, or other features provided by the Block Accessibility Checks plugin. Those remain the domain of plugins. What belongs in core is the underlying system that makes declarative content validation possible for the entire ecosystem.

## The Problem

WordPress provides robust tools for creating and editing content in the block editor, but it lacks a unified system for validating that content against quality, accessibility, or editorial standards before publication. Today, developers who want to validate block content must independently solve the same set of problems:

1. **No declarative check registration** -- There is no standard way to declare "this block attribute must meet these criteria" or "this post must contain these elements." Every plugin builds its own registration system.

2. **No real-time validation pattern** -- Providing instant feedback as users edit requires understanding store subscriptions, React rendering, and performance optimization. Each plugin re-invents this.

3. **No standardized validation UI** -- There are no dedicated slots, components, or patterns for displaying validation results in the editor. Plugins create ad-hoc UI using `editor.BlockEdit` HOCs, custom sidebars, or `PluginPrePublishPanel`.

4. **No severity model** -- The existing `lockPostSaving` mechanism is binary (locked or not). There is no built-in concept of warnings vs. errors, configurable severity levels, or admin-controlled thresholds.

5. **Fragmented primitives** -- The building blocks exist (`@wordpress/hooks`, `lockPostSaving`, `editor.BlockEdit`, `PluginPrePublishPanel`, `editor.preSavePost`), but they are disconnected. Every plugin must assemble them into a validation system from scratch.

The result is that most plugins simply don't validate content at all, and those that do create inconsistent, incompatible experiences.

## Existing Primitives in Core

A Validation API would not introduce new low-level mechanisms. Instead, it would provide a cohesive layer on top of existing, stable WordPress and Gutenberg APIs:

| Primitive | Current Use | Role in a Validation API |
|---|---|---|
| [`@wordpress/hooks`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-hooks/) | General-purpose JS event system | Execute validation logic via filters |
| [`lockPostSaving`](https://developer.wordpress.org/block-editor/reference-guides/data/data-core-editor/) | Binary save prevention | Enforce error-level validation failures |
| [`editor.BlockEdit`](https://developer.wordpress.org/block-editor/reference-guides/filters/block-filters/) | Wrap block edit components via HOC | Display per-block validation indicators |
| [`PluginPrePublishPanel`](https://developer.wordpress.org/block-editor/reference-guides/slotfills/plugin-pre-publish-panel/) | Inject content into pre-publish panel | Show validation summary before publishing |
| [`PluginSidebar`](https://developer.wordpress.org/block-editor/reference-guides/slotfills/plugin-sidebar/) | Custom editor sidebars | Consolidated validation results panel |
| [`editor.preSavePost`](https://github.com/WordPress/gutenberg/pull/64198) | Async save interception (WP 6.7+) | Final validation gate before saving |
| [`register_post_meta`](https://developer.wordpress.org/reference/functions/register_post_meta/) | Meta field registration with REST validation | Server-side meta validation via `validate_callback` |
| `wp_localize_script` / `wp_add_inline_script` | Pass PHP data to JS | Export validation configuration to the editor |

These are all stable, public APIs. A Validation API would standardize how they are used together for content validation.

## Prior Art and Related Discussions

Several Gutenberg issues and PRs have explored pieces of this problem space over the years, but none have proposed a unified validation framework:

- **[#4063 - Provide an API to validate block input](https://github.com/WordPress/gutenberg/issues/4063)** -- One of the earliest requests (2017) for server-side block attribute validation. Endorsed by core contributors but never implemented as a framework.
- **[#14954 - Server-side block attribute validation](https://github.com/WordPress/gutenberg/issues/14954)** -- Gravity Forms requested capability-based attribute restriction (2019). Resolution was to use `lockPostSaving` as a workaround, highlighting the gap.
- **[#13413 - Third-party save validation](https://github.com/WordPress/gutenberg/issues/13413)** -- ACF team requested validation hooks during save (2019). Led to the `editor.preSavePost` filter (stabilized in WP 6.7), which provides the save-time hook but not the declarative framework.
- **[#7020 - Pre-publish checkup extensibility](https://github.com/WordPress/gutenberg/issues/7020)** -- Led to `lockPostSaving`/`unlockPostSaving` (PR [#10649](https://github.com/WordPress/gutenberg/pull/10649)), but without error messaging or severity levels.
- **[#21703 - Classification of block validation types](https://github.com/WordPress/gutenberg/issues/21703)** -- Proposes a classification system for block validation outcomes, though focused on markup validation rather than content quality.
- **[#71500 - Field API: Validation](https://github.com/WordPress/gutenberg/issues/71500)** -- The DataViews/DataForm Field API introduced validation rules (required, pattern, custom validators). While scoped to the admin Data API, it demonstrates the value of a declarative validation model.

The common thread is that developers have repeatedly asked for a standardized way to validate block editor content. The primitives exist, but the framework does not.

## Proposed Solution: A Validation API

### Design Principles

1. **PHP for registration, JavaScript for validation** -- Follow the existing block API pattern where PHP declares configuration and JavaScript handles runtime behavior.
2. **Declarative check registration** -- Developers register checks with metadata (messages, severity, descriptions). The framework handles execution, UI, and save-locking.
3. **Three validation scopes** -- Block attributes, post meta fields, and editor-wide document state each have distinct registration and execution patterns, but share a unified results model.
4. **Configurable severity** -- Checks can be hard-coded as errors or warnings, or made configurable by site administrators.
5. **Extensible via hooks** -- All validation logic runs through WordPress filters, allowing any plugin to add, modify, or override checks.

### The Three Validation Scopes

#### 1. Block Attributes Validation

Validate individual block attributes such as image alt text, heading content, button labels, or custom block fields. Checks are registered per block type.

**PHP Registration:**

```php
add_action( 'validation_api_ready', function( $registry ) {
    $registry->register_block_check(
        'core/image',
        'alt_text_required',
        array(
            'error_msg'   => __( 'Images must have alternative text for accessibility.', 'my-plugin' ),
            'warning_msg' => __( 'Alternative text is recommended for images.', 'my-plugin' ),
            'description' => __( 'Ensures images have alt text for screen reader users.', 'my-plugin' ),
            'type'        => 'settings', // 'error', 'warning', 'settings', or 'none'
            'category'    => 'accessibility',
        )
    );
});
```

**JavaScript Validation:**

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'validation_api_validate_block',
    'my-plugin/image-alt-text',
    ( isValid, blockType, attributes, checkName ) => {
        if ( blockType !== 'core/image' || checkName !== 'alt_text_required' ) {
            return isValid;
        }
        // Skip if no image selected yet
        if ( ! attributes.url ) {
            return true;
        }
        return !!( attributes.alt && attributes.alt.trim() );
    }
);
```

#### 2. Post Meta Validation

Validate WordPress post meta fields, integrating with `register_post_meta()` for both client-side real-time feedback and server-side REST API validation.

**PHP Registration:**

```php
register_post_meta( 'post', 'seo_description', array(
    'single'            => true,
    'type'              => 'string',
    'show_in_rest'      => true,
    'sanitize_callback' => 'sanitize_text_field',
    'validate_callback' => ValidationAPI::required( 'post', 'seo_description', array(
        'error_msg' => __( 'SEO description is required.', 'my-plugin' ),
        'type'      => 'settings',
    )),
));
```

**JavaScript Validation:**

```javascript
addFilter(
    'validation_api_validate_meta',
    'my-plugin/seo-description',
    ( isValid, value, postType, metaKey, checkName ) => {
        if ( postType !== 'post' || metaKey !== 'seo_description' ) {
            return isValid;
        }
        return !!( value && value.trim() );
    }
);
```

#### 3. Editor Validation

Validate the overall editor state: block order, document structure, required elements, and cross-block relationships. Checks are registered per post type.

**PHP Registration:**

```php
add_action( 'validation_api_editor_ready', function( $registry ) {
    $registry->register_editor_check(
        'post',
        'first_block_heading',
        array(
            'error_msg'   => __( 'Posts must start with a heading block.', 'my-plugin' ),
            'type'        => 'settings',
            'description' => __( 'Ensures content begins with a heading for accessibility.', 'my-plugin' ),
        )
    );
});
```

**JavaScript Validation:**

```javascript
addFilter(
    'validation_api_validate_editor',
    'my-plugin/first-block-heading',
    ( isValid, blocks, postType, checkName ) => {
        if ( checkName !== 'first_block_heading' ) {
            return isValid;
        }
        if ( blocks.length === 0 ) {
            return true;
        }
        return blocks[ 0 ].name === 'core/heading';
    }
);
```

### Severity Model

| Level | Behavior | Use Case |
|---|---|---|
| `error` | Prevents saving/publishing | Critical accessibility or data integrity issues |
| `warning` | Shows feedback, allows saving | Recommendations and best practices |
| `settings` | Admin-configurable (error, warning, or disabled) | Checks that vary by site policy |
| `none` | Check is disabled | Temporarily or permanently inactive checks |

When any check fails at the `error` level, the API uses `lockPostSaving` to prevent publication and provides clear messaging about what needs to be resolved.

### Validation Results UI

The framework would provide standardized UI patterns rather than requiring each plugin to build its own:

- **Block-level indicators** -- Visual markers on blocks with validation issues, showing severity and details on interaction
- **Consolidated sidebar** -- A unified panel listing all validation issues across blocks, meta, and editor checks
- **Header summary** -- A toolbar indicator showing the total count of issues

These patterns are already implemented and tested in the reference implementation.

## Reference Implementation

The [Block Accessibility Checks](https://github.com/troychaplin/block-accessibility-checks) plugin demonstrates this Validation API in production. Key implementation details:

### Architecture

- **PHP Registries** -- Singleton pattern registries ([`BlockChecksRegistry`](https://github.com/troychaplin/block-accessibility-checks/blob/main/includes/Block/Registry.php), [`MetaChecksRegistry`](https://github.com/troychaplin/block-accessibility-checks/blob/main/includes/Meta/Registry.php), [`EditorChecksRegistry`](https://github.com/troychaplin/block-accessibility-checks/blob/main/includes/Editor/Registry.php)) manage check registration, configuration, and data export.
- **JavaScript Validation** -- Validation logic runs entirely in JavaScript via WordPress filters ([`validateBlock.js`](https://github.com/troychaplin/block-accessibility-checks/blob/main/src/editor/validation/blocks/validateBlock.js), [`validateMeta.js`](https://github.com/troychaplin/block-accessibility-checks/blob/main/src/editor/validation/meta/validateMeta.js), [`validateEditor.js`](https://github.com/troychaplin/block-accessibility-checks/blob/main/src/editor/validation/editor/validateEditor.js)).
- **Configuration Export** -- PHP configuration is passed to JavaScript via `wp_localize_script`, creating a global `window.BlockAccessibilityChecks` object.
- **Post Locking** -- The [`ValidationAPI`](https://github.com/troychaplin/block-accessibility-checks/blob/main/src/editor/validation/ValidationAPI.js) component coordinates validation results and manages `lockPostSaving`/`unlockPostSaving`.

### Video Demo

A live walkthrough of the plugin's validation system in action is available from a Pantheon live stream:

- [Block Accessibility Checks Demo (Pantheon Live)](https://www.youtube.com/watch?v=mLsC2tDcdL8)

### External Plugin Integration

The API is already extensible. External plugins register checks using action hooks, and validation logic is added via JavaScript filters. The reference implementation automatically creates dedicated settings pages for external plugins that register checks, grouping them by plugin name.

- [External Plugin Integration Guide](https://blockaccessibilitychecks.com/validation-api/block-validation/)
- [Example Integration Plugin](https://github.com/troychaplin/block-check-integration-example)

### Documentation

Comprehensive developer documentation is available at:

- [Validation API Overview](https://blockaccessibilitychecks.com/validation-api/)
- [Core Concepts](https://blockaccessibilitychecks.com/validation-api/core-concepts/)
- [Block Attributes Validation](https://blockaccessibilitychecks.com/validation-api/block-validation/)
- [Post Meta Validation](https://blockaccessibilitychecks.com/validation-api/post-meta-validation/)
- [Editor Validation](https://blockaccessibilitychecks.com/validation-api/editor-validation/)
- [Best Practices](https://blockaccessibilitychecks.com/validation-api/best-practices/)

## What Would Be Included in Core

The proposal is specifically for the **Validation API framework** -- the infrastructure that enables declarative content validation. This includes:

**Included:**

- Check registration system (PHP registries for block, meta, and editor checks)
- JavaScript validation filter hooks (`validation_api_validate_block`, `validation_api_validate_meta`, `validation_api_validate_editor`)
- Validation result model (severity levels, issue reporting, standardized result objects)
- Post-locking integration (automatic `lockPostSaving` based on error-level failures)
- Standardized UI components (block indicators, validation sidebar, header summary)
- Configuration export (PHP-to-JS data flow for check definitions)
- PHP action hooks for check registration (`validation_api_ready`, `validation_api_editor_ready`)
- PHP filter hooks for check modification (`validation_api_check_args`, `validation_api_should_register_check`)

**Not included (remains in plugin territory):**

- Specific validation checks for core blocks (alt text, heading hierarchy, link text, etc.)
- Admin settings page for configuring check severity
- Any particular accessibility or content quality rules
- Opinionated defaults about what content should or should not be validated

The distinction is important: the API provides the *capability* to validate; plugins and themes provide the *rules*.

## Use Cases Enabled

A Validation API in core would enable a wide range of applications beyond accessibility:

- **Accessibility compliance** -- Plugins could enforce WCAG requirements (alt text, heading hierarchy, color contrast, link text quality)
- **Editorial standards** -- Publishers could enforce style guides (content length, required sections, brand guidelines)
- **SEO requirements** -- SEO plugins could validate meta descriptions, heading structure, and content quality
- **Legal compliance** -- Organizations could enforce required disclosures, copyright notices, or content warnings
- **Content governance** -- Enterprise teams could enforce content templates, required fields, and approval workflows
- **Educational platforms** -- Course builders could validate lesson structure, required elements, and content formatting
- **E-commerce** -- Product blocks could enforce required attributes (price, description, images with alt text)

## Benefits to the WordPress Ecosystem

1. **Consistent UX** -- All validation, regardless of source, would use the same UI patterns and severity model. Users learn one system.
2. **Reduced plugin conflicts** -- A standardized API prevents plugins from competing for the same UI space or conflicting with each other's save-locking.
3. **Lower barrier to entry** -- Plugin developers get validation capabilities "for free" through a simple registration API instead of building infrastructure.
4. **Accessibility by default** -- With the infrastructure in core, accessibility-focused plugins become trivial to build, encouraging an ecosystem of content quality tools.
5. **Performance optimization** -- Centralized validation can be optimized once (debouncing, memoization, efficient re-rendering) rather than every plugin solving these problems independently.

## Open Questions

1. **Data store** -- Should validation results live in a dedicated `@wordpress/data` store (e.g., `core/validation`) for better state management and cross-plugin coordination?
2. **Async validation** -- Should the filter hooks support async validation for server-side checks (e.g., link checking, content analysis)?
3. **Block.json integration** -- Could validation rules be declared in `block.json` for simple checks (e.g., `"required": true` on attributes), with JavaScript filters for complex logic?
4. **Core checks** -- Should WordPress ship with any default validation checks (e.g., image alt text), or should all checks come from plugins?

## Next Steps

1. Gather feedback from the Gutenberg team and broader WordPress community
2. Evaluate whether the API should live in Gutenberg (as a package) or in WordPress core
3. Define a formal API specification based on the patterns proven in the reference implementation
4. Develop a prototype within Gutenberg for testing and iteration

## Resources

- **Plugin:** [Block Accessibility Checks on WordPress.org](https://wordpress.org/plugins/block-accessibility-checks/)
- **Source Code:** [GitHub Repository](https://github.com/troychaplin/block-accessibility-checks)
- **Documentation:** [blockaccessibilitychecks.com](https://blockaccessibilitychecks.com/validation-api/)
- **Example Integration:** [block-check-integration-example](https://github.com/troychaplin/block-check-integration-example)
- **Demo Video:** [Pantheon Live](https://www.youtube.com/watch?v=mLsC2tDcdL8)

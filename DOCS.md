# Documentation Restructure Plan

## New Documentation Structure

### 1. Main Landing Page (`README.md`)

- High-level overview of the plugin
- Brief introduction to the 3 main validation systems:
- Block Attributes Validation
- Post Meta Validation  
- Editor Validation
- Quick links to each feature's Quick Start guide
- Links to Architecture, Reference, and other sections

### 2. Architecture Page (`architecture.md`) - NEW

- Detailed explanation of how the plugin works
- How the 3 validation systems integrate
- PHP vs JavaScript responsibilities
- Data flow and validation lifecycle
- Settings integration
- Post locking mechanism

### 3. Block Attributes Validation Section

#### 3.1 Quick Start (`block-validation/quick-start.md`) - NEW

- Overview of block attribute validation
- Simple example: register a check in PHP + implement in JS
- Basic enqueue setup
- Links to detailed PHP/JS pages

#### 3.2 PHP Integration (`block-validation/php.md`) - NEW

- Detailed PHP registration guide
- `BlockChecksRegistry` API methods
- Configuration options
- Action/filter hooks
- Advanced patterns (conditional registration, etc.)
- Quick reference to key methods

#### 3.3 JavaScript Integration (`block-validation/javascript.md`) - NEW

- Detailed JS validation implementation
- `ba11yc_validate_block` filter usage
- Accessing validation rules
- Advanced patterns (multiple checks, custom results, block context)
- Quick reference to key filters/APIs

### 4. Post Meta Validation Section

#### 4.1 Quick Start (`meta-validation/quick-start.md`) - NEW

- Overview of post meta validation
- Simple example using `MetaValidation::required()`
- UI component usage (`MetaField`, `ValidatedToolsPanelItem`)
- Links to detailed PHP/JS pages

#### 4.2 PHP Integration (`meta-validation/php.md`) - NEW

- Detailed PHP registration guide
- `MetaChecksRegistry` API methods
- `MetaValidation` helper class
- Integration with `register_post_meta()`
- Configuration options
- Server-side validation
- Quick reference to key methods

#### 4.3 JavaScript Integration (`meta-validation/javascript.md`) - NEW

- Detailed JS validation implementation
- `ba11yc_validate_meta` filter usage
- UI components (`MetaField`, `ValidatedToolsPanelItem`)
- Custom validation logic
- Accessing validation rules
- Quick reference to key components/filters

### 5. Editor Validation Section

#### 5.1 Quick Start (`editor-validation/quick-start.md`) - NEW

- Overview of editor validation
- Simple example: register check in PHP + implement in JS
- Common use cases (block order, block relationships)
- Links to detailed PHP/JS pages

#### 5.2 PHP Integration (`editor-validation/php.md`) - NEW

- Detailed PHP registration guide
- `EditorChecksRegistry` API methods
- Configuration options
- Action hooks (`ba11yc_editor_checks_ready`)
- Quick reference to key methods

#### 5.3 JavaScript Integration (`editor-validation/javascript.md`) - NEW

- Detailed JS validation implementation
- `ba11yc_validate_editor` filter usage
- Working with blocks array
- Post type context
- Advanced patterns
- Quick reference to key filters

### 6. Reference Section

#### 6.1 API Reference (`reference/api.md`) - UPDATED

- Comprehensive API documentation
- All registry methods (Block, Meta, Editor)
- Method signatures, parameters, return values
- Organized by registry type

#### 6.2 Hooks Reference (`reference/hooks.md`) - UPDATED

- Comprehensive hooks documentation
- All PHP action/filter hooks
- All JavaScript filter hooks
- Organized by category (registration, validation, etc.)

### 7. Additional Pages

#### 7.1 External Integration (`integration/external-plugins.md`) - UPDATED

- How external plugins integrate
- Automatic plugin detection
- Settings page integration
- Best practices

#### 7.2 Advanced Usage (`advanced.md`) - UPDATED

- Advanced patterns across all 3 systems
- Conditional registration
- Dynamic configuration
- Performance tips
- Cross-system integration examples

#### 7.3 Examples (`examples.md`) - UPDATED

- Real-world examples for each validation type
- Complete integration examples
- Common patterns

#### 7.4 Troubleshooting (`troubleshooting.md`) - UPDATED

- Common issues across all systems
- Debugging tips
- Solutions organized by validation type

## File Mapping

### Files to Create (New Structure)

- `architecture.md` - NEW
- `block-validation/quick-start.md` - NEW
- `block-validation/php.md` - NEW
- `block-validation/javascript.md` - NEW
- `meta-validation/quick-start.md` - NEW (extract from existing)
- `meta-validation/php.md` - NEW (extract from existing)
- `meta-validation/javascript.md` - NEW (extract from existing)
- `editor-validation/quick-start.md` - NEW (extract from existing)
- `editor-validation/php.md` - NEW (extract from existing)
- `editor-validation/javascript.md` - NEW (extract from existing)
- `reference/api.md` - UPDATED (from api-reference.md)
- `reference/hooks.md` - UPDATED (from hooks.md)
- `integration/external-plugins.md` - UPDATED (from external-integration.md)

### Files to Update

- `README.md` - Complete rewrite for overview
- `advanced.md` - Update to cover all 3 systems
- `examples.md` - Update with examples for all 3 systems
- `troubleshooting.md` - Update to cover all 3 systems

### Files to Remove/Archive

- `quick-start.md` - Replaced by feature-specific quick starts
- `php-integration.md` - Replaced by feature-specific PHP pages
- `js-integration.md` - Replaced by feature-specific JS pages
- `features.md` - Content moved to README.md
- `api-reference.md` - Moved to `reference/api.md`
- `hooks.md` - Moved to `reference/hooks.md`
- `external-integration.md` - Moved to `integration/external-plugins.md`
- `meta-validation.md` - Split into meta-validation section
- `editor-validation.md` - Split into editor-validation section

## Content Strategy

### Quick Start Pages

- Focus on getting started quickly
- Minimal code examples
- Clear step-by-step instructions
- Links to detailed pages for more info

### PHP/JS Detailed Pages

- Comprehensive coverage
- All configuration options
- Advanced patterns
- Quick reference sections
- Code examples

### Reference Pages

- Complete API documentation
- Method signatures
- Parameter details
- Return values
- Usage examples

## Implementation Notes

1. Maintain backward compatibility where possible (redirects/links)
2. Ensure all code examples are current and tested
3. Cross-reference between related pages
4. Use consistent formatting and structure
5. Include "See Also" sections linking to related docs
6. Update navigation/index in README.md
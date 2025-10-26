# Next Steps - Future Cleanup & Simplification

**Branch:** `cleanup/code` (completed)  
**Date:** October 26, 2025  
**Status:** Current cleanup verified and working. This document outlines future opportunities.

## Overview

This document outlines potential areas for further code cleanup and simplification. All suggestions maintain backward compatibility and existing functionality while improving code clarity, consistency, and maintainability.

## 1. Integrate HeadingLevels into PluginInitializer

**Priority:** MEDIUM  
**Complexity:** MEDIUM  
**Time Estimate:** 2-3 hours  
**Impact:** Architectural consistency

### Current Situation

`HeadingLevels` is currently instantiated directly in the main plugin file:

```php
// block-accessibility-checks.php line 33
$heading_levels = new \BlockAccessibilityChecks\Functions\HeadingLevels();
```

This class:
- Is not managed by `PluginInitializer`
- Self-registers its filter hook in the constructor
- Needs to run early (before `init` hook)
- Is instantiated separately from all other services

### Why It's Different

The current approach exists because `HeadingLevels` needs to run early to properly restrict heading levels in the block editor. The `block_type_metadata` filter must be registered before blocks are fully initialized.

### Proposed Improvement

Move `HeadingLevels` into the `PluginInitializer` service container while maintaining proper timing.

#### Implementation Approach

**Option A: Early Service Registration**
```php
// In PluginInitializer constructor or early init
public function init_heading_levels() {
    $this->services['heading_levels'] = new HeadingLevels();
}
```

**Option B: Deferred Registration Pattern**
```php
// Register the filter early, instantiate service later
public function register_heading_level_filter() {
    add_filter(
        'block_type_metadata',
        array( $this, 'apply_heading_restrictions' ),
        10,
        1
    );
}
```

### Benefits
- ✅ Consistent service architecture
- ✅ All services managed in one place
- ✅ Better dependency injection possibilities
- ✅ Easier to test and mock

### Considerations
- ⚠️ Must maintain current filter timing
- ⚠️ Need to verify heading restrictions still work
- ⚠️ Document why timing is important

### Action Items
1. Research exact timing requirements for `block_type_metadata` filter
2. Test moving instantiation to `PluginInitializer` constructor
3. Verify heading restrictions work identically
4. Update architecture documentation

## 2. Evaluate run_checks() Method Future

**Priority:** LOW  
**Complexity:** LOW  
**Time Estimate:** 1-2 hours  
**Impact:** API clarity

### Current Situation

The `BlockChecksRegistry::run_checks()` method currently:
```php
public function run_checks( $block_type, $attributes, $content = '' ) {
    // All validation now handled in JavaScript.
    $this->log_debug( "PHP validation disabled for {$block_type}..." );
    return array();
}
```

- Always returns empty array
- Kept only for backward compatibility
- All validation moved to JavaScript

### Questions to Answer

1. **Is anyone calling this method externally?**
   - Check documentation references
   - Search for usage in integration examples
   - Review external plugin integration patterns

2. **Should we formally deprecate it?**
   - Add `@deprecated` tag
   - Trigger `_deprecated_function()` notice
   - Set removal timeline (e.g., version 3.0.0)

3. **Or just leave it as-is?**
   - Low maintenance cost
   - Zero risk to existing code
   - Clear documentation already added

### Recommendation

**Keep as-is** unless you find evidence of external usage:
- Method is already simplified (just returns empty array)
- Documentation clearly states it's not used
- No harm in keeping it indefinitely
- Removes risk of breaking external plugins

### If Deprecation Desired

```php
/**
 * Run accessibility checks for a block.
 * 
 * @deprecated 3.0.0 All validation handled in JavaScript
 */
public function run_checks( $block_type, $attributes, $content = '' ) {
    _deprecated_function( __FUNCTION__, '3.0.0', 'JavaScript validation' );
    return array();
}
```

## 3. Systematic Dead Code Review

**Priority:** MEDIUM  
**Complexity:** MEDIUM-HIGH  
**Time Estimate:** 4-6 hours  
**Impact:** Code quality and maintainability

### Approach: Methodical Codebase Audit

#### Phase 1: Automated Analysis (1-2 hours)

**Tools to Use:**
1. **PHP_CodeSniffer** - Already configured
2. **PHPStan** - Static analysis for unused code
3. **Psalm** - Alternative static analyzer
4. **IDE Dead Code Detection** - PHPStorm/VSCode plugins

**What to Look For:**
- Unused private methods
- Unused class properties
- Unreachable code paths
- Unused parameters
- Write-only properties (set but never read)

**Commands:**
```bash
# PHP_CodeSniffer with WordPress standards
vendor/bin/phpcs --standard=WordPress Functions/

# PHPStan (if installed)
phpstan analyse Functions/ --level=5

# Search for potentially unused code patterns
grep -r "private function" Functions/
grep -r "private \$" Functions/
```

#### Phase 2: Manual Code Review (3-4 hours)

**Review Each Class Systematically:**

1. **BlockChecksRegistry.php** (~655 lines)
   - Review all public methods: Are they used externally?
   - Check private methods: Are they called?
   - Look for complex conditional logic with dead branches
   - Check for old callback references

2. **PluginInitializer.php** (~264 lines)
   - Review service initialization methods
   - Check if all services are actually retrieved
   - Look for unused getter methods

3. **SettingsPage.php**
   - Review all rendering methods
   - Check if all settings fields are actually used
   - Look for old admin notice code
   - Check sanitization methods for unnecessary checks

4. **ScriptsStyles.php**
   - Review all localized data: Is JavaScript using it?
   - Check for unused style enqueues
   - Look for old asset dependencies

5. **CoreBlockChecks.php**
   - Review all check definitions
   - Verify all checks are actually registered
   - Look for old check configurations

6. **HeadingLevels.php**
   - Review filter callbacks
   - Check for unused helper methods
   - Verify option retrieval logic

#### Phase 3: JavaScript Dead Code Review (1-2 hours)

**Files to Review:**
```
src/script.js
src/admin.js
src/scripts/block-checks/*.js
src/scripts/block-validation/*.js
src/scripts/supports/*.js
```

**What to Look For:**
- Unused imports
- Unreferenced functions
- Console.log statements
- Commented-out code blocks
- Old validation logic

**Tools:**
```bash
# Search for console.log (should be removed in production)
grep -r "console.log" src/

# Search for commented code
grep -r "^[[:space:]]*//" src/

# Find potential dead code
# Look for exports that are never imported
```

### Specific Areas of Interest

#### A. Old Callback References
Look for method references in code that might point to deleted functions:
```bash
grep -r "render_core.*_options" Functions/
grep -r "check_.*_callback" Functions/
```

#### B. Unused Filters/Actions
Check if all registered hooks have corresponding callback methods:
```bash
grep -r "add_action\|add_filter" Functions/
# Then verify each callback exists and is used
```

#### C. Redundant Validation
Look for validation that happens in multiple places:
```bash
grep -r "sanitize_text_field" Functions/
grep -r "wp_kses" Functions/
```

#### D. Legacy Compatibility Code
Find code marked for backward compatibility:
```bash
grep -r "@deprecated" Functions/
grep -r "backward compatibility" Functions/
grep -r "legacy" Functions/
```

### Documentation of Findings

Create a checklist as you review:
```markdown
## Dead Code Audit Results

### Confirmed Dead Code
- [ ] ClassName::method_name() - Never called
- [ ] $property_name in ClassName - Write-only

### Potentially Unused (Needs Verification)
- [ ] ClassName::method_name() - Only called in one place
- [ ] Could be simplified/inlined

### Keep (Has Purpose)
- [x] ClassName::method_name() - Used by external plugins
- [x] $property_name - Required for WordPress core
```

## 4. Add Automated Testing

**Priority:** HIGH (for long-term maintenance)  
**Complexity:** HIGH  
**Time Estimate:** 12-20 hours  
**Impact:** Prevents future dead code, catches regressions

### Why This Matters

Automated tests would have caught the dead code we just removed:
- Tests for `BlockConfig` would have failed (references non-existent methods)
- Tests for wrapper methods would show zero usage
- Tests for `run_checks()` would show it always returns empty array

### Proposed Testing Strategy

#### Phase 1: PHPUnit Tests for PHP (8-12 hours)

**Setup (2 hours)**
```json
// composer.json additions
{
  "require-dev": {
    "phpunit/phpunit": "^9.6",
    "yoast/wp-test-utils": "^1.0"
  }
}
```

**Test Coverage Plan:**

1. **BlockChecksRegistry Tests** (3-4 hours)
   ```php
   class BlockChecksRegistryTest extends WP_UnitTestCase {
       public function test_register_check_success() {}
       public function test_unregister_check() {}
       public function test_get_checks_for_block() {}
       public function test_set_check_enabled() {}
       public function test_check_filtering() {}
   }
   ```

2. **PluginInitializer Tests** (2 hours)
   ```php
   class PluginInitializerTest extends WP_UnitTestCase {
       public function test_services_initialized() {}
       public function test_get_service() {}
       public function test_hooks_registered() {}
   }
   ```

3. **SettingsPage Tests** (2 hours)
   ```php
   class SettingsPageTest extends WP_UnitTestCase {
       public function test_settings_registration() {}
       public function test_sanitization() {}
       public function test_heading_levels_save() {}
   }
   ```

4. **HeadingLevels Tests** (1 hour)
   ```php
   class HeadingLevelsTest extends WP_UnitTestCase {
       public function test_heading_restriction() {}
       public function test_allowed_blocks_filter() {}
   }
   ```

#### Phase 2: Jest Tests for JavaScript (4-6 hours)

**Setup (1 hour)**
```json
// package.json additions
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@wordpress/jest-preset-default": "^11.0.0",
    "jest": "^29.0.0"
  }
}
```

**Test Coverage Plan:**

1. **Validation Functions** (2 hours)
   ```javascript
   // Tests for headingRankValidation.js
   describe('Heading Rank Validation', () => {
       test('detects rank violations', () => {});
       test('validates first heading', () => {});
   });
   ```

2. **URL Validation** (1 hour)
   ```javascript
   // Tests for isValidUrl.js
   describe('URL Validation', () => {
       test('accepts valid URLs', () => {});
       test('rejects invalid TLDs', () => {});
   });
   ```

3. **Block Modifications** (1-2 hours)
   ```javascript
   // Tests for block modifications
   describe('Image Attributes', () => {
       test('adds accessibility attributes', () => {});
   });
   ```

#### Phase 3: CI/CD Integration (2 hours)

**GitHub Actions Workflow:**
```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  php-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
      - name: Install dependencies
        run: composer install
      - name: Run PHPUnit
        run: vendor/bin/phpunit
      
  js-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Run Jest
        run: npm test
```

### Benefits of Testing

- 🔍 **Catch Dead Code:** Tests fail when methods are removed
- 🐛 **Prevent Regressions:** Know when changes break existing functionality
- 📚 **Documentation:** Tests serve as usage examples
- 🏗️ **Refactor Confidence:** Safely restructure code with test coverage
- 🚀 **Future-Proof:** Catch issues before users do

### Realistic Expectations

- Start with critical paths, not 100% coverage
- Aim for 60-70% code coverage initially
- Add tests as you fix bugs or add features
- Use tests to prevent dead code accumulation

## 5. Simplify JavaScript Validation Pipeline

**Priority:** LOW-MEDIUM  
**Complexity:** MEDIUM  
**Time Estimate:** 3-4 hours  
**Impact:** Code maintainability

### Current Architecture Review

The JavaScript validation system is spread across multiple files:

```
src/scripts/
  ├── block-checks/
  │   ├── buttonCheck.js
  │   ├── headingRankValidation.js
  │   ├── imageCheck.js
  │   └── tableCheck.js
  ├── block-validation/
  │   ├── runValidation.js
  │   ├── validateBlock.js
  │   └── validationChecks.js
  └── registerPlugin.js
```

### Questions to Explore

1. **Is there duplication between `block-checks/` and `block-validation/`?**
   - Can these be consolidated?
   - Are responsibilities clearly defined?

2. **Can validation logic be more modular?**
   - Each check should be independent
   - Easy to add/remove checks
   - Clear separation of concerns

3. **Is the filter system being used optimally?**
   ```javascript
   // Current pattern
   const result = applyFilters('ba11yc.validateBlock', [], blockName, attributes);
   ```
   - Are all checks using this consistently?
   - Could this be simplified?

### Potential Simplifications

#### Option A: Unified Validation Registry
```javascript
// validation-registry.js
const validationRegistry = {
    'core/button': [buttonTextCheck, buttonLinkCheck],
    'core/image': [imageAltCheck, imagePatternCheck],
    'core/heading': [headingRankCheck],
};

export const runBlockValidation = (blockName, attributes) => {
    const checks = validationRegistry[blockName] || [];
    return checks.map(check => check(attributes));
};
```

#### Option B: Clearer File Organization
```
src/scripts/validation/
  ├── checks/           # Individual check implementations
  │   ├── button.js
  │   ├── image.js
  │   └── heading.js
  ├── registry.js       # Central validation registry
  ├── runner.js         # Runs checks for a block
  └── index.js          # Public API
```

### Action Items

1. Map current validation flow
2. Identify duplicated logic
3. Propose clearer structure
4. Implement incrementally (one block type at a time)

## 6. Settings Page Modernization

**Priority:** LOW  
**Complexity:** LOW-MEDIUM  
**Time Estimate:** 2-3 hours  
**Impact:** User experience

### Current State

The settings page works well but uses traditional WordPress Settings API patterns that can be verbose.

### Potential Improvements

#### A. Use React for Settings (WordPress 6.7+)

WordPress now supports React-based settings pages:
```jsx
import { SettingsPage } from '@wordpress/components';

// Could modernize settings UI with React components
```

**Pros:**
- Modern, interactive UI
- Better state management
- Consistent with block editor

**Cons:**
- Significant rewrite required
- More JavaScript to load
- May be overkill for current needs

**Recommendation:** Consider for version 3.0.0, not now

#### B. Simplify Rendering Methods

Current code has many small rendering methods. Could consolidate:

```php
// Current: Multiple methods
render_error_setting( $block_type, $check_name, $check_data )
render_warning_setting( $block_type, $check_name, $check_data )

// Potential: Single flexible method
render_check_setting( $block_type, $check_name, $check_data, $severity )
```

#### C. Add Settings Import/Export

Allow users to export/import their settings:
```php
public function export_settings() {
    $settings = get_option( 'block_checks_settings' );
    // Return JSON for download
}

public function import_settings( $json ) {
    // Validate and import settings
}
```

**Benefits:**
- Easier to migrate between sites
- Backup settings before testing
- Share configurations

## 7. Documentation Improvements

**Priority:** MEDIUM  
**Complexity:** LOW  
**Time Estimate:** 2-3 hours  
**Impact:** Developer experience

### Areas to Enhance

#### A. Code-Level Documentation

Add more inline documentation for complex logic:
```php
/**
 * Runs validation checks for a specific block type.
 * 
 * Note: This method currently returns an empty array as all validation
 * has been moved to JavaScript for real-time editor feedback. The method
 * is retained for backward compatibility with external plugins that may
 * call it, though no validation is actually performed.
 * 
 * @since 2.0.0
 * @since 2.2.0 Deprecated server-side validation in favor of JavaScript.
 * 
 * @param string $block_type Block type identifier (e.g., 'core/button')
 * @param array  $attributes Block attributes to validate
 * @param string $content    Block content (unused, kept for compatibility)
 * 
 * @return array Always returns empty array
 */
```

#### B. Architecture Documentation

Create `docs/architecture.md`:
```markdown
# Plugin Architecture

## Service Container Pattern
## Validation Flow
## Settings Management
## External Integration Points
```

#### C. Decision Records

Document why certain decisions were made:
```markdown
# docs/decisions/

- 001-javascript-only-validation.md
- 002-removed-php-block-config.md
- 003-heading-levels-timing.md
```

This helps future developers understand the "why" behind the code.

## 8. Performance Optimization Opportunities

**Priority:** LOW (unless performance issues reported)  
**Complexity:** MEDIUM  
**Time Estimate:** 4-6 hours  
**Impact:** Plugin performance

### Areas to Investigate

#### A. Settings Caching

Current settings retrieval:
```php
$settings = get_option( 'block_checks_settings', array() );
```

Could add object caching:
```php
private static $settings_cache = null;

public function get_settings() {
    if ( null === self::$settings_cache ) {
        self::$settings_cache = get_option( 'block_checks_settings', array() );
    }
    return self::$settings_cache;
}
```

#### B. Reduce JavaScript Bundle Size

Current build output:
```
build/block-checks.js
build/block-admin.js
```

Opportunities:
- Code splitting for admin-only features
- Tree-shaking unused dependencies
- Minification optimization

#### C. Lazy Load External Plugin Checks

Only load external plugin integrations when those blocks are used:
```javascript
// Instead of loading all checks upfront
// Load dynamically when block is inserted
```

### Measurement First

Before optimizing, measure:
1. Current JavaScript bundle sizes
2. Settings page load time
3. Editor performance impact
4. Memory usage

Only optimize what's actually slow.

## Priority Matrix

| Task | Priority | Impact | Effort | ROI |
|------|----------|--------|--------|-----|
| Add Automated Testing | HIGH | High | High | 🟢 High |
| Dead Code Review | MEDIUM | Medium | Medium | 🟢 High |
| HeadingLevels Integration | MEDIUM | Low | Medium | 🟡 Medium |
| Documentation Improvements | MEDIUM | Medium | Low | 🟢 High |
| JavaScript Pipeline Simplification | LOW-MED | Medium | Medium | 🟡 Medium |
| Settings Page Modernization | LOW | Low | Medium | 🔴 Low |
| Performance Optimization | LOW | Low | Medium | 🟡 Medium |
| Deprecate run_checks() | LOW | Low | Low | 🟡 Medium |

## Recommended Sequence

### Phase 1: Foundation (Week 1-2)
1. **Dead Code Review** - Find and document remaining issues
2. **Documentation Improvements** - Make codebase easier to understand
3. **HeadingLevels Integration** - Complete architectural consistency

### Phase 2: Testing Infrastructure (Week 3-4)
4. **Add Automated Testing** - Start with critical paths
5. **CI/CD Integration** - Automate test running

### Phase 3: Refinement (Month 2)
6. **JavaScript Pipeline Review** - Simplify if needed
7. **Performance Audit** - Measure and optimize if needed

### Phase 4: Polish (Month 3+)
8. **Settings Enhancements** - Import/export features
9. **Deprecation Notices** - If desired for old methods

## Success Metrics

### Quantitative
- Lines of code reduced by X%
- Test coverage at 60%+ 
- Zero dead code warnings from static analysis
- Build size reduced by X%

### Qualitative
- Code is easier for new contributors to understand
- Fewer "why does this exist?" questions
- Clearer separation of concerns
- Consistent architectural patterns

## Questions Before Starting

1. **What's most painful right now?**
   - What makes the codebase hard to work with?
   - What slows down adding new features?

2. **What are the goals?**
   - Preparing for a major feature?
   - Making it easier for contributors?
   - Improving performance?

3. **What's the timeline?**
   - Sprint through in a week?
   - Gradual improvements over months?

4. **What's off-limits?**
   - Must maintain backward compatibility?
   - Can't change external APIs?
   - Need to support old WP versions?

## Conclusion

The code cleanup completed in the `cleanup/code` branch removed ~170 lines of obvious dead code. These next steps outline **deeper opportunities** for:

- ✅ **Architectural consistency** (HeadingLevels integration)
- ✅ **Prevention** (automated testing)
- ✅ **Discovery** (systematic dead code review)
- ✅ **Maintainability** (documentation, simplification)

Each task is independent and can be tackled as time and priorities allow. The highest ROI items are:
1. Automated testing (prevents future issues)
2. Dead code review (finds more cleanup opportunities)
3. Documentation (helps future developers)

**Recommendation:** Start with the systematic dead code review to find the next batch of cleanup opportunities, then add automated tests to prevent future accumulation.

**Document Created:** October 26, 2025  
**Status:** Ready for planning  
**Next Action:** Choose which task to tackle first based on current priorities

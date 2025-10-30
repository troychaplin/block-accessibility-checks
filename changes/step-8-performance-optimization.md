# Step 8: Performance Optimization - Implementation Plan

**Priority:** LOW (unless performance issues reported)  
**Time Estimate:** 4-8 hours  
**Complexity:** MEDIUM  
**Branch:** `perf/optimizations`  
**Date:** October 30, 2025  
**Status:** Measure first, optimize only if needed

## Overview

Identify and optimize performance bottlenecks in the plugin. This should **only be done after measuring** and confirming actual performance issues. Premature optimization is wasteful.

## ⚠️ Important: Measure First!

**DO NOT start optimization without metrics showing a problem.**

This plan should only be executed if:
- Users report slow performance
- Metrics show unacceptable delays
- Editor feels sluggish with plugin active
- Bundle size is problematically large

## Goals

1. **Measure current performance** - Establish baseline
2. **Identify bottlenecks** - Find actual slow points
3. **Optimize selectively** - Fix only what's slow
4. **Maintain functionality** - Don't break things
5. **Validate improvements** - Prove it's faster

## Success Metrics

- 🎯 **Bundle size** < 50KB (gzipped) per script
- ⚡ **Validation** runs in < 50ms per block
- 📊 **Settings page** loads in < 500ms
- 💾 **Memory usage** stays under 10MB
- ✅ **No regressions** - All features still work

---

## Phase 1: Performance Measurement (1-2 hours)

### 1.1 Establish Baseline Metrics (30 mins)

#### JavaScript Bundle Size

```bash
# Build production bundles
npm run build

# Check file sizes
ls -lh build/

# Get gzipped sizes
gzip -c build/block-checks.js | wc -c
gzip -c build/block-admin.js | wc -c

# Expected: Each file under 50KB gzipped
```

**Document current sizes:**
```markdown
## Baseline Bundle Sizes

- `block-checks.js`: XXX KB (YYY KB gzipped)
- `block-admin.js`: XXX KB (YYY KB gzipped)
- `block-checks.css`: XXX KB (YYY KB gzipped)
- `block-admin.css`: XXX KB (YYY KB gzipped)

**Total:** XXX KB (YYY KB gzipped)
```

#### Runtime Performance

**Create `tests/performance/validation-benchmark.js`:**

```javascript
/**
 * Benchmark validation performance
 */

const blocks = [
    { name: 'core/button', attributes: { text: '', url: '' } },
    { name: 'core/image', attributes: { alt: '', url: 'test.jpg' } },
    { name: 'core/heading', attributes: { level: 2, content: 'Test' } },
    // ... add more test blocks
];

console.time('Validation Time');

// Run validation on all blocks
blocks.forEach(block => {
    wp.hooks.applyFilters(
        'ba11yc.validateBlock',
        [],
        block.name,
        block.attributes
    );
});

console.timeEnd('Validation Time');
// Expected: < 50ms for 100 blocks
```

#### Settings Page Load Time

```javascript
// Add to settings page
console.time('Settings Page Render');
// ... render settings
console.timeEnd('Settings Page Render');
// Expected: < 500ms
```

#### Memory Usage

```javascript
// Check memory before and after
const before = performance.memory?.usedJSHeapSize;
// ... run operations
const after = performance.memory?.usedJSHeapSize;
console.log('Memory used:', (after - before) / 1024 / 1024, 'MB');
// Expected: < 10MB
```

### 1.2 Performance Profiling (1 hour)

#### Use Browser DevTools

**Chrome DevTools Performance Tab:**
1. Open browser DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Edit blocks, run validations
5. Stop recording
6. Analyze flame graph

**Look for:**
- Long tasks (> 50ms)
- Excessive function calls
- Memory leaks
- Layout thrashing

#### WordPress Data Store Performance

```javascript
// Track store subscriptions
console.log('Store subscribers:', 
    wp.data.select('core/block-editor').getBlockCount()
);

// Measure selector performance
console.time('getBlocks');
const blocks = wp.data.select('core/block-editor').getBlocks();
console.timeEnd('getBlocks');
```

### 1.3 Identify Slow Areas (30 mins)

**Create findings document:**

```markdown
# Performance Analysis Results

## Bundle Size
- Current: XXX KB (acceptable / too large)
- Target: < 50KB gzipped
- Status: ✅ Good / ⚠️ Needs attention / ❌ Problem

## Validation Performance
- Average time: XX ms per block
- Target: < 50ms per block
- Status: ✅ Good / ⚠️ Needs attention / ❌ Problem

## Settings Page Load
- Current: XXX ms
- Target: < 500ms
- Status: ✅ Good / ⚠️ Needs attention / ❌ Problem

## Memory Usage
- Current: XX MB
- Target: < 10MB
- Status: ✅ Good / ⚠️ Needs attention / ❌ Problem

## Identified Bottlenecks
1. [Specific function/area] - XX ms
2. [Another area] - XX ms
3. ...

## Recommendation
- ✅ No optimization needed (all metrics good)
- ⚠️ Minor optimizations (some areas slow)
- ❌ Significant optimization required (major issues)
```

---

## Phase 2: JavaScript Bundle Optimization (1-2 hours)

### 2.1 Analyze Bundle Composition (30 mins)

**Install webpack-bundle-analyzer:**

```bash
npm install --save-dev webpack-bundle-analyzer
```

**Update `webpack.config.js`:**

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    // ... existing config
    plugins: [
        // ... existing plugins
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-report.html'
        })
    ]
};
```

**Generate report:**
```bash
npm run build
# Open build/bundle-report.html
```

**Look for:**
- Large dependencies that aren't needed
- Duplicated code across bundles
- Unused exports
- Heavy libraries

### 2.2 Reduce Bundle Size (1 hour)

#### Strategy 1: Tree Shaking

**Ensure proper imports:**

```javascript
// ❌ Bad: Imports entire lodash
import _ from 'lodash';

// ✅ Good: Import only what you need
import debounce from 'lodash/debounce';
```

#### Strategy 2: Code Splitting

**Split admin and editor code:**

```javascript
// webpack.config.js
module.exports = {
    entry: {
        'block-checks': './src/script.js',
        'block-admin': './src/admin.js', // Only loaded in admin
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    priority: 10
                }
            }
        }
    }
};
```

#### Strategy 3: Remove Unused Dependencies

```bash
# Analyze dependencies
npx depcheck

# Remove unused packages
npm uninstall [unused-package]
```

#### Strategy 4: Minimize External Dependencies

**Review package.json:**
```json
{
  "dependencies": {
    // Keep only essentials
    // Question each dependency: Is this really needed?
  }
}
```

### 2.3 Minification & Compression (15 mins)

**Verify Terser is configured:**

```javascript
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true, // Remove console.logs
                        drop_debugger: true
                    },
                    mangle: true,
                    output: {
                        comments: false
                    }
                }
            })
        ]
    }
};
```

---

## Phase 3: Runtime Performance Optimization (2-3 hours)

### 3.1 Settings Caching (45 mins)

**Current: Settings loaded on every access**
```php
// Multiple get_option calls
$settings = get_option( 'block_checks_settings', array() );
```

**Optimized: Cache in object**
```php
class SettingsPage {
    private static $settings_cache = null;
    
    /**
     * Get settings with caching
     */
    private function get_settings() {
        if ( null === self::$settings_cache ) {
            self::$settings_cache = get_option( 'block_checks_settings', array() );
        }
        return self::$settings_cache;
    }
    
    /**
     * Clear cache when settings change
     */
    public function sanitize_settings( $input ) {
        self::$settings_cache = null; // Invalidate cache
        // ... sanitization logic
        return $sanitized;
    }
}
```

**Apply to:**
- [ ] `SettingsPage::get_settings()`
- [ ] `BlockChecksRegistry::get_check_level_from_settings()`

### 3.2 Optimize JavaScript Selectors (1 hour)

**Current: Selector called repeatedly**
```javascript
// Called many times per second
const blocks = wp.data.select('core/block-editor').getBlocks();
```

**Optimized: Subscribe once, cache results**
```javascript
let cachedBlocks = [];
let unsubscribe = null;

function initBlockCache() {
    unsubscribe = wp.data.subscribe(() => {
        cachedBlocks = wp.data.select('core/block-editor').getBlocks();
    });
}

function getBlocks() {
    return cachedBlocks; // No selector call needed
}

// Call on plugin init
initBlockCache();
```

### 3.3 Debounce Validation (30 mins)

**Current: Validate on every keystroke**
```javascript
// Runs immediately
function onBlockChange(block) {
    validateBlock(block);
}
```

**Optimized: Debounce validation**
```javascript
import { debounce } from '@wordpress/compose';

// Wait 300ms after last change
const debouncedValidation = debounce((block) => {
    validateBlock(block);
}, 300);

function onBlockChange(block) {
    debouncedValidation(block);
}
```

### 3.4 Lazy Load Heavy Computations (45 mins)

**Only load heading validation when heading exists:**

```javascript
let headingChecksLoaded = false;

async function loadHeadingChecks() {
    if (headingChecksLoaded) return;
    
    // Dynamically import (webpack code splitting)
    const { registerHeadingChecks } = await import(
        /* webpackChunkName: "heading-checks" */
        './checks/heading'
    );
    
    registerHeadingChecks();
    headingChecksLoaded = true;
}

// Load when first heading inserted
wp.data.subscribe(() => {
    const blocks = wp.data.select('core/block-editor').getBlocks();
    const hasHeading = blocks.some(b => b.name === 'core/heading');
    
    if (hasHeading && !headingChecksLoaded) {
        loadHeadingChecks();
    }
});
```

---

## Phase 4: Database Optimization (1 hour)

### 4.1 Optimize Option Storage (30 mins)

**Current: Separate options**
```php
// Multiple database queries
$core_settings = get_option('block_checks_options');
$external_1 = get_option('block_checks_external_plugin1');
$external_2 = get_option('block_checks_external_plugin2');
```

**Consideration: Consolidate if too many**

Only if there are 10+ separate options:

```php
// Single query for all settings
$all_settings = get_option('block_checks_all_settings', [
    'core' => [],
    'external' => []
]);
```

**Trade-off:** More data loaded at once vs. fewer queries

### 4.2 Add Autoload Control (15 mins)

**Prevent autoloading large options:**

```php
// For options that are rarely needed
update_option('block_checks_debug_log', $data, 'no'); // Don't autoload
```

### 4.3 Transient Caching (15 mins)

**Cache expensive operations:**

```php
// Cache plugin detection results
$cache_key = 'ba11yc_plugin_info_' . md5($plugin_file);
$plugin_info = get_transient($cache_key);

if (false === $plugin_info) {
    $plugin_info = $this->detect_plugin_info();
    set_transient($cache_key, $plugin_info, HOUR_IN_SECONDS);
}
```

---

## Phase 5: Testing & Validation (1 hour)

### 5.1 Re-run Benchmarks (30 mins)

**Compare before/after metrics:**

```markdown
## Performance Improvements

### Bundle Size
- Before: XXX KB gzipped
- After: YYY KB gzipped
- Improvement: ZZ% reduction

### Validation Speed
- Before: XX ms per block
- After: YY ms per block
- Improvement: ZZ% faster

### Settings Page Load
- Before: XXX ms
- After: YYY ms
- Improvement: ZZ% faster

### Memory Usage
- Before: XX MB
- After: YY MB
- Improvement: ZZ% reduction
```

### 5.2 Regression Testing (30 mins)

**Ensure nothing broke:**

- [ ] All blocks still validate correctly
- [ ] Settings page still works
- [ ] External plugins still function
- [ ] No console errors
- [ ] All features working
- [ ] Run automated tests

---

## Optimization Checklist

### Measurement
- [ ] Measure bundle sizes
- [ ] Profile runtime performance
- [ ] Check memory usage
- [ ] Identify bottlenecks
- [ ] Document findings

### Bundle Optimization
- [ ] Analyze bundle composition
- [ ] Apply tree shaking
- [ ] Code splitting
- [ ] Remove unused dependencies
- [ ] Verify minification

### Runtime Optimization
- [ ] Add settings caching
- [ ] Optimize selectors
- [ ] Debounce validation
- [ ] Lazy load checks
- [ ] Memoize expensive operations

### Database Optimization
- [ ] Review option structure
- [ ] Control autoloading
- [ ] Add transient caching
- [ ] Optimize queries

### Validation
- [ ] Re-run benchmarks
- [ ] Regression testing
- [ ] Document improvements
- [ ] Update CHANGELOG

---

## Timeline

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1 | Performance Measurement | 1-2 hours |
| Phase 2 | Bundle Optimization | 1-2 hours |
| Phase 3 | Runtime Optimization | 2-3 hours |
| Phase 4 | Database Optimization | 1 hour |
| Phase 5 | Testing & Validation | 1 hour |
| **Total** | | **6-9 hours** |

---

## When to Skip This

**Don't optimize if:**
- ❌ No performance complaints from users
- ❌ Metrics are all in acceptable range
- ❌ Bundle sizes are reasonable (< 50KB)
- ❌ Validation runs fast (< 50ms)
- ❌ Higher priority work exists

**The plugin might already be fast enough!**

---

## Optimization Priority

### High Priority (Do if metrics are bad)
1. **Bundle size reduction** - If > 100KB gzipped
2. **Validation debouncing** - If validation feels slow
3. **Settings caching** - If settings page is slow

### Medium Priority (Nice to have)
4. **Code splitting** - Cleaner but more complex
5. **Lazy loading** - Only for rarely-used features
6. **Transient caching** - Minor improvement

### Low Priority (Probably not worth it)
7. **Micro-optimizations** - Usually negligible impact
8. **Premature caching** - Adds complexity
9. **Over-engineering** - Keep it simple

---

## Best Practices

### Always
- ✅ Measure before optimizing
- ✅ Test after changes
- ✅ Document improvements
- ✅ Keep it simple

### Never
- ❌ Optimize without metrics
- ❌ Sacrifice readability
- ❌ Break functionality
- ❌ Add premature caching

---

## Update CHANGELOG

```markdown
## [Unreleased]

### Changed
- **Performance optimizations**: Improved plugin performance
  - Reduced JavaScript bundle size by XX%
  - Added settings caching (YY% faster)
  - Debounced validation (smoother typing)
  - Lazy loaded checks (ZZ% faster initial load)
  
### Technical
- Bundle size: XXX KB → YYY KB (gzipped)
- Validation speed: XX ms → YY ms per block
- Settings page load: XXX ms → YYY ms
```

---

## Success Criteria

After optimization:
- Bundle size reasonable? ✅
- Validation feels responsive? ✅
- Settings page loads quickly? ✅
- No functionality broken? ✅
- Improvement measurable? ✅

---

## Notes

- **Measure first!** Don't guess what's slow
- **Optimize selectively** - Don't optimize everything
- **Maintain simplicity** - Don't over-engineer
- **Test thoroughly** - Don't break things
- **Document changes** - Explain what and why

**Remember:** Premature optimization is the root of all evil. Only optimize what needs optimizing.

---

**Document Created:** October 30, 2025  
**Status:** Ready for implementation **ONLY IF** metrics show need  
**Next Action:** Phase 1 - Measure current performance (then decide)


# PHP Review - HeadingLevels.php

## Overview
Review of `Functions/HeadingLevels.php` to identify code that is no longer necessary, duplicated, or can be cleaned up.

## Issues Found

### 1. Hardcoded Allowed Levels Array (Line 109)
**Status**: ✅ Fixed

**Issue**: The `$allowed_restricted_levels` array is defined inside the method and recreated on every call, even though it's a constant value that never changes.

```php
$allowed_restricted_levels = array( 'h1', 'h5', 'h6' );
```

**Solution**: Extract to a class constant for better performance and clarity.

**Impact**: Low - Minor performance improvement, better code organization

**Implementation**: Created `ALLOWED_RESTRICTED_LEVELS` class constant and updated the method to use `self::ALLOWED_RESTRICTED_LEVELS` instead of the local variable.

---

### 2. Verbose isset() Check (Line 91)
**Status**: ✅ Fixed

**Issue**: Line 91 uses verbose `isset()` ternary operator pattern that can be simplified with null coalescing operator.

**Before:**
```php
$restricted_levels = isset( $options['core_heading_levels'] ) ? $options['core_heading_levels'] : array();
```

**Solution**: Use null coalescing operator (`??`) for cleaner code.

**After:**
```php
$restricted_levels = $options['core_heading_levels'] ?? array();
```

**Impact**: Very Low - Improved readability

**Implementation**: Replaced verbose `isset()` ternary with null coalescing operator for cleaner, more modern PHP syntax.

---

### 3. Logging Method Duplication (Lines 161-179)
**Status**: 🔴 Cross-File Duplication

**Issue**: The `log_error()` and `log_debug()` methods are duplicated across multiple classes:
- `BlockChecksRegistry.php` (lines 634-651)
- `PluginInitializer.php` (lines 280-297)
- `HeadingLevels.php` (lines 161-179)
- `SettingsPage.php` (lines 711-728)

This is a significant DRY violation. Each class has identical logging logic.

**Solution (Future)**: Consider extracting to a trait or base class for shared logging functionality. However, this is a larger refactoring that affects multiple files.

**Impact**: Medium - Code duplication across 4 files, ~38 duplicate lines total

**Note**: This is noted for awareness but won't be fixed in this review as it requires cross-file refactoring.

---

### 4. Inconsistent Constant Checking (Lines 162, 175)
**Status**: 🟡 Consistency Issue

**Issue**: HeadingLevels uses direct constant access (`WP_DEBUG`) while BlockChecksRegistry uses the `constant()` function for the same checks. This inconsistency makes the codebase harder to maintain.

**HeadingLevels approach:**
```php
if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
```

**BlockChecksRegistry approach:**
```php
if ( defined( 'WP_DEBUG' ) && constant( 'WP_DEBUG' ) ) {
```

**Solution**: Standardize on one approach across all files for consistency.

**Impact**: Low - Consistency improvement

---

## Good Practices Found ✅

The file demonstrates several good practices:
- ✅ Proper type hints on all methods
- ✅ Options caching implemented (`$cached_options`)
- ✅ Comprehensive error handling with try-catch blocks
- ✅ Input validation (lines 94, 111)
- ✅ Defensive programming (fallback to defaults on errors)
- ✅ Good documentation
- ✅ Early returns for clarity

---

## Implementation Plan

### Phase 1: Simple Improvements ✅ COMPLETE
1. ✅ Extract allowed restricted levels to class constant
2. ✅ Use null coalescing operator for cleaner code

### Phase 2: Consistency (Optional) ⏸️ DEFERRED
3. ⏸️ Standardize constant checking approach (noted for future)
4. ⏸️ Logging duplication - requires cross-file refactoring (noted for future)

---

## Cleanup Summary

### Phase 1 Complete ✅

**Total Issues Addressed**: 2 (both fixed)

**Code Quality Improvements**:
- ✅ Extracted hardcoded array to class constant
- ✅ Modernized code with null coalescing operator

**Lines Changed**: ~3 lines
**Net Code Reduction**: 1 line removed
**New Constants Added**: 1 (`ALLOWED_RESTRICTED_LEVELS`)

**Linter Status**: No new errors introduced (5 pre-existing WordPress function/constant warnings remain)

**Benefits Achieved**:
- **Better performance** - Constant array not recreated on each call
- **Improved readability** - Cleaner null coalescing syntax
- **Better maintainability** - Constants are easier to modify and document
- **Clear intent** - Constant name documents which levels can be restricted

---

## Future Recommendations

**Cross-File Refactoring** (Not implemented in this review):

1. **Logging Method Duplication**: The `log_error()` and `log_debug()` methods are duplicated across 4 files (BlockChecksRegistry, PluginInitializer, HeadingLevels, SettingsPage). Consider creating a shared Logger trait or abstract base class.

2. **Constant Checking Consistency**: Standardize the approach for checking WordPress constants (direct access vs `constant()` function).

These are architectural improvements that should be addressed in a separate, coordinated refactoring effort.


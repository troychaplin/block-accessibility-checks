# JavaScript Validation Guide

Deep dive into the JavaScript validation system for Block Accessibility Checks, including real-time feedback, visual indicators, performance optimization, and advanced validation patterns.

## Table of Contents

1. [Overview](#overview)
2. [Validation Architecture](#validation-architecture)
3. [Basic Validation Implementation](#basic-validation-implementation)
4. [Real-time Feedback Integration](#real-time-feedback-integration)
5. [Visual Indicators](#visual-indicators)
6. [Performance Optimization](#performance-optimization)
7. [Advanced Validation Patterns](#advanced-validation-patterns)
8. [Debugging and Troubleshooting](#debugging-and-troubleshooting)

## Overview

The Block Accessibility Checks plugin uses a **JavaScript-only validation architecture** where all validation logic runs in the browser for real-time feedback. This provides immediate visual feedback to users as they edit blocks in the WordPress block editor.

### Key Benefits

- **Real-time Feedback**: Validation runs instantly as users type or modify blocks
- **Visual Indicators**: Clear visual cues (colored borders, icons) show validation status
- **Multiple Issues Display**: All accessibility problems are shown simultaneously
- **Performance**: Client-side validation is fast and responsive
- **Consistency**: Same validation logic across all block types

## Validation Architecture

### How It Works

1. **PHP Configuration**: Check metadata and settings are registered in PHP
2. **Data Bridge**: Configuration is exposed to JavaScript via `wp_localize_script()`
3. **JavaScript Validation**: All validation logic runs in JavaScript using the `ba11yc.validateBlock` filter
4. **Visual Feedback**: Real-time visual indicators and messages appear instantly
5. **Publishing Control**: Failed checks can prevent publishing based on severity level

### Data Flow

```
PHP Registry → wp_localize_script() → JavaScript Rules → Validation Filter → Visual Feedback
```

## Basic Validation Implementation

### Filter Hook Signature

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
	'ba11yc.validateBlock',
	'your-namespace/validation',
	(isValid, blockType, attributes, checkName, rule) => {
		// Your validation logic here
		return isValid; // true if valid, false if invalid
	}
);
```

### Parameters

- `isValid` (boolean) - Current validation state (default: true)
- `blockType` (string) - Block type (e.g., 'core/image', 'my-plugin/custom-block')
- `attributes` (object) - Block attributes from the block editor
- `checkName` (string) - Name of the specific check being run
- `rule` (object) - Check configuration (includes 'message', 'type', 'enabled', etc.)

### Return Values

- `true` - Check passed (block is valid)
- `false` - Check failed (accessibility issue found)

### Basic Example

```javascript
addFilter(
	'ba11yc.validateBlock',
	'my-plugin/validation',
	(isValid, blockType, attributes, checkName, rule) => {
		// Only handle our block type
		if (blockType !== 'my-plugin/custom-block') {
			return isValid;
		}

		// Implement validation logic
		switch (checkName) {
			case 'required_field':
				return !!(attributes.content && attributes.content.trim());
			
			case 'content_length':
				const content = attributes.content || '';
				return content.length <= 500;
			
			default:
				return isValid;
		}
	}
);
```

## Real-time Feedback Integration

### Automatic Visual Feedback

Once your JavaScript check is properly integrated, the Block Accessibility Checks system automatically provides:

1. **Error Indicators**: Red borders around invalid blocks (for errors)
2. **Warning Indicators**: Yellow borders around blocks with warnings
3. **Inspector Panel**: All issues listed in the block inspector sidebar
4. **Publishing Control**: Errors prevent publishing, warnings allow publishing with notifications
5. **Real-time Updates**: All validation issues update instantly as users edit

### Multiple Issues Support

The validation system displays all accessibility issues at once, eliminating the frustrating "fix one, see another" cycle:

- **Error Priority**: Blocks with both errors and warnings show red borders until all errors are resolved
- **Comprehensive Feedback**: All failing checks are listed in the inspector panel simultaneously
- **Organized Display**: Issues are grouped by severity (errors first, then warnings) in the sidebar
- **Individual Messages**: Each validation issue shows its specific error message and type

### Example: Visual Feedback in Action

```javascript
// This validation will automatically trigger visual feedback
function validateImageBlock(attributes) {
	// Missing alt text will show red border and error message
	if (!attributes.alt || !attributes.alt.trim()) {
		return false; // Invalid - triggers red border and error message
	}
	
	// Poor alt text will show yellow border and warning message
	if (attributes.alt.length < 10) {
		return false; // Invalid - triggers yellow border and warning message
	}
	
	return true; // Valid - no visual indicators
}
```

## Visual Indicators

### Border Colors

- **Red Border**: Indicates errors that prevent publishing
- **Yellow Border**: Indicates warnings that allow publishing but show notifications
- **No Border**: Indicates the block is valid

### Inspector Panel Display

The block inspector sidebar shows:

1. **Error Section**: All error messages (if any)
2. **Warning Section**: All warning messages (if any)
3. **Check Details**: Each message includes the check name and description
4. **Severity Indicators**: Icons and colors to distinguish error vs warning

### Priority System

Visual indicators follow a priority system:

1. **Errors Override Warnings**: If a block has both errors and warnings, it shows red border
2. **Highest Severity Wins**: The most severe issue determines the border color
3. **All Issues Listed**: All problems are shown in the inspector panel regardless of severity

## Performance Optimization

### Efficient Validation Functions

```javascript
// ✅ Efficient validation with early returns
function validateEfficiently(attributes) {
	// Early return for missing data
	if (!attributes || !attributes.content) {
		return false;
	}
	
	// Early return for empty content
	if (!attributes.content.trim()) {
		return false;
	}
	
	// Only perform expensive operations if needed
	if (attributes.content.length > 1000) {
		return performExpensiveValidation(attributes.content);
	}
	
	return true;
}

// ❌ Inefficient validation
function validateInefficiently(attributes) {
	// Always performs expensive operations
	const expensiveResult = performExpensiveValidation(attributes.content);
	
	// Then checks simple conditions
	if (!attributes.content) {
		return false;
	}
	
	return expensiveResult;
}
```

### Caching Expensive Operations

```javascript
// Cache expensive validation results
const validationCache = new Map();

function cachedValidation(blockType, attributes, checkName) {
	const cacheKey = `${blockType}-${checkName}-${JSON.stringify(attributes)}`;
	
	if (validationCache.has(cacheKey)) {
		return validationCache.get(cacheKey);
	}
	
	// Perform expensive validation
	const result = performExpensiveValidation(attributes);
	
	// Cache the result
	validationCache.set(cacheKey, result);
	
	return result;
}

// Clear cache periodically or when needed
function clearValidationCache() {
	validationCache.clear();
}
```

### Minimizing DOM Queries

```javascript
// ✅ Efficient - cache DOM elements
let inspectorPanel = null;

function getInspectorPanel() {
	if (!inspectorPanel) {
		inspectorPanel = document.querySelector('.block-editor-block-inspector');
	}
	return inspectorPanel;
}

// ❌ Inefficient - query DOM repeatedly
function inefficientDOMAccess() {
	// This runs on every validation
	const panel = document.querySelector('.block-editor-block-inspector');
	// ... use panel
}
```

### Debouncing Validation

```javascript
// Debounce validation for better performance
let validationTimeout = null;

function debouncedValidation(blockType, attributes, checkName, rule) {
	clearTimeout(validationTimeout);
	
	validationTimeout = setTimeout(() => {
		performValidation(blockType, attributes, checkName, rule);
	}, 300); // Wait 300ms after last change
}
```

## Advanced Validation Patterns

### Complex Validation with Multiple Conditions

```javascript
function validateComplexBlock(attributes) {
	// Check if block is in preview mode
	if (attributes.isPreview) {
		return true; // Skip validation in preview
	}
	
	// Check required fields
	const requiredFields = ['title', 'content', 'author'];
	for (const field of requiredFields) {
		if (!attributes[field] || !attributes[field].trim()) {
			return false;
		}
	}
	
	// Check content length
	const content = attributes.content || '';
	if (content.length < 50 || content.length > 2000) {
		return false;
	}
	
	// Check for specific patterns
	if (content.includes('TODO') || content.includes('FIXME')) {
		return false;
	}
	
	return true;
}
```

### Context-Aware Validation

```javascript
function validateWithContext(attributes, rule) {
	// Get current post type
	const postType = wp.data.select('core/editor').getCurrentPostType();
	
	// Different validation for different post types
	switch (postType) {
		case 'product':
			return validateProductBlock(attributes);
		case 'post':
			return validatePostBlock(attributes);
		default:
			return validateGenericBlock(attributes);
	}
}

function validateProductBlock(attributes) {
	// Stricter validation for product blocks
	const minLength = 100;
	const maxLength = 1000;
	
	const content = attributes.content || '';
	return content.length >= minLength && content.length <= maxLength;
}
```

### Conditional Validation Based on User Role

```javascript
function validateBasedOnUserRole(attributes, rule) {
	// Get current user capabilities
	const canManageOptions = wp.data.select('core').canUser('manage_options');
	
	if (canManageOptions) {
		// Admin users get stricter validation
		return validateStrict(attributes);
	} else {
		// Regular users get basic validation
		return validateBasic(attributes);
	}
}
```

### Validation with External Data

```javascript
async function validateWithExternalData(attributes) {
	try {
		// Fetch external validation rules
		const response = await fetch('/api/validation-rules');
		const rules = await response.json();
		
		// Apply external rules
		return applyExternalRules(attributes, rules);
	} catch (error) {
		console.error('Failed to fetch validation rules:', error);
		return true; // Fallback to valid
	}
}
```

## Debugging and Troubleshooting

### Console Debugging

```javascript
// Add debugging to your validation function
function debugValidation(blockType, attributes, checkName, rule) {
	console.group(`Validating: ${blockType} - ${checkName}`);
	console.log('Attributes:', attributes);
	console.log('Rule:', rule);
	
	const result = performActualValidation(attributes, checkName, rule);
	
	console.log('Result:', result);
	console.groupEnd();
	
	return result;
}
```

### Validation Rule Inspection

```javascript
// Inspect available validation rules
function inspectValidationRules() {
	const rules = window.BlockAccessibilityChecks?.validationRules || {};
	
	console.log('Available validation rules:');
	Object.entries(rules).forEach(([blockType, blockRules]) => {
		console.log(`\n${blockType}:`);
		Object.entries(blockRules).forEach(([checkName, config]) => {
			console.log(`  - ${checkName}: ${config.enabled ? 'enabled' : 'disabled'} (${config.type})`);
		});
	});
}

// Call this in browser console to inspect rules
inspectValidationRules();
```

### Common Issues and Solutions

#### Issue: Validation Not Running

**Symptoms:** Your validation function is never called.

**Solutions:**
1. Check script load order - ensure your script loads after `block-accessibility-checks-script`
2. Verify filter registration - ensure `addFilter` is called correctly
3. Check block type matching - ensure your block type matches exactly

```javascript
// ✅ Correct script dependency
wp_enqueue_script(
	'my-validation',
	plugins_url('build/validation.js', __FILE__),
	array('block-accessibility-checks-script'), // Important!
	'1.0.0',
	true
);

// ✅ Correct filter registration
addFilter(
	'ba11yc.validateBlock',
	'my-plugin/validation',
	(isValid, blockType, attributes, checkName, rule) => {
		console.log('Validation called for:', blockType, checkName); // Debug
		// ... validation logic
	}
);
```

#### Issue: Visual Indicators Not Showing

**Symptoms:** Validation logic works but no visual feedback appears.

**Solutions:**
1. Ensure you're returning `false` for invalid blocks
2. Check that your check is enabled in the registry
3. Verify the check type is set correctly

```javascript
// ✅ Correct - returns false for invalid
function validateRequiredField(attributes) {
	return !!(attributes.requiredField && attributes.requiredField.trim());
}

// ❌ Wrong - always returns true
function validateRequiredField(attributes) {
	if (!attributes.requiredField) {
		console.log('Field is required!'); // This won't show visual feedback
	}
	return true; // Always valid - no visual feedback
}
```

#### Issue: Performance Problems

**Symptoms:** Validation is slow or causes lag.

**Solutions:**
1. Use early returns to avoid expensive operations
2. Cache expensive validation results
3. Debounce validation for rapid changes
4. Minimize DOM queries

```javascript
// ✅ Performance optimized
function optimizedValidation(attributes) {
	// Early returns
	if (!attributes || !attributes.content) {
		return false;
	}
	
	// Cache expensive operations
	const cacheKey = `validation-${attributes.content}`;
	if (validationCache.has(cacheKey)) {
		return validationCache.get(cacheKey);
	}
	
	// Perform validation
	const result = performValidation(attributes);
	validationCache.set(cacheKey, result);
	
	return result;
}
```

### Testing Your Validation

```javascript
// Test your validation function
function testValidation() {
	const testCases = [
		{ attributes: { content: 'Valid content' }, expected: true },
		{ attributes: { content: '' }, expected: false },
		{ attributes: { content: '   ' }, expected: false },
		{ attributes: {}, expected: false },
	];
	
	testCases.forEach((testCase, index) => {
		const result = validateRequiredField(testCase.attributes);
		const passed = result === testCase.expected;
		
		console.log(`Test ${index + 1}: ${passed ? 'PASS' : 'FAIL'}`);
		console.log(`  Input:`, testCase.attributes);
		console.log(`  Expected: ${testCase.expected}, Got: ${result}`);
	});
}

// Run tests in browser console
testValidation();
```

---

For more examples and implementation details, see the [Integration Examples](integration-examples.md) and [API Reference](api-reference.md) for complete technical documentation. 
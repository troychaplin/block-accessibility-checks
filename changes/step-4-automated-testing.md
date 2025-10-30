# Step 4: Add Automated Testing - Implementation Plan

**Priority:** HIGH (for long-term maintenance)  
**Time Estimate:** 14-20 hours  
**Complexity:** HIGH  
**Branch:** `feature/automated-testing`  
**Date:** October 30, 2025  
**Status:** Ready for implementation

## Overview

Add comprehensive automated testing to catch regressions, prevent future dead code accumulation, and provide confidence when refactoring. Tests will serve as both quality gates and living documentation.

## Why This Matters

Automated tests would have caught the dead code we removed:
- ✅ Tests for `BlockConfig` would have failed (references non-existent methods)
- ✅ Tests for wrapper methods would show zero usage
- ✅ Tests for `run_checks()` would show it always returns empty array
- ✅ Future refactoring can be done with confidence

## Goals

1. **Prevent regressions** - Catch breaking changes before users do
2. **Document behavior** - Tests serve as usage examples
3. **Enable refactoring** - Change code with confidence
4. **Catch dead code** - Unused methods fail tests
5. **Improve code quality** - Writing testable code improves design

## Success Metrics

- 🎯 **60-70% code coverage** initially (critical paths)
- ✅ **All public API methods** have tests
- 🚀 **CI/CD pipeline** runs tests automatically
- 📚 **Tests serve as documentation** for how to use the plugin
- 🔄 **Tests run in under 2 minutes** for quick feedback

---

## Phase 1: PHPUnit Setup (2-3 hours)

### 1.1 Install PHPUnit Dependencies (30 minutes)

**Update `composer.json`:**

```json
{
  "require-dev": {
    "phpunit/phpunit": "^9.6",
    "yoast/phpunit-polyfills": "^2.0",
    "brain/monkey": "^2.6",
    "mockery/mockery": "^1.5"
  },
  "scripts": {
    "test": "phpunit",
    "test:coverage": "phpunit --coverage-html coverage"
  }
}
```

**Install:**
```bash
cd /path/to/block-accessibility-checks/
composer install --dev
```

### 1.2 Create PHPUnit Configuration (30 minutes)

**Create `phpunit.xml.dist`:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit
    bootstrap="tests/bootstrap.php"
    colors="true"
    convertErrorsToExceptions="true"
    convertNoticesToExceptions="true"
    convertWarningsToExceptions="true"
    stopOnFailure="false"
    verbose="true"
>
    <testsuites>
        <testsuite name="Unit Tests">
            <directory suffix="Test.php">./tests/Unit</directory>
        </testsuite>
        <testsuite name="Integration Tests">
            <directory suffix="Test.php">./tests/Integration</directory>
        </testsuite>
    </testsuites>

    <coverage>
        <include>
            <directory suffix=".php">./Functions</directory>
        </include>
        <exclude>
            <directory>./vendor</directory>
            <directory>./tests</directory>
        </exclude>
    </coverage>

    <php>
        <const name="WP_TESTS_PHPUNIT_POLYFILLS_PATH" value="vendor/yoast/phpunit-polyfills"/>
    </php>
</phpunit>
```

### 1.3 Create Test Bootstrap (30 minutes)

**Create `tests/bootstrap.php`:**

```php
<?php
/**
 * PHPUnit bootstrap file for Block Accessibility Checks
 */

// Composer autoloader
require_once dirname( __DIR__ ) . '/vendor/autoload.php';

// Brain Monkey setup
\Brain\Monkey\setUp();

// Mock WordPress functions
if ( ! function_exists( 'wp_parse_args' ) ) {
    function wp_parse_args( $args, $defaults = array() ) {
        return array_merge( $defaults, $args );
    }
}

if ( ! function_exists( 'sanitize_title' ) ) {
    function sanitize_title( $title ) {
        return strtolower( str_replace( ' ', '-', $title ) );
    }
}

// Define WordPress constants
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', '/tmp/wordpress/' );
}

if ( ! defined( 'WP_DEBUG' ) ) {
    define( 'WP_DEBUG', true );
}

if ( ! defined( 'WP_DEBUG_LOG' ) ) {
    define( 'WP_DEBUG_LOG', false );
}

if ( ! defined( 'WP_PLUGIN_DIR' ) ) {
    define( 'WP_PLUGIN_DIR', ABSPATH . 'wp-content/plugins' );
}
```

### 1.4 Create Test Directory Structure (15 minutes)

```bash
mkdir -p tests/Unit/Functions
mkdir -p tests/Integration
mkdir -p tests/Helpers
mkdir -p tests/Fixtures
```

**Directory Structure:**
```
tests/
├── bootstrap.php
├── Unit/
│   └── Functions/
│       ├── BlockChecksRegistryTest.php
│       ├── CoreBlockChecksTest.php
│       ├── SettingsPageTest.php
│       ├── PluginInitializerTest.php
│       └── HeadingLevelsTest.php
├── Integration/
│   └── FullPluginTest.php
├── Helpers/
│   └── TestCase.php
└── Fixtures/
    └── sample-blocks.json
```

### 1.5 Create Base Test Case (15 minutes)

**Create `tests/Helpers/TestCase.php`:**

```php
<?php
namespace BlockAccessibility\Tests\Helpers;

use PHPUnit\Framework\TestCase as PHPUnitTestCase;
use Brain\Monkey;

/**
 * Base test case for all tests
 */
class TestCase extends PHPUnitTestCase {
    
    protected function setUp(): void {
        parent::setUp();
        Monkey\setUp();
    }
    
    protected function tearDown(): void {
        Monkey\tearDown();
        parent::tearDown();
    }
    
    /**
     * Mock WordPress function
     */
    protected function mockWordPressFunction( $function_name, $return_value = null ) {
        Monkey\Functions\when( $function_name )->justReturn( $return_value );
    }
    
    /**
     * Mock WordPress filter
     */
    protected function mockFilter( $filter_name, $return_value ) {
        Monkey\Filters\expectApplied( $filter_name )->andReturn( $return_value );
    }
}
```

---

## Phase 2: PHP Unit Tests (8-12 hours)

### 2.1 BlockChecksRegistry Tests (3-4 hours)

**Create `tests/Unit/Functions/BlockChecksRegistryTest.php`:**

```php
<?php
namespace BlockAccessibility\Tests\Unit\Functions;

use BlockAccessibility\BlockChecksRegistry;
use BlockAccessibility\Tests\Helpers\TestCase;
use Brain\Monkey\Functions;

class BlockChecksRegistryTest extends TestCase {
    
    private $registry;
    
    protected function setUp(): void {
        parent::setUp();
        
        // Mock WordPress functions
        Functions\when('apply_filters')->returnArg(2);
        Functions\when('do_action')->justReturn(null);
        
        // Get registry instance
        $this->registry = BlockChecksRegistry::get_instance();
    }
    
    /** @test */
    public function it_registers_a_check_successfully() {
        $result = $this->registry->register_check(
            'core/test-block',
            'test_check',
            [
                'error_msg' => 'Test error message',
                'warning_msg' => 'Test warning message',
            ]
        );
        
        $this->assertTrue( $result );
    }
    
    /** @test */
    public function it_retrieves_registered_checks() {
        $this->registry->register_check(
            'core/test-block',
            'test_check',
            [
                'error_msg' => 'Test error',
                'warning_msg' => 'Test warning',
            ]
        );
        
        $checks = $this->registry->get_checks( 'core/test-block' );
        
        $this->assertIsArray( $checks );
        $this->assertArrayHasKey( 'test_check', $checks );
    }
    
    /** @test */
    public function it_unregisters_a_check() {
        $this->registry->register_check(
            'core/test-block',
            'test_check',
            ['error_msg' => 'Test']
        );
        
        $result = $this->registry->unregister_check( 'core/test-block', 'test_check' );
        
        $this->assertTrue( $result );
        $this->assertEmpty( $this->registry->get_checks( 'core/test-block' ) );
    }
    
    /** @test */
    public function it_enables_and_disables_checks() {
        $this->registry->register_check(
            'core/test-block',
            'test_check',
            ['error_msg' => 'Test']
        );
        
        $result = $this->registry->set_check_enabled( 'core/test-block', 'test_check', false );
        
        $this->assertTrue( $result );
    }
    
    /** @test */
    public function it_validates_required_parameters() {
        $result = $this->registry->register_check(
            'core/test-block',
            'test_check',
            [] // Missing error_msg
        );
        
        $this->assertFalse( $result );
    }
    
    /** @test */
    public function it_provides_default_values() {
        $this->registry->register_check(
            'core/test-block',
            'test_check',
            ['error_msg' => 'Test']
        );
        
        $config = $this->registry->get_check_config( 'core/test-block', 'test_check' );
        
        $this->assertEquals( 'settings', $config['type'] );
        $this->assertEquals( 10, $config['priority'] );
        $this->assertTrue( $config['enabled'] );
    }
    
    /** @test */
    public function it_sorts_checks_by_priority() {
        $this->registry->register_check(
            'core/test-block',
            'low_priority',
            ['error_msg' => 'Test', 'priority' => 20]
        );
        
        $this->registry->register_check(
            'core/test-block',
            'high_priority',
            ['error_msg' => 'Test', 'priority' => 5]
        );
        
        $checks = $this->registry->get_checks( 'core/test-block' );
        $keys = array_keys( $checks );
        
        $this->assertEquals( 'high_priority', $keys[0] );
        $this->assertEquals( 'low_priority', $keys[1] );
    }
    
    /** @test */
    public function it_gets_effective_check_level() {
        Functions\when('get_option')->justReturn([
            'core/test-block_test_check' => 'warning'
        ]);
        
        $this->registry->register_check(
            'core/test-block',
            'test_check',
            ['error_msg' => 'Test', 'type' => 'settings']
        );
        
        $level = $this->registry->get_effective_check_level( 'core/test-block', 'test_check' );
        
        $this->assertEquals( 'warning', $level );
    }
    
    /** @test */
    public function it_returns_all_registered_block_types() {
        $this->registry->register_check( 'core/button', 'test1', ['error_msg' => 'Test'] );
        $this->registry->register_check( 'core/image', 'test2', ['error_msg' => 'Test'] );
        
        $types = $this->registry->get_registered_block_types();
        
        $this->assertContains( 'core/button', $types );
        $this->assertContains( 'core/image', $types );
    }
}
```

### 2.2 CoreBlockChecks Tests (2 hours)

**Create `tests/Unit/Functions/CoreBlockChecksTest.php`:**

```php
<?php
namespace BlockAccessibility\Tests\Unit\Functions;

use BlockAccessibility\CoreBlockChecks;
use BlockAccessibility\BlockChecksRegistry;
use BlockAccessibility\Tests\Helpers\TestCase;
use Brain\Monkey\Functions;
use Mockery;

class CoreBlockChecksTest extends TestCase {
    
    /** @test */
    public function it_registers_button_checks() {
        Functions\when('apply_filters')->returnArg(2);
        Functions\when('do_action')->justReturn(null);
        Functions\when('__')->returnArg(1);
        
        $registry = BlockChecksRegistry::get_instance();
        $core_checks = new CoreBlockChecks( $registry );
        $core_checks->register_default_checks();
        
        $button_checks = $registry->get_checks( 'core/button' );
        
        $this->assertNotEmpty( $button_checks );
        $this->assertArrayHasKey( 'button_text_check', $button_checks );
        $this->assertArrayHasKey( 'button_link_check', $button_checks );
    }
    
    /** @test */
    public function it_registers_image_checks() {
        Functions\when('apply_filters')->returnArg(2);
        Functions\when('do_action')->justReturn(null);
        Functions\when('__')->returnArg(1);
        
        $registry = BlockChecksRegistry::get_instance();
        $core_checks = new CoreBlockChecks( $registry );
        $core_checks->register_default_checks();
        
        $image_checks = $registry->get_checks( 'core/image' );
        
        $this->assertNotEmpty( $image_checks );
        $this->assertArrayHasKey( 'image_alt_text', $image_checks );
    }
    
    /** @test */
    public function it_registers_heading_checks() {
        Functions\when('apply_filters')->returnArg(2);
        Functions\when('do_action')->justReturn(null);
        Functions\when('__')->returnArg(1);
        
        $registry = BlockChecksRegistry::get_instance();
        $core_checks = new CoreBlockChecks( $registry );
        $core_checks->register_default_checks();
        
        $heading_checks = $registry->get_checks( 'core/heading' );
        
        $this->assertNotEmpty( $heading_checks );
        $this->assertArrayHasKey( 'heading_rank_validation', $heading_checks );
    }
}
```

### 2.3 SettingsPage Tests (2 hours)

**Create `tests/Unit/Functions/SettingsPageTest.php`:**

```php
<?php
namespace BlockAccessibility\Tests\Unit\Functions;

use BlockAccessibility\SettingsPage;
use BlockAccessibility\BlockChecksRegistry;
use BlockAccessibility\Tests\Helpers\TestCase;
use Brain\Monkey\Functions;
use Brain\Monkey\Actions;

class SettingsPageTest extends TestCase {
    
    /** @test */
    public function it_initializes_settings_page() {
        Functions\when('add_action')->justReturn(true);
        
        $registry = Mockery::mock( BlockChecksRegistry::class );
        $settings = new SettingsPage( $registry );
        
        Actions\expectAdded('admin_menu')->once();
        Actions\expectAdded('admin_init')->once();
        
        $settings->init();
    }
    
    /** @test */
    public function it_sanitizes_settings_correctly() {
        Functions\when('sanitize_text_field')->returnArg(1);
        
        $registry = Mockery::mock( BlockChecksRegistry::class );
        $settings = new SettingsPage( $registry );
        
        $input = [
            'core/button_button_text_check' => 'error',
            'core/image_image_alt_text' => 'warning',
            'malicious_<script>' => 'value',
        ];
        
        // Test that sanitization happens
        // (Implementation depends on your sanitize method)
    }
}
```

### 2.4 Integration Test (1 hour)

**Create `tests/Integration/FullPluginTest.php`:**

```php
<?php
namespace BlockAccessibility\Tests\Integration;

use BlockAccessibility\PluginInitializer;
use BlockAccessibility\Tests\Helpers\TestCase;
use Brain\Monkey\Functions;

class FullPluginTest extends TestCase {
    
    /** @test */
    public function it_initializes_all_services() {
        Functions\when('add_action')->justReturn(true);
        Functions\when('apply_filters')->returnArg(2);
        Functions\when('load_plugin_textdomain')->justReturn(true);
        
        $initializer = new PluginInitializer( __FILE__ );
        
        $this->assertInstanceOf( PluginInitializer::class, $initializer );
    }
}
```

---

## Phase 3: Jest Setup for JavaScript (2-3 hours)

### 3.1 Install Jest Dependencies (30 minutes)

**Update `package.json`:**

```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@wordpress/jest-preset-default": "^11.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  },
  "scripts": {
    "test:js": "jest",
    "test:js:watch": "jest --watch",
    "test:js:coverage": "jest --coverage"
  }
}
```

**Install:**
```bash
npm install --save-dev
```

### 3.2 Create Jest Configuration (30 minutes)

**Create `jest.config.js`:**

```javascript
module.exports = {
    preset: '@wordpress/jest-preset-default',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/js/setup.js'],
    testMatch: [
        '<rootDir>/tests/js/**/*.test.js',
        '<rootDir>/src/**/*.test.js'
    ],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!src/**/index.js'
    ],
    coverageThreshold: {
        global: {
            statements: 60,
            branches: 50,
            functions: 60,
            lines: 60
        }
    },
    moduleNameMapper: {
        '\\.(css|scss)$': '<rootDir>/tests/js/__mocks__/styleMock.js'
    }
};
```

**Create `tests/js/setup.js`:**

```javascript
// Mock WordPress dependencies
global.wp = {
    hooks: {
        addFilter: jest.fn(),
        applyFilters: jest.fn(),
        addAction: jest.fn(),
        doAction: jest.fn()
    },
    blocks: {
        getBlockType: jest.fn(),
        registerBlockType: jest.fn()
    },
    data: {
        select: jest.fn(),
        dispatch: jest.fn()
    }
};

// Mock ba11ycData
global.ba11ycData = {
    blockChecks: {},
    userSettings: {},
    adminUrl: 'http://example.com/wp-admin/'
};
```

### 3.3 JavaScript Test Files (2 hours)

**Create `tests/js/validation/headingRankValidation.test.js`:**

```javascript
import { validateHeadingRank } from '../../../src/scripts/block-checks/headingRankValidation';

describe('Heading Rank Validation', () => {
    test('detects skipped heading levels', () => {
        const blocks = [
            { name: 'core/heading', attributes: { level: 2 } },
            { name: 'core/heading', attributes: { level: 4 } } // Skips H3
        ];
        
        const result = validateHeadingRank(blocks[1], blocks);
        
        expect(result).toHaveProperty('level', 'error');
        expect(result).toHaveProperty('message');
    });
    
    test('allows sequential heading levels', () => {
        const blocks = [
            { name: 'core/heading', attributes: { level: 2 } },
            { name: 'core/heading', attributes: { level: 3 } }
        ];
        
        const result = validateHeadingRank(blocks[1], blocks);
        
        expect(result).toBeNull();
    });
    
    test('allows same level headings', () => {
        const blocks = [
            { name: 'core/heading', attributes: { level: 2 } },
            { name: 'core/heading', attributes: { level: 2 } }
        ];
        
        const result = validateHeadingRank(blocks[1], blocks);
        
        expect(result).toBeNull();
    });
});
```

**Create `tests/js/validation/buttonValidation.test.js`:**

```javascript
import { validateButtonText, validateButtonLink } from '../../../src/scripts/block-checks/buttonValidation';

describe('Button Text Validation', () => {
    test('detects missing button text', () => {
        const attributes = { text: '' };
        
        const result = validateButtonText(attributes);
        
        expect(result).toHaveProperty('level', 'error');
    });
    
    test('allows button with text', () => {
        const attributes = { text: 'Click me' };
        
        const result = validateButtonText(attributes);
        
        expect(result).toBeNull();
    });
});

describe('Button Link Validation', () => {
    test('detects missing link URL', () => {
        const attributes = { url: '' };
        
        const result = validateButtonLink(attributes);
        
        expect(result).toHaveProperty('level', 'warning');
    });
    
    test('allows button with URL', () => {
        const attributes = { url: 'https://example.com' };
        
        const result = validateButtonLink(attributes);
        
        expect(result).toBeNull();
    });
});
```

---

## Phase 4: CI/CD Integration (2-3 hours)

### 4.1 GitHub Actions Workflow (1 hour)

**Create `.github/workflows/tests.yml`:**

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  php-tests:
    name: PHP Tests (PHP ${{ matrix.php }})
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        php: ['7.4', '8.0', '8.1', '8.2']
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ matrix.php }}
          coverage: xdebug
      
      - name: Install Composer dependencies
        run: composer install --prefer-dist --no-progress
      
      - name: Run PHPUnit tests
        run: vendor/bin/phpunit
      
      - name: Run PHPCS
        run: vendor/bin/phpcs --standard=WordPress Functions/
  
  javascript-tests:
    name: JavaScript Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Jest tests
        run: npm run test:js
      
      - name: Run ESLint
        run: npm run lint:js || true
  
  coverage:
    name: Code Coverage
    runs-on: ubuntu-latest
    needs: [php-tests, javascript-tests]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
          coverage: xdebug
      
      - name: Install Composer dependencies
        run: composer install
      
      - name: Generate coverage report
        run: vendor/bin/phpunit --coverage-clover coverage.xml
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

### 4.2 Add Status Badges (15 minutes)

**Update `README.md`:**

```markdown
# Block Accessibility Checks

[![Tests](https://github.com/your-username/block-accessibility-checks/workflows/Tests/badge.svg)](https://github.com/your-username/block-accessibility-checks/actions)
[![Coverage](https://codecov.io/gh/your-username/block-accessibility-checks/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/block-accessibility-checks)
[![License](https://img.shields.io/badge/license-GPL--2.0%2B-blue.svg)](LICENSE)
```

### 4.3 Pre-commit Hooks (30 minutes)

**Create `.git/hooks/pre-commit`:**

```bash
#!/bin/bash

echo "Running tests before commit..."

# Run PHP tests
vendor/bin/phpunit
if [ $? -ne 0 ]; then
    echo "PHP tests failed. Commit aborted."
    exit 1
fi

# Run JavaScript tests
npm run test:js
if [ $? -ne 0 ]; then
    echo "JavaScript tests failed. Commit aborted."
    exit 1
fi

echo "All tests passed!"
exit 0
```

---

## Phase 5: Documentation & Best Practices (1-2 hours)

### 5.1 Testing Guidelines Document

**Create `TESTING.md`:**

```markdown
# Testing Guidelines

## Running Tests

### PHP Tests
```bash
# Run all PHP tests
composer test

# Run specific test file
vendor/bin/phpunit tests/Unit/Functions/BlockChecksRegistryTest.php

# Generate coverage report
composer test:coverage
```

### JavaScript Tests
```bash
# Run all JS tests
npm run test:js

# Watch mode (re-run on changes)
npm run test:js:watch

# Coverage report
npm run test:js:coverage
```

## Writing Tests

### PHP Test Structure
- Place tests in `tests/Unit/Functions/`
- Name test files with `Test.php` suffix
- Extend `TestCase` base class
- Use descriptive test names: `it_does_something()`

### JavaScript Test Structure
- Place tests in `tests/js/` or co-locate with source
- Name test files with `.test.js` suffix
- Group related tests with `describe()`
- Use clear test descriptions

## Best Practices
1. Test one thing per test
2. Use descriptive names
3. Follow AAA pattern (Arrange, Act, Assert)
4. Mock external dependencies
5. Keep tests fast
```

### 5.2 Update CHANGELOG

```markdown
## [Unreleased]

### Added
- **Automated testing infrastructure**: Complete PHPUnit and Jest test suites
  - PHPUnit tests for all PHP classes
  - Jest tests for JavaScript validation logic
  - CI/CD pipeline via GitHub Actions
  - Code coverage reporting
  - Pre-commit hooks for local testing
  - 60%+ code coverage on critical paths
  
### Improved
- **Development workflow**: Tests catch regressions before deployment
- **Code quality**: Writing testable code improves architecture
- **Documentation**: Tests serve as usage examples
```

---

## Testing Checklist

### Setup
- [ ] Install PHPUnit via Composer
- [ ] Create phpunit.xml.dist
- [ ] Create test bootstrap file
- [ ] Set up test directory structure
- [ ] Install Jest and dependencies
- [ ] Create jest.config.js
- [ ] Create test setup file

### PHP Tests
- [ ] BlockChecksRegistry tests (10+ test methods)
- [ ] CoreBlockChecks tests (4+ test methods)
- [ ] SettingsPage tests (5+ test methods)
- [ ] PluginInitializer tests (3+ test methods)
- [ ] HeadingLevels tests (2+ test methods)
- [ ] Integration tests (full plugin initialization)

### JavaScript Tests
- [ ] Heading validation tests
- [ ] Button validation tests
- [ ] Image validation tests
- [ ] Table validation tests
- [ ] URL validation tests

### CI/CD
- [ ] Create GitHub Actions workflow
- [ ] Test on multiple PHP versions
- [ ] Set up coverage reporting
- [ ] Add status badges
- [ ] Configure pre-commit hooks

### Documentation
- [ ] Create TESTING.md
- [ ] Update CHANGELOG.md
- [ ] Add inline test documentation
- [ ] Document test patterns

---

## Timeline

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1 | PHPUnit Setup | 2-3 hours |
| Phase 2 | PHP Unit Tests | 8-12 hours |
| Phase 3 | Jest Setup & JS Tests | 2-3 hours |
| Phase 4 | CI/CD Integration | 2-3 hours |
| Phase 5 | Documentation | 1-2 hours |
| **Total** | | **15-23 hours** |

---

## Benefits Summary

✅ **Prevents Regressions** - Catch breaking changes early  
✅ **Living Documentation** - Tests show how code should be used  
✅ **Refactoring Confidence** - Change code without fear  
✅ **Dead Code Detection** - Unused code fails tests  
✅ **Quality Gates** - No merge without passing tests  
✅ **Developer Experience** - Fast feedback loop  

---

## Notes

- Start with unit tests for critical paths (60% coverage goal)
- Add integration tests as you go
- Don't aim for 100% coverage initially
- Focus on testing behavior, not implementation
- Keep tests fast (under 2 minutes total)
- Mock external dependencies (WordPress functions)

---

**Document Created:** October 30, 2025  
**Status:** Ready for implementation  
**Next Action:** Begin Phase 1 - PHPUnit Setup


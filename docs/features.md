# Validation API Features: Block Accessibility Checks Registry

This document highlights the key features and benefits of the Block Accessibility Checks Validation API, designed for plugin and block developers to extend, customize, and integrate accessibility validation in the WordPress block editor.

- **Extensible Check Registration (PHP)**  
  Register custom accessibility checks for any block type by defining configuration in PHP. PHP handles registration, settings, and metadata only—no validation logic.

- **JavaScript-Driven Validation**  
  All validation logic is implemented in JavaScript for real-time feedback in the block editor. PHP is not involved in validation execution.

- **Flexible Severity Levels**  
  Define each check as an error, warning, or settings-driven, allowing granular control over validation outcomes.

- **Customizable Messages and Metadata**  
  Provide unique error/warning messages, descriptions, and configuration for each check to improve user guidance.

- **Action and Filter Hooks (PHP)**  
  Use WordPress hooks to register and modify check configuration during registration. Validation logic uses JavaScript filters.

- **Registry API**  
  Access a robust API for registering, unregistering, enabling/disabling, and querying checks programmatically.

- **External Plugin Integration**  
  Integrate your own plugin or custom blocks with dedicated settings pages and validation logic, automatically supported by the API.

- **Settings Page Automation**  
  Checks registered with the API automatically appear in the admin settings UI for configuration by site admins.

- **Issue Categorization**  
  Categorize checks as either accessibility or validation issues, with separate display groups in the block editor for better user experience.

- **Multiple Issue Reporting**  
  Report all accessibility and validation issues for a block at once, with grouped and prioritized feedback in the editor UI.

- **Backward Compatibility**  
  Legacy check registration and message fields are supported for easier migration from older patterns.

## Developer Benefits

- **Rapid Integration**: Add accessibility validation to custom blocks or plugins with minimal code.
- **Full Extensibility**: Create new checks, override defaults, and tailor validation to your needs.
- **Real-Time Feedback**: Provide instant accessibility guidance to users as they edit content.
- **Seamless Admin Experience**: Checks and settings are automatically surfaced in the admin UI.
- **Unified PHP-JS Bridge**: Use PHP for configuration and JS for validation, keeping logic maintainable and performant.

For API details, integration patterns, and code examples, see the other documentation files in this directory.

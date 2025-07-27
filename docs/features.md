# Developer API Features: Block Accessibility Checks Registry

This document highlights the key features and benefits of the Block Accessibility Checks Developer API, designed for plugin and block developers to extend, customize, and integrate accessibility validation in the WordPress block editor.

- **Extensible Check Registration**  
  Register custom accessibility checks for any block type by defining configuration in PHP and implementing validation logic in JavaScript.

- **JavaScript-Driven Validation**  
  Implement all validation logic in JavaScript for real-time feedback and seamless block editor integration.

- **Flexible Severity Levels**  
  Define each check as an error, warning, or settings-driven, allowing granular control over validation outcomes.

- **Customizable Messages and Metadata**  
  Provide unique error/warning messages, descriptions, and configuration for each check to improve user guidance.

- **Action and Filter Hooks**  
  Use WordPress hooks to register, modify, or process checks and results at key points in the validation lifecycle.

- **Registry API**  
  Access a robust API for registering, unregistering, enabling/disabling, and querying checks programmatically.

- **External Plugin Integration**  
  Integrate your own plugin or custom blocks with dedicated settings pages and validation logic, automatically supported by the API.

- **Settings Page Automation**  
  Checks registered with the API automatically appear in the admin settings UI for configuration by site admins.

- **Multiple Issue Reporting**  
  Report all accessibility issues for a block at once, with grouped and prioritized feedback in the editor UI.

- **Backward Compatibility**  
  Legacy check registration and message fields are supported for easier migration from older patterns.

## Developer Benefits

- **Rapid Integration**: Add accessibility validation to custom blocks or plugins with minimal code.
- **Full Extensibility**: Create new checks, override defaults, and tailor validation to your needs.
- **Real-Time Feedback**: Provide instant accessibility guidance to users as they edit content.
- **Seamless Admin Experience**: Checks and settings are automatically surfaced in the admin UI.
- **Unified PHP-JS Bridge**: Use PHP for configuration and JS for validation, keeping logic maintainable and performant.

For API details, integration patterns, and code examples, see the other documentation files in this directory.

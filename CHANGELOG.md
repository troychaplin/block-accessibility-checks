# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Prefix the change with one of these keywords:

- _Added_: for new features.
- _Changed_: for changes in existing functionality.
- _Deprecated_: for soon-to-be removed features.
- _Removed_: for now removed features.
- _Fixed_: for any bug fixes.
- _Security_: in case of vulnerabilities.

## [Unreleased]

## Added

- Script helpers for block invalidations, checks and getting blocks in editor
- Higher order component to wrap invalid blocks
- Styles for invalid block wrapper
- Check core heading block to prevent publishing with an H1 in the content
- Check core table block to prevent publishing when a header row is not being used
- Check core image for alternative text
- Add attritbute to image block to confirm decorative image to bypass a11y error
- Instructions on setting up to run and build the plugin
- Getting involved instructions in the README
- Husky pre-commit check
- Commit lint and rules
- Git action to run build on PR to develop
- Git issue and PR templates to log features and tasks

## [0.1.0]

### Added

- Base files for initial plugin setup
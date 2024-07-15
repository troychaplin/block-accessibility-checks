# Block Accessibility Checks

Block Accessibility Checks is a WordPress plugin that helps ensures your content meets WCAG (Web Content Accessibility Guidelines) requirements. This plugin integrates seamlessly with the Gutenberg editor to check your core block configurations for accessibility issues, preventing users from publishing content that doesn't comply with WCAG standards.

## Features

- **Real-time Accessibility Checks:** Automatically checks core block configurations as you edit content in the Gutenberg editor.
- **Prevents Non-Compliant Publishing:** Blocks the publishing of content that fails to meet WCAG requirements.
- **User-Friendly Notifications:** Provides clear and actionable feedback to help users fix accessibility issues.

## Installation

- Upload the plugin files to the `/wp-content/plugins/`
- Activate the plugin through the `Plugins` screen in WordPress
- Start editing your content in the Gutenberg editor

## Getting Involved

Open a terminal window and navigate to where you intend to setup the repo and do the following:

- Install wp-env: `npm -g i @wordpress/env`
- Clone the repo: `git clone https://github.com/troychaplin/block-accessibility-checks.git`
- Navigate into the repo: `cd block-accessibility-checks`
- Install dependencies: `npm install`

### Start Developing

This repo uses [@wordpress/env](https://github.com/WordPress/gutenberg/tree/HEAD/packages/env#readme) that setups up a local WordPress environment using Docker.

- Make sure `Docker Desktop` is running
- Start WordPress: `wp-env start`

#### Other Commands

- Stop WordPress: `wp-env stop`
- Start watch task: `npm run start`
- Build assets: `npm run build`

### Local Site Details

- http://localhost:8888
- User: `admin`
- Password: `password`

**Important:** when you're done working don't forget to stop the WordPress docker environment by running `npm run wp:down`

## Report an Issue or Bug

TODO: add git issue templates

---

## Block Checks

The following is a list of checks that are happening on core blocks:

### Heading

- `Prevent using an H1 in the content area` - Best practices show that there should only be one unique H1 used per page, which is typically used for the page title
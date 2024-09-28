# Block Accessibility Checks

Block Accessibility Checks is a WordPress plugin that helps ensures your content meets WCAG (Web Content Accessibility Guidelines) requirements. This plugin integrates seamlessly with the Gutenberg editor to check your core block configurations for accessibility issues, preventing users from publishing content that doesn't comply with WCAG standards.

## Features

-   **Real-time Accessibility Checks:** Automatically checks core block configurations as you edit content in the Gutenberg editor.
-   **Prevents Non-Compliant Publishing:** Blocks the publishing of content that fails to meet WCAG requirements.
-   **User-Friendly Notifications:** Provides clear and actionable feedback to help users fix accessibility issues.

## Installation

-   Upload the plugin files to the `/wp-content/plugins/`
-   Activate the plugin through the `Plugins` screen in WordPress
-   Start editing your content in the Gutenberg editor

## Getting Involved

If you would like to get involved and help make this plugin better that would be awesome! We all win with more accessible content.

### Get Started

To get started do the following:

-   Fork this repo
-   Create a branch off of `main`
-   Open a terminal window and clone your fork
-   Using a terminal run the following inside the forked repo
    -   `npm -g i @wordpress/env` -- installs wp-env if you don't already have it
    -   `npm install` -- installs dependencies for this project

### Start Developing

This repo uses [@wordpress/env](https://github.com/WordPress/gutenberg/tree/HEAD/packages/env#readme) that setups up a local WordPress environment using Docker.

-   Make sure `Docker Desktop` is running
-   Start WordPress: `wp-env start`

#### Other Commands

-   Stop WordPress: `wp-env stop`
-   Start watch task: `npm run start`
-   Build assets: `npm run build`

## Finishing a Branch

When you are done developing a feature or a fix:

-   Create a PR from your branch into the primary repo.

### Local Site Details

-   http://localhost:8888
-   User: `admin`
-   Password: `password`

**Important:** when you're done working don't forget to stop the WordPress docker environment by running `npm run wp:down`

## Report an Issue or Bug

TODO: add git issue templates

# Block Checks and Modifications

The following is a list of checks that are happening on core blocks.

| Block        | Description                                                                     |
| ------------ | ------------------------------------------------------------------------------- |
| core/button  | Checks for text and link on each button                                         |
| core/heading | Prevents the usage of an level one heading in the content                       |
| core/gallery | Checks for alternative text on an image                                         |
| core/image   | Checks for alternative text on an image                                         |
| core/image   | Adds a toggle to confirm image use as decorative allowing for bypass a11y check |
| core/table   | Checks for a table header row on each individual table block                    |

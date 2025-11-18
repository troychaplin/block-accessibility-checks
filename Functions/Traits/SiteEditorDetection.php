<?php
/**
 * Site Editor Detection Trait
 *
 * Provides shared functionality for detecting if we're in the WordPress Site Editor.
 *
 * @package BlockAccessibilityChecks
 * @since 1.3.0
 */

namespace BlockAccessibility\Traits;

/**
 * Site Editor Detection Trait
 *
 * Shared method for detecting the Site Editor context using multiple detection methods.
 */
trait SiteEditorDetection {

	/**
	 * Check if we're in the Site Editor.
	 *
	 * Uses multiple detection methods to reliably identify the Site Editor context.
	 *
	 * @return bool True if in Site Editor, false otherwise.
	 */
	private function is_site_editor(): bool {
		// Method 1: Check current screen ID.
		// Only check if get_current_screen() is available (requires admin context).
		if ( function_exists( 'get_current_screen' ) ) {
			$current_screen = \get_current_screen();
			if ( $current_screen ) {
				// Various screen IDs that indicate Site Editor.
				$site_editor_screens = array(
					'appearance_page_gutenberg-edit-site',
					'site-editor',
				);
				if ( in_array( $current_screen->id, $site_editor_screens, true ) ) {
					return true;
				}
			}
		}

		// Method 2: Check post type if we have a post context.
		global $post;
		if ( isset( $post ) && $post ) {
			$post_type = $post->post_type;
			// Site Editor usually edits these post types.
			if ( in_array( $post_type, array( 'wp_template', 'wp_template_part' ), true ) ) {
				return true;
			}
		}

		// Method 3: Check for Site Editor via GET parameter or other indicators.
		// The Site Editor can be accessed via various routes.
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Context detection only, not processing form data.
		if ( isset( $_GET['postType'] ) ) {
			$post_type = sanitize_text_field( wp_unslash( $_GET['postType'] ) );
			if ( in_array( $post_type, array( 'wp_template', 'wp_template_part' ), true ) ) {
				return true;
			}
		}

		// Method 4: Check for Site Editor via pagenow global variable.
		global $pagenow;
		if ( isset( $pagenow ) && 'site-editor.php' === $pagenow ) {
			return true;
		}

		// Method 5: Check for Site Editor via REQUEST_URI.
		if ( isset( $_SERVER['REQUEST_URI'] ) ) {
			$request_uri = sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) );
			if ( strpos( $request_uri, 'site-editor.php' ) !== false || strpos( $request_uri, 'site-editor' ) !== false ) {
				return true;
			}
		}

		// Method 6: Check if we're editing a template or template part via GET parameter.
		if ( isset( $_GET['post'] ) ) {
			$post_id = intval( $_GET['post'] );
			if ( $post_id > 0 ) {
				$post_type = \get_post_type( $post_id );
				if ( in_array( $post_type, array( 'wp_template', 'wp_template_part' ), true ) ) {
					return true;
				}
			}
		}
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		return false;
	}
}

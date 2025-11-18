<?php
/**
 * Editor Detection Trait
 *
 * Provides shared functionality for detecting if we're in the WordPress content editor
 * (post/page/custom post types), excluding the Site Editor.
 *
 * @package BlockAccessibilityChecks
 * @since 1.3.0
 */

namespace BlockAccessibility\Traits;

/**
 * Editor Detection Trait
 *
 * Shared method for detecting the content editor context (all post types except templates).
 */
trait EditorDetection {

	/**
	 * Check if we're in the content editor (any post type except Site Editor templates).
	 *
	 * @return bool True if in content editor, false otherwise.
	 */
	private function is_content_editor(): bool {
		// Must be in admin context.
		if ( ! \is_admin() ) {
			return false;
		}

		// Exclude Site Editor post types.
		$site_editor_post_types = array( 'wp_template', 'wp_template_part' );

		// Step 1: Explicitly exclude Site Editor.
		// Check screen ID for Site Editor.
		if ( function_exists( 'get_current_screen' ) ) {
			$current_screen = \get_current_screen();
			if ( $current_screen ) {
				$site_editor_screens = array(
					'appearance_page_gutenberg-edit-site',
					'site-editor',
				);
				if ( in_array( $current_screen->id, $site_editor_screens, true ) ) {
					return false;
				}
			}
		}

		// Check $pagenow for Site Editor.
		global $pagenow;
		if ( isset( $pagenow ) && 'site-editor.php' === $pagenow ) {
			return false;
		}

		// Step 2: Check if we're in content editor (post.php or post-new.php).
		// This is the standard WordPress route for content editing.
		if ( isset( $pagenow ) && in_array( $pagenow, array( 'post.php', 'post-new.php' ), true ) ) {
			// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Context detection only.
			// Verify the post type is not a Site Editor template.
			if ( isset( $_GET['post'] ) ) {
				$post_id = intval( $_GET['post'] );
				if ( $post_id > 0 ) {
					$post_type = \get_post_type( $post_id );
					return $post_type && ! in_array( $post_type, $site_editor_post_types, true );
				}
			} elseif ( isset( $_GET['post_type'] ) ) {
				$post_type = sanitize_text_field( wp_unslash( $_GET['post_type'] ) );
				return ! in_array( $post_type, $site_editor_post_types, true );
			} else {
				// Default is 'post' (not a template).
				return true;
			}
			// phpcs:enable WordPress.Security.NonceVerification.Recommended
		}

		// Step 3: Fallback - check screen post type if available.
		if ( function_exists( 'get_current_screen' ) ) {
			$current_screen = \get_current_screen();
			if ( $current_screen && isset( $current_screen->post_type ) ) {
				return ! in_array( $current_screen->post_type, $site_editor_post_types, true );
			}
		}

		return false;
	}
}

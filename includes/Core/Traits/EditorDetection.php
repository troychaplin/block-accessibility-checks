<?php
/**
 * Editor Detection Trait
 *
 * Provides shared functionality for detecting the current WordPress editor context,
 * including post editor (default and template views) and site editor.
 *
 * @package BlockAccessibilityChecks
 * @since 1.3.0
 */

namespace BlockAccessibility\Core\Traits;

/**
 * Editor Detection Trait
 *
 * Detects the current editor context to enable validation across multiple editing environments:
 * - Post Editor (default view): Editing post/page content without template visible
 * - Post Editor (template view): Editing post/page with template blocks visible
 * - Site Editor: Editing templates and template parts directly
 */
trait EditorDetection {

	/**
	 * Get the current editor context.
	 *
	 * Determines which editor environment we're currently in. This affects how
	 * validation is applied and which blocks should be validated.
	 *
	 * @return string One of: 'post-editor', 'post-editor-template', 'site-editor', 'none'.
	 */
	private function get_editor_context(): string {
		// Must be in admin context.
		if ( ! \is_admin() ) {
			return 'none';
		}

		global $pagenow;

		// Site Editor post types.
		$site_editor_post_types = array( 'wp_template', 'wp_template_part' );

		// Check if we're in the Site Editor.
		if ( $this->is_site_editor_context() ) {
			return 'site-editor';
		}

		// Check if we're in the post editor (post.php or post-new.php).
		if ( isset( $pagenow ) && in_array( $pagenow, array( 'post.php', 'post-new.php' ), true ) ) {
			// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Context detection only.
			// Verify the post type is not a Site Editor template.
			if ( isset( $_GET['post'] ) ) {
				$post_id = intval( $_GET['post'] );
				if ( $post_id > 0 ) {
					$post_type = \get_post_type( $post_id );
					if ( $post_type && ! in_array( $post_type, $site_editor_post_types, true ) ) {
						// For now, return 'post-editor' - JavaScript will determine if template is shown.
						return 'post-editor';
					}
				}
			} elseif ( isset( $_GET['post_type'] ) ) {
				$post_type = sanitize_text_field( wp_unslash( $_GET['post_type'] ) );
				if ( ! in_array( $post_type, $site_editor_post_types, true ) ) {
					return 'post-editor';
				}
			} else {
				// Default is 'post' (not a template).
				return 'post-editor';
			}
			// phpcs:enable WordPress.Security.NonceVerification.Recommended
		}

		// Fallback - check screen post type if available.
		if ( function_exists( 'get_current_screen' ) ) {
			$current_screen = \get_current_screen();
			if ( $current_screen && isset( $current_screen->post_type ) ) {
				if ( ! in_array( $current_screen->post_type, $site_editor_post_types, true ) ) {
					return 'post-editor';
				}
			}
		}

		return 'none';
	}

	/**
	 * Check if we're in the Site Editor context.
	 *
	 * @return bool True if in Site Editor, false otherwise.
	 */
	private function is_site_editor_context(): bool {
		// Check screen ID for Site Editor.
		if ( function_exists( 'get_current_screen' ) ) {
			$current_screen = \get_current_screen();
			if ( $current_screen ) {
				$site_editor_screens = array(
					'appearance_page_gutenberg-edit-site',
					'site-editor',
				);
				if ( in_array( $current_screen->id, $site_editor_screens, true ) ) {
					return true;
				}
			}
		}

		// Check $pagenow for Site Editor.
		global $pagenow;
		if ( isset( $pagenow ) && 'site-editor.php' === $pagenow ) {
			return true;
		}

		// Check for Site Editor post types being edited.
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Context detection only.
		if ( isset( $_GET['postType'] ) ) {
			$post_type = sanitize_text_field( wp_unslash( $_GET['postType'] ) );
			if ( in_array( $post_type, array( 'wp_template', 'wp_template_part' ), true ) ) {
				return true;
			}
		}
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		return false;
	}

	/**
	 * Check if we're in any post editor context (default or template view).
	 *
	 * @return bool True if in post editor, false otherwise.
	 */
	private function is_post_editor(): bool {
		$context = $this->get_editor_context();
		return in_array( $context, array( 'post-editor', 'post-editor-template' ), true );
	}

	/**
	 * Check if we're in the Site Editor.
	 *
	 * @return bool True if in site editor, false otherwise.
	 */
	private function is_site_editor(): bool {
		return 'site-editor' === $this->get_editor_context();
	}

	/**
	 * Check if validation assets should be loaded in the current context.
	 *
	 * Validation is supported in:
	 * - Post editor (default and template views)
	 * - Site editor
	 *
	 * @return bool True if validation should be loaded, false otherwise.
	 */
	private function should_load_validation(): bool {
		$context = $this->get_editor_context();
		return in_array( $context, array( 'post-editor', 'post-editor-template', 'site-editor' ), true );
	}
}

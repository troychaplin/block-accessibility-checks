<?php
/**
 * Settings
 *
 * Registers the single top-level admin menu page that hosts the DataViews
 * settings app. All check configuration happens in that React app via REST;
 * this class only registers the menu and renders the mount point.
 *
 * @package BlockAccessibilityChecks
 */

namespace BlockAccessibility\Core;

use BlockAccessibility\Core\Traits\Logger;

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Settings
 *
 * Registers the consolidated settings page.
 */
class Settings {

	use Logger;

	/**
	 * The menu slug for the settings page.
	 *
	 * @var string
	 */
	const MENU_SLUG = 'block-a11y-checks';

	/**
	 * Legacy submenu slugs that should redirect to the unified page.
	 *
	 * @var array
	 */
	private const LEGACY_SLUGS = array(
		'block-a11y-checks-post-page',
	);

	/**
	 * Constructor.
	 */
	public function __construct() {
		\add_action( 'admin_menu', array( $this, 'register_menu' ) );
		\add_action( 'admin_init', array( $this, 'redirect_legacy_pages' ) );
	}

	/**
	 * Register the top-level settings menu page.
	 *
	 * @return void
	 */
	public function register_menu(): void {
		\add_menu_page(
			\esc_html__( 'Block Checks', 'block-accessibility-checks' ),
			\esc_html__( 'Block Checks', 'block-accessibility-checks' ),
			'manage_options',
			self::MENU_SLUG,
			array( $this, 'render_page' ),
			'dashicons-universal-access',
			81
		);
	}

	/**
	 * Render the settings page mount point.
	 *
	 * Deliberately omits the usual `.wrap` container: the React app draws its own
	 * page chrome edge to edge, and `.wrap`'s margins would leave the admin's grey
	 * background showing around it.
	 *
	 * The chrome overrides are inlined here rather than shipped in the bundled
	 * stylesheet so they apply on first paint, before the CSS file loads — otherwise
	 * the page renders at default admin width and then visibly snaps to full bleed.
	 * They are scoped to `body.js` so a browser without JavaScript keeps the normal
	 * admin layout instead of a broken blank page.
	 *
	 * @return void
	 */
	public function render_page(): void {
		if ( ! \current_user_can( 'manage_options' ) ) {
			\wp_die( \esc_html__( 'You do not have sufficient permissions to access this page.', 'block-accessibility-checks' ) );
		}

		?>
		<style>
			#wpwrap { overflow-y: auto; }
			body.js #wpcontent { padding-inline-start: 0; }
			body.js #wpbody-content { padding-bottom: 0; }
			body.js #wpfooter { display: none; }

			@media (min-width: 782px) {
				#wpwrap { overflow-y: initial; }
			}
		</style>
		<?php
		// Gives WordPress a defined anchor for admin notices; without it they are
		// injected at an arbitrary point relative to the React root.
		echo '<hr class="wp-header-end">';
		echo '<div id="ba11yc-settings-root"></div>';
	}

	/**
	 * Redirect any bookmarked legacy submenu slugs to the unified page.
	 *
	 * @return void
	 */
	public function redirect_legacy_pages(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only page param for a redirect.
		$page = isset( $_GET['page'] ) ? \sanitize_text_field( \wp_unslash( $_GET['page'] ) ) : '';

		if ( '' === $page ) {
			return;
		}

		$is_legacy = in_array( $page, self::LEGACY_SLUGS, true )
			|| 0 === strpos( $page, 'block-a11y-checks-' );

		if ( $is_legacy && self::MENU_SLUG !== $page ) {
			\wp_safe_redirect( \admin_url( 'admin.php?page=' . self::MENU_SLUG ) );
			exit;
		}
	}
}

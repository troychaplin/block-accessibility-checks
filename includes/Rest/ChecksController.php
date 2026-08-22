<?php
/**
 * REST API: Checks Controller
 *
 * Exposes all registered validation checks via the REST API for the settings UI.
 *
 * @package BlockAccessibilityChecks
 * @since   4.0.0
 */

namespace BlockAccessibility\Rest;

use BlockAccessibility\AbstractRegistry;
use BlockAccessibility\Block\Registry as BlockRegistry;
use BlockAccessibility\Meta\Registry as MetaRegistry;
use BlockAccessibility\Editor\Registry as EditorRegistry;
use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Response;
use WP_Error;

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST controller for reading registered validation checks.
 *
 * Provides a single read-only endpoint that returns all checks from the Block,
 * Meta, and Editor registries, including plugin attribution.
 */
class ChecksController extends WP_REST_Controller {

	/**
	 * The namespace for this controller's routes.
	 *
	 * @var string
	 */
	protected $namespace = 'block-accessibility-checks/v1';

	/**
	 * The base for this controller's routes.
	 *
	 * @var string
	 */
	protected $rest_base = 'checks';

	/**
	 * Register the routes for this controller.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Check if the current user has permission to read checks.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has access, WP_Error otherwise.
	 */
	public function get_items_permissions_check( $request ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'Sorry, you are not allowed to view registered checks.', 'block-accessibility-checks' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		return true;
	}

	/**
	 * Retrieve all registered checks from all three registries.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response Response containing all registered checks.
	 */
	public function get_items( $request ): WP_REST_Response {
		$data = array(
			'block'  => $this->prepare_block_checks( BlockRegistry::get_instance() ),
			'meta'   => $this->prepare_meta_checks( MetaRegistry::get_instance() ),
			'editor' => $this->prepare_editor_checks( EditorRegistry::get_instance() ),
		);

		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * Prepare block checks for the response.
	 *
	 * @param BlockRegistry $registry The block checks registry.
	 * @return array Formatted block checks.
	 */
	private function prepare_block_checks( BlockRegistry $registry ): array {
		$all_checks = $registry->get_all_checks();
		$result     = array();

		foreach ( $all_checks as $block_type => $checks ) {
			$result[ $block_type ] = array();

			foreach ( $checks as $check_name => $check_args ) {
				$result[ $block_type ][ $check_name ] = $this->format_check( $check_args );
			}
		}

		return $result;
	}

	/**
	 * Prepare meta checks for the response.
	 *
	 * @param MetaRegistry $registry The meta checks registry.
	 * @return array Formatted meta checks.
	 */
	private function prepare_meta_checks( MetaRegistry $registry ): array {
		$all_checks = $registry->get_all_meta_checks();
		$result     = array();

		foreach ( $all_checks as $post_type => $meta_keys ) {
			$result[ $post_type ] = array();

			foreach ( $meta_keys as $meta_key => $checks ) {
				$result[ $post_type ][ $meta_key ] = array();

				foreach ( $checks as $check_name => $check_args ) {
					$result[ $post_type ][ $meta_key ][ $check_name ] = $this->format_check( $check_args );
				}
			}
		}

		return $result;
	}

	/**
	 * Prepare editor checks for the response.
	 *
	 * @param EditorRegistry $registry The editor checks registry.
	 * @return array Formatted editor checks.
	 */
	private function prepare_editor_checks( EditorRegistry $registry ): array {
		$all_checks = $registry->get_all_editor_checks();
		$result     = array();

		foreach ( $all_checks as $post_type => $checks ) {
			$result[ $post_type ] = array();

			foreach ( $checks as $check_name => $check_args ) {
				$result[ $post_type ][ $check_name ] = $this->format_check( $check_args );
			}
		}

		return $result;
	}

	/**
	 * Format a single check for the REST response.
	 *
	 * @param array $check_args The raw check arguments from the registry.
	 * @return array The formatted check data.
	 */
	private function format_check( array $check_args ): array {
		$namespace = $check_args['_namespace'] ?? null;

		return array(
			'title'        => $check_args['title'] ?? '',
			'level'        => $check_args['level'] ?? 'error',
			'category'     => $check_args['category'] ?? 'accessibility',
			'description'  => $check_args['description'] ?? '',
			'error_msg'    => $check_args['error_msg'] ?? '',
			'warning_msg'  => $check_args['warning_msg'] ?? '',
			'priority'     => $check_args['priority'] ?? 10,
			'enabled'      => $check_args['enabled'] ?? true,
			'configurable' => $check_args['configurable'] ?? true,
			'_namespace'   => $namespace,
			// Resolved here rather than at registration: a plugin may declare its
			// namespace title before or after registering its checks.
			'plugin_title' => is_string( $namespace ) ? AbstractRegistry::get_namespace_title( $namespace ) : '',
		);
	}
}

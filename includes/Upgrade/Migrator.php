<?php
/**
 * Data Migrator
 *
 * Migrates v3 settings (multiple flat-keyed options) into the single nested
 * ba11yc_settings option introduced in v4.0.0.
 *
 * Runs once on a late `init` so the registries are fully populated and can be
 * used as the source of truth for splitting concatenated option keys (block
 * types contain "/" but old keys join block_type and check_name with "_").
 *
 * @package BlockAccessibilityChecks
 * @since   4.0.0
 */

namespace BlockAccessibility\Upgrade;

use BlockAccessibility\Core\Traits\Logger;
use BlockAccessibility\Block\Registry as BlockRegistry;
use BlockAccessibility\Meta\Registry as MetaRegistry;
use BlockAccessibility\Editor\Registry as EditorRegistry;
use BlockAccessibility\Rest\SettingsController;

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles the one-time v3 -> v4 data migration.
 */
class Migrator {

	use Logger;

	/**
	 * Option storing the migrated db version.
	 *
	 * @var string
	 */
	const DB_VERSION_OPTION = 'ba11yc_db_version';

	/**
	 * Valid level values.
	 *
	 * @var array
	 */
	const VALID_LEVELS = array( 'error', 'warning', 'none' );

	/**
	 * Hook the migration check onto a late init.
	 *
	 * @return void
	 */
	public function register(): void {
		// Priority 99: after CoreChecks and add-on plugins have registered on init.
		add_action( 'init', array( $this, 'maybe_migrate' ), 99 );
	}

	/**
	 * Run the migration if the stored db version is behind the plugin version.
	 *
	 * @return void
	 */
	public function maybe_migrate(): void {
		$db_version = get_option( self::DB_VERSION_OPTION, '0' );

		if ( version_compare( $db_version, '4.0.0', '>=' ) ) {
			return;
		}

		// Don't clobber settings that already exist (e.g. a re-run after a partial v4 install).
		if ( false === get_option( SettingsController::OPTION_KEY, false ) ) {
			$migrated = $this->migrate_v3_to_v4();
			update_option( SettingsController::OPTION_KEY, $migrated, true );
			$this->log_debug( 'Completed v3 -> v4 settings migration.' );
		}

		update_option( self::DB_VERSION_OPTION, '4.0.0' );
	}

	/**
	 * Build the new ba11yc_settings structure from legacy options.
	 *
	 * @return array The migrated settings.
	 */
	public function migrate_v3_to_v4(): array {
		$out = array();

		$this->migrate_core_block_options( $out );
		$this->migrate_meta_editor_options( $out );
		$this->migrate_external_options( $out );

		return $out;
	}

	/**
	 * Migrate block_checks_options (core block levels, heading levels, site-editor flags).
	 *
	 * @param array $out Reference to the accumulator.
	 * @return void
	 */
	private function migrate_core_block_options( array &$out ): void {
		$options = get_option( 'block_checks_options', array() );
		if ( ! is_array( $options ) ) {
			return;
		}

		$block_candidates = $this->block_key_candidates();

		foreach ( $options as $key => $value ) {
			if ( 'core_heading_levels' === $key ) {
				if ( is_array( $value ) ) {
					$out['general']['headingLevels'] = array_values( array_filter( array_map( 'strval', $value ) ) );
				}
				continue;
			}

			// Per-check site-editor flag: "{block_type}_{check}_site_editor".
			if ( $this->str_ends_with_compat( $key, '_site_editor' ) ) {
				$base  = substr( $key, 0, -strlen( '_site_editor' ) );
				$split = $this->split_with_candidates( $base, $block_candidates );
				if ( null !== $split ) {
					$out['siteEditor']['block'][ $split[0] ][ $split[1] ] = (bool) $value;
				}
				continue;
			}

			// Level override: "{block_type}_{check}".
			if ( in_array( $value, self::VALID_LEVELS, true ) ) {
				$split = $this->split_with_candidates( $key, $block_candidates );
				if ( null !== $split ) {
					$out['block'][ $split[0] ][ $split[1] ] = $value;
				}
			}
		}
	}

	/**
	 * Migrate block_checks_meta_{post_type} options (editor + meta checks for core post types).
	 *
	 * @param array $out Reference to the accumulator.
	 * @return void
	 */
	private function migrate_meta_editor_options( array &$out ): void {
		$editor_registry = EditorRegistry::get_instance();
		$meta_registry   = MetaRegistry::get_instance();

		$post_types = array_unique(
			array_merge(
				array_keys( $editor_registry->get_all_editor_checks() ),
				array_keys( $meta_registry->get_all_meta_checks() )
			)
		);

		foreach ( $post_types as $post_type ) {
			$options = get_option( 'block_checks_meta_' . $post_type, array() );
			if ( ! is_array( $options ) || empty( $options ) ) {
				continue;
			}

			$meta_candidates = $this->meta_key_candidates( $post_type );

			foreach ( $options as $key => $value ) {
				if ( ! in_array( $value, self::VALID_LEVELS, true ) ) {
					continue;
				}

				// Editor checks stored as "editor_{check}".
				if ( 0 === strpos( $key, 'editor_' ) ) {
					$check = substr( $key, strlen( 'editor_' ) );
					if ( null !== $editor_registry->get_editor_check_config( $post_type, $check ) ) {
						$out['editor'][ $post_type ][ $check ] = $value;
					}
					continue;
				}

				// Meta checks stored as "{meta_key}_{check}".
				$split = $this->split_with_candidates( $key, $meta_candidates );
				if ( null !== $split ) {
					$out['meta'][ $post_type ][ $split[0] ][ $split[1] ] = $value;
				}
			}
		}
	}

	/**
	 * Migrate all block_checks_external_{slug} options.
	 *
	 * @param array $out Reference to the accumulator.
	 * @return void
	 */
	private function migrate_external_options( array &$out ): void {
		$all_options      = wp_load_alloptions();
		$block_candidates = $this->block_key_candidates();

		foreach ( $all_options as $option_name => $unused ) {
			if ( 0 !== strpos( $option_name, 'block_checks_external_' ) ) {
				continue;
			}

			$options = get_option( $option_name, array() );
			if ( ! is_array( $options ) ) {
				continue;
			}

			foreach ( $options as $key => $value ) {
				$is_site_editor = $this->str_ends_with_compat( $key, '_site_editor' );
				$base           = $is_site_editor ? substr( $key, 0, -strlen( '_site_editor' ) ) : $key;

				if ( ! $is_site_editor && ! in_array( $value, self::VALID_LEVELS, true ) ) {
					continue;
				}

				// Editor: "editor_{post_type}_{check}".
				if ( 0 === strpos( $base, 'editor_' ) ) {
					$remainder = substr( $base, strlen( 'editor_' ) );
					$split     = $this->split_editor_external( $remainder );
					if ( null !== $split ) {
						if ( $is_site_editor ) {
							$out['siteEditor']['editor'][ $split[0] ][ $split[1] ] = (bool) $value;
						} else {
							$out['editor'][ $split[0] ][ $split[1] ] = $value;
						}
					}
					continue;
				}

				// Meta: "meta_{post_type}_{meta_key}_{check}".
				if ( 0 === strpos( $base, 'meta_' ) ) {
					$split = $this->split_meta_external( substr( $base, strlen( 'meta_' ) ) );
					if ( null !== $split ) {
						if ( $is_site_editor ) {
							$out['siteEditor']['meta'][ $split[0] ][ $split[1] ][ $split[2] ] = (bool) $value;
						} else {
							$out['meta'][ $split[0] ][ $split[1] ][ $split[2] ] = $value;
						}
					}
					continue;
				}

				// Block: "{block_type}_{check}".
				$split = $this->split_with_candidates( $base, $block_candidates );
				if ( null !== $split ) {
					if ( $is_site_editor ) {
						$out['siteEditor']['block'][ $split[0] ][ $split[1] ] = (bool) $value;
					} else {
						$out['block'][ $split[0] ][ $split[1] ] = $value;
					}
				}
			}
		}
	}

	/**
	 * Build the list of valid "{block_type}_{check_name}" => [block_type, check_name] candidates.
	 *
	 * @return array Map of concatenated key => [block_type, check_name].
	 */
	private function block_key_candidates(): array {
		$candidates = array();
		foreach ( BlockRegistry::get_instance()->get_all_checks() as $block_type => $checks ) {
			foreach ( $checks as $check_name => $unused ) {
				$candidates[ $block_type . '_' . $check_name ] = array( $block_type, $check_name );
			}
		}
		return $candidates;
	}

	/**
	 * Build the list of valid "{meta_key}_{check_name}" => [meta_key, check_name] candidates for a post type.
	 *
	 * @param string $post_type The post type.
	 * @return array Map of concatenated key => [meta_key, check_name].
	 */
	private function meta_key_candidates( string $post_type ): array {
		$candidates = array();
		foreach ( MetaRegistry::get_instance()->get_meta_checks( $post_type ) as $meta_key => $checks ) {
			foreach ( $checks as $check_name => $unused ) {
				$candidates[ $meta_key . '_' . $check_name ] = array( $meta_key, $check_name );
			}
		}
		return $candidates;
	}

	/**
	 * Split an external editor remainder "{post_type}_{check}" using the registry.
	 *
	 * @param string $remainder The remainder after "editor_".
	 * @return array|null [post_type, check_name] or null.
	 */
	private function split_editor_external( string $remainder ): ?array {
		foreach ( EditorRegistry::get_instance()->get_all_editor_checks() as $post_type => $checks ) {
			foreach ( $checks as $check_name => $unused ) {
				if ( $post_type . '_' . $check_name === $remainder ) {
					return array( $post_type, $check_name );
				}
			}
		}
		return null;
	}

	/**
	 * Split an external meta remainder "{post_type}_{meta_key}_{check}" using the registry.
	 *
	 * @param string $remainder The remainder after "meta_".
	 * @return array|null [post_type, meta_key, check_name] or null.
	 */
	private function split_meta_external( string $remainder ): ?array {
		foreach ( MetaRegistry::get_instance()->get_all_meta_checks() as $post_type => $meta_keys ) {
			foreach ( $meta_keys as $meta_key => $checks ) {
				foreach ( $checks as $check_name => $unused ) {
					if ( $post_type . '_' . $meta_key . '_' . $check_name === $remainder ) {
						return array( $post_type, $meta_key, $check_name );
					}
				}
			}
		}
		return null;
	}

	/**
	 * Match a concatenated key against a candidate map.
	 *
	 * @param string $key        The stored key.
	 * @param array  $candidates Map of concatenated key => parts.
	 * @return array|null The parts array or null if no match.
	 */
	private function split_with_candidates( string $key, array $candidates ): ?array {
		return $candidates[ $key ] ?? null;
	}

	/**
	 * PHP 7.0-compatible str_ends_with.
	 *
	 * @param string $haystack The string to search in.
	 * @param string $needle   The suffix to look for.
	 * @return bool True if $haystack ends with $needle.
	 */
	private function str_ends_with_compat( string $haystack, string $needle ): bool {
		$len = strlen( $needle );
		if ( 0 === $len ) {
			return true;
		}
		return substr( $haystack, -$len ) === $needle;
	}
}

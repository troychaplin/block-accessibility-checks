<?php
/**
 * Heading Sources
 *
 * Knows which block types render a heading, and how to work out the level from
 * a given block's attributes. Consumed by the editor, where the heading order
 * check builds the document outline.
 *
 * @package BlockAccessibilityChecks
 * @since   4.2.0
 */

namespace BlockAccessibility\Block;

use BlockAccessibility\Core\Traits\Logger;
use WP_Block_Type_Registry;

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Heading Sources Class
 *
 * Collects heading sources from four places, each overriding the one before it:
 *
 * 1. Core's `level` attribute convention, detected automatically.
 * 2. A short list of core blocks that render headings without following it.
 * 3. `supports.ba11yc.headingLevel` in a block's own block.json.
 * 4. Explicit registration via ba11yc_register_heading_source().
 *
 * A fifth layer, the `ba11yc.blockHeadingLevels` JavaScript filter, runs in the
 * editor and overrides all of these.
 */
class HeadingSources {

	use Logger;

	/**
	 * Singleton instance.
	 *
	 * @var HeadingSources|null
	 */
	private static $instance = null;

	/**
	 * Explicitly registered sources, keyed by block type.
	 *
	 * @var array
	 */
	private $registered = array();

	/**
	 * Resolved sources, built on first read.
	 *
	 * @var array|null
	 */
	private $resolved = null;

	/**
	 * Get the singleton instance.
	 *
	 * @return HeadingSources The instance.
	 */
	public static function get_instance(): HeadingSources {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Core blocks that render a heading without a numeric `level` attribute.
	 *
	 * Kept deliberately short: the convention scan covers everything that
	 * follows core's own pattern, so this is only for the exceptions.
	 *
	 * @return array Specs keyed by block type.
	 */
	private function get_core_exceptions(): array {
		$exceptions = array(
			// Hardcodes <h2 class="widget-title"> and has no level attribute.
			// See wp-includes/blocks/widget-group.php.
			'core/widget-group'      => array( 'level' => 2 ),

			// Takes its level from the parent accordion's block context rather
			// than its own attribute. Its save() falls back to 3, which is what
			// ends up in the saved markup.
			'core/accordion-heading' => array( 'level' => 3 ),
		);

		/**
		 * Filters the heading sources for core blocks that need spelling out.
		 *
		 * Use this to correct an entry, add a block the convention scan misses,
		 * or remove one by unsetting its key.
		 *
		 * @since 4.2.0
		 *
		 * @param array $exceptions Specs keyed by block type.
		 */
		$exceptions = \apply_filters( 'ba11yc_core_heading_sources', $exceptions );

		return is_array( $exceptions ) ? $exceptions : array();
	}

	/**
	 * Register a heading source for one or more block types.
	 *
	 * Passing several block types applies the same spec to each, which is the
	 * common case in a block library where many blocks share a heading shape.
	 *
	 * @param string|array $block_types Block type name, or a list of them.
	 * @param array        $args        Heading spec, or a list of specs under 'headings'.
	 * @return bool True when every block type was stored.
	 */
	public function register_source( $block_types, array $args ): bool {
		$requested = is_array( $block_types ) ? $block_types : array( $block_types );
		$valid     = array();

		foreach ( $requested as $block_type ) {
			if ( ! is_string( $block_type ) || '' === $block_type ) {
				$this->log_error( 'A block type must be a non-empty string to register a heading source.' );
				continue;
			}

			$valid[] = $block_type;
		}

		if ( empty( $valid ) ) {
			return false;
		}

		$raw = isset( $args['headings'] ) ? $args['headings'] : $args;

		// Normalized once and shared. Passing every block type as the log
		// context means a malformed spec is reported once, naming all of the
		// blocks it would have affected, rather than once per block.
		$spec = $this->normalize( $raw, implode( ', ', $valid ) );

		if ( null === $spec ) {
			return false;
		}

		// Arrays are copied on assignment, so the blocks cannot end up sharing
		// a mutable spec.
		foreach ( $valid as $block_type ) {
			$this->registered[ $block_type ] = $spec;
		}

		// Sources may be registered after a read in long-running requests.
		$this->resolved = null;

		// Anything skipped above was logged; report it rather than swallowing
		// a typo in one entry of an otherwise good list.
		return count( $valid ) === count( $requested );
	}

	/**
	 * Remove one or more registered heading sources.
	 *
	 * @param string|array $block_types Block type name, or a list of them.
	 * @return bool True when every named source was found and removed.
	 */
	public function unregister_source( $block_types ): bool {
		$requested = is_array( $block_types ) ? $block_types : array( $block_types );
		$removed   = 0;

		foreach ( $requested as $block_type ) {
			if ( ! is_string( $block_type ) || ! isset( $this->registered[ $block_type ] ) ) {
				continue;
			}

			unset( $this->registered[ $block_type ] );
			++$removed;
		}

		if ( 0 === $removed ) {
			return false;
		}

		$this->resolved = null;

		return count( $requested ) === $removed;
	}

	/**
	 * Get every heading source, keyed by block type.
	 *
	 * @return array Specs keyed by block type.
	 */
	public function get_resolved_sources(): array {
		if ( null !== $this->resolved ) {
			return $this->resolved;
		}

		$sources = $this->scan_block_types();

		foreach ( $this->get_core_exceptions() as $block_type => $raw ) {
			$spec = $this->normalize( $raw, $block_type );

			if ( null !== $spec ) {
				$sources[ $block_type ] = $spec;
			}
		}

		// Explicit registration wins over anything declared in block.json.
		foreach ( $this->registered as $block_type => $spec ) {
			$sources[ $block_type ] = $spec;
		}

		$this->resolved = $sources;

		return $this->resolved;
	}

	/**
	 * Read heading sources off the registered block types.
	 *
	 * Picks up two things: core's `level` attribute convention, and any block
	 * declaring `supports.ba11yc.headingLevel`. The declaration wins.
	 *
	 * @return array Specs keyed by block type.
	 */
	private function scan_block_types(): array {
		$sources = array();

		if ( ! class_exists( 'WP_Block_Type_Registry' ) ) {
			return $sources;
		}

		$block_types = WP_Block_Type_Registry::get_instance()->get_all_registered();

		foreach ( $block_types as $block_type => $type ) {
			$convention = $this->spec_from_level_convention( $type );

			if ( null !== $convention ) {
				$sources[ $block_type ] = $convention;
			}

			$declared = $this->spec_from_supports( $type, $block_type );

			if ( null !== $declared ) {
				$sources[ $block_type ] = $declared;
			}
		}

		return $sources;
	}

	/**
	 * Derive a spec from core's `level` attribute convention.
	 *
	 * Core renders every configurable heading the same way:
	 *
	 *     $tag_name = 0 === $attributes['level'] ? 'p' : 'h' . (int) $attributes['level'];
	 *
	 * So a numeric `level` attribute is a reliable signal, and it picks up
	 * third-party blocks that copy the pattern at no extra cost.
	 *
	 * @param \WP_Block_Type $type The registered block type.
	 * @return array|null A spec, or null when the block does not follow it.
	 */
	private function spec_from_level_convention( $type ): ?array {
		$attributes = $type->get_attributes();

		if ( ! is_array( $attributes ) || ! isset( $attributes['level'] ) ) {
			return null;
		}

		$schema = $attributes['level'];

		if ( ! is_array( $schema ) || ! isset( $schema['type'] ) || 'number' !== $schema['type'] ) {
			return null;
		}

		$default = isset( $schema['default'] ) ? $schema['default'] : 2;

		if ( ! is_numeric( $default ) || $default < 0 || $default > 6 ) {
			$default = 2;
		}

		return array(
			'attribute' => 'level',
			'level'     => (int) $default,
		);
	}

	/**
	 * Read a spec from a block's `supports.ba11yc.headingLevel`.
	 *
	 * @param \WP_Block_Type $type       The registered block type.
	 * @param string         $block_type Block type name, for log context.
	 * @return array|null A spec, or null when nothing is declared.
	 */
	private function spec_from_supports( $type, string $block_type ): ?array {
		if ( ! is_array( $type->supports ) || ! isset( $type->supports['ba11yc'] ) ) {
			return null;
		}

		$declaration = $type->supports['ba11yc'];

		if ( ! is_array( $declaration ) || ! array_key_exists( 'headingLevel', $declaration ) ) {
			return null;
		}

		return $this->normalize( $declaration['headingLevel'], $block_type );
	}

	/**
	 * Normalize a declaration into a spec, or a list of specs.
	 *
	 * Accepts a level (`2`, `'2'`, `'h2'`), `false` for "renders no heading",
	 * a spec array, or a list of any of those for a block rendering more than
	 * one heading.
	 *
	 * @param mixed  $raw     The raw declaration.
	 * @param string $context Block type name, for log messages.
	 * @return array|null A spec or list of specs, or null when unusable.
	 */
	private function normalize( $raw, string $context ) {
		// Explicit "renders no heading".
		if ( false === $raw || null === $raw ) {
			return array( 'level' => 0 );
		}

		// A bare level.
		if ( is_scalar( $raw ) ) {
			$level = $this->to_level( $raw );

			if ( null === $level ) {
				$this->log_error( "Invalid heading level for {$context}: " . wp_json_encode( $raw ) );
				return null;
			}

			return array( 'level' => $level );
		}

		if ( ! is_array( $raw ) ) {
			$this->log_error( "Unrecognized heading declaration for {$context}." );
			return null;
		}

		// A list of declarations, for a block rendering several headings.
		if ( $this->is_list( $raw ) ) {
			$specs = array();

			foreach ( $raw as $entry ) {
				$spec = $this->normalize( $entry, $context );

				if ( null !== $spec ) {
					$specs[] = $spec;
				}
			}

			return $specs;
		}

		return $this->normalize_spec( $raw, $context );
	}

	/**
	 * Normalize a single associative spec.
	 *
	 * @param array  $raw     The raw spec.
	 * @param string $context Block type name, for log messages.
	 * @return array|null The normalized spec, or null when unusable.
	 */
	private function normalize_spec( array $raw, string $context ): ?array {
		$spec = array();

		$level = isset( $raw['level'] ) ? $this->to_level( $raw['level'] ) : null;

		if ( isset( $raw['level'] ) && null === $level ) {
			$this->log_error( "Invalid heading level for {$context}: " . wp_json_encode( $raw['level'] ) );
		}

		// Default to 2, matching WordPress's own default heading level.
		$spec['level'] = null === $level ? 2 : $level;

		if ( isset( $raw['attribute'] ) && is_string( $raw['attribute'] ) && '' !== $raw['attribute'] ) {
			$spec['attribute'] = $raw['attribute'];
		}

		if ( isset( $raw['requires'] ) && is_string( $raw['requires'] ) && '' !== $raw['requires'] ) {
			$spec['requires'] = $raw['requires'];
		}

		if ( isset( $raw['map'] ) && is_array( $raw['map'] ) && ! empty( $raw['map'] ) ) {
			$map = array();

			foreach ( $raw['map'] as $key => $value ) {
				$mapped = $this->to_level( $value );

				if ( null === $mapped ) {
					$this->log_error( "Invalid mapped heading level for {$context}: " . wp_json_encode( $value ) );
					continue;
				}

				$map[ $key ] = $mapped;
			}

			if ( ! empty( $map ) ) {
				$spec['map'] = $map;
			}
		}

		// A map without an attribute to read has nothing to translate.
		if ( isset( $spec['map'] ) && ! isset( $spec['attribute'] ) ) {
			$this->log_error( "Heading map for {$context} has no 'attribute' to read; ignoring the map." );
			unset( $spec['map'] );
		}

		return $spec;
	}

	/**
	 * Coerce a value to a heading level.
	 *
	 * Accepts 3, '3', and 'h3'. Level 0 is valid and meaningful: core renders a
	 * paragraph rather than a heading at level 0.
	 *
	 * @param mixed $raw The raw value.
	 * @return int|null An integer 0-6, or null when it is not a level.
	 */
	private function to_level( $raw ): ?int {
		if ( is_string( $raw ) && preg_match( '/^h?([0-6])$/i', trim( $raw ), $matches ) ) {
			return (int) $matches[1];
		}

		if ( is_int( $raw ) || ( is_float( $raw ) && floor( $raw ) === $raw ) ) {
			$level = (int) $raw;

			return ( $level >= 0 && $level <= 6 ) ? $level : null;
		}

		return null;
	}

	/**
	 * Whether an array is a list rather than a spec.
	 *
	 * Written out rather than using array_is_list(), which needs PHP 8.1.
	 *
	 * @param array $value The array to test.
	 * @return bool True when the array is a zero-indexed list.
	 */
	private function is_list( array $value ): bool {
		if ( empty( $value ) ) {
			return true;
		}

		return array_keys( $value ) === range( 0, count( $value ) - 1 );
	}
}

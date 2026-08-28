/**
 * Builds the document heading outline and decides which blocks violate
 * heading-order rules.
 *
 * The outline is computed once per store change rather than once per block:
 * heading rank is a document-wide property, so every participating block would
 * otherwise re-walk the whole tree to reach the same answer.
 */

/**
 * WordPress dependencies
 */
import { applyFilters, hasFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { getHeadingSources, getValidationRules } from './get-validation-config';
import { getValidationRootScope, getValidationRootClientIds } from './get-validation-root';

const HEADING_LEVELS_FILTER = 'ba11yc.blockHeadingLevels';

/**
 * Used when the server sends no heading sources, so the check still recognizes
 * the block it is named for.
 */
const FALLBACK_SOURCES = {
	'core/heading': { attribute: 'level', level: 2 },
};

const EMPTY_LEVELS = Object.freeze([]);

/** Returned when the check is off, so consumers can compare by reference. */
export const EMPTY_OUTLINE = Object.freeze([]);

/** Returned when there is nothing to flag, so consumers can compare by reference. */
const EMPTY_VIOLATIONS = new Set();

/**
 * Whether the heading order check is active at all.
 *
 * The outline exists only to serve this check, so when it is switched off - by
 * severity, or by site editor gating - nothing needs to be walked or resolved.
 *
 * @return {boolean} True when the check is registered and enabled.
 */
export function isHeadingRankEnabled() {
	return Boolean(getValidationRules()['core/heading']?.check_heading_rank);
}

/**
 * Coerce a heading level to an integer.
 *
 * Accepts `3`, `'3'`, and `'h3'`, since blocks store the level as a number or
 * as a tag name depending on their author's taste. Level 0 is meaningful and
 * preserved: core renders `<p>` rather than a heading at level 0.
 *
 * @param {*} raw The raw attribute or spec value.
 * @return {number|null} An integer 0-6, or null if it is not a level.
 */
function toLevel(raw) {
	let value = raw;

	if (typeof value === 'string') {
		const match = value.trim().match(/^h?([0-6])$/i);
		value = match ? Number(match[1]) : NaN;
	}

	value = Number(value);

	return Number.isInteger(value) && value >= 0 && value <= 6 ? value : null;
}

/**
 * Whether an attribute counts as "filled in" for a spec's `requires` gate.
 *
 * @param {*} value The attribute value.
 * @return {boolean} True when the attribute has content.
 */
function isPresent(value) {
	if (typeof value === 'string') {
		return value.trim() !== '';
	}
	if (Array.isArray(value)) {
		return value.length > 0;
	}
	return value !== undefined && value !== null && value !== false && value !== '';
}

/**
 * Resolve one heading spec against a block's attributes.
 *
 * @param {Object} spec       A normalized heading spec.
 * @param {Object} attributes The block's attributes.
 * @return {number|null} The heading level, or null when it renders no heading.
 */
function resolveSpec(spec, attributes) {
	if (spec.requires && !isPresent(attributes?.[spec.requires])) {
		return null;
	}

	let raw;

	if (spec.attribute) {
		raw = attributes?.[spec.attribute];

		if (spec.map && raw !== undefined && Object.prototype.hasOwnProperty.call(spec.map, raw)) {
			raw = spec.map[raw];
		}
	}

	const level = toLevel(raw) ?? toLevel(spec.level);

	// Level 0 means the block renders a paragraph, not a heading.
	return level === 0 ? null : level;
}

/**
 * Resolve the heading levels a single block contributes, in document order.
 *
 * A block may contribute more than one heading, which is why this returns an
 * array rather than a level.
 *
 * @param {string} name       Block name.
 * @param {Object} attributes Block attributes.
 * @param {string} clientId   Block client ID, passed to the filter.
 * @return {number[]} Heading levels contributed by this block.
 */
export function resolveBlockHeadingLevels(name, attributes, clientId) {
	const sources = getHeadingSources();
	const spec = sources[name] ?? FALLBACK_SOURCES[name];

	let levels = EMPTY_LEVELS;

	if (spec) {
		const specs = Array.isArray(spec) ? spec : [spec];
		levels = specs.map(entry => resolveSpec(entry, attributes)).filter(level => level !== null);
	}

	// Skip the filter entirely when nothing is listening: this runs for every
	// block on every store change, and the block object is only built for it.
	if (!hasFilter(HEADING_LEVELS_FILTER)) {
		return levels;
	}

	const filtered = applyFilters(HEADING_LEVELS_FILTER, levels, {
		name,
		attributes,
		clientId,
	});

	if (!Array.isArray(filtered)) {
		return levels;
	}

	return filtered.map(toLevel).filter(level => level !== null && level !== 0);
}

/**
 * Whether a block type could render a heading at all.
 *
 * Used to decide whether the heading order check applies to a block, without
 * resolving the level. A block type that is a heading source but renders no
 * heading for its current attributes still gets the check: it simply passes.
 *
 * @param {string} name Block name.
 * @return {boolean} True when the block type may contribute a heading.
 */
export function blockTypeMayRenderHeading(name) {
	// A filter can give any block a heading, so nothing can be ruled out.
	if (hasFilter(HEADING_LEVELS_FILTER)) {
		return true;
	}

	const sources = getHeadingSources();

	return Boolean(sources[name] ?? FALLBACK_SOURCES[name]);
}

/**
 * Per-block memo, keyed by client ID and invalidated by attribute identity.
 *
 * The block editor stores attributes in a Map whose per-block reference only
 * changes when that block changes, so an unchanged reference means unchanged
 * levels. Rebuilt each pass so entries for removed blocks are dropped.
 *
 * Note for filter authors: a filter that derives levels from state outside the
 * block's own attributes must call `invalidateHeadingOutline()` when that state
 * changes, or this memo will serve a stale answer.
 */
let levelCache = new Map();
let lastInvalidation = 0;
let lastOutline = EMPTY_OUTLINE;
let lastSignature = null;

/**
 * Discard the memoized per-block levels.
 *
 * @return {void}
 */
export function clearHeadingLevelCache() {
	levelCache = new Map();
	lastOutline = EMPTY_OUTLINE;
	lastSignature = null;
	cachedTree = null;
	cachedTreeInvalidation = -1;
	cachedViolations = EMPTY_VIOLATIONS;
}

/**
 * Build the document heading outline, in document order.
 *
 * @param {Function} select       The `select` function from `@wordpress/data`.
 * @param {number}   invalidation The store's heading invalidation counter. A
 *                                change discards the memo before recomputing.
 * @param {string}   scope        From getValidationRootScope().
 * @return {Array<{level: number, clientId: string}>} The outline.
 */
export function computeHeadingOutline(select, invalidation, scope) {
	if (invalidation !== lastInvalidation) {
		lastInvalidation = invalidation;
		clearHeadingLevelCache();
	}

	const { getBlockName, getBlockAttributes } = select('core/block-editor');
	const clientIds = getValidationRootClientIds(select, scope);

	const nextCache = new Map();
	const outline = [];

	for (const clientId of clientIds) {
		const name = getBlockName(clientId);

		if (!name) {
			continue;
		}

		const attributes = getBlockAttributes(clientId);
		const cached = levelCache.get(clientId);

		const levels =
			cached && cached.attributes === attributes
				? cached.levels
				: resolveBlockHeadingLevels(name, attributes, clientId);

		nextCache.set(clientId, { attributes, levels });

		for (const level of levels) {
			outline.push({ level, clientId });
		}
	}

	levelCache = nextCache;

	// Hand back the previous array when nothing moved. Consumers subscribe to
	// this through useSelect, which re-renders on reference inequality - a
	// fresh array every keystroke would re-render, redispatch, and loop.
	const signature = headingOutlineSignature(outline);

	if (signature === lastSignature) {
		return lastOutline;
	}

	lastSignature = signature;
	lastOutline = outline;

	return outline;
}

/**
 * Current violations, cached against the block tree they were derived from.
 *
 * Deliberately module state rather than the plugin's data store. The heading
 * check reads this from inside validateBlock, which runs inside useInvalidBlocks'
 * useSelect; useSelect subscribes to every store its callback touches, so reading
 * the plugin store there would make that hook subscribe to the very store it
 * dispatches into - and its result is a fresh array of fresh objects every pass,
 * so the subscription would re-render, redispatch, and never settle.
 */
let cachedTree = null;
let cachedTreeInvalidation = -1;
let cachedViolations = EMPTY_VIOLATIONS;
let currentInvalidation = 0;

/**
 * Record the current invalidation counter.
 *
 * Mirrors the store's counter into module state so the check can honour it
 * without subscribing to the store. Called from useValidationSync.
 *
 * @param {number} value The store's heading invalidation counter.
 * @return {void}
 */
export function setHeadingInvalidation(value) {
	currentInvalidation = value;
}

/**
 * Get the client IDs currently breaking a heading-order rule.
 *
 * Recomputes only when the block tree has actually changed. getBlocks() is a
 * single map lookup whose reference changes on any edit, which makes it a cheap
 * and reliable cache key: the first block validated in a pass does the walk and
 * every other block reads the result.
 *
 * @param {Function} select The `select` function from `@wordpress/data`.
 * @return {Set<string>} Client IDs of blocks that violate a rule.
 */
export function getHeadingViolations(select) {
	if (!isHeadingRankEnabled()) {
		return EMPTY_VIOLATIONS;
	}

	const tree = select('core/block-editor').getBlocks();

	if (tree === cachedTree && currentInvalidation === cachedTreeInvalidation) {
		return cachedViolations;
	}

	cachedTree = tree;
	cachedTreeInvalidation = currentInvalidation;
	cachedViolations = computeHeadingViolations(
		computeHeadingOutline(select, currentInvalidation, getValidationRootScope(select))
	);

	return cachedViolations;
}

/**
 * Find the blocks responsible for heading-order violations.
 *
 * Two rules, matching what core's Document Outline reports:
 * the first heading must be H1 or H2, and a heading may not jump more than one
 * level past the heading before it. A skip is blamed on the later heading,
 * which is the one the author would change.
 *
 * @param {Array<{level: number, clientId: string}>} outline The heading outline.
 * @return {Set<string>} Client IDs of blocks that violate a rule.
 */
export function computeHeadingViolations(outline) {
	const violations = new Set();

	if (outline.length === 0) {
		return violations;
	}

	const first = outline[0];

	if (first.level !== 1 && first.level !== 2) {
		violations.add(first.clientId);
	}

	for (let i = 1; i < outline.length; i++) {
		if (outline[i].level > outline[i - 1].level + 1) {
			violations.add(outline[i].clientId);
		}
	}

	return violations;
}

/**
 * Reduce an outline to a comparable string.
 *
 * Used as a dependency for per-block validation so that changing one heading
 * re-validates the others. Client IDs are included because which block gets
 * blamed depends on identity, not only on the sequence of levels.
 *
 * @param {Array<{level: number, clientId: string}>} outline The heading outline.
 * @return {string} A signature that changes whenever the outline does.
 */
export function headingOutlineSignature(outline) {
	return outline.map(entry => `${entry.level}:${entry.clientId}`).join('|');
}

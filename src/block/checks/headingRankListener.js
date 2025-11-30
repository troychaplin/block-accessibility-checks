/**
 * Global Heading Rank Validation Listener
 *
 * This module provides global document change detection for heading rank validation.
 * When any heading changes, it triggers re-validation of all heading blocks.
 */

import { select, subscribe } from '@wordpress/data';

// Track the last heading structure to detect changes
let lastHeadingStructure = '';

/**
 * Get current heading structure for comparison
 */
function getHeadingStructure() {
	const allBlocks = select('core/block-editor').getBlocks();
	const headingBlocks = getAllHeadingBlocks(allBlocks);
	return headingBlocks.map(block => `${block.clientId}:${block.attributes.level || 2}`).join('|');
}

/**
 * Recursively find all heading blocks in the document
 * @param {Array} blocks - Array of blocks to search through
 * @return {Array} Array of all heading blocks found
 */
function getAllHeadingBlocks(blocks) {
	const headingBlocks = [];

	function searchBlocks(blockList) {
		for (const block of blockList) {
			if (block.name === 'core/heading') {
				headingBlocks.push(block);
			}
			if (block.innerBlocks && block.innerBlocks.length > 0) {
				searchBlocks(block.innerBlocks);
			}
		}
	}

	searchBlocks(blocks);
	return headingBlocks;
}

/**
 * Subscribe to block editor changes and trigger global heading validation
 */
subscribe(() => {
	const currentStructure = getHeadingStructure();

	if (currentStructure !== lastHeadingStructure) {
		lastHeadingStructure = currentStructure;

		// Trigger a global event that all heading blocks can listen to
		wp.hooks.doAction('ba11yc.headingStructureChanged', currentStructure);
	}
});

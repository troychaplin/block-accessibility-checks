export function checkHeadingLevel( block ) {
	if ( block.name === 'core/heading' && block.attributes.level === 1 ) {
		return {
			isValid: false,
			message: 'Level 1 headings are not allowed in your content area.',
			clientId: block.clientId,
		};
	}
	return { isValid: true };
}

import { useSelect } from '@wordpress/data';
import { blockChecksArray } from '../registerPlugin';

export function getInvalidBlocks() {
	const allBlocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks(),
		[]
	);
	return allBlocks
		.flatMap( ( block ) =>
			blockChecksArray.map( ( check ) => check( block ) )
		)
		.filter( ( result ) => ! result.isValid );
}

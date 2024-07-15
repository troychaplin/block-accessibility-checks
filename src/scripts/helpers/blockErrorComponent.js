import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { GetInvalidBlocks } from './getInvalidBlocks';

const blockErrorComponent = createHigherOrderComponent( ( BlockListBlock ) => {
	const WrappedBlock = ( props ) => {
		const invalidBlock = GetInvalidBlocks().find(
			( obj ) => obj.clientId === props.clientId
		);
		const messages = invalidBlock ? invalidBlock.message : '';

		return (
			<>
				{ invalidBlock ? (
					<div>
						<div className="a11y-block-error">
							<div className="a11y-error-msg">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									height="1em"
									viewBox="0 0 512 512"
									fill="#8B3122"
								>
									<path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
								</svg>
								{ messages }
							</div>
							<BlockListBlock
								{ ...props }
								className={ `${ props.className }` }
							/>
						</div>
					</div>
				) : (
					<BlockListBlock
						{ ...props }
						className={ `${ props.className }` }
					/>
				) }
			</>
		);
	};

	// Set the displayName for debugging purposes
	WrappedBlock.displayName = `a11yCheck(${
		BlockListBlock.displayName || BlockListBlock.name || 'Component'
	})`;

	return WrappedBlock;
}, 'blockErrorComponent' );

addFilter(
	'editor.BlockListBlock',
	'block-a11y-checks/with-client-id-class-name',
	blockErrorComponent
);

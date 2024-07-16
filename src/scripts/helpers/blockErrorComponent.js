import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { GetInvalidBlocks } from './getInvalidBlocks';

const blockErrorComponent = createHigherOrderComponent((BlockListBlock) => {
	const WrappedBlock = (props) => {
		const invalidBlock = GetInvalidBlocks().find(
			(obj) => obj.clientId === props.clientId
		);
		const messages = invalidBlock ? invalidBlock.message : '';

		return (
			<>
				{invalidBlock ? (
					<div>
						<div className="a11y-block-error">
							<div className="a11y-error-msg">{messages}</div>
							<BlockListBlock
								{...props}
								className={`${props.className}`}
							/>
						</div>
					</div>
				) : (
					<BlockListBlock
						{...props}
						className={`${props.className}`}
					/>
				)}
			</>
		);
	};

	// Set the displayName for debugging purposes
	WrappedBlock.displayName = `a11yCheck(${
		BlockListBlock.displayName || BlockListBlock.name || 'Component'
	})`;

	return WrappedBlock;
}, 'blockErrorComponent');

addFilter(
	'editor.BlockListBlock',
	'block-a11y-checks/with-client-id-class-name',
	blockErrorComponent
);

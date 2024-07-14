import { createHigherOrderComponent } from '@wordpress/compose'
import { addFilter } from '@wordpress/hooks'
import { getInvalidBlocks } from './getInvalidBlocks'

const blockErrorComponent = createHigherOrderComponent((BlockListBlock) => {
  const WrappedBlock = (props) => {
    const invalidBlock = getInvalidBlocks().find((obj) => obj.clientId === props.clientId)
    const messages = invalidBlock ? invalidBlock.message : ''
    const classes = invalidBlock ? 'invalid-block' : ''

    return (
      <>
        <BlockListBlock {...props} className={`${props.className} ${classes}`} />
        {invalidBlock && (
          <div className="invalid-block-error">
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" fill="#E91C24">
              <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
            </svg>
            {messages}
          </div>
        )}
      </>
    )
  }

  // Set the displayName for debugging purposes
  WrappedBlock.displayName = `WithValidation(${BlockListBlock.displayName || BlockListBlock.name || 'Component'})`

  return WrappedBlock
}, 'blockErrorComponent')

addFilter('editor.BlockListBlock', 'cutheme/with-client-id-class-name', blockErrorComponent)

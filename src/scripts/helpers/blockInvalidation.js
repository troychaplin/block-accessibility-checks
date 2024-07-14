import { useDispatch } from '@wordpress/data'
import { getInvalidBlocks } from './getInvalidBlocks'
import { useEffect } from '@wordpress/element'

export function blockInvalidation() {
  const invalidBlocks = getInvalidBlocks()

  const {
    lockPostSaving,
    unlockPostSaving,
    lockPostAutosaving,
    unlockPostAutosaving,
    disablePublishSidebar,
    enablePublishSidebar,
  } = useDispatch('core/editor')

  useEffect(() => {
    if (invalidBlocks.length > 0) {
      lockPostSaving()
      lockPostAutosaving()
      disablePublishSidebar()
    } else {
      unlockPostSaving()
      unlockPostAutosaving()
      enablePublishSidebar()
    }
  }, [invalidBlocks])

  return null
}

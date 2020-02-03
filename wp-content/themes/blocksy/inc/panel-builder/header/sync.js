import { handleBackgroundOptionFor } from '../../../static/js/customizer/sync/variables/background'
import ctEvents from 'ct-events'

ctEvents.on(
	'ct:header:sync:collect-variable-descriptors',
	variableDescriptors => {
		variableDescriptors['global'] = {
			...handleBackgroundOptionFor({
				id: 'headerBackground',
				selector: '#header'
			})
		}
	}
)

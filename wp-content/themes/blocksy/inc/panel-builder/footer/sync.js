import { handleBackgroundOptionFor } from '../../../static/js/customizer/sync/variables/background'
import ctEvents from 'ct-events'

ctEvents.on(
	'ct:footer:sync:collect-variable-descriptors',
	variableDescriptors => {
		variableDescriptors['global'] = {
			footerShadow: {
				selector: '.site-footer:before',
				type: 'box-shadow',
				variable: 'boxShadow',
				responsive: true
			},

			...handleBackgroundOptionFor({
				id: 'footerBackground',
				selector: 'footer'
			})
		}
	}
)

ctEvents.on('ct:footer:sync:item:global', changeDescriptor => {
	if (changeDescriptor.optionId === 'has_reveal_effect') {
		const footer = document.querySelector('.site-footer')

		let revealComponents = []

		if (changeDescriptor.optionValue.desktop) {
			revealComponents.push('desktop')
		}

		if (changeDescriptor.optionValue.tablet) {
			revealComponents.push('tablet')
		}

		if (changeDescriptor.optionValue.mobile) {
			revealComponents.push('mobile')
		}

		if (revealComponents.length === 0) {
			footer.removeAttribute('style')
			footer.removeAttribute('data-footer-reveal')
			footer.hasFooterReveal = null
		} else {
			footer.dataset.footerReveal = revealComponents.join(':')
			footer.hasFooterReveal = null
		}

		ctEvents.trigger('ct:footer-reveal:update')
	}
})

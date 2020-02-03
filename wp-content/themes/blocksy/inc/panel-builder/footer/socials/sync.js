import ctEvents from 'ct-events'
import { getCache } from '../../../../static/js/customizer/sync/helpers'
import { responsiveClassesFor } from '../../../../static/js/customizer/sync/footer'

ctEvents.on(
	'ct:footer:sync:collect-variable-descriptors',
	variableDescriptors => {
		variableDescriptors['socials'] = {
			socialsIconSize: {
				selector: '.ct-footer-socials',
				variable: 'iconSize',
				responsive: true,
				unit: 'px'
			},

			socialsIconSpacing: {
				selector: '.ct-footer-socials',
				variable: 'spacing',
				responsive: true,
				unit: 'px'
			},

			footerSocialsAlignment: {
				selector: '[data-column="socials"]',
				variable: 'horizontal-alignment',
				responsive: true,
				unit: ''
			},

			footerSocialsVerticalAlignment: {
				selector: '[data-column="socials"]',
				variable: 'vertical-alignment',
				responsive: true,
				unit: ''
			},

			footerSocialsIconColor: [
				{
					selector: '.ct-footer-socials [data-color="custom"]',
					variable: 'color',
					type: 'color:default',
					responsive: true
				},

				{
					selector: '.ct-footer-socials [data-color="custom"]',
					variable: 'colorHover',
					type: 'color:hover',
					responsive: true
				}
			],

			footerSocialsIconBackground: [
				{
					selector: '.ct-footer-socials [data-color="custom"]',
					variable: 'backgroundColor',
					type: 'color:default',
					responsive: true
				},

				{
					selector: '.ct-footer-socials [data-color="custom"]',
					variable: 'backgroundColorHover',
					type: 'color:hover',
					responsive: true
				}
			],

			footerSocialsMargin: {
				selector: '.ct-footer-socials',
				type: 'spacing',
				variable: 'margin',
				responsive: true
				// important: true
			}
		}
	}
)

ctEvents.on(
	'ct:footer:sync:item:socials',
	({ optionId, optionValue, values }) => {
		const selector = '.site-footer [data-column="socials"]'

		const el = document.querySelector(selector).firstElementChild

		if (optionId === 'socialsType' || optionId === 'socialsFillType') {
			const box = el.querySelector('.ct-social-box')
			box.dataset.type = values.socialsType

			box.removeAttribute('data-fill')

			if (values.socialsType !== 'simple') {
				box.dataset.fill = values.socialsFillType || 'solid'
			}
		}

		if (optionId === 'socialsIconSize') {
			el.querySelector('.ct-social-box').dataset.size =
				values.socialsIconSize
		}

		if (optionId === 'footerSocialsColor') {
			el.querySelector('.ct-social-box').dataset.color = optionValue
		}

		if (optionId === 'footer_socials') {
			const newHtml = getCache().querySelector(
				`.ct-customizer-preview-cache [data-id="socials-general-cache"]`
			).innerHTML

			const cache = document.createElement('div')
			cache.innerHTML = newHtml

			el.querySelector('.ct-social-box').innerHTML = ''

			optionValue.map(({ id, enabled }) => {
				if (!enabled) return

				el.querySelector('.ct-social-box').appendChild(
					cache.querySelector(`[data-network=${id}]`)
				)
			})

			if (values.socialsIconLabel === 'yes') {
				;[...el.querySelectorAll('span.ct-label')].map(el =>
					el.removeAttribute('hidden')
				)
			}
		}

		if (optionId === 'socialsIconLabel') {
			;[...el.querySelectorAll('span.ct-label')].map(el =>
				optionValue === 'yes'
					? el.removeAttribute('hidden')
					: el.setAttribute('hidden', '')
			)
		}
	}
)

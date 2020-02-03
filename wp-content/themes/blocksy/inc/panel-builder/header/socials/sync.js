import ctEvents from 'ct-events'
import { getCache } from '../../../../static/js/customizer/sync/helpers'
import { updateAndSaveEl } from '../../../../static/js/frontend/header/render-loop'
import { responsiveClassesFor } from '../../../../static/js/customizer/sync/footer'

ctEvents.on(
	'ct:header:sync:collect-variable-descriptors',
	variableDescriptors => {
		variableDescriptors['socials'] = {
			socialsIconSize: {
				selector: '.ct-header-socials',
				variable: 'iconSize',
				responsive: true,
				unit: 'px'
			},

			socialsIconSpacing: {
				selector: '.ct-header-socials',
				variable: 'spacing',
				responsive: true,
				unit: 'px'
			},

			headerSocialsIconColor: [
				{
					selector: '.ct-header-socials [data-color="custom"]',
					variable: 'color',
					type: 'color:default',
					responsive: true
				},

				{
					selector: '.ct-header-socials [data-color="custom"]',
					variable: 'colorHover',
					type: 'color:hover',
					responsive: true
				}
			],

			headerSocialsIconBackground: [
				{
					selector: '.ct-header-socials [data-color="custom"]',
					variable: 'backgroundColor',
					type: 'color:default',
					responsive: true
				},

				{
					selector: '.ct-header-socials [data-color="custom"]',
					variable: 'backgroundColorHover',
					type: 'color:hover',
					responsive: true
				}
			],

			headerSocialsMargin: {
				selector: '.ct-header-socials',
				type: 'spacing',
				variable: 'margin',
				responsive: true,
				important: true
			}
		}
	}
)

ctEvents.on(
	'ct:header:sync:item:socials',
	({ optionId, optionValue, values }) => {
		const selector = '[data-id="socials"]'

		if (optionId === 'socialsType' || optionId === 'socialsFillType') {
			updateAndSaveEl(selector, el => {
				const box = el.querySelector('.ct-social-box')
				box.dataset.type = values.socialsType

				box.removeAttribute('data-fill')

				if (values.socialsType !== 'simple') {
					box.dataset.fill = values.socialsFillType
				}
			})
		}

		if (optionId === 'socialsIconSize') {
			updateAndSaveEl(
				selector,
				el =>
					(el.querySelector('.ct-social-box').dataset.size =
						values.socialsIconSize)
			)
		}

		if (optionId === 'headerSocialsColor') {
			updateAndSaveEl(
				selector,
				el =>
					(el.querySelector(
						'.ct-social-box'
					).dataset.color = optionValue)
			)
		}

		if (optionId === 'header_socials') {
			updateAndSaveEl(selector, el => {
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
			})
		}

		if (optionId === 'visibility') {
			updateAndSaveEl(selector, el =>
				responsiveClassesFor({ ...optionValue, desktop: true }, el)
			)
		}

		if (optionId === 'socialsIconLabel') {
			updateAndSaveEl(selector, el =>
				[...el.querySelectorAll('span.ct-label')].map(el =>
					optionValue === 'yes'
						? el.removeAttribute('hidden')
						: el.setAttribute('hidden', '')
				)
			)
		}
	}
)

export const markImagesAsLoaded = el =>
	el &&
	[...el.querySelectorAll('.ct-image-container.ct-lazy')].map(el => {
		if (!el.querySelector('img')) {
			return
		}

		el.querySelector('img').setAttribute(
			'src',
			el.querySelector('img').dataset.lazy
		)

		if (el.querySelector('img').dataset.lazySet) {
			el.querySelector('img').setAttribute(
				'srcset',
				el.querySelector('img').dataset.lazySet
			)
		}

		el.classList.remove('ct-lazy')
		el.classList.add('ct-lazy-loaded')
	})

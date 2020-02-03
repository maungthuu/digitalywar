import { getCurrentScreen } from './helpers/current-screen'

let ro = null

const setHeightFor = el => {
	if (!el.dataset.footerReveal) return

	el.style.setProperty(
		'--footerHeight',
		`${el.firstElementChild.offsetHeight}px`
	)
}

let connectListenerFor = el => {
	if (window.ResizeObserver) {
		if (ro) {
			ro.disconnect()
		}

		ro = new ResizeObserver((entries, observer) => setHeightFor(el))

		ro.observe(el)
	} else {
		import('element-resize-detector').then(({ default: erd }) => {
			erd().removeAllListeners(el)
			erd().listenTo(el, setHeightFor)
		})
	}
}

let disconnectListenerFor = el => {
	if (window.ResizeObserver && ro) {
		ro.disconnect()
		ro = null
	} else {
		import('element-resize-detector').then(({ default: erd }) =>
			erd().removeAllListeners(el)
		)
	}
}

export const mount = () => {
	let footer = document.querySelector('footer.site-footer')
	if (!footer) return

	if (!footer.dataset.footerReveal && !footer.hasFooterReveal) {
		disconnectListenerFor(footer)
		footer.removeAttribute('data-footer-reveal')
		return
	}

	let footerRevealInfo = footer.dataset.footerReveal || footer.hasFooterReveal

	if (!footer.hasFooterReveal) {
		footer.hasFooterReveal = footer.dataset.footerReveal.split(':')
	}

	if (
		footer.hasFooterReveal.indexOf(getCurrentScreen({ withTablet: true })) >
		-1
	) {
		footer.dataset.footerReveal = 'yes'
		setHeightFor(footer)
		connectListenerFor(footer)
	} else {
		disconnectListenerFor(footer)
		footer.removeAttribute('data-footer-reveal')
	}
}

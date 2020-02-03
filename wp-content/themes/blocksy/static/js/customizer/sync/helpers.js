export const setRatioFor = (ratio, el) => {
	let imgEl = el.parentNode.querySelector('[width]')

	let thumb_ratio =
		ratio === 'original'
			? imgEl
				? [imgEl.width, imgEl.height]
				: [1, 1]
			: (ratio || '4/3').split(
					(ratio || '4/3').indexOf('/') > -1 ? '/' : ':'
			  )

	el.style.paddingBottom = `${Math.round(
		(parseFloat(thumb_ratio[1]) / parseFloat(thumb_ratio[0])) * 100
	)}%`
}

export function changeTagName(node, name) {
	var renamed = document.createElement(name)

	;[...node.attributes].map(({ name, value }) => {
		renamed.setAttribute(name, value)
	})

	while (node.firstChild) {
		renamed.appendChild(node.firstChild)
	}

	return node.parentNode.replaceChild(renamed, node)
}

export const getCache = () => {
	const div = document.createElement('div')
	div.innerHTML = document.querySelector(
		'.ct-customizer-preview-cache-container'
	).value
	return div
}

export const getFreshHtmlFor = (id, cache = null, attr = 'id') => {
	if (!cache) {
		cache = getCache()
	}

	const newHtml = cache.querySelector(
		`.ct-customizer-preview-cache [data-${attr}="${id}"]`
	).innerHTML

	const e = document.createElement('div')
	e.innerHTML = newHtml

	return e
}

export const checkAndReplace = (args = {}) => {
	args = {
		id: null,

		fragment_id: null,

		selector: null,
		parent_selector: null,

		// append | firstChild | maybeBefore:selector
		strategy: 'append',
		whenInserted: () => {},
		beforeInsert: el => {},
		watch: [],

		...args
	}

	const render = () => {
		const to = wp.customize(args.id)()

		const parent = document.querySelector(args.parent_selector)
		;[
			...document.querySelectorAll(
				`${args.parent_selector} ${args.selector}`
			)
		].map(el => el.parentNode.removeChild(el))

		if (to !== 'yes') return

		const el = getFreshHtmlFor(args.fragment_id)

		while (el.firstElementChild) {
			args.beforeInsert(el.firstElementChild)

			if (args.strategy === 'append') {
				parent.appendChild(el.firstElementChild)
			}

			if (args.strategy === 'firstChild') {
				parent.insertBefore(
					el.firstElementChild,
					parent.firstElementChild
				)
			}

			if (args.strategy.indexOf('maybeBefore') > -1) {
				const [_, selector] = args.strategy.split(':')

				if (parent.querySelector(selector)) {
					parent.insertBefore(
						el.firstElementChild,
						parent.querySelector(selector)
					)
				} else {
					parent.appendChild(el.firstElementChild)
				}
			}
		}

		args.whenInserted()
	}

	wp.customize(args.id, val => val.bind(to => render()))
	args.watch.map(opt => wp.customize(opt, val => val.bind(() => render())))
}

export const getOptionFor = (key, prefix = '') => {
	const id = `${prefix}${prefix.length > 0 ? '_' : ''}${key}`

	if (wp.customize(id)) {
		return wp.customize(id)()
	}

	return false
}

export const watchOptionsWithPrefix = (args = {}) => {
	const {
		getPrefix = () => null,
		getOptionsForPrefix = ({ prefix }) => [],
		render = () => {}
	} = args

	let prefix = getPrefix()

	getOptionsForPrefix({ prefix }).map(id =>
		wp.customize(id, val => val.bind(to => render({ prefix })))
	)
}

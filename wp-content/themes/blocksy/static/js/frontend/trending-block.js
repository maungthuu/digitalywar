import { markImagesAsLoaded } from './lazy-load-helpers'

const store = {}

const cachedFetch = url =>
	store[url]
		? new Promise(resolve => {
				resolve(store[url])
				store[url] = store[url].clone()
		  })
		: new Promise(resolve =>
				fetch(url).then(response => {
					resolve(response)
					store[url] = response.clone()
				})
		  )

const loadPage = (args = {}) => {
	args = {
		el: null,
		// prev | next
		action: null,

		...args
	}

	if (!args.el) {
		return
	}

	if (!args.action) {
		return
	}

	if (args.el.classList.contains('ct-loading')) {
		return
	}

	let currentPage = parseInt(args.el.dataset.page, 10)

	if (args.action === 'prev' && currentPage === 1) {
		return
	}

	if (args.el.querySelectorAll('.ct-container > a').length < 4) {
		if (currentPage === 1) {
			return
		}
	}

	if (args.el.dataset.page.indexOf('last') > -1) {
		if (args.action === 'next') {
			return
		}
	}

	args.el.classList.add('ct-loading')

	let newPage = args.action === 'prev' ? currentPage - 1 : currentPage + 1

	Promise.all([
		new Promise(resolve => {
			args.el.classList.add('ct-leave-active')
			requestAnimationFrame(() => {
				args.el.classList.remove('ct-leave-active')
				args.el.classList.add('ct-leave')

				setTimeout(() => resolve(), 650)
			})
		}),

		cachedFetch(
			`${ct_localizations.ajax_url}?action=blocksy_get_trending_posts&page=${newPage}`
		).then(response => response.json())
	]).then(([_, { success, data }]) => {
		if (!success) {
			return
		}

		let {
			posts: { is_last_page, posts }
		} = data

		args.el.dataset.page = `${newPage}${is_last_page ? ':last' : ''}`
		;[...args.el.querySelectorAll('a')].map(el => el.remove())

		posts.map(post =>
			args.el.insertAdjacentHTML(
				'beforeend',
				`<a href="${post.url}">
                        ${post.image}
                        <h3 class="ct-item-title">
                         ${post.title}
                        </h3>
                    </a>`
			)
		)

		setTimeout(() => {
			args.el.classList.remove('ct-leave')
			args.el.classList.add('ct-enter-active')

			requestAnimationFrame(() => {
				args.el.classList.remove('ct-enter-active')
				args.el.classList.add('ct-active')

				setTimeout(() => {
					args.el.classList.remove('ct-active')
					args.el.classList.remove('ct-loading')
				}, 650)
			})
		})

		markImagesAsLoaded(args.el)
	})
}

export const mount = el => {
	if (el.hasListeners) {
		return
	}

	el.hasListeners = true

	el.querySelector('.ct-arrow-left').addEventListener('click', e => {
		e.preventDefault()
		loadPage({ el, action: 'prev' })
	})

	el.querySelector('.ct-arrow-right').addEventListener('click', e => {
		e.preventDefault()
		loadPage({ el, action: 'next' })
	})
}

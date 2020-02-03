import { markImagesAsLoaded } from '../../frontend/lazy-load-helpers'
import {
	getCache,
	setRatioFor,
	watchOptionsWithPrefix,
	changeTagName,
	getOptionFor
} from './helpers'
import { handleBackgroundOptionFor } from './variables/background'

const getPrefix = () => {
	if (document.body.classList.contains('single')) {
		return 'post'
	}

	if (
		document.body.classList.contains('page') ||
		document.body.classList.contains('blog') ||
		document.body.classList.contains('post-type-archive-product')
	) {
		return 'page'
	}

	return false
}

watchOptionsWithPrefix({
	getPrefix,

	getOptionsForPrefix: ({ prefix }) => [
		`${prefix}_has_comments`,
		`${prefix}_comments_structure`
	],

	render: ({ prefix }) => {
		const comments = document.querySelector(
			'.site-main .ct-comments-container'
		)
		if (comments) {
			comments.parentNode.removeChild(comments)
		}

		if (getOptionFor('has_comments', prefix) !== 'yes') {
			return
		}

		const newWrapper = document.createElement('div')
		if (
			!getCache().querySelector(
				'.ct-customizer-preview-cache [data-part="comments"]'
			)
		) {
			return
		}
		newWrapper.innerHTML = getCache().querySelector(
			'.ct-customizer-preview-cache [data-part="comments"]'
		).innerHTML

		if (newWrapper.firstElementChild) {
			if (
				!document.querySelector('.site-main .ct-related-posts') ||
				wp.customize('related_location')() === 'before'
			) {
				document
					.querySelector('.site-main')
					.appendChild(newWrapper.firstElementChild)
			} else {
				document
					.querySelector('.site-main .ct-related-posts')
					.parentNode.insertBefore(
						newWrapper.firstElementChild,
						document.querySelector('.site-main .ct-related-posts')
					)
			}
		}

		let container = document.querySelector('.ct-comments-container > div')
		container.classList.remove('ct-container', 'ct-container-narrow')
		container.classList.add(
			getOptionFor('comments_structure', prefix) === 'narrow'
				? 'ct-container-narrow'
				: 'ct-container'
		)

		if (window.DISQUS) {
			window.DISQUS.host._loadEmbed()
		}
		markImagesAsLoaded(document.querySelector('.site-main'))
	}
})

const getVariablesForPrefix = prefix =>
	prefix
		? {
				[`${prefix}_commentsNarrowWidth`]: {
					variable: 'narrowContainer',
					selector: '.ct-comments-container',
					unit: 'px'
				},

				[`${prefix}_commentsFontColor`]: [
					{
						selector: '.ct-comments',
						variable: 'color',
						type: 'color:default'
					},

					{
						selector: '.ct-comments',
						variable: 'colorHover',
						type: 'color:hover'
					}
				],

				...handleBackgroundOptionFor({
					id: `${prefix}_comments_background`,
					selector: '.ct-comments-container'
				})
		  }
		: {}

export const getCommentsVariables = () => getVariablesForPrefix(getPrefix())

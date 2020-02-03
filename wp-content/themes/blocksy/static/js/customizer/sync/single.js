import { markImagesAsLoaded } from '../../frontend/lazy-load-helpers'
import { responsiveClassesFor } from './footer'
import ctEvents from 'ct-events'
import {
	getCache,
	setRatioFor,
	watchOptionsWithPrefix,
	changeTagName,
	getOptionFor
} from './helpers'
import { renderHeroSection, getPrefixFor } from './hero-section'

const pageStructureFor = page_structure_type => {
	if (page_structure_type === 'type-3') {
		return 'narrow'
	}

	if (page_structure_type === 'type-4') {
		return 'normal'
	}

	if (page_structure_type === 'type-5') {
		return 'normal'
	}

	return 'none'
}

const getSidebarTypeFor = page_structure_type => {
	if (page_structure_type === 'type-1') {
		return 'right'
	}

	if (page_structure_type === 'type-2') {
		return 'left'
	}

	return 'none'
}

watchOptionsWithPrefix({
	getPrefix: () => {
		if (document.body.classList.contains('single')) {
			return 'single_blog_post'
		}

		if (
			document.body.classList.contains('page') ||
			document.body.classList.contains('blog') ||
			document.body.classList.contains('post-type-archive-product')
		) {
			return 'single_page'
		}

		return false
	},

	getOptionsForPrefix: ({ prefix }) =>
		prefix === 'single_page'
			? ['single_page_structure', 'page_content_style']
			: ['single_blog_post_structure', 'single_content_style'],

	render: ({ prefix }) => {
		if (!document.querySelector('.content-area')) {
			return
		}

		if (
			getCache().querySelector(
				'.ct-customizer-preview-cache [data-structure-custom]'
			)
		) {
			return
		}

		let structure = getOptionFor(
			prefix === 'single_page'
				? 'single_page_structure'
				: 'single_blog_post_structure'
		)

		let pageStructure = pageStructureFor(structure)
		let sidebarType = getSidebarTypeFor(structure)

		let contentStyle = getOptionFor(
			prefix === 'single_page'
				? 'page_content_style'
				: 'single_content_style'
		)
		let editor = 'default'

		if (document.body.className.indexOf('elementor-page') > -1) {
			editor = 'elementor'
		}

		if (document.body.classList.contains('brz')) {
			editor = 'brizy'
		}

		let computedStructure =
			pageStructure === 'none'
				? contentStyle
				: `${editor}:${contentStyle}:${pageStructure}`

		document.querySelector(
			`article.${prefix === 'single_page' ? 'page' : 'post'}`
		).dataset.structure = computedStructure

		const sidebarEl = document.querySelector(
			'.site-main > .content-area > [class*="ct-container"]'
		)

		sidebarEl.classList.remove('ct-container', 'ct-container-narrow')

		sidebarEl.classList.add(
			pageStructure === 'narrow' ? 'ct-container-narrow' : 'ct-container'
		)

		if (sidebarType === 'none') {
			if (sidebarEl.querySelector('aside')) {
				sidebarEl.removeChild(sidebarEl.querySelector('aside'))
			}

			sidebarEl.removeAttribute('data-sidebar')
			document.body.classList.remove('sidebar')
		} else {
			if (sidebarEl.dataset.sidebar === sidebarType) {
				return
			}

			document.body.classList.add('sidebar')
			if (sidebarEl.querySelector('aside')) {
				sidebarEl.removeChild(sidebarEl.querySelector('aside'))
			}

			sidebarEl.dataset.sidebar = sidebarType

			const newHtml = getCache().querySelector(
				`.ct-customizer-preview-cache [data-id="sidebar"]`
			).innerHTML

			const e = document.createElement('div')
			e.innerHTML = newHtml

			while (e.firstElementChild) {
				sidebarEl.appendChild(e.firstElementChild)
			}
		}

		markImagesAsLoaded(document.querySelector('.site-main'))
		window.ctEvents.trigger('ct:sidebar:update')
	}
})

export const replaceArticleAndRemoveParts = () => {
	if (
		!document.body.classList.contains('single') &&
		!document.body.classList.contains('page')
	) {
		return
	}

	if (!document.querySelector('.site-main .content-area')) {
		return
	}

	document.querySelector(
		'.site-main .content-area article'
	).innerHTML = getCache().querySelector(
		'.ct-customizer-preview-cache .single-content-cache > article'
	).innerHTML

	const article = document.querySelector(
		'.single-post .site-main .content-area article'
	)

	if ((wp.customize('has_share_box')() || 'yes') === 'no') {
		const shareBox = document.querySelectorAll(
			'.site-main .content-area article .ct-share-box'
		)
		;[...shareBox].map(el => el && el.parentNode.removeChild(el))
	} else {
		const shareBoxType = wp.customize('share_box_type')() || 'type-1'

		const shareBox1Location = wp.customize('share_box1_location')() || {
			top: false,
			bottom: true
		}

		const shareBox2Location =
			wp.customize('share_box2_location')() || 'right'

		if (!shareBox1Location.top && shareBoxType !== 'type-2') {
			const header = document.querySelector(
				'.site-main .content-area article .ct-share-box[data-location="top"]'
			)

			if (header) {
				header.parentNode.removeChild(header)
			}
		}

		if (!shareBox1Location.bottom || shareBoxType === 'type-2') {
			const content = document.querySelector(
				'.site-main .content-area article .ct-share-box[data-location="bottom"]'
			)

			if (content) {
				content.parentNode.removeChild(content)
			}
		}

		if (shareBoxType === 'type-2') {
			const header = document.querySelector(
				'.site-main .content-area article .ct-share-box[data-location="top"]'
			)

			header.dataset.type = shareBoxType

			header.removeAttribute('data-location')
			header.dataset.location = shareBox2Location
		}

		if ((wp.customize('share_facebook')() || 'yes') === 'no') {
			;[
				...document.querySelectorAll(
					'.site-main .content-area article [data-network="facebook"]'
				)
			].map(el => el.parentNode.removeChild(el))
		}

		if ((wp.customize('share_twitter')() || 'yes') === 'no') {
			;[
				...document.querySelectorAll(
					'.site-main .content-area article [data-network="twitter"]'
				)
			].map(el => el.parentNode.removeChild(el))
		}

		if ((wp.customize('share_vk')() || 'yes') === 'no') {
			;[
				...document.querySelectorAll(
					'.site-main .content-area article [data-network="vk"]'
				)
			].map(el => el.parentNode.removeChild(el))
		}

		if ((wp.customize('share_ok')() || 'yes') === 'no') {
			;[
				...document.querySelectorAll(
					'.site-main .content-area article [data-network="ok"]'
				)
			].map(el => el.parentNode.removeChild(el))
		}

		if ((wp.customize('share_telegram')() || 'yes') === 'no') {
			;[
				...document.querySelectorAll(
					'.site-main .content-area article [data-network="telegram"]'
				)
			].map(el => el.parentNode.removeChild(el))
		}

		if ((wp.customize('share_pinterest')() || 'yes') === 'no') {
			;[
				...document.querySelectorAll(
					'.site-main .content-area article [data-network="pinterest"]'
				)
			].map(el => el.parentNode.removeChild(el))
		}

		if ((wp.customize('share_linkedin')() || 'yes') === 'no') {
			;[
				...document.querySelectorAll(
					'.site-main .content-area article [data-network="linkedin"]'
				)
			].map(el => el.parentNode.removeChild(el))
		}

		if ((wp.customize('share_viber')() || 'yes') === 'no') {
			;[
				...document.querySelectorAll(
					'.site-main .content-area article [data-network="viber"]'
				)
			].map(el => el.parentNode.removeChild(el))
		}

		if ((wp.customize('share_reddit')() || 'yes') === 'no') {
			;[
				...document.querySelectorAll(
					'.site-main .content-area article [data-network="reddit"]'
				)
			].map(el => el.parentNode.removeChild(el))
		}

		if ((wp.customize('share_hacker_news')() || 'yes') === 'no') {
			;[
				...document.querySelectorAll(
					'.site-main .content-area article [data-network="hacker_news"]'
				)
			].map(el => el.parentNode.removeChild(el))
		}

		if ((wp.customize('share_whatsapp')() || 'yes') === 'no') {
			;[
				...document.querySelectorAll(
					'.site-main .content-area article [data-network="whatsapp"]'
				)
			].map(el => el.parentNode.removeChild(el))
		}

		;[
			...document.querySelectorAll(
				'.site-main .content-area article .ct-share-box'
			)
		].map(el => {
			if (shareBoxType === 'type-1') {
				if (el.lastElementChild.tagName.toLowerCase() === 'span') {
					el.lastElementChild.remove()
				}
			}

			const count = el.children.length

			if (count === 0) {
				el.parentNode.removeChild(el)
				return
			}

			el.removeAttribute('data-count')

			responsiveClassesFor('share_box_visibility', el)

			if (shareBoxType === 'type-2') {
				el.dataset.count = count
			}
		})

		ctEvents.trigger('ct:single:share-box:update')
	}

	if ((wp.customize('has_author_box')() || 'no') !== 'yes') {
		const authorBox = document.querySelector(
			'.site-main .content-area article .author-box'
		)

		authorBox && authorBox.parentNode.removeChild(authorBox)
	} else {
		if ((wp.customize('single_author_box_social')() || 'yes') === 'no') {
			const authorBoxSocial = document.querySelector(
				'.site-main .content-area article .author-box .author-box-social'
			)

			authorBoxSocial &&
				authorBoxSocial.parentNode.removeChild(authorBoxSocial)
		}

		if (
			document.querySelector(
				'.site-main .content-area article .author-box'
			)
		) {
			responsiveClassesFor(
				'author_box_visibility',
				document.querySelector(
					'.site-main .content-area article .author-box'
				)
			)
		}
	}

	if ((wp.customize('has_post_tags')() || 'yes') === 'no') {
		const postTags = document.querySelector(
			'.site-main .content-area article .entry-tags'
		)

		postTags && postTags.parentNode.removeChild(postTags)
	}

	if ((wp.customize('has_post_nav')() || 'yes') === 'no') {
		const postNav = document.querySelector(
			'.site-main .content-area article .post-navigation'
		)

		postNav && postNav.parentNode.removeChild(postNav)
	} else {
		if ((wp.customize('has_post_nav_thumb')() || 'yes') === 'no') {
			;[
				...document.querySelectorAll(
					'.site-main .content-area article .post-navigation [class*="nav-item"] > figure'
				)
			].map(el => el.parentNode.removeChild(el))
		}

		if ((wp.customize('has_post_nav_title')() || 'yes') === 'no') {
			;[
				...document.querySelectorAll(
					'.site-main .content-area article .post-navigation [class*="nav-item"] .item-title'
				)
			].map(el => el.parentNode.removeChild(el))
		}

		if (
			document.querySelector(
				'.site-main .content-area article .post-navigation'
			)
		) {
			responsiveClassesFor(
				'post_nav_visibility',
				document.querySelector(
					'.site-main .content-area article .post-navigation'
				)
			)
		}
	}

	if ((wp.customize('has_featured_image')() || 'no') === 'no') {
		const postNav = document.querySelector(
			'.site-main .content-area article .ct-featured-image'
		)

		postNav && postNav.remove()
	} else {
		const image = document.querySelector(
			'.site-main .content-area article .ct-featured-image'
		)

		image && image.classList.remove('alignwide')
		image && image.classList.remove('ct-boundless')

		if (
			getSidebarTypeFor(wp.customize('single_page_structure')()) ===
				'none' &&
			(wp.customize('single_content_style')() || 'wide') === 'wide'
		) {
			if (wp.customize('single_featured_image_width')() === 'wide') {
				image.classList.add('alignwide')
			}
		}

		if (
			(wp.customize('single_content_style')() || 'wide') === 'boxed' &&
			(wp.customize('single_featured_image_boundless')() || 'no') ===
				'yes'
		) {
			image.classList.add('ct-boundless')
		}

		if (wp.customize('single_featured_image_location')() === 'below') {
			setTimeout(() => {
				if (
					document.querySelector(
						'.site-main .content-area article .hero-section[data-type="type-1"]'
					)
				) {
					document
						.querySelector('.site-main .content-area article')
						.insertBefore(
							document.querySelector(
								'.site-main .content-area article .hero-section[data-type="type-1"]'
							),
							document.querySelector(
								'.site-main .content-area article .ct-featured-image'
							)
						)
				}
			})
		}

		if (image) {
			setRatioFor(
				wp.customize('single_featured_image_ratio')(),
				image.querySelector('.ct-image-container .ct-ratio')
			)
		}

		if (
			document.querySelector(
				'.site-main .content-area article .ct-featured-image'
			)
		) {
			responsiveClassesFor(
				'single_featured_image_visibility',
				document.querySelector(
					'.site-main .content-area article .ct-featured-image'
				)
			)
		}
	}

	renderHeroSection(getPrefixFor())

	markImagesAsLoaded(document.querySelector('.site-main'))
}
wp.customize('single_page_hero_section', val =>
	val.bind(to => replaceArticleAndRemoveParts())
)
wp.customize('single_blog_post_hero_section', val =>
	val.bind(to => replaceArticleAndRemoveParts())
)
wp.customize('has_share_box', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('share_box_visibility', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('has_post_nav_title', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('has_post_nav_thumb', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('share_box1_location', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('share_box2_location', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('share_box_type', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('share_facebook', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('share_twitter', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('share_pinterest', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('share_linkedin', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('share_vk', val => val.bind(() => replaceArticleAndRemoveParts()))
wp.customize('share_ok', val => val.bind(() => replaceArticleAndRemoveParts()))
wp.customize('share_telegram', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('share_viber', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)

wp.customize('share_reddit', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('share_hacker_news', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('share_whatsapp', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('has_author_box', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('single_author_box_social', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('author_box_visibility', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('has_post_nav', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('post_nav_visibility', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('has_post_tags', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('has_featured_image', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('single_featured_image_visibility', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('single_featured_image_width', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('single_featured_image_ratio', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('single_featured_image_location', val =>
	val.bind(() => replaceArticleAndRemoveParts())
)
wp.customize('single_content_style', val =>
	val.bind(to => replaceArticleAndRemoveParts())
)
wp.customize('single_featured_image_boundless', val =>
	val.bind(to => replaceArticleAndRemoveParts())
)

wp.customize('has_post_comments', val =>
	val.bind(to => {
		if (
			!document.body.classList.contains('single') &&
			!document.body.classList.contains('page')
		) {
			return
		}

		const comments = document.querySelector(
			'.site-main .ct-comments-container'
		)
		if (comments) {
			comments.parentNode.removeChild(comments)
		}

		if (to === 'yes') {
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
				document
					.querySelector('.site-main')
					.appendChild(newWrapper.firstElementChild)

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
							document.querySelector(
								'.site-main .ct-related-posts'
							)
						)
				}
			}

			markImagesAsLoaded(document.querySelector('.site-main'))
		}
	})
)

const refreshRelatedPosts = (shouldInsert = true) => {
	if (!document.body.classList.contains('single')) {
		return
	}

	const relatedPosts = document.querySelector('.site-main .ct-related-posts')

	if (relatedPosts) {
		relatedPosts.parentNode.removeChild(relatedPosts)
	}

	if (!shouldInsert) return

	const newWrapper = document.createElement('div')
	if (
		!getCache().querySelector(
			'.ct-customizer-preview-cache [data-part="related-posts"]'
		)
	) {
		return
	}
	newWrapper.innerHTML = getCache().querySelector(
		'.ct-customizer-preview-cache [data-part="related-posts"]'
	).innerHTML

	if (newWrapper.firstElementChild) {
		if (
			!document.querySelector('.site-main .ct-comments-container') ||
			wp.customize('related_location')() === 'after'
		) {
			document
				.querySelector('.site-main')
				.appendChild(newWrapper.firstElementChild)
		} else {
			document
				.querySelector('.site-main .ct-comments-container')
				.parentNode.insertBefore(
					newWrapper.firstElementChild,
					document.querySelector('.site-main .ct-comments-container')
				)
		}
	}

	document
		.querySelector('.ct-related-posts')
		.firstElementChild.classList.remove(
			'ct-container',
			'ct-container-narrow'
		)

	document
		.querySelector('.ct-related-posts')
		.firstElementChild.classList.add(
			wp.customize('related_structure')() === 'normal'
				? 'ct-container'
				: 'ct-container-narrow'
		)

	Array.from(
		new Array(8 - parseInt(wp.customize('related_posts_count')() || 8, 10))
	).map(
		() =>
			document.querySelector(
				'.site-main .ct-related-posts div[data-columns]'
			).children.length >
				parseInt(wp.customize('related_posts_count')() || 8, 10) &&
			document
				.querySelector('.site-main .ct-related-posts div[data-columns]')
				.removeChild(
					document.querySelector(
						'.site-main .ct-related-posts div[data-columns]'
					).lastElementChild
				)
	)

	document.querySelector(
		'.site-main .ct-related-posts div[data-columns]'
	).dataset.columns = wp.customize('related_posts_columns')() || 3

	document.querySelector(
		'.site-main .ct-related-posts .ct-block-title'
	).innerHTML = wp.customize('related_label')()

	changeTagName(
		document.querySelector('.site-main .ct-related-posts .ct-block-title'),
		wp.customize('related_label_wrapper')()
	)

	const metaElements = wp.customize('related_meta_elements')()

	if (!metaElements.author) {
		;[
			...document.querySelectorAll(
				'.site-main .ct-related-posts .entry-meta .avatar-container'
			)
		].map(el => {
			el.parentNode.classList.remove('has-avatar')
			el.remove()
		})
		;[
			...document.querySelectorAll(
				'.site-main .ct-related-posts .entry-meta .ct-meta-author'
			)
		].map(el => el.remove())
	}

	if (!metaElements.comments) {
		;[
			...document.querySelectorAll(
				'.site-main .ct-related-posts .entry-meta .ct-meta-comments'
			)
		].map(el => el.remove())
	}

	if (!metaElements.date) {
		;[
			...document.querySelectorAll(
				'.site-main .ct-related-posts .entry-meta .ct-meta-date'
			)
		].map(el => el.remove())
	}

	if (!metaElements.categories) {
		;[
			...document.querySelectorAll(
				'.site-main .ct-related-posts .entry-meta .ct-meta-categories'
			)
		].map(el => el.remove())
	}

	;[
		...document.querySelectorAll('.site-main .ct-related-posts .entry-meta')
	].map(el => el.children.length === 0 && el.remove())

	if (wp.customize('has_related_meta_label')() === 'no') {
		;[
			...document.querySelectorAll(
				'.site-main .ct-related-posts .entry-meta .ct-meta-label'
			)
		].map(label => label.remove())
	}

	;[
		...document.querySelectorAll(
			'.site-main .ct-related-posts .entry-meta .ct-meta-date .ct-meta-element'
		),
		...document.querySelectorAll(
			'.site-main .ct-related-posts .entry-meta .ct-meta-updated-date .ct-meta-element'
		)
	].map(dateEl => {
		dateEl.innerHTML = window.wp.date.format(
			wp.customize('related_date_format_source')() === 'default'
				? dateEl.dataset.defaultFormat
				: wp.customize('related_meta_date_format')() || 'M j, Y',
			moment(dateEl.dataset.date)
		)
	})

	responsiveClassesFor(
		'related_visibility',
		document.querySelector('.site-main .ct-related-posts')
	)
	;[
		...document.querySelectorAll(
			'.ct-related-posts div[data-columns] .ct-image-container .ct-ratio'
		)
	].map(el => setRatioFor(wp.customize('related_featured_image_ratio')(), el))

	markImagesAsLoaded(document.querySelector('.site-main'))
}

wp.customize('has_related_posts', val =>
	val.bind(to => refreshRelatedPosts(to === 'yes'))
)

wp.customize('related_location', val => val.bind(to => refreshRelatedPosts()))
wp.customize('related_meta_elements', val =>
	val.bind(to => refreshRelatedPosts())
)
wp.customize('has_related_meta_label', val =>
	val.bind(to => refreshRelatedPosts())
)
wp.customize('related_date_format_source', val =>
	val.bind(to => refreshRelatedPosts())
)
wp.customize('related_meta_date_format', val =>
	val.bind(to => refreshRelatedPosts())
)

wp.customize('related_structure', val =>
	val.bind(to => {
		if (!document.querySelector('.ct-related-posts')) {
			return
		}

		document
			.querySelector('.ct-related-posts')
			.firstElementChild.classList.remove(
				'ct-container',
				'ct-container-narrow'
			)

		document
			.querySelector('.ct-related-posts')
			.firstElementChild.classList.add(
				wp.customize('related_structure')() === 'normal'
					? 'ct-container'
					: 'ct-container-narrow'
			)
	})
)

wp.customize('single_author_box_type', val => {
	val.bind(to => {
		if (document.querySelector('.site-main .author-box')) {
			document.querySelector('.site-main .author-box').dataset.type = to
		}
	})
})

wp.customize('related_posts_columns', val => {
	val.bind(to => {
		if (
			document.querySelector(
				'.site-main .ct-related-posts div[data-columns]'
			)
		) {
			document.querySelector(
				'.site-main .ct-related-posts div[data-columns]'
			).dataset.columns = to
		}
	})
})

wp.customize('related_posts_count', val =>
	val.bind(() => refreshRelatedPosts())
)
wp.customize('related_visibility', val => val.bind(() => refreshRelatedPosts()))
wp.customize('related_label', val => val.bind(() => refreshRelatedPosts()))
wp.customize('related_label_wrapper', val =>
	val.bind(() => refreshRelatedPosts())
)
wp.customize('related_featured_image_ratio', val =>
	val.bind(() => refreshRelatedPosts())
)

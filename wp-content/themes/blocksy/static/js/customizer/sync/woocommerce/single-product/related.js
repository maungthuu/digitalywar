import { markImagesAsLoaded } from '../../../../frontend/lazy-load-helpers'
import { getCache, getFreshHtmlFor, checkAndReplace } from '../../helpers'
import { responsiveClassesFor } from '../../footer'

/*
checkAndReplace({
	id: 'has_shop_sort',

	parent_selector: '.woo-listing-top',
	selector: '.woocommerce-ordering',
	fragment_id: 'shop-sort',
	whenInserted: () => ctEvents.trigger('ct:custom-select:init')
})
*/

const renderRelatedForProduct = () => {
	if (!document.querySelector('.product')) return
	;[...document.querySelectorAll('.related.products')].map(el =>
		el.parentNode.removeChild(el)
	)

	if (wp.customize('has_product_related')() !== 'yes') {
		return
	}

	const related = getFreshHtmlFor('single-related')

	while (related.firstElementChild) {
		document
			.querySelector('.product')
			.parentNode.appendChild(related.firstElementChild)
	}

	document.querySelector(
		'.products .shop-entries'
	).dataset.columns = wp.customize('related_products_columns')()
	const amountToRemove =
		Math.min(
			8,
			document.querySelector('.products .shop-entries').children.length
		) - parseInt(wp.customize('related_products')(), 10)

	if (amountToRemove > 0) {
		;[...Array(amountToRemove)].map(() =>
			document
				.querySelector('.products .shop-entries')
				.removeChild(
					document.querySelector('.products .shop-entries')
						.lastElementChild
				)
		)
	}

	responsiveClassesFor(
		'related_products_visibility',
		document.querySelector('.products.related')
	)

	markImagesAsLoaded(document.querySelector('.shop-entries'))
}

wp.customize('has_product_related', val =>
	val.bind(to => renderRelatedForProduct())
)
wp.customize('related_products_columns', val =>
	val.bind(to => renderRelatedForProduct())
)

wp.customize('related_products', val =>
	val.bind(to => renderRelatedForProduct())
)

wp.customize('related_products_visibility', val =>
	val.bind(to => renderRelatedForProduct())
)

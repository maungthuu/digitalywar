import {
	createElement,
	Fragment,
	Component,
	useRef,
	useEffect,
	useState
} from '@wordpress/element'
import { registerPlugin, withPluginContext } from '@wordpress/plugins'
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post'
import { withSelect, withDispatch, useDispatch } from '@wordpress/data'
import { compose } from '@wordpress/compose'
import { IconButton } from '@wordpress/components'
import { handleMetaboxValueChange } from './editor/sync'

import { __ } from 'ct-i18n'

import {
	OptionsPanel,
	getValueFromInput,
	PanelLevel,
	DeviceManagerProvider
} from 'blocksy-options'

const BlocksyOptions = ({
	name,
	value,
	options,
	onChange,
	isActive,
	isPinnable = true,
	isPinned,
	togglePin,
	toggleSidebar
}) => {
	const containerRef = useRef()
	const parentContainerRef = useRef()
	const [values, setValues] = useState(null)

	const { closeGeneralSidebar } = useDispatch('core/edit-post')

	useEffect(() => {
		document.body.classList[isActive ? 'add' : 'remove'](
			'blocksy-sidebar-active'
		)
	}, [isActive])

	return (
		<Fragment>
			<PluginSidebarMoreMenuItem target="blocksy" icon="admin-customizer">
				{__('Blocksy Page Settings', 'blocksy')}
			</PluginSidebarMoreMenuItem>

			<PluginSidebar
				name={name}
				icon={
					<div className="ct-page-options-trigger">
						{__('Page Settings', 'blocksy')}
					</div>
				}
				className="ct-components-panel"
				title={__('Blocksy Page Settings', 'blocksy')}>
				<div id="ct-page-options" ref={parentContainerRef}>
					<div className="ct-options-container" ref={containerRef}>
						<DeviceManagerProvider>
							<PanelLevel
								containerRef={containerRef}
								parentContainerRef={parentContainerRef}
								useRefsAsWrappers>
								<div className="ct-panel-options-header components-panel__header edit-post-sidebar-header">
									<strong>
										{__('Blocksy Page Settings', 'blocksy')}
									</strong>

									{isPinnable && (
										<IconButton
											icon={
												isPinned
													? 'star-filled'
													: 'star-empty'
											}
											label={
												isPinned
													? __(
															'Unpin from toolbar',
															'blocksy'
													  )
													: __(
															'Pin to toolbar',
															'blocksy'
													  )
											}
											onClick={togglePin}
											isPressed={isPinned}
											aria-expanded={isPinned}
										/>
									)}

									<IconButton
										onClick={closeGeneralSidebar}
										icon="no-alt"
										label={__('Close plugin', 'blocksy')}
									/>
								</div>
								<OptionsPanel
									onChange={(key, v) => {
										const futureValue = {
											...(values ||
												getValueFromInput(
													options,
													value || {}
												)),
											[key]: v
										}

										handleMetaboxValueChange(key, v)

										onChange(futureValue)
										setValues(futureValue)
									}}
									value={
										values ||
										getValueFromInput(options, value || {})
									}
									options={options}
								/>
							</PanelLevel>
						</DeviceManagerProvider>
					</div>
				</div>
			</PluginSidebar>
		</Fragment>
	)
}

const BlocksyOptionsComposed = compose(
	withPluginContext((context, { name }) => ({
		sidebarName: `${context.name}/${name}`
	})),

	withSelect((select, { sidebarName }) => {
		const value = select('core/editor').getEditedPostAttribute(
			'blocksy_meta'
		)

		const { getActiveGeneralSidebarName, isPluginItemPinned } = select(
			'core/edit-post'
		)

		return {
			isActive: getActiveGeneralSidebarName() === sidebarName,
			isPinned: isPluginItemPinned(sidebarName),
			value: Array.isArray(value) ? {} : value || {},
			options: ct_editor_localizations.post_options
		}
	}),
	withDispatch(dispatch => ({
		onChange: blocksy_meta => {
			dispatch('core/editor').editPost({
				blocksy_meta
			})
		}
	}))
)(BlocksyOptions)

if (ct_editor_localizations.post_options) {
	registerPlugin('blocksy', {
		render: () => <BlocksyOptionsComposed name="blocksy" />
	})
}

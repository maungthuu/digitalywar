import { createElement, Fragment, Component } from '@wordpress/element'
import classnames from 'classnames'
import ResponsiveControls, {
	maybePromoteScalarValueIntoResponsive,
	isOptionEnabledFor,
	isOptionResponsiveFor
} from '../customizer/components/responsive-controls'
import deepEqual from 'deep-equal'
import { normalizeCondition, matchValuesWithCondition } from 'match-conditions'
import { __ } from 'ct-i18n'

const CORE_OPTIONS_CONTEXT = require.context('./options/', false, /\.js$/)
CORE_OPTIONS_CONTEXT.keys().forEach(CORE_OPTIONS_CONTEXT)

const hasCoreOptionModifier = type => {
	let index = CORE_OPTIONS_CONTEXT.keys()
		.map(module => module.replace(/^\.\//, '').replace(/\.js$/, ''))
		.indexOf(type)

	return index > -1 && CORE_OPTIONS_CONTEXT.keys()[index]
}

const capitalizeFirstLetter = str => {
	str = str == null ? '' : String(str)
	return str.charAt(0).toUpperCase() + str.slice(1)
}

const getOptionLabelFor = ({ id, option, values, renderingConfig }) => {
	let maybeLabel =
		Object.keys(option).indexOf('label') === -1
			? capitalizeFirstLetter(id).replace(/\_|\-/g, ' ')
			: option.label

	if (maybeLabel !== maybeLabel.toString()) {
		maybeLabel =
			Object.keys(maybeLabel).reduce((approvedLabel, currentLabel) => {
				if (approvedLabel) {
					return approvedLabel
				}

				if (
					matchValuesWithCondition(
						normalizeCondition(maybeLabel[currentLabel]),
						values
					)
				) {
					return currentLabel
				}

				return approvedLabel
			}, null) || Object.keys(maybeLabel)[0]
	}

	/**
	 * Fuck JS
	 */
	if (maybeLabel === '') {
		maybeLabel = true
	}

	if (!renderingConfig.label) {
		maybeLabel = false
	}

	return maybeLabel
}

export const getOptionFor = option => {
	const dynamicOptionTypes = {}
	ctEvents.trigger('blocksy:options:register', dynamicOptionTypes)

	if (hasCoreOptionModifier(option.type)) {
		return CORE_OPTIONS_CONTEXT(hasCoreOptionModifier(option.type)).default
	}

	if (dynamicOptionTypes[option.type]) {
		return dynamicOptionTypes[option.type]
	}

	return null
}

class GenericOptionType extends Component {
	state = {
		device:
			wp.customize && wp.customize.previewedDevice
				? wp.customize.previewedDevice()
				: 'desktop'
	}

	listener = () =>
		this.setState({
			device:
				wp.customize && wp.customize.previewedDevice
					? wp.customize.previewedDevice()
					: 'desktop'
		})

	componentDidMount() {
		if (this.props.option.type !== 'ct-typography') {
			if (!isOptionResponsiveFor(this.props.option)) {
				return
			}
		}

		if (!wp.customize) return
		setTimeout(() => wp.customize.previewedDevice.bind(this.listener), 1000)
	}

	componentWillUnmount() {
		if (this.props.option.type !== 'ct-typography') {
			if (!isOptionResponsiveFor(this.props.option)) {
				return
			}
		}

		if (!wp.customize) return
		wp.customize.previewedDevice.unbind(this.listener)
	}

	setDevice(device) {
		this.setState({ device })
		wp.customize && wp.customize.previewedDevice.set(device)
	}

	render() {
		let {
			value,
			values,
			onChange,
			onChangeFor,
			option,
			id,
			purpose
		} = this.props

		let OptionComponent = getOptionFor(option)

		const globalResponsiveValue = maybePromoteScalarValueIntoResponsive(
			value,
			isOptionResponsiveFor(option)
		)

		const valueWithResponsive = isOptionResponsiveFor(option, {
			ignoreHidden: true
		})
			? globalResponsiveValue[this.state.device]
			: globalResponsiveValue

		const onChangeWithMobileBridge = value => {
			if (
				option.switchDeviceOnChange &&
				wp.customize &&
				wp.customize.previewedDevice() !== option.switchDeviceOnChange
			) {
				wp.customize.previewedDevice.set(option.switchDeviceOnChange)
			}

			onChange(value)
		}

		const onChangeWithResponsiveBridge = scalarValue => {
			const responsiveValue = maybePromoteScalarValueIntoResponsive(
				value,
				isOptionResponsiveFor(option)
			)

			onChangeWithMobileBridge(
				isOptionResponsiveFor(option, { ignoreHidden: true })
					? {
							...responsiveValue,
							[this.state.device]: scalarValue,
							...(this.state.device === 'desktop'
								? Object.keys(responsiveValue).reduce(
										(currentValue, key) => ({
											...currentValue,
											...(key !== 'desktop' &&
											key !== '__changed' &&
											Object.keys(
												maybePromoteScalarValueIntoResponsive(
													option.value
												)
											).reduce(
												(result, key) =>
													result
														? maybePromoteScalarValueIntoResponsive(
																option.value
														  )[key] ===
														  maybePromoteScalarValueIntoResponsive(
																option.value
														  ).desktop
														: false,
												true
											) &&
											(
												responsiveValue.__changed || []
											).indexOf('tablet') === -1
												? {
														[key]: scalarValue
												  }
												: {})
										}),
										{}
								  )
								: {}),
							...(this.state.device === 'tablet'
								? Object.keys(responsiveValue).reduce(
										(currentValue, key) => ({
											...currentValue,
											...(key !== 'desktop' &&
											key !== 'tablet' &&
											key !== '__changed' &&
											Object.keys(
												maybePromoteScalarValueIntoResponsive(
													option.value
												)
											).reduce(
												(result, key) =>
													result
														? maybePromoteScalarValueIntoResponsive(
																option.value
														  )[key] ===
														  maybePromoteScalarValueIntoResponsive(
																option.value
														  ).desktop
														: false,
												true
											) &&
											(
												responsiveValue.__changed || []
											).indexOf(key) === -1
												? {
														[key]: scalarValue
												  }
												: {})
										}),
										{}
								  )
								: {}),
							__changed: [
								...(responsiveValue.__changed || []),
								...(this.state.device !== 'desktop'
									? [this.state.device]
									: [])
							]
					  }
					: scalarValue
			)
		}

		/**
		 * Handle transparent components
		 */
		if (!OptionComponent) {
			return <div>Unimplemented option: {option.type}</div>
		}

		let renderingConfig = { design: true, label: true, wrapperAttr: {} }
		let LabelToolbar = () => null
		let OptionMetaWrapper = null
		let ControlEnd = () => null
		let sectionClassName = () => ({})

		renderingConfig = {
			...renderingConfig,
			...(OptionComponent.renderingConfig || {})
		}

		if (option.design) {
			renderingConfig.design = option.design
		}

		if (OptionComponent.LabelToolbar) {
			LabelToolbar = OptionComponent.LabelToolbar
		}

		if (OptionComponent.ControlEnd) {
			ControlEnd = OptionComponent.ControlEnd
		}

		if (OptionComponent.MetaWrapper) {
			OptionMetaWrapper = OptionComponent.MetaWrapper
		}

		if (OptionComponent.sectionClassName) {
			sectionClassName = OptionComponent.sectionClassName
		}

		let OptionComponentWithoutDesign = (
			<OptionComponent
				key={id}
				{...{
					option: {
						...option,
						value: isOptionResponsiveFor(option, {
							ignoreHidden: true
						})
							? maybePromoteScalarValueIntoResponsive(
									option.value || ''
							  )[this.state.device]
							: maybePromoteScalarValueIntoResponsive(
									option.value || '',
									isOptionResponsiveFor(option)
							  )
					},
					value: valueWithResponsive,
					id,
					values,
					onChangeFor,
					device: this.state.device,
					onChange: onChangeWithResponsiveBridge
				}}
			/>
		)

		if (!renderingConfig.design || renderingConfig.design === 'none') {
			return OptionComponentWithoutDesign
		}

		let maybeLabel = getOptionLabelFor({
			id,
			option,
			values,
			renderingConfig
		})

		let maybeDesc =
			Object.keys(option).indexOf('desc') === -1 ? false : option.desc

		let maybeLink =
			Object.keys(option).indexOf('link') === -1
				? false
				: option.link || ' '

		const actualDesignType =
			typeof renderingConfig.design === 'boolean'
				? 'block'
				: renderingConfig.design

		if (renderingConfig.design === 'compact') {
			return (
				<section {...(option.sectionAttr || {})}>
					{maybeLabel && <label>{maybeLabel}</label>}

					{((isOptionResponsiveFor(option) &&
						isOptionEnabledFor(
							this.state.device,
							option.responsive
						)) ||
						!isOptionResponsiveFor(option)) &&
						OptionComponentWithoutDesign}
					{maybeLink && (
						<a
							dangerouslySetInnerHTML={{
								__html: maybeLink
							}}
							{...(option.linkAttr || {})}
						/>
					)}
				</section>
			)
		}

		// if (purpose === 'customizer') {
		const getActualOption = ({
			wrapperAttr: { className, ...additionalWrapperAttr } = {},
			...props
		} = {}) => (
			<div
				className={classnames('ct-control', className, {})}
				data-design={actualDesignType}
				{...(option.divider ? { 'data-divider': option.divider } : {})}
				{...{
					...((isOptionResponsiveFor(option) &&
						!isOptionEnabledFor(
							this.state.device,
							option.responsive
						)) ||
					option.state === 'disabled'
						? { 'data-state': 'disabled' }
						: {})
				}}
				{...{
					...(option.wrapperAttr || {}),
					...additionalWrapperAttr
				}}>
				<header>
					{maybeLabel && <label>{maybeLabel}</label>}

					{option.type !== 'ct-image-picker' &&
						option.type !== 'ct-layers' &&
						option.type !== 'ct-image-uploader' &&
						option.type !== 'ct-panel' &&
						this.props.hasRevertButton &&
						!option.disableRevertButton && (
							<button
								type="button"
								disabled={deepEqual(option.value, value)}
								className="ct-revert"
								onClick={() =>
									onChangeWithMobileBridge(option.value)
								}
							/>
						)}

					<LabelToolbar
						{...{
							option,
							value: valueWithResponsive,
							id,
							onChange: onChangeWithResponsiveBridge
						}}
					/>

					{isOptionResponsiveFor(option, { ignoreHidden: true }) &&
						actualDesignType.indexOf('block') > -1 && (
							<ResponsiveControls
								device={this.state.device}
								responsiveDescriptor={option.responsive}
								setDevice={device => this.setDevice(device)}
							/>
						)}
				</header>

				{isOptionResponsiveFor(option) &&
					!isOptionEnabledFor(
						this.state.device,
						option.responsive
					) && (
						<div className="ct-disabled-notification">
							{option.disabledDeviceMessage ||
								__(
									"Option can't be edited for current device",
									'blocksy'
								)}
						</div>
					)}

				{((isOptionResponsiveFor(option) &&
					isOptionEnabledFor(this.state.device, option.responsive)) ||
					!isOptionResponsiveFor(option)) && (
					<Fragment>
						<section
							{...(option.sectionAttr || {})}
							className={classnames(
								{
									'ct-responsive-container':
										isOptionResponsiveFor(option, {
											ignoreHidden: true
										}) && actualDesignType === 'inline'
								},
								sectionClassName({
									design: actualDesignType,
									option
								}),
								(option.sectionAttr || {}).class || ''
							)}>
							{isOptionResponsiveFor(option, {
								ignoreHidden: true
							}) &&
								actualDesignType === 'inline' && (
									<ResponsiveControls
										device={this.state.device}
										responsiveDescriptor={option.responsive}
										setDevice={device =>
											this.setDevice(device)
										}
									/>
								)}
							{OptionComponentWithoutDesign}

							{maybeLink && (
								<a
									dangerouslySetInnerHTML={{
										__html: maybeLink
									}}
									{...(option.linkAttr || {})}
								/>
							)}
						</section>

						<ControlEnd />

						{maybeDesc && (
							<div
								dangerouslySetInnerHTML={{
									__html: maybeDesc
								}}
								className="ct-option-description"
							/>
						)}
					</Fragment>
				)}
			</div>
		)

		return OptionMetaWrapper ? (
			<OptionMetaWrapper
				id={id}
				option={option}
				value={valueWithResponsive}
				onChangeFor={onChangeFor}
				values={values}
				getActualOption={getActualOption}
			/>
		) : (
			getActualOption()
		)
		// }

		return (
			<div
				className="ct-option-container"
				{...(option.wrapperAttr || {})}
				{...(renderingConfig.design && renderingConfig.design !== true
					? { ['data-design']: renderingConfig.design }
					: {})}>
				{maybeLabel && <label>{maybeLabel}</label>}

				<section {...(option.sectionAttr || {})}>
					<div key={'option'} className="ct-option">
						{OptionComponentWithoutDesign}
					</div>

					{maybeDesc && (
						<div
							dangerouslySetInnerHTML={{ __html: maybeDesc }}
							className="ct-option-description"
						/>
					)}
				</section>
			</div>
		)
	}
}

export default GenericOptionType

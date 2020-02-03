import { createElement, Component, useState } from '@wordpress/element'
import cls from 'classnames'
import { __, sprintf } from 'ct-i18n'

const Ratio = ({ option, value, onChange }) => {
	const [isForcedReversed, setIsReversed] = useState(false)

	let normal_ratios = ['4/3', '16/9', '2/1']
	let reversed_ratios = ['3/4', '9/16', '1/2']

	const isReversed =
		normal_ratios.indexOf(value) > -1
			? false
			: reversed_ratios.indexOf(value) > -1
			? true
			: isForcedReversed

	let currentTab =
		value === 'original'
			? 'original'
			: value.indexOf('/') === -1
			? 'custom'
			: 'predefined'
	let isCustom = value.indexOf('/') === -1

	return (
		<div
			className={cls('ct-ratio-picker', {
				reversed: isReversed
			})}>
			<ul className="ct-radio-option ct-buttons-group">
				<li
					className={cls({
						active: currentTab === 'original'
					})}
					onClick={() => {
						if (value !== 'original') {
							onChange('original')
						}
					}}>
					{__('Original', 'blocksy')}
				</li>
				<li
					className={cls({
						active: currentTab === 'predefined'
					})}
					onClick={() => {
						if (value.indexOf('/') === -1 || value === 'original') {
							onChange(option.value)
						}
					}}>
					{__('Predefined', 'blocksy')}
				</li>
				<li
					className={cls({
						active: currentTab === 'custom'
					})}
					onClick={() => {
						if (value.indexOf('/') !== -1 || value === 'original') {
							let [first, second] = (value === 'original'
								? option.value
								: value
							).split('/')
							onChange(`${first}:${second}`)
						}
					}}>
					{__('Custom', 'blocksy')}
				</li>
			</ul>

			{currentTab === 'predefined' && (
				<div className="ct-ratio-predefined">
					<ul className="ct-buttons-group">
						{[
							'1/1',
							...(isReversed ? reversed_ratios : normal_ratios)
						].map(ratio => (
							<li
								className={cls({
									active: ratio === value
								})}
								onClick={() => onChange(ratio)}>
								{ratio}
							</li>
						))}
					</ul>

					<button
						onClick={e => {
							e.preventDefault()

							if (value === '1/1') {
								setIsReversed(!isReversed)
								return
							}

							let [
								first_component,
								second_component
							] = value.split('/')

							setIsReversed(+first_component < +second_component)

							onChange(
								value
									.split('/')
									.reverse()
									.join('/')
							)
						}}>
						<span />
						<i className="ct-tooltip-top">Reverse</i>
					</button>
				</div>
			)}

			{currentTab === 'custom' && (
				<div className="ct-ratio-custom">
					<div className="ct-option-input">
						<input
							type="text"
							value={value.split(':')[0]}
							onChange={({ target: { value: val } }) => {
								onChange(`${val}:${value.split(':')[1]}`)
							}}
						/>
					</div>
					<span>:</span>
					<div className="ct-option-input">
						<input
							type="text"
							value={value.split(':')[1]}
							onChange={({ target: { value: val } }) => {
								onChange(`${value.split(':')[0]}:${val}`)
							}}
						/>
					</div>

					<div
						className="ct-notification"
						dangerouslySetInnerHTML={{
							__html: sprintf(
								__(
									'Use this online %stool%s for calculating a custom image ratio based on your image size.',
									'blocksy'
								),
								'<a href="https://www.digitalrebellion.com/webapps/aspectcalc" target="_blank">',
								'</a>'
							)
						}}
					/>
				</div>
			)}
		</div>
	)
}

export default Ratio

import {
	createElement,
	Fragment,
	Component,
	useEffect,
	useMemo,
	createPortal,
	useState,
	useCallback,
	createContext,
	useReducer
} from '@wordpress/element'
import PlacementsBuilder from './PlacementsBuilder'
import DraggableItems from './DraggableItems'
import ViewSwitch from './ViewSwitch'
import AvailableItems from './AvailableItems'
import { builderReducer } from './builderReducer'
import { useDeviceManager } from '../../components/useDeviceManager'

export const DragDropContext = createContext({})

const BuilderRoot = ({
	value: allBuilderSections,
	option,
	onChange: onBuilderValueChange
}) => {
	const [builderValueCollection, builderValueDispatchInternal] = useReducer(
		builderReducer,
		allBuilderSections
	)

	const builderValue = useMemo(
		() =>
			builderValueCollection.sections.find(
				({ id }) => id === builderValueCollection.current_section
			),
		[builderValueCollection]
	)

	const [isDragging, setIsDragging] = useState(false)

	// desktop | mobile
	const [currentView, setCurrentView] = useDeviceManager({
		withTablet: false
	})

	const inlinedItemsFromBuilder = builderValue[currentView].reduce(
		(currentItems, { id, placements }) => [
			...currentItems,
			...(placements || []).reduce(
				(c, { id, items }) => [...c, ...items],
				[]
			)
		],
		[]
	)

	const builderValueDispatch = useCallback(
		payload =>
			builderValueDispatchInternal({
				...payload,
				onBuilderValueChange
			}),
		[builderValueDispatchInternal, onBuilderValueChange]
	)

	const getList = useCallback(id => {
		return []

		const [barId, placementId] = id.split(':')

		return builderValue[currentView]
			.find(({ id }) => id === barId)
			.placements.find(({ id }) => id === placementId).items
	}, [])

	const setList = useCallback(
		lists =>
			builderValueDispatch({
				type: 'SET_LIST',
				onBuilderValueChange,
				payload: {
					currentView,
					lists
				}
			}),
		[currentView, onBuilderValueChange]
	)

	return (
		<Fragment>
			<DragDropContext.Provider
				value={{
					currentView,
					isDragging,
					setIsDragging,
					setList,
					builderValueDispatch,
					onChange: ({ id, value }) => setList({ [id]: value })
				}}>
				<AvailableItems
					allBuilderSections={allBuilderSections}
					builderValue={builderValue}
					inlinedItemsFromBuilder={inlinedItemsFromBuilder}
					builderValueDispatch={builderValueDispatch}
				/>

				{createPortal(
					<div className="ct-builder-header">
						<ViewSwitch
							currentView={currentView}
							setCurrentView={setCurrentView}
						/>

						<PlacementsBuilder
							builderValueWithView={builderValue[currentView]}
							view={currentView}
						/>
					</div>,
					document.querySelector('.ct-panel-builder')
				)}
			</DragDropContext.Provider>
		</Fragment>
	)
}

export default BuilderRoot

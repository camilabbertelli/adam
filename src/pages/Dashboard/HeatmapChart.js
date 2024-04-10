
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/HeatmapChart.css";
import { useDroppable } from '@dnd-kit/core';
import React from 'react';


const HeatmapChart = (props) => {
	const { isOver, setNodeRef } = useDroppable({
		id: 'droppable',
	});

	const onMouseOver = () => {
		console.log(props)
		if (props.activeCategory) {
			if (props.activeCategories.length < 2 && !props.activeCategories.includes(props.activeCategory)) {
				let aux = [...props.activeCategories]
				aux.push(props.activeCategory)
				props.updateActiveCategories(aux);
				console.log(aux)
			}
		}
		props.updateActiveCategory(null);
	}

	return (
		<div onMouseOver={onMouseOver} ref={setNodeRef} className={"shadow heatmap-area" + ((props.activeCategory) ? " dashed" : "")}>
			{props.children}
		</div>
	);
}

export default HeatmapChart
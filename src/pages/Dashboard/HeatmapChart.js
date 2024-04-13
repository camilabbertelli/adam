
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/HeatmapChart.css";
import { useDroppable } from '@dnd-kit/core';
import React from 'react';


const HeatmapChart = (props) => {
	const { setNodeRef } = useDroppable({
		id: 'droppable',
	});

	return (
		<div id="droppable" ref={setNodeRef} className={"shadow heatmap-area" + ((props.activeCategory) ? " dashed" : "")}>
			{props.children}
		</div>
	);
}

export default HeatmapChart
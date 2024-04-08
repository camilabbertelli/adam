
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/HeatmapChart.css";
import { useDroppable } from '@dnd-kit/core';
import React from 'react';


const HeatmapChart = () => {
    const {isOver, setNodeRef} = useDroppable({
        id: 'droppable',
      });
      const style = {
        color: isOver ? 'green' : undefined,
      };
    return (
    <div className="heatmap-area shadow">
    <div ref={setNodeRef} style={style}>
      
    </div>
    </div>
    )
}

export default HeatmapChart
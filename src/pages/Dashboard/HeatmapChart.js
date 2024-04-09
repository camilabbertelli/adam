
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/HeatmapChart.css";
import { useDroppable } from '@dnd-kit/core';
import React from 'react';


const HeatmapChart = (props) => {
  const {isOver, setNodeRef} = useDroppable({
    id: 'droppable',
  });
  const style = {
    backgroundColor: isOver ? '#baded1' : undefined,
    opacity: 1
  };
  
  
  return (
      <div ref={setNodeRef} style={style} className={"shadow heatmap-area" + ((props.activeId) ?" dashed" : "")}>
        {props.children}
      </div>
  );
}

export default HeatmapChart
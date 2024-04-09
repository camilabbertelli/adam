import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/Dashboard.css";

import TabChart from "./TabChart";
import HeatmapChart from "./HeatmapChart";
import ImportantPeopleChart from "./ImportantPeopleChart";
import NetworkChart from './NetworkChart';
import { useState } from 'react';
import { DndContext, DragOverlay, useDraggable } from '@dnd-kit/core';

const DashboardPage = () => {

    let perspectives = ["Actions", "Body&Soul", "Emotions"]

    const [activeId, setActiveId] = useState(null);

    const [simpleFilter, setSimpleFilter] = useState(true)


    function Draggable(props) {
        const { attributes, listeners, setNodeRef } = useDraggable({
            id: props.id,
            data: {
                category: props.id
            }
        });


        return (
            <div ref={setNodeRef} {...listeners} {...attributes}>
                {props.children}
            </div>
        );
    }

    function handleDragStart(event) {
        setActiveId(event.active.id);
    }

    function handleDragEnd({active, over}) {
        if (over){

        }
        setActiveId(null);
    }
    return (<>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="dashboard-view">
                <div className="dashboard-filter-view">


                    <div class="inline-flex" role="group">
                        <button type="button" className={"shadow filter-button" + ((simpleFilter) ? " active" : "")} style={{ borderRadius: "20px 0px 0px 20px" }} onClick={() => setSimpleFilter(!simpleFilter)}>
                            Simple filter
                        </button>
                        <button type="button" className={"shadow filter-button" + ((!simpleFilter) ? " active" : "")} style={{ borderRadius: "0px 20px 20px 0px" }} onClick={() => setSimpleFilter(!simpleFilter)}>
                            Advanced filter
                        </button>
                    </div>

                    <br />
                    <h4>Categories</h4>

                    {perspectives.map((p) => (
                        <Draggable id={p}><button>{p}</button></Draggable>
                    ))}

                    <DragOverlay dropAnimation={{duration: 500}}>
                        {activeId ? (
                            <button>{activeId}</button>
                        ) : null}
                    </DragOverlay>

                </div>
                <div className="dashboard-graph-view">
                    <div className="dashboard-row1">
                        <div className="dashboard-viz1">
                            <HeatmapChart activeId={activeId}>Drop here</HeatmapChart>
                        </div>
                        <div className={"dashboard-viz2" + ((activeId) ? " drag-active" : "")}>
                            <ImportantPeopleChart />
                        </div>
                    </div>
                    <div className="dashboard-row2">
                        <div id="viz3" className={"dashboard-viz3" + ((activeId) ? " drag-active" : "")}>
                            <TabChart perspectives={perspectives}/>
                        </div>
                        <div className={"dashboard-viz4" + ((activeId) ? " drag-active" : "")}>
                            <NetworkChart />
                        </div>
                    </div>

                    {/* <div id="loader" className="loader"></div> */}
                </div>
            </div>
        </DndContext>
    </>)
}


export default DashboardPage;
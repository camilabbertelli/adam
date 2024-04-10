import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/Dashboard.css";

import x from "./../../assets/images/x.png"
import close from "./../../assets/images/close.png"

import TabChart from "./TabChart";
import HeatmapChart from "./HeatmapChart";
import ImportantPeopleChart from "./ImportantPeopleChart";
import NetworkChart from './NetworkChart';
import { useState } from 'react';
import { DndContext, DragOverlay, useDraggable } from '@dnd-kit/core';

const DashboardPage = () => {

    let categories = ["Actions", "Body&Soul", "Emotions"]

    const [activeCategories, setActiveCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null)
    const [simpleFilter, setSimpleFilter] = useState(true)


    function Draggable(props) {
        const { attributes, listeners, setNodeRef } = useDraggable({
            id: props.id,
            data: {
                category: props.id
            }
        });


        return (
            <div className="category-group" ref={setNodeRef} {...listeners} {...attributes}>
                {props.children}
            </div>
        );
    }

    function handleDragStart(event) {
        setActiveCategory(event.active.id);
    }

    function removeCategory(index){
        let aux = [...activeCategories]
        aux.splice(index, 1);
        setActiveCategories(aux)

    }

    return (<>

        <DndContext onDragStart={handleDragStart}>
            <div className="dashboard-view">
                <div className="dashboard-filter-view">


                    <div className="inline-flex" role="group">
                        <button type="button" className={"shadow filter-button" + ((simpleFilter) ? " active" : "")} style={{ borderRadius: "20px 0px 0px 20px" }} onClick={() => setSimpleFilter(!simpleFilter)}>
                            Simple filter
                        </button>
                        <button type="button" className={"shadow filter-button" + ((!simpleFilter) ? " active" : "")} style={{ borderRadius: "0px 20px 20px 0px" }} onClick={() => setSimpleFilter(!simpleFilter)}>
                            Advanced filter
                        </button>
                    </div>

                    <br />
                    <div style={{width: "95%", display:'flex', flexDirection:"column", justifyContent: "center"}}>
                        <h4>Categories</h4>
                        <center>
                        {categories.map((p) => (
                            <Draggable key={p} id={p}><button className='filter-category shadow'>{p}</button></Draggable>
                        ))}
                        </center>
                    </div>

                    <DragOverlay dropAnimation={{ duration: 500 }}>
                        {activeCategory ? (
                            <button className='filter-category shadow' key={activeCategory}>{activeCategory}</button>
                        ) : null}
                    </DragOverlay>

                </div>
                <div className="dashboard-graph-view">
                    <div className="dashboard-row1">
                        <div className="dashboard-viz1">
                            <HeatmapChart updateActiveCategory={setActiveCategory} updateActiveCategories={setActiveCategories} activeCategories={activeCategories} activeCategory={activeCategory}>
                                <div className={"category " + (activeCategories.length ? "" : "default")} key={activeCategories.length ? activeCategories[0] : "category1"}>
                                    {activeCategories.length ? activeCategories[0] : "Category"}
                                </div>
                                    {activeCategories.length > 0 && <img className="x" alt="x" src={x} width="20px" height="20px" onClick={() => removeCategory(0)} />}
                                <img alt="close" style={{margin: "0 50px"}} src={close} width="20px" height="20px" />
                                <div className={"category " + (activeCategories.length == 2 ? "" : "default")} key={activeCategories.length == 2 ? activeCategories[1] : "category2"}>
                                    {activeCategories.length == 2 ? activeCategories[1] : "Category"}
                                </div>
                                    {activeCategories.length == 2 && <img className="x" alt="x" src={x} width="20px" height="20px" onClick={() => removeCategory(1)}/>}
                            </HeatmapChart>
                        </div>
                        <div className={"dashboard-viz2" + ((activeCategory) ? " drag-active" : "")}>
                            <ImportantPeopleChart />
                        </div>
                    </div>
                    <div className="dashboard-row2">
                        <div id="viz3" className={"dashboard-viz3" + ((activeCategory) ? " drag-active" : "")}>
                            <TabChart perspectives={categories} />
                        </div>
                        <div className={"dashboard-viz4" + ((activeCategory) ? " drag-active" : "")}>
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
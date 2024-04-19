import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/Dashboard.css";

import x from "./../../assets/images/dashboard/x.png"
import close from "./../../assets/images/close.png"

import TabChart from "./TabChart";
import HeatmapChart from "./HeatmapChart";
import ImportantPeopleChart from "./ImportantPeopleChart";
import NetworkChart from './NetworkChart';
import { useEffect, useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';


import csv_data from "./../../assets/data.csv"
import * as d3 from "d3"

import FilterView from './FilterView';

const DashboardPage = () => {

    const { t } = useTranslation();

    let categories = [t("category-action"), t("category-body"), t("category-emotion")]

    const [data, setData] = useState([])
    //TODO: REMOVE THIS
    const [activeCategories, setActiveCategories] = useState([t("category-action"), t("category-body")]);
    const [activeCategory, setActiveCategory] = useState(null)

    function handleDragStart(event) {
        setActiveCategory(event.active.id);
    }

    function handleDragEnd({ active, delta }) {
        let droppableRect = document.getElementById("droppable").getBoundingClientRect()
        let draggableRect = document.getElementById(active.id).getBoundingClientRect()

        let activePoints = [{ x: draggableRect.x + delta.x, y: draggableRect.y + delta.y },
        { x: draggableRect.x + delta.x + draggableRect.width, y: draggableRect.y + delta.y },
        { x: draggableRect.x + delta.x, y: draggableRect.y + draggableRect.height + delta.y },
        { x: draggableRect.x + delta.x + draggableRect.width, y: draggableRect.y + draggableRect.height + delta.y }]

        activePoints.every((point) => {
            if ((point.x >= droppableRect.x) && (point.x <= droppableRect.x + droppableRect.width)
                && (point.y >= droppableRect.y) && (point.y <= droppableRect.y + droppableRect.height)) {

                if (activeCategories.length < 2 && !activeCategories.includes(activeCategory)) {
                    let aux = [...activeCategories]
                    aux.push(activeCategory)
                    setActiveCategories(aux);
                }
                return false;
            }
            return true;
        })

        setActiveCategory(null);
    }

    function removeCategory(index) {
        let aux = [...activeCategories]
        aux.splice(index, 1);
        setActiveCategories(aux)
    }
    
    useEffect(() => {
        d3.csv(csv_data).then(d => {
            setData(d)
        }, []);
    
    }, [])

    return (<>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="dashboard-view">
                <FilterView categories={categories} />
                <DragOverlay dropAnimation={{ duration: 500 }}>
                    {activeCategory ? (
                        <button className='dashboard-filter-category shadow' key={activeCategory}>{activeCategory}</button>
                    ) : null}
                </DragOverlay>
                <div className="dashboard-graph-view">
                    <div className="dashboard-row1">
                        <div className="dashboard-viz1">
                            {data.length > 0 && <HeatmapChart data={data} activeCategories={activeCategories} activeCategory={activeCategory}>
                                <div className={"heatmap-drag"} style={{minHeight: ((activeCategories.length !== 2) ? "90%" : "15%")}}>
                                    <div className={"category " + (activeCategories.length ? "" : "default ") + (activeCategories.length === 2 ? " shrink" : "")} key={activeCategories.length ? activeCategories[0] : "category1"}>
                                        {activeCategories.length ? activeCategories[0] : t("category-label")}
                                    </div>
                                    {activeCategories.length > 0 && <img title={t("icon-close")} className={"x " + (activeCategories.length === 2 ? " shrink" : "")} alt="x" src={x} width="20px" height="20px" onClick={() => removeCategory(0)} />}

                                    <img className={(activeCategories.length === 2 ? " shrink" : "")} alt="close" style={{ margin: "0 50px" }} src={close} width="20px" height="20px" />

                                    <div className={"category " + (activeCategories.length === 2 ? "" : "default ") + (activeCategories.length === 2 ? " shrink" : "")} key={activeCategories.length === 2 ? activeCategories[1] : "category2"}>
                                        {activeCategories.length === 2 ? activeCategories[1] : t("category-label")}
                                    </div>
                                    {activeCategories.length === 2 && <img title={t("icon-close")} className={"x " + (activeCategories.length === 2 ? " shrink" : "")} alt="x" src={x} width="20px" height="20px" onClick={() => removeCategory(1)} />}
                                </div>
                            </HeatmapChart>}
                        </div>
                        <div className={"dashboard-viz2" + ((activeCategory) ? " drag-active" : "")}>
                            <ImportantPeopleChart />
                        </div>
                    </div>
                    <div className="dashboard-row2">
                        <div id="viz3" className={"dashboard-viz3" + ((activeCategory) ? " drag-active" : "")}>
                            <TabChart categories={categories} data={data} />
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
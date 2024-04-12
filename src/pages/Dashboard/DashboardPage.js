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
import { useTranslation } from 'react-i18next';


import spine from "./../../assets/images/spine.png"
import codicesOriginal from "./../../assets/codices"


function noSpaces(str) {
    return (str.replace(".", '')).replace(/\s+/g, '')
}

const DashboardPage = () => {

    const { t } = useTranslation();

    let categories = [t("category-action"), t("category-body"), t("category-emotion")]

    const [activeCategories, setActiveCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null)
    const [simpleFilter, setSimpleFilter] = useState(true);

    const [intentionIndex, setIntentionIndex] = useState(0)
    const [originIndex, setOriginIndex] = useState(0)
    const [explanationIndex, setExplanationIndex] = useState(0)

    const intentions = ["All", "Sacred", "Profane"]
    const origins = ["All", "Literal", "Symbolic"]
    const explanations = ["All", "Miraculous", "Wonderful", "None"]

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

    const [genre, setGenre] = useState("")

    const changeSelect = function () {

        var selectBox = document.getElementById("genreSelect");

        if (!selectBox)
            return

        var selectedValue = selectBox.options[selectBox.selectedIndex].value;
        setGenre(selectedValue)

        for (const [key, c] of Object.entries(allCodices)) {
            if (c.genre === selectedValue) {
                changeCodex(key)
            }
        }
    }

    const equalsCheck = (a, b) => {
        return JSON.stringify(a) === JSON.stringify(b);
    }


    const changeCodex = function (id) {

        let sortedkeys = Object.keys(allCodices).sort()
        let aux = [...currentCodices]

        if (equalsCheck(sortedkeys, currentCodices.sort()))
            aux = [id]
        else {
            if (currentCodices.includes(id)) {
                if (currentCodices.length === 1) return
                aux.splice(aux.indexOf(id), 1);
            }
            else
                aux.push(id)
        }

        setCurrentCodices(aux)
    }

    let allCodicesAux = {}
    let allCodices = {}
    let allGenres = []
    for (const [key, value] of Object.entries(codicesOriginal)) {
        value.forEach(codex => {
            codex["century"] = key;
            allCodicesAux[noSpaces(codex.title)] = codex;
            allGenres.push(codex.genre);
        })
    }

    const Codices = ({ genre, codices }) => {
        let content = []

        for (const [key, c] of Object.entries(codices)) {
            if (!genre || genre === c.genre) {

                content.push(
                    <div id={key} key={c.title} className={`database-image-component ` + (currentCodices.includes(key) ? "codex-selected" : "")} onClick={() => changeCodex(key)}>
                        <img id={key} src={spine} className="database-card-img-top" alt="book" />
                        <div id={key} className='database-centered'>{c.title}</div>
                    </div>)
            }

        }

        return content
    }

    const SelectGenre = ({ genres }) => {
        let content = []
        genres.forEach((g) =>
            content.push(<option key={g} value={g}>{g}</option>)
        )

        return content
    }

    if (allGenres) allGenres.sort()

    let sortedkeys = Object.keys(allCodicesAux).sort()

    sortedkeys.forEach((key) => {
        allCodices[key] = allCodicesAux[key]
    })

    const [currentCodices, setCurrentCodices] = useState(sortedkeys)

    return (<>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="dashboard-view">
                <div className="dashboard-filter-view">


                    <div className="inline-flex" role="group">
                        <button type="button" className={"shadow filter-button" + ((simpleFilter) ? " active" : "")} style={{ borderRadius: "20px 0px 0px 20px" }} onClick={() => setSimpleFilter(!simpleFilter)}>
                            {t("simple-filter")}
                        </button>
                        <button type="button" className={"shadow filter-button" + ((!simpleFilter) ? " active" : "")} style={{ borderRadius: "0px 20px 20px 0px" }} onClick={() => setSimpleFilter(!simpleFilter)}>
                            {t("advanced-filter")}
                        </button>
                    </div>

                    <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "10px 0" }}>
                        <h5>{t("categories-label")}</h5>
                        <center>
                            {categories.map((p) => (
                                <Draggable key={p} id={p}><button className='filter-category shadow' id={p}>{p}</button></Draggable>
                            ))}
                        </center>
                    </div>

                    <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                        <h5>{t("intentions-label")}</h5>
                        <div className="inline-flex" role="group">
                            {intentions.map(function (intention, index) {
                                return (
                                    <button type="button" className={"shadow filter-options" + ((intentionIndex === index) ? " active" : "")} onClick={() => setIntentionIndex(index)}>
                                        {intention}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                        <h5>{t("origins-label")}</h5>
                        <div className="inline-flex" role="group">
                            {origins.map(function (origin, index) {
                                return (
                                    <button type="button" className={"shadow filter-options" + ((originIndex === index) ? " active" : "")} onClick={() => setOriginIndex(index)}>
                                        {origin}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                        <h5>{t("explanations-label")}</h5>
                        <div className="inline-flex" role="group">
                            {explanations.map(function (explanation, index) {
                                return (
                                    <button type="button" className={"shadow filter-options" + ((explanationIndex === index) ? " active" : "")} onClick={() => setExplanationIndex(index)}>
                                        {explanation}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                        <h5>{t("codices-label")}</h5>
                        <select id="genreSelect" className="database form-select" value={genre} onChange={changeSelect}>
                            <option value="">{t("library-genre-all")}</option>
                            <SelectGenre genres={allGenres} />
                        </select>
                        <div className="database-codices">
                            <Codices genre={genre} codices={allCodices} />
                        </div>
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
                                    {activeCategories.length ? activeCategories[0] : t("category-label")}
                                </div>
                                {activeCategories.length > 0 && <img className="x" alt="x" src={x} width="20px" height="20px" onClick={() => removeCategory(0)} />}

                                <img alt="close" style={{ margin: "0 50px" }} src={close} width="20px" height="20px" />

                                <div className={"category " + (activeCategories.length === 2 ? "" : "default")} key={activeCategories.length === 2 ? activeCategories[1] : "category2"}>
                                    {activeCategories.length === 2 ? activeCategories[1] : t("category-label")}
                                </div>
                                {activeCategories.length === 2 && <img className="x" alt="x" src={x} width="20px" height="20px" onClick={() => removeCategory(1)} />}
                            </HeatmapChart>
                        </div>
                        <div className={"dashboard-viz2" + ((activeCategory) ? " drag-active" : "")}>
                            <ImportantPeopleChart />
                        </div>
                    </div>
                    <div className="dashboard-row2">
                        <div id="viz3" className={"dashboard-viz3" + ((activeCategory) ? " drag-active" : "")}>
                            <TabChart categories={categories} />
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
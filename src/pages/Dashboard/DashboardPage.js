import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/Dashboard.css";

import { Drawer } from 'flowbite-react';

import x from "./../../assets/images/dashboard/x.png"
import close from "./../../assets/images/close.png"
import doubleArrow from "./../../assets/images/doubleArrow.png"

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
import Citations from './Citations';


function noSpaces(str) {
    if (str)
        str = str.replace(".", '')
    if (str)
        str = str.replace(/\s+/g, '')
    return str
}

const DashboardPage = () => {

    const {t} = useTranslation();
    const [csvIndexes, setCsvIndexes] = useState({})

    let categories = {
        "category-action": {
            name: t("category-action"),
            index: csvIndexes.action
        },
        "category-body": {
            name: t("category-body"),
            index: csvIndexes.anatomical_part
        },
        "category-emotion": {
            name: t("category-emotion"),
            index: csvIndexes.emotion
        }
    }

    let intention = {
        "intention-all": {
            name: t("intention-all"),
            csv_name: "",
            index: csvIndexes.intention
        },
        "intention-sacred": {
            name: t("intention-sacred"),
            csv_name: "Sagrado",
            index: csvIndexes.intention
        },
        "intention-profane": {
            name: t("intention-profane"),
            csv_name: "Profano",
            index: csvIndexes.intention
        }
    }

    let origin = {
        "origin-all": {
            name: t("intention-all"),
            csv_name: "",
            index: csvIndexes.origin
        },
        "origin-literal": {
            name: t("origin-literal"),
            csv_name: "Literal",
            index: csvIndexes.origin
        },
        "origin-symbolic": {
            name: t("origin-symbolic"),
            csv_name: "Simbólico",
            index: csvIndexes.origin
        }
    }

    let explanation = {
        "explanation-all": {
            name: t("explanation-all"),
            csv_name: "",
            index: csvIndexes.explanation
        },
        "explanation-miraculous": {
            name: t("explanation-miraculous"),
            csv_name: "Miraculoso",
            index: csvIndexes.explanation
        },
        "explanation-wonderful": {
            name: t("explanation-wonderful"),
            csv_name: "Maravilhoso",
            index: csvIndexes.explanation
        },
        "explanation-none": {
            name: t("explanation-none"),
            csv_name: "Não aplicável",
            index: csvIndexes.explanation
        }
    }

    let nature = {
        "nature-all": {
            name: t("nature-all"),
            csv_name: "",
            index: csvIndexes.nature
        },
        "nature-animal": {
            name: t("nature-animal"),
            csv_name: "Animal",
            index: csvIndexes.nature
        },
        "nature-human": {
            name: t("nature-human"),
            csv_name: "Humana",
            index: csvIndexes.nature
        },
        "nature-supernatural": {
            name: t("nature-supernatural"),
            csv_name: "Sobrenatural",
            index: csvIndexes.nature
        },
    }

    let dimension = {
        "dimension-all": {
            name: t("dimension-all"),
            csv_name: "",
            index: csvIndexes.dimension
        },
        "dimension-body": {
            name: t("dimension-body"),
            csv_name: "Corpo",
            index: csvIndexes.dimension
        },
        "dimension-soul": {
            name: t("dimension-soul"),
            csv_name: "Alma",
            index: csvIndexes.dimension
        },
        "dimension-transcendental": {
            name: t("dimension-transcendental"),
            csv_name: "Transcendental",
            index: csvIndexes.dimension
        },
    }

    const [globalData, setGlobalData] = useState([])
    const [originalGlobalData, setOriginalGlobalData] = useState([])

    const [activeFilters, setActiveFilters] = useState(
        {
            intention: Object.keys(intention)[0],
            origin: Object.keys(origin)[0],
            explanation: Object.keys(explanation)[0],

            nature: Object.keys(nature)[0],
            dimension: Object.keys(dimension)[0],
        })
    const [activeCategories, setActiveCategories] = useState([Object.keys(categories)[0], Object.keys(categories)[1]]);
    const [currentTabchartCategory, setCurrentTabchartCategory] = useState(Object.keys(categories)[0])
    const [activeCategory, setActiveCategory] = useState(null)
    const [activeCodices, setActiveCodices] = useState([])
    const [codices, setCodices] = useState({})
    const [genres, setGenres] = useState([])

    const [changedFilter, setChangedFilter] = useState(false)

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

                    aux.sort()

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
            let globalData = d3.flatRollup(d, v => v.length,
                d => d["#"],
                d => d.font_type,
                d => d.genre,
                d => d.title,
                d => d.description,
                d => d.subject_name,
                d => d.subject_number,
                d => d.subject_sex,
                d => d.subject_qualities,
                d => d.action,
                d => d.nature,
                d => d.dimension,
                d => d.anatomical_part,
                d => d.organs,
                d => d.intention,
                d => d.time,
                d => d.place,
                d => d.how,
                d => d.with_name,
                d => d.with_sex,
                d => d.with_qualities,
                d => d.about_name,
                d => d.about_sex,
                d => d.about_qualities,
                d => d.action_motive,
                d => d.object,
                d => d.origin,
                d => d.explanation,
                d => d.PP,
                d => d.observation)

            setOriginalGlobalData([...globalData])
            setGlobalData([...globalData])

            let keys = Object.keys(d[0])
            let indexes = {}
            keys.forEach((key, index) => {
                indexes[key] = index
            })

            setCsvIndexes(indexes)

            let codicesGenres = d3.flatGroup(globalData, d => d[indexes.genre], d => d[indexes.title]).map(entry => [entry[0], entry[1]])

            let allCodicesAux = {}
            codicesGenres.forEach(entry => {
                allCodicesAux[noSpaces(entry[1])] = {
                    title: entry[1],
                    genre: entry[0]
                }
            })

            let sortedkeys = Object.keys(allCodicesAux).sort()
            let allCodices = {}
            sortedkeys.forEach((key) => {
                allCodices[key] = allCodicesAux[key]
            })

            setCodices({ ...allCodices })
            setActiveCodices([...sortedkeys])
            setGenres([...new Set(codicesGenres.map((entry) => entry[0]))].sort())

        }, []);

        document.getElementById("overlay").style.display = "none";
    }, [])

    const [isHeatmapExpanded, setIsHeatmapExpanded] = useState(false)
    const [isTabchartExpanded, setIsTabchartExpanded] = useState(false)
    const [isImpPeopleExpanded, setIsImpPeopleExpanded] = useState(false)
    const [isNetworkExpanded, setIsNetworkExpanded] = useState(false)

    window.addEventListener('click', function (e) {
        if (document.getElementById('overlay') && document.getElementById('overlay').contains(e.target)) {
            document.getElementById("overlay").style.display = "none";
            setIsHeatmapExpanded(false)
            setIsTabchartExpanded(false)
            setIsImpPeopleExpanded(false)
            setIsNetworkExpanded(false)
        }
    });

    function setFilters(newFilters, types, codicesFilter) {
        let filtered = originalGlobalData.filter((d) => {
            if (codicesFilter) {
                if (!codicesFilter.includes(noSpaces(d[csvIndexes.title])))
                    return false;
            }
            else if (!activeCodices.includes(noSpaces(d[csvIndexes.title])))
                return false;

            for (const [key, value] of Object.entries(activeFilters)) {
                let filter = (types.includes(key)) ? newFilters[types.indexOf(key)] : value

                if (filter !== Object.keys(eval(key))[0] && d[eval(key)[filter].index] !== eval(key)[filter].csv_name)
                    return false;
            }

            return true;

        });

        let filters = { ...activeFilters }
        types.forEach((type, index) => {
            filters[type] = newFilters[index]
        });

        setGlobalData(filtered)
        setActiveFilters(filters)
        if (codicesFilter)
            setActiveCodices(codicesFilter)
        setChangedFilter(true)
    }

    const [isOpen, setIsOpen] = useState(false);
    const handleClose = () => setIsOpen(false);

    return (<>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="dashboard-view">
                <div id="overlay">
                </div>
                <FilterView categories={categories}
                    intention={intention}
                    origin={origin}
                    explanation={explanation}
                    nature={nature}
                    dimension={dimension}
                    codices={codices}
                    genres={genres}
                    activeFilters={activeFilters} setActiveFilters={setFilters} />
                <DragOverlay dropAnimation={{ duration: 500 }}>
                    {activeCategory ? (
                        <button className='dashboard-filter-category-drag shadow' style={{ border: "10px" }} key={activeCategory}>{categories[activeCategory].name}</button>
                    ) : null}
                </DragOverlay>

                <div className="dashboard-graph-view">
                    <div className="dashboard-row1">
                        <div className="dashboard-viz1">
                            <HeatmapChart data={globalData}
                                activeCategories={activeCategories}
                                activeCategory={activeCategory}
                                categories={categories}
                                isExpanded={isHeatmapExpanded}
                                setIsExpanded={setIsHeatmapExpanded}
                                changedFilter={changedFilter}
                                setChangedFilter={setChangedFilter}>
                                <div className={"heatmap-drag"} style={{ minHeight: "15%", top: ((activeCategories.length !== 2) ? "40%" : "0%"), left: ((activeCategories.length !== 2) ? "7%" : "0%") }}>
                                    <div className={"category " + (activeCategories.length ? "" : "default ") + (activeCategories.length === 2 ? " shrink" : "")} key={activeCategories.length ? activeCategories[0] : "category1"}>
                                        {activeCategories.length ? categories[activeCategories[0]].name : t("category-label")}
                                    </div>
                                    {activeCategories.length > 0 && <img title={t("icon-close")} className={"x " + (activeCategories.length === 2 ? " shrink" : "")} alt="x" src={x} width="20px" height="20px" onClick={() => removeCategory(0)} />}

                                    <img className={(activeCategories.length === 2 ? " shrink" : "")} alt="close" style={{ margin: "0 50px" }} src={close} width="20px" height="20px" />

                                    <div className={"category " + (activeCategories.length === 2 ? "" : "default ") + (activeCategories.length === 2 ? " shrink" : "")} key={activeCategories.length === 2 ? activeCategories[1] : "category2"}>
                                        {activeCategories.length === 2 ? categories[activeCategories[1]].name : t("category-label")}
                                    </div>
                                    {activeCategories.length === 2 && <img title={t("icon-close")} className={"x " + (activeCategories.length === 2 ? " shrink" : "")} alt="x" src={x} width="20px" height="20px" onClick={() => removeCategory(1)} />}
                                </div>
                            </HeatmapChart>
                        </div>
                        <div className={"dashboard-viz2" + ((activeCategory !== null && activeCategories.length !== 2) ? " drag-active" : "")}>
                            <ImportantPeopleChart 
                            data={globalData}
                            csvIndexes={csvIndexes}
                            isExpanded={isImpPeopleExpanded}
                            setIsExpanded={setIsImpPeopleExpanded}/>
                        </div>
                    </div>
                    <div className="dashboard-row2">
                        <div id="viz3" className={"dashboard-viz3" + ((activeCategory !== null && activeCategories.length !== 2) ? " drag-active" : "")}>
                            <TabChart categories={categories}
                                data={globalData}
                                csvIndexes={csvIndexes}
                                setCurrentTabchartCategory={setCurrentTabchartCategory}
                                isExpanded={isTabchartExpanded}
                                setIsExpanded={setIsTabchartExpanded}
                                changedFilter={changedFilter}
                                setChangedFilter={setChangedFilter} />
                        </div>
                        <div className={"dashboard-viz4" + ((activeCategory !== null && activeCategories.length !== 2) ? " drag-active" : "")}>
                            <NetworkChart />
                        </div>

                    </div>
                    <div className='dashboard-row3'>

                        <button className="citations-btn" type='button' onClick={() => setIsOpen(!isOpen)}>
                            <img alt="up-arrow" width="20px" height="20px" style={{ transform: "rotate(180deg)" }} src={doubleArrow} />
                            {t("citations-label")}
                        </button>

                        <Drawer backdrop={false} open={isOpen} onClose={handleClose}
                            className='citations-drawer shadow' position='bottom'>
                            <button className="citations-btn" type='button' onClick={() => setIsOpen(false)}>
                                <img alt="up-arrow" width="20px" height="20px" src={doubleArrow} />
                                {t("citations-label")}
                            </button>
                            <Citations
                                data={globalData}
                                categories={categories}
                                activeCategories={activeCategories}
                                currentTabchartCategory={currentTabchartCategory}
                                csvIndexes={csvIndexes} />
                        </Drawer>
                    </div>
                </div>
            </div>
        </DndContext>
    </>)
}


export default DashboardPage;
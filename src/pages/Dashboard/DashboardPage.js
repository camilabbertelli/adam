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
import { DndContext, DragOverlay, KeyboardSensor, MouseSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';


import csv_data from "./../../assets/data.csv"
import * as d3 from "d3"

import FilterView from './FilterView';
import Citations from './Citations';


function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

let colorCodices = () => { }

const DashboardPage = () => {

    const { t } = useTranslation();
    const [csvIndexes, setCsvIndexes] = useState({})

    const [categories, setCategories] = useState({})

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

    const [activeFilters, setActiveFilters] = useState({
        intention: Object.keys(intention)[0],
        origin: Object.keys(origin)[0],
        explanation: Object.keys(explanation)[0],

        nature: Object.keys(nature)[0],
        dimension: Object.keys(dimension)[0],
    })

    const [advancedCategoryFilters, setAdvancedCategoryFilters] = useState({})
    const [activeCategories, setActiveCategories] = useState([]);
    const [currentTabchartCategory, setCurrentTabchartCategory] = useState("")

    const [activeCategory, setActiveCategory] = useState(null)
    const [activeCodices, setActiveCodices] = useState([])
    const [codices, setCodices] = useState({})
    const [genres, setGenres] = useState([])

    const [changedFilter, setChangedFilter] = useState(false)

    function handleDragStart(event) {
        setActiveCategory(event.active.id);

        if (activeCategories.length === 2){
            d3.selectAll(".category").transition().duration(500)
                    .style("background-color", "#bfa3a3")

            setTimeout(() => {
                d3.selectAll(".category").transition().duration(500)
                    .style("background-color", "#d3c5b8")

                    
            }, 1000);
        }
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

            let categoriesAux = {
                "category-action": {
                    index: indexes.action,
                    indexSubcategory: indexes.action,
                    list: []
                },
                "category-action-motives": {
                    index: indexes.action_motive,
                    indexSubcategory: indexes.action_motive,
                    list: []
                },
                "category-body": {
                    index: indexes.anatomical_part,
                    indexSubcategory: indexes.organs,
                    list: []
                }
            }

            let advancedFilterAux = {}
            Object.keys(categoriesAux).forEach(key => {
                categoriesAux[key].list = d3.flatGroup(globalData, d => d[[categoriesAux[key].index]], d => d[[categoriesAux[key].indexSubcategory]])
                    .flatMap(d => [[d[0], d[1]]]).sort()
                categoriesAux[key].list = d3.flatGroup(categoriesAux[key].list, d => d[0])

                advancedFilterAux[key] = {
                    list: [],
                    sublist: []
                }
            })


            setAdvancedCategoryFilters(advancedFilterAux)
            setCategories(categoriesAux)
            setActiveCategories([Object.keys(categoriesAux)[0], Object.keys(categoriesAux)[1]])
            setCurrentTabchartCategory(Object.keys(categoriesAux)[0])

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

            colorCodices = d3.scaleOrdinal(Object.keys(allCodices), ["#cc8b86", "#9FB9BA", "#C5C5B3", "#B89283", "#FFD18C", "#7587AA"]);
            setCodices({ ...allCodices })
            setActiveCodices([...sortedkeys])
            setGenres([...new Set(codicesGenres.map((entry) => entry[0]))].sort())

        }, []).catch((error) => {
            console.error('Error fetching data:', error);
            // Display a user-friendly error message
            alert('An error occurred while fetching data.');
        });

        document.getElementById("overlay").style.display = "none";
    }, [])

    const [isHeatmapExpanded, setIsHeatmapExpanded] = useState(false)
    const [isTabchartExpanded, setIsTabchartExpanded] = useState(false)
    const [isImpPeopleExpanded, setIsImpPeopleExpanded] = useState(false)
    const [isNetworkExpanded, setIsNetworkExpanded] = useState(false)

    const [networkData, setNetworkData] = useState({ selected: [], people: [] })
    const [pyramidData, setPyramidData] = useState({ sex: "", category: "", categoryIndex: "" })
    const [heatmapData, setHeatmapData] = useState([])

    window.addEventListener('click', function (e) {
        if (document.getElementById('overlay') && document.getElementById('overlay').contains(e.target)) {
            document.getElementById("overlay").style.display = "none";
            setIsHeatmapExpanded(false)
            setIsTabchartExpanded(false)
            setIsImpPeopleExpanded(false)
            setIsNetworkExpanded(false)
        }
    });

    const [resetComponents, setResetComponents] = useState(false)

    function setFilters(newFilters, types, codicesFilter, advFilters) {

        let filtered = originalGlobalData.filter((d) => {
            if (codicesFilter && codicesFilter.length) {
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


            let passAdvanced = true

            for (const [key, value] of Object.entries(advFilters ? advFilters : advancedCategoryFilters)) {
                let passIntern = false
                let indexList = categories[key].index
                let indexSublist = categories[key].indexSubcategory

                if (value.list.length)
                    if (value.list.includes(noSpaces(d[indexList])))
                        passIntern = true

                if (value.sublist.length)
                    if (value.sublist.includes(noSpaces(d[indexSublist])))
                        passIntern = true

                if (value.list.length === 0 && value.sublist.length === 0)
                    passIntern = true

                passAdvanced = passAdvanced && passIntern
            }

            return passAdvanced;

        });

        let filters = { ...activeFilters }
        types.forEach((type, index) => {
            filters[type] = newFilters[index]
        });

        setGlobalData(filtered)
        setActiveFilters(filters)
        if (advFilters)
            setAdvancedCategoryFilters(advFilters)
        if (codicesFilter && codicesFilter.length)
            setActiveCodices(codicesFilter)
        setChangedFilter(true)
    }


    function resetFilters() {

        let advancedFilterAux = {...advancedCategoryFilters}
        Object.keys(advancedCategoryFilters).forEach(key => {
            advancedFilterAux[key] = {
                list: [],
                sublist: []
            }
        })

        setFilters(
            [Object.keys(intention)[0],
                    Object.keys(origin)[0],
                    Object.keys(explanation)[0],
                    Object.keys(nature)[0],
                    Object.keys(dimension)[0]
            ],
            ["intention", "origin", "explanation", "nature", "dimension"],
        Object.keys(codices).sort(), 
        advancedFilterAux)

        setPyramidData({ sex: "", category: "", categoryIndex: "" })
        setHeatmapData([])
        setNetworkData({ selected: [], people: [] })

        setResetComponents(true)
    }

    const [isOpen, setIsOpen] = useState(false);
    const handleClose = () => setIsOpen(false);

    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8
        }
    })
    const mouseSensor = useSensor(MouseSensor)
    const touchSensor = useSensor(TouchSensor)
    const keyboardSensor = useSensor(KeyboardSensor)

    const sensors = useSensors(
        mouseSensor,
        touchSensor,
        keyboardSensor,
        pointerSensor
    )

    return (<>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
            <div className="dashboard-view">
                <div id="overlay">
                </div>
                <FilterView
                    categories={categories} activeCategories={activeCategories}
                    intention={intention}
                    origin={origin}
                    explanation={explanation}
                    nature={nature}
                    dimension={dimension}
                    codices={codices}
                    colorCodices={colorCodices}
                    genres={genres}
                    activeFilters={activeFilters} setActiveFilters={setFilters} advancedCategoryFilters={advancedCategoryFilters} resetFilters={resetFilters} />
                <DragOverlay dropAnimation={{ duration: 500 }}>
                    {activeCategory ? (
                        <button className={`shadow dashboard-filter-category ${(activeCategories.includes(activeCategory) ? "selected" : "")} drag`} style={{ border: "10px" }} key={activeCategory}>{t(activeCategory)}</button>
                    ) : null}
                </DragOverlay>

                <div className="dashboard-graph-view">
                    <div className="dashboard-row1">
                        <div className="dashboard-viz1">
                            <HeatmapChart data={globalData} resetComponents={resetComponents} setResetComponents={setResetComponents}
                                setHeatmapData={setHeatmapData} networkData={networkData} pyramidData={pyramidData}
                                csvIndexes={csvIndexes}
                                activeCategories={activeCategories}
                                activeCategory={activeCategory}
                                categories={categories}
                                isExpanded={isHeatmapExpanded}
                                setIsExpanded={setIsHeatmapExpanded}
                                changedFilter={changedFilter}
                                setChangedFilter={setChangedFilter}>
                                <div className={"heatmap-drag"} >
                                    <div className={"category " + (activeCategories.length ? "shadow" : "default ") + (activeCategories.length === 2 ? " shrink" : "")} key={activeCategories.length ? activeCategories[0] : "category1"} onClick={() => removeCategory(0)}>
                                        {activeCategories.length ? t(activeCategories[0]) : t("category-label")}
                                    </div>
                                    {activeCategories.length > 0 && <img title={t("icon-close")} className={"x " + (activeCategories.length === 2 ? " shrink" : "big")} alt="x" src={x} width="20px" height="20px" onClick={() => removeCategory(0)} />}

                                    <img className={(activeCategories.length === 2 ? " shrink" : "")} alt="close" style={{ margin: "0 50px" }} src={close} width="20px" height="20px" />

                                    <div className={"category " + (activeCategories.length === 2 ? "shadow" : "default ") + (activeCategories.length === 2 ? " shrink" : "")} key={activeCategories.length === 2 ? activeCategories[1] : "category2"} onClick={() => removeCategory(1)}>
                                        {activeCategories.length === 2 ? t(activeCategories[1]) : t("category-label")}
                                    </div>
                                    {activeCategories.length === 2 && <img title={t("icon-close")} className={"x " + (activeCategories.length === 2 ? " shrink" : "big")} alt="x" src={x} width="20px" height="20px" onClick={() => removeCategory(1)} />}
                                </div>
                            </HeatmapChart>
                        </div>
                        <div className={"dashboard-viz2" + ((activeCategory !== null) ? " drag-active" : "")}>
                            <ImportantPeopleChart
                                data={globalData} resetComponents={resetComponents} setResetComponents={setResetComponents}
                                networkData={networkData} pyramidData={pyramidData} heatmapData={heatmapData}
                                csvIndexes={csvIndexes}
                                isExpanded={isImpPeopleExpanded}
                                setIsExpanded={setIsImpPeopleExpanded} />
                        </div>
                    </div>
                    <div className="dashboard-row2">
                        <div id="viz3" className={"dashboard-viz3" + ((activeCategory !== null) ? " drag-active" : "")}>
                            <TabChart categories={categories}
                                data={globalData} resetComponents={resetComponents} setResetComponents={setResetComponents}
                                setPyramidData={setPyramidData} networkData={networkData} heatmapData={heatmapData}
                                csvIndexes={csvIndexes}
                                setCurrentTabchartCategory={setCurrentTabchartCategory}
                                isExpanded={isTabchartExpanded} setIsExpanded={setIsTabchartExpanded}
                                changedFilter={changedFilter} setChangedFilter={setChangedFilter} />
                        </div>
                        <div className={"dashboard-viz4" + ((activeCategory !== null) ? " drag-active" : "")}>
                            <NetworkChart
                                data={globalData} resetComponents={resetComponents} setResetComponents={setResetComponents}
                                setNetworkData={setNetworkData} pyramidData={pyramidData} heatmapData={heatmapData}
                                colorCodices={colorCodices}
                                csvIndexes={csvIndexes}
                                isExpanded={isNetworkExpanded}
                                setIsExpanded={setIsNetworkExpanded} />
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
                                networkData={networkData} pyramidData={pyramidData} heatmapData={heatmapData}
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
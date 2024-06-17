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


import * as d3 from "d3"

import FilterView from './FilterView';
import Citations from './Citations';


function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

let colorCodices = () => { }

const DashboardPage = (props) => {

    const { t } = useTranslation();

    const [categories, setCategories] = useState({})

    let intention = {
        "intention-all": {
            csv_name: "",
            index: props.csvIndexes.intention
        },
        "intention-sacred": {
            csv_name: "Sagrado",
            index: props.csvIndexes.intention
        },
        "intention-profane": {
            csv_name: "Profano",
            index: props.csvIndexes.intention
        }
    }

    let agent = {
        "agent-all": {
            csv_name: "",
            index: props.csvIndexes.agent
        },
        "agent-active": {
            csv_name: "Ativo",
            index: props.csvIndexes.agent
        },
        "agent-passive": {
            csv_name: "Passivo",
            index: props.csvIndexes.agent
        }
    }

    let value = {
        "value-all": {
            csv_name: "",
            index: props.csvIndexes.value
        },
        "value-literal": {
            csv_name: "Literal",
            index: props.csvIndexes.value
        },
        "value-symbolic": {
            csv_name: "Simbólico",
            index: props.csvIndexes.value
        }
    }

    let supernatural_type = {
        "supernatural_type-all": {
            csv_name: "",
            index: props.csvIndexes.supernatural_type
        },
        "supernatural_type-miraculous": {
            csv_name: "Miraculoso",
            index: props.csvIndexes.supernatural_type
        },
        "supernatural_type-wonderful": {
            csv_name: "Maravilhoso",
            index: props.csvIndexes.supernatural_type
        },
        "supernatural_type-none": {
            csv_name: "Não aplicável",
            index: props.csvIndexes.supernatural_type
        }
    }

    let nature = {
        "nature-all": {
            csv_name: "",
            index: props.csvIndexes.nature
        },
        "nature-animal": {
            csv_name: "Animal",
            index: props.csvIndexes.nature
        },
        "nature-human": {
            csv_name: "Humana",
            index: props.csvIndexes.nature
        },
        "nature-supernatural": {
            csv_name: "Sobrenatural",
            index: props.csvIndexes.nature
        },
    }

    let dimension = {
        "dimension-all": {
            csv_name: "",
            index: props.csvIndexes.dimension
        },
        "dimension-body": {
            csv_name: "Corpo",
            index: props.csvIndexes.dimension
        },
        "dimension-soul": {
            csv_name: "Alma",
            index: props.csvIndexes.dimension
        },
        "dimension-transcendental": { 
            csv_name: "Transcendental",
            index: props.csvIndexes.dimension
        },
    }

    const [globalData, setGlobalData] = useState([])
    const [originalGlobalData, setOriginalGlobalData] = useState([])


    const [activeCategory, setActiveCategory] = useState(null)

    const [activeFilters, setActiveFilters] = useState({})
    const [advancedCategoryFilters, setAdvancedCategoryFilters] = useState({})
    const [activeCategories, setActiveCategories] = useState([]);
    const [currentTabchartCategory, setCurrentTabchartCategory] = useState("")
    const [activeCodices, setActiveCodices] = useState([])
    const [networkData, setNetworkData] = useState({ selected: [], people: [] })
    const [pyramidData, setPyramidData] = useState({ sex: "", category: "", categoryIndex: "" })
    const [heatmapData, setHeatmapData] = useState([])

    const [networkLink, setNetworkLink] = useState(null)

    const [codices, setCodices] = useState({})
    const [genres, setGenres] = useState([])

    const [changedFilter, setChangedFilter] = useState(false)

    function handleDragStart(event) {
        setActiveCategory(event.active.id);

        if (activeCategories.length === 2) {
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
                    props.updateDashboard("activeCategories", aux)
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
        props.updateDashboard("activeCategories", aux)
    }

    useEffect(() => {

        let data = d3.flatRollup(props.data, v => v.length,
            d => d[props.csvNames.index],
            d => d[props.csvNames.material_type],
            d => d[props.csvNames.genre],
            d => d[props.csvNames.title],
            d => d[props.csvNames.description],
            d => d[props.csvNames.subject_name],
            d => d[props.csvNames.agent],
            d => d[props.csvNames.subject_number],
            d => d[props.csvNames.subject_sex],
            d => d[props.csvNames.nature],
            d => d[props.csvNames.dimension],
            d => d[props.csvNames.anatomical_part],
            d => d[props.csvNames.organs],
            d => d[props.csvNames.subject_qualities],
            d => d[props.csvNames.action],
            d => d[props.csvNames.causes_group],
            d => d[props.csvNames.causes],
            d => d[props.csvNames.latitude],
            d => d[props.csvNames.longitude],
            d => d[props.csvNames.time],
            d => d[props.csvNames.place],
            d => d[props.csvNames.how],
            d => d[props.csvNames.intention],
            d => d[props.csvNames.with_name],
            d => d[props.csvNames.with_sex],
            d => d[props.csvNames.with_qualities],
            d => d[props.csvNames.about_name],
            d => d[props.csvNames.about_sex],
            d => d[props.csvNames.about_qualities],
            d => d[props.csvNames.object],
            d => d[props.csvNames.value],
            d => d[props.csvNames.supernatural_type],
            d => d[props.csvNames.pp])

        setOriginalGlobalData([...data])
        setGlobalData([...data])

        let categoriesAux = {
            "category-action": {
                index: props.csvIndexes.action,
                indexSubcategory: props.csvIndexes.action,
                list: []
            },
            "category-action-motives": {
                index: props.csvIndexes.causes_group,
                indexSubcategory: props.csvIndexes.causes,
                list: []
            },
            "category-body": {
                index: props.csvIndexes.anatomical_part,
                indexSubcategory: props.csvIndexes.organs,
                list: []
            }
        }

        let advancedFilterAux = {}
        Object.keys(categoriesAux).forEach(key => {
            categoriesAux[key].list = d3.flatGroup(data, d => d[[categoriesAux[key].index]], d => d[[categoriesAux[key].indexSubcategory]])
                .flatMap(d => [[d[0], d[1]]]).sort()
            categoriesAux[key].list = d3.flatGroup(categoriesAux[key].list, d => d[0])

            advancedFilterAux[key] = {
                list: [],
                sublist: []
            }
        })


        let codicesGenres = d3.flatGroup(data, d => d[props.csvIndexes.genre], d => d[props.csvIndexes.title]).map(entry => [entry[0], entry[1]])

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

        colorCodices = d3.scaleOrdinal(Object.keys(allCodices), ["#C0A0CB", "#A3BA9F", "#C5C5B3", "#B89283", "#FEE0B2", "#A9BFC8"]);

        setActiveCategories([Object.keys(categoriesAux)[0], Object.keys(categoriesAux)[1]])
        setCurrentTabchartCategory(Object.keys(categoriesAux)[0])
        setActiveCodices([...sortedkeys])
        setActiveFilters({
            intention: Object.keys(intention)[0],
            agent: Object.keys(agent)[0],
            value: Object.keys(value)[0],
            supernatural_type: Object.keys(supernatural_type)[0],

            nature: Object.keys(nature)[0],
            dimension: Object.keys(dimension)[0],
        })
        setAdvancedCategoryFilters(advancedFilterAux)

        props.updateDashboard("activeCategories", [Object.keys(categoriesAux)[0], Object.keys(categoriesAux)[1]])
        props.updateDashboard("currentTabchartCategory", Object.keys(categoriesAux)[0])
        props.updateDashboard("activeCodices", [...sortedkeys])
        props.updateDashboard("activeFilters", {
            intention: Object.keys(intention)[0],
            agent: Object.keys(agent)[0],
            value: Object.keys(value)[0],
            supernatural_type: Object.keys(supernatural_type)[0],

            nature: Object.keys(nature)[0],
            dimension: Object.keys(dimension)[0],
        })
        props.updateDashboard("advancedCategoryFilters", advancedFilterAux)

        props.updateDashboard("pyramidData", { sex: "", category: "", categoryIndex: "" })
        props.updateDashboard("heatmapData", [])
        props.updateDashboard("networkData", { selected: [], people: [] })

        setCategories(categoriesAux)
        setCodices({ ...allCodices })
        setGenres([...new Set(codicesGenres.map((entry) => entry[0]))].sort())

        document.getElementById("overlay").style.display = "none";
    }, [props.data])

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

    const [resetComponents, setResetComponents] = useState(false)

    function setFilters(newFilters, types, codicesFilter, advFilters) {

        let filtered = originalGlobalData.filter((d) => {
            if (codicesFilter && codicesFilter.length) {
                if (!codicesFilter.includes(noSpaces(d[props.csvIndexes.title])))
                    return false;
            }
            else if (!activeCodices.includes(noSpaces(d[props.csvIndexes.title])))
                return false;

            for (const [key, v] of Object.entries(activeFilters)) {
                let filter = (types.includes(key)) ? newFilters[types.indexOf(key)] : v
                if (filter !== Object.keys(eval(key))[0] && d[eval(key)[filter].index] !== eval(key)[filter].csv_name)
                    return false;
            }


            let passAdvanced = true

            for (const [key, v] of Object.entries(advFilters ? advFilters : advancedCategoryFilters)) {
                let passIntern = false
                let indexList = categories[key].index
                let indexSublist = categories[key].indexSubcategory

                if (v.list.length)
                    if (v.list.includes(noSpaces(d[indexList])))
                        passIntern = true

                if (v.sublist.length)
                    if (v.sublist.includes(noSpaces(d[indexSublist])))
                        passIntern = true

                if (v.list.length === 0 && v.sublist.length === 0)
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
        props.updateDashboard("activeFilters", filters)
        if (advFilters) {
            setAdvancedCategoryFilters(advFilters)
            props.updateDashboard("advancedCategoryFilters", advFilters)
        }
        if (codicesFilter && codicesFilter.length) {
            setActiveCodices(codicesFilter)
            props.updateDashboard("activeCodices", codicesFilter)
        }
        setChangedFilter(true)
    }


    function resetFilters() {

        let advancedFilterAux = { ...advancedCategoryFilters }
        Object.keys(advancedCategoryFilters).forEach(key => {
            advancedFilterAux[key] = {
                list: [],
                sublist: []
            }
        })

        setFilters(
            [Object.keys(intention)[0],
            Object.keys(agent)[0],
            Object.keys(value)[0],
            Object.keys(supernatural_type)[0],
            Object.keys(nature)[0],
            Object.keys(dimension)[0]
            ],
            ["intention", "agent", "value", "supernatural_type", "nature", "dimension"],
            Object.keys(codices).sort(),
            advancedFilterAux)

        setPyramidData({ sex: "", category: "", categoryIndex: "" })
        setHeatmapData([])
        setNetworkData({ selected: [], people: [] })

        props.updateDashboard("pyramidData", { sex: "", category: "", categoryIndex: "" })
        props.updateDashboard("heatmapData", [])
        props.updateDashboard("networkData", { selected: [], people: [] })

        setResetComponents(true)
    }

    function updatePyramidData(d) {
        setPyramidData(d)
        props.updateDashboard("pyramidData", d)
    }

    function updateHeatmapData(d) {
        setHeatmapData(d)
        props.updateDashboard("heatmapData", d)
    }

    function updateNetworkData(d) {
        setNetworkData(d)
        props.updateDashboard("networkData", d)
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

    function highlightDefaultCategory(proceed){
        if (proceed){
            d3.selectAll(".heatmap-drag").selectAll(".default").style("background-color", "#D8BABA")
            d3.select(".category-buttons-group").style("border", "2px dashed #8C5E5E")
        }
        
        setTimeout(() => {
            d3.selectAll(".heatmap-drag").selectAll(".default").style("background-color", "white")
            d3.select(".category-buttons-group").style("border", "2px solid transparent")
        }, 2000);
    }

    function dismissDefaultCategory() {
        d3.selectAll(".heatmap-drag").selectAll(".default").style("background-color", "white")
        d3.select(".category-buttons-group").style("border", "2px solid transparent")
    }

    return (<>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
            <div className="dashboard-view">
                <div id="overlay">
                </div>
                <FilterView
                    categories={categories} activeCategories={activeCategories}
                    intention={intention}
                    agent={agent}
                    value={value}
                    supernatural_type={supernatural_type}
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
                                setHeatmapData={updateHeatmapData} networkData={networkData} pyramidData={pyramidData}
                                csvIndexes={props.csvIndexes}
                                activeCategories={activeCategories}
                                activeCategory={activeCategory}
                                categories={categories}
                                isExpanded={isHeatmapExpanded}
                                setIsExpanded={setIsHeatmapExpanded}
                                changedFilter={changedFilter}
                                setChangedFilter={setChangedFilter}>
                                <div className={"heatmap-drag"} >
                                    <div className={"category " + (activeCategories.length ? "shadow" : "default ") + (activeCategories.length === 2 ? " shrink" : "")}
                                        key={activeCategories.length ? activeCategories[0] : "category1"}
                                        onClick={() => removeCategory(0)}
                                        onMouseOver={() => highlightDefaultCategory(activeCategories.length ? false : true)} onMouseLeave={dismissDefaultCategory}>
                                        {activeCategories.length ? t(activeCategories[0]) : t("category-label")}
                                    </div>
                                    {activeCategories.length > 0 && <img title={t("icon-close")} className={"x " + (activeCategories.length === 2 ? " shrink" : "big")}
                                        alt="x" src={x} width="20px" height="20px"
                                        onClick={() => removeCategory(0)} />}

                                    <img className={(activeCategories.length === 2 ? " shrink" : "")}
                                        alt="close" style={{ margin: "0 50px" }} src={close} width="20px" height="20px" />

                                    <div className={"category " + (activeCategories.length === 2 ? "shadow" : "default ") + (activeCategories.length === 2 ? " shrink" : "")}
                                        key={activeCategories.length === 2 ? activeCategories[1] : "category2"}
                                        onClick={() => removeCategory(1)}
                                        onMouseOver={() => highlightDefaultCategory(activeCategories.length === 2 ? false : true)} onMouseLeave={dismissDefaultCategory}>
                                        {activeCategories.length === 2 ? t(activeCategories[1]) : t("category-label")}
                                    </div>
                                    {activeCategories.length === 2 && <img title={t("icon-close")} className={"x " + (activeCategories.length === 2 ? " shrink" : "big")}
                                        alt="x" src={x} width="20px" height="20px"
                                        onClick={() => removeCategory(1)} />}
                                </div>
                            </HeatmapChart>
                        </div>
                        <div className={"dashboard-viz2" + ((activeCategory !== null) ? " drag-active" : "")}>
                            <ImportantPeopleChart
                                data={globalData} resetComponents={resetComponents} setResetComponents={setResetComponents}
                                networkData={networkData} pyramidData={pyramidData} heatmapData={heatmapData}
                                csvIndexes={props.csvIndexes} csvNames={props.csvNames}
                                isExpanded={isImpPeopleExpanded}
                                setIsExpanded={setIsImpPeopleExpanded} />
                        </div>
                    </div>
                    <div className="dashboard-row2">
                        <div id="viz3" className={"dashboard-viz3" + ((activeCategory !== null) ? " drag-active" : "")}>
                            <TabChart categories={categories}
                                data={globalData} resetComponents={resetComponents} setResetComponents={setResetComponents}
                                setPyramidData={updatePyramidData} networkData={networkData} heatmapData={heatmapData}
                                csvIndexes={props.csvIndexes}
                                setCurrentTabchartCategory={setCurrentTabchartCategory}
                                isExpanded={isTabchartExpanded} setIsExpanded={setIsTabchartExpanded}
                                changedFilter={changedFilter} setChangedFilter={setChangedFilter} />
                        </div>
                        <div className={"dashboard-viz4" + ((activeCategory !== null) ? " drag-active" : "")}>
                            <NetworkChart
                                data={globalData} resetComponents={resetComponents} setResetComponents={setResetComponents}
                                setNetworkData={updateNetworkData} pyramidData={pyramidData} heatmapData={heatmapData} setNetworkLink={setNetworkLink}
                                colorCodices={colorCodices}
                                csvIndexes={props.csvIndexes}
                                isExpanded={isNetworkExpanded}
                                setIsExpanded={setIsNetworkExpanded} />
                        </div>

                    </div>
                    <div className='dashboard-row3'>

                        <button className="citations-btn" type='button' onClick={() => {setIsOpen(!isOpen); setNetworkLink(null)}}>
                            <img alt="up-arrow" width="20px" height="20px" style={{ transform: "rotate(180deg)" }} src={doubleArrow} />
                            {t("citations-label")}
                        </button>

                        <Drawer backdrop={false} open={isOpen} onClose={handleClose} 
                            className='citations-drawer shadow' position='bottom'>
                            <button className="citations-btn" type='button' onClick={() => {setIsOpen(false); setNetworkLink(null)}}>
                                <img alt="up-arrow" width="20px" height="20px" src={doubleArrow} />
                                {t("citations-label")}
                            </button>
                            <Citations
                                data={globalData}
                                networkData={networkData} pyramidData={pyramidData} heatmapData={heatmapData} networkLink={networkLink} setNetworkLink={setNetworkLink}
                                categories={categories}
                                activeCategories={activeCategories}
                                currentTabchartCategory={currentTabchartCategory}
                                csvIndexes={props.csvIndexes} csvNames={props.csvNames}
                                isOpen={isOpen} setIsOpen={setIsOpen}
                                />
                        </Drawer>
                    </div>
                </div>
            </div>

        </DndContext>
    </>)
}


export default DashboardPage;
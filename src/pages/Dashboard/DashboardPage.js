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

import { useLocation } from "react-router-dom";


import * as d3 from "d3"

import FilterView from './FilterView';
import Excerpts from './Excerpts';


function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

let colorCodices = () => { }


function romanToInt(roman) {
    const romanNumerals = {
        I: 1,
        V: 5,
        X: 10,
        L: 50,
        C: 100,
        D: 500,
        M: 1000,
    };
    let result = 0;
    for (let i = 0; i < roman.length; i++) {
        const currentSymbol = romanNumerals[roman[i]];
        const nextSymbol = romanNumerals[roman[i + 1]];
        if (nextSymbol && currentSymbol < nextSymbol) {
            result -= currentSymbol;
        } else {
            result += currentSymbol;
        }
    }
    return result;
}

const DashboardPage = (props) => {

    const { t } = useTranslation();

    const [categories, setCategories] = useState({})
    const [locations, setLocations] = useState([])
    const [centuries, setCenturies] = useState([])

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
            csv_name: "Corpórea",
            index: props.csvIndexes.dimension
        },
        "dimension-non-body": {
            csv_name: "Não corpórea",
            index: props.csvIndexes.dimension
        }
    }

    const [globalData, setGlobalData] = useState([])
    const [originalGlobalData, setOriginalGlobalData] = useState([])


    const [activeCategory, setActiveCategory] = useState(null)

    const [activeFilters, setActiveFilters] = useState({})
    const [advancedCategoryFilters, setAdvancedCategoryFilters] = useState({})
    const [activeCategories, setActiveCategories] = useState([]);
    const [currentTabchartCategory, setCurrentTabchartCategory] = useState("")
    const [activeLocations, setActiveLocations] = useState([])
    const [activeCenturies, setActiveCenturies] = useState([])
    const [activeCodices, setActiveCodices] = useState([])

    const [networkData, setNetworkData] = useState({ selected: [], people: [] })
    const [pyramidData, setPyramidData] = useState({ sex: "", category: "", categoryIndex: "" })
    const [heatmapData, setHeatmapData] = useState([])
    const [impPeopleData, setImpPeopleData] = useState([null, null])

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
                }
                return false;
            }
            return true;
        })

        setActiveCategory(null);
    }

    function removeCategory(index) {
        let aux = [...activeCategories]

        if (aux.length === 0)
            return

        if (index === 1 && aux.length === 1)
            return

        aux.splice(index, 1);

        setActiveCategories(aux)
    }

    let navigation = useLocation()

    useEffect(() => {

        
        d3.selectAll("#tooltip").style("opacity", 0)
        let element = document.getElementById('tooltip')
            if (element)
                element.innerHTML = "";

        let data = d3.flatRollup(props.data, v => v.length,
            d => d[props.csvNames.index],
            d => d[props.csvNames.material_type],
            d => d[props.csvNames.genre],
            d => d[props.csvNames.title],
            d => d[props.csvNames.publication],
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
            d => d[props.csvNames.time],
            d => d[props.csvNames.place],
            d => d[props.csvNames.latitude],
            d => d[props.csvNames.longitude],
            d => d[props.csvNames.chronology],
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

        let loc = d3.flatGroup(data, d => d[props.csvIndexes.place])
            .filter(entry => { return entry !== "Não aplicável" })
            .flatMap(d => [d[0]]).sort()

        setLocations(loc)

        let centJoined = d3.flatGroup(data, d => d[props.csvIndexes.chronology])
            .filter(entry => { return entry !== "Não aplicável" })
            .flatMap(d => [d[0]])

        let cent = []
        centJoined.forEach(c => {
            c.split(" ").forEach(c => {
                if (!cent.includes(c))
                    cent.push(c)
            })
        })

        setCenturies(cent.sort((a, b) => romanToInt(a) - romanToInt(b)))

        let categoriesAux = {
            "category-action": {
                index: props.csvIndexes.action,
                indexSubcategory: props.csvIndexes.action,
                list: []
            },
            "category-action-causes": {
                index: props.csvIndexes.causes_group,
                indexSubcategory: props.csvIndexes.causes,
                list: []
            },
            "category-anatomy": {
                index: props.csvIndexes.anatomical_part,
                indexSubcategory: props.csvIndexes.organs,
                list: []
            },
            
            
        }

        let advancedFilterAux = {}
        Object.keys(categoriesAux).forEach(key => {
            categoriesAux[key].list = d3.flatGroup(data, d => d[[categoriesAux[key].index]], d => d[[categoriesAux[key].indexSubcategory]])
                .flatMap(d => [[d[0], d[1]]]).sort()
            
            
            categoriesAux[key].list = d3.flatGroup(categoriesAux[key].list, d => d[0])
            advancedFilterAux[key] = {}
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
        if (navigation.state && navigation.state.mark) {
            let places = []
            let cent = []

            navigation.state.mark.places.forEach(entry => {
                if (!places.includes(entry[3])) {
                    places.push(entry[3])
                }

                entry[4].forEach(c => {
                    if (!cent.includes(c[0]))
                        cent.push(c[0])
                })
            })
            window.history.replaceState({}, '')

            data = data.filter((d) => {
                if (places && places.length)
                    if (!places.includes(d[props.csvIndexes.place]))
                        return false
                    
                let passCent = false
                if (cent && cent.length)
                    d[props.csvIndexes.chronology].split(" ").forEach(c => {
                        if(cent.includes(c))
                            passCent = true
                    })

                return passCent
            });

            if (places.length)
                setActiveLocations(places)

            if (cent.length)
                setActiveCenturies(cent)
        }

        if (navigation.state && navigation.state.type && navigation.state.item && navigation.state.subitems) {
            let type = navigation.state.type
            let item = navigation.state.item
            let subitems = navigation.state.subitems

            advancedFilterAux[type][item] = subitems
            if (subitems.length === 0){

                let category = categoriesAux[type]
                let sublist = []
                category.list.some(categorylist => {
                    let i = categorylist[0]

                    if (item)
                        sublist = categorylist[1].map(d => d[1])
                    else{
                        sublist.concat(categorylist[1].map(d => d[1]))
                    }
                    
                    return i === item
                })

                advancedFilterAux[type][item] = sublist
            }

            data = data.filter((d) => {
                let passAdvanced = true

                for (const [key, v] of Object.entries(advancedFilterAux)) {
                    let passItem = false
                    let indexList = categoriesAux[key].index
                    let indexSublist = categoriesAux[key].indexSubcategory

                    if (noSpaces(d[indexList]) in v)
                        if (v[noSpaces(d[indexList])].length && v[noSpaces(d[indexList])].includes(d[indexSublist]))
                            passItem = true
                        else if (!v[noSpaces(d[indexList])])
                            passItem = true

                    if (Object.keys(v).length === 0)
                        passItem = true

                    passAdvanced = passAdvanced && passItem
                }

                return passAdvanced;
            })

        }

        if (navigation.state && navigation.state.sex){
            let s = navigation.state.sex

            updatePyramidData({ sex: s, category: "", categoryIndex: "" })
        }

        setGlobalData([...data])
        setActiveFilters({
            intention: Object.keys(intention)[0],
            agent: Object.keys(agent)[0],
            value: Object.keys(value)[0],
            supernatural_type: Object.keys(supernatural_type)[0],

            nature: Object.keys(nature)[0],
            dimension: Object.keys(dimension)[0]
        })
        setAdvancedCategoryFilters(advancedFilterAux)
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

    function setFilters(newFilters, types, codicesFilter, locationFilter, centuryFilter, advFilters) {

        let filtered = originalGlobalData.filter((d) => {
            if (codicesFilter && codicesFilter.length) {
                if (!codicesFilter.includes(noSpaces(d[props.csvIndexes.title])))
                    return false;
            }
            else if (!activeCodices.includes(noSpaces(d[props.csvIndexes.title])))
                return false;


            if (locationFilter) {
                if (locationFilter.length && !locationFilter.includes(d[props.csvIndexes.place]))
                    return false
            }
            else if (activeLocations.length && !activeLocations.includes(d[props.csvIndexes.place]))
                return false

            if (centuryFilter) {
                if (centuryFilter.length) {
                    
                    let pass = false
                    let centuries = d[props.csvIndexes.chronology].split(" ")
                    centuries.forEach(c => {
                        if (centuryFilter.includes(c))
                            pass = true
                    })

                    if (!pass)
                        return false
                }
            }
            else if (activeCenturies.length) {
                let pass = false
                let centuries = d[props.csvIndexes.chronology].split(" ")
                centuries.forEach(c => {
                    if (activeCenturies.includes(c))
                        pass = true
                })

                if (!pass)
                    return false
            }

            for (const [key, v] of Object.entries(activeFilters)) {
                let filter = (types.includes(key)) ? newFilters[types.indexOf(key)] : v
                if (filter !== Object.keys(eval(key))[0] && d[eval(key)[filter].index] !== eval(key)[filter].csv_name)
                    return false;
            }


            let passAdvanced = true
            for (const [key, v] of Object.entries(advFilters ? advFilters : advancedCategoryFilters)) {
                let passItem = false
                let indexList = categories[key].index
                let indexSublist = categories[key].indexSubcategory

                if (noSpaces(d[indexList]) in v)
                    if (v[noSpaces(d[indexList])].length && v[noSpaces(d[indexList])].includes(d[indexSublist]))
                        passItem = true
                    else if (!v[noSpaces(d[indexList])])
                        passItem = true

                if (Object.keys(v).length === 0)
                    passItem = true

                passAdvanced = passAdvanced && passItem
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

        if (locationFilter)
            setActiveLocations(locationFilter)

        if (centuryFilter)
            setActiveCenturies(centuryFilter)

        setChangedFilter(true)
    }


    function resetFilters() {

        let advancedFilterAux = { ...advancedCategoryFilters }
        Object.keys(advancedCategoryFilters).forEach(key => {
            advancedFilterAux[key] = {}
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
            [], [],
            advancedFilterAux)

        setPyramidData({ sex: "", category: "", categoryIndex: "" })
        setHeatmapData([])
        setNetworkData({ selected: [], people: [] })
        setImpPeopleData([null, null])

        setResetComponents(true)
    }

    function updatePyramidData(d) {
        setPyramidData(d)
    }

    function updateHeatmapData(d) {
        setHeatmapData(d)
    }

    function updateNetworkData(d) {
        setNetworkData(d)
    }

    function updateImpPeopleData(d) {
        setImpPeopleData(d)
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

    function highlightDefaultCategory(proceed) {
        if (proceed) {
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
                    locations={locations} centuries={centuries}
                    intention={intention}
                    agent={agent}
                    value={value}
                    supernatural_type={supernatural_type}
                    nature={nature}
                    dimension={dimension}
                    codices={codices}
                    colorCodices={colorCodices}
                    genres={genres}
                    activeLocations={activeLocations} activeCenturies={activeCenturies}
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
                                setHeatmapData={updateHeatmapData} networkData={networkData} pyramidData={pyramidData} impPeopleData={impPeopleData}
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
                                setImpPeopleData={updateImpPeopleData} networkData={networkData} pyramidData={pyramidData} heatmapData={heatmapData}
                                csvIndexes={props.csvIndexes} csvNames={props.csvNames}
                                isExpanded={isImpPeopleExpanded}
                                setIsExpanded={setIsImpPeopleExpanded} />
                        </div>
                    </div>
                    <div className="dashboard-row2">
                        <div id="viz3" className={"dashboard-viz3" + ((activeCategory !== null) ? " drag-active" : "")}>
                            <TabChart categories={categories}
                                data={globalData} resetComponents={resetComponents} setResetComponents={setResetComponents}
                                setPyramidData={updatePyramidData} networkData={networkData} heatmapData={heatmapData} impPeopleData={impPeopleData}
                                csvIndexes={props.csvIndexes}
                                setCurrentTabchartCategory={setCurrentTabchartCategory}
                                isExpanded={isTabchartExpanded} setIsExpanded={setIsTabchartExpanded}
                                changedFilter={changedFilter} setChangedFilter={setChangedFilter} />
                        </div>
                        <div className={"dashboard-viz4" + ((activeCategory !== null) ? " drag-active" : "")}>
                            <NetworkChart
                                data={globalData} resetComponents={resetComponents} setResetComponents={setResetComponents}
                                setNetworkData={updateNetworkData} pyramidData={pyramidData} heatmapData={heatmapData} impPeopleData={impPeopleData}
                                setNetworkLink={setNetworkLink}
                                colorCodices={colorCodices}
                                csvIndexes={props.csvIndexes}
                                isExpanded={isNetworkExpanded}
                                setIsExpanded={setIsNetworkExpanded} />
                        </div>

                    </div>
                    <div className='dashboard-row3'>

                        <button className="excerpts-btn" type='button' onClick={() => { setIsOpen(!isOpen); setNetworkLink(null) }}>
                            <img alt="up-arrow" width="20px" height="20px" style={{ animation: "downup 2s ease infinite", marginLeft: "10px", transform: "rotate(180deg)" }} src={doubleArrow} />
                            {t("excerpts-label")}
                        </button>

                        <Drawer backdrop={false} open={isOpen} onClose={handleClose}
                            className='excerpts-drawer shadow' position='bottom'>
                            <button className="excerpts-btn" type='button' onClick={() => { setIsOpen(false); setNetworkLink(null) }}>
                                <img alt="up-arrow" width="20px" height="20px" style={{ marginLeft: "10px" }} src={doubleArrow} />
                                {t("excerpts-label")}
                            </button>
                            <Excerpts
                                data={globalData}
                                networkData={networkData} pyramidData={pyramidData} heatmapData={heatmapData} impPeopleData={impPeopleData} networkLink={networkLink} setNetworkLink={setNetworkLink}
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
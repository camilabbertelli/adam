import { useTranslation } from "react-i18next";
import { useDraggable } from '@dnd-kit/core';

import "./../../styles/Dashboard/FilterView.css";
import { useEffect, useState } from "react";

import spine from "./../../assets/images/spine.png"
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import info from "./../../assets/images/info-black.png"
import trash from "./../../assets/images/clear-filter.png"

import * as d3 from "d3"
import { useLocation } from "react-router-dom";

function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

var tooltipCategories;

const FilterView = (props) => {

    const { t } = useTranslation();

    const [codices, setCodices] = useState({})
    const [currentCodices, setCurrentCodices] = useState([])
    const [genre, setGenre] = useState("")

    function Draggable(props) {
        const { attributes, listeners, setNodeRef } = useDraggable({
            id: props.id,
        });


        return (
            <div className="category-group" ref={setNodeRef} {...listeners} {...attributes}>
                {props.children}
            </div>
        );
    }

    let infoMouseLeaveCategories = function (event, d) {
        tooltipCategories
            .style("opacity", 0)

        let element = document.getElementById('tooltip')
        if (element)
            element.innerHTML = "";
    }

    let infoMouseOverCategories = function (event, d) {

        let className = d3.select(this).node().className

        tooltipCategories
            .style("opacity", 1);

        tooltipCategories.html(`<center><b>${t("information")}</b></center>
                  ${t(`filter-tooltip-${className}`)}`)
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px")
    }

    useEffect(() => {
        setCodices(props.codices)
        setCurrentCodices(Object.keys(props.codices))


        tooltipCategories = d3.select("body")
            .select("#tooltip")

        d3.selectAll("#infoFilter")
            .on("mouseover", infoMouseOverCategories)
            .on("mouseleave", infoMouseLeaveCategories)
    }, [props.codices, props.genres])

    const changeSelect = function () {

        var selectBox = document.getElementById("genreSelect");

        if (!selectBox)
            return

        var selectedValue = selectBox.options[selectBox.selectedIndex].value;
        setGenre(selectedValue)

        if (selectedValue === "")
            return

        let newCurrentCodices = []

        currentCodices.forEach((key) => {
            if (codices[key].genre === selectedValue) {
                newCurrentCodices.push(key)
            }
        })

        if (newCurrentCodices.length === 0) {
            for (const [key, c] of Object.entries(codices)) {
                if (c.genre === selectedValue) {
                    newCurrentCodices.push(key)
                    setCurrentCodices(newCurrentCodices)
                    props.setActiveFilters([], [], newCurrentCodices)
                    return
                }
            }
        }

        setCurrentCodices(newCurrentCodices)
        props.setActiveFilters([], [], newCurrentCodices)
    }

    const equalsCheck = (a, b) => {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    const changeCodex = function (id) {

        let sortedkeys = Object.keys(codices).sort()
        let aux = [...currentCodices]

        if (equalsCheck(sortedkeys, currentCodices.sort()))
            aux = [id]
        else {
            if (currentCodices.includes(id)) {
                if (currentCodices.length === 1) {
                    setCurrentCodices(sortedkeys)
                    props.setActiveFilters([], [], sortedkeys)
                    return
                }
                aux.splice(aux.indexOf(id), 1);
            }
            else
                aux.push(id)
        }

        setCurrentCodices(aux)
        props.setActiveFilters([], [], aux)
    }

    const Codices = ({ genre, codices }) => {
        let content = []

        for (const [key, c] of Object.entries(codices)) {
            if (!genre || genre === c.genre) {

                content.push(
                    <div id={key} key={c.title} className={`dashboard-image-component ` + (currentCodices.includes(key) ? "codex-selected" : "")} onClick={() => changeCodex(key)}>
                        <img id={key} src={spine} className="dashboard-card-img-top" alt="book" />
                        <div id={key} className='dashboard-codex-title'>{c.title}</div>
                        <div id={key} className='dashboard-codex-color' style={{ backgroundColor: props.colorCodices(c.title) }}></div>
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

    function toggleDropdownCentury() {

        if (d3.select(`[id="century-dropdown"]`).node()) {

            let dropDownActive = !d3.select(`#century-dropdown`).classed("century-dropdown-content-show")
            d3.select(`#century-dropdown`).classed("century-dropdown-content-show", dropDownActive)
            d3.select(`#century-arrow`).style("transform", dropDownActive ? "rotate(90deg)" : "none")

            d3.select(`.btn-centuries`).style("border-radius", !dropDownActive ? "20px" : "20px 20px 0 0")
        }
    }

    function toggleDropdownLocation() {

        if (d3.select(`[id="location-dropdown"]`).node()) {

            let dropDownActive = !d3.select(`#location-dropdown`).classed("location-dropdown-content-show")
            d3.select(`#location-dropdown`).classed("location-dropdown-content-show", dropDownActive)
            d3.select(`#location-arrow`).style("transform", dropDownActive ? "rotate(90deg)" : "none")

            d3.select(`.btn-locations`).style("border-radius", !dropDownActive ? "20px" : "20px 20px 0 0")
        }
    }

    function toggleDropdownCategory(key, index) {

        if (d3.select(`[id="filter-dropdown-${key}"]`).node()) {

            let dropDownActive = !d3.select(`[id="filter-dropdown-${key}"]`).classed("filter-dropdown-content-show")
            d3.select(`[id="filter-dropdown-${key}"]`).classed("filter-dropdown-content-show", dropDownActive)
            d3.select(`[id="excerpt-arrow-${key}"]`).style("transform", dropDownActive ? "rotate(90deg)" : "none")

            if (index === Object.keys(props.categories).length - 1)
                d3.select(`[id="${key}"]`).style("border-radius", dropDownActive ? "0" : "0 0 20px 20px")
        }
    }

    function toggleDropdownSubCategory(key) {
        let subDropDownActive = !d3.select(`[id="filter-sub-dropdown-${key}"]`).classed("filter-dropdown-content-show")
        d3.select(`[id="filter-sub-dropdown-${key}"]`).classed("filter-dropdown-content-show", subDropDownActive)
        d3.select(`[id="excerpt-sub-arrow-${key}"]`).style("transform", subDropDownActive ? "rotate(90deg)" : "none")

    }

    function clickDropdownCentury(century) {
        let source = document.getElementById(`checkbox-century-${noSpaces(century)}`)

        let aux = [...props.activeCenturies]

        if (!source.checked) {
            const index = aux.indexOf(century);
            aux.splice(index, 1);
        } else aux.push(century)

        props.setActiveFilters([], [], null, null, aux)
    }

    function clickDropdownLocation(place) {
        let source = document.getElementById(`checkbox-location-${noSpaces(place)}`)

        let aux = [...props.activeLocations]

        if (!source.checked) {
            const index = aux.indexOf(place);
            aux.splice(index, 1);
        } else aux.push(place)

        props.setActiveFilters([], [], null, aux)
    }

    function clickDropdownCategory(category, key, sublist) {
        let source = document.getElementById(`checkbox-${key}`)
        let checkboxes = document.getElementsByName(`checkbox-sub-${key}`);
        let aux = { ...props.advancedCategoryFilters }

        checkboxes.forEach((checkbox) => {
            checkbox.checked = source.checked;
        })

        if (source.checked) {
            source.checked = true
            aux[category][key] = sublist
        }
        else{
            source.checked = false
            delete aux[category][key];
        }

        props.setActiveFilters([], [], null, null, null, aux)
    }

    function clickDropdownSubCategory(category, key, subkey) {
        let source = document.getElementById(`checkbox-${key}`)
        let checkboxes = document.getElementsByName(`checkbox-sub-${key}`);
        source.checked = false
        checkboxes.forEach((checkbox) => {
            if (checkbox.checked)
                source.checked = checkbox.checked;
        })

        let target = document.getElementById(`checkbox-sub-${subkey}`);
        let aux = { ...props.advancedCategoryFilters }

        if (!target.checked) {
            let indexSub = -1
            if (key in aux[category]) 
                indexSub = aux[category][key].indexOf(subkey);
            
            aux[category][key].splice(indexSub, 1);
            if (key in aux[category] && !source.checked)
                delete aux[category][key]
        } else {
            if (!(key in aux[category]))
                aux[category][key] = []
            aux[category][key].push(subkey)
        }

        props.setActiveFilters([], [], [], [], [], aux)
    }

    function resetFilters() {
        props.resetFilters()
        setGenre("")
        setCurrentCodices(Object.keys(codices).sort())

        Object.keys(props.categories).forEach((key) => {
            var container = document.querySelector(`#filter-dropdown-${key}`);
            if (container) {

                var checkBoxes = container.querySelectorAll('input[type="checkbox"]');
                checkBoxes.forEach((checkbox) => {
                    checkbox.checked = false;
                })
            }
        })

        d3.selectAll(`.filter-dropdown-content-show`).classed("filter-dropdown-content-show", false)
        d3.selectAll(`.arrow-dropdown`).style("transform", "none")
    }

    function highlightHeatmap() {
        if (props.activeCategories.length === 2)
            return

        d3.selectAll(".heatmap-drag").selectAll(".default").style("background-color", "#D8BABA")
        d3.select(".category-buttons-group").style("border", "2px dashed #8C5E5E")

        setTimeout(() => {
            d3.selectAll(".heatmap-drag").selectAll(".default").style("background-color", "white")
            d3.select(".category-buttons-group").style("border", "2px solid transparent")
        }, 2000);
    }

    function dismissHeatmap() {
        d3.selectAll(".heatmap-drag").selectAll(".default").style("background-color", "white")
        d3.select(".category-buttons-group").style("border", "2px solid transparent")
    }


    let navigation = useLocation()

    const [onlyOnce, setOnlyOnce] = useState(false)

    useEffect(() => {
        if (!onlyOnce && navigation.state && navigation.state.type && navigation.state.item && navigation.state.subitems) {

            let type = navigation.state.type
            let item = navigation.state.item

            if (props.advancedCategoryFilters[type])
                Object.keys(props.advancedCategoryFilters[type]).forEach(item => {
                    props.advancedCategoryFilters[type][item].forEach((subitem) => {
                        let target = document.getElementById(`checkbox-sub-${subitem}`);
                        if (target)
                            target.checked = true
                    })
                })

            let source = document.getElementById(`checkbox-${item}`)
            
            if (!source)
                return

            setOnlyOnce(true)

            source.checked = true

            window.history.replaceState({}, '')
        }
    })

    // function filtersActive(){

    //     let breaking = false;
        
    //     Object.keys(props.advancedCategoryFilters).every((key) => {
    //         if (props.advancedCategoryFilters[key].list.length){
    //             breaking = true
    //             return false;
    //         }

    //         if (props.advancedCategoryFilters[key].sublist.length){
    //             breaking = true
    //             return false;
    //         }

    //         return true;
    //     })


    //     if (breaking)
    //         return true

    //     breaking = false
    //     Object.keys(props.activeFilters).every((key) => {
    //         if (!props.activeFilters[key].includes("-all")){
    //             breaking = true
    //             return false;
    //         }

    //         return true;
    //     })

    //     if (breaking)
    //         return true

    //     if (props.activeCenturies.length || props.activeLocations.length)
    //         return true

    //     if (currentCodices.length !== Object.keys(props.codices).length)
    //         return true

    //     return false
    // }

    return (
        <>

            <div className="dashboard-filter-view" key={"filterview"}>
                
                <div key={"clean-all-button"} style={{ position: "relative", width: "95%", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    <button key="clean-all-button-content" className="btn-clear-all" onClick={resetFilters}>
                        <img alt="close" src={trash}
                            style={{ margin: "0 5px", cursor: "pointer", width: "20px", height: "20px" }}
                        />
                        {t("clear-all-filter")}
                    </button>
                </div>
                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center" }} key={"actual-filters"}>
                    <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                        {t("categories-label")}
                        <img alt="info" id="infoFilter" className="categories" src={info}
                            style={{ marginLeft: "5px", cursor: "pointer", width: "15px", height: "15px" }}
                        />
                    </div>
                    <div className="category-buttons-group" onMouseOver={highlightHeatmap} onMouseLeave={dismissHeatmap}>
                        {Object.keys(props.categories).map((key, index) => {
                            let category = props.categories[key]
                            return (
                                <>

                                    <div className="category-buttons" key={"category_" + key}>
                                        <Draggable key={key} id={key}><button className={`shadow dashboard-filter-category` + (props.activeCategories.includes(key) ? " selected" : "")} id={key}
                                            style={(index === 0) ? { borderRadius: "20px 20px 0 0" } :
                                                (index === Object.keys(props.categories).length - 1 ? //its the last category
                                                    (d3.select(`[id="filter-dropdown-${key}"]`).node() && !d3.select(`[id="filter-dropdown-${key}"]`).classed("filter-dropdown-content-show") ? { borderRadius: "0 0 20px 20px" } : { borderRadius: "0" }) : null)}
                                            onClick={() => toggleDropdownCategory(key, index)} >
                                            {t(key)}
                                            <ArrowForwardIosIcon id={`excerpt-arrow-${key}`} className="arrow-dropdown" style={{ position: "absolute", right: "0", width: "15px", marginRight: "5px", marginTop: "2px" }} />
                                        </button>
                                        </Draggable>
                                        <div id={`filter-dropdown-${key}`} style={(index === Object.keys(props.categories).length - 1 ? { borderRadius: "0 0 20px 20px" } : null)} className={"shadow filter-dropdown-content-hide"} key={"hidden-dropdown"}>
                                            <ul style={{ position: "relative" }}>
                                                {category.list.map(categorylist => {
                                                    let item = categorylist[0]
                                                    let sublist = categorylist[1].map(d => d[1])

                                                    return (
                                                        <li key={"li_" + item}>
                                                            <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", borderRadius: "20px" }} key={"item-pack-" + item}>
                                                                <input id={`checkbox-${noSpaces(item)}`} type="checkbox" onClick={() => clickDropdownCategory(key, noSpaces(item), sublist)} />
                                                                <button onClick={() => toggleDropdownSubCategory(noSpaces(item))} style={{ width: "100%", height: "100%", display: "flex" }}>
                                                                    {item} {sublist.length > 1 && <ArrowForwardIosIcon className="arrow-dropdown" id={`excerpt-sub-arrow-${noSpaces(item)}`} style={{ position: "absolute", right: 0, width: "15px", marginRight: "5px", marginTop: "2px" }} />}
                                                                </button>
                                                            </div>
                                                            {sublist.length > 1 && <div id={`filter-sub-dropdown-${noSpaces(item)}`} className={"filter-dropdown-content-hide"} key={"hidden-sub-dropdown"}>
                                                                <ul>
                                                                    {sublist.map(subitem => (
                                                                        <li key={"li_sub_" + subitem}>
                                                                            <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", marginLeft: "6%" }}>
                                                                                <input onClick={() => clickDropdownSubCategory(key, noSpaces(item), noSpaces(subitem))} type="checkbox" id={`checkbox-sub-${noSpaces(subitem)}`} name={`checkbox-sub-${noSpaces(item)}`} />
                                                                                <button style={{ width: "100%", height: "100%", display: "flex" }}>{subitem}</button>
                                                                            </div>
                                                                        </li>))}
                                                                </ul>
                                                            </div>}
                                                        </li>)
                                                })}

                                            </ul>
                                        </div>
                                    </div>
                                </>

                            )
                        })}
                    </div>
                </div>

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "2px 0" }}>

                    <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", }}>
                        {t("agent-label")}
                        <img alt="info" id="infoFilter" className="agent" src={info}
                            style={{ marginLeft: "5px", cursor: "pointer", width: "15px", height: "15px" }}
                        />
                    </div>
                    <div className="inline-flex" role="group">
                        {Object.keys(props.agent).map((agent) => {
                            return (
                                <button key={agent} type="button" className={"dashboard-filter-options" + ((props.activeFilters.agent === agent) ? " active" : "")} onClick={() => props.setActiveFilters([agent], ["agent"])}>
                                    {t(agent)}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "2px 0" }}>
                    <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", }}>
                        {t("intention-label")}
                        <img alt="info" id="infoFilter" className="intention" src={info}
                            style={{ marginLeft: "5px", cursor: "pointer", width: "15px", height: "15px" }}
                        />
                    </div>
                    <div className="inline-flex" role="group">
                        {Object.keys(props.intention).map((intention) => {
                            return (
                                <button key={intention} type="button" className={"dashboard-filter-options" + ((props.activeFilters.intention === intention) ? " active" : "")} onClick={() => props.setActiveFilters([intention], ["intention"])}>
                                    {t(intention)}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "2px 0" }}>

                    <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", }}>
                        {t("value-label")}
                        <img alt="info" id="infoFilter" className="value" src={info}
                            style={{ marginLeft: "5px", cursor: "pointer", width: "15px", height: "15px" }}
                        />
                    </div>
                    <div className="inline-flex" role="group">
                        {Object.keys(props.value).map((value) => {
                            return (
                                <button key={value} type="button" className={"dashboard-filter-options" + ((props.activeFilters.value === value) ? " active" : "")} onClick={() => props.setActiveFilters([value], ["value"])}>
                                    {t(value)}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "2px 0" }}>

                    <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", }}>
                        {t("nature-label")}
                        <img alt="info" id="infoFilter" className="nature" src={info}
                            style={{ marginLeft: "5px", cursor: "pointer", width: "15px", height: "15px" }}
                        />
                    </div>
                    <div className="inline-flex" role="group">
                        {Object.keys(props.nature).map((nature) => {
                            return (
                                <button key={nature} type="button" className={"dashboard-filter-options" + ((props.activeFilters.nature === nature) ? " active" : "")} onClick={() => props.setActiveFilters([nature], ["nature"])}>
                                    {t(nature)}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "2px 0" }}>

                    <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", }}>
                        {t("supernatural_type-label")}
                        <img alt="info" id="infoFilter" className="supernatural_type" src={info}
                            style={{ marginLeft: "5px", cursor: "pointer", width: "15px", height: "15px" }}
                        />
                    </div>
                    <div className="inline-flex" role="group">
                        {Object.keys(props.supernatural_type).map((supernatural_type) => {
                            return (
                                <button key={supernatural_type} type="button" className={"dashboard-filter-options" + ((props.activeFilters.supernatural_type === supernatural_type) ? " active" : "")} onClick={() => props.setActiveFilters([supernatural_type], ["supernatural_type"])}>
                                    {t(supernatural_type)}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "2px 0" }}>

                    <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", }}>
                        {t("dimension-label")}
                        <img alt="info" id="infoFilter" className="dimension" src={info}
                            style={{ marginLeft: "5px", cursor: "pointer", width: "15px", height: "15px" }}
                        />
                    </div>
                    <div className="inline-flex" role="group">
                        {Object.keys(props.dimension).map((dimension) => {
                            return (
                                <button key={dimension} type="button" className={"dashboard-filter-options" + ((props.activeFilters.dimension === dimension) ? " active" : "")} onClick={() => props.setActiveFilters([dimension], ["dimension"])}>
                                    {t(dimension)}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "2px 0" }}>

                    <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", }}>
                        {t("locations-label")}
                        <img alt="info" id="infoFilter" className="location" src={info}
                            style={{ marginLeft: "5px", cursor: "pointer", width: "15px", height: "15px" }}
                        />
                    </div>
                    <button className="btn-locations" style={{ color: (props.activeLocations.length ? "black" : "gray") }} onClick={toggleDropdownLocation}>
                        {props.activeLocations.length === 0 ? t("location-select") : props.activeLocations.join(", ")}
                        <ArrowForwardIosIcon id={`location-arrow`} className="arrow-dropdown" style={{ position: "absolute", right: "0", width: "15px", marginRight: "10px", marginTop: "auto", marginBottom: "auto" }} />
                    </button>
                    <div id={`location-dropdown`} className={"shadow location-dropdown-content-hide"} key={"hidden-location-dropdown"}>
                        <ul>
                            {props.locations.map(place => (
                                <li key={"li_location_" + place}>
                                    <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", marginLeft: "6%" }}>
                                        <input checked={props.activeLocations.includes(place)} onClick={() => clickDropdownLocation(place)} type="checkbox" id={`checkbox-location-${noSpaces(place)}`} name={`checkbox-location-${noSpaces(place)}`} />
                                        <button style={{ width: "100%", height: "100%", display: "flex" }}>{place}</button>
                                    </div>
                                </li>))}
                        </ul>
                    </div>
                </div>

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "2px 0" }}>

                    <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", }}>
                        {t("centuries-label")}
                        <img alt="info" id="infoFilter" className="century" src={info}
                            style={{ marginLeft: "5px", cursor: "pointer", width: "15px", height: "15px" }}
                        />
                    </div>
                    <button className="btn-centuries" style={{ color: (props.activeCenturies.length ? "black" : "gray") }} onClick={toggleDropdownCentury}>
                        {props.activeCenturies.length === 0 ? t("century-select") : props.activeCenturies.join(", ")}
                        <ArrowForwardIosIcon id={`century-arrow`} className="arrow-dropdown" style={{ position: "absolute", right: "0", width: "15px", marginRight: "10px", marginTop: "auto", marginBottom: "auto" }} />
                    </button>
                    <div id={`century-dropdown`} className={"shadow century-dropdown-content-hide"} key={"hidden-century-dropdown"}>
                        <ul>
                            {props.centuries.map(century => (
                                <li key={"li_century_" + century}>
                                    <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", marginLeft: "6%" }}>
                                        <input checked={props.activeCenturies.includes(century)} onClick={() => clickDropdownCentury(century)} type="checkbox" id={`checkbox-century-${noSpaces(century)}`} name={`checkbox-location-${noSpaces(century)}`} />
                                        <button style={{ width: "100%", height: "100%", display: "flex" }}>{century}</button>
                                    </div>
                                </li>))}
                        </ul>
                    </div>
                </div>

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "2px 0" }}>

                    <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", }}>
                        {t("codices-label")}
                        <img alt="info" id="infoFilter" className="codices" src={info}
                            style={{ marginLeft: "5px", cursor: "pointer", width: "15px", height: "15px" }}
                        />
                    </div>
                    <select id="genreSelect" className="dashboard form-select" value={genre} onChange={() => changeSelect()}>
                        <option value="">{t("library-genre-all")}</option>
                        <SelectGenre genres={props.genres} />
                    </select>
                    <div className="dashboard-codices">
                        <Codices genre={genre} codices={props.codices} />
                    </div>
                </div>

            </div>
        </>
    )
}

export default FilterView
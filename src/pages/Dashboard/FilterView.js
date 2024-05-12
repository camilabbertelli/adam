import { useTranslation } from "react-i18next";
import { useDraggable } from '@dnd-kit/core';

import "./../../styles/Dashboard/FilterView.css";
import { useEffect, useState } from "react";

import spine from "./../../assets/images/spine.png"
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import * as d3 from "d3"

function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

const FilterView = (props) => {

    const { t } = useTranslation();

    const [simpleFilter, setSimpleFilter] = useState(true);

    const [codices, setCodices] = useState({})
    const [currentCodices, setCurrentCodices] = useState([])
    const [genre, setGenre] = useState("")

    useEffect(() => {
        setCodices(props.codices)
        setCurrentCodices(Object.keys(props.codices))
    }, [props.codices, props.genres])

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
                    props.setCurrentCodices(newCurrentCodices)
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
                if (currentCodices.length === 1) return
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

    const changeFilterType = () => {
        if (props.activeFilters.nature !== "nature-all" || props.activeFilters.dimension !== "dimension-all")
            props.setActiveFilters(["nature-all", "dimension-all"], ["nature", "dimension"])
        setSimpleFilter(!simpleFilter)
    }

    function toggleDropdownCategory(key, index) {

        if (d3.select(`[id="filter-dropdown-${key}"]`).node()) {

            let dropDownActive = !d3.select(`[id="filter-dropdown-${key}"]`).classed("filter-dropdown-content-show")
            d3.select(`[id="filter-dropdown-${key}"]`).classed("filter-dropdown-content-show", dropDownActive)
            d3.select(`[id="citation-arrow-${key}"]`).style("transform", dropDownActive ? "rotate(90deg)" : "none")

            if (index === Object.keys(props.categories).length - 1)
                d3.select(`[id="${key}"]`).style("border-radius", dropDownActive ? "0" : "0 0 20px 20px")
        }
    }
    function toggleDropdownSubCategory(key) {
        let subDropDownActive = !d3.select(`[id="filter-sub-dropdown-${key}"]`).classed("filter-dropdown-content-show")
        d3.select(`[id="filter-sub-dropdown-${key}"]`).classed("filter-dropdown-content-show", subDropDownActive)
        d3.select(`[id="citation-sub-arrow-${key}"]`).style("transform", subDropDownActive ? "rotate(90deg)" : "none")
    }

    function clickDropdownCategory(key){
        let source = document.getElementById(`checkbox-${key}`)
        let checkboxes = document.getElementsByName(`checkbox-sub-${key}`);
        checkboxes.forEach((checkbox) => {
            checkbox.checked = source.checked;
        })

        //TODO:
        //props.setActiveFilters(???)
    }

    function clickDropdownSubCategory(key){
        let source = document.getElementById(`checkbox-${key}`)
        let checkboxes = document.getElementsByName(`checkbox-sub-${key}`);
        source.checked = false
        checkboxes.forEach((checkbox) => {
            if (checkbox.checked)
            source.checked = checkbox.checked;
        })
    }

    return (
        <>

            <div className="dashboard-filter-view">

                <div className="inline-flex" role="group">
                    <button type="button" className={"shadow dashboard-filter-button" + ((simpleFilter) ? " active" : "")} style={{ borderRadius: "20px 0px 0px 20px" }} onClick={changeFilterType}>
                        {t("simple-filter")}
                    </button>
                    <button type="button" className={"shadow dashboard-filter-button" + ((!simpleFilter) ? " active" : "")} style={{ borderRadius: "0px 20px 20px 0px" }} onClick={changeFilterType}>
                        {t("advanced-filter")}
                    </button>
                </div>

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "10px 0" }}>
                    <h5>{t("categories-label")}</h5>
                    {Object.keys(props.categories).map((key, index) => {

                        let category = props.categories[key]
                        return(
                            <>
                                <div className="category-buttons">
                                    <Draggable key={key} id={key}><button className='dashboard-filter-category shadow' id={key}
                                        style={(index === 0) ? { borderRadius: "20px 20px 0 0" } :
                                            (index === Object.keys(props.categories).length - 1 ? { borderRadius: "0 0 20px 20px" } : null)}
                                        onClick={() => toggleDropdownCategory(key, index)} >
                                        {t(key)}
                                        {!simpleFilter && <ArrowForwardIosIcon id={`citation-arrow-${key}`} style={{ float: "right", width: "15px", marginRight: "5px", marginTop: "2px" }} />}
                                    </button>
                                    </Draggable>
                                    {!simpleFilter &&
                                    <div id={`filter-dropdown-${key}`} className={"shadow filter-dropdown-content-hide"}>
                                        <ul style={{ position: "relative" }}>
                                            {category.list.map(categorylist => {
                                            let item = categorylist[0]
                                            let sublist = categorylist[1].map(d=>d[1])
                                            return(
                                            <li>
                                                <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%" }}>
                                                    <input id={`checkbox-${noSpaces(item)}`} type="checkbox" onClick={() => clickDropdownCategory(noSpaces(item))}/>
                                                    <button onClick={() => toggleDropdownSubCategory(noSpaces(item))} style={{ width: "100%", height: "100%", display: "flex" }}>
                                                        {item} <ArrowForwardIosIcon id={`citation-sub-arrow-${noSpaces(item)}`} style={{ position: "absolute", right: 0, width: "15px", marginRight: "5px", marginTop: "2px" }} />
                                                    </button>
                                                </div>
                                                <div id={`filter-sub-dropdown-${noSpaces(item)}`} className={"filter-dropdown-content-hide"}>
                                                    <ul>
                                                        {sublist.map(subitem => (
                                                        <li>
                                                            <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", marginLeft: "6%"}}>
                                                                <input onClick={() => clickDropdownSubCategory(noSpaces(item))} type="checkbox" name={`checkbox-sub-${noSpaces(item)}`}/>
                                                                <button style={{ width: "100%", height: "100%", display: "flex" }}>{subitem}</button>
                                                            </div>
                                                        </li>))}
                                                    </ul>
                                                </div>
                                            </li>)})}

                                        </ul>
                                    </div>}
                                </div>
    
                            </>
    )
                    })}
                </div>

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                    <h5>{t("intention-label")}</h5>
                    <div className="inline-flex" role="group">
                        {Object.keys(props.intention).map((intention) => {
                            return (
                                <button key={intention} type="button" className={"shadow dashboard-filter-options" + ((props.activeFilters.intention === intention) ? " active" : "")} onClick={() => props.setActiveFilters([intention], ["intention"])}>
                                    {props.intention[intention].name}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                    <h5>{t("origin-label")}</h5>
                    <div className="inline-flex" role="group">
                        {Object.keys(props.origin).map((origin) => {
                            return (
                                <button key={origin} type="button" className={"shadow dashboard-filter-options" + ((props.activeFilters.origin === origin) ? " active" : "")} onClick={() => props.setActiveFilters([origin], ["origin"])}>
                                    {props.origin[origin].name}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                    <h5>{t("explanation-label")}</h5>
                    <div className="inline-flex" role="group">
                        {Object.keys(props.explanation).map((explanation) => {
                            return (
                                <button key={explanation} type="button" className={"shadow dashboard-filter-options" + ((props.activeFilters.explanation === explanation) ? " active" : "")} onClick={() => props.setActiveFilters([explanation], ["explanation"])}>
                                    {props.explanation[explanation].name}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {!simpleFilter && <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                    <h5>{t("nature-label")}</h5>
                    <div className="inline-flex" role="group">
                        {Object.keys(props.nature).map((nature) => {
                            return (
                                <button key={nature} type="button" className={"shadow dashboard-filter-options" + ((props.activeFilters.nature === nature) ? " active" : "")} onClick={() => props.setActiveFilters([nature], ["nature"])}>
                                    {props.nature[nature].name}
                                </button>
                            )
                        })}
                    </div>
                </div>}


                {!simpleFilter && <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                    <h5>{t("dimension-label")}</h5>
                    <div className="inline-flex" role="group">
                        {Object.keys(props.dimension).map((dimension) => {
                            return (
                                <button key={dimension} type="button" className={"shadow dashboard-filter-options" + ((props.activeFilters.dimension === dimension) ? " active" : "")} onClick={() => props.setActiveFilters([dimension], ["dimension"])}>
                                    {props.dimension[dimension].name}
                                </button>
                            )
                        })}
                    </div>
                </div>}

                <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                    <h5>{t("codices-label")}</h5>
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
import { useTranslation } from "react-i18next";
import { useDraggable } from '@dnd-kit/core';

import "./../../styles/Dashboard/FilterView.css";
import { useState } from "react";

import spine from "./../../assets/images/spine.png"
import codicesOriginal from "./../../assets/codices"


function noSpaces(str) {
    return (str.replace(".", '')).replace(/\s+/g, '')
}

const FilterView = ({ categories }) => {

    const { t } = useTranslation();

    const [simpleFilter, setSimpleFilter] = useState(true);

    const [intentionIndex, setIntentionIndex] = useState(0)
    const [originIndex, setOriginIndex] = useState(0)
    const [explanationIndex, setExplanationIndex] = useState(0)
    const [natureIndex, setNatureIndex] = useState(0)
    const [dimensionIndex, setDimensionIndex] = useState(0)

    const intention = ["All", "Sacred", "Profane"]
    const origin = ["All", "Literal", "Symbolic"]
    const explanation = ["All", "Miraculous", "Wonderful", "None"]
    const nature = ["All", "Animal", "Human", "Supernatural"]
    const dimension = ["All", "Body", "Soul", "Transcendental"]

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
    
    if (allGenres) allGenres.sort()

    let sortedkeys = Object.keys(allCodicesAux).sort()

    sortedkeys.forEach((key) => {
        allCodices[key] = allCodicesAux[key]
    })

    const [currentCodices, setCurrentCodices] = useState(sortedkeys)
    const [genre, setGenre] = useState("")

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

    const Codices = ({ genre, codices }) => {
        let content = []

        for (const [key, c] of Object.entries(codices)) {
            if (!genre || genre === c.genre) {

                content.push(
                    <div id={key} key={c.title} className={`dashboard-image-component ` + (currentCodices.includes(key) ? "codex-selected" : "")} onClick={() => changeCodex(key)}>
                        <img id={key} src={spine} className="dashboard-card-img-top" alt="book" />
                        <div id={key} className='dashboard-centered'>{c.title}</div>
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
        setNatureIndex(0)
        setDimensionIndex(0)
        setSimpleFilter(!simpleFilter)
    }

    return (
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
                <center>
                    {categories.map((p) => (
                        <Draggable key={p} id={p}><button className='dashboard-filter-category shadow' id={p}>{p}</button></Draggable>
                    ))}
                </center>
            </div>

            <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                <h5>{t("intention-label")}</h5>
                <div className="inline-flex" role="group">
                    {intention.map(function (intention, index) {
                        return (
                            <button key={intention} type="button" className={"shadow dashboard-filter-options" + ((intentionIndex === index) ? " active" : "")} onClick={() => setIntentionIndex(index)}>
                                {intention}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                <h5>{t("origin-label")}</h5>
                <div className="inline-flex" role="group">
                    {origin.map(function (origin, index) {
                        return (
                            <button key={origin} type="button" className={"shadow dashboard-filter-options" + ((originIndex === index) ? " active" : "")} onClick={() => setOriginIndex(index)}>
                                {origin}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                <h5>{t("explanation-label")}</h5>
                <div className="inline-flex" role="group">
                    {explanation.map(function (explanation, index) {
                        return (
                            <button key={explanation} type="button" className={"shadow dashboard-filter-options" + ((explanationIndex === index) ? " active" : "")} onClick={() => setExplanationIndex(index)}>
                                {explanation}
                            </button>
                        )
                    })}
                </div>
            </div>

            {!simpleFilter && <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                <h5>{t("nature-label")}</h5>
                <div className="inline-flex" role="group">
                    {nature.map(function (nature, index) {
                        return (
                            <button key={nature} type="button" className={"shadow dashboard-filter-options" + ((natureIndex === index) ? " active" : "")} onClick={() => setNatureIndex(index)}>
                                {nature}
                            </button>
                        )
                    })}
                </div>
            </div>}


            {!simpleFilter && <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                <h5>{t("dimension-label")}</h5>
                <div className="inline-flex" role="group">
                    {dimension.map(function (dimension, index) {
                        return (
                            <button key={dimension} type="button" className={"shadow dashboard-filter-options" + ((dimensionIndex === index) ? " active" : "")} onClick={() => setDimensionIndex(index)}>
                                {dimension}
                            </button>
                        )
                    })}
                </div>
            </div>}

            <div style={{ width: "95%", display: 'flex', flexDirection: "column", justifyContent: "center", padding: "5px 0" }}>
                <h5>{t("codices-label")}</h5>
                <select id="genreSelect" className="dashboard form-select" value={genre} onChange={() => changeSelect()}>
                    <option value="">{t("library-genre-all")}</option>
                    <SelectGenre genres={allGenres} />
                </select>
                <div className="dashboard-codices">
                    <Codices genre={genre} codices={allCodices} />
                </div>
            </div>

        </div>
    )
}

export default FilterView
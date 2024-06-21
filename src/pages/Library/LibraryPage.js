import React, { useState } from "react";

import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Library.css";


import { useTranslation } from "react-i18next";


import spine from "./../../assets/images/spine.png"
import codicesOriginal from "./../../assets/codices"

import * as d3 from "d3"
import PdfViewer from "./PdfViewer";



function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

function isDictEmpty(d) {
    return (Object.keys(d).length === 0)
}


const LibraryPage = () => {
    const { t } = useTranslation();

    const [theme, setTheme] = useState("light")
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

    const changeLightsOff = function () {
        d3.selectAll("#library-view").classed("lightsoff", (theme === "light"))
        d3.selectAll("#selections").classed("lightsoff-selection", (theme === "light"))

        setTheme((theme === "light") ? "dark" : "light")
    }

    const changeCodex = function (id) {

        if (!currentCodex) {
            setPdf("blank.pdf")
            return
        }

        let c = allCodices[id]

        setCurrentCodex(id)

        setAncientDisabled(c["pdf-ancient"] ? false : true)
        setModernDisabled(c["pdf-modern"] ? false : true)

        if (isAncientChecked && c["pdf-ancient"]) {
            setPdf(c["pdf-ancient"])
            return
        }

        if (!isAncientChecked && c["pdf-modern"]) {
            setPdf(c["pdf-modern"])
            return
        }

        if (isAncientChecked && !c["pdf-ancient"] && c["pdf-modern"]) {
            setAncientChecked(false)
            setPdf(c["pdf-modern"])
            return
        }

        if (!isAncientChecked && !c["pdf-modern"] && c["pdf-ancient"]) {
            setAncientChecked(true)
            setPdf(c["pdf-ancient"])
            return
        }

        setPdf("blank.pdf")
        return
    }

    let allCodicesAux = {}
    let allCodices = {}
    let allGenres = []
    codicesOriginal.forEach(codex => {
        if (codex["pdf-ancient"] || codex["pdf-modern"]) {
            allCodicesAux[noSpaces(codex.title)] = codex;
            allGenres.push(codex.genre);
        }
    })

    if (allGenres) allGenres.sort()

    let sortedkeys = Object.keys(allCodicesAux).sort()

    sortedkeys.forEach((key) => {
        allCodices[key] = allCodicesAux[key]
    })

    let p = "blank.pdf"
    let id = ""
    let ancient = true
    let modern = true


    if (!isDictEmpty(allCodices)) {
        id = Object.keys(allCodices)[0];
        let firstValue = Object.values(allCodices)[0];

        if (firstValue["pdf-modern"]) {
            p = firstValue["pdf-modern"]
            modern = false
        }
        if (firstValue["pdf-ancient"]) {
            p = firstValue["pdf-ancient"]
            ancient = false
        }
    }

    const [pdf, setPdf] = useState(p)
    const [currentCodex, setCurrentCodex] = useState(id)

    const [ancientDisabled, setAncientDisabled] = useState(ancient)
    const [modernDisabled, setModernDisabled] = useState(modern)

    const [isAncientChecked, setAncientChecked] = useState(!ancient)


    const Codices = ({ genre, codices }) => {
        let content = []

        for (const [key, c] of Object.entries(codices)) {
            if (!genre || genre === c.genre) {

                content.push(
                    <div id={key} data-ancient-pdf={c["pdf-ancient"]} data-modern-pdf={c["pdf-modern"]} key={c.title} className={`library-image-component ` + (currentCodex === key ? "codex-selected" : "")} onClick={() => changeCodex(key)}>
                        <img id={key} src={spine} className="library-card-img-top" alt="book" />
                        <div id={key} className='library-centered'>{c.title}</div>
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

    const changePdf = function () {
        let element = document.getElementById(currentCodex)

        if (!element)
            return

        if (isAncientChecked) setPdf(element.dataset.modernPdf)
        else setPdf(element.dataset.ancientPdf)

        setAncientChecked(!isAncientChecked)
    }

    return (
        <>
            <div id="library-view" className="library-view">
                <div className="library-filter-view">
                    <div className="selection-view">
                        <div id="selections" className="selections">
                            <div className="form-check">
                                <input className="form-check-input" type="radio" disabled={ancientDisabled} checked={isAncientChecked} onChange={changePdf} />
                                <label className="form-check-label">{t("library-filter-ancient")}</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" disabled={modernDisabled} checked={!isAncientChecked} onChange={changePdf} />
                                <label className="form-check-label"> {t("library-filter-modern")} </label>
                            </div>
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="lightsoff" onClick={changeLightsOff} />
                                <label className="form-check-label">{t("library-filter-lightsoff")}</label>
                            </div>
                        </div>
                    </div>
                    <div id="codices-view" className="codices-view">
                        <h3>{t("library-available-codices")}</h3>
                        <select id="genreSelect" className="form-select" value={genre} onChange={changeSelect}>
                            <option value="">{t("library-genre-all")}</option>
                            <SelectGenre genres={allGenres} />
                        </select>
                        <div className="codices">
                            <Codices genre={genre} codices={allCodices} />
                        </div>
                    </div>
                </div>
                <div className="pdf-view">
                    <PdfViewer theme={theme} fileUrl={require(`./../../assets/pdf/${pdf}`)} />
                </div>
            </div>
        </>
    )
}

export default LibraryPage
import React, { useState } from "react";

import 'bootstrap/dist/css/bootstrap.css';
import "./../styles/Library.css";

import { Viewer, Worker } from '@react-pdf-viewer/core';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import { useTranslation } from "react-i18next";


import spine from "./../assets/images/spine.png"
import codices from "./../assets/codices"

import * as d3 from "d3"

// Your render function

function noSpaces(str) {
    return (str.replace(".", '')).replace(/\s+/g, '')
}


const LibraryPage = ({ layout }) => {
    const { t } = useTranslation();

    const [theme, setTheme] = useState("light")
    const [genre, setGenre] = useState(null)

    const changeSelect = function () {

        var selectBox = document.getElementById("genreSelect");

        if (!selectBox)
            return

        var selectedValue = selectBox.options[selectBox.selectedIndex].value;
        setGenre(selectedValue)
    }

    const changeLightsOff = function () {
        let element = document.getElementById('lightsoff');

        if (element.checked) {

            d3.selectAll("#view")
                .classed("lightsoff", true)

            d3.selectAll("#selections")
                .classed("lightsoff-selection", true)

            d3.selectAll("#codices-view")
                .classed("lightsoff-codices", true)

            setTheme("dark")
        }
        else {

            d3.selectAll("#view")
                .classed("lightsoff", false)

            d3.selectAll("#selections")
                .classed("lightsoff-selection", false)

            d3.selectAll("#codices-view")
                .classed("lightsoff-codices", false)

            setTheme("light")
        }
    }

    const changeCodex = function (id) {

        let element = document.getElementById(id)
        let beforeElement = document.getElementById(currentCodex)

        if (!element || !beforeElement)
            return


        console.log(document.getElementById(currentCodex).style.opacity)
        console.log(document.getElementById(id).style.opacity)
        document.getElementById(id).style.opacity = 1
        document.getElementById(currentCodex).style.opacity = 0.7
        setCurrentCodex(id)

        allCodices.forEach((c) => {
            if (noSpaces(c.title) === id) {
                setAncientDisabled(c["pdf-ancient"] ? false : true)
                setModernDisabled(c["pdf-modern"] ? false : true)

                if (isAncientChecked && c["pdf-ancient"]) {
                    setPdf(element.dataset.ancientPdf)
                    return
                }

                if (!isAncientChecked && c["pdf-modern"]) {
                    setPdf(element.dataset.modernPdf)
                    return
                }

                if (isAncientChecked && !c["pdf-ancient"] && c["pdf-modern"]) {
                    setAncientChecked(false)
                    setPdf(element.dataset.modernPdf)
                    return
                }

                if (!isAncientChecked && !c["pdf-modern"] && c["pdf-ancient"]) {
                    setAncientChecked(true)
                    setPdf(element.dataset.ancientPdf)
                    return
                }

                setPdf("blank.pdf")
                return
            }
        })
    }

    let allCodices = []
    let allGenres = []
    for (const [key, value] of Object.entries(codices)) {
        value.forEach(codex => {
            if (codex["pdf-ancient"] != null || codex["pdf-modern"] != null) {
                codex["century"] = key;
                allCodices.push(codex);
                allGenres.push(codex.genre);
            }
        })
    }

    function compare(a, b) {
        if (a.title > b.title) return 1;
        if (b.title > a.title) return -1;

        return 0;
    }

    if (allGenres) allGenres.sort()
    if (allCodices) allCodices.sort(compare)

    let p = "blank.pdf"
    let id = ""
    let ancient = true
    let modern = true


    if (allCodices && allCodices[0]) {
        if (allCodices[0]["pdf-modern"]) {
            p = allCodices[0]["pdf-modern"]
            modern = false
        }
        if (allCodices[0]["pdf-ancient"]) {
            p = allCodices[0]["pdf-ancient"]
            ancient = false
        }

        id = noSpaces(allCodices[0].title)
    }

    const [pdf, setPdf] = useState(p)
    const [currentCodex, setCurrentCodex] = useState(id)

    const [ancientDisabled, setAncientDisabled] = useState(ancient)
    const [modernDisabled, setModernDisabled] = useState(modern)

    const [isAncientChecked, setAncientChecked] = useState(!ancient)


    const Codices = ({ genre, codices }) => {
        let content = []


        codices.forEach((c) => {
            if (!genre || genre === c.genre) {

                content.push(
                    <div data-ancient-pdf={c["pdf-ancient"]} data-modern-pdf={c["pdf-modern"]} key={c.title} id={noSpaces(c.title)} className="library-image-component" onClick={() => changeCodex(noSpaces(c.title))}>
                        <img src={spine} className="library-card-img-top" alt="book" />
                        <div className='library-centered'>{c.title}</div>
                    </div>)
            }

        })

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
            <div id="view" className="view">
                <div className="filter-view">
                    <div className="selection-view">
                        <div id="selections" className="selections">
                            <div className="form-check">
                                <input className="form-check-input" type="radio" disabled={ancientDisabled} checked={isAncientChecked} onClick={changePdf} />
                                <label className="form-check-label">{t("library-filter-ancient")}</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" disabled={modernDisabled} checked={!isAncientChecked} onClick={changePdf} />
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
                        <select id="genreSelect" className="form-select" value={t("library-genre-all")} onChange={changeSelect}>
                            <option value="">{t("library-genre-all")}</option>
                            <SelectGenre genres={allGenres} />
                        </select>
                        <div className="codices">
                            <Codices genre={genre} codices={allCodices} />
                        </div>
                    </div>
                </div>
                <div className="pdf-view">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                        <Viewer theme={theme} fileUrl={require(`./../assets/pdf/${pdf}`)} plugins={[layout]} />
                    </Worker>
                </div>
            </div>
        </>
    )
}

export default LibraryPage
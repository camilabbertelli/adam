import React, { useState } from "react";

import 'bootstrap/dist/css/bootstrap.css';
import "./../styles/Library.css";

import samplePDF from "./../assets/pdf/essay.pdf";

import { Viewer, Worker } from '@react-pdf-viewer/core';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import { useTranslation } from "react-i18next";


import spine from "./../assets/images/spine.png"
import codices from "./../assets/codices"

import * as d3 from "d3"

// Your render function

function noSpaces(str){
    return (str.replace(".", '')).replace(/\s+/g, '')
}


const Codices = () => {
    let content = []
    for (const [key, value] of Object.entries(codices)) {
    value.forEach(codex => {
        codex["century"] = key;
    
        content.push(
            <div key={codex.title} id={noSpaces(codex.title)} className="library-image-component">
                <img src={spine} className="library-card-img-top" alt="book" />
                <div className='library-centered'>{codex.title}</div>
            </div>)
        })
    }

    return content
}

const LibraryPage = ({ layout }) => {
    const {t} = useTranslation();

    const [theme, setTheme] = useState("light")

    const changeLightsOff = function(){
        let element = document.getElementById('lightsoff');
        
        if (element.checked){
    
            d3.selectAll("#view")
                .classed("lightsoff", true)

            d3.selectAll("#selections")
                .classed("lightsoff-selection", true)

            d3.selectAll("#codices-view")
                .classed("lightsoff-codices", true)
            
            setTheme("dark")
        }
        else{

            d3.selectAll("#view")
                .classed("lightsoff", false)

            d3.selectAll("#selections")
                .classed("lightsoff-selection", false)

            d3.selectAll("#codices-view")
                .classed("lightsoff-codices", false)
            
            setTheme("light")
        }
    }

    return (
        <>
            <div id="view" className="view">
                <div className="filter-view">
                    <div className="selection-view">
                        <div id="selections" className="selections">
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="portuguese-mode" id="flexRadioDefault1" checked/>
                                <label class="form-check-label" for="flexRadioDefault1">{t("library-filter-ancient")}</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="portuguese-mode" id="flexRadioDefault2" disabled/>
                                <label class="form-check-label" for="flexRadioDefault2"> {t("library-filter-modern")} </label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="lightsoff" onClick={changeLightsOff}/>
                                <label class="form-check-label" for="flexSwitchCheckDefault">{t("library-filter-lightsoff")}</label>
                            </div>
                        </div>
                    </div>
                    <div id="codices-view" className="codices-view">
                        <h3>{t("library-available-codices")}</h3>
                        <select class="form-select" aria-label="Default select example">
                            <option value="0">All</option>
                            <option value="1">Crónicas e historiografia</option>
                            <option value="2">Epistologia</option>
                            <option value="3">Hagiografia</option>
                            <option value="4">Novelas de cavalaria</option>
                        </select>
                        <div className="codices">
                            <Codices />
                        </div>
                    </div>
                </div>
                <div className="pdf-view">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                        <Viewer theme={theme} fileUrl={samplePDF} plugins={[layout]} />
                    </Worker>
                </div>
            </div>
        </>
    )
}

export default LibraryPage
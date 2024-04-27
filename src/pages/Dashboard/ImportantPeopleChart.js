
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/ImportantPeopleChart.css";

import x from "./../../assets/images/dashboard/x.png"
import info from "./../../assets/images/info-black.png"
import expand from "./../../assets/images/dashboard/expand.png"
import shrink from "./../../assets/images/dashboard/shrink.png"
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import * as d3 from "d3"

function noSpaces(str) {
    if (str)
        str = str.replace(".", '')
    if (str)
        str = str.replace(/\s+/g, '')
    return str
}

const ImportantPeopleChart = (props) => {

    const { t } = useTranslation()
    const [isExpanded, setIsExpanded] = useState(false)

    const [impPeople, setImpPeople] = useState([])

    const [selectedImp, setSelectedImp] = useState([])

    function expandImp() {
        document.getElementById("overlay").style.display = (!isExpanded) ? "block" : "none";

        d3.selectAll(".imp-people-area").classed("imp-expand", !isExpanded)

        setIsExpanded(!isExpanded)
        props.setIsExpanded(!isExpanded)
    }

    useEffect(() => {
        setIsExpanded(props.isExpanded)
        d3.selectAll(".imp-people-area").classed("imp-expand", props.isExpanded)
    }, [props.isExpanded])

    useEffect(() => {
        let impData = d3.flatGroup(props.data, d => d[props.csvIndexes.subject_name])

        let impAux = {}
        impData.forEach(entry => {
            if (entry !== "")
                impAux[noSpaces(entry[0])] = {
                    name: entry[0],
                    entries: entry[1]
                }
        })


        let sortedkeys = Object.keys(impAux).sort()
        let imp = {}
        sortedkeys.forEach((key) => {
            if (key !== "")
            imp[key] = impAux[key]
        })

        setImpPeople(imp)
    }, [props.data])

    function removeSelectedImp(index) {
        let aux = [...selectedImp]
        aux.splice(index, 1)
        setSelectedImp(aux)
    }

    function changeSelected(key) {
        let entry = impPeople[key]

        let aux = [...selectedImp]

        if (aux.includes(key)) {
            aux.splice(aux.indexOf(key), 1)
        } else {
            if (aux.length === 2)
                aux.shift()
            aux.push(key)
        }

        setSelectedImp(aux)
    }

    return (
        <>
            <div className="imp-people-area shadow">
                {props.data.length > 0 &&
                    <>
                        <div className='imp-left-section'>
                            {Object.keys(impPeople).map(function (key) {
                                let entry = impPeople[key]
                                return (
                                    <button
                                        key={key} id={key}
                                        className={"imp-left-btn " + ((selectedImp.includes(key)) ? "selected-imp" : "")}
                                        onClick={() => changeSelected(key)}>
                                        {entry.name}
                                    </button>
                                )
                            })}
                        </div>
                        <div className='imp-right-section'>
                            <div className='imp-top-section'>
                                <div className='imp-title'>
                                    <h5 className='imp-top-title'>{t("imp-label")}</h5>
                                    <img alt="info" id="infoImp" src={info}
                                        style={{ marginLeft: "5px", cursor: "pointer" }} width="15px" height="15px"
                                    />
                                </div>
                                <img title={isExpanded ? t("icon-shrink") : t("icon-expand")} alt="info" src={isExpanded ? shrink : expand}
                                    style={{ position: "absolute", top: "10px", right: "15px", cursor: "pointer" }} width="15px" height="15px"
                                    onClick={expandImp}
                                />
                            </div>
                            <div className='imp-bottom-section'>
                                <div className='imp-selected-people'>
                                    <div className='imp-empty-space'></div>
                                    <div className='imp-selected-names' style={{borderRight: "1px solid #dddddd"}}>
                                        <div title={selectedImp.length > 0 ? impPeople[selectedImp[0]].name : t("imp-no-selection-label")}
                                            className={"default-selection " + (selectedImp.length ? "" : "no-selection")}
                                            key={selectedImp.length ? selectedImp[0] : "selected1"}
                                            onClick={() => removeSelectedImp(0)}>
                                            {selectedImp.length > 0 ? impPeople[selectedImp[0]].name : t("imp-no-selection-label")}
                                        </div>
                                        {selectedImp.length > 0 && <img title={t("icon-close")} className={"imp-x"} alt="x" src={x} width="15px" height="15px" onClick={() => removeSelectedImp(0)} />}
                                    </div>
                                    <div className='imp-selected-names'>
                                        <div title={selectedImp.length === 2 ? impPeople[selectedImp[1]].name : t("imp-no-selection-label")}
                                            className={"default-selection " + (selectedImp.length === 2 ? "" : "no-selection")}
                                            key={selectedImp.length === 2 ? selectedImp[1] : "selected2"}
                                            onClick={() => removeSelectedImp(0)}>
                                            {selectedImp.length === 2 ? impPeople[selectedImp[1]].name : t("imp-no-selection-label")}
                                        </div>
                                        {selectedImp.length === 2 && <img title={t("icon-close")} className={"imp-x"} alt="x" src={x} width="15px" height="15px" onClick={() => removeSelectedImp(1)} />}
                                    </div>
                                </div>
                                <div className='imp-selected-section'>
                                    
                                </div>

                            </div>
                        </div>
                    </>}
                {props.data.length === 0 && <>
                    <div style={{ display: 'flex', flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>

                        <div style={{ display: 'flex', flexDirection: "row", justifyContent: "center", width: "100%", height: "15%" }}>
                            <div className='imp-title'>

                                <h5 className='imp-top-title'>{t("imp-label")}</h5>
                                <img alt="info" id="infoImp" src={info}
                                    style={{ marginLeft: "5px", cursor: "pointer" }} width="15px" height="15px"
                                />
                            </div>
                            <img title={isExpanded ? t("icon-shrink") : t("icon-expand")} alt="info" src={isExpanded ? shrink : expand}
                                style={{ position: "absolute", top: "10px", right: "15px", cursor: "pointer" }} width="15px" height="15px"
                                onClick={expandImp}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
                            {t("no-data-to-show")}
                        </div>
                    </div>
                </>}
            </div>
        </>
    )
}

export default ImportantPeopleChart;
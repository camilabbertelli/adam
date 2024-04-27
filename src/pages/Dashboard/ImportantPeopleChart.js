
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
        str = str.replace(/[\s+&\/\\#,+()$~%.'":*?<>{};]/g, '');
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

        let aux = [...selectedImp]
        if (selectedImp.length > 0 && !sortedkeys.includes(selectedImp[0])) aux.splice(0, 1)
        if (selectedImp.length === 2 && !sortedkeys.includes(selectedImp[1])) aux.splice(aux.indexOf(selectedImp[1]), 1)

        setSelectedImp(aux)
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
                                        key={key}
                                        id={`imp-${noSpaces(key)}`}
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
                                    <div className='imp-selected-names'>

                                        <div title={selectedImp.length > 0 ? impPeople[selectedImp[0]].name : t("imp-no-selection-label")}
                                            className={"default-selection " + (selectedImp.length ? "" : "no-selection")}
                                            key={selectedImp.length ? selectedImp[0] : "selected1"}
                                            onClick={() => removeSelectedImp(0)}>

                                            <span style={{ width: "calc(100%)", display: "inline-block", verticalAlign: "middle", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {selectedImp.length > 0 ? impPeople[selectedImp[0]].name : t("imp-no-selection-label")}
                                            </span>
                                        </div>
                                        {selectedImp.length > 0 && <img title={t("icon-close")} className={"imp-x"} alt="x" src={x} width="15px" height="15px" onClick={() => removeSelectedImp(0)} />}
                                    </div>
                                    <div className='imp-selected-names'>
                                        <div title={selectedImp.length === 2 ? impPeople[selectedImp[1]].name : t("imp-no-selection-label")}
                                            className={"default-selection " + (selectedImp.length === 2 ? "" : "no-selection")}
                                            key={selectedImp.length === 2 ? selectedImp[1] : "selected2"}
                                            onClick={() => removeSelectedImp(0)}>
                                            <span style={{ width: "calc(100%)", display: "inline-block", verticalAlign: "middle", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {selectedImp.length === 2 ? impPeople[selectedImp[1]].name : t("imp-no-selection-label")}
                                            </span>
                                        </div>
                                        {selectedImp.length === 2 && <img title={t("icon-close")} className={"imp-x"} alt="x" src={x} width="15px" height="15px" onClick={() => removeSelectedImp(1)} />}
                                    </div>
                                </div>
                                <div className='imp-selected-section'>
                                    <table width={"100%"} key={`table-imp`}>
                                        <tbody key={`tbody-imp`}>
                                            {Object.keys(props.csvIndexes).map((key, index) => {
                                                if (key === "#" || key === "description" || key === "subject_name")
                                                    return ""

                                                let selectArray1 = []
                                                let selectArray2 = []

                                                if (selectedImp.length > 0) {
                                                    impPeople[selectedImp[0]].entries.forEach((entry) => {
                                                        selectArray1.push(entry[index])
                                                    })

                                                    selectArray1 = [...new Set(selectArray1)].sort()
                                                }

                                                if (selectedImp.length === 2) {
                                                    impPeople[selectedImp[1]].entries.forEach((entry) => {
                                                        selectArray2.push(entry[index])
                                                    })

                                                    selectArray2 = [...new Set(selectArray2)].sort()
                                                }

                                                return (
                                                    <tr className="imp-table" key={`tr-${key}`}>
                                                        <th className="imp-th">{key}</th>
                                                        <td className="imp-td" style={{ borderRight: "1px solid #dddddd" }}>
                                                            {selectArray1.map(function (text, i) {
                                                                if (text === "")
                                                                    return ""

                                                                if (selectArray2.includes(text)) {
                                                                    if ((selectArray1.length - 1) === i)
                                                                        return (<span className='imp-same-content'>{text} </span>)
                                                                    return (<span><span className='imp-same-content'>{text}</span> | </span>)
                                                                }

                                                                if ((selectArray1.length - 1) === i)
                                                                    return (`${text}`)

                                                                return (`${text} | `)
                                                            })}
                                                            {selectArray1.length === 0 && "-"}
                                                        </td>
                                                        <td className="imp-td">
                                                            {selectArray2.map(function (text, i) {
                                                                if (text === "")
                                                                    return ""

                                                                if (selectArray1.includes(text)) {
                                                                    if ((selectArray2.length - 1) === i)
                                                                        return (<span className='imp-same-content'>{text}</span>)
                                                                    return (<span><span className='imp-same-content'>{text}</span> | </span>)
                                                                }

                                                                if ((selectArray2.length - 1) === i)
                                                                    return (`${text}`)
                                                                
                                                                return (`${text} | `)
                                                            })}
                                                            {selectArray2.length === 0 && "-"}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
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

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
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

const ImportantPeopleChart = (props) => {

    let tooltipImp;

    const { t } = useTranslation()
    const [isExpanded, setIsExpanded] = useState(false)

    const [impPeople, setImpPeople] = useState([])
    const [searchedPeople, setSearchedPeople] = useState([])
    const [selectedImp, setSelectedImp] = useState([null, null])

    const [data, setData] = useState([])
    
    function expandImp() {
        document.getElementById("overlay").style.display = (!isExpanded) ? "block" : "none";

        d3.selectAll(".imp-people-area").classed("imp-expand", !isExpanded)

        setIsExpanded(!isExpanded)
        props.setIsExpanded(!isExpanded)
    }

    function highlightNode(networkKey) {

        let selectionNetwork = d3.select(`#network-${networkKey}`);
        let elementNetwork = selectionNetwork.node();

        if (elementNetwork) {
            elementNetwork.scrollIntoView({ block: "center" });
            selectionNetwork.transition().duration(500).attr("r", 100)
        }

        setTimeout(() => {
            selectionNetwork.transition().duration(500).attr("r", 15)
        }, 2000);
    }

    useEffect(() => {
        setIsExpanded(props.isExpanded)
        d3.selectAll(".imp-people-area").classed("imp-expand", props.isExpanded)
    }, [props.isExpanded])

    useEffect(() => {

        let dataInitial = props.data.filter(entry => {
            let networkFilter = true
            let pyramidFilter = true
            let detailsFilter = true
            let sexes = ["Mult.", "N", props.pyramidData.sex]

            if (props.networkData.people.length)
                networkFilter = (props.networkData.people.includes(entry[props.csvIndexes.subject_name]))

            if (props.pyramidData.sex)
                pyramidFilter = sexes.includes(entry[props.csvIndexes.subject_sex])

            if (props.pyramidData.category)
                pyramidFilter = pyramidFilter && entry[props.pyramidData.categoryIndex] === props.pyramidData.category

            if (Object.keys(props.heatmapData).length)
                detailsFilter = entry[props.heatmapData.searchKey1] === props.heatmapData.key1 &&
                    entry[props.heatmapData.searchKey2] === props.heatmapData.key2

            return networkFilter && pyramidFilter && detailsFilter
        })

        let impData = d3.flatGroup(dataInitial, d => d[props.csvIndexes.subject_name])

        let impAux = {}
        impData.forEach(entry => {
            impAux[noSpaces(entry[0])] = {
                name: entry[0],
                entries: entry[1]
            }
        })

        let sortedkeys = Object.keys(impAux).sort()
        let imp = {}
        sortedkeys.forEach((key) => {
            if (key !== "" && impAux[key].entries.length)
                imp[key] = impAux[key]
        })
        sortedkeys.filter(key => key !== "")

        let aux = [...selectedImp]

        if (!sortedkeys.includes(selectedImp[0])) aux[0] = null
        if (!sortedkeys.includes(selectedImp[1])) aux[1] = null

        if (props.resetComponents) {

            aux = [null, null]
			props.setResetComponents(false)
            
            let element = document.getElementById('imp-search-bar')
            element.value = ""
		}

        setSelectedImp(aux)
        setData(dataInitial)
        setImpPeople(imp)
        setSearchedPeople(Array.from(Object.keys(imp)))
    }, [props.data, props.networkData, props.pyramidData, props.heatmapData, props.resetComponents])

    function removeSelectedImp(index) {
        let aux = [...selectedImp]
        aux[index] = null
        setSelectedImp(aux)
    }

    function changeSelected(key) {

        let aux = [...selectedImp]

        if (aux.includes(key))
            aux[aux.indexOf(key)] = null
        else {
            if (aux[0] === null) {
                aux[0] = key
                highlightNode(key)
            }
            else if (aux[1] === null) {
                aux[1] = key
                highlightNode(key)
            }
            else {
                d3.selectAll(".default-selection").transition().duration(500)
                    .style("background-color", "#bfa3a3")

                setTimeout(() => {
                    d3.selectAll(".default-selection").transition().duration(500)
                        .style("background-color", "white")
                }, 1000);
            }

        }

        setSelectedImp(aux)
    }

    useEffect(() => {

        let infoMouseOverImp = function (event, d) {
            tooltipImp
                .style("opacity", 1);

            tooltipImp.html(`<center><b>${t("information")}</b></center>
						  ${t("information-imp")}`)
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px")
        }


        let infoMouseLeaveImp = function (event, d) {
            tooltipImp
                .style("opacity", 0)

            let element = document.getElementById('tooltipImp')
            if (element)
                element.innerHTML = "";
        }

        d3.selectAll("#tooltipImp").remove();
        // create a tooltipImp
        tooltipImp = d3.select("body")
            .append("div")
            .attr("id", "tooltipImp")
            .attr("class", "tooltip shadow rounded")
            .attr("padding", "1px")
            .style("opacity", "0")

        d3.select("#infoImp")
            .on("mouseover", infoMouseOverImp)
            .on("mouseleave", infoMouseLeaveImp)

    }, [impPeople]);

    useEffect(() => {
        d3.selectAll("#tooltipImp").remove();
        // create a tooltipImp
        tooltipImp = d3.select("body")
            .append("div")
            .attr("id", "tooltipImp")
            .attr("class", "tooltip shadow rounded")
            .attr("padding", "1px")
            .style("opacity", "0")
            
        let mouseover = function (event, d) {
            tooltipImp
                .style("opacity", "1");
        }

        let mousemove = function (event, d){

            let span = d3.select(this).node()
            let parent = span.parentElement
            let parentId = parent.id

            let [person, key] = parentId.split("|")

            if (person === "undefined" || person === "null") {
                tooltipImp
                    .style("opacity", "0")
                return
            } 

            var spanText = span.innerText;
            let parentData = parent.getAttribute("data-dict")
            parentData = JSON.parse(parentData)

            tooltipImp
                .html(
                    `<b>${t("imp-tooltip-person")}: </b>${impPeople[person].name}<br/>
                         <b>${t("imp-tooltip-field")}: </b>${key} <br/><br/>
                         <b>${t("imp-tooltip-value")}: </b>${spanText} <br/>
                         <b>${t("heatmap-occurrence")}: </b>${parentData[spanText]} <br/>`)
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px")

            let tooltip_rect = tooltipImp.node().getBoundingClientRect();
            if (tooltip_rect.x + tooltip_rect.width > window.innerWidth) {
                tooltipImp.style("left", event.pageX - 20 - tooltip_rect.width + "px")
                tooltipImp.style("top", event.pageY + 10 + "px")
            }

            tooltip_rect = tooltipImp.node().getBoundingClientRect();
            if (tooltip_rect.y + tooltip_rect.height > window.innerHeight) {
                tooltipImp.style("left", tooltip_rect.left - 10 - tooltip_rect.width + "px")
                tooltipImp.style("top", event.pageY + 20 - tooltip_rect.height + "px")
            }
        }

        let mouseleave = function (event, d) {
            tooltipImp
                .style("opacity", "0")

            let element = document.getElementById('tooltipImp')
            if (element)
                element.innerHTML = "";
        }

        d3.selectAll(`.individual-term`)
        .attr("user-select", "none")
            .style("cursor", "pointer")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
    }, [selectedImp])

    function changeSearchInput() {
        let element = document.getElementById('imp-search-bar')
        let search = element.value

        if (search === "") {
            setSearchedPeople(Array.from(Object.keys(impPeople)))
            return
        }

        let searchedKeys = []

        Array.from(Object.keys(impPeople)).forEach(key => {
            let entry = impPeople[key]
            if (entry.name.toLowerCase().includes(search.toLowerCase()))
                searchedKeys.push(key)
        })

        setSearchedPeople(searchedKeys)
    }

    return (
        <>
            <div className="imp-people-area shadow">
                {data.length > 0 &&
                    <>
                        <div className='imp-left-section'>
                            <input id="imp-search-bar" type='text' className='imp-search-bar' placeholder={t("search-imp-placeholder")} text="" onChange={() => changeSearchInput()} />
                            <div className='imp-left-section-inside'>
                                {Array.from(searchedPeople).map(key => {
                                    let entry = impPeople[key]
                                    return (
                                        <button
                                            key={key}
                                            id={`imp-${noSpaces(key)}`}
                                            className={"imp-left-btn" + ((selectedImp.includes(key)) ? " selected-imp" : "") + ((props.networkData.selected.includes(entry.name)) ? " network-selected-imp" : "")}
                                            onClick={() => changeSelected(key)}>
                                            {entry.name}
                                        </button>
                                    )
                                })}
                            </div>
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

                                        <div title={selectedImp[0] ? impPeople[selectedImp[0]].name : t("imp-no-selection-label")}
                                            className={"default-selection " + (selectedImp[0] ? "shadow-imp" : "no-selection")}
                                            key={selectedImp[0] ? selectedImp[0] : "selected1"}
                                            onClick={() => removeSelectedImp(0)}>

                                            <span style={{ width: "calc(100%)", display: "inline-block", verticalAlign: "middle", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {selectedImp[0] ? impPeople[selectedImp[0]].name : t("imp-no-selection-label")}
                                            </span>
                                        </div>
                                        {selectedImp[0] && <img title={t("icon-close")} className={"imp-x"} alt="x" src={x} width="15px" height="15px" onClick={() => removeSelectedImp(0)} />}
                                    </div>
                                    <div className='imp-selected-names'>
                                        <div title={selectedImp[1] ? impPeople[selectedImp[1]].name : t("imp-no-selection-label")}
                                            className={"default-selection " + (selectedImp[1] ? "shadow-imp" : "no-selection")}
                                            key={selectedImp[1] ? selectedImp[1] : "selected2"}
                                            onClick={() => removeSelectedImp(1)}>
                                            <span style={{ width: "calc(100%)", display: "inline-block", verticalAlign: "middle", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {selectedImp[1] ? impPeople[selectedImp[1]].name : t("imp-no-selection-label")}
                                            </span>
                                        </div>
                                        {selectedImp[1] && <img title={t("icon-close")} className={"imp-x"} alt="x" src={x} width="15px" height="15px" onClick={() => removeSelectedImp(1)} />}
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

                                                let selectDict1 = {}
                                                let selectDict2 = {}

                                                if (selectedImp[0]) {
                                                    impPeople[selectedImp[0]].entries.forEach((entry) => {
                                                        selectDict1[entry[index]] = (selectDict1[entry[index]] === undefined ? 1 : selectDict1[entry[index]] + 1)
                                                    })

                                                    selectArray1 = [...new Set(Object.keys(selectDict1))].sort()
                                                }

                                                if (selectedImp[1]) {
                                                    impPeople[selectedImp[1]].entries.forEach((entry) => {
                                                        selectDict2[entry[index]] = (selectDict2[entry[index]] === undefined ? 1 : selectDict2[entry[index]] + 1)
                                                    })

                                                    selectArray2 = [...new Set(Object.keys(selectDict2))].sort()
                                                }

                                                return (
                                                    <tr className="imp-table" key={`tr-${key}`}>
                                                        <th className="imp-th">{key}</th>
                                                        <td data-dict={JSON.stringify({ ...selectDict1 })} className="imp-td" id={`${selectedImp[0]}|${key}`} style={{ borderRight: "1px solid #dddddd" }}>
                                                            {selectArray1.map(function (text, i) {
                                                                if (text === "")
                                                                    return ""

                                                                if (selectArray2.includes(text)) {
                                                                    if ((selectArray1.length - 1) === i)
                                                                        return (<span className='individual-term imp-same-content'>{text}</span>)
                                                                    return (<><span className='individual-term imp-same-content'>{text} |</span><span> | </span></>)
                                                                }

                                                                if ((selectArray1.length - 1) === i)
                                                                    return (<span className='individual-term'>{text}</span>)

                                                                return (<><span className='individual-term'>{text}</span><span> | </span></>)
                                                            })}
                                                            {selectArray1.length === 0 && "-"}
                                                        </td>
                                                        <td data-dict={JSON.stringify({ ...selectDict2 })} className="imp-td" id={`${selectedImp[1]}|${key}`}>
                                                            {selectArray2.map(function (text, i) {
                                                                if (text === "")
                                                                    return ""

                                                                if (selectArray1.includes(text)) {
                                                                    if ((selectArray2.length - 1) === i)
                                                                        return (<span className='individual-term imp-same-content'>{text}</span>)
                                                                    return (<><span className='individual-term imp-same-content'>{text} |</span><span> | </span></>)
                                                                }

                                                                if ((selectArray2.length - 1) === i)
                                                                    return (<span className='individual-term'>{text}</span>)

                                                                return (<><span className='individual-term'>{text}</span><span> | </span></>)
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
                {data.length === 0 && <>
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
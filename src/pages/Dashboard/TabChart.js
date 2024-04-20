
import React, { useEffect } from "react";
import { useState } from "react"
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/TabChart.css"


import info from "./../../assets/images/info-black.png"
import group from "./../../assets/images/dashboard/group.png"
import separate from "./../../assets/images/dashboard/separate.png"
import sorting_icon from "./../../assets/images/dashboard/sorting.png"

import expand from "./../../assets/images/dashboard/expand.png"
import shrink from "./../../assets/images/dashboard/shrink.png"

import * as d3 from "d3";
import { useTranslation } from "react-i18next";

var tooltipPyramid;

// Define margin and dimensions for the charts
const margin = {
    top: 20,
    right: 20,
    bottom: 50,
    left: 80,
};

const TabContent = (props) => {

    const [isExpanded, setIsExpanded] = useState(false)

	function expandTabChart(){

		document.getElementById("overlay").style.display = (!isExpanded)? "block" : "none";

		d3.selectAll(".tab-chart-area").classed("tabchart-expand", !isExpanded)

		setIsExpanded(!isExpanded)
		props.setIsExpanded(!isExpanded)
	}

	useEffect(() => {
		setIsExpanded(props.isExpanded)
		d3.selectAll(".tab-chart-area").classed("tabchart-expand", props.isExpanded)
	}, [props.isExpanded])

    const {t} = useTranslation()

    const [styleDropdown, setStyleDropdown] = useState(false);

    const [totalOccurrences, setTotalOccurrences] = useState(false)
    const [changedTotal, setChangedTotal] = useState(false)

    let globalData = d3.flatRollup(props.data, v => ({
        participants_total: v.length,
    }), (d) => d.title, (d) => d.subject_sex, (d) => d.anatomical_part, (d) => d.organs)

    let pyramidData = {}

    if (props.category === "Body&Soul")
        pyramidData = d3.rollup(globalData, v => ({
            participants_total: v.length,
            anatomical_part: d3.group(v, d => d[2]),
            organs: d3.group(v, d => d[3])
        }), d => d[1])


    if (props.category === "Emotions")
        pyramidData = d3.rollup(globalData, v => ({
            participants_total: v.length,
            anatomical_part: d3.group(v, d => d[3]),
            organs: d3.group(v, d => d[3])
        }), d => d[1])

    let dimensions_original = [...new Set([...pyramidData.get("Masc.").anatomical_part.keys(),
    ...pyramidData.get("Fem.").anatomical_part.keys(),
    ...pyramidData.get("Mult.").anatomical_part.keys(),
    ...pyramidData.get("N").anatomical_part.keys()])]

    let dimensions = dimensions_original.sort()

    let participants_total = 1

    if (getParticipantsTotal() !== 0)
        participants_total = getParticipantsTotal()

    function getParticipantsTotal() {
        return pyramidData.get("Masc.").participants_total +
            pyramidData.get("Fem.").participants_total +
            pyramidData.get("N").participants_total +
            pyramidData.get("Mult.").participants_total
    }

    function getParticipants(type, d) {

        let sum = 0
        if (type === "Total") {
            if (pyramidData.get("Masc.").anatomical_part.get(d)) sum += pyramidData.get("Masc.").anatomical_part.get(d).length
            if (pyramidData.get("Fem.").anatomical_part.get(d)) sum += pyramidData.get("Fem.").anatomical_part.get(d).length
            if (pyramidData.get("Mult.").anatomical_part.get(d)) sum += pyramidData.get("Mult.").anatomical_part.get(d).length
            if (pyramidData.get("N").anatomical_part.get(d)) sum += pyramidData.get("N").anatomical_part.get(d).length
        } else if (pyramidData.get(type).anatomical_part.get(d)) sum += pyramidData.get(type).anatomical_part.get(d).length

        if (pyramidData.get("Mult.").anatomical_part.get(d)) sum += pyramidData.get("Mult.").anatomical_part.get(d).length
        if (pyramidData.get("N").anatomical_part.get(d)) sum += pyramidData.get("N").anatomical_part.get(d).length

        return sum
    }

    let infoMouseOverPyramid = function (event, d) {
        tooltipPyramid
            .style("opacity", 1);

            tooltipPyramid.html(`<center><b>${t("information")}</b></center>
                      ${t("information-pyramid")}`)
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px")
    }


    let infoMouseLeavePyramid = function (event, d) {
        tooltipPyramid
            .style("opacity", 0)

        let element = document.getElementById('tooltipPyramid')
        if (element)
            element.innerHTML = "";
    }

    // tooltipPyramid events
    const mouseover = function (d) {
        tooltipPyramid.style("opacity", 1)
        d3.select(this).style("stroke-width", 1)
    };

    const mousemove = function (event, d, type) {
        var previousElement = d3.select(".barMasc");
        var isTotal = false

        if (previousElement) {
            var color = d3.rgb(previousElement.style("fill"))
            isTotal = (color.r === 147 && color.g === 89 && color.b === 89)
        }

        if (isTotal) type = "Total"

        let data = getParticipants(type, d)

        tooltipPyramid
            .html(`<center><b>${d} - ${type}</b></center>
                    Percentage: ${d3.format(".1f")((data / participants_total) * 100)}%<br>
                    Occurrence: ${data}`)
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px");
    }

    const mouseleave = function (d) {
        tooltipPyramid.style("opacity", 0)

        let element = document.getElementById('tooltipPyramid')
        if (element) element.innerHTML = "";

        d3.select(this).style("stroke-width", 0)
    };


    useEffect(() => {
        let box = document.querySelector('.pyramid-content');

        let boundaries = box.getBoundingClientRect()
        let width = boundaries.width * 0.9;
        let barsWidth = width / 3

        let scrollableHeight = dimensions.length * 30

        d3.selectAll("#tooltipPyramid").remove();

        tooltipPyramid = d3.select("body")
            .append("div")
            .attr("id", "tooltipPyramid")
            .attr("class", "tooltip shadow rounded")
            .attr("padding", "1px")
            .style("opacity", 0);

        d3.select("#infoPyramid")
            .on("mouseover", infoMouseOverPyramid)
            .on("mouseleave", infoMouseLeavePyramid)

        d3.select(".pyramid-axes-content").html("");

        const axes = d3
            .select(".pyramid-axes-content")
            .append("svg")
            .attr("width", width)
            .attr("transform", `translate(${barsWidth},0)`);

        let maxMasc = d3.max(dimensions, d => getParticipants("Masc.", d) / participants_total)
        let maxFem = d3.max(dimensions, d => getParticipants("Fem.", d) / participants_total)
        let maxScale = (totalOccurrences) ? d3.max(dimensions, d => getParticipants("Total", d) / participants_total) : Math.max(maxMasc, maxFem)
        let factor = maxScale > 0.1 ? 0.05 : 0.01

        // Y scale
        let yScale = d3.scaleBand()
            .domain(dimensions)
            .range([0, scrollableHeight])
            .padding(.3);

        // X scale
        let xScaleMasc = d3.scaleLinear()
            .domain([0, ((maxScale + factor) > 1 ? 1 : maxScale + factor)])
            .range(totalOccurrences ? [5, barsWidth * 2] : [barsWidth, 0]);

        let xScaleFem = d3.scaleLinear()
            .domain([0, ((maxScale + factor) > 1 ? 1 : maxScale + factor)])
            .range([barsWidth, barsWidth * 2]);

        axes.append("g")
            .attr("id", "axismale")
            .call(d3.axisBottom(xScaleMasc).tickSize(0).tickPadding(2).ticks(5, "%").tickFormat(x => { if (x === 0) return 0; else return `${(+(x * 100).toFixed(1))}%` }))
            .call(function (d) { return d.select(".domain").remove() });

        axes
            .append("rect")
            .attr("class", "squareMasc")
            .attr("x", (totalOccurrences) ? barsWidth / 2 : 0)
            .attr("y", margin.top)
            .attr("width", 13)
            .attr("height", 13)
            .style("fill", (totalOccurrences) ? "#935959" : "#7BB3B7")
        //.on("click", mouseclickmale)

        axes
            .append("text")
            .attr("class", "legend")
            .attr("x", ((totalOccurrences) ? barsWidth / 2 : 0) + 20)
            .attr("y", margin.top + 12)
            .text((totalOccurrences) ? "Total" : "Masc.")

        if (!totalOccurrences) {
            axes.append("g")
                .attr("id", "axisfemale")
                .call(d3.axisBottom(xScaleFem).tickSize(0).tickPadding(2).ticks(5, "%").tickFormat(x => { if (x === 0) return; else return `${(+(x * 100).toFixed(1))}%` }))
                .call(function (d) { return d.select(".domain").remove() });

            axes
                .append("rect")
                .attr("class", "squareFem")
                .attr("x", width / 2)
                .attr("y", margin.top)
                .attr("width", 13)
                .attr("height", 13)
                .style("fill", "#DA9C80")
            //.on("click", mouseclickfemale)

            axes
                .append("text")
                .attr("class", "legend")
                .attr("x", width / 2 + 20)
                .attr("y", margin.top + 12)
                .text("Fem.")
        }

        /* svg bars */
        d3.selectAll(".pyramid-subcategory-axis").remove()
        d3.select("#gridm").remove()
        d3.select("#gridf").remove()

        let svg = null

        if (changedTotal) {

            svg = d3.select(".pyramid-content").select("svg").select("g")

            const maleBars = svg.selectAll(".barMasc")
            const femaleBars = svg.selectAll(".barFem")

            if (totalOccurrences) {
                maleBars
                    .transition()
                    .duration(1000)
                    .attr("x", d => xScaleMasc(0))
                    .attr("y", d => yScale(d))
                    .attr("width", d => xScaleMasc(getParticipants("Total", d) / participants_total))
                    .attr("height", yScale.bandwidth())
                    .style("fill", "#935959")

                femaleBars
                    .transition()
                    .duration(1000)
                    .attr("width", 0)
            }
            else {
                maleBars
                    .transition()
                    .duration(1000)
                    .attr("class", "barMasc")
                    .attr("x", d => xScaleMasc(getParticipants("Masc.", d) / participants_total))
                    .attr("y", d => yScale(d))
                    .attr("width", d => barsWidth - xScaleMasc(getParticipants("Masc.", d) / participants_total))
                    .attr("height", yScale.bandwidth())
                    .style("fill", "#7BB3B7")

                femaleBars
                    .transition()
                    .duration(1000)
                    .attr("class", "barFem")
                    .attr("x", xScaleFem(0))
                    .attr("y", d => yScale(d))
                    .attr("width", d => xScaleFem(getParticipants("Fem.", d) / participants_total) - xScaleFem(0))
                    .attr("height", yScale.bandwidth())
                    .style("fill", "#DA9C80")
            }
        } else {

            d3.select(".pyramid-content").html("")
            svg = d3
                .select(".pyramid-content")
                .append("svg")
                .attr("width", width)
                .attr("height", scrollableHeight)
                .append("g")
                .attr("transform", `translate(${barsWidth},0)`);

            // create male bars
            svg.selectAll(".barMasc")
                .data(dimensions)
                .join("rect")
                .attr("class", "barMasc")
                .attr("x", d => (totalOccurrences) ? xScaleMasc(0) : (xScaleMasc(getParticipants("Masc.", d) / participants_total)))
                .attr("y", d => yScale(d))
                .attr("width", d => (totalOccurrences) ?
                    xScaleMasc(getParticipants("Total", d) / participants_total) :
                    (barsWidth - xScaleMasc(getParticipants("Masc.", d) / participants_total)))
                .attr("height", yScale.bandwidth())
                .style("fill", (totalOccurrences) ? "#935959" : "#7BB3B7")
                .style("stroke", "black")
                .style("stroke-width", 0)
                .on("mouseover", mouseover)
                .on("mousemove", (event, d) => mousemove(event, d, "Masc."))
                .on("mouseleave", mouseleave)
            //.on("click", mouseclickmale)

            svg.selectAll(".barFem")
                .data(dimensions)
                .join("rect")
                .attr("class", "barFem")
                .attr("x", xScaleFem(0))
                .attr("y", d => yScale(d))
                .attr("width", (totalOccurrences) ? 0 : d => xScaleFem(getParticipants("Fem.", d) / participants_total) - xScaleFem(0))
                .attr("height", yScale.bandwidth())
                .style("fill", "#DA9C80")
                .style("stroke", "black")
                .style("stroke-width", 0)
                .on("mouseover", mouseover)
                .on("mousemove", (event, d) => mousemove(event, d, "Fem."))
                .on("mouseleave", mouseleave)
            //.on("click", mouseclickfemale)
        }

        svg.append("g")
            .attr("class", "pyramid-subcategory-axis")
            .selectAll("text")
            .data(dimensions)
            .join("text")
            .text((d) => d)
            .attr("x", 0)
            .attr("text-anchor", "end")
            .attr("y", d => yScale(d) + 15);

        const GridLineM = function () { return d3.axisBottom().scale(xScaleMasc) };
        svg.append("g")
            .attr("id", "gridm")
            .attr("class", "grid")
            .call(GridLineM()
                .tickSize(scrollableHeight, 0, 0)
                .tickFormat("")
                .ticks(7)
            )

        // set vertical grid line
        const GridLineF = function () { return d3.axisBottom().scale(xScaleFem) };
        if (!totalOccurrences)
            svg.append("g")
                .attr("id", "gridf")
                .attr("class", "grid")
                .call(GridLineF()
                    .tickSize(scrollableHeight, 0, 0)
                    .tickFormat("")
                    .ticks(7)
                );

        setChangedTotal(false)

    }, [props.category, totalOccurrences])

    const changeTotalOccurrence = () => {
        setTotalOccurrences(!totalOccurrences)
        setChangedTotal(true)
    }

    const changeStyle = () => {
        d3.selectAll("#tabchart-dropdown-icon").classed("tabchart-dropdown-content-show", !styleDropdown)
        //"tabchart-dropdown-content-hide"
        
        setStyleDropdown(!styleDropdown);
    };

    const [currentSorting, setCurrentSorting] = useState("name_asc")

    function sort_name_asc(a, b) {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }

    function sort_name_desc(a, b) {
        return -sort_name_asc(a, b);
    }

    function sort_masc_asc(a, b) {
        return getParticipants("Masc.", a) - getParticipants("Masc.", b)
    }

    function sort_masc_desc(a, b) {
        return -sort_masc_asc(a, b);
    }

    function sort_fem_asc(a, b) {
        return getParticipants("Fem.", a) - getParticipants("Fem.", b)
    }

    function sort_fem_desc(a, b) {
        return -sort_fem_asc(a, b);
    }


    function sort_total_asc(a, b) {
        return getParticipants("Total", a) - getParticipants("Total", b)
    }

    function sort_total_desc(a, b) {
        return -sort_total_asc(a, b);
    }

    const changeSorting = (s) => {

        let sorting = sort_name_asc

        if (s === "name_desc")
            sorting = sort_name_desc
        else if (s === "masc_asc")
            sorting = sort_masc_asc
        else if (s === "masc_desc")
            sorting = sort_masc_desc
        else if (s === "fem_asc")
            sorting = sort_fem_asc
        else if (s === "fem_desc")
            sorting = sort_fem_desc
        else if (s === "total_asc")
            sorting = sort_total_asc
        else if (s === "total_desc")
            sorting = sort_total_desc

        dimensions = [...dimensions_original.sort(sorting)]

        let scrollableHeight = dimensions.length * 30
        // Y scale
        let yScale = d3.scaleBand()
            .domain(dimensions)
            .range([0, scrollableHeight])
            .padding(.3);


        d3.select(".pyramid-subcategory-axis")
            .selectAll("text")
            .sort(sorting)
            .attr("y", d => yScale(d) + 15);

        d3.selectAll(".barMasc")
            .sort(sorting)
            .attr("y", d => yScale(d));

        d3.selectAll(".barFem")
            .sort(sorting)
            .attr("y", d => yScale(d));

        setCurrentSorting(s)
        setStyleDropdown(false);
    }

    return (<>
        <div id="tab-content" className="tab-chart-area-content shadow">
            <div className="titles" id="pyramidTitle">
                <h5 className="pyramid-title">{(totalOccurrences) ? t("pyramid-total") : t("pyramid-separate")}</h5>
                <img alt="info" id="infoPyramid" src={info}
                    style={{ "marginLeft": 5 + "px" }} width="15" height="15"
                />

            </div>
            <div className="pyramid-filters">
            <img title={(totalOccurrences)? t("icon-separate") : t("icon-group")} alt="total" src={(totalOccurrences) ? separate : group }
                    style={{ "marginRight": "5%", float: "right", cursor: "pointer" }} width="20" height="20"
                    onClick={changeTotalOccurrence}
                />

                <div id="tabchart-dropdown" className='tabchart-dropdown'>
                    <button className='tabchart-dropbtn' onClick={changeStyle}>
                        <img title={t("icon-sort")} alt="total" src={sorting_icon}
                            style={{ "marginLeft": 5 + "px" }} className="tabchart-sorting-icon"
                            
                        /></button>
                    <div id="tabchart-dropdown-icon" className={"shadow tabchart-dropdown-content-hide"}>
                        <button className={currentSorting === "name_asc" ? "sorting-active" : ""} onClick={() => changeSorting("name_asc")}> Name (ascending) </button>
                        <button className={currentSorting === "name_desc" ? "sorting-active" : ""} onClick={() => changeSorting("name_desc")}> Name (descending) </button>

                        {!totalOccurrences && <>
                            <button className={currentSorting === "masc_asc" ? "sorting-active" : ""} onClick={() => changeSorting("masc_asc")}> Masc. - Low to High </button>
                            <button className={currentSorting === "masc_desc" ? "sorting-active" : ""} onClick={() => changeSorting("masc_desc")}> Masc. - High to Low </button>
                            <button className={currentSorting === "fem_asc" ? "sorting-active" : ""} onClick={() => changeSorting("fem_asc")}> Fem. - Low to High </button>
                            <button className={currentSorting === "fem_desc" ? "sorting-active" : ""} onClick={() => changeSorting("fem_desc")}> Fem. - High to Low </button>
                        </>}

                        {totalOccurrences && <>
                            <button className={currentSorting === "total_asc" ? "sorting-active" : ""} onClick={() => changeSorting("total_asc")}> Total - Low to High </button>
                            <button className={currentSorting === "total_desc" ? "sorting-active" : ""} onClick={() => changeSorting("total_desc")}> Total - High to Low </button>
                        </>}
                    </div>
                </div>

            </div>
            <div className="pyramid-content">
            </div>
            <div className="pyramid-axes-content">
            </div>
        </div>
    </>)
}

const TabChart = (props) => {
    // TODO: change thisss to props
    let categories = ["Body&Soul", "Emotions"]
    const [currentCategory, setCurrentCategory] = useState(categories[0])

    window.addEventListener('click', function (e) {
        if (document.getElementById('tabchart-dropdown') && !document.getElementById('tabchart-dropdown').contains(e.target))
            d3.selectAll("#tabchart-dropdown-icon").classed("tabchart-dropdown-content-show", false)
    });

    return (
        <>
            <div className="tab-chart-area">
                <div className="tab-chart-area-tabs">
                    {categories.map(function (category) {
                        return (
                            <button key={category + "-tab"}
                                id={category + "-tab"}
                                className={(currentCategory === category) ? "active" : ""}
                                style={{ "borderRadius": "15px 15px 0px 0px" }}
                                onClick={() => setCurrentCategory(category)}>
                                {category}
                            </button>
                        )
                    })}
                </div>
                {props.data.length > 0 && <TabContent category={currentCategory} data={props.data} isExpanded={props.isExpanded} setIsExpanded={props.setIsExpanded} />}
                {props.data.length === 0 &&
                    <div id="tab-content" className="tab-chart-area-content shadow" style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                        No data to show
                    </div>
                }
            </div>
        </>
    )
}

export default TabChart;
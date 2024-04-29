
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

import $ from "jquery"

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

let pyramid_boundaries = null
let pyramid_boundaries_bottom = null
let pyramid_boundaries_left = null

function wrap(text, width) {
    
	text.each(function () {
		var text = d3.select(this),
			words = text.text().split(/\s+/),
			line = [],
			y = text.attr("y"),
			x = text.attr("x"),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y);

		words.forEach((word) => {
			if (word !== "") {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan.attr("y", Number(tspan.attr("y")) - 8)
					tspan = text.append("tspan").attr("x", x).attr("y", Number(tspan.attr("y")) + 16).text(word);
				}
			}
		})
		tspan.attr("y", Number(tspan.attr("y")) - 8)
	});
}

function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&\/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

const TabContent = (props) => {

    const [isExpanded, setIsExpanded] = useState(false)

    function expandTabChart() {

        document.getElementById("overlay").style.display = (!isExpanded) ? "block" : "none";

        d3.selectAll(".tab-chart-area").classed("tabchart-expand", !isExpanded)

        setIsExpanded(!isExpanded)
        props.setIsExpanded(!isExpanded)
    }

    useEffect(() => {
        setIsExpanded(props.isExpanded)
        d3.selectAll(".tab-chart-area").classed("tabchart-expand", props.isExpanded)
    }, [props.isExpanded])

    const { t } = useTranslation()

    const [styleDropdown, setStyleDropdown] = useState(false);

    const [totalOccurrences, setTotalOccurrences] = useState(false)
    const [changedTotal, setChangedTotal] = useState(false)
    const [changedSorting, setChangedSorting] = useState(false)


    useEffect(() => {
        let index = props.categories[props.category].index
        let sexIndex = props.csvIndexes.subject_sex

        let pyramidData = d3.rollup(props.data, v => ({
            masc: d3.sum(v, d => ((d[sexIndex] === "Masc." || d[sexIndex] === "Mult." || d[sexIndex] === "N") ? 1 : 0)),
            fem: d3.sum(v, d => ((d[sexIndex] === "Fem." || d[sexIndex] === "Mult." || d[sexIndex] === "N") ? 1 : 0)),
            total: d3.sum(v, d => {
                if (d[sexIndex] === "Masc." || d[sexIndex] === "Fem.")
                    return 1
                if (d[sexIndex] === "Mult." || d[sexIndex] === "N")
                    return 2

                return 0
            })
        }), d => d[index])

        let participants_total = 0

        for (let [, value] of pyramidData)
            participants_total += value.masc + value.fem

        if (participants_total === 0)
            participants_total = 1

        let maxMasc = d3.max(pyramidData, d => d[1].masc / participants_total)
        let maxFem = d3.max(pyramidData, d => d[1].fem / participants_total)
        let maxTotal = d3.max(pyramidData, d => d[1].total / participants_total)
        let maxScale = (totalOccurrences) ? maxTotal : Math.max(maxMasc, maxFem)

        let factor = maxScale > 0.1 ? 0.05 : 0.01

        // tooltipPyramid events
        const mouseover = function (event, d, type) {
            tooltipPyramid.style("opacity", 1)
            d3.select(this).transition().duration(100).style("stroke-width", 1)

            var previousElement = d3.select(".barMasc");
            var isTotal = false

            if (previousElement) {
                var color = d3.rgb(previousElement.style("fill"))
                isTotal = (color.r === 147 && color.g === 89 && color.b === 89)
            }

            if (isTotal) type = "total"

            let data = d[1][type]

            tooltipPyramid
                .html(`<center><b>${d[0]} - ${type.charAt(0).toUpperCase() + type.slice(1)}</b></center>
                        Percentage: ${d3.format(".1f")((data / participants_total) * 100)}%<br>
                        Occurrence: ${data}`)
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px");
        };

        const mouseleave = function (d) {
            tooltipPyramid.style("opacity", 0)

            let element = document.getElementById('tooltipPyramid')
            if (element) element.innerHTML = "";

            d3.select(this).transition().duration(100).style("stroke-width", 0)
        };

        let infoMouseLeavePyramid = function (event, d) {
            tooltipPyramid
                .style("opacity", 0)

            let element = document.getElementById('tooltipPyramid')
            if (element)
                element.innerHTML = "";
        }

        let infoMouseOverPyramid = function (event, d) {
            tooltipPyramid
                .style("opacity", 1);

            tooltipPyramid.html(`<center><b>${t("information")}</b></center>
                      ${t("information-pyramid")}`)
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px")
        }



        let sort_name_asc = (a, b) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        }
        let sort_name_desc = (a, b) => -sort_name_asc(a, b);
        let sort_masc_asc = (a, b) => a[1].masc - b[1].masc;
        let sort_masc_desc = (a, b) => -sort_masc_asc(a, b);
        let sort_fem_asc = (a, b) => a[1].fem - b[1].fem;
        let sort_fem_desc = (a, b) => -sort_fem_asc(a, b);
        let sort_total_asc = (a, b) => a[1].total - b[1].total;
        let sort_total_desc = (a, b) => -sort_total_asc(a, b);

        let s = props.currentSorting

        let sorting = ""
        if (s === "name_asc") sorting = sort_name_asc
        else if (s === "name_desc") sorting = sort_name_desc
        else if (s === "masc_asc") sorting = sort_masc_asc
        else if (s === "masc_desc") sorting = sort_masc_desc
        else if (s === "fem_asc") sorting = sort_fem_asc
        else if (s === "fem_desc") sorting = sort_fem_desc
        else if (s === "total_asc") sorting = sort_total_asc
        else if (s === "total_desc") sorting = sort_total_desc

        if (sorting !== "")
            pyramidData = new Map([...pyramidData.entries()].sort(sorting));

        let box_left = document.querySelector(".pyramid-axes-left");
        if (pyramid_boundaries_left === null)
            pyramid_boundaries_left = box_left.getBoundingClientRect()
        let width_left = pyramid_boundaries_left.width

        let box_bottom = document.querySelector(".pyramid-axes-bottom");
        if (pyramid_boundaries_bottom === null)
            pyramid_boundaries_bottom = box_bottom.getBoundingClientRect()
        let width_bottom = pyramid_boundaries_bottom.width * 0.9
        let height_bottom = pyramid_boundaries_bottom.height * 0.9;

        let box = document.querySelector('.pyramid-content');
        if (pyramid_boundaries === null)
            pyramid_boundaries = box.getBoundingClientRect()
        let width = pyramid_boundaries.width * 0.9;
        let barsWidth = width / 2

        let scrollableHeight = pyramidData.size * 30

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

        d3.select(".pyramid-axes-left").html("");
        d3.select(".pyramid-axes-bottom").html("");

        const axes_bottom = d3
            .select(".pyramid-axes-bottom")
            .append("svg")
            .attr("width", width_bottom + 20)
            .attr("height", height_bottom)

        // Y scale
        let yScale = d3.scaleBand()
            .domain(Array.from(pyramidData.keys()))
            .range([0, scrollableHeight])
            .padding(.3);

        // X scale
        let xScaleMasc = d3.scaleLinear()
            .domain([0, ((maxScale + factor) > 1 ? 1 : maxScale + factor)])
            .range(totalOccurrences ? [5, barsWidth * 2] : [barsWidth, 0]);

        let xScaleFem = d3.scaleLinear()
            .domain([0, ((maxScale + factor) > 1 ? 1 : maxScale + factor)])
            .range([barsWidth, barsWidth * 2]);

        axes_bottom.append("g")
            .attr("class", "pyramid-bottom-axis")
            .attr("transform", `translate(10,0)`)
            .attr("id", "axismale")
            .call(d3.axisBottom(xScaleMasc).tickSize(0).tickPadding(2).ticks((factor === 0.01) ? 2 : 5, "%").tickFormat(x => { if (x === 0) return 0; else return `${(+(x * 100).toFixed(1))}%` }))
            .call(function (d) { return d.select(".domain").remove() });

        let bottom_legend = axes_bottom
            .append("g")
            .attr("transform", `translate(${barsWidth / 3},0)`)

        bottom_legend.append("rect")
            .attr("class", "squareMasc")
            .attr("x", (totalOccurrences) ? barsWidth / 2 : 0)
            .attr("y", margin.top)
            .attr("width", 13)
            .attr("height", 13)
            .style("fill", (totalOccurrences) ? "#935959" : "#7BB3B7")
        //.on("click", mouseclickmale)

        bottom_legend
            .append("text")
            .attr("class", "legend")
            .attr("x", ((totalOccurrences) ? barsWidth / 2 : 0) + 20)
            .attr("y", margin.top + 12)
            .text((totalOccurrences) ? "Total" : "Masculine")

        if (!totalOccurrences) {
            axes_bottom.append("g")
                .attr("class", "pyramid-bottom-axis")
                .attr("transform", `translate(10,0)`)
                .attr("id", "axisfemale")
                .call(d3.axisBottom(xScaleFem).tickSize(0).tickPadding(2).ticks((factor === 0.01) ? 2 : 5, "%").tickFormat(x => { if (x === 0) return; else return `${(+(x * 100).toFixed(1))}%` }))
                .call(function (d) { return d.select(".domain").remove() });

            bottom_legend
                .append("rect")
                .attr("class", "squareFem")
                .attr("x", barsWidth)
                .attr("y", margin.top)
                .attr("width", 13)
                .attr("height", 13)
                .style("fill", "#DA9C80")
            //.on("click", mouseclickfemale)

            bottom_legend
                .append("text")
                .attr("class", "legend")
                .attr("x", barsWidth + 20)
                .attr("y", margin.top + 12)
                .text("Feminine")
        }

        d3.select("#gridm").remove()
        d3.select("#gridf").remove()

        let svg = null


        const previousLabels = d3.select(".pyramid-content").select("svg").select("g").selectAll(".barMasc").data().map(d => d[0])
        const currentLabels = Array.from(pyramidData.keys())

        let sameArrays = previousLabels.sort().join(',') === currentLabels.sort().join(',')

        if (changedTotal || changedSorting || (props.changedFilter && sameArrays)) {

            svg = d3.select(".pyramid-content").select("svg").select("g")

            const maleBars = svg.selectAll(".barMasc")
            const femaleBars = svg.selectAll(".barFem")

            if (totalOccurrences) {
                maleBars
                    .data(pyramidData)
                    .transition()
                    .duration(500)
                    .attr("x", xScaleMasc(0))
                    .attr("y", d => yScale(d[0]))
                    .attr("width", d => xScaleMasc(d[1].total / participants_total))
                    .attr("height", yScale.bandwidth())
                    .style("fill", "#935959")

                femaleBars
                    .data(pyramidData)
                    .transition()
                    .duration(500)
                    .attr("width", 0)
            }
            else {
                maleBars
                    .data(pyramidData)
                    .transition()
                    .duration(500)
                    .attr("class", d=> `barMasc pyramid-Masc-${noSpaces(d[0])}`)
                    .attr("x", d => xScaleMasc(d[1].masc / participants_total))
                    .attr("y", d => yScale(d[0]))
                    .attr("width", d => barsWidth - xScaleMasc(d[1].masc / participants_total))
                    .attr("height", yScale.bandwidth())
                    .style("fill", "#7BB3B7")

                femaleBars
                    .data(pyramidData)
                    .transition()
                    .duration(500)
                    .attr("class", d=> `barFem pyramid-Fem-${noSpaces(d[0])}`)
                    .attr("x", xScaleFem(0))
                    .attr("y", d => yScale(d[0]))
                    .attr("width", d => xScaleFem(d[1].fem / participants_total) - xScaleFem(0))
                    .attr("height", yScale.bandwidth())
                    .style("fill", "#DA9C80")
            }
        } else {

            d3.select(".pyramid-content").html("")
            svg = d3
                .select(".pyramid-content")
                .append("svg")
                .attr("width", width + 20)
                .attr("height", scrollableHeight)
                .append("g")
                .attr("transform", `translate(10,0)`)

            // create male bars
            svg.selectAll(".barMasc")
                .data(pyramidData)
                .join("rect")
                .attr("class", d=> `barMasc pyramid-Masc-${noSpaces(d[0])}`)
                .attr("x", d => (totalOccurrences) ? xScaleMasc(0) : (xScaleMasc(d[1].masc / participants_total)))
                .attr("y", d => yScale(d[0]))
                .attr("width", d => (totalOccurrences) ?
                    xScaleMasc(d[1].total / participants_total) :
                    (barsWidth - xScaleMasc(d[1].masc / participants_total)))
                .attr("height", yScale.bandwidth())
                .style("fill", (totalOccurrences) ? "#935959" : "#7BB3B7")
                .style("stroke", "black")
                .style("stroke-width", 0)
                .on("mouseover", (event, d) => mouseover(event, d, "masc"))
                .on("mouseleave", mouseleave)
            //.on("click", mouseclickmale)

            svg.selectAll(".linePyramidHorizontal")
                .data(pyramidData)
                .join("line")
                .style("stroke", "#333333")
                .style("stroke-opacity", 0.2)
                .style("stroke-width", 0.3)
                .attr("x1", 0)
                .attr("y1", d => yScale(d[0]) - (yScale.bandwidth() / 4))
                .attr("x2", width)
                .attr("y2", d => yScale(d[0]) - (yScale.bandwidth() / 4))


            svg.selectAll(".barFem")
                .data(pyramidData)
                .join("rect")
                .attr("class", d=> `barFem pyramid-Fem-${noSpaces(d[0])}`)
                .attr("x", xScaleFem(0))
                .attr("y", d => yScale(d[0]))
                .attr("width", (totalOccurrences) ? 0 : d => xScaleFem(d[1].fem / participants_total) - xScaleFem(0))
                .attr("height", yScale.bandwidth())
                .style("fill", "#DA9C80")
                .style("stroke", "black")
                .style("stroke-width", 0)
                .on("mouseover", (event, d) => mouseover(event, d, "fem"))
                .on("mouseleave", mouseleave)
            //.on("click", mouseclickfemale)
        }


        /* svg bars */
        d3.selectAll(".pyramid-subcategory-axis").remove()

        const axes_left = d3
            .select(".pyramid-axes-left")
            .append("svg")
            .attr("width", width_left)
            .attr("height", scrollableHeight)


        axes_left.append("g")
            .attr("class", "pyramid-subcategory-axis")
            .selectAll("text")
            .data(pyramidData)
            .join("text")
            .text((d) => d[0])
            .style("font-size", 13)
            .style("font-family", "lato")
            .attr("direction", "ltr")
            .attr("x", width_left / 2 + 5)
            .attr("text-anchor", "middle")
            .attr("y", d => yScale(d[0]) + 15)

        axes_left.selectAll("text")
            .call(wrap, width_left)

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
        setChangedSorting(false)
        props.setChangedFilter(false)

    }, [props.category, totalOccurrences, props.currentSorting, props.data])

    const changeTotalOccurrence = () => {
        setTotalOccurrences(!totalOccurrences)
        setChangedTotal(true)
    }

    const changeStyle = () => {
        d3.selectAll("#tabchart-dropdown-icon").classed("tabchart-dropdown-content-show", !styleDropdown)
        //"tabchart-dropdown-content-hide"

        setStyleDropdown(!styleDropdown);
    };


    const changeSorting = (s) => {
        props.setCurrentSorting(s)
        d3.selectAll("#tabchart-dropdown-icon").classed("tabchart-dropdown-content-show", false)
        setStyleDropdown(false);
        setChangedSorting(true);
    }

    function handleContentScroll(e) {
        $('.pyramid-axes-left').scrollTop($('.pyramid-content').scrollTop());
    }

    function handleLeftScroll(e) {
        $('.pyramid-content').scrollTop($('.pyramid-axes-left').scrollTop());
    }

    return (<>
        <div id="tab-content" className="tab-chart-area-content shadow">
            <div className="titles" id="pyramidTitle">
                <h5 className="pyramid-title">{(totalOccurrences) ? t("pyramid-total") : t("pyramid-separate")}</h5>
                <img alt="info" id="infoPyramid" src={info}
                    style={{ marginLeft: "5px", cursor: "pointer" }} width="15" height="15"
                />
                <img title={isExpanded ? t("icon-shrink") : t("icon-expand")} alt="info" src={isExpanded ? shrink : expand}
                    style={{ position: "absolute", right: "15px", cursor: "pointer" }} width="15px" height="15px"
                    onClick={expandTabChart}
                />
            </div>
            <div className="pyramid-filters">
                <img title={(totalOccurrences) ? t("icon-separate") : t("icon-group")} alt="total" src={(totalOccurrences) ? separate : group}
                    style={{ marginRight: "5%", float: "right", cursor: "pointer" }} width="20" height="20"
                    onClick={changeTotalOccurrence}
                />
                <div id="tabchart-dropdown" className='tabchart-dropdown'>
                    <button className='tabchart-dropbtn' onClick={changeStyle}>
                        <img title={t("icon-sort")} alt="total" src={sorting_icon}
                            style={{ "marginLeft": 5 + "px" }} className="tabchart-sorting-icon"

                        /></button>
                    <div id="tabchart-dropdown-icon" className={"shadow tabchart-dropdown-content-hide"}>
                        <button className={props.currentSorting === "name_asc" ? "sorting-active" : ""} onClick={() => changeSorting("name_asc")}> Name (ascending) </button>
                        <button className={props.currentSorting === "name_desc" ? "sorting-active" : ""} onClick={() => changeSorting("name_desc")}> Name (descending) </button>

                        {!totalOccurrences && <>
                            <button className={props.currentSorting === "masc_asc" ? "sorting-active" : ""} onClick={() => changeSorting("masc_asc")}> Masc. - Low to High </button>
                            <button className={props.currentSorting === "masc_desc" ? "sorting-active" : ""} onClick={() => changeSorting("masc_desc")}> Masc. - High to Low </button>
                            <button className={props.currentSorting === "fem_asc" ? "sorting-active" : ""} onClick={() => changeSorting("fem_asc")}> Fem. - Low to High </button>
                            <button className={props.currentSorting === "fem_desc" ? "sorting-active" : ""} onClick={() => changeSorting("fem_desc")}> Fem. - High to Low </button>
                        </>}

                        {totalOccurrences && <>
                            <button className={props.currentSorting === "total_asc" ? "sorting-active" : ""} onClick={() => changeSorting("total_asc")}> Total - Low to High </button>
                            <button className={props.currentSorting === "total_desc" ? "sorting-active" : ""} onClick={() => changeSorting("total_desc")}> Total - High to Low </button>
                        </>}
                    </div>
                </div>

            </div>
            <div className="pyramid-top-content">
                <div onScroll={handleLeftScroll} className="pyramid-axes-left">
                </div>
                <div onScroll={handleContentScroll} className="pyramid-content">
                </div>
            </div>
            <div className="pyramid-bottom-content">
                <div className="pyramid-empty-space">
                </div>
                <div className="pyramid-axes-bottom">
                </div>
            </div>
        </div>
    </>)
}

const TabChart = (props) => {
    const [currentCategory, setCurrentCategory] = useState(Object.keys(props.categories)[0])
    const [currentSorting, setCurrentSorting] = useState("name_asc")

    window.addEventListener('click', function (e) {
        if (document.getElementById('tabchart-dropdown') && !document.getElementById('tabchart-dropdown').contains(e.target))
            d3.selectAll("#tabchart-dropdown-icon").classed("tabchart-dropdown-content-show", false)
    });

    const changeCurrentCategory = (category) => {
        setCurrentCategory(category)
        props.setCurrentTabchartCategory(category)
    }

    const {t} = useTranslation()

    return (
        <>
            <div className="tab-chart-area">
                <div className="tab-chart-area-tabs">
                    {Object.keys(props.categories).map(
                        function (category) {
                            return (
                                <button key={category + "-tab"}
                                    id={category + "-tab"}
                                    className={(currentCategory === category) ? "active" : ""}
                                    style={{ "borderRadius": "15px 15px 0px 0px" }}
                                    onClick={() => changeCurrentCategory(category)}>
                                    {props.categories[category].name}
                                </button>
                            )
                        })}
                </div>
                {props.data.length > 0 &&
                    <TabContent categories={props.categories}
                        category={currentCategory}
                        csvIndexes={props.csvIndexes}
                        data={props.data}
                        isExpanded={props.isExpanded}
                        setIsExpanded={props.setIsExpanded}
                        currentSorting={currentSorting}
                        setCurrentSorting={setCurrentSorting}
                        changedFilter={props.changedFilter}
                        setChangedFilter={props.setChangedFilter} />}
                {props.data.length === 0 &&
                    <div id="tab-content" className="tab-chart-area-content shadow" style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                        {t("no-data-to-show")}
                    </div>}
            </div>
        </>
    )
}

export default TabChart;
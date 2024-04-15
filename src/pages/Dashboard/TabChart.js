
import React, { useEffect } from "react";
import { useState } from "react"
import "./../../styles/Dashboard/TabChart.css"


import info from "./../../assets/images/info-black.png"
import group from "./../../assets/images/dashboard/group.png"
import sorting from "./../../assets/images/dashboard/sorting.png"

import * as d3 from "d3";

var tooltipPyramid;

var maleSelected = false
var femaleSelected = false

// Define margin and dimensions for the charts
const margin = {
    top: 20,
    right: 20,
    bottom: 50,
    left: 80,
};

const TabContent = ({ category, data }) => {

    const [totalOccurrences, setTotalOccurrences] = useState(false)
    const [changedTotal, setChangedTotal] = useState(false)

    let globalData = d3.flatRollup(data, v => ({
        participants_total: v.length,
    }), (d) => d.title, (d) => d.subject_sex, (d) => d.anatomical_part, (d) => d.organs)

    let pyramidData = {}

    if (category === "Body&Soul")
        pyramidData = d3.rollup(globalData, v => ({
            participants_total: v.length,
            anatomical_part: d3.group(v, d => d[2]),
            organs: d3.group(v, d => d[3])
        }), d => d[1])


    if (category === "Emotions")
        pyramidData = d3.rollup(globalData, v => ({
            participants_total: v.length,
            anatomical_part: d3.group(v, d => d[3]),
            organs: d3.group(v, d => d[3])
        }), d => d[1])

    let dimensions = [...new Set([...pyramidData.get("Masc.").anatomical_part.keys(),
    ...pyramidData.get("Fem.").anatomical_part.keys(),
    ...pyramidData.get("Mult.").anatomical_part.keys(),
    ...pyramidData.get("N").anatomical_part.keys()])]

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

    // tooltipPyramid events
    const mouseover = function (d) {
        tooltipPyramid.style("opacity", 1)
        d3.select(this).style("stroke-width", 1)
    };

    const mousemove = function (event, d, type) {
        var previousElement = d3.select(".barMale");
        var isTotal = false

        if (previousElement) {
            var color = d3.rgb(previousElement.style("fill"))
            isTotal = (color.r === 147 && color.g === 89 && color.b === 89)
        }

        if (isTotal) type = "Total"

        let data = getParticipants(type, d)

        tooltipPyramid
            .html(`<center><b>${type}</b></center>
                    Percentage: ${d3.format(".1f")((data / participants_total) * 100)}%<br>
                    Participation: ${data}`)
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

        d3.select(".pyramid-axes-content").html("");

        const axes = d3
            .select(".pyramid-axes-content")
            .append("svg")
            .attr("width", width)
            .attr("transform", `translate(${barsWidth},0)`);

        // Y scale
        const yScale = d3.scaleBand()
            .domain(dimensions)
            .range([scrollableHeight, 0])
            .padding(.3);

        let maxMale = d3.max(dimensions, d => getParticipants("Masc.", d) / participants_total)
        let maxFemale = d3.max(dimensions, d => getParticipants("Fem.", d) / participants_total)
        let maxScale = (totalOccurrences) ? d3.max(dimensions, d => getParticipants("Total", d) / participants_total) : Math.max(maxMale, maxFemale)
        let factor = maxScale > 0.1 ? 0.05 : 0.01

        // X scale
        let xScaleMale = d3.scaleLinear()
            .domain([0, ((maxScale + factor) > 1 ? 1 : maxScale + factor)])
            .range(totalOccurrences ? [5, barsWidth * 2] : [barsWidth, 0]);

        let xScaleFemale = d3.scaleLinear()
            .domain([0, ((maxScale + factor) > 1 ? 1 : maxScale + factor)])
            .range([barsWidth, barsWidth * 2]);

        axes.append("g")
            .attr("id", "axismale")
            .call(d3.axisBottom(xScaleMale).tickSize(0).tickPadding(2).ticks(5, "%").tickFormat(x => { if (x === 0) return 0; else return `${(+(x * 100).toFixed(1))}%` }))
            .call(function (d) { return d.select(".domain").remove() });

        axes
            .append("rect")
            .attr("class", "squareMale")
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
            .text((totalOccurrences) ? "Total" : "Male")

        if (!totalOccurrences) {
            axes.append("g")
                .attr("id", "axisfemale")
                .call(d3.axisBottom(xScaleFemale).tickSize(0).tickPadding(2).ticks(5, "%").tickFormat(x => { if (x === 0) return; else return `${(+(x * 100).toFixed(1))}%` }))
                .call(function (d) { return d.select(".domain").remove() });

            axes
                .append("rect")
                .attr("class", "squareFemale")
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
                .text("Female")
        }

        /* svg bars */
        d3.selectAll(".pyramid-subcategory-axis").remove()
        d3.select("#gridm").remove()
        d3.select("#gridf").remove()

        let svg = null

        if (changedTotal) {

            svg = d3.select(".pyramid-content").select("svg").select("g")

            const maleBars = svg.selectAll(".barMale")
            const femaleBars = svg.selectAll(".barFemale")

            if (totalOccurrences) {
                maleBars
                    .transition()
                    .duration(1000)
                    .attr("x", d => xScaleMale(0))
                    .attr("y", d => yScale(d))
                    .attr("width", d => xScaleMale(getParticipants("Total", d) / participants_total))
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
                    .attr("class", "barMale")
                    .attr("x", d => xScaleMale(getParticipants("Masc.", d) / participants_total))
                    .attr("y", d => yScale(d))
                    .attr("width", d => barsWidth - xScaleMale(getParticipants("Masc.", d) / participants_total))
                    .attr("height", yScale.bandwidth())
                    .style("fill", "#7BB3B7")

                femaleBars
                    .transition()
                    .duration(1000)
                    .attr("class", "barFemale")
                    .attr("x", xScaleFemale(0))
                    .attr("y", d => yScale(d))
                    .attr("width", d => xScaleFemale(getParticipants("Fem.", d) / participants_total) - xScaleFemale(0))
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
            svg.selectAll(".barMale")
                .data(dimensions)
                .join("rect")
                .attr("class", "barMale")
                .attr("x", d => (totalOccurrences) ? xScaleMale(0) : (xScaleMale(getParticipants("Masc.", d) / participants_total)))
                .attr("y", d => yScale(d))
                .attr("width", d => (totalOccurrences) ?
                    xScaleMale(getParticipants("Total", d) / participants_total) :
                    (barsWidth - xScaleMale(getParticipants("Masc.", d) / participants_total)))
                .attr("height", yScale.bandwidth())
                .style("fill", (totalOccurrences) ? "#935959" : "#7BB3B7")
                .style("stroke", "black")
                .style("stroke-width", 0)
                .on("mouseover", mouseover)
                .on("mousemove", (event, d) => mousemove(event, d, "Masc."))
                .on("mouseleave", mouseleave)
            //.on("click", mouseclickmale)

            svg.selectAll(".barFemale")
                .data(dimensions)
                .join("rect")
                .attr("class", "barFemale")
                .attr("x", xScaleFemale(0))
                .attr("y", d => yScale(d))
                .attr("width", (totalOccurrences) ? 0 : d => xScaleFemale(getParticipants("Fem.", d) / participants_total) - xScaleFemale(0))
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
            .attr("width", "200px")
            .call(d3.axisLeft(yScale).tickSize(0).tickPadding(10))
            .call(d => d.select(".domain").remove())

        const GridLineM = function () { return d3.axisBottom().scale(xScaleMale) };
        svg.append("g")
            .attr("id", "gridm")
            .attr("class", "grid")
            .call(GridLineM()
                .tickSize(scrollableHeight, 0, 0)
                .tickFormat("")
                .ticks(7)
            )

        // set vertical grid line
        const GridLineF = function () { return d3.axisBottom().scale(xScaleFemale) };
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
    }, [category, totalOccurrences])

    const changeTotalOccurrence = () => {
        setTotalOccurrences(!totalOccurrences)
        setChangedTotal(true)
    }

    return (<>
        <div id="tab-content" className="tab-chart-area-content shadow">
            <div className="titles" id="pyramidTitle">
                {!totalOccurrences && <h5 className="pyramid-title">How are the different sexes perceived?</h5>}
                {totalOccurrences && <h5 className="pyramid-title">Total occurrences</h5>}
                <img alt="info" id="infoMap" src={info}
                    style={{ "marginLeft": 5 + "px" }} width="15" height="15"
                />

            </div>
            <div className="pyramid-filters">
                <img alt="total" src={group}
                    style={{ "marginRight": "5%", float: "right", cursor: "pointer" }} width="20" height="20"
                    onClick={changeTotalOccurrence}
                />
                <img alt="total" src={sorting}
                    style={{ "marginLeft": "5%", cursor: "pointer" }} width="20" height="20"
                //onClick={}
                />
            </div>
            <div className="pyramid-content">
            </div>
            <div className="pyramid-axes-content">
            </div>
        </div>
    </>)
}

const TabChart = ({ categories, data }) => {
    categories = ["Body&Soul", "Emotions"]
    const [currentCategory, setCurrentCategory] = useState(categories[0])

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
                {data.length > 0 && <TabContent category={currentCategory} data={data} />}
                {data.length === 0 &&
                    <div id="tab-content" className="tab-chart-area-content shadow" style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                        No data to show
                    </div>
                }
            </div>
        </>
    )
}

export default TabChart;
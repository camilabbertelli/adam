
import React, { useEffect } from "react";
import { useState } from "react"
import "./../../styles/Dashboard/TabChart.css"


import info from "./../../assets/images/info-black.png"

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

    let globalData = d3.flatRollup(data, v => ({

        participants_total: d3.sum(v, d => {
            return 1
        }),

    }), (d) => d.title, (d) => d.subject_sex, (d) => d.anatomical_part, (d) => d.organs)


    let pyramidData = {}

    useEffect(() => {
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

        let box = document.querySelector('#pyramid-content');

        let boundaries = box.getBoundingClientRect()

        let width = boundaries.width * 0.9 - margin.left - margin.right;
        let height = boundaries.height * 0.9;
        height = height / 1.4

        d3.select("#pyramid-content").html("");
        const svg = d3
            .select("#pyramid-content")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        let participants_total = 1

        if (pyramidData.get("Masc.").participants_total + pyramidData.get("Fem.").participants_total !== 0)
            participants_total = pyramidData.get("Masc.").participants_total + pyramidData.get("Fem.").participants_total

        let maxMale = d3.max((pyramidData.get("Masc.").anatomical_part).keys(), d => pyramidData.get("Masc.").anatomical_part.get(d).length / participants_total)
        let maxFemale = d3.max((pyramidData.get("Fem.").anatomical_part).keys(), d => pyramidData.get("Fem.").anatomical_part.get(d).length / participants_total)

        let maxScale = Math.max(maxMale, maxFemale)


        let factor = maxScale > 0.1 ? 0.05 : 0.01

        // X scale and Axis
        const xScaleMale = d3.scaleLinear()
            .domain([0, ((maxScale + factor) > 1 ? 1 : maxScale + factor)])
            .range([width / 2, 0]);

        svg.append("g")
            .attr("id", "axismale")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScaleMale).tickSize(0).tickPadding(2).ticks(5, "%").tickFormat(x => { if (x === 0) return 0; else return `${(+(x * 100).toFixed(1))}%` }))
            .call(function (d) { return d.select(".domain").remove() });

        const xScaleFemale = d3.scaleLinear()
            .domain([0, ((maxScale + factor) > 1 ? 1 : maxScale + factor)])
            .range([width / 2, width]);

        svg.append("g")
            .attr("id", "axisfemale")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScaleFemale).tickSize(0).tickPadding(2).ticks(5, "%").tickFormat(x => { if (x === 0) return; else return `${(+(x * 100).toFixed(1))}%` }))
            .call(function (d) { return d.select(".domain").remove() });

        var dragging = {};

        d3.selection.prototype.moveToFront = function () {
            return this.each(function () {
                this.parentNode.appendChild(this);
            });
        };

        function position(d) {
            var v = dragging[d];
            return v === null ? yScale(d) : v;
        }

        function transition(g) {
            return g.transition().duration(500);
        }

        // set vertical grid line
        const GridLineF = function () { return d3.axisBottom().scale(xScaleFemale) };
        svg.append("g")
            .attr("id", "gridf")
            .attr("class", "grid")
            .call(GridLineF()
                .tickSize(height, 0, 0)
                .tickFormat("")
                .ticks(7)
            );
        const GridLineM = function () { return d3.axisBottom().scale(xScaleMale) };
        svg.append("g")
            .attr("id", "gridm")
            .attr("class", "grid")
            .call(GridLineM()
                .tickSize(height, 0, 0)
                .tickFormat("")
                .ticks(7)
            )

        let dimensions = [...new Set([...pyramidData.get("Masc.").anatomical_part.keys(), ...pyramidData.get("Fem.").anatomical_part.keys()])]

        // Y scale and Axis
        const yScale = d3.scaleBand()
            .domain(dimensions)
            .range([height, 0])
            .padding(.3);


        let g = svg
            .append("g")
            .attr("height", height)
            .attr("width", width)
            .attr("background-color", "red")
            .attr("overflow-y", "auto")
            
        g.append("g")
            .call(d3.axisLeft(yScale).tickSize(0).tickPadding(10))
            .attr("class", "pyramid-subcategory-axis")
            .call(d => d.select(".domain").remove());
            
        // create male bars
        g.selectAll(".maleBar")
            .data((pyramidData.get("Masc.").anatomical_part).keys())
            .join("rect")
            .attr("class", "barMale")
            .attr("y", d => yScale(d))
            .attr("x", d => xScaleMale(pyramidData.get("Masc.").anatomical_part.get(d).length / participants_total))
            .attr("width", d => width / 2 - xScaleMale(pyramidData.get("Masc.").anatomical_part.get(d).length / participants_total))
            .attr("height", yScale.bandwidth())
            .style("fill", "#7BB3B7")
            .style("stroke", "black")
            .style("stroke-width", 0)
        // .call(d3.drag()
        // .subject(function(d) { 
        // 	return {y: yScale(d)}; })
        //     .on("start", function (d) {
        //         dragging[d.subject] = yScale(d.subject);

        //         let sel = d3.select(this);
        //         sel.moveToFront();
        //     })
        //     .on("drag", function (d, item) {
        //         dragging[item] = Math.min(height, Math.max(0, d.y));
        //         console.log(dimensions);
        //         dimensions.sort(function (a, b) { return position(a) - position(b);});
        //         console.log(dimensions);
        //         yScale.domain();
        //         svg.attr("transform", function (d) {
        //             return "translate(0," + position(d) + ")";
        //         })
        //     })
        //     .on("end", function (d) {
        //         delete dragging[d];
        //         transition(d3.select(this)).attr("transform", "translate(0," + yScale(d) + ")");
        //     })
        // );
        // .on("mouseover", mouseover)
        // .on("mousemove", mousemove1)
        // .on("mouseleave", mouseleave)
        // .on("click", mouseclickmale)

        // create female bars
        g.selectAll(".femaleBar")
            .data((pyramidData.get("Fem.").anatomical_part).keys())
            .join("rect")
            .attr("class", "barFemale")
            .attr("x", xScaleFemale(0))
            .attr("y", d => yScale(d))
            .attr("width", d => xScaleFemale(pyramidData.get("Fem.").anatomical_part.get(d).length / participants_total) - xScaleFemale(0))
            .attr("height", yScale.bandwidth())
            .style("fill", "#DA9C80")
            .style("stroke", "black")
            .style("stroke-width", 0)
        // .on("mouseover", mouseover)
        // .on("mousemove", mousemove2)
        // .on("mouseleave", mouseleave)
        // .on("click", mouseclickfemale)

        svg
            .append("rect")
            .attr("class", "squareMale")
            .attr("x", width / 2 - 100)
            .attr("y", height + margin.top + 5)
            .attr("width", 13)
            .attr("height", 13)
            .style("fill", "#7BB3B7")
        //.on("click", mouseclickmale)
        svg
            .append("text")
            .attr("class", "legend")
            .attr("x", width / 2 - 80)
            .attr("y", height + margin.top + 17)
            .text("Male")
        svg
            .append("rect")
            .attr("class", "squareFemale")
            .attr("x", width / 2 + 30)
            .attr("y", height + margin.top + 5)
            .attr("width", 13)
            .attr("height", 13)
            .style("fill", "#DA9C80")
        //.on("click", mouseclickfemale)
        svg
            .append("text")
            .attr("class", "legend")
            .attr("x", width / 2 + 50)
            .attr("y", height + margin.top + 17)
            .text("Female")


    }, [category])

    return (<>
        <div id="tab-content" className="tab-chart-area-content shadow">
            <div className="titles" id="pyramidTitle">
                {!totalOccurrences && <h5 className="pyramid-title">How are the different sexes perceived?</h5>}
                <img alt="info" id="infoMap" src={info}
                    style={{ "marginLeft": 5 + "px" }} width="15" height="15"
                />
            </div>
            <div id="pyramid-content">
            </div>
        </div>
    </>)
}

const TabChart = ({ categories, data }) => {
    categories = ["Body&Soul", "Emotions"]
    const [currentCategory, setCurrentCategory] = useState(categories[0])

    const changeCategory = (category) => {
        setCurrentCategory(category)
    }

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
                                onClick={() => changeCategory(category)}>
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
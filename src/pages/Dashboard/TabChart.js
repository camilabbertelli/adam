
import React, { Component, useEffect } from "react";
import { useState } from "react"
import "./../../styles/Dashboard/TabChart.css"

import csv_data from "./../../assets/data.csv"

import * as d3 from "d3";

var tooltipPyramid

var maleSelected = false
var femaleSelected = false
let participants_total = 1

const TabContent = ({ category, data }) => {

    useEffect(() => {

        let globalData = d3.flatRollup(data, v => ({

            participants_total: d3.sum(v, d => {
                return 1
            }),

        }), (d) => d.title, (d) => d.subject_sex, (d) => d.anatomical_part, (d) => d.organs)

        let pyramidData = d3.rollup(globalData, v => ({
            participants_total: v.length,
            anatomical_part: d3.group(v, d => d[2]),
            organs: d3.group(v, d => d[3])
        }), d => d[1])

        console.log(pyramidData)

        let box = document.querySelector('#tab-content');

        let boundaries = box.getBoundingClientRect()

        let width = boundaries.width * 0.7;
        let height = boundaries.height * 0.7;

        d3.select("#tab-content").html("");
        const svg = d3
            .select("#tab-content")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", `translate(${width/5}, ${height/5})`)
            .append("g")

        let participants_total = 1

        console.log((pyramidData.get("Masc.").anatomical_part).keys())

        if (pyramidData.get("Masc.").participants_total + pyramidData.get("Fem.").participants_total != 0)
            participants_total = pyramidData.get("Masc.").participants_total + pyramidData.get("Fem.").participants_total

        let maxMale = d3.max((pyramidData.get("Masc.").anatomical_part).keys(), d => pyramidData.get("Masc.").anatomical_part.get(d).length / participants_total)
        let maxFemale = d3.max((pyramidData.get("Fem.").anatomical_part).keys(), d => pyramidData.get("Fem.").anatomical_part.get(d).length / participants_total)

        let maxScale = Math.max(maxMale, maxFemale)

        // X scale and Axis
        const xScaleMale = d3.scaleLinear()
            .domain([0, ((maxScale + 0.1) > 1 ? 1 : maxScale + 0.1)])
            .range([width / 2, 0]);

        svg.append("g")
            .attr("id", "axismale")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScaleMale).tickSize(0).tickPadding(3).ticks(5, "%").tickFormat(x => { if (x == 0) return 0; else return `${(x * 100)}%` }))
            .call(function (d) { return d.select(".domain").remove() });

        const xScaleFemale = d3.scaleLinear()
            .domain([0, ((maxScale + 0.1) > 1 ? 1 : maxScale + 0.1)])
            .range([width / 2, width]);

        svg.append("g")
            .attr("id", "axisfemale")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScaleFemale).tickSize(0).tickPadding(3).ticks(5, "%").tickFormat(x => { if (x == 0) return; else return `${(x * 100)}%` }))
            .call(function (d) { return d.select(".domain").remove() });

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
            );

        // Y scale and Axis
        const yScale = d3.scaleBand()
            .domain([...pyramidData.get("Fem.").anatomical_part.keys()])
            .range([height, 0])
            .padding(.25);
        svg
            .append("g")
            .call(d3.axisLeft(yScale).tickSize(0).tickPadding(15))
            .call(d => d.select(".domain").remove());

        // create male bars
        svg
            .selectAll(".maleBar")
            .data((pyramidData.get("Masc.").anatomical_part).keys())
            .join("rect")
            .attr("class", "barMale")
            .attr("y", d => yScale(d))
            .attr("x", d => xScaleMale(pyramidData.get("Masc.").anatomical_part.get(d).length / participants_total))
            .attr("width", d => width / 2 - xScaleMale(pyramidData.get("Masc.").anatomical_part.get(d).length / participants_total))
            .attr("height", yScale.bandwidth())
            .style("fill", "#9dc1e0")
            .style("stroke", "black")
            .style("stroke-width", 0)
        // .on("mouseover", mouseover)
        // .on("mousemove", mousemove1)
        // .on("mouseleave", mouseleave)
        // .on("click", mouseclickmale)

        // create female bars
        svg
            .selectAll(".femaleBar")
            .data((pyramidData.get("Fem.").anatomical_part).keys())
            .join("rect")
            .attr("class", "barFemale")
            .attr("x", xScaleFemale(0))
            .attr("y", d => yScale(d))
            .attr("width", d => xScaleFemale(pyramidData.get("Fem.").anatomical_part.get(d).length / participants_total) - xScaleFemale(0))
            .attr("height", yScale.bandwidth())
            .style("fill", "#e09ddf")
            .style("stroke", "black")
            .style("stroke-width", 0)
        // .on("mouseover", mouseover)
        // .on("mousemove", mousemove2)
        // .on("mouseleave", mouseleave)
        // .on("click", mouseclickfemale)

        svg
            .append("rect")
            .attr("class", "squareMale")
            .attr("x", width / 2 - 70)
            .attr("y", height + 9)
            .attr("width", 13)
            .attr("height", 13)
            .style("fill", "#9dc1e0")
        //.on("click", mouseclickmale)
        svg
            .append("text")
            .attr("class", "legend")
            .attr("x", width / 2 - 50)
            .attr("y", height + 19)
            .text("Male")
        svg
            .append("rect")
            .attr("class", "squareFemale")
            .attr("x", width / 2 + 30)
            .attr("y", height + 9)
            .attr("width", 13)
            .attr("height", 13)
            .style("fill", "#e09ddf")
        //.on("click", mouseclickfemale)
        svg
            .append("text")
            .attr("class", "legend")
            .attr("x", width / 2 + 50)
            .attr("y", height + 19)
            .text("Female")


    }, [])

    return (<>
        <div id="tab-content" className="tab-chart-area-content shadow">
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
                {data.length == 0 &&
                    <div id="tab-content" className="tab-chart-area-content shadow" style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                        No data to show
                    </div>
                }
            </div>
        </>
    )
}

export default TabChart;
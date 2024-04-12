
import React, { Component, useEffect } from "react";
import { useState } from "react"
import "./../../styles/Dashboard/TabChart.css"

import csv_data from "./../../assets/data.csv"

import * as d3 from "d3";

var tooltipPyramid

var maleSelected = false
var femaleSelected = false
let participants_total = 1

// class TabContent extends React.Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             data: []
//         };
//     }

//     componentDidMount() {
//         let pyramidData = d3.flatRollup(d, v => ({
//             sum_medals: d3.sum(v, d => (d.Medal !== 'None' ? 1 : 0)),
//             gold_medals: d3.sum(v, d => (d.Medal == 'Gold' ? 1 : 0)),
//             silver_medals: d3.sum(v, d => (d.Medal == 'Silver' ? 1 : 0)),
//             bronze_medals: d3.sum(v, d => (d.Medal == 'Bronze' ? 1 : 0)),

//             participants_total: v.length,
//             participants: {
//                 "0-15": d3.sum(v, d => (d.Age <= 15 && d.Age >= 0 ? 1 : 0)),
//                 "16-20": d3.sum(v, d => (d.Age <= 20 && d.Age >= 16 ? 1 : 0)),
//                 "21-25": d3.sum(v, d => (d.Age <= 25 && d.Age >= 21 ? 1 : 0)),
//                 "25-30": d3.sum(v, d => (d.Age <= 30 && d.Age >= 26 ? 1 : 0)),
//                 "31-35": d3.sum(v, d => (d.Age <= 35 && d.Age >= 31 ? 1 : 0)),
//                 "36-40": d3.sum(v, d => (d.Age <= 40 && d.Age >= 36 ? 1 : 0)),
//                 "41+": d3.sum(v, d => (d.Age <= 100 && d.Age >= 41 ? 1 : 0))
//             },

//             summer_temp: d3.mean(v, (d) => d.summer_olympic_temp),
//             winter_temp: d3.mean(v, (d) => d.winter_olympic_temp),
//             annual_temp: d3.mean(v, (d) => d.annual_temp),
//         }), d => d.Team, d => d.Sport, d => d.Sex, d => d.Season, d => d.Year)

//         pyramidData = d3.rollup(globalData, v => ({
//             participants: {
//                 "0-15": d3.sum(v, d => d[5].participants["0-15"]),
//                 "16-20": d3.sum(v, d => d[5].participants["16-20"]),
//                 "21-25": d3.sum(v, d => d[5].participants["21-25"]),
//                 "25-30": d3.sum(v, d => d[5].participants["25-30"]),
//                 "31-35": d3.sum(v, d => d[5].participants["31-35"]),
//                 "36-40": d3.sum(v, d => d[5].participants["36-40"]),
//                 "41+": d3.sum(v, d => d[5].participants["41+"])
//             },
//             participants_total: d3.sum(v, d => d[5].participants_total)
//         }), d => d[2])
//     }

//     render() {
//         let category = this.props.category
//         let pyramidData = this.state.data

//         //let box = document.querySelector('.dashboard-viz3');
//         let width = 200;
//         let height = 300;

//         tooltipPyramid = d3.select("body")
//             .append("div")
//             .attr("id", "tooltipPyramid")
//             .attr("class", "tooltip shadow rounded")
//             .attr("padding", "1px")
//             .style("opacity", 0);

//         const svg = d3
//             .select("#population-pyramid")
//             .append("svg")
//             .attr("width", width)
//             .attr("height", height)
//             .append("g")


//         if (pyramidData.get("M").participants_total + pyramidData.get("F").participants_total != 0)
//             participants_total = pyramidData.get("M").participants_total + pyramidData.get("F").participants_total


//         let maxMale = d3.max(Object.keys(pyramidData.get("M").participants), d => pyramidData.get("M").participants[d] / participants_total)
//         let maxFemale = d3.max(Object.keys(pyramidData.get("F").participants), d => pyramidData.get("F").participants[d] / participants_total)

//         let maxScale = Math.max(maxMale, maxFemale)

//         // X scale and Axis
//         const xScaleMale = d3.scaleLinear()
//             .domain([0, ((maxScale + 0.1) > 1 ? 1 : maxScale + 0.1)])
//             .range([width / 2, 0]);

//         svg.append("g")
//             .attr("id", "axismale")
//             .attr("transform", `translate(0, ${height})`)
//             .call(d3.axisBottom(xScaleMale).tickSize(0).tickPadding(3).ticks(5, "%").tickFormat(x => { if (x == 0) return 0; else return `${(x * 100)}%` }))
//             .call(function (d) { return d.select(".domain").remove() });

//         const xScaleFemale = d3.scaleLinear()
//             .domain([0, ((maxScale + 0.1) > 1 ? 1 : maxScale + 0.1)])
//             .range([width / 2, width]);

//         svg.append("g")
//             .attr("id", "axisfemale")
//             .attr("transform", `translate(0, ${height})`)
//             .call(d3.axisBottom(xScaleFemale).tickSize(0).tickPadding(3).ticks(5, "%").tickFormat(x => { if (x == 0) return; else return `${(x * 100)}%` }))
//             .call(function (d) { return d.select(".domain").remove() });

//         // set vertical grid line
//         const GridLineF = function () { return d3.axisBottom().scale(xScaleFemale) };
//         svg.append("g")
//             .attr("id", "gridf")
//             .attr("class", "grid")
//             .call(GridLineF()
//                 .tickSize(height, 0, 0)
//                 .tickFormat("")
//                 .ticks(7)
//             );
//         const GridLineM = function () { return d3.axisBottom().scale(xScaleMale) };
//         svg.append("g")
//             .attr("id", "gridm")
//             .attr("class", "grid")
//             .call(GridLineM()
//                 .tickSize(height, 0, 0)
//                 .tickFormat("")
//                 .ticks(7)
//             );

//         // Y scale and Axis
//         const yScale = d3.scaleBand()
//             .domain(Object.keys(pyramidData.get("F").participants).map(d => d))
//             .range([height, 0])
//             .padding(.25);
//         svg
//             .append("g")
//             .call(d3.axisLeft(yScale).tickSize(0).tickPadding(15))
//             .call(d => d.select(".domain").remove());

//         // create male bars
//         svg
//             .selectAll(".maleBar")
//             .data(Object.keys(pyramidData.get("M").participants))
//             .join("rect")
//             .attr("class", "barMale")
//             .attr("y", d => yScale(d))
//             .attr("x", d => xScaleMale(pyramidData.get("M").participants[d] / participants_total))
//             .attr("width", d => width / 2 - xScaleMale(pyramidData.get("M").participants[d] / participants_total))
//             .attr("height", yScale.bandwidth())
//             .style("fill", "#9dc1e0")
//             .style("stroke", "black")
//             .style("stroke-width", 0)
//         // .on("mouseover", mouseover)
//         // .on("mousemove", mousemove1)
//         // .on("mouseleave", mouseleave)
//         // .on("click", mouseclickmale)

//         // create female bars
//         svg
//             .selectAll(".femaleBar")
//             .data(Object.keys(pyramidData.get("F").participants))
//             .join("rect")
//             .attr("class", "barFemale")
//             .attr("x", xScaleFemale(0))
//             .attr("y", d => yScale(d))
//             .attr("width", d => xScaleFemale(pyramidData.get("F").participants[d] / participants_total) - xScaleFemale(0))
//             .attr("height", yScale.bandwidth())
//             .style("fill", "#e09ddf")
//             .style("stroke", "black")
//             .style("stroke-width", 0)
//         // .on("mouseover", mouseover)
//         // .on("mousemove", mousemove2)
//         // .on("mouseleave", mouseleave)
//         // .on("click", mouseclickfemale)

//         svg
//             .append("rect")
//             .attr("class", "squareMale")
//             .attr("x", width / 2 - 70)
//             .attr("y", height + 9)
//             .attr("width", 13)
//             .attr("height", 13)
//             .style("fill", "#9dc1e0")
//         //.on("click", mouseclickmale)
//         svg
//             .append("text")
//             .attr("class", "legend")
//             .attr("x", width / 2 - 50)
//             .attr("y", height + 19)
//             .text("Male")
//         svg
//             .append("rect")
//             .attr("class", "squareFemale")
//             .attr("x", width / 2 + 30)
//             .attr("y", height + 9)
//             .attr("width", 13)
//             .attr("height", 13)
//             .style("fill", "#e09ddf")
//         //.on("click", mouseclickfemale)
//         svg
//             .append("text")
//             .attr("class", "legend")
//             .attr("x", width / 2 + 50)
//             .attr("y", height + 19)
//             .text("Female")

//         return (
//             <>

//                 <div id="tab-content" className="tab-chart-area-content shadow">
//                     <p>{category}</p>

//                 </div>
//             </>
//         )
//     }

// }

const TabContent = ({ category }) => {

    useEffect(() => {
        //     let globalData = d3.flatRollup(data, v => ({

        //         participants_total: d3.sum(v, d => {
        //             return 1
        //         }),
        //         // participants: {
        //         //     "0-15": d3.sum(v, d => (d.Age <= 15 && d.Age >= 0 ? 1 : 0)),
        //         //     "16-20": d3.sum(v, d => (d.Age <= 20 && d.Age >= 16 ? 1 : 0)),
        //         //     "21-25": d3.sum(v, d => (d.Age <= 25 && d.Age >= 21 ? 1 : 0)),
        //         //     "25-30": d3.sum(v, d => (d.Age <= 30 && d.Age >= 26 ? 1 : 0)),
        //         //     "31-35": d3.sum(v, d => (d.Age <= 35 && d.Age >= 31 ? 1 : 0)),
        //         //     "36-40": d3.sum(v, d => (d.Age <= 40 && d.Age >= 36 ? 1 : 0)),
        //         //     "41+": d3.sum(v, d => (d.Age <= 100 && d.Age >= 41 ? 1 : 0))
        //         // },

        //         // summer_temp: d3.mean(v, (d) => d.summer_olympic_temp),
        //         // winter_temp: d3.mean(v, (d) => d.winter_olympic_temp),
        //         // annual_temp: d3.mean(v, (d) => d.annual_temp),
        //     }), d => d.title, d.subject_sex, d.action, d.organs )

        //     let actions = d3.group(data, d => d.action)
        //     console.log(actions)

        //     let pyramidData = d3.rollup(globalData, v => ({
        //         participantsAction: () => {
        //             let dict = {}


        //             //"0-15": d3.sum(v, d => d[5].participants["0-15"]),
        //             return dict
        //         },
        //         participants_total: d3.sum(v, d => d[4].participants_total)
        //     }), d => d[1])

        //     console.log(globalData)

        //     let box = document.querySelector('#tab-content');

        //     let boundaries = box.getBoundingClientRect()

        //     let width = boundaries.width;
        //     let height = boundaries.height;
        //     d3.select("#tab-content").html("");
        //     const svg = d3
        //         .select("#tab-content")
        //         .append("svg")
        //         .attr("width", width)
        //         .attr("height", height)
        //         .attr("fill", "pink")
        //         .append("g")
        // set the dimensions and margins of the graph


        let box = document.querySelector('#tab-content');

        let boundaries = box.getBoundingClientRect()

        let width = boundaries.width * 0.7;
        let height = boundaries.height * 0.7;

    }, [])

    return (<>
        <div id="tab-content" className="tab-chart-area-content shadow">
            {category}
        </div>
    </>)
}

const TabChart = ({ categories }) => {
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
                            <button key={category + "-tab"} id={category + "-tab"} className={(currentCategory === category) ? "active" : ""} style={{ "borderRadius": "15px 15px 0px 0px" }} onClick={() => changeCategory(category)}>{category}</button>
                        )
                    })}
                </div>
                {<TabContent category={currentCategory} />}
            </div>
        </>
    )
}

export default TabChart;
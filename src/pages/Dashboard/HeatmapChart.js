
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/HeatmapChart.css";
import { useDroppable } from '@dnd-kit/core';
import React, { useEffect } from 'react';

import * as d3 from "d3";

const HeatmapChart = (props) => {
	const { setNodeRef } = useDroppable({
		id: 'droppable',
	});

	useEffect(() => {
		let globalData = d3.flatRollup(props.data, v => ({
			participants_total: v.length,
		}), (d) => d.title, (d) => d.subject_sex, (d) => d.anatomical_part, (d) => d.organs, (d) => d.actions)
	

		let heatmapKey1 = d3.group(globalData, d=>d[2]).keys()
		let heatmapKey2 = d3.group(globalData, d=>d[3]).keys()
		let heatmapData = d3.flatRollup(globalData, v => v.length, d=> d[2], d=> d[3])

		console.log(heatmapKey1)
		console.log(heatmapKey2)
		console.log(heatmapData)

		// set the dimensions and margins of the graph
		const margin = { top: 80, right: 25, bottom: 30, left: 40 },
			width = 2000 - margin.left - margin.right,
			height = 450 - margin.top - margin.bottom;


		d3.select("#heatmap-chart").selectAll("svg").remove("")
		// append the svg object to the body of the page
		const svg = d3.select("#heatmap-chart")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", `translate(${margin.left * 2}, ${margin.top})`);

		//Read the data
		d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv").then(function (data) {

			// Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
			const myGroups = Array.from(new Set(data.map(d => d.group)))
			const myVars = Array.from(new Set(data.map(d => d.variable)))

			// Build X scales and axis:
			const x = d3.scaleBand()
				.range([0, width])
				.domain(heatmapKey2)
				.padding(0.05);
			svg.append("g")
				.style("font-size", 10)
				.attr("transform", `translate(0, ${height/2})`)
				.call(d3.axisBottom(x).tickSize(0))
				.select(".domain").remove()

			// Build Y scales and axis:
			const y = d3.scaleBand()
				.range([height/2, 0])
				.domain(heatmapKey1)
				.padding(0.05);
			svg.append("g")
				.style("font-size", 10)
				.call(d3.axisLeft(y).tickSize(0))
				.select(".domain").remove()

			// Build color scale
			const myColor = d3.scaleSequential()
				.interpolator(d3.interpolateOranges)
				.domain([1, 13])

			d3.selectAll("#tooltipHeatmap").remove();

        let tooltipHeatmap = d3.select("body")
            .append("div")
            .attr("id", "tooltipHeatmap")
            .attr("class", "tooltip shadow rounded")
            .attr("padding", "1px")
            .style("opacity", 0);

			// Three function that change the tooltip when user hover / move / leave a cell
			const mouseover = function (event, d) {
				tooltipHeatmap.style("opacity", 1)
				d3.select(this)
					.style("stroke", "black")
					.style("opacity", 1)
			}
			const mousemove = function (event, d) {
				tooltipHeatmap
					.html(`<center><b>Value:</b></center>
							Percentage: ${d[2]}`)
					.style("top", event.pageY - 10 + "px")
					.style("left", event.pageX + 10 + "px");
			}
			const mouseleave = function (event, d) {
				tooltipHeatmap.style("opacity", 0)
				d3.select(this)
					.style("stroke", "none")
					.style("opacity", 0.8)

				let element = document.getElementById('tooltipHeatmap')
        		if (element) element.innerHTML = "";
			}

			// add the squares
			svg.selectAll()
				.data(heatmapData, function (d) { return d[1] + ':' + d[0]; })
				.join("rect")
				.attr("x", function (d) { return x(d[1]) })
				.attr("y", function (d) { return y(d[0]) })
				.attr("rx", 4)
				.attr("ry", 4)
				.attr("width", x.bandwidth())
				.attr("height", y.bandwidth())
				.style("fill", function (d) { return myColor(d[2]) })
				.style("stroke-width", 2)
				.style("stroke", "none")
				.style("opacity", 0.8)
				.on("mouseover", mouseover)
				.on("mousemove", mousemove)
				.on("mouseleave", mouseleave)
		})

	}, [props.activeCategories])

	return (
		<div id="droppable" ref={setNodeRef} className={"shadow heatmap-area" + ((props.activeCategory) ? " dashed" : "")}>
			{props.children}
			{props.activeCategories.length === 2 && <div id="heatmap-chart"></div>}
		</div>
	);
}

export default HeatmapChart
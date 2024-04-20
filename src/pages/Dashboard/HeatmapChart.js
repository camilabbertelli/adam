
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/HeatmapChart.css";
import { useDroppable } from '@dnd-kit/core';
import React, { useEffect } from 'react';

import info from "./../../assets/images/info-black.png"
import expand from "./../../assets/images/dashboard/expand.png"

import * as d3 from "d3";
import { useTranslation } from 'react-i18next';

import $ from 'jquery';

var tooltipHeatmap;

const HeatmapChart = (props) => {
	const { setNodeRef } = useDroppable({
		id: 'droppable',
	});

	const { t } = useTranslation()

	let infoMouseOverHeatmap = function (event, d) {
        tooltipHeatmap
            .style("opacity", 1);

            tooltipHeatmap.html(`<center><b>${t("information")}</b></center>
                      Information missing<br>`)
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px")
    }


    let infoMouseLeaveHeatmap = function (event, d) {
        tooltipHeatmap
            .style("opacity", 0)

        let element = document.getElementById('tooltipHeatmap')
        if (element)
            element.innerHTML = "";
    }

	// Three function that change the tooltip when user hover / move / leave a cell
	const mouseover = function (event, d) {
		tooltipHeatmap.style("opacity", 1)
		d3.select(this)
			.style("stroke", "black")
	}

	const mousemove = function (event, d) {
		tooltipHeatmap
			.html(`<center><b>${d[0]} x ${d[1]}</b></center>
					Occurrence: ${d[2]}`)
			.style("top", event.pageY - 10 + "px")
			.style("left", event.pageX + 10 + "px");
	}

	const mouseleave = function (event, d) {
		tooltipHeatmap.style("opacity", 0)
		d3.select(this)
			.style("stroke", "#f1f1f1")

		let element = document.getElementById('tooltipHeatmap')
		if (element) element.innerHTML = "";
	}

	useEffect(() => {
		if (props.activeCategories.length === 2) {
			let globalData = d3.flatRollup(props.data, v => ({
				participants_total: v.length,
			}), (d) => d.title, (d) => d.subject_sex, (d) => d.anatomical_part, (d) => d.organs, (d) => d.action)

			let indexCategories = 2

			let heatmapD = {}
			Object.keys(props.categories).map((key, index) => {
				heatmapD[key] = index
			})

			let indexKey1 = indexCategories + heatmapD[props.activeCategories[0]]
			let indexKey2 = indexCategories + heatmapD[props.activeCategories[1]]

			let heatmapKey1 = Array.from(d3.group(globalData, d => d[indexKey1]).keys())
			let heatmapKey2 = Array.from(d3.group(globalData, d => d[indexKey2]).keys())
			let heatmapData = d3.flatRollup(globalData, v => v.length, d => d[indexKey1], d => d[indexKey2])

			heatmapKey1.sort()
			heatmapKey2.sort()

			let box_left = document.querySelector(".heatmap-left-header");
			let boundaries_left = box_left.getBoundingClientRect()
			let width_left = boundaries_left.width * 0.9
			let height_left = heatmapKey1.length * 40;

			let box_bottom = document.querySelector(".heatmap-bottom-header");
			let boundaries_bottom = box_bottom.getBoundingClientRect()
			let width_bottom = heatmapKey2.length * 80
			let height_bottom = boundaries_bottom.height * 0.9;

			let width_content = width_bottom;
			let height_content = height_left;

			d3.select(".heatmap-graph").selectAll("svg").remove("")
			d3.select(".heatmap-left-header").selectAll("svg").remove("")
			d3.select(".heatmap-bottom-header").selectAll("svg").remove("")
			// append the svg object to the body of the page
			const svg = d3.select(".heatmap-graph")
				.append("svg")
				.attr("width", width_content)
				.attr("height", height_content)
				.append("g")

			const svg_left_axis = d3.select(".heatmap-left-header")
				.append("svg")
				.attr("width", width_left)
				.attr("height", height_left)
				.append("g")

			const svg_bottom_axis = d3.select(".heatmap-bottom-header")
				.append("svg")
				.attr("width", width_bottom)
				.attr("height", height_bottom)
				.append("g")


			// Build X scales and axis:
			const x = d3.scaleBand()
				.range([0, width_bottom])
				.domain(heatmapKey2)
				.padding(0.05);

			// Build Y scales and axis:
			const y = d3.scaleBand()
				.range([0, height_left])
				.domain(heatmapKey1)
				.padding(0.05);

			svg_left_axis.append("g")
				.selectAll("text")
				.data(heatmapKey1)
				.join("text")
				.text((d) => d)
				.style("font-size", 14)
				.style("font-family", "EB Garamound")
				.attr("direction", "ltr")
				.attr("x", width_left)
				.attr("text-anchor", "end")
				.attr("y", d => y(d) + 25);

			svg_bottom_axis.append("g")
				.style("font-size", 14)
				.style("font-family", "EB Garamound")
				.attr("transform", `translate(0, 2)`)
				.call(d3.axisBottom(x).tickSize(0))
				.select(".domain").remove()

			// Build color scale
			const myColor = d3.scaleSequential()
				.interpolator(d3.interpolateLab("white", "#712121"))
				.domain([1, 13])

			d3.selectAll("#tooltipHeatmap").remove();

			tooltipHeatmap = d3.select("body")
				.append("div")
				.attr("id", "tooltipHeatmap")
				.attr("class", "tooltip shadow rounded")
				.attr("padding", "1px")
				.style("opacity", 0);

			
			d3.select("#infoHeatmap")
				.on("mouseover", infoMouseOverHeatmap)
				.on("mouseleave", infoMouseLeaveHeatmap)


			// add the squares
			svg.selectAll()
				.data(heatmapData)
				.join("rect")
				.attr("x", function (d) { return x(d[1]) })
				.attr("y", function (d) { return y(d[0]) })
				.attr("rx", 4)
				.attr("ry", 4)
				.attr("width", x.bandwidth())
				.attr("height", y.bandwidth())
				.style("fill", function (d) { return myColor(d[2]) })
				.style("stroke-width", 3)
				.style("stroke", "#ECECEC")
				.on("mouseover", mouseover)
				.on("mousemove", mousemove)
				.on("mouseleave", mouseleave)

		}
	}, [props.activeCategories, props.categories])

	function handleGraphScroll(e) {
		$('.heatmap-left-header').scrollTop($('.heatmap-graph').scrollTop());
		$('.heatmap-bottom-header').scrollLeft($('.heatmap-graph').scrollLeft());
	}

	function handleLeftScroll(e) {
		$('.heatmap-graph').scrollTop($('.heatmap-left-header').scrollTop());
	}

	function handleBottomScroll(e) {
		$('.heatmap-graph').scrollLeft($('.heatmap-bottom-header').scrollLeft());
	}

	return (
		<>
			<div id="droppable" ref={setNodeRef} className={"shadow heatmap-area" + ((props.activeCategory !== null && props.activeCategories.length !== 2) ? " dashed" : "")}>
				<img alt="info" id="infoHeatmap" src={info}
						style={{ marginTop: "10px", marginLeft: "10px" }} width="15" height="15"
				/>
				<div className='heatmap-content'>
					{props.children}
					{props.activeCategories.length === 2 &&
						<div id="heatmap-chart">
							<div className='heatmap-top-sector'>
								<div onScroll={handleLeftScroll} className='heatmap-left-header'></div>
								<div onScroll={handleGraphScroll} className='heatmap-graph'></div>
							</div>
							<div className='heatmap-bottom-sector'>
								<div className='heatmap-empty-space'></div>
								<div onScroll={handleBottomScroll} className='heatmap-bottom-header'></div>
							</div>

						</div>}
				</div>
				<img title={t("icon-expand")} alt="info" src={expand}
						style={{ marginTop: "10px", marginRight: "10px", float: "right" }} width="15" height="15"
				/>
			</div>

		</>
	);
}

export default HeatmapChart
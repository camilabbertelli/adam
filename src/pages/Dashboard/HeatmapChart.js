
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/HeatmapChart.css";
import { useDroppable } from '@dnd-kit/core';
import React, { useEffect, useRef, useState } from 'react';

import info from "./../../assets/images/info-black.png"
import expand from "./../../assets/images/dashboard/expand.png"
import shrink from "./../../assets/images/dashboard/shrink.png"
import back from "./../../assets/images/dashboard/arrow.png"

import * as d3 from "d3";
import { useTranslation } from 'react-i18next';

import $ from 'jquery';

var tooltipHeatmap;

let heatmap_boundaries_bottom = null
let heatmap_boundaries_left = null
let heatmap_boundaries_legend = null

function wrap(text, width) {
	text.each(function () {
		var text = d3.select(this),
			words = text.text().split(/\s+/),
			line = [],
			y = text.attr("y"),
			x = 25,
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y);


		let breakLine = false

		words.forEach(word => {
			if (word !== "" && !breakLine) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					breakLine = true
					line.pop();
					tspan.text(line.join(" "));
					line = [word + "..."];
					if (words.length === 1)
						tspan = text.append("tspan").attr("x", x).attr("y", Number(tspan.attr("y"))).text(word.substring(0, Math.floor((word.length / 1.5))) + "...");
					else {
						tspan.attr("y", Number(tspan.attr("y")) - 8)
						tspan = text.append("tspan").attr("x", x).attr("y", Number(tspan.attr("y")) + 16).text(word);
						if (tspan.node().getComputedTextLength() > width) {
							tspan.text(word.substring(0, Math.floor((word.length / 2))) + "...")
							tspan.attr("y", Number(tspan.attr("y")) - 16)
						}
					}
				}
			}
		})
	});
}


function wrap_bottom(text, width) {
	text.each(function () {
		var text = d3.select(this),
			words = text.text().split(/\s+/),
			line = [],
			y = text.attr("y"),
			tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y);


		let breakLine = false

		words.forEach(word => {
			if (word !== "" && !breakLine) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					breakLine = true
					line.pop();
					tspan.text(line.join(" "));
					line = [word + "..."];
					if (words.length === 1)
						tspan = text.append("tspan").attr("x", 0).attr("y", Number(tspan.attr("y"))).text(word.substring(0, Math.floor((word.length / 1.5))) + "...");
					else {
						tspan.attr("y", Number(tspan.attr("y")))
						tspan = text.append("tspan").attr("x", 0).attr("y", Number(tspan.attr("y")) + 20).text(word);
						if (tspan.node().getComputedTextLength() > width) {
							tspan.text(word.substring(0, Math.floor((word.length / 2))) + "...")
						}
					}
				}
			}
		})
	});
}


function noSpaces(str) {
	if (str)
		str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
	return str
}

const HeatmapChart = (props) => {
	const { setNodeRef } = useDroppable({
		id: 'droppable',
	});

	const { t } = useTranslation()
	const [data, setData] = useState([])

	const [details, setDetails] = useState([])

	const [indexKey1, setIndexKey1] = useState(null)
	const [indexKey2, setIndexKey2] = useState(null)
	const prevActiveCategories = useRef([])
	const prevCategories = useRef({})
	useEffect(() => {
		if (props.activeCategories.length === 2) {

			if (prevActiveCategories.current.length !== props.activeCategories.length
			|| (prevCategories.current[props.activeCategories[0]] && prevCategories.current[props.activeCategories[1]] && prevCategories.current[props.activeCategories[0]].index !== props.categories[props.activeCategories[0]].index)
			) {
				setIndexKey1(props.categories[props.activeCategories[0]].index)
				setIndexKey2(props.categories[props.activeCategories[1]].index)
				setDetails({})
			}
		}
		prevActiveCategories.current = [...props.activeCategories]
		prevCategories.current = { ...props.categories }
	}, [props.activeCategories, props.categories])

	useEffect(() => {
		let dataInitial = props.data.filter(entry => {
			let networkFilter = true
			let pyramidFilter = true
			let detailsFilter = true
			let sexes = ["Mult.", "N", props.pyramidData.sex]

			if (props.networkData.selected.length)
				networkFilter = props.networkData.people.includes(entry[props.csvIndexes.subject_name]) ||
					props.networkData.people.includes(entry[props.csvIndexes.with_name])
			props.networkData.people.includes(entry[props.csvIndexes.about_name])

			if (props.pyramidData.sex)
                pyramidFilter = sexes.includes(entry[props.csvIndexes.subject_sex])

            if (props.pyramidData.category)
                pyramidFilter = pyramidFilter && entry[props.pyramidData.categoryIndex] === props.pyramidData.category

			if (Object.keys(details).length)
				detailsFilter = entry[details.searchKey1] === details.key1 &&
					entry[details.searchKey2] === details.key2

			return networkFilter && pyramidFilter && detailsFilter
		})

		setData(dataInitial)
	}, [props.data, props.networkData, props.pyramidData, details])

	useEffect(() => {
		if (props.activeCategories.length === 2) {
			drawHeatmap(indexKey1, indexKey2)
		}
	}, [props.activeCategories, data, indexKey1, indexKey2, props.data])


	function cellClick(event, d) {
		if (Object.keys(details).length)
			return

		setIndexKey1(props.categories[props.activeCategories[0]].indexSubcategory)
		setIndexKey2(props.categories[props.activeCategories[1]].indexSubcategory)

		let aux = {
			searchKey1: props.categories[props.activeCategories[0]].index,
			key1: d[0],
			searchKey2: props.categories[props.activeCategories[1]].index,
			key2: d[1]
		}

		setDetails(aux)
		props.setHeatmapData(aux)
	}

	function backDetails() {
		setIndexKey1(props.categories[props.activeCategories[0]].index)
		setIndexKey2(props.categories[props.activeCategories[1]].index)
		setDetails({})
		props.setHeatmapData({})
	}

	function drawHeatmap(indexKey1, indexKey2) {

		let infoMouseOverHeatmap = function (event, d) {
			tooltipHeatmap
				.style("opacity", 1);

			tooltipHeatmap.html(`<center><b>${t("information")}</b></center>
						  ${t("information-heatmap")}`)
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
			d3.select(this).transition().duration(100)
				.style("stroke", "black")

			tooltipHeatmap
				.html(`<center><b>${d[0]} x ${d[1]}</b></center>
						Occurrence: ${d[2]}`)
				.style("top", event.pageY - 10 + "px")
				.style("left", event.pageX + 10 + "px");
		}

		const mouseleave = function (event, d) {
			tooltipHeatmap.style("opacity", 0)
			d3.select(this).transition().duration(100)
				.style("stroke", "#ECECEC")

			let element = document.getElementById('tooltipHeatmap')
			if (element) element.innerHTML = "";
		}

		d3.select(".heatmap-graph").selectAll("svg").remove("")
		d3.select(".heatmap-left-header").selectAll("svg").remove("")
		d3.select(".heatmap-bottom-header").selectAll("svg").remove("")
		d3.select(".heatmap-legend").selectAll("svg").remove("")

		if (!data.length || !indexKey1 || !indexKey2)
			return

		let heatmapKey1 = Array.from(d3.group(data, d => d[indexKey1]).keys())
		let heatmapKey2 = Array.from(d3.group(data, d => d[indexKey2]).keys())
		let heatmapData = d3.flatRollup(data, v => v.length, d => d[indexKey1], d => d[indexKey2])

		heatmapKey1.sort()
		heatmapKey2.sort()

		let box_left = document.querySelector(".heatmap-left-header");
		if (heatmap_boundaries_left === null)
			heatmap_boundaries_left = box_left.getBoundingClientRect()
		let width_left = heatmap_boundaries_left.width * 1;
		let height_left = heatmapKey1.length * 40;

		let box_bottom = document.querySelector(".heatmap-bottom-header");
		if (heatmap_boundaries_bottom === null)
			heatmap_boundaries_bottom = box_bottom.getBoundingClientRect();
		let width_bottom = heatmapKey2.length * 80;
		let height_bottom = heatmap_boundaries_bottom.height * 0.65;

		let width_content = width_bottom;
		let height_content = height_left;

		let box_legend = document.querySelector(".heatmap-legend");
		if (heatmap_boundaries_legend === null)
			heatmap_boundaries_legend = box_legend.getBoundingClientRect();
		let width_legend = heatmap_boundaries_legend.width;
		let height_legend = heatmap_boundaries_legend.height;

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

		const svg_legend = d3.select(".heatmap-legend")
			.append("svg")
			.attr("width", width_legend)
			.attr("height", height_legend)
			.append("g")

		function domainColorsHeatmap() {
			let colorRange = ["white", "#E4D1D1", "#B88989", "#A16666", "#894343", "#712121", "#5D1B1B", "#320404"]

			let unique = [...new Set(heatmapData.map(d => d[2]))];
			let min = Math.min(...unique)
			let max = Math.max(...unique)

			const colorScale = d3.scaleQuantile()
				.domain(unique)
				.range(colorRange)

			let quantiles = colorScale.quantiles()

			if (min < quantiles[0])
				quantiles.unshift(min)

			let domain = []

			quantiles.forEach((c) => {
				let factor = 5
				if (max <= 10) factor = 2
				if (c >= 40) factor = 50

				if (c !== min) c = Math.round(c / factor) * factor;
				if (c < min) c = min
				if (!domain.includes(c)) domain.push(c)
			})

			return [domain, max]
		}

		let [domain, maxValue] = domainColorsHeatmap()

		let colorRange = ["white", "#E4D1D1", "#B88989", "#A16666", "#894343", "#712121", "#5D1B1B", "#320404"].slice(0, domain.length)
		// Build color scale
		const myColor = d3.scaleThreshold()
			.range(["none"].concat(colorRange))
			.domain(domain)

		svg_legend.append("g")
			.selectAll(".legendRect")
			.data(colorRange)
			.join("rect")
			.attr("x", 10)
			.attr("y", (d, i) => i * (height_legend / (colorRange.length + 1)) + 5)
			.attr("ry", 5)
			.attr("width", 10)
			.attr("height", (height_legend / (colorRange.length)) - ((colorRange.length === 1) ? 5 : 0))
			.style("stroke", "black")
			.style("stroke-width", 1)
			.style("fill", d => d)


		svg_legend.append("g")
			.selectAll(".legendText")
			.data(domain)
			.join('text')
			.style("font-size", 14)
			.style("font-family", "lato")
			.attr("y", (d, i) => i * (height_legend / (colorRange.length + 1)) + 25)
			.attr("dx", "2em")
			.attr("dy", (height_legend / (colorRange.length + 1)) / colorRange.length)
			.attr("class", "seasonLabels")
			.text((d, i) => {
				if (i + 1 < domain.length) {
					if (domain[i] === (domain[i + 1] + 1))
						return domain[i];
					return domain[i] + "-" + (domain[i + 1] - 1);
				}
				if (i + 1 === domain.length) {
					if (maxValue > domain[i])
						return domain[i] + "-" + maxValue;
					return domain[i];
				}
			});



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
			.style("font-family", "lato")
			.attr("direction", "ltr")
			.attr("text-anchor", "start")
			.attr("y", d => y(d) + 25)

		svg_left_axis.selectAll("text")
			.call(wrap, width_left - 20)
			.append("svg:title").text(d=>d);

		svg_bottom_axis.append("g")
			.style("font-size", 14)
			.style("font-family", "lato")
			.attr("transform", `translate(0, 2)`)
			.call(d3.axisBottom(x).tickSize(0))
			.selectAll(".tick text")
			.call(wrap_bottom, x.bandwidth())
			.append("svg:title").text(d=>d);

		d3.select(".heatmap-bottom-header")
			.select(".domain").remove()

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
			.data(heatmapData, d => d[0] + ':' + d[1])
			.join("rect")
			.attr("class", d => `heatmap-${noSpaces(d[0])}-${noSpaces(d[1])}`)
			.attr("x", d => x(d[1]))
			.attr("y", d => y(d[0]))
			.attr("rx", 4)
			.attr("ry", 4)
			.attr("width", x.bandwidth())
			.attr("height", y.bandwidth())
			.style("fill", d => myColor(d[2]))
			.style("stroke-width", 3)
			.style("stroke", "#ECECEC")
			.on("mouseover", mouseover)
			.on("mouseleave", mouseleave)
			.on("click", cellClick)
	}

	function handleGraphScroll() {
		$('.heatmap-left-header').scrollTop($('.heatmap-graph').scrollTop());
		$('.heatmap-bottom-header').scrollLeft($('.heatmap-graph').scrollLeft());
	}

	function handleLeftScroll() {
		$('.heatmap-graph').scrollTop($('.heatmap-left-header').scrollTop());
	}

	function handleBottomScroll() {
		$('.heatmap-graph').scrollLeft($('.heatmap-bottom-header').scrollLeft());
	}


	const [isExpanded, setIsExpanded] = useState(false)

	function expandHeatmap() {
		if (props.activeCategories.length !== 2) return

		document.getElementById("overlay").style.display = (!isExpanded) ? "block" : "none";

		d3.selectAll(".heatmap-area").classed("heatmap-expand", !isExpanded)

		setIsExpanded(!isExpanded)
		props.setIsExpanded(!isExpanded)
	}

	useEffect(() => {
		setIsExpanded(props.isExpanded)
		d3.selectAll(".heatmap-area").classed("heatmap-expand", props.isExpanded)
	}, [props.isExpanded])

	return (
		<>
			{props.data.length > 0 &&
				<>
					<div id="droppable" ref={setNodeRef} className={"shadow heatmap-area" + ((props.activeCategory !== null && props.activeCategories.length !== 2) ? " dashed" : "")}>
						<div className='heatmap-content'>
							<div style={{display: "flex", marginLeft: "20%", width:"100%", height: (props.activeCategories.length === 2? "15%" : "100%")}}>
								<img alt="info" id="infoHeatmap" src={info}
									style={{ position: "absolute", left: "0", marginTop: "10px", marginLeft: "10px", cursor: "pointer" }} width="15" height="15"
								/>
								{props.children}
							</div>
							{props.activeCategories.length === 2 && <>
								<div id="heatmap-chart">
									<div className="heatmap-details-sector">
										{Object.keys(details).length !== 0 &&
											<>
												<img title={t("icon-back")} alt="info" src={back}
													style={{ width: "15px", height: "15px", marginRight: "10px", cursor: "pointer" }}
													onClick={backDetails}
												/>
												<span>{details.key1}</span>
												<span>&nbsp;&&nbsp;</span>
												<span>{details.key2}</span>
											</>
										}</div>
									<div className='heatmap-top-sector'>

										<div onScroll={handleLeftScroll} className='heatmap-left-header'></div>
										<div onScroll={handleGraphScroll} className='heatmap-graph'></div>
									</div>
									<div className='heatmap-bottom-sector'>
										<div className='heatmap-empty-space'></div>
										<div onScroll={handleBottomScroll} className='heatmap-bottom-header'></div>
									</div>
								</div>
							</>}
						</div>
						<div className='heatmap-right-sector'>
							<div className='heatmap-expand-icon'>
								<img title={isExpanded ? t("icon-shrink") : t("icon-expand")} alt="info" src={isExpanded ? shrink : expand}
									style={{ marginTop: "10px", marginRight: "10px", float: "right", cursor: "pointer" }} width="15px" height="15px"
									onClick={expandHeatmap}
								/>
							</div>
							{props.activeCategories.length === 2 &&
								<div className='heatmap-legend'></div>}
						</div>

					</div>
				</>}
			{props.data.length === 0 &&
				<div id="droppable" ref={setNodeRef} className="shadow heatmap-area" style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
					{t("no-data-to-show")}
				</div>
			}

		</>
	);
}

export default HeatmapChart
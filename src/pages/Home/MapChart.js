import React, { useEffect, useState } from 'react'
import * as d3 from 'd3'
import 'bootstrap/dist/css/bootstrap.css';
import './../../styles/Home/MapChart.css'

import drag from "./../../assets/images/left-click.png"
import scroll from "./../../assets/images/scroll.png"
import info from "../../assets/images/info-white.png"

// Geo json files
import europeData from "./../../assets/maps/europe.json";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

var tooltipMark;

const MapChart = ({ locations }) => {

    const { t } = useTranslation()
    let navigate = useNavigate();

    const gatherCodicesMarks = () => {
        let marks = [];

        locations.forEach(entry => {
            let places = []
            entry.places.forEach(place => {

                let centuries = place[4].split(" ")
                centuries.forEach(century => {
                    place[4] = century
                    places.push([...place])
                })
            })

            places = d3.flatGroup(places, d => d[0], d => d[1], d => d[2], d => d[3])

            places.forEach((place, index) => {
                let centuries = d3.flatRollup(place[4], v => d3.sum(v, d => d[5]), d => d[2], d => d[3], d => d[4])
                centuries = centuries.flatMap(d => [[d[2], d[3]]])
                places[index][4] = [...centuries]
            })

            entry.places = places
            marks.push(entry)
        })

        return marks;
    }

    let infoMouseOverMap = function (event, d, type) {
        tooltipMark
            .style("opacity", 1);

        tooltipMark.html(`<center><b>${t("information")}</b></center>
                      ${type === "legend" ? t("information-legend-map") : t("information-map")}`)

        let xposition = event.pageX + 10
        let yposition = event.pageY - 10
        let tooltip_rect = tooltipMark.node().getBoundingClientRect();
        if (xposition + tooltip_rect.width > window.innerWidth)
            xposition = xposition - 20 - tooltip_rect.width
        if (yposition + tooltip_rect.height > window.innerHeight)
            yposition = yposition + 20 - tooltip_rect.height

        tooltipMark
            .style("top", yposition + "px")
            .style("left", xposition + "px")
    }


    let infoMouseLeaveMap = function (event, d) {
        tooltipMark
            .style("opacity", 0)

        let element = document.getElementById('tooltip')
        if (element)
            element.innerHTML = "";
    }

    useEffect(() => {

        let box = document.querySelector('.viz');
        let width = box.offsetWidth * 0.87;
        let width_legend = box.offsetWidth * 0.13;
        let height = box.offsetHeight;

        // create a tooltipMark
        tooltipMark = d3.select("body")
            .select("#tooltip")

        d3.select("#infoMap")
            .on("mouseover", (event, d) => infoMouseOverMap(event, d, "map"))
            .on("mouseleave", infoMouseLeaveMap)

            
        d3.select("#infoMapLegend")
        .on("mouseover", (event, d) => infoMouseOverMap(event, d, "legend"))
        .on("mouseleave", infoMouseLeaveMap)

        d3.select(".viz").selectAll("svg").remove();

        // Create an SVG element to hold the map
        const svgInitial = d3
            .select(".viz")
            .append("svg")
            .attr("class", "svgMap")
            .attr("width", width)
            .attr("height", height)

        svgInitial
            .append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "transparent");

        const projection = d3.geoMercator().fitSize([width, height], europeData);

        // Creating path generator fromt the projection created above.
        const pathGenerator = d3.geoPath()
            .projection(projection);

        // Create a group to hold the map elements
        const mapGroup = svgInitial.append("g");


        mapGroup.append("g")
            .attr("id", "countries")
            .selectAll("path")
            .data(europeData.features)
            .enter()
            .append("path")
            .attr("d", pathGenerator)
            .attr("class", "country")

        // Create zoom behavior for the map
        const zoom = d3
            .zoom()
            .scaleExtent([1, 20])
            .translateExtent([
                [0, 0],
                [width, height],
            ])
            .on("zoom", zoomed);

        // Apply zoom behavior to the SVG element
        svgInitial.call(zoom);

        svgInitial.call(zoom.transform, d3.zoomIdentity.translate(-width / (1.5), -height / (1.1)).scale(2.5))

        // Function to handle the zoom event
        function zoomed(event) {
            mapGroup.attr("transform", event.transform);

            let baseZoom = 2.5
            let zoomFactor = (d3.zoomTransform(svgInitial.node()).k / baseZoom) * 0.5
            if (zoomFactor < 1)
                zoomFactor = 1

            svgInitial.attr("data-zoomFactor", zoomFactor)

            d3.selectAll(".mark")
                .transition()
                .duration(200)
                .attr("r", 1.4 / zoomFactor)
                .attr("stroke-width", 0.3 / zoomFactor)
        }

        var marks = gatherCodicesMarks();

        let colorRange = ["#f1f1f1", "#E4D1D1", "#B88989", "#A16666", "#894343", "#712121"]

        function pinOccurences(d) {
            let occurrences = 0
            d.places.forEach(place => {
                place[4].forEach(century => {
                    occurrences += century[1]
                })
            })
            return occurrences
        }

        function domainColorsHeatmap() {

            let unique = [...new Set(marks.map(d => pinOccurences(d)))];
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
                domain.push(Math.ceil(c))
            })

            domain = [...new Set(domain)]

            return [domain, max]
        }

        let [domain, maxValue] = domainColorsHeatmap()

        // Build color scale
        const myColor = d3.scaleThreshold()
            .range(["none"].concat(colorRange))
            .domain(domain)


        let svg_legend = d3.select(".maplegend")
            .append("svg")
            .attr("width", width_legend)
            .attr("height", height)
            .append("g")

        svg_legend.append("g")
            .selectAll(".legendRect")
            .data(colorRange)
            .join("rect")
            .attr("x", 10)
            .attr("y", (d, i) => i * (height / (colorRange.length + 1)) + 5)
            .attr("ry", 5)
            .attr("width", 10)
            .attr("height", (height / (colorRange.length)) - ((colorRange.length === 1) ? 5 : 0))
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("fill", d => d)


        svg_legend.append("g")
            .selectAll(".legendText")
            .data(colorRange)
            .join('text')
            .style("font-size", 14)
            .style("fill", "white")
            .style("font-family", "lato")
            .attr("y", (d, i) => i * (height / (colorRange.length + 1)) + 25)
            .attr("dx", "2em")
            .attr("dy", (height / (colorRange.length + 1)) / colorRange.length)
            .attr("class", "seasonLabels")
            .text((d, i) => {
                if (i + 1 < domain.length) {
                    if (domain[i] === (domain[i + 1] + 1))
                        return domain[i];
                    if (domain[i] === (domain[i + 1] - 1))
                        return domain[i]
                    return domain[i] + "-" + (domain[i + 1] - 1);
                }
                if (i + 1 === domain.length) {
                    if (maxValue > domain[i])
                        return domain[i] + "-" + maxValue;
                    return domain[i];
                }
                if (i >= domain.length)
                    return "-"
            });


        let mouseover = function (event, d) {
            d3.selectAll(`#${noSpaces(d.title)}`)
                .classed("hover", true)

            tooltipMark
                .style("opacity", "1");

            let placesString = []

            d.places.forEach(place => {
                let centuriesOccurrences = []
                place[4].forEach(century => {
                    centuriesOccurrences.push(`${century[0]} (${century[1]})`)
                })
                placesString.push(`<b>${t("mapchart-place")}:</b> ${place[3]} <br>
                        <b>${t("mapchart-title")}:</b> ${place[2]} <br>
                        <b>${t("mapchart-occurrences")}:</b> ${centuriesOccurrences.join(", ")} <br>`)
            })

            tooltipMark
                .html(placesString.join("<br>"))

            let xposition = event.pageX + 10
            let yposition = event.pageY - 10
            let tooltip_rect = tooltipMark.node().getBoundingClientRect();
            if (xposition + tooltip_rect.width > window.innerWidth)
                xposition = xposition - 20 - tooltip_rect.width
            if (yposition + tooltip_rect.height > window.innerHeight)
                yposition = yposition + 20 - tooltip_rect.height

            tooltipMark
                .style("top", yposition + "px")
                .style("left", xposition + "px")
        }

        let mouseleave = function (event, d) {

            tooltipMark
                .style("opacity", "0")

            let element = document.getElementById('tooltip')
            if (element)
                element.innerHTML = "";

            d3.selectAll(`#${noSpaces(d.title)}`)
                .classed("hover", false)
        }

        let mouseclick = function (event, d) {
            tooltipMark
                .style("opacity", "0")

            let element = document.getElementById('tooltip')
            if (element)
                element.innerHTML = "";

            d3.selectAll(`#${noSpaces(d.title)}`)
                .classed("hover", false)

            navigate("/dashboard", {
                state: {
                    mark: d
                }
            })
        }

        marks.sort((a, b) => pinOccurences(a) - pinOccurences(b))

        mapGroup.selectAll(".mark")
            .data(marks)
            .enter()
            .append("circle")
            .attr("class", function (d) {
                let c = []
                let occurrences = 0
                d.places.forEach(place => {
                    place[4].forEach(century => {
                        occurrences += century[1]
                        if (!c.includes(century[0] + "-" + noSpaces(place[2])))
                            c.push(century[0] + "-" + noSpaces(place[2]))
                    })
                })
                return "mark " + c.join(" ") + " " + myColor(occurrences)
            })
            .attr("r", 1.4)
            .attr("cy", 0)
            .attr("cx", 0)
            .attr("fill", d => myColor(pinOccurences(d)))
            .attr("stroke", "#331f1d")
            .attr("stroke-width", 0.3)
            .attr("cursor", "pointer")
            .attr("transform", function (d) { return "translate(" + projection([d.long, d.lat]) + ")"; })
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
            .on("click", mouseclick)
    }, [locations]);

    const [firstTimeTooltip, setFirstTimeTooltip] = useState(true)

    function mapmouseenter() {
        if (firstTimeTooltip) {
            setFirstTimeTooltip(false)
            d3.selectAll(".map-icons").transition().duration(500).style("opacity", 1)

            setTimeout(() => {
                d3.selectAll(".map-icons").transition().duration(500).style("opacity", 0)
            }, 5000);
        }
    }

    return (
        <>
            <div className="map" onMouseEnter={mapmouseenter}>
                <img title="Zoom" className="map-icons" alt="icon-zoom" src={scroll} style={{ opacity: 0 }} />
                <img title="Drag" className="map-icons" alt="icon-drag" src={drag} style={{ marginLeft: "35px", opacity: 0 }} />
                <div className="viz">
                    <img alt="info" id="infoMapLegend" src={info} className='map-legend-icon'/>
                    <div className="maplegend">
                    </div>
                </div>
            </div>
        </>
    );
}

export default MapChart;
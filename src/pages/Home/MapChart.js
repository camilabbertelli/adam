import React, { useEffect, useState } from 'react'
import * as d3 from 'd3'
import 'bootstrap/dist/css/bootstrap.css';
import './../../styles/Home/MapChart.css'

import drag from "./../../assets/images/left-click.png"
import scroll from "./../../assets/images/scroll.png"

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

    let infoMouseOverMap = function (event, d) {
        tooltipMark
            .style("opacity", 1);

        tooltipMark.html(`<center><b>${t("information")}</b></center>
                      ${t("information-map")}`)
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px")
    }


    let infoMouseLeaveMap = function (event, d) {
        tooltipMark
            .style("opacity", 0)

        let element = document.getElementById('tooltip')
        if (element)
            element.innerHTML = "";
    }

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
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px")
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

    useEffect(() => {

        let box = document.querySelector('.viz');
        let width = box.offsetWidth;
        let height = box.offsetHeight;

        // create a tooltipMark
        tooltipMark = d3.select("body")
            .select("#tooltip")

        d3.select("#infoMap")
            .on("mouseover", infoMouseOverMap)
            .on("mouseleave", infoMouseLeaveMap)

        d3.select(".viz").html("");

        // Create an SVG element to hold the map
        const svgInitial = d3
            .select(".viz")
            .append("svg")
            .attr("width", width)
            .attr("height", height)

        svgInitial
            .append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "transparent");

        const projection = d3.geoMercator().fitSize([width, height], europeData);

        // Creating path generator fromt the projecttion created above.
        const pathGenerator = d3.geoPath()
            .projection(projection);

        // Create a group to hold the map elements
        const mapGroup = svgInitial.append("g");


        // Creating state layer on top of counties layer.
        mapGroup.append("g")
            .attr("id", "countries")
            .selectAll("path")
            .data(europeData.features)
            .enter()
            .append("path")
            .attr("key", feature => {
                return feature.properties.NAME
            })
            .attr("d", pathGenerator)
            .attr("class", "country")
            // Here's an example of what I was saying in my previous comment.
            .attr("fill", "#d8b89a")

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

        svgInitial.call(zoom.transform, d3.zoomIdentity.translate(-width / (1.5), -height / (0.8)).scale(2.5))

        // Function to handle the zoom event
        function zoomed(event) {
            mapGroup.attr("transform", event.transform);
        }

        var marks = gatherCodicesMarks();

        mapGroup.selectAll(".mark")
            .data(marks)
            .enter()
            .append("circle")
            .attr("class", function (d) {
                let c = []
                d.places.forEach(place => {
                    place[4].forEach(century => {
                        if (!c.includes(century[0] + "-" + noSpaces(place[2])))
                            c.push(century[0] + "-" + noSpaces(place[2]))
                    })
                })
                return "mark " + c.join(" ")
            })
            .attr("r", 1.3)
            .attr("cy", 0)
            .attr("cx", 0)
            .attr("fill", "white")
            .attr("stroke", "#54220b")
            .attr("stroke-width", 0.6)
            .attr("cursor", "pointer")
            .attr("transform", function (d) { return "translate(" + projection([d.long, d.lat]) + ")"; })
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
            .on("click", mouseclick)
    }, [locations]);

    const [firstTimeTooltip, setFirstTimeTooltip] = useState(true)

    function mapmouseenter(){
        if (firstTimeTooltip){
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
                <img title="Zoom" className="map-icons" alt="icon-zoom" src={scroll} style={{ opacity: 0}}/>
                <img title="Drag" className="map-icons" alt="icon-drag" src={drag} style={{ marginLeft: "35px", opacity:0}}/>
                <div className="viz">
                </div>
            </div>
        </>
    );
}

export default MapChart;
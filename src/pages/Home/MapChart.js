import React, { useEffect } from 'react'
import * as d3 from 'd3'
import 'bootstrap/dist/css/bootstrap.css';
import './../../styles/Home/MapChart.css'

// Geo json files
import europeData from "./../../assets/maps/europe.json";
import { useTranslation } from 'react-i18next';

function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

var tooltipMark;

const MapChart = ({ codices }) => {

    const {t} = useTranslation()

    const gatherCodicesMarks = () => {
        let marks = [];

        for (const [key, value] of Object.entries(codices)) {
            value.forEach(codex => {
                codex.marks.forEach(mark => {
                    mark["title"] = codex.title
                    mark["century"] = key
                    marks.push(mark);
                })
            })
        }

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

        let element = document.getElementById('tooltipMark')
        if (element)
            element.innerHTML = "";
    }

    let mouseover = function (event, d) {
        d3.selectAll(`#${noSpaces(d.title)}`)
            .classed("hover", true)

        tooltipMark
            .style("opacity", "1");

        tooltipMark
            .html(
                `<center><b>${d.title} </b><br><b>${d.century}</b></center> <br>
                City: ${d.city} <br>
                Country: ${d.country} <br>`)
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px")
    }

    let mouseleave = function (event, d) {
        tooltipMark
            .style("opacity", "0")

        let element = document.getElementById('tooltipMark')
        if (element)
            element.innerHTML = "";

        d3.selectAll(`#${noSpaces(d.title)}`)
            .classed("hover", false)
    }

    useEffect(() => {

        let box = document.querySelector('.viz');
        let width = box.offsetWidth;
        let height = box.offsetHeight;

        d3.selectAll("#tooltipMark").remove();
        // create a tooltipMark
        tooltipMark = d3.select("body")
            .append("div")
            .attr("id", "tooltipMark")
            .attr("class", "tooltip shadow rounded")
            .attr("padding", "1px")
            .style("opacity", "0")

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
            .on("click", handleZoom)

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

        function handleZoom(event, item) {
            // Set the state backgroud to 'none' so that the counties can be displayed.
            //active.classed("active", false);
            //active = d3.select(this).classed("active", true);
        }

        var marks = gatherCodicesMarks();

        mapGroup.selectAll(".mark")
            .data(marks)
            .enter()
            .append("circle")
            .attr("class", function (d) {
                return "mark " + noSpaces(d.title)
            })
            .attr("r", 2)
            .attr("cy", 0)
            .attr("cx", 0)
            .attr("fill", "white")
            .attr("stroke", "#54220b")
            .attr("transform", function (d) { return "translate(" + projection([d.long, d.lat]) + ")"; })
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
    }, []);

    return (
        <>
            <div className="map">
                <div className="viz">
                </div>
            </div>
        </>
    );
}

export default MapChart;
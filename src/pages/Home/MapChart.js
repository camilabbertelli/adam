import React, { useEffect } from 'react'
import * as d3 from 'd3'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

import './../../styles/MapChart.css'

// Geo json files
import europeData from "./../../assets/maps/europe.json";

const mapRatio = 0.5

const margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10
}

const colorScale = ["#D9AB96", "#D9AB96", "#D9AB96", "#D9AB96"]
//const colorScale = ["#D7BBA8", "#A79596", "#B88083", "#BC4B51"];

const MapChart = () => {
    // A random color generator
    const colorGenerator = () => {
        return colorScale[Math.floor(Math.random() * 4)]
    }

    useEffect(() => {

        let boundariesWidth = parseInt(d3.select('.section').style('width'))
        let active = d3.select(null);

        var width = boundariesWidth - margin.left - margin.right
        var height = width * mapRatio

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
            .attr("fill", colorGenerator)
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

        svgInitial.call(zoom.transform, d3.zoomIdentity.translate(-width/(2.5), -height).scale(2))

        // Function to handle the zoom event
        function zoomed(event) {
            mapGroup.attr("transform", event.transform);
        }

        function handleZoom(event, item) {
            // Set the state backgroud to 'none' so that the counties can be displayed.
            //active.classed("active", false);
            //active = d3.select(this).classed("active", true);

            toast.info(`Selected state is ${item.properties.NAME}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }

        var marks = [{long: -9.142685, lat: 38.736946}];

        mapGroup.selectAll(".mark")
            .data(marks)
            .enter()
            // .append("svg")
            // .attr("xmlns", "http://www.w3.org/2000/svg")
            // .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
            // .attr('width', 20)
            // .attr('height', 20)
            // .attr("viewBox", "0 0 280.107 280.107")
            // .attr("xml:space", "preserve")
            // .html(`<g id="SVGRepo_bgCarrier" stroke-width="0"/>

            // <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
            
            // <g id="SVGRepo_iconCarrier"> <g> <path style="fill:#bc5252;" d="M140.049,0C79.677,0,30.725,47.412,30.725,105.903c0,1.138,0.543,28.353,9.941,47.762 c26.926,60.162,99.287,126.782,99.383,126.441c0.123,0.228,72.177-66.025,99.235-126.082c8.033-14.238,10.098-45.802,10.098-48.13 C249.391,47.412,200.43,0,140.049,0z M140.067,140.049c-16.933,0-30.628-13.704-30.628-30.619 c0-16.924,13.695-30.637,30.628-30.637c16.924,0,30.628,13.713,30.628,30.637C170.695,126.345,156.991,140.049,140.067,140.049z"/> <path style="fill:#642020;" d="M140.067,61.3c-26.576,0-48.13,21.545-48.13,48.13c0,26.576,21.553,48.121,48.13,48.121 s48.13-21.545,48.13-48.121C188.197,82.844,166.643,61.3,140.067,61.3z M140.067,140.049c-16.933,0-30.628-13.704-30.628-30.619 c0-16.924,13.695-30.637,30.628-30.637c16.924,0,30.628,13.713,30.628,30.637C170.695,126.345,156.991,140.049,140.067,140.049z"/> </g> </g>
            // `)
            .append("circle")
            .attr("class", "mark")
            .attr("r", 2)
            .attr("cy", 0)
            .attr("cx", 0)
            .attr("fill", "#a44316")
            .attr("transform", function(d) {return "translate(" + projection([d.long,d.lat]) + ")";});
    }, []);

    return (
        <>
            <div class="map">
            <div className="viz">
            </div>
            </div>
            <ToastContainer />
        </>
    );
}

export default MapChart;
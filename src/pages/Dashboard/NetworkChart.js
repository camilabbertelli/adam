
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/NetworkChart.css";

import info from "./../../assets/images/info-black.png"
import expand from "./../../assets/images/dashboard/expand.png"
import shrink from "./../../assets/images/dashboard/shrink.png"
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import data from "./data.js"

import * as d3 from "d3"

export const RADIUS = 10;

// export const drawNetwork = (
//   context,
//   width,
//   height,
//   nodes,
//   links
// ) => {
//   context.clearRect(0, 0, width, height);

//   // Draw the links first
//   links.forEach((link) => {
//     context.beginPath();
//     context.moveTo(link.source.x, link.source.y);
//     context.lineTo(link.target.x, link.target.y);
//     context.stroke();
//   });

//   // Draw the nodes
//   nodes.forEach((node) => {
//     if (!node.x || !node.y) {
//       return;
//     }

//     context.beginPath();
//     context.moveTo(node.x + RADIUS, node.y);
//     context.arc(node.x, node.y, RADIUS, 0, 2 * Math.PI);
//     context.fillStyle = '#cb1dd1';
//     context.fill();
//   });
// };

let network_boundaries = null;

const NetworkChart = (props) => {
    let tooltipNetwork;

    const { t } = useTranslation()
    const [isExpanded, setIsExpanded] = useState(false)

    function expandNetwork() {
        document.getElementById("overlay").style.display = (!isExpanded) ? "block" : "none";

        d3.selectAll(".network-area").classed("network-expand", !isExpanded)

        setIsExpanded(!isExpanded)
        props.setIsExpanded(!isExpanded)
    }

    useEffect(() => {
        setIsExpanded(props.isExpanded)
        d3.selectAll(".network-area").classed("network-expand", props.isExpanded)
    }, [props.isExpanded])

    useEffect(() => {

        if (props.data.length === 0)
            return

        let mouseOver = function (event, d) {
            tooltipNetwork
                .style("opacity", "1");
        }

        let mouseMove = function (event, d) {
            tooltipNetwork
                .html(``)
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px")
        }

        let mouseLeave = function (event, d) {
            tooltipNetwork
                .style("opacity", "0")

            let element = document.getElementById('tooltipNetwork')
            if (element)
                element.innerHTML = "";
        }

        let infoMouseOverNetwork = function (event, d) {
            tooltipNetwork
                .style("opacity", 1);

            tooltipNetwork.html(`<center><b>${t("information")}</b></center>
						  ${t("information-network")}`)
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px")
        }

        let infoMouseLeaveNetwork = function (event, d) {
            tooltipNetwork
                .style("opacity", 0)

            let element = document.getElementById('tooltipNetwork')
            if (element)
                element.innerHTML = "";
        }

        d3.selectAll("#tooltipNetwork").remove();
        // create a tooltipNetwork
        tooltipNetwork = d3.select("body")
            .append("div")
            .attr("id", "tooltipNetwork")
            .attr("class", "tooltip shadow rounded")
            .attr("padding", "1px")
            .style("opacity", "0")

        d3.select("#infoNetwork")
            .on("mouseover", infoMouseOverNetwork)
            .on("mouseleave", infoMouseLeaveNetwork)

        let box = document.querySelector('.network-graph');
        if (network_boundaries === null)
            network_boundaries = box.getBoundingClientRect()

        let width = network_boundaries.width;
        let height = network_boundaries.height;


        let subject_original = d3.flatGroup(props.data, d=>d[props.csvIndexes.subject_name], d=>d[props.csvIndexes.title], d=>d[props.csvIndexes.subject_number]).flatMap(d =>[[d[0], d[1], d[2]]])
        let with_original = d3.flatGroup(props.data, d=>d[props.csvIndexes.with_name], d=>d[props.csvIndexes.title]).flatMap(d =>[[d[0], d[1]]])
        let about_original = d3.flatGroup(props.data, d=>d[props.csvIndexes.about_name], d=>d[props.csvIndexes.title]).flatMap(d =>[[d[0], d[1]]])
        
        subject_original = subject_original.filter(entry => {
            return (entry[2] === "Individual")
        }).flatMap(d =>[[d[0], d[1]]])
        
        
        let concat_arrays = [...new Set([...subject_original, ...with_original, ...about_original])]

        concat_arrays = concat_arrays.filter(entry => {
            return (entry[0] !== "Não aplicável")
        })
        
        let mappedSubject = concat_arrays.map(entry => ({
            person : entry[0],
            group: entry[1]
        }))

        let s = d3.flatRollup(mappedSubject, v=>({
            multipleGroups : v.length !== 1,
            group: v[0].group
        }), d=>d.person)

        let nodes = s.map(entry => ({
            person : entry[0],
            multipleGroups: entry[1].multipleGroups,
            group: entry[1].group
        }))

        let with_links = d3.flatRollup(props.data, v=>v.length, d=>d[props.csvIndexes.subject_name], d=>d[props.csvIndexes.with_name], d=>d[props.csvIndexes.subject_number]).flatMap(d => [[d[0], d[1], d[2], d[3]]])

        with_links = with_links.filter(entry => {
            return (entry[2] === "Individual" && entry[0] !== "Não aplicável" && entry[1] !== "Não aplicável")
        }).flatMap(d =>[[d[0], d[1], d[3]]])
        
        with_links = with_links.map((entry, index) => ({
            id: index,
            source: entry[0],
            target: entry[1],
            value: entry[2],
            type: "with"
        }))

        let about_links = d3.flatRollup(props.data, v=>v.length, d=>d[props.csvIndexes.subject_name], d=>d[props.csvIndexes.with_name], d=>d[props.csvIndexes.about_name], d=>d[props.csvIndexes.subject_number]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4]]])

        about_links = about_links.filter(entry => {
            return (entry[3] === "Individual" && entry[0] !== "Não aplicável" && entry[2] !== "Não aplicável")
        }).flatMap(d =>[[d[0], d[1], d[2], d[4]]])
        
        about_links = about_links.map((entry, index) => ({
            id: index,
            source: entry[0],
            target: entry[2],
            value: entry[3],
            type: "about",
            with_id: with_links.findIndex(({source, target}) => (source === entry[0] && target === entry[1])) 
        }))

        let links = [...new Set([...with_links, ...about_links])]

        function ForceGraph({
            nodes, // an iterable of node objects (typically [{id}, …])
            links // an iterable of link objects (typically [{source, target}, …])
        }, {
            nodeStrength = -35,
            linkSource = ({ source }) => source, // given d in links, returns a node identifier string
            linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
            linkStrength,
            colors = d3.schemeTableau10, // an array of color strings, for the node groups
            width,height,
        } = {}) {
            
            // Compute values.
            const N = d3.map(nodes, d => d.person)
            const LS = d3.map(links, linkSource)
            const LT = d3.map(links, linkTarget)
            let G = d3.map(nodes, d => d.group)

            // Replace the input nodes and links with mutable objects for the simulation.
            nodes = d3.map(nodes, (d, i) => ({ person: d.person, multipleGroups: d.multipleGroups }));
            links = d3.map(links, (d, i) => ({ id: i, source: LS[i], target: LT[i], value: d.value, type: d.type, with_id: d["with_id"] }));

            // Construct the scales.
            const color = d3.scaleOrdinal(G, colors);

            // Construct the forces.
            const forceNode = d3.forceManyBody();
            const forceLink = d3.forceLink(links).id((d, i) => N[i]);
            if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
            if (linkStrength !== undefined) forceLink.strength(linkStrength);

            const simulation = d3.forceSimulation(nodes)
                .force("link", forceLink)
                .force("charge", forceNode)
                .force("center", d3.forceCenter())
                .on("tick", ticked);

            d3.select(".network-graph").selectAll("svg").remove("")

            const svgInitial = d3
                .select(".network-graph")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [-width / 2, -height / 2, width, height])
                .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

            const svg = svgInitial.append("g");
            // Create zoom behavior for the map
            const zoom = d3
                .zoom()
                .scaleExtent([0, 20])
                .on("zoom", zoomed);

            // Apply zoom behavior to the SVG element
            svgInitial.call(zoom);

            // Function to handle the zoom event
            function zoomed(event) {
                svg.attr("transform", event.transform);
            }

            let types = Array.from(new Set(links.map(d => {
                return (d.type)
            }))).sort()

            // about / with
            let colorLine = d3.scaleOrdinal(types, ["#D49669", "#383838"])

            // Per-type markers, as they don't inherit styles.
            svg.append("defs").selectAll("marker")
                .data(types)
                .join("marker")
                .attr("id", d => `arrow-${d}`)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 25)
                .attr("refY", 0)
                .attr("markerWidth", 5)
                .attr("markerHeight", 5)
                .attr("markerUnits", "userSpaceOnUse")
                .attr("orient", "auto")
                .append("path")
                .attr("fill", colorLine)
                .attr("d", 'M0,-5L10,0L0,5');

            const link = svg.append("g")
                .selectAll("line")
                .data(links)
                .join("line")
                .attr("stroke", d=> colorLine(d.type))
                .attr("stroke-linecap", "round")
                .attr("stroke-linejoin", "round")
                .attr("stroke-dasharray", d=> {
                    return (d.type === "about" ? "3, 3" : "")
                })
                .attr("stroke-width", (d, i) => Math.sqrt(d.value))
                .attr("marker-end", d => `url(#arrow-${d.type})`);

            const node = svg.append("g")
                .selectAll("circle")
                .data(nodes)
                .join("circle")
                .attr("stroke", "white")
                .attr("stroke-opacity", 1)
                .attr("stroke-width", 1.5)
                .attr("fill", ({ index: i }) => color(G[i]))
                .attr("r", 8)
                .call(drag(simulation))

            const text = svg.append("g")
                .selectAll("text")
                .data(nodes)
                .join("text")
                .attr("class", "network-node-text")
                .attr("fill","black")
                .attr("text-anchor", "middle")
                .attr("cursor", "pointer")
                .text((d, i) => {
                    return (d.person)
                })
                .call(drag(simulation))

            // TODO: tooltip
            // if (T) node.append("title").text(({ index: i }) => T[i]);

            function ticked() {
                link
                    .attr("x1", d => {
                        if (d.type === "about" && d.with_id !== undefined && d.with_id !== -1)
                            return (links[d.with_id].source.x + links[d.with_id].target.x) / 2
                        
                        return d.source.x
                    })
                    .attr("y1", d => {
                        if (d.type === "about" && d.with_id !== undefined && d.with_id !== -1)
                            return (links[d.with_id].source.y + links[d.with_id].target.y) / 2
                        
                        return d.source.y
                    })
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);


                text
                    .attr("x", d => d.x)
                    .attr("y", d => d.y + 4)
                    .text(d=> {
                        let finalText = d.person.slice(0, 6)
                        return (finalText + (finalText !== d.person ? "..." : ""))
                    })
            }

            function drag(simulation) {
                function dragstarted(event) {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    event.subject.fx = event.subject.x;
                    event.subject.fy = event.subject.y;
                }

                function dragged(event) {
                    event.subject.fx = event.x;
                    event.subject.fy = event.y;
                }

                function dragended(event) {
                    if (!event.active) simulation.alphaTarget(0);
                    event.subject.fx = null;
                    event.subject.fy = null;
                }

                return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended);
            }

            return Object.assign(svg.node(), { scales: { color } });
        }

        ForceGraph({nodes, links}, {
            width,
            height,
        })
    }, [props.data]);

    return (
        <>
            <div className="network-area shadow">
                <div className='network-top-section'>
                    <div className='network-title'>

                        <h5 className='network-top-title'>{t("network-label")}</h5>
                        <img alt="info" id="infoNetwork" src={info}
                            style={{ marginLeft: "5px", cursor: "pointer" }} width="15px" height="15px"
                        />
                    </div>
                    <img title={isExpanded ? t("icon-shrink") : t("icon-expand")} alt="info" src={isExpanded ? shrink : expand}
                        style={{ position: "absolute", top: "10px", right: "15px", cursor: "pointer" }} width="15px" height="15px"
                        onClick={expandNetwork}
                    />
                </div>
                <div className='network-bottom-section'>
                    <div className='network-graph'>
                        {props.data.length === 0 &&
                            <div className=''>
                                {t("no-data-to-show")}
                            </div>}
                    </div>

                    <div className='shadow network-legend'>
                        <div className='network-legend-items'>
                            <hr className='legend-about-who' />
                            <p style={{ lineHeight: "200%" }}>{t("network-about-who")}</p>
                        </div>
                        <div className='network-legend-items'>
                            <hr className='legend-with-who' />
                            <p style={{ lineHeight: "200%" }}>{t("network-with-who")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NetworkChart
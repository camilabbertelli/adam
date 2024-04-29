
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/NetworkChart.css";

import info from "./../../assets/images/info-black.png"
import expand from "./../../assets/images/dashboard/expand.png"
import shrink from "./../../assets/images/dashboard/shrink.png"
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import * as d3 from "d3"

function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&\/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

let network_boundaries = null;
let colorNode = null;

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

    const [typeClick, setTypeClick] = useState("")

    useEffect(() => {

        if (props.data.length === 0)
            return

        let mouseover = function (event, d) {
            tooltipNetwork
                .style("opacity", "1");

                let groups = d.groups.join("<br/>")
            tooltipNetwork
                .html(`<b>${t("network-tooltip-person")}: </b>${d.person}<br/>
                       <b>${t("network-tooltip-groups")}: </b>${d.multipleGroups ? "<br/>" : ""} ${groups}<br/>
                       <b>${t("network-tooltip-sex")}: </b>${d.sex}<br/>
                       <b>${t("network-tooltip-qualities")}: </b>${d.qualities.length ? d.qualities.join(" | ") : "-"}`)
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px")

            let tooltip_rect = tooltipNetwork.node().getBoundingClientRect();
            
            if (tooltip_rect.x + tooltip_rect.width > window.innerWidth){
                tooltipNetwork.style("left", event.pageX - 20 - tooltip_rect.width + "px")
                tooltipNetwork.style("top", event.pageY + 10 + "px")
            }
            
            tooltip_rect = tooltipNetwork.node().getBoundingClientRect();
            if (tooltip_rect.y + tooltip_rect.height > window.innerHeight){
                tooltipNetwork.style("left", tooltip_rect.left - 10 - tooltip_rect.width + "px")
                tooltipNetwork.style("top", event.pageY + 20 - tooltip_rect.height + "px")
            }
        }

        let mouseleave = function (event, d) {
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

            let tooltip_rect = tooltipNetwork.node().getBoundingClientRect();
            if (tooltip_rect.x + tooltip_rect.width > window.outerWidth)
                tooltipNetwork.style("left", event.pageX + 10 - tooltip_rect.width + "px")
            if (tooltip_rect.y + tooltip_rect.height > window.outerHeight)
                tooltipNetwork.style("top", event.pageY - 10 - tooltip_rect.height + "px")
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

        function legendover(){
            let id = d3.select(this).node().id

            d3.select(".network-graph").selectAll("line").filter(
                entry=> entry.type !== id
            ).transition().duration(200).style("stroke-opacity", 0.2)

            d3.select(".network-graph").selectAll("marker").filter(
                entry=> entry.type !== id
            ).transition().duration(200).style("stroke-opacity", 0.2)
        }

        function legendleave(){
            let id = d3.select(this).node().id

            d3.select(".network-graph").selectAll("line").filter(
                entry=> entry.type !== id
            ).transition().duration(200).style("stroke-opacity", 1)
            
            d3.select(".network-graph").selectAll("marker").filter(
                entry=> entry.type !== id
            ).transition().duration(200).style("stroke-opacity", 1)
        }

        d3.selectAll(".network-legend-items")
            .on("mouseover", legendover)
            .on("mouseleave", legendleave)

        let box = document.querySelector('.network-graph');
        if (network_boundaries === null)
            network_boundaries = box.getBoundingClientRect()

        let width = network_boundaries.width;
        let height = network_boundaries.height;


        let subject_nodes = d3.flatGroup(props.data, d => d[props.csvIndexes.subject_name], d => d[props.csvIndexes.title], d => d[props.csvIndexes.subject_number], d=>d[props.csvIndexes.subject_sex], d=>d[props.csvIndexes.subject_qualities]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4]]])
        let with_nodes = d3.flatGroup(props.data, d => d[props.csvIndexes.with_name], d => d[props.csvIndexes.title], d=>d[props.csvIndexes.with_sex], d=>d[props.csvIndexes.with_qualities]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4]]])
        let about_nodes = d3.flatGroup(props.data, d => d[props.csvIndexes.about_name], d => d[props.csvIndexes.title], d=>d[props.csvIndexes.about_sex], d=>d[props.csvIndexes.about_qualities]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4]]])

        subject_nodes = subject_nodes.filter(entry => {
            return (entry[2] === "Individual")
        }).flatMap(d => [[d[0], d[1], d[3], d[4]]])

        let concat_arrays = [...new Set([...subject_nodes, ...with_nodes, ...about_nodes])]

        concat_arrays = d3.flatGroup(concat_arrays, d=> d[0], d => d[1]).flatMap(d => [[d[0], d[1], d[2]]])

        concat_arrays = concat_arrays.filter(entry => {
            return (entry[0] !== "Não aplicável")
        })

        let nodesOriginal = concat_arrays.map(entry => {
            return({
            person: entry[0],
            group: entry[1],
            sex: [...new Set(entry[2].flatMap(d=> [d[2]]))],
            qualities: [...new Set(entry[2].flatMap(d=> [d[3]]))].filter(entry=>entry !== "Não aplicável"),
        })})

        nodesOriginal = d3.flatRollup(nodesOriginal, v => {
            let dict = {
                multipleGroups: v.length !== 1,
                groups: v.flatMap(d => [d.group]),
                sex: [...new Set(v.flatMap(d=> d.sex))],
                qualities: [...new Set(v.flatMap(d=> d.qualities))]
            }
            return dict
        }, d => d.person)

        nodesOriginal = nodesOriginal.map(entry => ({
            person: entry[0],
            ...entry[1]
        }))
        

        let with_links = d3.flatRollup(props.data, v => v.length, d => d[props.csvIndexes.subject_name], d => d[props.csvIndexes.with_name], d => d[props.csvIndexes.subject_number]).flatMap(d => [[d[0], d[1], d[2], d[3]]])

        with_links = with_links.filter(entry => {
            return (entry[2] === "Individual" && entry[0] !== "Não aplicável" && entry[1] !== "Não aplicável")
        }).flatMap(d => [[d[0], d[1], d[3]]])

        with_links = with_links.map((entry, index) => ({
            id: index,
            source: entry[0],
            target: entry[1],
            value: entry[2],
            type: "with"
        }))

        let about_links = d3.flatRollup(props.data, v => v.length, d => d[props.csvIndexes.subject_name], d => d[props.csvIndexes.with_name], d => d[props.csvIndexes.about_name], d => d[props.csvIndexes.subject_number]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4]]])

        about_links = about_links.filter(entry => {
            return (entry[3] === "Individual" && entry[0] !== "Não aplicável" && entry[2] !== "Não aplicável")
        }).flatMap(d => [[d[0], d[1], d[2], d[4]]])

        about_links = about_links.map((entry, index) => ({
            id: index,
            source: entry[0],
            target: entry[2],
            value: entry[3],
            type: "about",
            with_id: with_links.findIndex(({ source, target }) => (source === entry[0] && target === entry[1]))
        }))

        let linksOriginal = [...new Set([...with_links, ...about_links])]

        // Compute values.

        if(colorNode === null) colorNode = d3.scaleOrdinal(Object.keys(props.codices), ["#cc8b86", "#9FB9BA", "#C5C5B3", "#B89283", "#FFD18C", "#7587AA"]);

        // Replace the input nodes and links with mutable objects for the simulation.
        let nodes = d3.map(nodesOriginal, d => ({ person: d.person, multipleGroups: d.multipleGroups, groups: d.groups, sex: d.sex, qualities: d.qualities }));
        let links = d3.map(linksOriginal, (d, i) => ({ id: i, source: d.source, target: d.target, value: d.value, type: d.type, with_id: d["with_id"] }));

        if (typeClick)
        links = links.filter(entry => entry.type === typeClick)

        // Construct the scales.

        // Construct the forces.
        const forceNode = d3.forceManyBody();
        const forceLink = d3.forceLink(links).id(d => d.person);
        let nodeStrength = -200
        let linkStrength
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
        // about / with
        let colorLine = d3.scaleOrdinal(["about", "with"], ["#D49669", "#383838"])

        // Per-type markers, as they don't inherit styles.
        svg.append("defs").selectAll("marker")
            .data(["about", "with"])
            .join("marker")
            .attr("id", d => `arrow-${d}`)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 40)
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
            .attr("stroke", d => colorLine(d.type))
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("stroke-dasharray", d => {
                return (d.type === "about" ? "3, 3" : "")
            })
            .attr("stroke-width", (d, i) => Math.sqrt(d.value))
            .attr("marker-end", d => `url(#arrow-${d.type})`);

        const node = svg.append("g")
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("id", d=>`network-${noSpaces(d.person)}`)
            .attr("stroke", d => d.multipleGroups ? "black" : "white")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 1.5)
            .attr("cursor", "pointer")
            .attr("fill", d=> d.multipleGroups ? "white" : colorNode(d.groups[0]))
            .attr("r", 15)
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
            .call(drag(simulation))

        const text = svg.append("g")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("class", "network-node-text")
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .attr("cursor", "pointer")
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
            .text((d, i) => {
                return (d.person)
            })
            .call(drag(simulation))

        function ticked() {
            link
                .attr("x1", d => {
                    if (typeClick !== "about" && d.type === "about" && d.with_id !== undefined && d.with_id !== -1)
                        return (links[d.with_id].source.x + links[d.with_id].target.x) / 2

                    return d.source.x
                })
                .attr("y1", d => {
                    if (typeClick !== "about" && d.type === "about" && d.with_id !== undefined && d.with_id !== -1)
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
                .text(d => {
                    let finalText = d.person.slice(0, 6)
                    return (finalText + (finalText !== d.person ? "..." : ""))
                })
        }

        function drag(simulation) {
            function dragstarted(event) {
                mouseleave()
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                mouseleave()
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                mouseleave()
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }
    }, [props.data, props.codices, typeClick]);

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
                    <div id="about" className={'network-legend-items' + (typeClick === "about" ? " network-about-selected" : "")}
                    onClick={() => setTypeClick(typeClick === "about" ? "" : "about")} >
                        <hr className='legend-about-who' />
                        <p style={{ lineHeight: "200%" }}>{t("network-about-who")}</p>
                    </div>
                    <div id="with" className={'network-legend-items' + (typeClick === "with" ? " network-with-selected" : "")}
                    onClick={() => setTypeClick(typeClick === "with" ? "" : "with")}>
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
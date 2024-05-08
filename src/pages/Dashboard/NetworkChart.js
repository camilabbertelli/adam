
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/NetworkChart.css";

import info from "./../../assets/images/info-black.png"
import expand from "./../../assets/images/dashboard/expand.png"
import shrink from "./../../assets/images/dashboard/shrink.png"
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import * as d3 from "d3"
import d3ForceLimit from "d3-force-limit"

function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

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

    const [typeClick, setTypeClick] = useState("")
    const [selectedNodes, setSelectedNodes] = useState([])
    const [data, setData] = useState([])
    const [nodesGlobal, setNodesGlobal] = useState([])
    const [linksGlobal, setLinksGlobal] = useState([])
    

    useEffect(() => {
        let aux = props.data.filter(entry => {
            let pyramidFilter = true
			let heatmapFilter = true
			let sexes = ["Mult.", "N", props.pyramidData]

			if (props.pyramidData)
				pyramidFilter = sexes.includes(entry[props.csvIndexes.subject_sex]) && 
                                sexes.includes(entry[props.csvIndexes.with_sex]) && 
                                sexes.includes(entry[props.csvIndexes.about_sex])

			if (Object.keys(props.heatmapData).length)
				heatmapFilter = entry[props.heatmapData.searchKey1] === props.heatmapData.key1 && 
								entry[props.heatmapData.searchKey2] === props.heatmapData.key2

			return pyramidFilter && heatmapFilter
        })

        d3.select(".network-graph").selectAll("svg").remove("")

        if (aux.length === 0)
            return 

        let subject_nodes = d3.flatGroup(aux, d => d[props.csvIndexes.subject_name], d => d[props.csvIndexes.title], d => d[props.csvIndexes.subject_number], d => d[props.csvIndexes.subject_sex], d => d[props.csvIndexes.subject_qualities]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4]]])
        let with_nodes = d3.flatGroup(aux, d => d[props.csvIndexes.with_name], d => d[props.csvIndexes.title], d => d[props.csvIndexes.with_sex], d => d[props.csvIndexes.with_qualities]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4]]])
        let about_nodes = d3.flatGroup(aux, d => d[props.csvIndexes.about_name], d => d[props.csvIndexes.title], d => d[props.csvIndexes.about_sex], d => d[props.csvIndexes.about_qualities]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4]]])

        subject_nodes = subject_nodes.filter(entry => {
            return true//(entry[2] === "Individual")
        }).flatMap(d => [[d[0], d[1], d[3], d[4]]])

        let concat_arrays = [...new Set([...subject_nodes, ...with_nodes, ...about_nodes])]

        concat_arrays = d3.flatGroup(concat_arrays, d => d[0], d => d[1]).flatMap(d => [[d[0], d[1], d[2]]])

        concat_arrays = concat_arrays.filter(entry => {
            return (entry[0] !== "Não aplicável")
        })

        let nodesOriginal = concat_arrays.map(entry => {
            return ({
                person: entry[0],
                group: entry[1],
                sex: [...new Set(entry[2].flatMap(d => [d[2]]))],
                qualities: [...new Set(entry[2].flatMap(d => [d[3]]))].filter(entry => entry !== "Não aplicável"),
            })
        })

        nodesOriginal = d3.flatRollup(nodesOriginal, v => {
            let dict = {
                multipleGroups: v.length !== 1,
                groups: v.flatMap(d => [d.group]),
                sex: [...new Set(v.flatMap(d => d.sex))],
                qualities: [...new Set(v.flatMap(d => d.qualities))]
            }
            return dict
        }, d => d.person)

        nodesOriginal = nodesOriginal.map(entry => ({
            person: entry[0],
            ...entry[1]
        }))


        let with_links = d3.flatRollup(aux, v => v.length, d => d[props.csvIndexes.subject_name], d => d[props.csvIndexes.with_name], d => d[props.csvIndexes.subject_number], d => d[props.csvIndexes.description]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4]]])

        with_links = with_links.filter(entry => {
            return (entry[0] !== "Não aplicável" && entry[1] !== "Não aplicável") // entry[2] === "Individual"
        }).flatMap(d => [[d[0], d[1], d[3], d[4]]])

        with_links = d3.flatGroup(with_links, d => d[0], d => d[1])

        with_links = with_links.map((entry, index) => ({
            id: index,
            source: entry[0],
            target: entry[1],
            value: entry[2].length,
            type: "with",
            citations: [...new Set(entry[2].flatMap(d => d[2]))]
        }))

        let about_links = d3.flatRollup(aux, v => v.length, d => d[props.csvIndexes.subject_name], d => d[props.csvIndexes.with_name], d => d[props.csvIndexes.about_name], d => d[props.csvIndexes.subject_number], d => d[props.csvIndexes.description]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4], d[5]]])

        about_links = about_links.filter(entry => {
            return (entry[0] !== "Não aplicável" && entry[2] !== "Não aplicável") // entry[3] === "Individual"
        }).flatMap(d => [[d[0], d[2], d[4], d[5]]])

        about_links = d3.flatGroup(about_links, d => d[0], d => d[1])

        about_links = about_links.map((entry, index) => ({
            id: index,
            source: entry[0],
            target: entry[1],
            value: entry[2].length,
            type: "about",
            with_id: with_links.findIndex(({ source, target }) => (source === entry[0] && target === entry[1])),
            citations: [...new Set(entry[2].flatMap(d => d[2]))]
        }))

        let linksOriginal = [...new Set([...with_links, ...about_links])]

        // Compute values.

        // Replace the input nodes and links with mutable objects for the simulation.
        setNodesGlobal(d3.map(nodesOriginal, d => ({ person: d.person, multipleGroups: d.multipleGroups, groups: d.groups, sex: d.sex, qualities: d.qualities })));
        setLinksGlobal(d3.map(linksOriginal, (d, i) => ({ id: i, source: d.source, target: d.target, value: d.value, type: d.type, with_id: d["with_id"], citations: d.citations })));

        setData(aux)
    }, [props.data, props.pyramidData, props.heatmapData])

    const [nodeClickCheck, setNodeClickCheck] = useState(false)

    useEffect(() => {

        let links = [...linksGlobal]
        let nodes = [...nodesGlobal]

        if (typeClick)
            links = links.filter(l => l.type === typeClick)

        if (selectedNodes.length) {
            links = links.filter(l => {
                return selectedNodes.includes(l.source) || selectedNodes.includes(l.target) ||
                        selectedNodes.includes(l.source.person) || selectedNodes.includes(l.target.person)
            })
        }

        nodes = nodes.filter(n => {
            let passLinks = false
            links.forEach(l => {
                if (n.person === l.source || n.person === l.target || 
                    n.person === l.source.person || n.person === l.target.person)
                    passLinks = true
            })

            if (links.length === 0)
                passLinks = selectedNodes.includes(n.person)

            return passLinks
        })

        if (nodeClickCheck){
            props.setNetworkData({ selected: selectedNodes, people: nodes.map(d => d.person)})
            setNodeClickCheck(false)
        }
        
        let nodemouseover = function (event, d) {
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

            if (tooltip_rect.x + tooltip_rect.width > window.innerWidth) {
                tooltipNetwork.style("left", event.pageX - 20 - tooltip_rect.width + "px")
                tooltipNetwork.style("top", event.pageY + 10 + "px")
            }

            tooltip_rect = tooltipNetwork.node().getBoundingClientRect();
            if (tooltip_rect.y + tooltip_rect.height > window.innerHeight) {
                tooltipNetwork.style("left", tooltip_rect.left - 10 - tooltip_rect.width + "px")
                tooltipNetwork.style("top", event.pageY + 20 - tooltip_rect.height + "px")
            }
        }

        let nodemouseleave = function (event, d) {
            tooltipNetwork
                .style("opacity", "0")

            let element = document.getElementById('tooltipNetwork')
            if (element)
                element.innerHTML = "";
        }

        let linemouseover = function (event, d) {
            tooltipNetwork
                .style("opacity", "1");

            let aux = links.filter(l => (
                l.source.person === d.target.person &&
                l.target.person === d.source.person) ||
                (l.source.person === d.source.person && l.target.person === d.target.person && l.type !== d.type))
            let after = ""
            aux.forEach(str =>
                after += `<br/><b>${t("network-tooltip-source")}: </b>${str.source.person}<br/>
                            <b>${t("network-tooltip-target")}: </b>${str.target.person}<br/>
                            <b>${t("network-tooltip-type")}: </b><i>${str.type === "with" ? t("network-tooltip-with") : t("network-tooltip-about")}</i><br/>
                            <b>${t("network-tooltip-value")}: </b><i>${str.value}</i><br/>
                            <b>${t("network-tooltip-citation")}: </b> ${str.citations.join(" | ")}<br/>`)

            tooltipNetwork
                .html(`<b>${t("network-tooltip-source")}: </b>${d.source.person}<br/>
                       <b>${t("network-tooltip-target")}: </b>${d.target.person}<br/>
                       <b>${t("network-tooltip-type")}: </b><i>${d.type === "with" ? t("network-tooltip-with") : t("network-tooltip-about")}</i><br/>
                       <b>${t("network-tooltip-value")}: </b><i>${d.value}</i><br/>
                       <b>${t("network-tooltip-citation")}: </b> ${d.citations.join(" | ")}<br/>${after}`)
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px")

            let tooltip_rect = tooltipNetwork.node().getBoundingClientRect();

            if (tooltip_rect.x + tooltip_rect.width > window.innerWidth) {
                tooltipNetwork.style("left", event.pageX - 20 - tooltip_rect.width + "px")
                tooltipNetwork.style("top", event.pageY + 10 + "px")
            }

            tooltip_rect = tooltipNetwork.node().getBoundingClientRect();
            if (tooltip_rect.y + tooltip_rect.height > window.innerHeight) {
                tooltipNetwork.style("left", tooltip_rect.left - 10 - tooltip_rect.width + "px")
                tooltipNetwork.style("top", event.pageY + 20 - tooltip_rect.height + "px")
            }
        }

        let linemouseleave = function (event, d) {
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

        
        d3.select(".network-graph").selectAll("svg").remove("")

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

        function legendover() {
            let id = d3.select(this).node().id

            d3.select(".network-graph").selectAll("line").filter(
                entry => entry.type !== id
            ).transition().duration(200).style("stroke-opacity", 0.2)

            d3.select(".network-graph").selectAll("marker").filter(
                entry => entry.type !== id
            ).transition().duration(200).style("stroke-opacity", 0.2)
        }

        function legendleave() {
            let id = d3.select(this).node().id

            d3.select(".network-graph").selectAll("line").filter(
                entry => entry.type !== id
            ).transition().duration(200).style("stroke-opacity", 1)

            d3.select(".network-graph").selectAll("marker").filter(
                entry => entry.type !== id
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

        // Construct the forces.
        let forceNode = d3.forceManyBody();
        let forceLink = d3.forceLink(links).id(d => d.person);
        let nodeStrength = -200
        let linkStrength
        if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
        if (linkStrength !== undefined) forceLink.strength(linkStrength);

        let simulation = d3.forceSimulation(nodes)
            .force("link", forceLink)
            .force("charge", forceNode)
            .force("center", d3.forceCenter())
            .force("limit", d3ForceLimit()
                .x0(-width * 2)
                .x1(width * 2)
                .y0(-height * 2)
                .y1(height * 2)
                .cushionWidth(width / 3)
                .cushionStrength(50))
            .on("tick", ticked)

        const svgInitial = d3
            .select(".network-graph")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        const svg = svgInitial.append("g");

        let minZoomX = -width * 2
        let maxZoomX = width * 2
        let minZoomY = -height * 2
        let maxZoomY = height * 2

        let automaticZoom = true
        // Create zoom behavior for the map
        const zoom = d3
            .zoom()
            .translateExtent([
                [minZoomX, minZoomY],
                [maxZoomX, maxZoomY],
            ])
            .scaleExtent([0.25, 5])
            .on("zoom", zoomed);

        // Apply zoom behavior to the SVG element
        svgInitial.call(zoom);


        // Function to handle the zoom event
        function zoomed(event) {
            svg.attr("transform", event.transform);
            automaticZoom = false
        }
        // about / with
        let colorLine = d3.scaleOrdinal(["about", "with"], ["#DC7327", "#383838"])

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
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("stroke", d => colorLine(d.type))
            .attr("stroke-dasharray", d => d.type === "about" ? "3, 3" : "")
            .attr("stroke-width", d => Math.sqrt(d.value))
            .attr("marker-end", d => `url(#arrow-${d.type})`)
            .attr("cursor", "pointer")
            .on("mouseover", linemouseover)
            .on("mouseleave", linemouseleave)

        const node = svg.append("g")
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("id", d => `network-${noSpaces(d.person)}`)
            .attr("stroke-opacity", 1)
            .attr("stroke-width", d => selectedNodes.includes(d.person) ? 4 : 1.5)
            .attr("cursor", "pointer")
            .attr("stroke", d => selectedNodes.includes(d.person) ? "#C62727" : (d.multipleGroups ? "black" : "white"))
            .attr("fill", d => d.multipleGroups ? "white" : props.colorCodices(d.groups[0]))
            .attr("r", 15)
            .on("mouseover", nodemouseover)
            .on("mouseleave", nodemouseleave)
            .on("click", nodeclick)
            .call(drag(simulation))

        const text = svg.append("g")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("class", "network-node-text")
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .attr("cursor", "pointer")
            .on("mouseover", nodemouseover)
            .on("mouseleave", nodemouseleave)
            .on("click", nodeclick)
            .text(d => d.person)
            .call(drag(simulation))

        function ticked() {

            link
                .attr("x1", d => {
                    if (typeClick !== "about" && d.type === "about" && d.with_id !== undefined && d.with_id !== -1 && links[d.with_id] !== undefined)
                        return (links[d.with_id].source.x + links[d.with_id].target.x) / 2

                    return d.source.x
                })
                .attr("y1", d => {
                    if (typeClick !== "about" && d.type === "about" && d.with_id !== undefined && d.with_id !== -1 && links[d.with_id] !== undefined)
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


            if (automaticZoom) {
                minZoomX = minZoomY = maxZoomX = maxZoomY = 0

                nodes.forEach(d => {
                    if (d.x && d.y) {
                        minZoomX = d.x < minZoomX ? d.x : minZoomX
                        maxZoomX = d.x > maxZoomX ? d.x : maxZoomX
                        minZoomY = d.y < minZoomY ? d.y : minZoomY
                        maxZoomY = d.y > maxZoomY ? d.y : maxZoomY
                    }
                })

                let scaleX = (width) / ((maxZoomX + Math.abs(minZoomX) + 30))
                let scaleY = (height) / ((maxZoomY + Math.abs(minZoomY) + 30))

                let scale = Math.min(scaleX, scaleY)

                scale = Math.floor(scale / 0.05) * 0.05;

                scale = scale < 0.25 ? 0.25 : scale
                scale = scale > 2 ? 2 : scale

                svgInitial.call(zoom.transform, d3.zoomIdentity.scale(scale))
                automaticZoom = true
            }
        }

        function drag(simulation) {
            function dragstarted(event) {
                nodemouseleave()
                linemouseleave()
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                nodemouseleave()
                linemouseleave()
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                nodemouseleave()
                linemouseleave()
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

    }, [data, typeClick, selectedNodes, nodeClickCheck])

    function nodeclick(event, d) {
        let aux = [...selectedNodes]
        let index = -1
        if (index = !aux.includes(d.person))
            aux.push(d.person)
        else
            aux.splice(index, 1)

        setSelectedNodes(aux)
        setNodeClickCheck(true)
    }

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
                        {data.length === 0 &&
                            <div className='' style={{width: "100%",height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                    {t("no-data-to-show")}
                            </div>}
                    </div>

                    <div className='shadow network-legend'>
                        <div id="about" className={'network-legend-items' + (typeClick === "about" ? " network-about-selected" : "")}
                            onClick={() => setTypeClick(typeClick === "" ? ("about") : "")} >
                            <hr className='legend-about-who' />
                            <p style={{ lineHeight: "200%" }}>{t("network-about-who")}</p>
                        </div>
                        <div id="with" className={'network-legend-items' + (typeClick === "with" ? " network-with-selected" : "")}
                            onClick={() => setTypeClick(typeClick === "" ? ("with") : "")}>
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
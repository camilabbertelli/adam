
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/NetworkChart.css";

import info from "./../../assets/images/info-black.png"
import expand from "./../../assets/images/dashboard/expand.png"
import shrink from "./../../assets/images/dashboard/shrink.png"
import trash from "./../../assets/images/clear-filter.png"

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
            let impFilter = true
            let sexes = ["Ambos", props.pyramidData.sex]

            if (props.pyramidData.sex)
                pyramidFilter = sexes.includes(entry[props.csvIndexes.subject_sex]) &&
                    (sexes.includes(entry[props.csvIndexes.with_sex]) || entry[props.csvIndexes.with_sex] === "Não aplicável") &&
                    (sexes.includes(entry[props.csvIndexes.about_sex]) || entry[props.csvIndexes.about_sex] === "Não aplicável")

            if (props.pyramidData.category)
                pyramidFilter = pyramidFilter && entry[props.pyramidData.categoryIndex] === props.pyramidData.category


            if (!props.impPeopleData.includes(null))
                impFilter = props.impPeopleData[0] === entry[props.csvIndexes.subject_name] ||
                    props.impPeopleData[1] === entry[props.csvIndexes.subject_name]
            else if (props.impPeopleData.includes(null)) {
                if (props.impPeopleData[0] !== null)
                    impFilter = props.impPeopleData[0] === entry[props.csvIndexes.subject_name]
                else if (props.impPeopleData[1] !== null)
                    impFilter = props.impPeopleData[1] === entry[props.csvIndexes.subject_name]
            }

            if (Object.keys(props.heatmapData).length)
                heatmapFilter = entry[props.heatmapData.searchKey1] === props.heatmapData.key1 &&
                    entry[props.heatmapData.searchKey2] === props.heatmapData.key2

            return pyramidFilter && heatmapFilter && impFilter
        })

        d3.select(".network-graph").selectAll("svg").remove("")

        if (aux.length === 0)
            return

        let subject_nodes = d3.flatGroup(aux, d => d[props.csvIndexes.subject_name], d => d[props.csvIndexes.title], d => d[props.csvIndexes.subject_number], d => d[props.csvIndexes.subject_sex], d => d[props.csvIndexes.subject_qualities]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4]]])
        let with_nodes = d3.flatGroup(aux, d => d[props.csvIndexes.with_name], d => d[props.csvIndexes.title], d => d[props.csvIndexes.with_sex], d => d[props.csvIndexes.with_qualities]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4]]])
        let about_nodes = d3.flatGroup(aux, d => d[props.csvIndexes.about_name], d => d[props.csvIndexes.title], d => d[props.csvIndexes.about_sex], d => d[props.csvIndexes.about_qualities]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4]]])

        subject_nodes = subject_nodes.flatMap(d => [[d[0], d[1], d[3], d[4]]])

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
        }, d => d.person).map(entry => ({
            person: entry[0],
            ...entry[1]
        }))


        let with_links = d3.flatRollup(aux, v => v.length, d => d[props.csvIndexes.subject_name], d => d[props.csvIndexes.with_name], d => d[props.csvIndexes.subject_number], d => d[props.csvIndexes.description], d => d[props.csvIndexes.agent]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4], d[5]]])

        with_links = with_links.filter(entry => {
            return (entry[0] !== "Não aplicável" && entry[1] !== "Não aplicável") // entry[2] === "Individual"
        }).flatMap(d => [[d[0], d[1], d[3], d[4], d[5]]])

        with_links = d3.flatGroup(with_links, d => d[0], d => d[1], d => d[3])

        with_links = with_links.map((entry) => {
            if (entry[2] !== "Ativo") {
                let temp = entry[0]
                entry[0] = entry[1]
                entry[1] = temp
                entry[2] = "Ativo"
            }
            return entry
        })

        with_links = d3.flatGroup(with_links, d => d[0], d => d[1], d => d[2])

        with_links = with_links.map((entry, index) => ({
            id: index,
            source: entry[0],
            target: entry[1],
            value: [...new Set(entry[3].flatMap(d => d[3].flatMap(d => d[2])))].length,
            type: "with",
            excerpts: [...new Set(entry[3].flatMap(d => d[3].flatMap(d => d[2])))]
        }))

        let about_links = d3.flatRollup(aux, v => v.length, d => d[props.csvIndexes.subject_name], d => d[props.csvIndexes.with_name], d => d[props.csvIndexes.about_name], d => d[props.csvIndexes.subject_number], d => d[props.csvIndexes.description], d => d[props.csvIndexes.agent]).flatMap(d => [[d[0], d[1], d[2], d[3], d[4], d[5], d[6]]])

        about_links = about_links.filter(entry => {
            return (entry[0] !== "Não aplicável" && entry[2] !== "Não aplicável") // entry[3] === "Individual"
        }).flatMap(d => [[d[0], d[2], d[4], d[5], d[6]]])

        about_links = d3.flatGroup(about_links, d => d[0], d => d[1], d => d[3])

        about_links = about_links.map((entry) => {
            if (entry[2] !== "Ativo") {
                let temp = entry[0]
                entry[0] = entry[1]
                entry[1] = temp
                entry[2] = "Ativo"
            }
            return entry
        })

        about_links = d3.flatGroup(about_links, d => d[0], d => d[1], d => d[2])

        about_links = about_links.map((entry, index) => ({
            id: index,
            source: entry[0],
            target: entry[1],
            value: [...new Set(entry[3].flatMap(d => d[3].flatMap(d => d[2])))].length,
            type: "about",
            with_id: with_links.findIndex(({ source, target }) => (source === entry[0] && target === entry[1])),
            excerpts: [...new Set(entry[3].flatMap(d => d[3].flatMap(d => d[2])))]
        }))

        let linksOriginal = [...new Set([...with_links, ...about_links])]

        // Replace the input nodes and links with mutable objects for the simulation.
        setNodesGlobal(d3.map(nodesOriginal, d => ({ person: d.person, multipleGroups: d.multipleGroups, groups: d.groups, sex: d.sex, qualities: d.qualities })));
        setLinksGlobal(d3.map(linksOriginal, (d, i) => ({ id: i, source: d.source, target: d.target, value: d.value, type: d.type, with_id: d["with_id"], excerpts: d.excerpts })));

        setData(aux)
    }, [props.data, props.pyramidData, props.heatmapData, props.impPeopleData])

    const [nodeClickCheck, setNodeClickCheck] = useState(false)


    useEffect(() => {
        if (props.resetComponents) {
            setSelectedNodes([])
            props.setResetComponents(false)
        }
    }, [props.resetComponents])

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


        if (nodeClickCheck) {
            let p = nodes.map(d => d.person)
            if (selectedNodes.length === 0)
                p = []
            props.setNetworkData({ selected: selectedNodes, people: p })
            setNodeClickCheck(false)
        }

        let nodemouseover = function (event, d) {
            tooltipNetwork
                .style("opacity", "1");
        }

        let nodemousemove = function (event, d) {
            let groups = d.groups.join("<br/>")


            tooltipNetwork
                .html(`<b>${t("network-tooltip-person")}: </b>${d.person}<br/>
                       <b>${t("network-tooltip-groups")}: </b>${d.multipleGroups ? "<br/>" : ""} ${groups}<br/>
                       <b>${t("network-tooltip-sex")}: </b>${d.sex}<br/>
                       <b>${t("network-tooltip-qualities")}: </b>${d.qualities.length ? d.qualities.join(" | ") : "-"}`)

            let xposition = event.pageX + 10
            let yposition = event.pageY - 10
            let tooltip_rect = tooltipNetwork.node().getBoundingClientRect();
            if (xposition + tooltip_rect.width > window.innerWidth)
                xposition = xposition - 20 - tooltip_rect.width
            if (yposition + tooltip_rect.height > window.innerHeight)
                yposition = yposition + 20 - tooltip_rect.height

            tooltipNetwork
                .style("top", yposition + "px")
                .style("left", xposition + "px")
        }

        let nodemouseleave = function (event, d) {
            tooltipNetwork
                .style("opacity", "0")

            let element = document.getElementById('tooltip')
            if (element)
                element.innerHTML = "";
        }

        let linemouseover = function (event, d) {
            tooltipNetwork
                .style("opacity", "1");

        }

        let linemousemove = function (event, d) {
            let aux = links.filter(l => (
                l.source.person !== l.target.person &&
                l.source.person === d.target.person &&
                l.target.person === d.source.person) ||
                (l.source.person === d.source.person && l.target.person === d.target.person && l.type !== d.type))
            let after = ""
            aux.forEach(str =>
                after += `<br/><b>${t("network-tooltip-source")}: </b>${str.source.person}<br/>
                            <b>${t("network-tooltip-target")}: </b>${str.target.person}<br/>
                            <b>${t("network-tooltip-type")}: </b><i>${str.type === "with" ? t("network-tooltip-with") : t("network-tooltip-about")}</i><br/>
                            <b>${t("network-tooltip-excerpt")}: </b><i>${str.value}</i><br/>`)

            tooltipNetwork
                .html(`<b>${t("network-tooltip-source")}: </b>${d.source.person}<br/>
                       <b>${t("network-tooltip-target")}: </b>${d.target.person}<br/>
                       <b>${t("network-tooltip-type")}: </b><i>${d.type === "with" ? t("network-tooltip-with") : t("network-tooltip-about")}</i><br/>
                       <b>${t("network-tooltip-excerpt")}: </b><i>${d.value}</i><br/>${after}<br/>
                       
                       <b>${t("network-tooltip-see-more")}</b>`)

            let xposition = event.pageX + 10
            let yposition = event.pageY - 10
            let tooltip_rect = tooltipNetwork.node().getBoundingClientRect();
            if (xposition + tooltip_rect.width > window.innerWidth)
                xposition = xposition - 20 - tooltip_rect.width
            if (yposition + tooltip_rect.height > window.innerHeight)
                yposition = yposition + 20 - tooltip_rect.height

            tooltipNetwork
                .style("top", yposition + "px")
                .style("left", xposition + "px")
        }

        let linemouseleave = function (event, d) {
            tooltipNetwork
                .style("opacity", "0")

            let element = document.getElementById('tooltip')
            if (element)
                element.innerHTML = "";
        }

        function lineClick(event, d) {
            let aux = links.filter(l => (
                l.source.person === d.target.person &&
                l.target.person === d.source.person) ||
                (l.source.person === d.source.person && l.target.person === d.target.person && l.type !== d.type))
            aux.push(d)
            props.setNetworkLink(aux)
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

            let element = document.getElementById('tooltip')
            if (element)
                element.innerHTML = "";
        }


        let infoLegendEnter = function (event, d) {

            tooltipNetwork
                .style("opacity", 1);

            let id = d3.select(this).node().id

            d3.select(".network-graph").selectAll("line").filter(
                entry => entry.type !== id
            ).transition().duration(200).style("stroke-opacity", 0.2)

            d3.select(".network-graph").selectAll("marker").filter(
                entry => entry.type !== id
            ).transition().duration(200).style("stroke-opacity", 0.2)
        }

        let infoLegendMove = function (event, d) {

            let type = d3.select(this).node().id

            tooltipNetwork.html(`<center><b>${t("information")}</b></center>
                      ${t(`network-${type}-info`)}`)

            let xposition = event.pageX + 10
            let yposition = event.pageY - 10
            let tooltip_rect = tooltipNetwork.node().getBoundingClientRect();
            if (xposition + tooltip_rect.width > window.innerWidth)
                xposition = xposition - 20 - tooltip_rect.width
            if (yposition + tooltip_rect.height > window.innerHeight)
                yposition = yposition + 20 - tooltip_rect.height

            tooltipNetwork
                .style("top", yposition + "px")
                .style("left", xposition + "px")
        }

        let infoLegendLeave = function (event, d) {
            tooltipNetwork
                .style("opacity", 0)

            let id = d3.select(this).node().id

            d3.select(".network-graph").selectAll("line").filter(
                entry => entry.type !== id
            ).transition().duration(200).style("stroke-opacity", 1)

            d3.select(".network-graph").selectAll("marker").filter(
                entry => entry.type !== id
            ).transition().duration(200).style("stroke-opacity", 1)

            let element = document.getElementById('tooltip')
            if (element)
                element.innerHTML = "";
        }

        d3.select(".network-graph").selectAll("svg").remove("")


        // create a tooltipNetwork
        tooltipNetwork = d3.select("body")
            .select("#tooltip")

        d3.select("#infoNetwork")
            .on("mouseover", infoMouseOverNetwork)
            .on("mouseleave", infoMouseLeaveNetwork)

        d3.selectAll(".network-legend-items")
            .on("mouseover", infoLegendEnter)
            .on("mousemove", infoLegendMove)
            .on("mouseleave", infoLegendLeave)

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
                .cushionStrength(70))
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
            .join("path")
            .attr("class", "network-lines")
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("stroke", d => colorLine(d.type))
            .attr("fill", "none")
            .attr("stroke-dasharray", d => d.type === "about" ? "3, 3" : "")
            .attr("stroke-width", d => Math.sqrt(d.value))
            .attr("marker-end", d => `url(#arrow-${d.type})`)
            .attr("cursor", "pointer")
            .on("mouseover", linemouseover)
            .on("mousemove", linemousemove)
            .on("mouseleave", linemouseleave)
            .on("click", lineClick)

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
            .on("mousemove", nodemousemove)
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
            .on("mousemove", nodemousemove)
            .on("mouseleave", nodemouseleave)
            .on("click", nodeclick)
            .text(d => d.person)
            .call(drag(simulation))

        function ticked() {

            link.attr("d", function (d) {
                let x1 = d.source.x
                let y1 = d.source.y
                let x2 = d.target.x
                let y2 = d.target.y

                if (typeClick !== "about" && d.type === "about" && d.with_id !== undefined && d.with_id !== -1 && links[d.with_id] !== undefined)
                    x1 = (links[d.with_id].source.x + links[d.with_id].target.x) / 2

                if (typeClick !== "about" && d.type === "about" && d.with_id !== undefined && d.with_id !== -1 && links[d.with_id] !== undefined)
                    y1 = (links[d.with_id].source.y + links[d.with_id].target.y) / 2


                let dx = 0
                let dy = 0
                let dr = Math.sqrt(dx * dx + dy * dy)

                // Defaults for normal edge.
                let drx = dr
                let dry = dr
                let xRotation = 0 // degrees
                let largeArc = 0 // 1 or 0
                let sweep = 1 // 1 or 0

                // Self edge.
                if (x1 === x2 && y1 === y2) {
                    // Fiddle with this angle to get loop oriented.
                    xRotation = -45;

                    // Needs to be 1.
                    largeArc = 1;

                    // Change sweep to change orientation of loop. 
                    //sweep = 0;

                    // Make drx and dry different to get an ellipse
                    // instead of a circle.
                    drx = 20;
                    dry = 20;

                    // For whatever reason the arc collapses to a point if the beginning
                    // and ending points of the arc are the same, so kludge it.
                    x2 = x2 + 1;
                    y2 = y2 + 1;
                }

                return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;

            })

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
                        minZoomX = d.x < minZoomX ? d.x - 50 : minZoomX
                        maxZoomX = d.x > maxZoomX ? d.x + 50 : maxZoomX
                        minZoomY = d.y < minZoomY ? d.y - 50 : minZoomY
                        maxZoomY = d.y > maxZoomY ? d.y + 50 : maxZoomY
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
        let index = aux.indexOf(d.person)
        if (index === -1)
            aux.push(d.person)
        else
            aux.splice(index, 1)

        setSelectedNodes(aux)
        setNodeClickCheck(true)
    }

    function clearSelection() {
        setSelectedNodes([])
        setNodeClickCheck(true)
    }

    return (
        <>
            <div className="network-area shadow">
                <div className='network-top-section'>
                    {(selectedNodes.length !== 0) &&
                        <button className="network-btn-clear-selection" onClick={clearSelection} title={t("clear-selection-filter")}>
                           <img alt="close" src={trash}
                                style={{ margin: "0 5px", cursor: "pointer", width: "20px", height: "20px" }}
                                />
                            <span className="network-btn-clear-selection-text">{t("clear-selection-filter")}</span>
                        </button>
                    }
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
                            <div className='' style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {t("no-data-to-show")}
                            </div>}
                    </div>

                    <div className='shadow network-legend'>
                        <div id="about" className={'network-legend-items' + (typeClick === "about" ? " network-about-selected" : "")}
                            onClick={() => setTypeClick(typeClick === "" ? ("about") : "")}>
                            <hr className='legend-about-whom' />
                            <p style={{ lineHeight: "200%" }}>{t("network-about-whom")}</p>
                        </div>
                        <div id="with" className={'network-legend-items' + (typeClick === "with" ? " network-with-selected" : "")}
                            onClick={() => setTypeClick(typeClick === "" ? ("with") : "")}>
                            <hr className='legend-with-whom' />
                            <p style={{ lineHeight: "200%" }}>{t("network-with-whom")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NetworkChart
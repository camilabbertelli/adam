import 'bootstrap/dist/css/bootstrap.css';

import 'mdb-ui-kit/css/mdb.min.css';
import "./../../styles/Home/TimelineChart.css"

import spine from "./../../assets/images/spine.png"
import minus from "./../../assets/images/minus.png"
import { useEffect, useState } from 'react';

import * as d3 from 'd3'
import { useTranslation } from 'react-i18next';

function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

var tooltipTimeline;

const CodicesSec = ({ century, codices }) => {
    let content = []
    Object.keys(codices).forEach(codex => {
        content.push(
            <div key={`${century}-${noSpaces(codex)}`} id={`${century}-${noSpaces(codex)}`} className="image-component"
                data-dict={JSON.stringify({ ...codices[codex] })}>
                <img src={spine} className="timeline card-img-top" alt="book" />
                <div className='centered'>{codex}</div>
            </div>
        )
    });

    return content
}

const Sec = ({ centuries }) => {
    let content = []

    for (const [century, codices] of Object.entries(centuries)) {

        content.push(
            <div key={century} className="timeline-card">
                <div className='timeline-sec-collection'>
                    <CodicesSec century={century} codices={codices} />
                </div>
                <div className="timeline-card-body" >
                    <h5>{century}</h5>
                    <img src={minus} className="timeline-tick" width="4px" alt="tick" />
                </div>
            </div>
        )
    }

    return content
}

const TimelineChart = ({ centuries }) => {
    const [selectedCodices, setSelectedCodices] = useState([])

    const { t } = useTranslation();

    useEffect(() => {

        let mouseover = function (event, d) {

            let century_title = d3.select(this).attr('id')

            let parentData = d3.select(this).node().getAttribute("data-dict")
            let codex = JSON.parse(parentData)

            let zoomFactor = d3.select(".svgMap").node().getAttribute("data-zoomFactor")

            tooltipTimeline
                .style("opacity", "1");

            tooltipTimeline
                .html(`<center><b>${codex.title}</b></center>
                ${t("timeline-tooltip-publication")}: ${codex.publication}`)

            d3.selectAll(`.mark`)
                .transition().duration(200)
                .attr("opacity", 0.3)
                .attr("r", 1.4 / zoomFactor)
            d3.selectAll(`.mark.${century_title}`)
                .transition().duration(200)
                .attr("opacity", 1)
                .attr("r", 2 / zoomFactor)

            d3.selectAll(`.mark.${century_title}`).raise()

            if (!selectedCodices.includes(century_title))
                d3.select(`#${century_title}`)
                    .transition().duration(50)
                    .style("transform", "translateY(-5px)")
                    .style("box-shadow", "none")
                    .style("opacity", 1)
        }

        let mousemove = function (event, d) {
            let xposition = event.pageX + 10
            let yposition = event.pageY - 10
            let tooltip_rect = tooltipTimeline.node().getBoundingClientRect();
            if (xposition + tooltip_rect.width > window.innerWidth)
                xposition = xposition - 20 - tooltip_rect.width
            if (yposition + tooltip_rect.height > window.innerHeight)
                yposition = yposition + 20 - tooltip_rect.height

            tooltipTimeline
                .style("top", yposition + "px")
                .style("left", xposition + "px")
        }

        let mouseleave = function (event, d) {
            let century_title = d3.select(this).attr('id')
            let zoomFactor = d3.select(".svgMap").node().getAttribute("data-zoomFactor")

            tooltipTimeline
                .style("opacity", "0")

            let element = document.getElementById('tooltip')
            if (element)
                element.innerHTML = "";


            d3.selectAll(`.mark`)
                .transition()
                .duration(200)
                .attr("opacity", 1)
                .attr("r", 1.4 / zoomFactor)


            if (!selectedCodices.includes(century_title))
                d3.select(`#${century_title}`)
                    .transition().duration(50)
                    .style("transform", "translateY(5px)")
                    .style("box-shadow", "none")
                    .style("opacity", 0.6)


            if (selectedCodices.length)
                d3.selectAll(`.mark`)
                    .transition().duration(200)
                    .attr("opacity", 0.3)
                    .attr("r", 1.4 / zoomFactor)

            selectedCodices.forEach(selectedCodex => {
                d3.selectAll(`.mark.${selectedCodex}`)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1)
                    .attr("r", 2 / zoomFactor)
            })
        }

        let mouseclick = function (event, d) {

            let century_title = d3.select(this).attr('id')
            let zoomFactor = d3.select(".svgMap").node().getAttribute("data-zoomFactor")

            if (selectedCodices.includes(century_title)) {
                d3.selectAll(`.mark.${century_title}`).each(function (selection, i) {

                    let classes = this.classList.value.split(" ")
                    let color = classes[classes.length - 1]

                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("opacity", 1)
                        .attr("r", 1.4 / zoomFactor)
                        .style("fill", color)
                })


                d3.select(`#${century_title}`)
                    .transition().duration(50)
                    .style("transform", "translateY(5px)")
                    .style("box-shadow", "none")
                    .style("opacity", 0.6)

                let aux = [...selectedCodices]
                aux.splice(selectedCodices.indexOf(century_title), 1)

                aux.forEach(selectedCodex => {
                    d3.selectAll(`.mark.${selectedCodex}`)
                        .transition()
                        .duration(200)
                        .attr("opacity", 1)
                        .attr("r", 2 / zoomFactor)
                        .style("fill", "#656d9b")
                })

                setSelectedCodices(aux)
            } else {
                d3.selectAll(`.mark.${century_title}`)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1)
                    .attr("r", 2 / zoomFactor)
                    .style("fill", "#656d9b")


                d3.select(`#${century_title}`)
                    .transition().duration(50)
                    .style("transform", "translateY(-5px)")
                    .style("box-shadow", "none")
                    .style("opacity", 1)

                let aux = [...selectedCodices]
                aux.push(century_title)
                setSelectedCodices(aux)
            }
        }

        d3.selectAll(`.image-component`)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("click", mouseclick)


        tooltipTimeline = d3.select("body")
            .select("#tooltip")
    }, [centuries, selectedCodices]);

    return (
        <div className='timeline-principal'>
            <div className="timeline card-group card-group-scroll" id='style-1'>
                <Sec centuries={centuries} />
            </div>
        </div>
    )
};
export default TimelineChart;
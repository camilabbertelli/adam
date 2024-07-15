import 'bootstrap/dist/css/bootstrap.css';

import 'mdb-ui-kit/css/mdb.min.css';
import "./../../styles/Home/TimelineChart.css"

import spine from "./../../assets/images/spine.png"
import minus from "./../../assets/images/minus.png"
import { useEffect, useState } from 'react';

import * as d3 from 'd3'

function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}


const CodicesSec = ({ century, codices }) => {
    let content = []
    Object.keys(codices).forEach(codex => {
        content.push(
            <div key={`${century}-${noSpaces(codex)}`} id={`${century}-${noSpaces(codex)}`} className="image-component" title={codex}>
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
    const [selectedCodex, setSelectedCodex] = useState("")

    useEffect(() => {

        let mouseover = function (event, d) {
            let century_title = d3.select(this).attr('id')

            d3.selectAll(`.mark`)
                .transition().duration(200)
                .attr("opacity", 0.6)
                .attr("r", 1.3)
            d3.selectAll(`.mark.${century_title}`)
                .transition().duration(200)
                .attr("opacity", 1)
                .attr("r", 2)

            if (selectedCodex !== century_title)
                d3.select(`#${century_title}`)
                    .transition().duration(50)
                    .style("transform", "translateY(-5px)")
                    .style("box-shadow", "none")
                    .style("opacity", 1)
        }

        let mouseleave = function (event, d) {
            let century_title = d3.select(this).attr('id')

            let element = document.getElementById('tooltip')
            if (element)
                element.innerHTML = "";

            d3.selectAll(`.mark`)
                .transition()
                .duration(200)
                .attr("opacity", 1)
                .attr("r", 1.3)


            if (selectedCodex !== century_title)
                d3.select(`#${century_title}`)
                    .transition().duration(50)
                    .style("transform", "translateY(5px)")
                    .style("box-shadow", "none")
                    .style("opacity", 0.8)

            if (selectedCodex) {
                d3.selectAll(`.mark`)
                    .transition().duration(200)
                    .attr("opacity", 0.6)
                    .attr("r", 1.3)

                d3.selectAll(`.mark.${selectedCodex}`)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1)
                    .attr("r", 2)
            }
        }

        let mouseclick = function (event, d) {

            let century_title = d3.select(this).attr('id')

            if (selectedCodex === century_title) {
                d3.selectAll(`.mark`)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1)
                    .attr("r", 2)
                    .style("fill", "#ffffff")
                    .style("stroke", "#54220b")

                d3.select(`#${century_title}`)
                    .transition().duration(50)
                    .style("transform", "translateY(5px)")
                    .style("box-shadow", "none")
                    .style("opacity", 0.8)

                setSelectedCodex("")
            } else {
                d3.selectAll(`.mark`)
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.6)
                    .attr("r", 1.3)
                    .style("fill", "#ffffff")
                    .style("stroke", "#54220b")

                d3.selectAll(`.mark.${century_title}`)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1)
                    .attr("r", 2)
                    .style("fill", "#54220b")
                    .style("stroke", "#ffffff")

                if (selectedCodex)
                    d3.select(`#${selectedCodex}`)
                        .transition().duration(50)
                        .style("transform", "translateY(5px)")
                        .style("box-shadow", "none")
                        .style("opacity", 0.8)

                d3.select(`#${century_title}`)
                    .transition().duration(50)
                    .style("transform", "translateY(-5px)")
                    .style("box-shadow", "none")
                    .style("opacity", 1)

                setSelectedCodex(century_title)
            }
        }

        d3.selectAll(`.image-component`)
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
            .on("click", mouseclick)
    }, [centuries, selectedCodex]);

    return (
        <div className='timeline-principal'>
            <div className="timeline card-group card-group-scroll" id='style-1'>
                <Sec centuries={centuries} />
            </div>
        </div>
    )
};
export default TimelineChart;
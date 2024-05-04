import 'bootstrap/dist/css/bootstrap.css';

import 'mdb-ui-kit/css/mdb.min.css';
import "./../../styles/Home/TimelineChart.css"

import spine from "./../../assets/images/spine.png"
import minus from "./../../assets/images/minus.png"
import { useEffect } from 'react';

import * as d3 from 'd3'

function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

let tooltipCodex;

const CodicesSec = ({ sec, element }) => {
    let content = []
    element.forEach(codex => {
        codex["century"] = sec;


        content.push(
            <div key={noSpaces(codex.title)} id={noSpaces(codex.title)} className="image-component">
                <img src={spine} className="timeline card-img-top" alt="book" />
                <div className='centered'>{codex.title}</div>
            </div>

        )
        d3.selectAll(`#${noSpaces(codex.title)}`)
            .classed("hover", true)
    });

    return content
}

const Sec = ({ codices }) => {
    let content = []

    for (const [key, value] of Object.entries(codices)) {



        content.push(
            <div key={key} className="timeline card">
                <div className='sec-collection'>
                    <CodicesSec key={key} element={value} />
                </div>
                <div className="timeline card-body" >
                    <h5 className="card-title">{key}</h5>
                    <img src={minus} className="timeline tick" width="4px" alt="tick" />
                </div>
            </div>
        )
    }

    return content
}

const TimelineChart = ({ codices }) => {
    useEffect(() => {

        let mouseover = function (event, d) {
            let title = d3.select(this).attr('id')

            d3.selectAll(`.mark`)
                .transition()
                .duration(200)
                .attr("opacity", 0.6)
                .attr("r", 1)
            d3.selectAll(`.mark.${noSpaces(title)}`)
                .transition()
                .duration(200)
                .attr("opacity", 1)
                .attr("r", 2.5)
            
            tooltipCodex
                .style("opacity", "1");

            tooltipCodex
                .html(
                    `<center><b>${title}</b></center>`)
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px")
        }

        let mouseleave = function (event, d) {
            tooltipCodex
                .style("opacity", "0")

            let element = document.getElementById('tooltipCodex')
            if (element)
                element.innerHTML = "";

            d3.selectAll(`.mark`)
                .transition()
                .duration(200)
                .attr("opacity", 1)
                .attr("r", 2)
        }

        d3.selectAll("#tooltipCodex").remove();
        // create a tooltipMark
        tooltipCodex = d3.select("body")
            .append("div")
            .attr("id", "tooltipCodex")
            .attr("class", "tooltip shadow rounded")
            .attr("padding", "1px")
            .style("opacity", "0")

        d3.selectAll(`.image-component`)
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
    }, []);

    return (
        <div className='timeline principal'>
            <div className="timeline card-group card-group-scroll" id='style-1'>
                <Sec codices={codices} />
            </div>
        </div>
    )
};
export default TimelineChart;
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

let tooltipCodex;

const CodicesSec = ({ sec, element }) => {
    let content = []
    element.forEach(codex => {
        codex["century"] = sec;


        content.push(
            <div key={noSpaces(codex.title)} id={noSpaces(codex.title)} className="image-component" title={codex.title}>
                <img src={spine} className="timeline card-img-top" alt="book" />
                <div className='centered'>{codex.title}</div>
            </div>

        )
    });

    return content
}

const Sec = ({ codices, codicesWithLocation }) => {
    let content = []

    for (const [key, value] of Object.entries(codices)) {

        let pass = false

        value.forEach(codex => {
            if (codicesWithLocation.includes(codex.title))
                pass = true
        })

        if (pass)
        content.push(
            <div key={key} className="timeline-card">
                <div className='timeline-sec-collection'>
                    <CodicesSec key={key} element={value} />
                </div>
                <div className="timeline-card-body" >
                    <h5>{key}</h5>
                    <img src={minus} className="timeline-tick" width="4px" alt="tick" />
                </div>
            </div>
        )
    }

    return content
}

const TimelineChart = ({ codices, codicesWithLocation }) => {
    const [selectedCodex, setSelectedCodex] = useState("")
 
    useEffect(() => {

        let mouseover = function (event, d) {
            let title = d3.select(this).attr('id')

            d3.selectAll(`.mark`)
                .transition().duration(200)
                .attr("opacity", 0.6)
                .attr("r", 1)
            d3.selectAll(`.mark.${noSpaces(title)}`)
                .transition().duration(200)
                .attr("opacity", 1)
                .attr("r", 2.5)
            
                if (selectedCodex !== noSpaces(title))
                d3.select(`#${noSpaces(title)}`)
                    .transition().duration(50)
                    .style("transform", "translateY(-5px)")
                    .style("box-shadow", "none")
                    .style("opacity", 1)

            // tooltipCodex
            //     .style("opacity", "1");

            // tooltipCodex
            //     .html(
            //         `<center><b>${title}</b></center>`)
            //     .style("top", event.pageY - 10 + "px")
            //     .style("left", event.pageX + 10 + "px")
        }

        let mouseleave = function (event, d) {
            let title = d3.select(this).attr('id')

            // tooltipCodex
            //     .style("opacity", "0")

            let element = document.getElementById('tooltipCodex')
            if (element)
                element.innerHTML = "";

            d3.selectAll(`.mark`)
                .transition()
                .duration(200)
                .attr("opacity", 1)
                .attr("r", 2)

                
            if (selectedCodex !== noSpaces(title))
            d3.select(`#${noSpaces(title)}`)
                .transition().duration(50)
                .style("transform", "translateY(5px)")
                .style("box-shadow", "none")
                .style("opacity", 0.8)

            if (selectedCodex){
                d3.selectAll(`.mark`)
                .transition().duration(200)
                .attr("opacity", 0.6)
                .attr("r", 1)

                d3.selectAll(`.mark.${selectedCodex}`)
                .transition()
                .duration(200)
                .attr("opacity", 1)
                .attr("r", 2.5)
            }
        }

        let mouseclick = function (event, d) {
            
            let title = d3.select(this).attr('id')

            if (selectedCodex === noSpaces(title)){
                d3.selectAll(`.mark`)
                .transition()
                .duration(200)
                .attr("opacity", 1)
                .attr("r", 2)
                .style("fill", "#ffffff")
                .style("stroke", "#54220b")

            d3.select(`#${noSpaces(title)}`)
                .transition().duration(50)
                .style("transform", "translateY(5px)")
                .style("box-shadow", "none")
                .style("opacity", 0.8)

                setSelectedCodex("")
            }else{
                d3.selectAll(`.mark`)
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.6)
                    .attr("r", 1)
                    .style("fill", "#ffffff")
                    .style("stroke", "#54220b")

                d3.selectAll(`.mark.${noSpaces(title)}`)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1)
                    .attr("r", 2.5)
                    .style("fill", "#54220b")
                    .style("stroke", "#ffffff")

                    if (selectedCodex)
                    d3.select(`#${selectedCodex}`)
                        .transition().duration(50)
                        .style("transform", "translateY(5px)")
                        .style("box-shadow", "none")
                        .style("opacity", 0.8)

                d3.select(`#${noSpaces(title)}`)
                    .transition().duration(50)
                    .style("transform", "translateY(-5px)")
                    .style("box-shadow", "none")
                    .style("opacity", 1)

                setSelectedCodex(noSpaces(title))
            }
        }

        d3.selectAll("#tooltipCodex").remove();
        // // create a tooltipMark
        // tooltipCodex = d3.select("body")
        //     .append("div")
        //     .attr("id", "tooltipCodex")
        //     .attr("class", "tooltip shadow rounded")
        //     .attr("padding", "1px")
        //     .style("opacity", "0")

        d3.selectAll(`.image-component`)
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
            .on("click", mouseclick)
    }, [selectedCodex]);

    return (
        <div className='timeline-principal'>
            <div className="timeline card-group card-group-scroll" id='style-1'>
                <Sec codices={codices} codicesWithLocation={codicesWithLocation}/>
            </div>
        </div>
    )
};
export default TimelineChart;
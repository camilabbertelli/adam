import 'bootstrap/dist/css/bootstrap.css';

import 'mdb-ui-kit/css/mdb.min.css';
import "./../../styles/TimelineChart.css"

import spine from "./../../assets/images/spine.png"
import minus from "./../../assets/images/minus.png"
import { useEffect } from 'react';

import * as d3 from 'd3'

function noSpaces(str){
    return (str.replace(".", '')).replace(/\s+/g, '')
}

let tooltipCodex;

const CodicesSec = ({ key, element }) => {
    let content = []
    element.forEach(codex => {
        codex["century"] = key
        content.push(
            <div key={codex.title} id={noSpaces(codex.title)} className="image-component">
                <img src={spine} className="timeline card-img-top" alt="book" />
                <div className='centered'>{codex.title}</div>
            </div>
        )
    });

    return content
}

const Sec = ({codices}) => {
    let content = []

    for (const [key, value] of Object.entries(codices)) {

        let w = (value.length + 1) * 50;

        const size = {
            width: w + "px",
        };

        content.push(
            <div key={key} className="timeline card">
                <div className='sec-collection'>
                    <CodicesSec key={key} element={value} />
                </div>
                <div className="timeline card-body" style={size}>
                    <h5 className="card-title">{key}</h5>
                    <img src={minus} className="timeline tick" width="4px" alt="tick" />
                </div>
            </div>
        )
    }

    return content
}

const TimelineChart = ({codices}) => {
    useEffect(() => {

        let mouseOver = function (event, d){
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
        }
        
        let mouseMove = function (event, d) {
            let title = d3.select(this).attr('id')
            
            tooltipCodex
                .style("opacity", "1");
        
            tooltipCodex
                .html(	
                    `<center><b>${title}</b></center>`)
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px")
        }
        
        let mouseLeave = function (event, d) {
            tooltipCodex
                .style("opacity", "0")
            
            document.getElementById('tooltipCodex').innerHTML = "";

            let title = d3.select(this).attr('id')

            d3.selectAll(`.mark`)  
                .transition()
                .duration(200)
                .attr("opacity", 1)
                .attr("r", 2)
        }

        d3.selectAll("#tooltipCodex").remove();
            // create a tooltipMark
            tooltipCodex = d3.select(".timeline.principal")
        .append("div")
        .attr("id", "tooltipCodex")
        .attr("class", "tooltip shadow rounded")
        .attr("padding", "1px")
        .style("opacity", "0")

        d3.selectAll(`.image-component`)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .on("mousemove", mouseMove)
    }, []);

    return (
        <div className='timeline principal'>
            <div className="timeline card-group card-group-scroll" id='style-1'>
                <Sec codices={codices}/>
            </div>
        </div>
    )
};
export default TimelineChart;
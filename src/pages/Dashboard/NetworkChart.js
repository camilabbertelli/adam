
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/NetworkChart.css";

import info from "./../../assets/images/info-black.png"
import expand from "./../../assets/images/dashboard/expand.png"
import shrink from "./../../assets/images/dashboard/shrink.png"
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import * as d3 from "d3"

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

        // d3.selectAll(`.imp-td`)
        //     .on("mouseover", mouseOver)
        //     .on("mouseleave", mouseLeave)
        //     .on("mousemove", mouseMove)
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
                    {props.data.length > 0 && 
                    <div className='network-graph'>
                    </div>}
                    {props.data.length === 0 && 
                    <div className='network-graph'>
                    {t("no-data-to-show")}
                    </div>}
                    <div className='shadow network-legend'>
                        <div className='network-legend-items'>
                            <hr className='legend-about-who'/>
                            <p style={{lineHeight: "200%"}}>{t("network-about-who")}</p>
                        </div>
                        <div className='network-legend-items'>
                            <hr className='legend-with-who'/>
                            <p style={{lineHeight: "200%"}}>{t("network-with-who")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NetworkChart
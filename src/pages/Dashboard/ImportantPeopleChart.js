
import 'bootstrap/dist/css/bootstrap.css';
import "./../../styles/Dashboard/ImportantPeopleChart.css";

import info from "./../../assets/images/info-black.png"
import expand from "./../../assets/images/dashboard/expand.png"
import shrink from "./../../assets/images/dashboard/shrink.png"
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import * as d3 from "d3"

const ImportantPeopleChart = (props) => {

    const { t } = useTranslation()
    const [isExpanded, setIsExpanded] = useState(false)

    const [impPeople, setImpPeople] = useState([])

    function expandImp() {
        document.getElementById("overlay").style.display = (!isExpanded) ? "block" : "none";

        d3.selectAll(".imp-people-area").classed("imp-expand", !isExpanded)

        setIsExpanded(!isExpanded)
        props.setIsExpanded(!isExpanded)
    }

    useEffect(() => {
        setIsExpanded(props.isExpanded)
        d3.selectAll(".imp-people-area").classed("imp-expand", props.isExpanded)
    }, [props.isExpanded])

    useEffect(() => {
        let impData = d3.flatGroup(props.data, d=>d[props.csvIndexes.subject_name])
        let imp = [...new Set(impData.map(d => d[0]))]
        setImpPeople(imp)
    }, [props.data])

    return (
        <>
            <div className="imp-people-area shadow">
                {props.data.length > 0 &&
                    <>

                        <div className='imp-left-section'>
                            {impPeople.map(function (entry) {
                                return (
                                    <p>{entry}</p>
                                )
                            })}
                        </div>
                        <div className='imp-right-section'>
                            <div className='imp-top-section'>
                                <div className='imp-title'>

                                    <h5 className='imp-top-title'>{t("imp-label")}</h5>
                                    <img alt="info" id="infoImp" src={info}
                                        style={{ marginLeft: "5px", cursor: "pointer" }} width="15px" height="15px"
                                    />
                                </div>
                                <img title={isExpanded ? t("icon-shrink") : t("icon-expand")} alt="info" src={isExpanded ? shrink : expand}
                                    style={{ position: "absolute", top: "10px", right: "15px", cursor: "pointer" }} width="15px" height="15px"
                                    onClick={expandImp}
                                />
                            </div>
                            <div className='imp-bottom-section'>

                            </div>
                        </div>
                    </>}
                {props.data.length === 0 && <>
                    <div className='imp-title'>

                        <h5 className='imp-top-title'>{t("imp-label")}</h5>
                        <img alt="info" id="infoImp" src={info}
                            style={{ marginLeft: "5px", cursor: "pointer" }} width="15px" height="15px"
                        />
                    </div>
                    <img title={isExpanded ? t("icon-shrink") : t("icon-expand")} alt="info" src={isExpanded ? shrink : expand}
                        style={{ position: "absolute", top: "10px", right: "15px", cursor: "pointer" }} width="15px" height="15px"
                        onClick={expandImp}
                    />
                </>}
            </div>
        </>
    )
}

export default ImportantPeopleChart;
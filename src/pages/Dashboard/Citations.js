import { useEffect, useState } from "react";

import "./../../styles/Dashboard/Citations.css";

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import * as d3 from "d3"
import ReactPaginate from "react-paginate";
import "react-paginate/theme/basic/react-paginate.css"
import { useTranslation } from "react-i18next";

function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&\/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

const Citations = (props) => {
    const toggleCitation = (id) => {
        let index = id - 1

        let state = !d3.select(`[id="${id}"]`).classed("citations-sub-none")
        d3.select(`[id="${id}"]`).classed("citations-sub-none", state)
        d3.select(`[id="citation-arrow-${id}"]`).style("transform", state ? "none" : "rotate(90deg)")

        if (!state) {

            // heatmap
            let indexKey1 = props.categories[props.activeCategories[0]].index
            let indexKey2 = props.categories[props.activeCategories[1]].index

            let heatmapKey1 = noSpaces(props.data[index][indexKey1])
            let heatmapKey2 = noSpaces(props.data[index][indexKey2])

            let selectionHeatmap = d3.select(`.heatmap-${heatmapKey1}-${heatmapKey2}`);
            let elementHeatmap = selectionHeatmap.node();

            if (elementHeatmap) {
                elementHeatmap.scrollIntoView({ block: "center" });
                selectionHeatmap.transition().duration(500).style("stroke", "black")
            }

            setTimeout(() => {
                selectionHeatmap.transition().duration(500).style("stroke", "#ECECEC")
            }, 2000);

            let indexPyramid = props.categories[props.currentTabchartCategory].index

            // pyramid
            let pyramidSex = []
            let pyramidOriginalSex = props.data[index][props.csvIndexes.subject_sex]

            if (pyramidOriginalSex === "Mult." || pyramidOriginalSex === "N") {
                pyramidSex.push("Fem")
                pyramidSex.push("Masc")
            } else if (pyramidOriginalSex === "Fem.")
                pyramidSex.push("Fem")
            else if (pyramidOriginalSex === "Masc.")
                pyramidSex.push("Masc")

            let pyramidKey = noSpaces(props.data[index][indexPyramid])

            pyramidSex.forEach(p => {
                let selectionPyramid = d3.selectAll(`.pyramid-${p}-${pyramidKey}`);
                let elementPyramid = selectionPyramid.node();

                if (elementPyramid) {
                    elementPyramid.scrollIntoView({ block: "center" });
                    selectionPyramid.transition().duration(500).style("stroke-width", "1")
                }

                setTimeout(() => {
                    selectionPyramid.transition().duration(500).style("stroke-width", "0")
                }, 2000);
            });

            // imp people
            let impKey = noSpaces(props.data[index][props.csvIndexes.subject_name])

            let selectionImp = d3.select(`#imp-${impKey}`);
            let elementImp = selectionImp.node();

            if (elementImp) {
                elementImp.scrollIntoView({ block: "center" });
                selectionImp.transition().duration(500).style("border", "solid 0.5px black")
            }

            setTimeout(() => {
                selectionImp.transition().duration(500).style("border", "solid 0.5px #c9c0b8")
            }, 2000);

            // network
            let networkKey = noSpaces(props.data[index][props.csvIndexes.subject_name])

            let selectionNetwork = d3.select(`#network-${networkKey}`);
            let elementNetwork = selectionNetwork.node();

            if (elementNetwork) {
                elementNetwork.scrollIntoView({ block: "center" });
                selectionNetwork.transition().duration(500).attr("r", 100)
            }

            setTimeout(() => {
                selectionNetwork.transition().duration(500).attr("r", 15)
            }, 2000);
        }
    }

    const [pagination, setPagination] = useState({
        data: props.data,
        offset: 0,
        numberPerPage: 10,
        pageCount: 0,
        currentData: []
    });

    useEffect(() => {
        setPagination((prevState) => ({
            ...prevState,
            pageCount: props.data.length / prevState.numberPerPage,
            currentData: props.data.slice(pagination.offset, pagination.offset + pagination.numberPerPage)
        }))
    }, [pagination.numberPerPage, pagination.offset, props.data])

    const handlePageClick = event => {

        const selected = event.selected;
        const offset = selected * pagination.numberPerPage
        setPagination({ ...pagination, offset })
    }

    const { t } = useTranslation()

    return (
        <>
            {props.data.length === 0 &&
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "250px" }}>
                    {t("no-data-to-show")}
                </div>}
            {props.data.length !== 0 &&
                <>
                    <div className='citations-content' id='citations-content'>
                        {pagination.currentData && pagination.currentData.map(((entry) => (
                            <div className='citations-dropdown' key={`div-${entry[props.csvIndexes["#"]]}`}>
                                <button className='citations-dropbtn' key={`btn-${entry[props.csvIndexes["#"]]}`} onClick={() => toggleCitation(entry[props.csvIndexes["#"]])}>
                                    <ArrowForwardIosIcon id={`citation-arrow-${entry[props.csvIndexes["#"]]}`} style={{ width: "15px", marginRight: "5px" }} />
                                    {entry[props.csvIndexes.description]}
                                </button>
                                <div className="citations-sub-content citations-sub-none" key={`dropdown-${entry[props.csvIndexes["#"]]}`} id={entry[props.csvIndexes["#"]]}>
                                    <table width={"100%"} key={`tables-citation-${entry[props.csvIndexes["#"]]}`}>
                                        <tbody key={`tbody-${entry[props.csvIndexes["#"]]}`}>
                                            {Object.keys(props.csvIndexes).map((key) => {
                                                if (key === "description")
                                                    return ""
                                                return (
                                                    <tr className="citations-table" key={`tr-${entry[props.csvIndexes["#"]]}-${key}`}>
                                                        <th className="citations-table" key={`th-${entry[props.csvIndexes["#"]]}`}>{key}</th>
                                                        <td className="citations-table" key={`td-${entry[props.csvIndexes["#"]]}`}>{entry[props.csvIndexes[key]]}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <hr style={{ margin: "8px 0px" }} />
                            </div>)))
                        }
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            boxSizing: 'border-box',
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <ReactPaginate
                            breakLabel={'...'}
                            pageCount={pagination.pageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={2}
                            onPageChange={handlePageClick}
                            containerClassName={'pagination'}
                            activeClassName={'item active '}
                            breakClassName={'item'}
                            disabledClassName={'disabled-page'}
                            nextClassName={"item next "}
                            nextLabel={<ArrowForwardIosIcon style={{ width: 15 }} />}
                            previousClassName={"item previous"}
                            previousLabel={<ArrowBackIosIcon style={{ width: 15 }} />}
                            renderOnZeroPageCount={null}
                        />
                    </div>
                </>
            }
        </>
    )
}

export default Citations;
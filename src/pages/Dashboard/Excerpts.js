import { useEffect, useState } from "react";

import "./../../styles/Dashboard/Excerpts.css";

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import * as d3 from "d3"
import ReactPaginate from "react-paginate";
import "react-paginate/theme/basic/react-paginate.css"
import { useTranslation } from "react-i18next";

function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

const Excerpts = (props) => {

    const [data, setData] = useState([])

    const toggleExcerpt = (entry) => {

        let id = entry[props.csvIndexes.index]
        let state = !d3.select(`[id="${id}"]`).classed("excerpts-sub-none")
        d3.select(`[id="${id}"]`).classed("excerpts-sub-none", state)
        d3.select(`[id="excerpt-arrow-${id}"]`).style("transform", state ? "none" : "rotate(90deg)")

        if (!state) {

            let indexKey1 = props.categories[props.activeCategories[0]].index
            let indexKey2 = props.categories[props.activeCategories[1]].index

            // heatmap
            if (Object.keys(props.heatmapData).length !== 0) {
                indexKey1 = props.categories[props.activeCategories[0]].indexSubcategory
                indexKey2 = props.categories[props.activeCategories[1]].indexSubcategory
            }

            let heatmapKey1 = noSpaces(entry[indexKey1])
            let heatmapKey2 = noSpaces(entry[indexKey2])

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
            let pyramidOriginalSex = entry[props.csvIndexes.subject_sex]

            if (pyramidOriginalSex === "Ambos") {
                pyramidSex.push("Feminino")
                pyramidSex.push("Masculino")
            } else if (pyramidOriginalSex === "Feminino")
                pyramidSex.push("Feminino")
            else if (pyramidOriginalSex === "Masculino")
                pyramidSex.push("Masculino")

            let pyramidKey = noSpaces(entry[indexPyramid])

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
            let impKey = noSpaces(entry[props.csvIndexes.subject_name])

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
            let networkKey = noSpaces(entry[props.csvIndexes.subject_name])

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
        offset: 0,
        data: [],
        numberPerPage: 10,
        pageCount: 0,
        currentData: [],
    });

    useEffect(() => {
        let aux = props.data.filter(entry => {
            let networkFilter = true
            let pyramidFilter = true
            let detailsFilter = true
            let impFilter = true
            let sexes = ["Ambos", props.pyramidData.sex]

            if (props.networkData.selected.length)
                networkFilter = props.networkData.selected.includes(entry[props.csvIndexes.subject_name]) ||
                                props.networkData.selected.includes(entry[props.csvIndexes.with_name]) ||
                                props.networkData.selected.includes(entry[props.csvIndexes.about_name])

            
            if (!props.impPeopleData.includes(null))
                impFilter = props.impPeopleData[0] === entry[props.csvIndexes.subject_name] ||
                            props.impPeopleData[1] === entry[props.csvIndexes.subject_name]
            else if (props.impPeopleData.includes(null)){
                if (props.impPeopleData[0] !== null)
                    impFilter = props.impPeopleData[0] === entry[props.csvIndexes.subject_name]
                else if (props.impPeopleData[1] !== null)
                    impFilter = props.impPeopleData[1] === entry[props.csvIndexes.subject_name]
            }

            if (props.pyramidData.sex)
                pyramidFilter = sexes.includes(entry[props.csvIndexes.subject_sex])

            if (props.pyramidData.category)
                pyramidFilter = pyramidFilter && entry[props.pyramidData.categoryIndex] === props.pyramidData.category

            if (Object.keys(props.heatmapData).length)
                detailsFilter = entry[props.heatmapData.searchKey1] === props.heatmapData.key1 &&
                    entry[props.heatmapData.searchKey2] === props.heatmapData.key2


            return networkFilter && pyramidFilter && detailsFilter && impFilter
        })

        setData(aux)
        setBackupData([])

        setPagination((prevState) => ({
            ...prevState,
            data: aux,
            pageCount: Math.ceil(aux.length / prevState.numberPerPage),
            currentData: aux.slice(0, pagination.numberPerPage),
            offset: 0
        }))
    }, [props.data, props.pyramidData, props.networkData, props.heatmapData, props.impPeopleData])

    const [backupData, setBackupData] = useState([])

    useEffect(() => {

        if (props.networkLink) {

            let toBeFiltered = backupData.length ? [...backupData] : [...data]
            let aux = toBeFiltered.filter(entry => {
                let passNetworkLink = false
                props.networkLink.forEach(l => {

                    let isAgentActive = entry[props.csvIndexes.agent] === "Ativo"


                    if (isAgentActive) {
                        if (l.source.person === entry[props.csvIndexes.subject_name])
                            if (l.target.person === entry[l.type === "with" ? props.csvIndexes.with_name : props.csvIndexes.about_name])
                                passNetworkLink = true
                    } else { // passive action, requires switch
                        if (l.source.person === entry[l.type === "with" ? props.csvIndexes.with_name : props.csvIndexes.about_name])
                            if (l.target.person === entry[props.csvIndexes.subject_name])
                                passNetworkLink = true
                    }

                });

                return passNetworkLink
            })

            setBackupData(toBeFiltered)
            setData(aux)
            setPagination((prevState) => ({
                ...prevState,
                data: aux,
                pageCount: Math.ceil(aux.length / prevState.numberPerPage),
                currentData: aux.slice(0, pagination.numberPerPage),
                offset: 0
            }))

            props.setIsOpen(true)
            props.setNetworkLink(null)
        }

        function clickExcerpt(e) {
            if ("network-lines" === e.target.className.baseVal) {
                window.removeEventListener("click", clickExcerpt)
            } else if (d3.select(".excerpts-btn").node() && d3.select(".excerpts-btn").node().contains(e.target)) {
                setData([...backupData])
                setBackupData([])
                window.removeEventListener("click", clickExcerpt)
            } else if (d3.select(".excerpts-drawer").node() && !d3.select(".excerpts-drawer").node().contains(e.target)) {
                props.setIsOpen(!props.isOpen)
                setData([...backupData])
                setBackupData([])
                window.removeEventListener("click", clickExcerpt)
            }
        }

        if (props.isOpen) {
            window.addEventListener("click", clickExcerpt)
        }
    }, [props.networkLink])

    useEffect(() => {
        setPagination((prevState) => ({
            ...prevState,
            pageCount: Math.ceil(data.length / prevState.numberPerPage),
            currentData: data.slice(pagination.offset, pagination.offset + pagination.numberPerPage),
        }))
    }, [data, pagination.numberPerPage, pagination.offset])

    const handlePageClick = event => {
        const selected = event.selected;
        const offset = selected * pagination.numberPerPage
        setPagination({ ...pagination, offset: offset })
    }

    const { t } = useTranslation()

    return (
        <>
            {data.length === 0 &&
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "250px" }}>
                    {t("no-data-to-show")}
                </div>}
            {data.length !== 0 &&
                <>
                    <div className='excerpts-content' id='excerpts-content'>
                        <p><b>{pagination.offset + 1}</b> - <b>{pagination.offset + pagination.currentData.length}</b> {t("excerpts-of")} <b>{data.length}</b> {t("excerpts-results")}</p>
                        {pagination.currentData && pagination.currentData.map(((entry) => (
                            <div className='excerpts-dropdown' key={`div-${entry[props.csvIndexes.index]}`}>
                                <button className='excerpts-dropbtn' key={`btn-${entry[props.csvIndexes.index]}`} onClick={() => toggleExcerpt(entry)}>
                                    <ArrowForwardIosIcon id={`excerpt-arrow-${entry[props.csvIndexes.index]}`} style={{ width: "15px", marginRight: "5px" }} />
                                    {entry[props.csvIndexes.description]}
                                </button>
                                <div className="excerpts-sub-content excerpts-sub-none" key={`dropdown-${entry[props.csvIndexes.index]}`} id={entry[props.csvIndexes.index]}>
                                    <table width={"100%"} key={`tables-excerpt-${entry[props.csvIndexes.index]}`}>
                                        <tbody key={`tbody-${entry[props.csvIndexes.index]}`}>
                                            {Object.keys(props.csvIndexes).map((key) => {
                                                if (props.csvNames[key] === props.csvNames.description)
                                                    return ""
                                                return (
                                                    <tr className="excerpts-table" key={`tr-${entry[props.csvIndexes.index]}-${key}`}>
                                                        <th className="excerpts-table" key={`th-${entry[props.csvIndexes.index]}`}>{props.csvNames[key]}</th>
                                                        <td className="excerpts-table" key={`td-${entry[props.csvIndexes.index]}`}>{entry[props.csvIndexes[key]]}</td>
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
                            forcePage={pagination.offset / pagination.numberPerPage}
                        />
                    </div>
                </>
            }
        </>
    )
}

export default Excerpts;
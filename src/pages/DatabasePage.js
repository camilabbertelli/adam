
import "./../styles/Database.css";
import React, { useEffect, useState } from "react";
import TableFilter from "react-table-filter";
import "react-table-filter/lib/styles.css";

import 'bootstrap/dist/css/bootstrap.css';
import downloads from "./../assets/images/downloads.png"
import close from "./../assets/images/dashboard/reset.png"
import info from "./../assets/images/info-black.png"

import $ from 'jquery';

import { useTranslation } from "react-i18next";

import * as d3 from "d3"

let tooltipDatabase;

class Table extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            t: props.t,
            data: props.data,
            filterConfiguration: props.filterConfiguration,
        };
        this._filterUpdated = this._filterUpdated.bind(this);
    }

    componentDidMount() {
        this.setState({
            data: this.props.data,
            filterConfiguration: this.props.filterConfiguration
        })
    }

    componentDidUpdate(prevProps) {
        if (this.props.data !== prevProps.data) {
            this.setState({
                data: this.props.data
            })
        }

        if (this.props.filterConfiguration !== prevProps.filterConfiguration){
            if (this.props.filterConfiguration.length === 0)
                this.tableFilterNode.reset(this.props.data, true)
            this.setState({
                filterConfiguration: this.props.filterConfiguration
            })
        }
    }

    _filterUpdated(newData, filterConfiguration) {
        if (newData.length) {
            this.setState({
                data: newData,
                filterConfiguration: filterConfiguration
            });
            this.props.setData(newData)
            this.props.setFilterConfiguration(filterConfiguration)
        }
    }

    render() {
        
        const data_table = this.state.data;

        if (!data_table?.length) return "";

        let keys = Object.keys(data_table[0])

        let checkedKeys = this.props.checkedKeys;
        let names = this.props.csvNames; 

        function handleTbody() {
            $('.thead-database').scrollLeft($('.tbody-database').scrollLeft());
        }

        function handleThead() {
            $('.tbody-database').scrollLeft($('.thead-database').scrollLeft());
        }

        return (
            <>
            <div className="database-results">
                <strong>{this.state.t("database-results")}</strong>: {Object.keys(data_table).length}
            </div>
            <table className="table table-sm table-bordered table-hover scrolldown">
            <thead className='table-dark text-dark'>
                    <TableFilter
                        rows={data_table}
                        rowClass="h5 text-center"
                        onFilterUpdate={this._filterUpdated}
                        initialFilters={this.state.filterConfiguration}
                        ref={(node) => {this.tableFilterNode = node;}}
                    >
                        {keys.map(function (key) {
                            if (!checkedKeys || checkedKeys.includes(key) || key === " ")
                                return (
                                    <th
                                        scope="col"
                                        key={key}
                                        filterkey={key}
                                        casesensitive={"true"}
                                        showsearch={"true"}
                                        className={(key !== names["index"]) ? `cell + ${key}` : `cardinal`}
                                    >
                                        {key}
                                    </th>
                                )
                        })}

                    </TableFilter>
                </thead>
                <tbody className="tbody-database">
                    {data_table.map((item, index) => {
                        return (
                            <tr key={"row_" + index}>
                                {keys.map(function (key) {
                                    if (!checkedKeys || checkedKeys.includes(key) || key === " ")
                                        return (<td key={key} className={(key !== names.index) ? `cell + ${key}` : `cardinal`}>{item[key]}</td>)
                                })}
                            </tr>
                        );
                    })}</tbody>
            </table>
            </>
        );
    }
}


const ExcelFilter = (props) => {

    const toggleItem = (key) => {
        let temp = [...props.checkedKeys]

        if (props.checkedKeys.includes(key)) {
            const index = temp.indexOf(key);
            temp.splice(index, 1);
        } else temp.push(key)

        props.updateCheckedKeys(temp.length === props.keys.length ? props.keys : temp)
    }

    if (!props.keys)
        return ""

    return (
        <>
            <div className="excel-filter-body" style={{ borderTop: "1.5px solid black", paddingTop: "10px", marginTop: "10px" }}>
                {props.keys.map(function (key) {
                    if (key !== " ")
                    return (
                        <div key={key} className="form-check">
                            <input className="form-check-input" type="checkbox" value={key} onChange={() => toggleItem(key)} checked={(props.checkedKeys.includes(key))} />
                            <label className="form-check-label">
                                {key}
                            </label>
                        </div>)
                })}

            </div>
        </>
    )
}

const DatabasePage = (props) => {

    const [keys, setKeys] = useState([])
    const [checkedKeys, setCheckedKeys] = useState([])
    const [data, setData] = useState([])

    const { t } = useTranslation()

    function downloadCSV() {
        const titleKeys = [...checkedKeys]

        if (titleKeys.length === 0 || data.length === 0)
            return

        const refinedData = []
        refinedData.push(titleKeys)

        data.forEach(item => {
            let aux = {}
            Object.keys(item).forEach(key => {
                if (checkedKeys.includes(key))
                    if (item[key].includes(","))
                        aux[key] = "\"" + item[key] + "\""
                    else
                        aux[key] = item[key]
            })
            refinedData.push(Object.values(aux))
        })

        let csvContent = ''

        refinedData.forEach(row => {
            csvContent += row.join(',') + '\n'
        })

        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8,' })
        const objUrl = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.setAttribute('href', objUrl)
        link.setAttribute('download', 'adam-file.csv')

        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        document.body.removeChild(link);
    }

    useEffect(() => {
        d3.selectAll("#tooltip").style("opacity", 0)
        let element = document.getElementById('tooltip')
            if (element)
                element.innerHTML = "";

        setData(props.data)

        if (props.data.length) {
            let keys = Object.keys(props.data[0])
            setKeys(keys)
            setCheckedKeys(props.databaseCheckedKeys !== keys && props.databaseCheckedKeys.length ? props.databaseCheckedKeys : keys)
        }

        props.data.forEach(entry => {
            entry[" "] = " "
        })


        let infoMouseOverDatabase = function (event, d) {
            
            tooltipDatabase
                .style("opacity", 1);

            tooltipDatabase.html(`<center><b>${t("information")}</b></center>
						  ${t("information-database")}`)
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px")

            let tooltip_rect = tooltipDatabase.node().getBoundingClientRect();
            if (tooltip_rect.x + tooltip_rect.width > window.outerWidth)
                tooltipDatabase.style("left", event.pageX + 10 - tooltip_rect.width + "px")
            if (tooltip_rect.y + tooltip_rect.height > window.outerHeight)
                tooltipDatabase.style("top", event.pageY - 10 - tooltip_rect.height + "px")
        }

        let infoMouseLeaveDatabase = function (event, d) {
            tooltipDatabase
                .style("opacity", 0)

            let element = document.getElementById('tooltip')
            if (element)
                element.innerHTML = "";
        }

        // create a tooltipDatabase
        tooltipDatabase = d3.select("body")
            .select("#tooltip")

        d3.select("#infoNetwork")
            .on("mouseover", infoMouseOverDatabase)
            .on("mouseleave", infoMouseLeaveDatabase)
            
    }, [props.data])

    function updateCheckedKeys(newKeys) {
        setCheckedKeys(newKeys)
        props.setDatabaseCheckedKeys(newKeys)
    }

    function clearSelection() {
        setData(props.data)

        setCheckedKeys(keys)
        props.setDatabaseCheckedKeys(keys)

        let aux= []
        Object.keys(props.databaseFilterConfiguration).forEach(key => {
            aux[key] = []
        })
        props.setDatabaseFilterConfiguration(aux)
    }

    return (
        <div className="database-view">
            <div className="database-filter-view" style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: "2%", left: "3%" }}>
                    <img alt="close" src={close} onClick={clearSelection} title={t("clear-all-filter")} width={"25px"} height={"25px"}
                        style={{ cursor: "pointer"}} 
                    />
                </div>
                <div style={{ position: "absolute", right: "3%", top: "2%" }}>
                    <img style={{ cursor: "pointer" }} alt={"download csv"} src={downloads} onClick={downloadCSV} title={t("database-download-csv")} width={"20px"} height={"20px"} />
                </div>
                <div style={{display:"flex", flexDirection: "row", alignItems: "center"}}>

                <h3>{t("database-content")}</h3>
                <img alt="info" id="infoNetwork" src={info}
                            style={{ marginLeft: "5px", cursor: "pointer" }} width="15px" height="15px"
                        />
                </div>
                <div>
                    <div className="form-check">
                        <input className="form-check-input select-all" type="checkbox" checked={checkedKeys === keys} onChange={() => (setCheckedKeys(checkedKeys === keys ? [] : keys))}/>
                        <label className="form-check-label">
                            {t("database-select-all")}
                        </label>
                    </div>
                    <ExcelFilter updateCheckedKeys={updateCheckedKeys} keys={keys} checkedKeys={checkedKeys} csvNames={props.csvNames}/>
                </div>
            </div>
            <div className="database-table-view">
                <Table t={t} checkedKeys={checkedKeys} csvNames={props.csvNames} data={data} setData={setData} filterConfiguration={props.databaseFilterConfiguration} setFilterConfiguration={props.setDatabaseFilterConfiguration} />
            </div>
        </div>)
}

export default DatabasePage;
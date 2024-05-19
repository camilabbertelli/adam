
import "./../styles/Database.css";
import React, { useState } from "react";
import TableFilter from "react-table-filter";
import "react-table-filter/lib/styles.css";

import 'bootstrap/dist/css/bootstrap.css';
import downloads from "./../assets/images/downloads.png"


import csv_data from "./../assets/data.csv"

import * as d3 from "d3"

import { useTranslation } from "react-i18next";

class Table extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
        this._filterUpdated = this._filterUpdated.bind(this);
    }

    componentDidMount() {
        d3.csv(csv_data).then(d => {

            if (d?.length) {
                let keys = Object.keys(d[0])
                this.props.updateKeys(keys)
            }

            d.forEach(entry => {
                entry[" "] = " "
            })

            this.setState({ data: d })
            this.props.setData(d)

        }).catch((error) => {
            console.error('Error fetching data:', error);
            // Display a user-friendly error message
            alert('An error occurred while fetching data.');
        });

    }

    _filterUpdated(newData, filtersObject) {
        if (newData.length)
            this.setState({
                data: newData
            });
        this.props.setData(newData)
    }

    render() {
        const data_table = this.state.data;

        if (!data_table?.length) return "";

        let keys = Object.keys(data_table[0])

        let checkedKeys = this.props.checkedKeys;

        let loader = document.getElementById("loader");
        loader.classList.add('loader--hide');

        return (
            <table className="table table-sm table-bordered table-hover">
                <thead className='table-dark text-dark'>
                    <TableFilter
                        rows={data_table}
                        rowClass="h5 text-center"
                        onFilterUpdate={this._filterUpdated}
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
                                        className={(key !== "#") ? `cell + ${key}` : `cardinal`}
                                    >
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </th>
                                )
                        })}

                    </TableFilter>
                </thead>
                <tbody>
                    {data_table.map((item, index) => {
                        return (
                            <tr key={"row_" + index}>
                                {keys.map(function (key) {
                                    if (!checkedKeys || checkedKeys.includes(key) || key === " ")
                                        return (<td key={key} className={(key !== "#") ? `cell + ${key}` : `cardinal`}>{item[key]}</td>)
                                })}
                            </tr>
                        );
                    })}</tbody>
            </table>
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

        props.updateCheckedKeys(temp)
    }

    if (!props.keys)
        return ""

    return (
        <>
            <div className="excel-filter-body" style={{ borderTop: "1.5px solid black", paddingTop: "10px", marginTop: "10px" }}>
                {props.keys.map(function (key) {
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

const DatabasePage = () => {

    const [keys, setKeys] = useState([])
    const [checkedKeys, setCheckedKeys] = useState([])
    const [data, setData] = useState([])

    const { t } = useTranslation()

    function updateKeys(newKeys) {
        setKeys(newKeys)
        setCheckedKeys(newKeys)
    }

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

    return (
        <div className="database-view">
            <div className="database-filter-view" style={{ position: "relative" }}>
                <div style={{ position: "absolute", right: "3%", top: "2%" }}>
                    <img style={{ cursor: "pointer" }} alt={"download csv"} src={downloads} onClick={downloadCSV} title={t("database-download-csv")} width={"20px"} height={"20px"} />
                </div>
                <h3>{t("database-content")}</h3>
                <div>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" onChange={() => (setCheckedKeys(checkedKeys === keys ? [] : keys))} checked={checkedKeys === keys} />
                        <label className="form-check-label">
                            {t("database-select-all")}
                        </label>
                    </div>
                    <ExcelFilter updateCheckedKeys={setCheckedKeys} keys={keys} checkedKeys={checkedKeys} />
                </div>
            </div>
            <div className="database-table-view">
                <Table updateKeys={updateKeys} checkedKeys={checkedKeys} setData={setData} />
                <div id="loader" className="loader"></div>
            </div>
        </div>)
}

export default DatabasePage;
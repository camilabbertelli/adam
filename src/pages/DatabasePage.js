
import "./../styles/Database.css";
import React, { useState } from "react";
import TableFilter from "react-table-filter";
import "react-table-filter/lib/styles.css";

import 'bootstrap/dist/css/bootstrap.css';

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
            this.setState({ data: d })

            if (d?.length) {
                let keys = Object.keys(d[0])
                this.props.updateKeys(keys)
            }
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
                            if (!checkedKeys || checkedKeys.includes(key))
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
                                    if (!checkedKeys || checkedKeys.includes(key))
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
            <div className="excel-filter-body" style={{borderTop: "1.5px solid black", paddingTop: "10px", marginTop:"10px"}}>
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

    const { t } = useTranslation()

    function updateKeys(newKeys) {
        setKeys(newKeys)
        setCheckedKeys(newKeys)
    }

    return (
        <div className="database-view">
            <div className="database-filter-view">
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
                <Table updateKeys={updateKeys} checkedKeys={checkedKeys} />
                <div id="loader" className="loader"></div>
            </div>
        </div>)
}

export default DatabasePage;
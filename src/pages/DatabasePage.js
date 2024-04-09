
import "./../styles/Database.css";
import React, { Component, useEffect } from "react";
import TableFilter from "react-table-filter";
import "react-table-filter/lib/styles.css";

import 'bootstrap/dist/css/bootstrap.css';

import csv_data from "./../assets/data.csv"

import * as d3 from "d3"

import reset from "./../assets/undo.png"

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
            <img width="20px" alt="reset" src={reset} style={{ paddingBottom: 5 + "px", cursor: "pointer" }} onClick={() => props.updateCheckedKeys(props.keys)} />
            <div className="excel-filter-body">
                {props.keys.map(function (key) {
                    return (<div key={key} className="form-check">
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

class DatabasePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            keys: [],
            checkedKeys: []
        };
    }

    updateKeys = (newKeys) => {
        this.setState({
            keys: [...newKeys],
            checkedKeys: [...newKeys]
        })
    }

    updateCheckedKeys = (newKeys) => {
        this.setState({
            checkedKeys: [...newKeys]
        })
    }

    render() {
        return (
            <div className="database-view">
                <div className="database-filter-view">
                    <h3>Content</h3>
                    <ExcelFilter updateCheckedKeys={this.updateCheckedKeys} keys={this.state.keys} checkedKeys={this.state.checkedKeys} />
                </div>
                <div className="database-table-view">
                    <Table updateKeys={this.updateKeys} checkedKeys={this.state.checkedKeys} />
                    <div id="loader" className="loader"></div>
                </div>
            </div>)
    }
}

export default DatabasePage;
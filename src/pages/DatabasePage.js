
import "./../styles/Database.css";
import React, { useEffect } from "react";
import TableFilter from "react-table-filter";
import "react-table-filter/lib/styles.css";

import 'bootstrap/dist/css/bootstrap.css';

import csv_data from "./../assets/data.csv"

import * as d3 from "d3"


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

        const cells = (item, index) => {
            let content = []
            content.push(<td className="cardinal-cell">{index + 1}</td>)
            keys.forEach((key) => {
                content.push(<td className={`cell + ${key}`}>{item[key]}</td>)
            })

            return content
        }

        const elementsBody = data_table.map((item, index) => {
            return (
                <tr key={"row_" + index}>
                    {cells(item, index)}
                </tr>
            );
        });

        const ElementsHeader = () => {
            let content = []
            keys.forEach((key) => {
                content.push(
                    <th
                        scope="col"
                        key={key}
                        filterkey={key}
                        casesensitive={"true"}
                        showsearch={"true"}
                        className="cell"
                    >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                    </th>
                )
            })

            return content
        }

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
                        <th
                        scope="col"
                        key="count"
                        className="cardinal-cell"
                        >
                            #
                        </th>
                        <ElementsHeader/>
                    </TableFilter>
                </thead>
                <tbody>{elementsBody}</tbody>
            </table>
        );
    }
}


const ExcelFilter = () => {

    return (
        <>
            <div className="excel-filter-body">
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" />
                    <label className="form-check-label">
                        Default checkbox
                    </label>
                </div>
            </div>
        </>
    )
}

const DatabasePage = () => {

    return (
        <div className="database-view">
            <div className="excel-filter-view">
                <h3>Content</h3>
                <ExcelFilter />
            </div>
            <div className="excel-view">
                <Table />
                <div id="loader" className="loader"></div>
            </div>
        </div>

    )
}

export default DatabasePage;
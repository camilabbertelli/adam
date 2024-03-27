import 'bootstrap/dist/css/bootstrap.css';

import 'mdb-ui-kit/css/mdb.min.css';
import "./../../styles/TimelineChart.css"

import spine from "./../../assets/images/spine.jpg"
import minus from "./../../assets/images/minus.png"

import codices from "./../../assets/codices";


const CodicesSec = ({ element }) => {
    let content = []

    element.forEach(codex => {
        content.push(
            <div key={codex.title} className="image-component">
                <img src={spine} className="timeline card-img-top" alt="book" />
                <div className='centered'>{codex.title}</div>
            </div>
        )
    });

    return content
}

const Sec = () => {
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

const TimelineChart = () => {
    return (
        <div className='timeline'>
            <div className="timeline card-group card-group-scroll" id='style-1'>
                <Sec/>
            </div>
        </div>
    )
};
export default TimelineChart;
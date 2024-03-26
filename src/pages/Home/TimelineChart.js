import 'bootstrap/dist/css/bootstrap.css';

import 'mdb-ui-kit/css/mdb.min.css';
import "./../../styles/TimelineChart.css"

import spine from "./../../assets/images/spine.jpg"
import minus from "./../../assets/images/minus.png"

const TimelineChart = () => {
    return (
        <div className='timeline'>
        <div className="timeline card-group card-group-scroll" id='style-1'>
        <div class="timeline card">
            <div className='sec-collection'>
                <div className="image-component">
                    <img src={spine} class="timeline card-img-top" alt="book" />
                    <div className='centered'>Vida de Santo Aleixo</div>
                </div>
            </div>
            <div class="timeline card-body">
                <h5 class="card-title">XI</h5>
                <img src={minus} className="timeline tick" width="4px" alt="Hollywood Sign on The Hill" />
            </div>
        </div>
        <div class="timeline card">
            <div className='sec-collection'>
                <div className="image-component">
                    <img src={spine} class="timeline card-img-top" alt="Hollywood Sign on The Hill" />
                    <div className='centered'>Vida de Santo Aleixo</div>
                </div>
                <div className="image-component">
                    <img src={spine} class="timeline card-img-top" alt="Hollywood Sign on The Hill" />
                    <div className='centered'>Vida de Santo Aleixo</div>
                </div>
            </div>
            <div class="timeline card-body">
                <h5 class="card-title">XI</h5>
                <img src={minus} className="timeline tick" width="4px" alt="Hollywood Sign on The Hill" />
            </div>
        </div>
        <div class="timeline card">
            <img src={spine} class="timeline card-img-top" alt="Los Angeles Skyscrapers" />
            <div class="timeline card-body">
                <h5 class="card-title">XI</h5>
                <img src={minus} className="timeline tick" width="4px" alt="Hollywood Sign on The Hill" />
            </div>
        </div>
        <div class="timeline card">
            <img src={spine} class="timeline card-img-top" alt="Hollywood Sign on The Hill" />
            <div class="timeline card-body">
                <h5 class="card-title">XII</h5>
                <img src={minus} className="timeline tick" width="4px" alt="Hollywood Sign on The Hill" />
            </div>
        </div>
        <div class="timeline card">
            <img src={spine} class="timeline card-img-top" alt="Palm Springs Road" />
            <div class="timeline card-body">
                <h5 class="card-title">XIV</h5>
                <img src={minus} className="timeline tick" width="4px" alt="Hollywood Sign on The Hill" />
            </div>
        </div>
        <div class="timeline card">
            <img src={spine} class="timeline card-img-top" alt="Los Angeles Skyscrapers" />
            <div class="timeline card-body">
                <h5 class="card-title">XV</h5>
                <img src={minus} className="timeline tick" width="4px" alt="Hollywood Sign on The Hill" />
            </div>
        </div>
    </div>
    </div>
)};
export default TimelineChart;
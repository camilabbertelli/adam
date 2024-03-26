import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/src/modal'

import 'mdb-ui-kit/css/mdb.min.css';
import '../../styles/Home.css';

import gallery from './../../assets/gallery.js';

const GalleryImage = ({src, title, description}) => {
    return (
        <>
        <div className='col'>
            <div className="bg-image hover-overlay" data-mdb-ripple-color="light">
                <img className="images" alt="medieval-img" src={require(`./../../assets/images/gallery/${src}.png`)}/>
                <div className='modal fade' id={title.replace(/\s+/g, '')} tabIndex="-1" aria-hidden="true">
                    <div className='modal-dialog'>
                        <div className='modal-body'>
                            <div className="card">
                                <img alt="medieval-img" src={require(`./../../assets/images/gallery/${src}.png`)} className='card-img-top d-block w-100'/>
                                <div className="card-body card-click">
                                    <h4 className="title">{title}</h4>
                                    <p>{description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div data-bs-toggle="modal" data-bs-target={`#${title.replace(/\s+/g, '')}`} className="mask text-light d-flex justify-content-center flex-column text-left card-img">
                    <h4 className="title smaller">{title}</h4>
                    <p>{description}</p>
                </div>
            </div>
        </div>
        </>
    )
}

const GalleryImages = ({currentRow}) => {
    
    let desiredRows = 3;
    let content = [];
    
    let factor = (gallery.length/desiredRows);
    for (let index = currentRow * (factor + 1); index < (currentRow + 1) * (factor + 1); index++) {
        const element = gallery[index];
        if (element) 
        content.push(
            <GalleryImage key={`gallery_` + index} src={element.src} title={element.title} description={element.description}/>
        )
    }

    return content;
}

const GalleryChart = () => {
    let desiredRows = 3;
    let content = [];

    for (let row = 0; row < desiredRows; row++){
        content.push(<div key={`g_` + row} className='row'><GalleryImages currentRow={row}/></div>)
    }
        
    return content;
}


export default GalleryChart;
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/src/modal'

import 'mdb-ui-kit/css/mdb.min.css';
import '../../styles/Home/GalleryChart.css';

import gallery from './../../assets/gallery.js';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';




const GalleryImage = ({ src, title, description, type, item, subitems, sex }) => {


    const { t } = useTranslation();
    let navigate = useNavigate();

    const mouseclick = (type, item, subitems, sex) => {

        navigate("/dashboard", {
            state: {
                type: type,
                item: item,
                subitems: subitems,
                sex: sex
            }
        })
    }

    return (
        <>
            <div className='col'>
                <div className="bg-image hover-overlay" data-mdb-ripple-color="light">
                    <img className="images" alt="medieval-img" src={require(`./../../assets/images/gallery/${src}`)} />
                    <div onClick={() => {
                        let dialog = document.getElementById(`dialog-gallery-${title.replace(/\s+/g, '')}`)
                        if (dialog){
                            dialog.showModal()
                            dialog.addEventListener("click", (e) => {
                                if (e.target.className === "dialog-gallery") 
                                    dialog.close()
                            })
                        } 
                    }} className="mask text-light d-flex justify-content-center flex-column text-left card-img">
                        <h4 className="title smaller">{title}</h4>
                        {/* <p>{description}</p> */}
                    </div>
                    <dialog className="dialog-gallery" id={`dialog-gallery-${title.replace(/\s+/g, '')}`}>

                        <div id="dialog-content">
                            <img className="dialog-gallery-open" alt="medieval-img" src={require(`./../../assets/images/gallery/${src}`)} />
                            
                            {/* <p>{description}</p> */}
                            <center>
                                <h4>{title}</h4>
                                <button className="btn-filter-dashboard" onClick={() => mouseclick(type, item, subitems, sex)}>{t("gallery-filter-dashboard")}</button>
                            </center>
                        </div>
                    </dialog>
                </div>
            </div>
        </>
    )
}

const GalleryImages = ({ currentRow }) => {

    let desiredRows = 3;
    let content = [];

    let factor = (gallery.length / desiredRows);
    for (let index = currentRow * (factor + 1); index < (currentRow + 1) * (factor + 1); index++) {
        const element = gallery[index];
        if (element)
            content.push(
                <GalleryImage key={`gallery_` + index} src={element.src} title={element.title} description={element.description} type={element.type} item={element.item} subitems={element.subitems} sex={element.sex}/>
            )
    }

    return content;
}

const GalleryChart = () => {
    let desiredRows = 3;
    let content = [];

    for (let row = 0; row < desiredRows; row++) {
        content.push(<div key={`g_` + row} className='row'><GalleryImages currentRow={row} /></div>)
    }

    return content;
}


export default GalleryChart;
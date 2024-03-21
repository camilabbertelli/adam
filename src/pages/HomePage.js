import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/src/modal'

import 'mdb-ui-kit/css/mdb.min.css';
import '../styles/Home.css';

import { Link } from "react-router-dom";
import { useEffect } from 'react';

import videoBg from '../assets/video-background.mp4'
import doubleArrow from "../assets/images/doubleArrow.png"
import logos from "../assets/images/logos.png"

import gallery from './gallery';

const GalleryImage = ({src, title, description}) => {
    return (
        <>
        <div className='col'>
            <div className="bg-image hover-overlay" data-mdb-ripple-color="light">
                <img className="images" alt="medieval-img" src={require(`./../assets/images/gallery/${src}.png`)}/>
                <div className='modal fade' id={title.replace(/\s+/g, '')} tabIndex="-1" aria-hidden="true">
                    <div className='modal-dialog'>
                        <div className='modal-body'>
                            <div className="card">
                                <img alt="medieval-img" src={require(`./../assets/images/gallery/${src}.png`)} className='card-img-top d-block w-100'/>
                                <div className="card-body card-click">
                                    <h4 className="title">{title}</h4>
                                    <p>{description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div data-bs-toggle="modal" data-bs-target={`#${title.replace(/\s+/g, '')}`} className="mask text-light d-flex justify-content-center flex-column text-left card-img">
                    <h4 className="title">{title}</h4>
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
            <GalleryImage src={element.src} title={element.title} description={element.description}/>
        )
    }

    return content;
}

const Gallery = () => {
    let desiredRows = 3;
    let content = [];

    for (let row = 0; row < desiredRows; row++){
        content.push(<div className='row'><GalleryImages currentRow={row}/></div>)
    }
        
    return content;
}

const HomePage = () => {
    useEffect(() => {
    
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting){
                    entry.target.classList.add("show");
                } else{
                    entry.target.classList.remove("show");
                }
            });
        });
        
        const hiddenElements = document.querySelectorAll(".hidden");
        hiddenElements.forEach((el) => observer.observe(el));
    
    });

    return (<>

        <div className="video-background">
            <video src={videoBg} autoPlay loop muted/>
        </div>
        <div className='row home align-items-center hidden'>
            <div className="col section">
                <h1 className='title big'>Analysis Dashboard for the Anatomy in the Middle Ages</h1>
                <p>Discover all the lorem ipsum aplium pumuni orieta discotic comisc idope portima lorem ipsum.</p>
                    <button type="button" className="button-home"><Link to="/dashboard">Discover more</Link></button>
            </div>
            <div className="col section">
                        
            </div>
        </div>
        <div className='row doubleArrow hidden scroll-bounce'>
            <center>
                <div className="col">
                    <a href="#gallery"><img alt="" src={doubleArrow} /></a>
                </div>
            </center>
        </div>
        <div id='gallery' className=' row gallery hidden align-items-center'>
            <center>
            <div className='col'>
                <h1 className='title'>Our gallery</h1>
                <Gallery/>
            </div>
            </center>
        </div>
        <div className=' row aboutSection hidden align-items-center'>
            <div className='col col-7 border-end aboutUs'>
                <h1 className='aboutUs-title'>About us</h1>
                <p>This dashboard website is the product of an interdisciplinary project designed with the purpose of lorem ipsum dolor sit amet,
                    consectetur adipiscing elit. Suspendisse ac iaculis augue. Integer sit amet pulvinar lectus. Vestibulum ante ipsum primis in faucibus orci 
                    luctus et ultrices posuere cubilia curae; Aliquam eu aliquam leo, non pretium elit. Fusce nec tempus mauris. In hac habitasse platea dictumst. 
                    Quisque ut nibh sodales, congue massa eu, pretium ante. Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
            </div>
            <div className='col col-5'>
                <img width="90%" alt="university logos" src={logos} />
            </div>
        </div>


        
    </>)
}

export default HomePage;

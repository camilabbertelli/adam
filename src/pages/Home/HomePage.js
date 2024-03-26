import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/src/modal'

import 'mdb-ui-kit/css/mdb.min.css';
import '../../styles/Home.css';

import { useTranslation } from "react-i18next";

import { Link } from "react-router-dom";
import { useEffect } from 'react';

import videoBg from '../../assets/video-background.mp4'
import doubleArrow from "../../assets/images/doubleArrow.png"
import logos from "../../assets/images/logos.png"

import MapChart from './MapChart'
import TimelineChart from './TimelineChart.js';
import GalleryChart from './GalleryChart.js';

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

    const {t} = useTranslation();

    return (<>

        <div className="video-background">
            <video src={videoBg} autoPlay loop muted/>
        </div>
        <div className='home align-items-center hidden'>
            <div className="section">
                <h1 className='title big'>{t("adam")}</h1>
                <p>Discover all the lorem ipsum aplium pumuni orieta discotic comisc idope portima lorem ipsum.</p>
                <button type="button" className="button-home"><Link to="/dashboard">{t("btnDiscover")}</Link></button>
            </div>
            <div className="section right">
                <div className='mini-section'>
                    <MapChart/>
                </div>
                <div className='mini-section'>
                    <TimelineChart />
                </div>
                    
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
                <h1 className='title'>{t("titleGallery")}</h1>
                <GalleryChart />
            </div>
            </center>
        </div>
        <div className=' row aboutSection hidden align-items-center'>
            <div className='col col-7 border-end aboutUs'>
                <h1 className='title'>{t("titleAboutUs")}</h1>
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

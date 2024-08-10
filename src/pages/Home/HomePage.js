import 'mdb-ui-kit/css/mdb.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/src/modal'

import '../../styles/Home/Home.css';

import { useTranslation } from "react-i18next";

import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';

import videoBg from '../../assets/video-background.mp4'
import doubleArrow from "../../assets/images/doubleArrow.png"
import logos from "../../assets/images/logos.png"
import info from "../../assets/images/info-white.png"

import MapChart from './MapChart'
import TimelineChart from './TimelineChart.js';
import GalleryChart from './GalleryChart.js';

import * as d3 from "d3"

function noSpaces(str) {
    if (str)
        str = str.replace(/[\s+&/\\#,+()$~%.'":*?<>{};]/g, '');
    return str
}

function flatLatLong(latlong) {
    if (latlong.charAt(latlong.length-1) === 'W')
        return "-".concat(latlong.split("°")[0]);
    return latlong.split("°")[0];
}

function romanToInt(roman) {
    const romanNumerals = {
        I: 1,
        V: 5,
        X: 10,
        L: 50,
        C: 100,
        D: 500,
        M: 1000,
    };
    let result = 0;
    for (let i = 0; i < roman.length; i++) {
        const currentSymbol = romanNumerals[roman[i]];
        const nextSymbol = romanNumerals[roman[i + 1]];
        if (nextSymbol && currentSymbol < nextSymbol) {
            result -= currentSymbol;
        } else {
            result += currentSymbol;
        }
    }
    return result;
}

const HomePage = (props) => {

    const [locations, setLocations] = useState([])
    const [centuries, setCenturies] = useState([])

    useEffect(() => {
        
        d3.selectAll("#tooltip").style("opacity", 0)
        let element = document.getElementById('tooltip')
            if (element)
                element.innerHTML = "";

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                } else {
                    entry.target.classList.remove("show");
                }
            });
        });

        const hiddenElements = document.querySelectorAll(".hidden");
        hiddenElements.forEach((el) => observer.observe(el));

        let data = d3.flatRollup(props.data, v => v.length,
            d => d[props.csvNames.index],
            d => d[props.csvNames.material_type],
            d => d[props.csvNames.genre],
            d => d[props.csvNames.title],
            d => d[props.csvNames.publication],
            d => d[props.csvNames.description],
            d => d[props.csvNames.subject_name],
            d => d[props.csvNames.agent],
            d => d[props.csvNames.subject_number],
            d => d[props.csvNames.subject_sex],
            d => d[props.csvNames.nature],
            d => d[props.csvNames.dimension],
            d => d[props.csvNames.anatomical_part],
            d => d[props.csvNames.organs],
            d => d[props.csvNames.subject_qualities],
            d => d[props.csvNames.action],
            d => d[props.csvNames.causes_group],
            d => d[props.csvNames.causes],
            d => d[props.csvNames.time],
            d => d[props.csvNames.place],
            d => d[props.csvNames.latitude],
            d => d[props.csvNames.longitude],
            d => d[props.csvNames.chronology],
            d => d[props.csvNames.how],
            d => d[props.csvNames.intention],
            d => d[props.csvNames.with_name],
            d => d[props.csvNames.with_sex],
            d => d[props.csvNames.with_qualities],
            d => d[props.csvNames.about_name],
            d => d[props.csvNames.about_sex],
            d => d[props.csvNames.about_qualities],
            d => d[props.csvNames.object],
            d => d[props.csvNames.value],
            d => d[props.csvNames.supernatural_type],
            d => d[props.csvNames.pp])

        let loc = d3.flatRollup(data, v => v.length, d => d[props.csvIndexes.latitude], d => d[props.csvIndexes.longitude], d => d[props.csvIndexes.title], d => d[props.csvIndexes.place], d => d[props.csvIndexes.chronology])
            .map(entry => [flatLatLong(entry[0]), flatLatLong(entry[1]), entry[2], entry[3], entry[4], entry[5]])


        loc = loc.filter(entry => {
            return entry[0] !== "" && entry[1] !== "" && entry[3] !== "Não aplicável"
        })

        loc = d3.flatGroup(loc, d => d[0], d => d[1])

        loc = loc.map(entry => ({
            long: entry[1],
            lat: entry[0],
            places: entry[2]
        }))

        let codwithLocation = loc.map(entry => {
            return [...new Set(entry.places.flatMap(place => place[2]))]
        })

        codwithLocation = [... new Set(codwithLocation.flat())]

        let centuriesArray = d3.flatRollup(data, v => v.length, d => d[props.csvIndexes.chronology], d => d[props.csvIndexes.title], d => d[props.csvIndexes.publication])

        let centuriesAux = {}

        centuriesArray.forEach(([cJoined, codex, publication]) => {
            if (codwithLocation.includes(codex)) {

                let cIndividual = cJoined.split(" ")
                cIndividual.forEach(c => {
                    let codices = (centuriesAux[c] ? centuriesAux[c] : {})
                    codices[codex] = {
                        title: codex,
                        publication: publication,
                    }
                    centuriesAux[c] = codices
                })
            }
        })

        let centuries = {}

        Object.keys(centuriesAux).sort((a, b) => romanToInt(a) - romanToInt(b)).forEach(c => {
            centuries[c] = centuriesAux[c]
        })

        setCenturies(centuries)
        setLocations(loc)
    }, [props.data, props.csvIndexes]);

    const { t } = useTranslation();

    return (<>

        <div className="video-background">
            <video src={videoBg} autoPlay loop muted />
        </div>
        <div className='home hidden'>
            <div className="section left">
                <h1 className='title big'>{t("adam")}</h1>
                <p>{t("home-subtitle")}</p>
                <Link to="/dashboard"><button type="button" className="button-home">{t("btnDiscover")}</button></Link>
            </div>
            <div className="section right">
                <div className='map-section'>
                    <div className="titles" id="mapTitle">
                        <p className="map-title">{t("home-map-title")}</p>
                        <img alt="info" id="infoMap" src={info}
                            style={{ "marginLeft": 5 + "px" }} width="15" height="15"
                        />
                    </div>
                    <MapChart locations={locations} />
                </div>
                <div className='timeline-section'>
                    {<TimelineChart centuries={centuries} />}
                </div>

            </div>
        </div>
        <div className='row doubleArrow hidden scroll-bounce'>
            <center>
                <div className="col" style={{ width: "fit-content" }}>
                    <a href="#gallery" ><img alt="" src={doubleArrow} /></a>
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
        <div className=' row aboutSection hidden'>
            <div className='col col-7 border-end aboutUs'>
                <h1 className='title'>{t("titleAboutUs")}</h1>
                <p>{t("home-about-us")}</p>
            </div>
            <div className='col col-5'>
                <img width="90%" alt="university logos" src={logos} />
            </div>
        </div>



    </>)
}

export default HomePage;

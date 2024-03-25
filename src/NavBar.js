import { NavLink } from "react-router-dom";

import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import languages from "./assets/images/languages.png"
import ptflag from "./assets/images/portugal.png"
import ukflag from "./assets/images/united-kingdom.png"

import ornament from "./assets/images/navbar-ornament.png"
import './styles/NavBar.css';


const NavBar = () => {
    
    const {t, i18n} = useTranslation();

    const [styleDropdown, setStyleDropdown] = useState("dropdown-content-hide");
    
    const [styleLanguage_en, setStyleLanguage_en] = useState("flagbutton flagselected");
    const [styleLanguage_pt, setStyleLanguage_pt] = useState("flagbutton");

    const changeStyle = () => {
        if (styleDropdown !== "dropdown-content-hide") setStyleDropdown("dropdown-content-hide");
        else setStyleDropdown("dropdown-content-show");
    };


    const changeLng = (lng) => {
        i18n.changeLanguage(lng);

        setStyleLanguage_en("flagbutton");
        setStyleLanguage_pt("flagbutton");

        if (lng === "en") setStyleLanguage_en("flagbutton flagselected");
        if (lng === "pt") setStyleLanguage_pt("flagbutton flagselected");

        setStyleDropdown("dropdown-content-hide");
    }

    return (
        <nav className="sticky-top">
            <h1 className="title">A.D.A.M</h1>
            <img alt="ornament" className="ornament" src={ornament}/>
            <center>
            <ul className="flex-container">
                <li><NavLink to="/" className={(navData) => (navData.isActive ? "selected" : null)}>{t("navbar_home")}</NavLink></li>
                <li><NavLink to="/dashboard" className={(navData) => (navData.isActive ? "selected" : null)}>{t("navbar_dashboard")}</NavLink></li>
                <li><NavLink to="/library" className={(navData) => (navData.isActive ? "selected" : null)}>{t("navbar_library")}</NavLink></li>
            </ul>
            </center>
            <div className="languages">
                <div className='dropdown'>
                    <button className='dropbtn'><img className="icon-language" src={languages} alt="language selection" onClick={changeStyle} /></button>
                    <div className={styleDropdown}>
                        <button className={styleLanguage_en} onClick={() => changeLng("en")}>
                            <img className="flag" src={ukflag} alt="language uk" /> 
                            <p>English</p>
                        </button>
                        <button className={styleLanguage_pt} onClick={() => changeLng("pt")}>  
                            <img className="flag" src={ptflag} alt="language pt"/>
                            <p>Português</p>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
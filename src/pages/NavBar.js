import { NavLink } from "react-router-dom";

import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import languages from "./../assets/images/languages.png"
import ptflag from "./../assets/images/portugal.png"
import ukflag from "./../assets/images/united-kingdom.png"

import ornament from "./../assets/images/navbar-ornament.png"
import './../styles/NavBar.css';

import * as d3 from "d3"

const NavBar = () => {

    const { t, i18n } = useTranslation();
    const [language, setLanguage] = useState("pt");

    const changeStyle = () => {
        let dropDownActive = !d3.select(`.navbar-dropdown-content-hide`).classed("navbar-dropdown-content-show")
        d3.select(`.navbar-dropdown-content-hide`).classed("navbar-dropdown-content-show", dropDownActive)
    };


    const changeLng = (lng) => {
        i18n.changeLanguage(lng);

        setLanguage(lng);

        d3.select(`.navbar-dropdown-content-hide`).classed("navbar-dropdown-content-show", false)
    }

    return (
        <nav className="sticky-top">
            <h1 className="title">A.D.A.M</h1>
            <center>
                <img alt="ornament" className="ornament" src={ornament} />
                <ul className="flex-container">
                    <li><NavLink to="/" className={(navData) => (navData.isActive ? "navbar-selected" : null)}>{t("navbar_home")}</NavLink></li>
                    <li><NavLink to="/dashboard" className={(navData) => (navData.isActive ? "navbar-selected" : null)}>{t("navbar_dashboard")}</NavLink></li>
                    <li><NavLink to="/database" className={(navData) => (navData.isActive ? "navbar-selected" : null)}>{t("navbar_database")}</NavLink></li>
                    <li><NavLink to="/library" className={(navData) => (navData.isActive ? "navbar-selected" : null)}>{t("navbar_library")}</NavLink></li>
                </ul>
            </center>
            <div className="languages">
                <div className='navbar-dropdown'>
                    <button className='navbar-dropbtn'><img title={t("icon-language")} className="icon-language" src={languages} alt="language selection" onClick={changeStyle} /></button>
                    <div className="navbar-dropdown-content-hide">
                        <button className={`flagbutton` + (language === "en" ? " flagselected" : "")} onClick={() => changeLng("en")}>
                            <img className="flag" src={ukflag} alt="language uk" />
                            English
                        </button>
                        <button className={`flagbutton` + (language === "pt" ? " flagselected" : "")} onClick={() => changeLng("pt")}>
                            <img className="flag" src={ptflag} alt="language pt" />
                            Português
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
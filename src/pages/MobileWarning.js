
import ornament from "./../assets/images/navbar-ornament.png"
import browser from "./../assets/images/browser.png"
import { useTranslation } from "react-i18next"


import languages from "./../assets/images/languages.png"
import ptflag from "./../assets/images/portugal.png"
import ukflag from "./../assets/images/united-kingdom.png"
import { useState } from "react"

import "./../styles/MobileWarning.css"

import * as d3 from "d3"

const MobileWarning = () => {

    const { t, i18n } = useTranslation();

    const [language, setLanguage] = useState("en");

    const changeStyle = () => {
        let dropDownActive = !d3.select(`.mobile-dropdown-content-hide`).classed("mobile-dropdown-content-show")
        d3.select(`.mobile-dropdown-content-hide`).classed("mobile-dropdown-content-show", dropDownActive)
    };


    const changeLng = (lng) => {
        i18n.changeLanguage(lng);

        setLanguage(lng);

        d3.select(`.mobile-dropdown-content-hide`).classed("mobile-dropdown-content-show", false)
    }

    return (
        <>
            <div className="mobile-warning">
                <div className="mobile-languages">
                    <div className='mobile-dropdown'>
                        <button className='navbar-dropbtn'><img title={t("icon-language")} className="icon-language" src={languages} alt="language selection" onClick={changeStyle} /></button>
                        <div className="mobile-dropdown-content-hide">
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
                <div className="mobile-warning-title">
                    <center>
                        <h1 className="title">A.D.A.M</h1>
                        <img alt="ornament" src={ornament} width="40%" />
                    </center>
                </div>
                <img style={{ margin: "20% 0" }} src={browser} width="20%" />
                <div style={{ position: "absolute", bottom: "10%", padding: "0 20%", fontFamily: "lato", fontSize: "smaller", fontWeight: "bold" }}>
                    {t("mobile-warning")}
                </div>
            </div>
        </>
    )
}

export default MobileWarning;
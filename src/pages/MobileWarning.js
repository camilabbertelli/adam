
import ornament from "./../assets/images/navbar-ornament.png"
import browser from "./../assets/images/browser.png"
import { useTranslation } from "react-i18next"

const MobileWarning = () => {
    const {t} = useTranslation();

    return (
        <>
        <div className="mobile-warning">
            <div className="mobile-warning-title">
                <center>
                    <h1 className="title">A.D.A.M</h1>
                    <img alt="ornament" src={ornament} width="40%"/>
                </center>
            </div>
            <img style={{margin: "20% 0"}} src={browser} width="20%"/>
            <div style={{position: "absolute", bottom:"10%", padding: "0 20%", fontFamily: "lato", fontSize: "smaller", fontWeight: "bold"}}>
            {t("mobile-warning")}
            </div>
        </div>
        </>
    )
}

export default MobileWarning;
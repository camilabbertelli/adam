import 'bootstrap/dist/css/bootstrap.css';
import './../styles/NotFound.css';

import map from './../assets/images/notfound.jpg'
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    
    const {t} = useTranslation();

    return (
        <>
        <div className='not-found'>
        <div className="not-found-background">
            <img className="not-found-image" alt="map" src={map}/>
        </div>
        <div className='not-found-cover'>
            <div className='not-found-top'>
                <h1 className='lost'>{t("lost")}</h1>
            </div>
            <div className='not-found-bottom'>
                <h1>{t("not-found")}</h1>
                <br/>
                <h4>{t("not-found-text")}</h4>
                <br/>
                <br/>
                <button type="button" className="button-lost"><Link to="/">{t("not-found-button")}</Link></button>
            </div>
        </div>
        </div>
        
        </>
    )
}
    
export default NotFoundPage;


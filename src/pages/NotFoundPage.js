import 'bootstrap/dist/css/bootstrap.css';
import './../styles/NotFound.css';

import map from './../assets/images/notfound.jpg'

const NotFoundPage = () => (
    <>
    <div className="background">
    <img className="background" alt="map" src={map}/>
    </div>
    <h1>404: Page Not Found!</h1>
    </>
);
export default NotFoundPage;


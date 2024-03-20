import './styles/NavBar.css';
import { NavLink } from "react-router-dom";
import ornament from "./assets/images/navbar-ornament-2.png"
require('bootstrap')

const NavBar = () => {

    return (
        <nav className="sticky-top">
            <h1 className="title">A.D.A.M</h1>
            <img alt="" className="ornament" width="15%" height="15%" src={ornament}/>
            <ul>
                <li><NavLink to="/" className={(navData) => (navData.isActive ? "selected" : null)}>Home</NavLink></li>
                <li><NavLink to="/dashboard" className={(navData) => (navData.isActive ? "selected" : null)}>Dashboard</NavLink></li>
                <li><NavLink to="/library" className={(navData) => (navData.isActive ? "selected" : null)}>Library</NavLink></li>
            </ul>
        </nav>
    );
}

export default NavBar;
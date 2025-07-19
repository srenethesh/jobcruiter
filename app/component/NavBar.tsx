import {Link, Links} from "react-router";

const NavBar = () =>{
    return (
        <nav className="navbar">
            <Link to="/" className="text-2xl font-bold text-gradient">Jobcruiter</Link>
            <Link to="/upload" className="primary-button w-fit">Upload Resume</Link>
        </nav>
    );
}
export default NavBar;
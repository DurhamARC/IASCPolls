import '../App.css';

export default function NavBar(){
    return(
    <nav className="nav">
        <a className="site-title" href="/">Institute for Ascertaining Scientific Consensus</a>
        <li>
            <a href="/home">Home</a>
            <a href="/about">About</a>
            <a href="/login">Login</a>
        </li>
    </nav>
    )
}